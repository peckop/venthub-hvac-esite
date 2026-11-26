/**
 * INV-DIZIN-ETKI-3 · Etki defteri geriye dönük doldurma (SEO-147; cetvel dizin-sistemleri-standard.md D8.1).
 *
 * Kilitlenenler: kart/PR çıkarma (başlık önce, PR = SON `(#n)`, kart olmayan önekler elenir); yazı imzası (yorum ve EN bloğu imzayı bozmaz,
 * yeni yazı eklemek önceki yazıyı "değişti" göstermez); yazı farkı; commit olayları; satır × commit bağlama (±2 sn tam, 48 saat pencere, 2 dk ileri,
 * bir olay bir satıra); yeni git-gecmisi satırları; yedek, idempotentlik, bozuk satır korunması, depo içi yol reddi; gerçek git ile uçtan uca
 * (geçici depo). Veri sahtedir (P6).
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { afterEach,describe, expect, it } from 'vitest'

import { defterSatirlari,KOK } from '../dizin-etki.mjs'
import {
bagla, doldurKos, gecmisOlaylari,   ILERI_TOLERANS_MS, KAPSAMA_MS, kartPrCikar, TAM_ESLESME_MS, yaziFarki, yaziImzalari,
YAZILAR_YOLU, } from '../dizin-etki-doldur.mjs'
import { satirYaz } from '../dizin-takip.mjs'

const S = 'https://venthub.com.tr'
const LISTE = `${S}/tr/bilgi-merkezi`
const adresOf = (slug: string) => `${LISTE}/${slug}`
const ms = (iso: string) => Date.parse(iso)
const gecici: string[] = []
const dizin = () => { const d = mkdtempSync(join(tmpdir(), 'dizin-doldur-')); gecici.push(d); return d }
afterEach(() => { while (gecici.length) rmSync(gecici.pop() as string, { recursive: true, force: true }) })

type Satir = Record<string, unknown>
type Yazi = { kimlik: string; slug: string; h1?: string; ozet?: string; govde?: string; yorum?: string; en?: string }
/** Gerçek src/data/bilgiMerkezi/yazilar.ts'in yapısını taklit eder: kayıtlar 2 boşluk girintili, alanlar 4, EN bloğu 6; dizi kapanışı ve işlev kuyruğu var. */
const yazilarTs = (liste: Yazi[], kuyruk = 'export function yaziBul() { return null }', eol = '\n') => [
  'export const YAZILAR = [',
  ...liste.flatMap((y) => [
    '  {',
    ...(y.yorum ? [`    // ${y.yorum}`] : []),
    `    kimlik: '${y.kimlik}',`,
    `    slug: '${y.slug}',`,
    `    kartOzeti: '${y.ozet ?? 'Ozet'}',`,
    '    tr: `',
    `# ${y.h1 ?? 'Baslik'}`,
    y.govde ?? 'metin',
    '`,',
    '      en: {',
    `        baslik: '${y.en ?? 'english'}',`,
    '      },',
    '  },',
  ]),
  ']',
  '',
  kuyruk,
  '',
].join(eol)

const A: Yazi = { kimlik: 'a', slug: 'a-yazi' }
const B: Yazi = { kimlik: 'b', slug: 'b-yazi' }
const degisim = (adres: string, tarih: string, ek: Satir = {}): Satir => ({ tarih, motor: 'google', eylem: 'degisim', adres, kaynak: 'kaydet', ...ek })

