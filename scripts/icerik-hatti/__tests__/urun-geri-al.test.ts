/**
 * KATALOG · ürün açıklaması GERİ ALMA (KTL-17) — kural birimleri + uçtan uca, SAHTE PostgREST'e karşı
 * (gerçek DB'ye çıkmaz).
 *
 * Kural → test eşlemesi (sabotaj tablosu bunu kullanır):
 *   S şema · H geri alma değeri (yarış kaydı önceliği) · D satır durumu (geri-al / zaten / değişmiş / yazılmamış) ·
 *   K kuru koşum varsayılan + iki anahtar · Y yazım (koşullu PATCH, yedek, geri okuma) ·
 *   A araya girme / RLS / yutulan PATCH · E hata yolları (dosya, şema, ağ, 401, 500, silinmiş satır).
 */
import { execFile } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { degisenAnahtarlar, geriAlmaHedefleri, kayitSemasi, satirDurumu } from '../urun-geri-al-kurallar.mjs'

const BETIK = join(__dirname, '..', 'urun-geri-al.mjs')
type Aciklama = Record<string, string>
type Hedef = { id: string; sku: string; onceki: Aciklama | null; sonraki: Aciklama; updated_at?: string }
type Gevsek = Record<string, unknown>
const ESKI_TR = 'Güvenli fan, yüksek verimli ex-proof tasarım.'
const YENI_TR = 'Güvenli fan ex-proof tasarım.'
const EN = 'Safe fan, high-efficiency ex-proof design.'
const EZ_NOT = ' (eşzamanlı düzenleme)'
const onceki = (): Aciklama => ({ tr: ESKI_TR, en: EN })
const sonraki = (): Aciklama => ({ tr: YENI_TR, en: EN })
const kayit1 = (id: string, sku: string): Hedef => ({ id, sku, updated_at: '2026-10-09T10:00:00.000000+00:00', onceki: onceki(), sonraki: sonraki() })

// ------------------------------------------------------------------------------------------------
// S — şema
// ------------------------------------------------------------------------------------------------
describe('S kayıt şeması', () => {
  // Bozuk girdi üretmek için alanları serbestçe değiştirebilmek üzere gevşek tipli (döküm gerekmez).
  const gecerli = (): { onay: string; plan: Gevsek; kayitlar: Gevsek[] } =>
    ({ onay: 'evet', plan: {}, kayitlar: [kayit1('u1', 'VRT-1'), kayit1('u2', 'VRT-2')] })

  it('geçerli kayıt: hata yok, yarislar yoksa boş dizi', () => {
    const s = kayitSemasi(gecerli())
    expect(s.hatalar).toEqual([])
    expect(s.kayit?.kayitlar.length).toBe(2)
    expect(s.kayit?.yarislar).toEqual([])
  })
  it('nesne olmayan girdi, kayitlar yok/boş/dizi değil → hata', () => {
    for (const g of [null, [], 'x', 5, undefined, {}, { kayitlar: [] }, { kayitlar: 'x' }]) {
      expect(kayitSemasi(g).hatalar.length, JSON.stringify(g)).toBeGreaterThan(0)
    }
  })
  it('id/sku biçimi: sorgu ENJEKSİYONU ("u1),id.neq.(x"), boşluk, boş, sayı → hata', () => {
    for (const id of ['u1),id.neq.(x', 'u 1', '', 7, null]) {
      const k = gecerli(); k.kayitlar[0].id = id
      expect(kayitSemasi(k).hatalar.length, JSON.stringify(id)).toBeGreaterThan(0)
    }
    for (const sku of ['A B', '', 9]) {
      const k = gecerli(); k.kayitlar[0].sku = sku
      expect(kayitSemasi(k).hatalar.length, JSON.stringify(sku)).toBeGreaterThan(0)
    }
  })
  it('onceki: nesne ya da null olur (null = ürünün açıklaması boştu); metin/dizi/sayı/eksik → hata', () => {
    const k = gecerli(); k.kayitlar[0].onceki = null
    expect(kayitSemasi(k).hatalar).toEqual([])
    for (const o of ['metin', ['x'], 5]) {
      const b = gecerli(); b.kayitlar[0].onceki = o
      expect(kayitSemasi(b).hatalar.length, JSON.stringify(o)).toBeGreaterThan(0)
    }
    const eksik = gecerli(); delete eksik.kayitlar[0].onceki
    expect(kayitSemasi(eksik).hatalar.length).toBeGreaterThan(0)
  })
  it('sonraki nesne olmalı (null yasak: yazıcı hep nesne yazar)', () => {
    const k = gecerli(); k.kayitlar[0].sonraki = null
    expect(kayitSemasi(k).hatalar.length).toBeGreaterThan(0)
  })
  it('aynı id iki kez → hata (bir ürün iki kez geri alınamaz)', () => {
    const k = gecerli(); k.kayitlar.push(kayit1('u1', 'VRT-1'))
    expect(kayitSemasi(k).hatalar.join('|')).toContain('ayni id')
  })
  it('yarislar: dizi olmalı ve girdileri geçerli olmalı', () => {
    expect(kayitSemasi({ ...gecerli(), yarislar: 'x' }).hatalar.length).toBeGreaterThan(0)
    expect(kayitSemasi({ ...gecerli(), yarislar: [{ id: 'u1' }] }).hatalar.length).toBeGreaterThan(0)
    expect(kayitSemasi({ ...gecerli(), yarislar: [{ id: 'u1', sku: 'VRT-1', onceki: onceki(), sonraki: sonraki() }] }).hatalar).toEqual([])
  })
})