describe('kartPrCikar', () => {
  it('başlıktaki kart ve SON (#n) PR; birden çok PR numarasından sonuncusu', () => {
    expect(kartPrCikar({ konu: 'content(rehber): çatı tipi fan yazısı (BLG-91) (#2690)' })).toEqual({ kart: 'BLG-91', pr: 2690 })
    expect(kartPrCikar({ konu: 'revert (#11) geri al (SEO-3) (#12)' })).toEqual({ kart: 'SEO-3', pr: 12 })
  })
  it('kart olmayan önekler (UTF-8, SHA-256, PR-2, karar) elenir; gerçek kart sonraki ya da gövdedeki Kanban satırından', () => {
    expect(kartPrCikar({ konu: 'fix: UTF-8 ve SHA-256 PR-2 (#5)', govde: 'Kanban: SEO-5\n' })).toEqual({ kart: 'SEO-5', pr: 5 })
    expect(kartPrCikar({ konu: 'fix: UTF-8 (SEO-8) (#6)' })).toEqual({ kart: 'SEO-8', pr: 6 })
    expect(kartPrCikar({ konu: 'docs: UTF-8' })).toEqual({ kart: null, pr: null })
  })
  it('yönetmelik/standart numarası kart değildir: "AB-327/2011" elenir, başlıktaki gerçek kart (BLG-63) alınır; yalnız yönetmelik varsa null', () => {
    const konu = 'fix(rehber): AB-327/2011 gecis donemi ifadesi, uc yazida dar duzeltme (BLG-63, OPS emri) (#2411)'
    expect(kartPrCikar({ konu })).toEqual({ kart: 'BLG-63', pr: 2411 })
    expect(kartPrCikar({ konu: 'docs: TS-1234/5 ve AB-327/2011 (#9)' })).toEqual({ kart: null, pr: 9 })
    expect(kartPrCikar({ konu: 'docs: AB-12 yönetmeliği (#9)' })).toEqual({ kart: null, pr: 9 }) // AB öneki kart olamaz
  })
  it('başlık gövdeden ÖNCE gelir (squash gövdesi başka işin Kanban satırını taşıyabilir)', () => {
    expect(kartPrCikar({ konu: 'content: x (BLG-82) (#2606)', govde: 'Kanban: BLG-9\nKanban: BLG-9\nKanban: BLG-9' })).toEqual({ kart: 'BLG-82', pr: 2606 })
  })
  it('gövde yedeği: en sık geçen kart; eşitlikte sonuncusu; hiçbiri yoksa null', () => {
    expect(kartPrCikar({ konu: 'misc', govde: 'Kanban: AB-1\nKanban: CD-2\nKanban: CD-2\nKanban: EF-3' })).toEqual({ kart: 'CD-2', pr: null })
    expect(kartPrCikar({ konu: 'misc', govde: 'Kanban: AB-1\nKanban: CD-2' })).toEqual({ kart: 'CD-2', pr: null })
    expect(kartPrCikar({ konu: 'misc', govde: 'Kanban yok' })).toEqual({ kart: null, pr: null })
    expect(kartPrCikar({})).toEqual({ kart: null, pr: null })
  })
})

describe('yaziImzalari', () => {
  it('kimlik başına slug ve imza; boş/undefined girdi boş harita', () => {
    const h = yaziImzalari(yazilarTs([A, B]))
    expect([...h.keys()]).toEqual(['a', 'b'])
    expect(h.get('a')?.slug).toBe('a-yazi')
    expect(yaziImzalari('').size).toBe(0)
    expect(yaziImzalari(undefined).size).toBe(0)
  })
  it('yorum satırı ve EN bloğu değişince imza DEĞİŞMEZ; TR gövde değişince değişir; CRLF fark yaratmaz', () => {
    const taban = yaziImzalari(yazilarTs([A])).get('a')
    expect(yaziImzalari(yazilarTs([{ ...A, yorum: 'yeni yorum' }])).get('a')?.imza).toBe(taban?.imza)
    expect(yaziImzalari(yazilarTs([{ ...A, en: 'another english' }])).get('a')?.imza).toBe(taban?.imza)
    expect(yaziImzalari(yazilarTs([{ ...A, govde: 'değişen metin' }])).get('a')?.imza).not.toBe(taban?.imza)
    expect(yaziImzalari(yazilarTs([A], undefined, '\r\n')).get('a')?.imza).toBe(taban?.imza)
  })
  it('liste imzası (kartImza) yalnız H1 ve kartOzeti ile değişir, gövde ile değişmez', () => {
    const taban = yaziImzalari(yazilarTs([A])).get('a')
    expect(yaziImzalari(yazilarTs([{ ...A, govde: 'başka gövde' }])).get('a')?.kartImza).toBe(taban?.kartImza)
    expect(yaziImzalari(yazilarTs([{ ...A, h1: 'Yeni H1' }])).get('a')?.kartImza).not.toBe(taban?.kartImza)
    expect(yaziImzalari(yazilarTs([{ ...A, ozet: 'Yeni özet' }])).get('a')?.kartImza).not.toBe(taban?.kartImza)
  })
  it('SON yazının imzası dizi kapanışına ve işlev kuyruğuna bağlı DEĞİL: yeni yazı eklemek ya da işlev değiştirmek önceki yazıyı değiştirmez', () => {
    const taban = yaziImzalari(yazilarTs([A])).get('a')?.imza
    expect(yaziImzalari(yazilarTs([A, B])).get('a')?.imza).toBe(taban)
    expect(yaziImzalari(yazilarTs([A], 'export function yaziBul() { return 42 }\nexport const x = 1')).get('a')?.imza).toBe(taban)
  })
  it('slug alanı olmayan kayıt atlanır', () => {
    const metin = ["    kimlik: 'x',", '    kartOzeti: "a",', '  },'].join('\n')
    expect(yaziImzalari(metin).size).toBe(0)
  })
})

describe('yaziFarki', () => {
  const imz = (liste: Yazi[]) => yaziImzalari(yazilarTs(liste))
  it('yeni yazı: yeni + liste; gövde değişimi: değişti, liste değil; hiç fark yok: boş', () => {
    expect(yaziFarki(imz([A]), imz([A, B]))).toEqual({ yazilar: [{ slug: 'b-yazi', tur: 'yeni' }], liste: true })
    expect(yaziFarki(imz([A]), imz([{ ...A, govde: 'x' }]))).toEqual({ yazilar: [{ slug: 'a-yazi', tur: 'degisti' }], liste: false })
    expect(yaziFarki(imz([A, B]), imz([A, B]))).toEqual({ yazilar: [], liste: false })
    expect(yaziFarki(new Map(), new Map())).toEqual({ yazilar: [], liste: false })
  })
  it('liste sayfası: H1, özet, slug değişimi ve yazı silinmesi listeyi değiştirir', () => {
    expect(yaziFarki(imz([A]), imz([{ ...A, h1: 'Y' }])).liste).toBe(true)
    expect(yaziFarki(imz([A]), imz([{ ...A, ozet: 'Y' }])).liste).toBe(true)
    expect(yaziFarki(imz([A]), imz([{ ...A, slug: 'yeni-slug' }])).liste).toBe(true)
    expect(yaziFarki(imz([A, B]), imz([A])).liste).toBe(true)
  })
})

describe('gecmisOlaylari', () => {
  it('commit çiftlerinden olay: yeni yazı, gövde değişimi (liste yok), yorum değişimi (olay yok); kart/PR/neden doğru', () => {
    const sha = (c: string) => c.repeat(40)
    const surumler: Record<string, string> = {
      [`${sha('1')}^`]: yazilarTs([]),
      [sha('1')]: yazilarTs([A]),
      [`${sha('2')}^`]: yazilarTs([A]),
      [sha('2')]: yazilarTs([{ ...A, govde: 'düzeltildi' }]),
      [`${sha('3')}^`]: yazilarTs([{ ...A, govde: 'düzeltildi' }]),
      [sha('3')]: yazilarTs([{ ...A, govde: 'düzeltildi', yorum: 'sadece yorum' }]),
    }
    const commitler = [
      { sha: sha('1'), t: ms('2026-10-01T07:00:00Z'), konu: 'content(rehber): A yazısı (BLG-1) (#101)', govde: '' },
      { sha: sha('2'), t: ms('2026-10-05T07:00:00Z'), konu: 'fix(rehber): A düzeltme (SEO-9) (#102)', govde: '' },
      { sha: sha('3'), t: ms('2026-10-06T07:00:00Z'), konu: 'docs: yorum (#103)', govde: '' },
    ]
    const o = gecmisOlaylari({ commitler, oku: (ref: string) => surumler[ref] ?? null })
    expect(o.map((e: { adres: string; tur: string }) => `${e.adres.replace(S, '')} ${e.tur}`)).toEqual([
      '/tr/bilgi-merkezi/a-yazi yeni', '/tr/bilgi-merkezi liste', '/tr/bilgi-merkezi/a-yazi degisti',
    ])
    expect(o[0]).toMatchObject({ kart: 'BLG-1', pr: 101, neden: 'content(rehber): A yazısı (BLG-1)', sha: sha('1'), t: commitler[0].t })
    expect(o[2]).toMatchObject({ kart: 'SEO-9', pr: 102, neden: 'fix(rehber): A düzeltme (SEO-9)' })
  })
  it('dosya o commit\'te yok (oku null) boş sürüm sayılır, çökmez', () => {
    expect(gecmisOlaylari({ commitler: [{ sha: 'a'.repeat(40), t: 1, konu: 'x', govde: '' }], oku: () => null })).toEqual([])
    expect(YAZILAR_YOLU).toBe('src/data/bilgiMerkezi/yazilar.ts')
  })
})