// ------------------------------------------------------------------------------------------------
// H — geri alma değeri
// ------------------------------------------------------------------------------------------------
describe('H geri alma değeri: yarış kaydı varsa o, yoksa kayıt', () => {
  it('yarislar kaydı olmayan satır kayitlar değerini kullanır (kaynak "kayit"), sıra korunur', () => {
    const h = geriAlmaHedefleri({ kayitlar: [kayit1('u1', 'A-1'), kayit1('u2', 'A-2')], yarislar: [] })
    expect(h.map((x) => [x.sku, x.kaynak])).toEqual([['A-1', 'kayit'], ['A-2', 'kayit']])
    expect(h[0].onceki).toEqual(onceki())
  })
  it('yarislar kaydı olan satır ONUN onceki/sonraki değerini kullanır, kayitlar.onceki KULLANILMAZ', () => {
    const taze = { tr: ESKI_TR, en: EN + EZ_NOT }
    const h = geriAlmaHedefleri({
      kayitlar: [kayit1('u1', 'A-1'), kayit1('u2', 'A-2')],
      yarislar: [{ id: 'u1', sku: 'A-1', onceki: taze, sonraki: { ...taze, tr: YENI_TR } }],
    })
    expect(h[0]).toMatchObject({ kaynak: 'yaris', onceki: taze })
    expect(h[0].onceki).not.toEqual(onceki())
    expect(h[1].kaynak).toBe('kayit')
  })
  it('aynı ürün için birden çok yarış kaydı varsa SONUNCUSU (en taze) kullanılır', () => {
    const a = { tr: 'a', en: 'a' }, b = { tr: 'b', en: 'b' }
    const h = geriAlmaHedefleri({
      kayitlar: [kayit1('u1', 'A-1')],
      yarislar: [{ id: 'u1', sku: 'A-1', onceki: a, sonraki: sonraki() }, { id: 'u1', sku: 'A-1', onceki: b, sonraki: sonraki() }],
    })
    expect(h[0].onceki).toEqual(b)
  })
})

// ------------------------------------------------------------------------------------------------
// D — satır durumu
// ------------------------------------------------------------------------------------------------
describe('D satır durumu', () => {
  const hedef = (): Hedef => ({ id: 'u1', sku: 'A-1', onceki: onceki(), sonraki: sonraki() })

  it('canlı = sonraki → geri-al; canlı = onceki → zaten-geri-alinmis; başka → degismis', () => {
    expect(satirDurumu(sonraki(), hedef())).toBe('geri-al')
    expect(satirDurumu(onceki(), hedef())).toBe('zaten-geri-alinmis')
    expect(satirDurumu({ tr: 'üçüncü', en: EN }, hedef())).toBe('degismis')
    expect(satirDurumu(null, hedef())).toBe('degismis')
  })
  it('anahtar sırasından bağımsız (jsonb sırayı bozar): {en,tr} == {tr,en}', () => {
    expect(satirDurumu({ en: EN, tr: YENI_TR }, hedef())).toBe('geri-al')
  })
  it('sonradan başka bir dilde eklenen/değişen metin "degismis" sayılır (dokunulmaz)', () => {
    expect(satirDurumu({ ...sonraki(), en: EN + EZ_NOT }, hedef())).toBe('degismis')
    expect(satirDurumu({ ...sonraki(), de: 'x' }, hedef())).toBe('degismis')
  })
  it('onceki = sonraki → yazilmamis (yazıcı yazmamış: yarışta başkası uygulamış)', () => {
    expect(satirDurumu(sonraki(), { ...hedef(), onceki: sonraki() })).toBe('yazilmamis')
  })
  it('onceki null: canlı null ise zaten geri alınmış, sonraki ise geri alınır', () => {
    expect(satirDurumu(null, { ...hedef(), onceki: null })).toBe('zaten-geri-alinmis')
    expect(satirDurumu(sonraki(), { ...hedef(), onceki: null })).toBe('geri-al')
  })
  it('degisenAnahtarlar: yalnız farklı olanlar, sıralı', () => {
    expect(degisenAnahtarlar({ tr: YENI_TR, en: EN + EZ_NOT, de: 'x' }, sonraki())).toEqual(['de', 'en'])
    expect(degisenAnahtarlar(null, sonraki())).toEqual(['en', 'tr'])
    expect(degisenAnahtarlar(sonraki(), sonraki())).toEqual([])
  })
})

// ------------------------------------------------------------------------------------------------
// Uçtan uca — sahte PostgREST
// ------------------------------------------------------------------------------------------------
type Urun = { id: string; sku: string; name: string; updated_at: string; description_i18n: Aciklama | null }
type Kip = 'normal' | 'yaris' | 'rls' | 'yut' | 'jsonb-siralama' | 'get-401' | 'patch-500'
let kip: Kip = 'normal'
let zamanSayaci = 0
const yeniZaman = () => `2026-10-09T11:00:${String(++zamanSayaci).padStart(2, '0')}.000000+00:00`
const yazilmisUrunler = (): Urun[] => [
  { id: 'u1', sku: 'VRT-1', name: 'Ex fan 1', updated_at: '2026-10-09T10:30:00.123456+00:00', description_i18n: sonraki() },
  { id: 'u2', sku: 'VRT-2', name: 'Ex fan 2', updated_at: '2026-10-09T10:30:01.654321+00:00', description_i18n: sonraki() },
]
let urunler: Urun[] = yazilmisUrunler()
const istekler: { yontem: string; yol: string; govde: string }[] = []
let sunucu: Server
let taban = ''
let gecici = ''
// Test gövdeleri her çağrıda yeniden atanır; TS'in `kip`i dar tipe daraltmasını (kontrol akışı) önlemek için okuma işlevi:
const kipi = (): Kip => kip

beforeAll(async () => {
  gecici = mkdtempSync(join(tmpdir(), 'urun-geri-al-'))
  sunucu = createServer((req, res) => {
    let govde = ''
    req.on('data', (c) => { govde += String(c) })
    req.on('end', () => {
      istekler.push({ yontem: req.method ?? '', yol: req.url ?? '', govde })
      const url = new URL(req.url ?? '/', 'http://x')
      const json = (kod: number, v: unknown) => { res.writeHead(kod, { 'content-type': 'application/json' }); res.end(JSON.stringify(v)) }
      if (url.pathname !== '/rest/v1/products') return json(404, {})
      const idKosul = url.searchParams.get('id') ?? ''
      if (req.method === 'GET') {
        if (kipi() === 'get-401') return json(401, { message: 'Invalid API key' })
        const istenen = idKosul.startsWith('in.(') ? idKosul.slice(4, -1).split(',') : [idKosul.replace(/^eq\./, '')]
        return json(200, urunler.filter((u) => istenen.includes(u.id)))
      }
      if (req.method === 'PATCH') {
        const u = urunler.find((x) => x.id === idKosul.replace(/^eq\./, ''))
        if (!u) return json(200, [])
        if (kipi() === 'patch-500') return json(500, { message: 'internal error' })
        if (kipi() === 'yaris') { u.description_i18n = { ...u.description_i18n, en: EN + EZ_NOT }; u.updated_at = yeniZaman() }
        if (kipi() === 'rls') return json(200, [])
        const kosul = url.searchParams.get('updated_at')   // URLSearchParams kodlanmamış '+'yı BOŞLUK okur (PostgREST gibi)
        if (kosul !== null && kosul !== `eq.${u.updated_at}`) return json(200, [])
        const istenenNesne: Aciklama | null = JSON.parse(govde).description_i18n
        if (kipi() === 'yut') return json(200, [{ ...u, description_i18n: istenenNesne }])
        u.description_i18n = kipi() === 'jsonb-siralama' && istenenNesne
          ? Object.fromEntries(Object.entries(istenenNesne).sort(([a], [b]) => (a < b ? -1 : 1)))
          : istenenNesne
        u.updated_at = yeniZaman()   // products_set_updated_at tetiği
        return json(200, [u])
      }
      return json(405, {})
    })
  })
  await new Promise<void>((coz) => sunucu.listen(0, '127.0.0.1', coz))
  taban = `http://127.0.0.1:${(sunucu.address() as AddressInfo).port}`
})
afterAll(async () => {
  await new Promise<void>((coz) => sunucu.close(() => coz()))
  rmSync(gecici, { recursive: true, force: true })
})
beforeEach(() => {
  urunler = yazilmisUrunler(); istekler.length = 0; kip = 'normal'; zamanSayaci = 0
  rmSync(join(gecici, 'cikti'), { recursive: true, force: true })
})