describe('bagla: satır × commit', () => {
  const sha = (c: string) => c.repeat(40)
  const olay = (adres: string, iso: string, c: string, ek: Satir = {}) => ({ adres, t: ms(iso), sha: sha(c), tur: 'degisti', kart: `BLG-${c}`, pr: Number(`${c}${c}`), neden: `olay ${c}`, ...ek })
  const commit = (iso: string, c: string, konu: string) => ({ sha: sha(c), t: ms(iso), konu, govde: '' })
  const satir = (satirNo: number, adres: string, iso: string, ek: Satir = {}) => ({ satirNo, h: degisim(adres, iso, ek), ms: ms(iso) })

  it('sabitler', () => {
    expect(TAM_ESLESME_MS).toBe(2000)
    expect(KAPSAMA_MS).toBe(48 * 3600 * 1000)
    expect(ILERI_TOLERANS_MS).toBe(2 * 60 * 1000)
  })
  it('tam eşleşme: satır saati commit saatinin ±2 sn\'sinde: o commit; olay üstlenilir (yeni satır çıkmaz)', () => {
    const adres = adresOf('a-yazi')
    const r = bagla({
      satirlar: [satir(0, adres, '2026-10-05T07:00:01Z')],
      olaylar: [olay(adres, '2026-10-05T07:00:00Z', '2')],
      commitler: [commit('2026-10-05T07:00:00Z', '2', 'fix: A (SEO-9) (#102)')],
    })
    expect(r.atamalar.get(0)).toEqual({ kart: 'SEO-9', pr: 102, commit: '2222222', tur: 'tam' })
    expect(r.yeni).toEqual([])
    const uzak = bagla({ satirlar: [satir(0, adres, '2026-10-05T07:00:03Z')], olaylar: [], commitler: [commit('2026-10-05T07:00:00Z', '2', 'fix (SEO-9) (#102)')] })
    expect(uzak.atamalar.get(0)).toBeNull() // 3 sn: tam değil, pencerede olay yok
  })
  it('tam eşleşme site geneli commit olabilir: olay olmasa da kart/PR bağlanır', () => {
    const r = bagla({ satirlar: [satir(0, adresOf('x'), '2026-11-14T10:00:00Z')], olaylar: [], commitler: [commit('2026-11-14T10:00:00Z', '7', 'feat(urun): konum yolu (URN-164) (#2500)')] })
    expect(r.atamalar.get(0)).toMatchObject({ kart: 'URN-164', pr: 2500, tur: 'tam' })
  })
  it('pencere: 48 saat öncesi ve 2 dk sonrasındaki üstlenilmemiş olaylar; kart/PR EN YENİSİNDEN; hepsi üstlenilir', () => {
    const adres = adresOf('a-yazi')
    const r = bagla({
      satirlar: [satir(0, adres, '2026-10-05T12:00:00Z')],
      olaylar: [olay(adres, '2026-10-04T08:00:00Z', '1'), olay(adres, '2026-10-05T09:00:00Z', '2'), olay(adresOf('baska'), '2026-10-05T09:00:00Z', '3')],
      commitler: [],
    })
    expect(r.atamalar.get(0)).toEqual({ kart: 'BLG-2', pr: 22, commit: '2222222', tur: 'pencere' })
    expect(r.yeni.map((y: { adres: string }) => y.adres)).toEqual([adresOf('baska')]) // başka adresin olayı üstlenilmedi
  })
  it('pencere sınırları: 48 saatten eski olay bağlanmaz (ve yeni satır olur); 2 dk içindeki ileri olay bağlanır, 3 dk sonraki bağlanmaz', () => {
    const adres = adresOf('a-yazi')
    const eski = bagla({ satirlar: [satir(0, adres, '2026-10-05T12:00:00Z')], olaylar: [olay(adres, '2026-10-03T11:59:00Z', '1')], commitler: [] })
    expect(eski.atamalar.get(0)).toBeNull()
    expect(eski.yeni).toHaveLength(1)
    const ileri = bagla({ satirlar: [satir(0, adres, '2026-10-05T12:00:00Z')], olaylar: [olay(adres, '2026-10-05T12:01:30Z', '1')], commitler: [] })
    expect(ileri.atamalar.get(0)).toMatchObject({ kart: 'BLG-1', tur: 'pencere' })
    const cokIleri = bagla({ satirlar: [satir(0, adres, '2026-10-05T12:00:00Z')], olaylar: [olay(adres, '2026-10-05T12:03:00Z', '1')], commitler: [] })
    expect(cokIleri.atamalar.get(0)).toBeNull()
  })
  it('bir olay yalnız bir satıra: erken satır üstlenir, aynı olayı arayan ikinci satır null kalır', () => {
    const adres = adresOf('a-yazi')
    const r = bagla({
      satirlar: [satir(5, adres, '2026-10-05T12:00:00Z'), satir(3, adres, '2026-10-05T11:00:00Z')],
      olaylar: [olay(adres, '2026-10-05T10:00:00Z', '1')],
      commitler: [],
    })
    expect(r.atamalar.get(3)).toMatchObject({ kart: 'BLG-1' })
    expect(r.atamalar.get(5)).toBeNull()
  })
  it('üstlenilmeyen olay yeni git-gecmisi satırı: tarih commit saati, kart/pr/commit kısa sha; yalnız "yeni" tür once.sayfa=yeni taşır', () => {
    const a = adresOf('a-yazi')
    const r = bagla({
      satirlar: [],
      olaylar: [olay(a, '2026-10-01T07:00:00Z', '1', { tur: 'yeni' }), olay(a, '2026-10-05T07:00:00Z', '2'), olay(LISTE, '2026-10-01T07:00:00Z', '1', { tur: 'liste' })],
      commitler: [],
    })
    expect(r.yeni).toHaveLength(3)
    expect(r.yeni[0]).toEqual({
      tarih: '2026-10-01T07:00:00.000Z', motor: 'google', eylem: 'degisim', adres: LISTE, kaynak: 'git-gecmisi', neden: 'olay 1', kart: 'BLG-1', pr: 11, commit: '1111111',
    })
    const yeniYazi = r.yeni.find((y: { adres: string; commit: string }) => y.adres === a && y.commit === '1111111')
    expect(yeniYazi.once).toEqual({ sayfa: 'yeni', gorunme: 'gorunmedi', sira: null, kaynak: 'git' })
    expect(r.yeni.find((y: { commit: string }) => y.commit === '2222222').once).toBeUndefined()
  })
  it('bugünkü kayıtta olmayan adres atlanır ve sayılır; satırında commit zaten yazılı olan olaydan ikinci satır üretilmez', () => {
    const a = adresOf('a-yazi')
    const gone = adresOf('kalkti')
    const r = bagla({
      satirlar: [{ satirNo: 0, h: degisim(a, '2026-12-31T00:00:00Z', { commit: '2222222' }), ms: ms('2026-12-31T00:00:00Z') }],
      olaylar: [olay(a, '2026-10-05T07:00:00Z', '2'), olay(gone, '2026-10-05T07:00:00Z', '4')],
      commitler: [],
      gecerliAdresler: new Set([a, LISTE]),
    })
    expect(r.yeni).toEqual([])
    expect(r.eskiAdres).toBe(1)
  })
})