let sayac = 0
const dosya = (icerik: unknown) => {
  const yol = join(gecici, `kayit-${++sayac}.json`)
  writeFileSync(yol, typeof icerik === 'string' ? icerik : JSON.stringify(icerik), 'utf8')
  return yol
}
const kayitDosyasi = (ek: Gevsek = {}) =>
  dosya({ onay: 'evet', plan: { eski: 'x', yeni: 'y' }, kayitlar: [kayit1('u1', 'VRT-1'), kayit1('u2', 'VRT-2')], ...ek })
const calistir = (argumanlar: string[], onay = false) =>
  new Promise<{ kod: number; stdout: string; stderr: string }>((coz) => {
    const env = { ...process.env }
    delete env.CANLI_YAZIM_ONAYI
    if (onay) env.CANLI_YAZIM_ONAYI = 'evet'
    execFile(process.execPath, [BETIK, ...argumanlar], { env, timeout: 30000 }, (hata, stdout, stderr) => {
      const kod = hata ? (typeof (hata as { code?: unknown }).code === 'number' ? (hata as { code: number }).code : 99) : 0
      coz({ kod, stdout, stderr })
    })
  })
const ag = (k: string, ...ek: string[]) => ['--kayit', k, '--url', taban, '--key', 'k', '--out', join(gecici, 'cikti'), ...ek]
const patchler = () => istekler.filter((i) => i.yontem === 'PATCH')

describe('K kuru koşum varsayılan, iki anahtar', () => {
  it('KURU KOŞUM: "2 satır geri alınır" çıktısı, PATCH yok, yedek yok, çıkış 0', async () => {
    const r = await calistir(ag(kayitDosyasi()))
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('ÖZET: 2 satır geri alınır')
    expect(r.stdout).toContain('GERİ ALINIR (canlı = yazdığımız metin)')
    expect(r.stdout).toContain('KURU KOŞUM — hiçbir şey yazılmadı')
    expect(patchler()).toEqual([])
    expect(existsSync(join(gecici, 'cikti'))).toBe(false)
  })
  it('yalnız --yaz (onay ortamda yok): hâlâ kuru koşum', async () => {
    const r = await calistir(ag(kayitDosyasi(), '--yaz'))
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('KURU KOŞUM')
    expect(patchler()).toEqual([])
  })
  it('yalnız onay ortamda (--yaz yok): hâlâ kuru koşum', async () => {
    const r = await calistir(ag(kayitDosyasi()), true)
    expect(r.kod).toBe(0)
    expect(patchler()).toEqual([])
  })
  it('kuru koşumda "sonradan değişmiş" satır bilgidir: çıkış 0, o satır sayılır ama geri alınmaz', async () => {
    urunler[0].description_i18n = { tr: 'üçüncü kişinin metni', en: EN }
    const r = await calistir(ag(kayitDosyasi()))
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('ÖZET: 1 satır geri alınır · 0 zaten geri alınmış · 1 sonradan değişmiş (dokunulmaz)')
    expect(r.stdout).toContain('SONRADAN DEĞİŞMİŞ — DOKUNULMADI')
    expect(r.stdout).toContain('farklı anahtarlar: tr')
  })
})