describe('doldurKos (sahte git adaptörü)', () => {
  const sha = (c: string) => c.repeat(40)
  const surumler: Record<string, string> = {
    [`${sha('1')}^`]: yazilarTs([]),
    [sha('1')]: yazilarTs([A]),
    [`${sha('2')}^`]: yazilarTs([A]),
    [sha('2')]: yazilarTs([{ ...A, govde: 'düzeltildi' }]),
    HEAD: yazilarTs([{ ...A, govde: 'düzeltildi' }]),
  }
  const commitler = [
    { sha: sha('1'), t: ms('2026-10-01T07:00:00Z'), konu: 'content(rehber): A yazısı (BLG-1) (#101)', govde: '' },
    { sha: sha('2'), t: ms('2026-10-05T07:00:00Z'), konu: 'fix(rehber): A düzeltme (SEO-9) (#102)', govde: '' },
    { sha: sha('3'), t: ms('2026-10-06T07:00:00Z'), konu: 'chore: başka dosya (#103)', govde: '' },
  ]
  const git = {
    tumCommitler: () => commitler,
    yaziCommitleri: () => commitler.slice(0, 2),
    oku: (ref: string, yol: string) => (yol === YAZILAR_YOLU ? surumler[ref] ?? null : null),
  }
  const kur = () => {
    const d = dizin()
    const defter = join(d, 'hareketler.jsonl')
    const dolu = degisim(adresOf('a-yazi'), '2026-10-05T07:00:01Z', { kart: 'ELLE-1' }) // kart elle yazılı: ezilmemeli; pr eksik: dolmalı
    const satirlar = [
      satirYaz({ tarih: '2026-10-02T09:00:00Z', motor: 'google', eylem: 'istek', adres: adresOf('a-yazi') } as never),
      'BOZUK SATIR {',
      satirYaz(dolu as never),
      satirYaz(degisim(adresOf('b-yazi'), '2026-10-09T09:00:00Z') as never), // pencerede olay yok: kart/pr null kalır
    ]
    writeFileSync(defter, `${satirlar.join('\n')}\n`)
    return { d, defter, ilk: readFileSync(defter, 'utf8') }
  }
  const kos = (defter: string, ek: Record<string, unknown> = {}) => doldurKos({ defter, git, simdi: ms('2026-11-26T08:00:00Z'), gunlukYedek: false, ...ek })

  it('--kuru hiçbir şey yazmaz ama sayıları söyler', () => {
    const k = kur()
    const r = kos(k.defter, { kuru: true })
    expect(r.kod).toBe(0)
    expect(r.mesajlar.join('\n')).toContain('KURU')
    expect(readFileSync(k.defter, 'utf8')).toBe(k.ilk)
    expect(readdirSync(k.d)).toEqual(['hareketler.jsonl'])
  })
  it('kart/PR/commit dolar, dolu alan ezilmez, yeni satırlar eklenir, bozuk satır ve istek satırı aynen kalır; yedek alınır', () => {
    const k = kur()
    const r = kos(k.defter)
    expect(r.kod, r.hata).toBe(0)
    const satirlar = readFileSync(k.defter, 'utf8').split('\n')
    expect(satirlar[0]).toBe(k.ilk.split('\n')[0])
    expect(satirlar[1]).toBe('BOZUK SATIR {')
    expect(JSON.parse(satirlar[2])).toMatchObject({ kart: 'ELLE-1', pr: 102, commit: '2222222' }) // elle kart korundu, PR ve commit doldu
    expect(JSON.parse(satirlar[3])).not.toHaveProperty('kart') // bağlanamadı: tahmin yok
    expect(JSON.parse(satirlar[3])).not.toHaveProperty('pr')
    expect(r.mesajlar.join('\n')).toContain('kart bulunamadı (null kaldı) 1')
    // eklenenler: a-yazi ilk yayın + liste (2 satır); 2. commit tam eşleşmeyle üstlenildi
    const yeni = satirlar.slice(4).filter(Boolean).map((s) => JSON.parse(s))
    expect(yeni.map((y) => `${y.adres.replace(S, '')}|${y.kaynak}|${y.kart}|${y.pr}`).sort()).toEqual([
      '/tr/bilgi-merkezi/a-yazi|git-gecmisi|BLG-1|101', '/tr/bilgi-merkezi|git-gecmisi|BLG-1|101',
    ].sort())
    expect(yeni.find((y) => y.adres === adresOf('a-yazi')).once).toMatchObject({ sayfa: 'yeni' })
    expect(readFileSync(k.defter, 'utf8').endsWith('\n')).toBe(true)
    // bütün satırlar geçerli satır olarak okunabilir (bozuk olan hariç)
    expect(defterSatirlari(readFileSync(k.defter, 'utf8')).filter((s) => s.ham && !s.h).map((s) => s.ham)).toEqual(['BOZUK SATIR {'])
    const yedekler = readdirSync(k.d).filter((x) => x.startsWith('hareketler.yedek-'))
    expect(yedekler).toHaveLength(1)
    expect(readFileSync(join(k.d, yedekler[0]), 'utf8')).toBe(k.ilk)
  })
  it('ikinci koşu idempotent: defter değişmez, ikinci yedek açılmaz', () => {
    const k = kur()
    kos(k.defter)
    const birinci = readFileSync(k.defter, 'utf8')
    const r2 = kos(k.defter)
    expect(r2.kod).toBe(0)
    expect(r2.mesajlar.join('\n')).toContain('defter değişmedi')
    expect(readFileSync(k.defter, 'utf8')).toBe(birinci)
    expect(readdirSync(k.d).filter((x) => x.startsWith('hareketler.yedek-'))).toHaveLength(1)
  })
  it('makinenin yazdığı git-gecmisi satırının kartı yeniden türetilir (yanlış kart düzelir); elle yazılı satırın kartına dokunulmaz', () => {
    const k = kur()
    kos(k.defter)
    // ilk koşunun eklediği git-gecmisi satırlarından birinin kartını bozalım (eski türetme hatası gibi)
    const satirlar = readFileSync(k.defter, 'utf8').split('\n')
    const i = satirlar.findIndex((s) => s.includes('"git-gecmisi"') && s.includes('"BLG-1"') && s.includes(`"${adresOf('a-yazi')}"`))
    expect(i).toBeGreaterThan(3)
    satirlar[i] = satirlar[i].replace('"BLG-1"', '"AB-327"')
    writeFileSync(k.defter, satirlar.join('\n'))
    const r = kos(k.defter)
    expect(r.kod, r.hata).toBe(0)
    expect(r.mesajlar.join('\n')).toContain('kart düzeltildi 1')
    const son = readFileSync(k.defter, 'utf8').split('\n')
    expect(JSON.parse(son[i])).toMatchObject({ kart: 'BLG-1', pr: 101, kaynak: 'git-gecmisi' })
    expect(JSON.parse(son[2])).toMatchObject({ kart: 'ELLE-1' }) // elle kart korunur
    // ve yine idempotent
    expect(kos(k.defter).mesajlar.join('\n')).toContain('defter değişmedi')
  })
  it('hatalar: depo içi defter, olmayan defter ve bozuk --baslangic çıkış 2', () => {
    const k = kur()
    expect(kos(join(KOK, 'docs', 'hareketler.jsonl')).kod).toBe(2)
    expect(kos(join(k.d, 'yok.jsonl')).kod).toBe(2)
    const r = kos(k.defter, { baslangic: 'dün' })
    expect(r.kod).toBe(2)
    expect(r.hata).toContain('--baslangic')
    expect(readFileSync(k.defter, 'utf8')).toBe(k.ilk)
  })
})