describe('Y yazım: koşullu PATCH, yedek, geri okuma', () => {
  it('--yaz + onay: iki ürün ESKİ metne döner, EN dokunulmaz, çıkış 0, "GERİ ALMA TAMAM: 2/2"', async () => {
    const r = await calistir(ag(kayitDosyasi(), '--yaz'), true)
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('GERİ ALMA TAMAM: 2/2 satır · geri okuma: hepsi beklenen')
    expect(patchler().length).toBe(2)
    for (const u of urunler) expect(u.description_i18n).toEqual(onceki())
  })
  it('PATCH updated_at ile KOŞULLU ve değer KODLANMIŞ (+ → %2B, : → %3A)', async () => {
    await calistir(ag(kayitDosyasi(), '--yaz'), true)
    for (const i of patchler()) {
      expect(i.yol).toContain('updated_at=eq.2026-10-09T10%3A30%3A0')
      expect(i.yol).toContain('%2B00%3A00')
    }
  })
  it('yazmadan ÖNCE canlı hal yedeğe yazılır (geri almayı geri almak için)', async () => {
    await calistir(ag(kayitDosyasi(), '--yaz'), true)
    const ad = readdirSync(join(gecici, 'cikti')).find((a) => a.startsWith('geri-alma-yedek-')) ?? ''
    const yedek: { satirlar: { sku: string; canli: Aciklama }[] } = JSON.parse(readFileSync(join(gecici, 'cikti', ad), 'utf8'))
    expect(yedek.satirlar.map((s) => s.sku)).toEqual(['VRT-1', 'VRT-2'])
    expect(yedek.satirlar[0].canli).toEqual(sonraki())
  })
  it('YARIŞ KAYDI: yarislar[] varsa geri alma değeri O (başkasının eşzamanlı değişikliği KORUNUR)', async () => {
    const taze = { tr: ESKI_TR, en: EN + EZ_NOT }
    urunler[0].description_i18n = { ...taze, tr: YENI_TR }
    const k = kayitDosyasi({ yarislar: [{ id: 'u1', sku: 'VRT-1', onceki: taze, sonraki: { ...taze, tr: YENI_TR } }] })
    const r = await calistir(ag(k, '--yaz'), true)
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('[yarış kaydı kullanılıyor]')
    expect(urunler[0].description_i18n).toEqual(taze)
    expect(urunler[1].description_i18n).toEqual(onceki())
  })
  it('onceki null (ürünün açıklaması boştu): geri alma null yazar, geri okuma null bekler', async () => {
    const k = dosya({ kayitlar: [{ id: 'u1', sku: 'VRT-1', onceki: null, sonraki: sonraki() }] })
    const r = await calistir(ag(k, '--yaz'), true)
    expect(r.kod).toBe(0)
    expect(urunler[0].description_i18n).toBeNull()
  })
  it('jsonb anahtar sırasını bozsa bile geri okuma geçer (kanonik eşitlik)', async () => {
    kip = 'jsonb-siralama'
    const r = await calistir(ag(kayitDosyasi(), '--yaz'), true)
    expect(r.kod).toBe(0)
    expect(Object.keys(urunler[0].description_i18n ?? {})).toEqual(['en', 'tr'])
  })
  it('zaten geri alınmış (canlı = eski): PATCH yok, yedek yok, çıkış 0', async () => {
    for (const u of urunler) u.description_i18n = onceki()
    const r = await calistir(ag(kayitDosyasi(), '--yaz'), true)
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('ÖZET: 0 satır geri alınır · 2 zaten geri alınmış')
    expect(patchler()).toEqual([])
    expect(existsSync(join(gecici, 'cikti'))).toBe(false)
  })
  it('yazıcı yazmamış (onceki = sonraki): atlanır, PATCH yok', async () => {
    const k = dosya({ kayitlar: [{ id: 'u1', sku: 'VRT-1', onceki: sonraki(), sonraki: sonraki() }] })
    const r = await calistir(ag(k, '--yaz'), true)
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('yazıcı bu satıra yazmamış')
    expect(patchler()).toEqual([])
  })
  it('TERS SIRA: aynı ürüne TR sonra EN yazılmış iki kayıt — ters sırada tam döner; düz sırada ilk kayıt atlanır (zarar yok), sonra tamamlanır', async () => {
    const eski = onceki()
    const aradaki = { tr: YENI_TR, en: EN }
    const son = { tr: YENI_TR, en: 'Safe fan design.' }
    const iki = (o: Aciklama, s: Aciklama) => ['u1', 'u2'].map((id, i) => ({ id, sku: `VRT-${i + 1}`, onceki: o, sonraki: s }))
    const trKaydi = dosya({ kayitlar: iki(eski, aradaki) })
    const enKaydi = dosya({ kayitlar: iki(aradaki, son) })
    const hepsi = (beklenen: Aciklama) => { for (const u of urunler) expect(u.description_i18n).toEqual(beklenen) }

    // TERS SIRA (son yazılan plan önce): ikisi de çıkış 0, canlı sırayla ara metne sonra eski metne döner
    for (const u of urunler) u.description_i18n = son
    expect((await calistir(ag(enKaydi, '--yaz'), true)).kod).toBe(0)
    hepsi(aradaki)
    expect((await calistir(ag(trKaydi, '--yaz'), true)).kod).toBe(0)
    hepsi(eski)
    expect(patchler().length).toBe(4)

    // DÜZ SIRA (ilk yazılan plan önce): canlı TR kaydının ne sonraki'sine ne onceki'sine eşit → DOKUNULMAZ, PATCH yok, çıkış 1
    for (const u of urunler) u.description_i18n = son
    const duz = await calistir(ag(trKaydi, '--yaz'), true)
    expect(duz.kod).toBe(1)
    expect(duz.stdout).toContain('ÖZET: 0 satır geri alınır · 0 zaten geri alınmış · 2 sonradan değişmiş')
    hepsi(son)
    expect(patchler().length).toBe(4)

    // Yanlış sıra zarar vermez: doğru sırayla yeniden koşunca tamamlanır
    expect((await calistir(ag(enKaydi, '--yaz'), true)).kod).toBe(0)
    expect((await calistir(ag(trKaydi, '--yaz'), true)).kod).toBe(0)
    hepsi(eski)
  })
  it('ikinci geri alma zararsız: ilk koşumdan sonra aynı kayıtla "zaten geri alınmış"', async () => {
    const k = kayitDosyasi()
    expect((await calistir(ag(k, '--yaz'), true)).kod).toBe(0)
    expect(patchler().length).toBe(2)
    const r = await calistir(ag(k, '--yaz'), true)
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('2 zaten geri alınmış')
    expect(patchler().length).toBe(2)
  })
})

describe('A sonradan değişmiş, araya girme, RLS, yutulan PATCH', () => {
  it('SONRADAN DEĞİŞMİŞ satıra DOKUNULMAZ, diğeri geri alınır; yazımda çıkış 1', async () => {
    urunler[0].description_i18n = { tr: 'üçüncü kişinin metni', en: EN }
    const r = await calistir(ag(kayitDosyasi(), '--yaz'), true)
    expect(r.kod).toBe(1)
    expect(urunler[0].description_i18n).toEqual({ tr: 'üçüncü kişinin metni', en: EN })
    expect(urunler[1].description_i18n).toEqual(onceki())
    expect(patchler().length).toBe(1)
    expect(r.stdout).toContain('sonradan değişmiş (dokunulmadı): 1')
  })
  it('okuma ile yazma ARASINDA araya girilmiş: 0 satır, DOKUNULMAZ, yeniden DENENMEZ, çıkış 1, başkasının metni korunur', async () => {
    kip = 'yaris'
    const r = await calistir(ag(kayitDosyasi(), '--yaz'), true)
    expect(r.kod).toBe(1)
    expect(r.stdout).toContain('araya girilmiş — DOKUNULMADI (yeniden denenmez)')
    expect(patchler().length).toBe(2)
    for (const u of urunler) expect(u.description_i18n).toEqual({ tr: YENI_TR, en: EN + EZ_NOT })
  })
  it('RLS/yetki: PATCH 0 satır ama satır DEĞİŞMEMİŞ → çıkış 1, ilk üründe durur', async () => {
    kip = 'rls'
    const r = await calistir(ag(kayitDosyasi(), '--yaz'), true)
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('DEĞİŞMEMİŞ')
    expect(r.stderr).toContain('yetki/RLS')
    expect(patchler().length).toBe(1)
  })
  it('HİÇBİR satır geri alınamıyor (hepsi sonradan değişmiş): yazımda çıkış 1, PATCH yok, yedek yok; kuru koşumda çıkış 0', async () => {
    for (const u of urunler) u.description_i18n = { tr: 'üçüncü kişinin metni', en: EN }
    const kuru = await calistir(ag(kayitDosyasi()))
    expect(kuru.kod).toBe(0)
    const r = await calistir(ag(kayitDosyasi(), '--yaz'), true)
    expect(r.kod).toBe(1)
    expect(r.stdout).toContain('Geri alınacak satır yok')
    expect(patchler()).toEqual([])
    expect(existsSync(join(gecici, 'cikti'))).toBe(false)
  })
  it('yutulan PATCH (yazmış gibi döner, saklamaz): geri okuma farkı yakalanır, çıkış 1', async () => {
    kip = 'yut'
    const r = await calistir(ag(kayitDosyasi(), '--yaz'), true)
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('geri okuma beklenenden FARKLI')
    expect(urunler[0].description_i18n).toEqual(sonraki())
  })
})