describe('doldurKos: gerçek git ile uçtan uca (geçici depo)', () => {
  const git = (cwd: string, args: string[], tarih?: string) => {
    const r = spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.invalid', '-c', 'commit.gpgsign=false', ...args], {
      cwd, encoding: 'utf8', env: { ...process.env, ...(tarih ? { GIT_AUTHOR_DATE: tarih, GIT_COMMITTER_DATE: tarih } : {}) },
    })
    if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`)
    return r.stdout
  }
  it('commit geçmişinden kart/PR bağlanır ve ilk yayın satırı eklenir', () => {
    const repo = dizin()
    git(repo, ['init'])
    mkdirSync(join(repo, 'src', 'data', 'bilgiMerkezi'), { recursive: true })
    const dosya = join(repo, YAZILAR_YOLU)
    const yaz = (m: string, konu: string, tarih: string, ek = '') => {
      writeFileSync(dosya, m)
      git(repo, ['add', '-A'])
      git(repo, ['commit', '-m', konu, ...(ek ? ['-m', ek] : [])], tarih)
    }
    yaz(yazilarTs([A]), 'content(rehber): A yazısı (BLG-1) (#101)', '2026-10-01T10:00:00+03:00')
    yaz(yazilarTs([{ ...A, govde: 'düzeltildi' }]), 'fix(rehber): A düzeltme (SEO-9) (#102)', '2026-10-05T10:00:00+03:00')
    writeFileSync(join(repo, 'baska.txt'), 'x')
    git(repo, ['add', '-A'])
    git(repo, ['commit', '-m', 'chore: başka (#103)'], '2026-10-06T10:00:00+03:00')

    const d = dizin()
    const defter = join(d, 'hareketler.jsonl')
    writeFileSync(defter, `${satirYaz(degisim(adresOf('a-yazi'), '2026-10-05T07:00:01Z') as never)}\n`)
    const r = doldurKos({ defter, kok: repo, simdi: ms('2026-11-26T08:00:00Z'), gunlukYedek: false })
    expect(r.kod, r.hata).toBe(0)
    const satirlar = readFileSync(defter, 'utf8').split('\n').filter(Boolean).map((s) => JSON.parse(s))
    expect(satirlar[0]).toMatchObject({ kart: 'SEO-9', pr: 102 })
    expect(satirlar[0].commit).toMatch(/^[0-9a-f]{7}$/)
    const yeni = satirlar.slice(1)
    expect(yeni).toHaveLength(2)
    expect(yeni.every((y) => y.kaynak === 'git-gecmisi' && y.kart === 'BLG-1' && y.pr === 101)).toBe(true)
    expect(yeni.map((y) => y.adres).sort()).toEqual([LISTE, adresOf('a-yazi')].sort())
    // ikinci koşu: değişiklik yok
    expect(doldurKos({ defter, kok: repo, simdi: ms('2026-11-26T09:00:00Z'), gunlukYedek: false }).mesajlar.join('\n')).toContain('defter değişmedi')
  }, 60000)
})

describe('CLI: dizin-takip --etki-doldur betiğe devreder', () => {
  const takip = resolve(__dirname, '..', 'dizin-takip.mjs')
  const doldur = resolve(__dirname, '..', 'dizin-etki-doldur.mjs')
  const kos = (betik: string, args: string[]) => spawnSync(process.execPath, [betik, ...args], { encoding: 'utf8', env: { ...process.env, DIZIN_TAKIP_YEDEK2: '' } })
  it('depo içi --hareket çıkış 2 (git\'e ve dosyaya gitmeden); iki giriş de aynı sonucu verir', () => {
    const icerde = join(KOK, 'docs', 'etki-doldur-deneme.jsonl')
    for (const [betik, ek] of [[takip, ['--etki-doldur']], [doldur, []]] as Array<[string, string[]]>) {
      const r = kos(betik, [...ek, '--kuru', '--hareket', icerde])
      expect(r.status, `${betik}: ${r.stderr}`).toBe(2)
      expect(r.stderr).toContain('git deposunun içinde')
    }
    expect(existsSync(icerde)).toBe(false)
  })
})