describe('E hata yolları', () => {
  it('satır canlıda yok (silinmiş): BULUNAMADI, kuru koşumda çıkış 0, yazımda diğeri geri alınır ve çıkış 1', async () => {
    urunler = urunler.filter((u) => u.id === 'u1')
    const kuru = await calistir(ag(kayitDosyasi()))
    expect(kuru.kod).toBe(0)
    expect(kuru.stdout).toContain('BULUNAMADI — satır canlıda yok')
    expect(kuru.stdout).toContain('ÖZET: 1 satır geri alınır')
    const yaz = await calistir(ag(kayitDosyasi(), '--yaz'), true)
    expect(yaz.kod).toBe(1)
    expect(urunler[0].description_i18n).toEqual(onceki())
    expect(yaz.stdout).toContain('bulunamadı: 1')
  })
  it('kayıt dosyası yok / JSON değil / şema bozuk: çıkış 2, ağa çıkılmaz', async () => {
    expect((await calistir(ag(join(gecici, 'yok.json')))).kod).toBe(2)
    expect((await calistir(ag(dosya('{bozuk')))).kod).toBe(2)
    const sema = await calistir(ag(dosya({ kayitlar: [{ id: 'u1),id.neq.(x', sku: 'A', onceki: null, sonraki: {} }] }), '--yaz'), true)
    expect(sema.kod).toBe(2)
    expect(sema.stderr).toContain('şeması geçersiz')
    expect(istekler).toEqual([])
  })
  it('--kayit/--url/--key eksik: çıkış 2', async () => {
    expect((await calistir([])).kod).toBe(2)
    expect((await calistir(['--kayit', kayitDosyasi()])).kod).toBe(2)
  })
  it('okuma 401: çıkış 1, hiçbir şey yazılmaz', async () => {
    kip = 'get-401'
    const r = await calistir(ag(kayitDosyasi(), '--yaz'), true)
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('DB HATA 401')
    expect(patchler()).toEqual([])
  })
  it('PATCH 500: çıkış 1, ilk üründe durur, geri alma yedeği ÖNCEDEN yazılmıştır', async () => {
    kip = 'patch-500'
    const r = await calistir(ag(kayitDosyasi(), '--yaz'), true)
    expect(r.kod).toBe(1)
    expect(r.stderr).toContain('DB HATA 500')
    expect(patchler().length).toBe(1)
    expect(readdirSync(join(gecici, 'cikti')).some((a) => a.startsWith('geri-alma-yedek-'))).toBe(true)
  })
  it('ağ yok (bağlantı reddedildi): yakalanmamış hata DEĞİL, ÖLÇÜLEMEDİ çıkış 2, yığın izi yok', async () => {
    const r = await calistir(['--kayit', kayitDosyasi(), '--url', 'http://127.0.0.1:1', '--key', 'k', '--out', join(gecici, 'cikti'), '--yaz'], true)
    expect(r.kod).toBe(2)
    expect(r.stderr).toContain('ÖLÇÜLEMEDİ — ağ hatası GET')
    expect(r.stderr).not.toContain('at ')
  })
})
