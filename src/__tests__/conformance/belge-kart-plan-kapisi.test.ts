/**
 * INV-KART-PLAN-1 — kart-plan kapısı (`docs/standards/kart-plani-standard.md`, HRT-14, karar 241/243/244).
 *
 * NİÇİN VAR: "plan karta, konuyu bilmeyenin uygulayabileceği açıklıkta yazılır" kuralı yazıyla kalırsa hatırlanana
 * kadar yaşar (karar 244: kontrolü yazılamayan kural girmez). Bu paket kapının AYIRT EDİCİ olduğunu ölçer: tam plan
 * geçer, her eksik ayrı sebeple kırmızı verir. Gerçek Kanban dosyasına DOKUNMAZ (veri git dışı; yalnız --dosya yolu).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

type Sonuc = { gecti: boolean; tur: 'plan' | 'plan-yok' | 'plan-gerekmez'; eksikler: string[]; uyarilar?: string[] }
type Modul = {
  degerlendir: (aciklama: string, secenek?: { onceki?: 'zorunlu' | 'uyari' }) => Sonuc
  kartiOku: (no: string, yol: string) => string
  oncekiKipi: (olusturuldu: string | undefined) => 'zorunlu' | 'uyari'
  ONCEKI_CALISMA_YURURLUK: string
}

const KOK = spawnSync('git', ['rev-parse', '--path-format=absolute', '--show-toplevel'], { encoding: 'utf8' }).stdout.trim()
const require = createRequire(import.meta.url)
const KAPI_YOLU = path.join(KOK, 'scripts/belge/kart-plan-kapisi.cjs')
const K = require(KAPI_YOLU) as Modul

const ETIKETLER = ['Amaç', 'Adımlar', 'Dosyalar', 'Bitti ölçütü', 'Ölçülmeyenler', 'Sor-noktaları', 'Etki alanı', 'ÖNCEKİ ÇALIŞMA'] as const

/** Geçerli ÖNCEKİ ÇALIŞMA değeri ("yok" biçimi): beş yer + ifade + sonuç. */
const ONCEKI_YOK = 'yok. Aranan: Kanban search_tasks (Done + arşiv, tüm panolar), git log --all --grep, docs/plans, docs/audits, sage, Linear; ifade: kart plani onceki calisma.'
const ONCEKI_BULUNDU =
  'HRT-14 kartı ve docs/standards/kart-plani-standard.md bulundu. Aranan: Kanban search_tasks, git log --all --grep, docs/plans, docs/audits, sage, Linear; ifade: kart plani.'

const TAM_PLAN = [
  'KAYNAK/CETVEL: cetvel yok.',
  'PLAN',
  'Amaç: Her kartta konuyu bilmeyenin uygulayabileceği bir plan bölümü bulunsun.',
  `ÖNCEKİ ÇALIŞMA: ${ONCEKI_YOK}`,
  'Adımlar:',
  '1. docs/standards/ altına yeni cetveli yaz.',
  '2. scripts/belge/ altına kapıyı yaz ve testini koş.',
  'Dosyalar: YAZILIR: docs/standards/x.md. DOKUNULMAZ: CLAUDE.md.',
  'Bitti ölçütü: node betik --kart HRT-14 çıkış kodu 0 verir.',
  'Ölçülmeyenler: CI bağlantısı.',
  'Sor-noktaları: şema farklıysa dur.',
  'Etki alanı: yok',
].join('\n')

/** Verilen etiketin satırını siler (başka satıra dokunmaz). */
function etiketiSil(metin: string, etiket: string): string {
  return metin
    .split('\n')
    .filter((s) => !s.startsWith(`${etiket}:`))
    .join('\n')
}

function cli(...argumanlar: string[]): { kod: number | null; cikti: string } {
  const r = spawnSync(process.execPath, [KAPI_YOLU, ...argumanlar], { encoding: 'utf8', env: { ...process.env, VENTHUB_KANBAN_DB: path.join(os.tmpdir(), 'kart-plan-yok.sqlite') } })
  return { kod: r.status, cikti: `${r.stdout}${r.stderr}` }
}

describe('INV-KART-PLAN-1 · degerlendir (saf işlev)', () => {
  it('tam doldurulmuş plan geçer', () => {
    expect(K.degerlendir(TAM_PLAN)).toEqual({ gecti: true, tur: 'plan', eksikler: [] })
  })

  it.each(ETIKETLER)('"%s" etiketi silinince o etiket eksikler içinde görünür', (etiket) => {
    const s = K.degerlendir(etiketiSil(TAM_PLAN, etiket))
    expect(s.gecti).toBe(false)
    expect(s.tur).toBe('plan')
    expect(s.eksikler.some((e) => e.startsWith(`${etiket}:`))).toBe(true)
  })

  it('kısa Amaç reddedilir', () => {
    const s = K.degerlendir(TAM_PLAN.replace(/^Amaç:.*$/m, 'Amaç: kısa amaç'))
    expect(s.gecti).toBe(false)
    expect(s.eksikler.join('\n')).toMatch(/Amaç: çok kısa/)
  })

  it('tek numaralı adım reddedilir', () => {
    const s = K.degerlendir(TAM_PLAN.replace(/^2\. .*$/m, 've sonra ikinci iş için yeterince uzun bir açıklama satırı'))
    expect(s.gecti).toBe(false)
    expect(s.eksikler.join('\n')).toMatch(/numaralı adım/)
  })

  it('kod çiti içindeki PLAN sayılmaz', () => {
    const s = K.degerlendir(['Şablon örneği:', '```', TAM_PLAN, '```'].join('\n'))
    expect(s).toMatchObject({ gecti: false, tur: 'plan-yok' })
  })

  it('HTML yorumu içindeki PLAN sayılmaz', () => {
    expect(K.degerlendir(`<!--\n${TAM_PLAN}\n-->`)).toMatchObject({ gecti: false, tur: 'plan-yok' })
  })

  it('hiç PLAN yoksa tur plan-yok', () => {
    expect(K.degerlendir('Sadece bir açıklama.')).toMatchObject({ gecti: false, tur: 'plan-yok' })
    expect(K.degerlendir('')).toMatchObject({ gecti: false, tur: 'plan-yok' })
  })

  it('Etki alanı veritabanı ve Recep özeti yoksa reddedilir; dolu özetle geçer', () => {
    const veritabani = TAM_PLAN.replace('Etki alanı: yok', 'Etki alanı: veritabanı')
    const eksik = K.degerlendir(veritabani)
    expect(eksik.gecti).toBe(false)
    expect(eksik.eksikler.join('\n')).toMatch(/Recep özeti/)
    expect(K.degerlendir(`${veritabani}\nRecep özeti:`).gecti).toBe(false) // boş özet dolu sayılmaz
    expect(K.degerlendir(`${veritabani}\nRecep özeti: karar 243 sunuldu`)).toEqual({ gecti: true, tur: 'plan', eksikler: [] })
  })

  it.each(['müşteriye-görünen', 'site-yapısı'])('Etki alanı %s de Recep özeti ister', (deger) => {
    const plan = TAM_PLAN.replace('Etki alanı: yok', `Etki alanı: ${deger}`)
    expect(K.degerlendir(plan).gecti).toBe(false)
    expect(K.degerlendir(`${plan}\nRecep özeti: 2026-10-02`).gecti).toBe(true)
  })

  it('Etki alanı izinli dört kelimeden biri değilse reddedilir', () => {
    const s = K.degerlendir(TAM_PLAN.replace('Etki alanı: yok', 'Etki alanı: bilmem'))
    expect(s.gecti).toBe(false)
    expect(s.eksikler.join('\n')).toMatch(/Etki alanı: değer "bilmem" geçersiz/)
  })

  it('Markdown süsü tolere edilir: "## PLAN", "**Amaç:** ...", "- Dosyalar: ..." biçimli tam plan geçer', () => {
    const susludur = TAM_PLAN.replace(/^PLAN$/m, '## PLAN')
      .replace(/^Amaç:/m, '**Amaç:**')
      .replace(/^Dosyalar:/m, '- Dosyalar:')
      .replace(/^Etki alanı:/m, '__Etki alanı:__')
    expect(K.degerlendir(susludur)).toEqual({ gecti: true, tur: 'plan', eksikler: [] })
    expect(K.degerlendir(TAM_PLAN.replace(/^PLAN$/m, '**PLAN**')).gecti).toBe(true)
  })

  it('Markdown süsü tolere edilse de eksik etiket yine görünür', () => {
    const s = K.degerlendir(etiketiSil(TAM_PLAN, 'Sor-noktaları').replace(/^PLAN$/m, '## PLAN'))
    expect(s.gecti).toBe(false)
    expect(s.eksikler.some((e) => e.startsWith('Sor-noktaları:'))).toBe(true)
  })

  it('Recep özeti en az bir rakam içermeli: "gönderildi" reddedilir, "karar 243 sunuldu" geçer', () => {
    const veritabani = TAM_PLAN.replace('Etki alanı: yok', 'Etki alanı: veritabanı')
    const rakamsiz = K.degerlendir(`${veritabani}\nRecep özeti: gönderildi`)
    expect(rakamsiz.gecti).toBe(false)
    expect(rakamsiz.eksikler.join('\n')).toMatch(/Recep özeti: karar numarası ya da tarih \(en az bir rakam\) gerekir/)
    expect(K.degerlendir(`${veritabani}\nRecep özeti: karar 243 sunuldu`).gecti).toBe(true)
  })

  it('PLAN başlığı ile "PLAN: gerekmez" birlikte varsa PLAN değerlendirilir (istisna yok sayılır)', () => {
    const eksikPlan = etiketiSil(TAM_PLAN, 'Dosyalar')
    const s = K.degerlendir(`${eksikPlan}\nPLAN: gerekmez — tek satırlık yazım düzeltmesi`)
    expect(s.tur).toBe('plan')
    expect(s.gecti).toBe(false)
    expect(s.eksikler.some((e) => e.startsWith('Dosyalar:'))).toBe(true)
  })

  it('"PLAN: gerekmez" sebebi müşteri/veritabanı/site yapısı etkisi anıyorsa reddedilir (karar 243); zararsız sebep geçer', () => {
    const reddedilen = K.degerlendir('PLAN: gerekmez — veritabanı şemasını değiştirir ama kısa')
    expect(reddedilen).toMatchObject({ gecti: false, tur: 'plan-gerekmez' })
    expect(reddedilen.eksikler.join('\n')).toMatch(/istisna kullanılamaz: sebep müşteriye görünen\/veritabanı\/site yapısı etkisi anıyor/)
    for (const sebep of ['MÜŞTERİ sayfası metni', 'vitrin başlığı düzeltmesi', 'yeni rotası eklenir', 'site yapısı notu', 'fiyat satırı yorumu', 'Ödeme sayfası']) {
      expect(K.degerlendir(`PLAN: gerekmez — ${sebep}`).gecti, sebep).toBe(false)
    }
    expect(K.degerlendir('PLAN: gerekmez — yalnız yorum satırı düzeltmesi')).toEqual({ gecti: true, tur: 'plan-gerekmez', eksikler: [] })
    expect(K.degerlendir('PLAN: gerekmez — protokol notu eklenir').gecti).toBe(true) // "protokol" içindeki "rota" sözcük başı değil
  })

  it('Etki alanı değeri yalnız etiketin kendi satırıdır: sonraki satır değere katılmaz', () => {
    expect(K.degerlendir(`${TAM_PLAN}\nbu satır değere katılmaz`).gecti).toBe(true)
    expect(K.degerlendir(TAM_PLAN.replace('Etki alanı: yok', 'Etki alanı:\nyok')).gecti).toBe(false) // değer boş satırda değil, bulunamaz
  })

  it('Etki alanı: noktalı "yok." ve büyük harfli VERİTABANI kabul; çoklu değer virgülle; "yok" başkasıyla birleşmez', () => {
    expect(K.degerlendir(TAM_PLAN.replace('Etki alanı: yok', 'Etki alanı: yok.')).gecti).toBe(true)
    expect(K.degerlendir(TAM_PLAN.replace('Etki alanı: yok', 'Etki alanı: YOK')).gecti).toBe(true)
    const buyuk = TAM_PLAN.replace('Etki alanı: yok', 'Etki alanı: VERİTABANI')
    expect(K.degerlendir(buyuk).gecti).toBe(false) // Recep özeti yok
    expect(K.degerlendir(`${buyuk}\nRecep özeti: karar 243`).gecti).toBe(true)
    const coklu = TAM_PLAN.replace('Etki alanı: yok', 'Etki alanı: veritabanı, site-yapısı')
    expect(K.degerlendir(coklu).eksikler.join('\n')).toMatch(/Recep özeti/)
    expect(K.degerlendir(`${coklu}\nRecep özeti: 2026-10-02`).gecti).toBe(true)
    expect(K.degerlendir(TAM_PLAN.replace('Etki alanı: yok', 'Etki alanı: yok, veritabanı')).gecti).toBe(false)
    expect(K.degerlendir(TAM_PLAN.replace('Etki alanı: yok', 'Etki alanı: veritabanı, bilmem\nRecep özeti: 243')).gecti).toBe(false)
  })

  it('"PLAN: gerekmez" sebebi kısaysa reddedilir, 8+ karakterliyse geçer', () => {
    expect(K.degerlendir('PLAN: gerekmez — kısa')).toMatchObject({ gecti: false, tur: 'plan-gerekmez' })
    expect(K.degerlendir('PLAN: gerekmez — tek satırlık yazım düzeltmesi')).toEqual({ gecti: true, tur: 'plan-gerekmez', eksikler: [] })
  })
})

describe('INV-KART-PLAN-1 · ÖNCEKİ ÇALIŞMA satırı (HRT-26, OPS-30)', () => {
  const satiriDegistir = (deger: string | null) =>
    deger === null ? etiketiSil(TAM_PLAN, 'ÖNCEKİ ÇALIŞMA') : TAM_PLAN.replace(/^ÖNCEKİ ÇALIŞMA:.*$/m, `ÖNCEKİ ÇALIŞMA: ${deger}`)
  const sorun = (deger: string | null) => K.degerlendir(satiriDegistir(deger)).eksikler.filter((e) => e.startsWith('ÖNCEKİ ÇALIŞMA:'))

  it('"yok" + beş yer + ifade geçer; bulunan kart ve dosya yolu + beş yer + ifade de geçer', () => {
    expect(K.degerlendir(TAM_PLAN)).toEqual({ gecti: true, tur: 'plan', eksikler: [] })
    expect(sorun(ONCEKI_BULUNDU)).toEqual([])
  })

  it('satır hiç yoksa kırmızı ve mesaj etiketi söyler', () => {
    const s = K.degerlendir(satiriDegistir(null))
    expect(s.gecti).toBe(false)
    expect(s.eksikler.join('\n')).toMatch(/ÖNCEKİ ÇALIŞMA: etiketi yok/)
  })

  it('"yok" tek başına geçmez: aranan yerler ve ifade de eksik görünür', () => {
    const e = sorun('yok').join('\n')
    expect(e).toMatch(/aranan yer\(ler\) yazılmamış: Kanban search_tasks, git log, docs\/plans, docs\/audits, sage, Linear/)
    expect(e).toMatch(/arama ifadesi yok/)
    expect(K.degerlendir(satiriDegistir('yok')).gecti).toBe(false)
  })

  it.each([
    ['Kanban search_tasks', 'Kanban search_tasks (Done + arşiv, tüm panolar), '],
    ['git log', 'git log --all --grep, '],
    ['docs/plans', 'docs/plans, '],
    ['docs/audits', 'docs/audits, '],
    ['sage', 'sage, '],
    ['Linear', 'Linear'],
  ])('beş yerden biri (%s) yazılmazsa o yer adıyla reddedilir', (yer, parca) => {
    const e = sorun(ONCEKI_YOK.replace(parca, '')).join('\n')
    expect(e).toMatch(/aranan yer\(ler\) yazılmamış/)
    expect(e).toContain(yer)
  })

  it('arama ifadesi yoksa ya da çok kısaysa reddedilir; "arama ifadesi:" yazımı da kabul', () => {
    expect(sorun(ONCEKI_YOK.replace(/ ifade:.*$/, '')).join('\n')).toMatch(/arama ifadesi yok/)
    expect(sorun(ONCEKI_YOK.replace(/ifade:.*$/, 'ifade: ab')).join('\n')).toMatch(/arama ifadesi yok/)
    expect(sorun(ONCEKI_YOK.replace('ifade:', 'arama ifadesi:'))).toEqual([])
  })

  it('sonuç yoksa reddedilir: ne "yok" ne bulgu; çıplak "docs/plans" yer adı bulgu sayılmaz', () => {
    const sonucsuz = 'Aranan: Kanban search_tasks, git log --all --grep, docs/plans, docs/audits, sage, Linear; ifade: kart plani.'
    expect(sorun(sonucsuz).join('\n')).toMatch(/sonuç yok/)
  })

  it('çok kısa satır reddedilir', () => {
    expect(sorun('yok').join('\n')).toMatch(/çok kısa/)
  })

  it('yazım toleransı: "Önceki çalışma:" ve "önceki çalışma :" da aynı etiket sayılır (Türkçe İ/ı)', () => {
    for (const yazim of ['Önceki çalışma:', 'önceki çalışma :', 'ÖNCEKI CALISMA:'.replace('CALISMA', 'ÇALIŞMA')]) {
      const plan = TAM_PLAN.replace(/^ÖNCEKİ ÇALIŞMA:/m, yazim)
      expect(K.degerlendir(plan)).toEqual({ gecti: true, tur: 'plan', eksikler: [] })
    }
  })

  it('çok satırlı değer: devam satırları aynı bölümde sayılır, sonraki etiket bölümü keser', () => {
    const cokSatir = TAM_PLAN.replace(
      /^ÖNCEKİ ÇALIŞMA:.*$/m,
      ['ÖNCEKİ ÇALIŞMA: yok.', 'Aranan: Kanban search_tasks, git log --all --grep,', 'docs/plans, docs/audits, sage, Linear;', 'ifade: kart plani onceki calisma.'].join('\n'),
    )
    expect(K.degerlendir(cokSatir)).toEqual({ gecti: true, tur: 'plan', eksikler: [] })
  })

  it('yürürlükten önceki kart: eksik satır yalnız uyarı (geçti kalır); yeni kart ve tarihsiz girdi zorunlu', () => {
    const satirsiz = satiriDegistir(null)
    const eski = K.degerlendir(satirsiz, { onceki: 'uyari' })
    expect(eski.gecti).toBe(true)
    expect(eski.eksikler).toEqual([])
    expect(eski.uyarilar?.join('\n')).toMatch(/ÖNCEKİ ÇALIŞMA: etiketi yok/)
    expect(K.degerlendir(satirsiz, { onceki: 'zorunlu' }).gecti).toBe(false)
    expect(K.degerlendir(satirsiz).gecti).toBe(false) // varsayılan zorunlu
    expect(K.degerlendir(TAM_PLAN, { onceki: 'uyari' })).toEqual({ gecti: true, tur: 'plan', eksikler: [] }) // uyarı yoksa alan da yok
  })

  it('oncekiKipi: yürürlük tarihinden önce uyari, o tarihte ve sonra zorunlu, tarihsiz zorunlu', () => {
    expect(K.ONCEKI_CALISMA_YURURLUK).toBe('2026-10-04T00:00:00.000Z')
    expect(K.oncekiKipi('2026-10-03T23:59:59.999Z')).toBe('uyari')
    expect(K.oncekiKipi('2026-10-04T00:00:00.000Z')).toBe('zorunlu')
    expect(K.oncekiKipi('2026-11-01T10:00:00.000Z')).toBe('zorunlu')
    expect(K.oncekiKipi(undefined)).toBe('zorunlu')
  })
})

describe('INV-KART-PLAN-1 · cetvel dosyası', () => {
  const standart = fs.readFileSync(path.join(KOK, 'docs/standards/kart-plani-standard.md'), 'utf8')

  it('ŞABLON bloğu (ilk kod çiti) PLAN başlığını ve sekiz etiketin hepsini (ÖNCEKİ ÇALIŞMA dahil) içerir', () => {
    const blok = standart.match(/```\n([\s\S]*?)```/)
    expect(blok).not.toBeNull()
    const sablon = blok![1]
    expect(sablon).toMatch(/^PLAN$/m)
    for (const etiket of ETIKETLER) expect(sablon).toMatch(new RegExp(`^${etiket}:`, 'm'))
  })

  it('karar 243 ve Recep özeti kuralı cetvelde geçer', () => {
    expect(standart).toMatch(/karar 243/)
    expect(standart).toMatch(/Recep özeti/)
  })
})

describe('INV-KART-PLAN-1 · CLI --dosya', () => {
  const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'kart-plan-'))

  it('tam plan çıkış 0, eksik plan çıkış 1 (eksik ayrı satırda), okunamayan dosya çıkış 2', () => {
    const tam = path.join(gecici, 'tam.txt')
    const eksik = path.join(gecici, 'eksik.txt')
    fs.writeFileSync(tam, TAM_PLAN)
    fs.writeFileSync(eksik, etiketiSil(TAM_PLAN, 'Dosyalar'))

    expect(cli('--dosya', tam).kod).toBe(0)
    const kirmizi = cli('--dosya', eksik)
    expect(kirmizi.kod).toBe(1)
    expect(kirmizi.cikti).toMatch(/^ {2}- Dosyalar: etiketi yok$/m)
    expect(cli('--dosya', path.join(gecici, 'yok.txt')).kod).toBe(2)
    expect(cli().kod).toBe(2) // argümansız çağrı sessizce geçmez
  })

  it('--pr-govde-dosyasi: gövdede Kanban satırı yoksa çıkış 1; veri dosyası yoksa çıkış 2', () => {
    const govde = path.join(gecici, 'govde.md')
    fs.writeFileSync(govde, 'Açıklama yok.')
    expect(cli('--pr-govde-dosyasi', govde).kod).toBe(1)
    fs.writeFileSync(govde, 'Kanban: HRT-14')
    const r = spawnSync(process.execPath, [KAPI_YOLU, '--pr-govde-dosyasi', govde], {
      encoding: 'utf8',
      env: { ...process.env, VENTHUB_KANBAN_DB: path.join(gecici, 'yok.sqlite') },
    })
    expect(r.status).toBe(2)
  })
})

describe('INV-KART-PLAN-1 · kartiOku (sahte sqlite; gerçek Kanban dosyasına dokunmaz)', () => {
  const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'kart-oku-'))
  const { DatabaseSync } = require('node:sqlite') as {
    DatabaseSync: new (yol: string) => { exec: (s: string) => void; prepare: (s: string) => { run: (...a: unknown[]) => void }; close: () => void }
  }

  /** `kanban_boards(id, payload, revision, updated_at)` tablosuyla geçici veri dosyası; her pano {title, tasks[]}. */
  function sahteDosya(ad: string, panolar: { title: string; tasks: { title: string; description: string; labels?: string[]; createdAt?: string }[] }[]): string {
    const yol = path.join(gecici, ad)
    const db = new DatabaseSync(yol)
    db.exec('CREATE TABLE kanban_boards (id TEXT PRIMARY KEY, payload TEXT, revision INTEGER, updated_at TEXT)')
    // Gerçek veriyle aynı şekil: her kartta `labels` alanı vardır (belirtilmezse tek sınıf etiketi `bu-ay`).
    panolar.forEach((p, i) => {
      const tam = { ...p, tasks: p.tasks.map((t) => ({ ...t, labels: t.labels ?? ['bu-ay'] })) }
      db.prepare('INSERT INTO kanban_boards VALUES (?, ?, ?, ?)').run(`b${i}`, JSON.stringify(tam), 1, '2026-10-02')
    })
    db.close()
    return yol
  }

  it('aşama 1: başlığın başındaki numara bulunur', () => {
    const yol = sahteDosya('a1.sqlite', [{ title: 'VentHub TEST', tasks: [{ title: 'HRT-14 · deneme', description: 'AÇIKLAMA-1' }] }])
    expect(K.kartiOku('HRT-14', yol)).toBe('AÇIKLAMA-1')
  })

  it('aşama 2: başlığın başında yoksa ilk 60 karakterde bulunur ("URUN REC-411: ...")', () => {
    const yol = sahteDosya('a2.sqlite', [{ title: 'VentHub TEST', tasks: [{ title: 'URUN REC-411: deneme', description: 'AÇIKLAMA-2' }] }])
    expect(K.kartiOku('REC-411', yol)).toBe('AÇIKLAMA-2')
  })

  it('aşama 2: numara ilk 60 karakterin dışındaysa ve başka numaranın öneki değilse bulunamaz', () => {
    const yol = sahteDosya('a3.sqlite', [
      { title: 'VentHub TEST', tasks: [{ title: `${'x'.repeat(60)} REC-411`, description: 'd' }, { title: 'REC-4111: başka', description: 'e' }] },
    ])
    expect(() => K.kartiOku('REC-411', yol)).toThrow(/kart bulunamadı: REC-411/)
  })

  it('aynı numara iki kartın ilk 60 karakterinde geçerse belirsiz (aşama 2) ve istisna fırlatır', () => {
    const yol = sahteDosya('a4.sqlite', [
      { title: 'VentHub TEST', tasks: [{ title: 'URUN REC-411: bir', description: 'd1' }] },
      { title: 'VentHub TEST 2', tasks: [{ title: 'ADMIN REC-411: iki', description: 'd2' }] },
    ])
    expect(() => K.kartiOku('REC-411', yol)).toThrow(/kart numarası belirsiz: REC-411 2 kartta.*aşama 2/)
  })

  it('başlığın başında iki kart eşleşirse belirsiz (aşama 1); başı eşleşen kart aşama 2 adaylarına yeğdir', () => {
    const iki = sahteDosya('a5.sqlite', [
      { title: 'VentHub TEST', tasks: [{ title: 'HRT-10 · bir', description: 'd1' }] },
      { title: 'VentHub TEST 2', tasks: [{ title: 'HRT-10 · iki', description: 'd2' }] },
    ])
    expect(() => K.kartiOku('HRT-10', iki)).toThrow(/belirsiz.*aşama 1/)
    const bir = sahteDosya('a6.sqlite', [
      { title: 'VentHub TEST', tasks: [{ title: 'HRT-10 · asıl', description: 'ASIL' }, { title: 'URUN, bkz HRT-10 notu', description: 'GÖLGE' }] },
    ])
    expect(K.kartiOku('HRT-10', bir)).toBe('ASIL')
  })

  it('CLI --kart: sahte dosya (VENTHUB_KANBAN_DB) ile geçen plan çıkış 0, belirsiz kart çıkış 2', () => {
    const yol = sahteDosya('a7.sqlite', [
      { title: 'VentHub TEST', tasks: [{ title: 'HRT-14 · deneme', description: TAM_PLAN }, { title: 'HRT-9 · x', description: 'd' }, { title: 'HRT-9 · y', description: 'd' }] },
    ])
    const calistir = (no: string) =>
      spawnSync(process.execPath, [KAPI_YOLU, '--kart', no], { encoding: 'utf8', env: { ...process.env, VENTHUB_KANBAN_DB: yol } })
    const gecen = calistir('HRT-14')
    expect(gecen.status).toBe(0)
    expect(gecen.stdout).toMatch(/GEÇTİ HRT-14/)
    expect(gecen.stderr).not.toMatch(/ExperimentalWarning/)
    expect(calistir('HRT-9').status).toBe(2)
  })

  it('CLI --kart: ÖNCEKİ ÇALIŞMA satırsız plan, kartın createdAt alanına göre: eski kart uyarı + çıkış 0, yeni kart ve tarihsiz kart çıkış 1', () => {
    const satirsiz = etiketiSil(TAM_PLAN, 'ÖNCEKİ ÇALIŞMA')
    const yol = sahteDosya('a7b.sqlite', [
      {
        title: 'VentHub TEST',
        tasks: [
          { title: 'HRT-1 · eski', description: satirsiz, createdAt: '2026-10-03T08:00:00.000Z' },
          { title: 'HRT-2 · yeni', description: satirsiz, createdAt: '2026-10-04T08:00:00.000Z' },
          { title: 'HRT-3 · tarihsiz', description: satirsiz },
          { title: 'HRT-4 · yeni tam', description: TAM_PLAN, createdAt: '2026-10-04T08:00:00.000Z' },
        ],
      },
    ])
    const calistir = (no: string) => spawnSync(process.execPath, [KAPI_YOLU, '--kart', no], { encoding: 'utf8', env: { ...process.env, VENTHUB_KANBAN_DB: yol } })
    const eski = calistir('HRT-1')
    expect(eski.status).toBe(0)
    expect(eski.stdout).toMatch(/GEÇTİ HRT-1/)
    expect(eski.stderr).toMatch(/UYARI: ÖNCEKİ ÇALIŞMA: etiketi yok .*HRT-1; yürürlükten önce açılmış kart/)
    const yeni = calistir('HRT-2')
    expect(yeni.status).toBe(1)
    expect(yeni.stdout).toMatch(/^ {2}- ÖNCEKİ ÇALIŞMA: etiketi yok/m)
    expect(calistir('HRT-3').status).toBe(1)
    expect(calistir('HRT-4').status).toBe(0)
  })

  it('--pr-govde-dosyasi: gövdede REC-nn varsa stderr UYARI basar ama çıkış kodu değişmez (0)', () => {
    const yol = sahteDosya('a8.sqlite', [{ title: 'VentHub TEST', tasks: [{ title: 'HRT-14 · deneme', description: TAM_PLAN }] }])
    const govde = path.join(gecici, 'govde-rec.md')
    fs.writeFileSync(govde, 'Özet.\nFixes REC-508\nKanban: HRT-14\n')
    const r = spawnSync(process.execPath, [KAPI_YOLU, '--pr-govde-dosyasi', govde], { encoding: 'utf8', env: { ...process.env, VENTHUB_KANBAN_DB: yol } })
    expect(r.status).toBe(0)
    expect(r.stderr).toMatch(/UYARI: PR gövdesinde Linear numarası REC-508 var; kapanmaması gerekiyorsa sil, yalnız Kanban: <no> yaz/)
  })

  it('--pr-govde-dosyasi: gövdede REC-nn yoksa uyarı yok, çıkış 0', () => {
    const yol = sahteDosya('a9.sqlite', [{ title: 'VentHub TEST', tasks: [{ title: 'HRT-14 · deneme', description: TAM_PLAN }] }])
    const govde = path.join(gecici, 'govde-temiz.md')
    fs.writeFileSync(govde, 'Özet.\nKanban: HRT-14\n')
    const r = spawnSync(process.execPath, [KAPI_YOLU, '--pr-govde-dosyasi', govde], { encoding: 'utf8', env: { ...process.env, VENTHUB_KANBAN_DB: yol } })
    expect(r.status).toBe(0)
    expect(r.stderr).not.toMatch(/UYARI/)
  })

  it('--pr-govde-dosyasi: "Kanban: REC-411" satırı tek başına uyarı vermez; ayrıca "Fixes REC-5" satırı varsa yalnız onu uyarır', () => {
    const yol = sahteDosya('a10.sqlite', [{ title: 'VentHub TEST', tasks: [{ title: 'REC-411 · taşınan kart', description: TAM_PLAN }] }])
    const calistir = (govdeMetni: string, ad: string) => {
      const govde = path.join(gecici, ad)
      fs.writeFileSync(govde, govdeMetni)
      return spawnSync(process.execPath, [KAPI_YOLU, '--pr-govde-dosyasi', govde], { encoding: 'utf8', env: { ...process.env, VENTHUB_KANBAN_DB: yol } })
    }
    const tek = calistir('Özet.\nKanban: REC-411\n', 'govde-kanban-rec.md')
    expect(tek.status).toBe(0)
    expect(tek.stderr).not.toMatch(/UYARI/)
    const fixesli = calistir('Özet.\nKanban: REC-411\nFixes REC-5\n', 'govde-kanban-fixes.md')
    expect(fixesli.status).toBe(0)
    expect(fixesli.stderr).toMatch(/UYARI: PR gövdesinde Linear numarası REC-5 var/)
    expect(fixesli.stderr).not.toMatch(/REC-411/)
  })

  it('--kart: sınıf etiketi yoksa ya da birden fazlaysa stderr UYARI; tek etiket (büyük/küçük harf fark etmez) uyarmaz; çıkış kodu hiçbirinde değişmez', () => {
    const yol = sahteDosya('a11.sqlite', [
      {
        title: 'VentHub TEST',
        tasks: [
          { title: 'HRT-21 · etiketsiz', description: TAM_PLAN, labels: ['HARITA', 'recep-karari'] },
          { title: 'HRT-22 · tek', description: TAM_PLAN, labels: ['HARITA', 'bu-ay'] },
          { title: 'HRT-23 · iki', description: TAM_PLAN, labels: ['bu-ay', 'rafta'] },
          { title: 'HRT-24 · büyük harf', description: TAM_PLAN, labels: ['RAFTA'] },
          { title: 'HRT-25 · eksik plan, etiketsiz', description: 'PLAN yok', labels: [] },
        ],
      },
    ])
    const calistir = (no: string) =>
      spawnSync(process.execPath, [KAPI_YOLU, '--kart', no], { encoding: 'utf8', env: { ...process.env, VENTHUB_KANBAN_DB: yol } })
    const etiketsiz = calistir('HRT-21')
    expect(etiketsiz.status).toBe(0)
    expect(etiketsiz.stderr).toMatch(/UYARI: kartta sınıf etiketi yok \(bu-ay\/ilk-satistan-once\/rafta\); tek biri yazılmalı/)
    const tek = calistir('HRT-22')
    expect(tek.status).toBe(0)
    expect(tek.stderr).not.toMatch(/UYARI/)
    const iki = calistir('HRT-23')
    expect(iki.status).toBe(0)
    expect(iki.stderr).toMatch(/UYARI: kartta birden fazla sınıf etiketi var/)
    const buyuk = calistir('HRT-24')
    expect(buyuk.status).toBe(0)
    expect(buyuk.stderr).not.toMatch(/UYARI/)
    const eksik = calistir('HRT-25')
    expect(eksik.status).toBe(1) // uyarı çıkış kodunu değiştirmez: eksik plan yine 1
    expect(eksik.stderr).toMatch(/UYARI: kartta sınıf etiketi yok/)
  })

  it('--pr-govde-dosyasi ile okunan kart sınıf uyarısı vermez (yalnız --kart)', () => {
    const yol = sahteDosya('a12.sqlite', [{ title: 'VentHub TEST', tasks: [{ title: 'HRT-26 · etiketsiz', description: TAM_PLAN, labels: [] }] }])
    const govde = path.join(gecici, 'govde-sinif.md')
    fs.writeFileSync(govde, 'Özet.\nKanban: HRT-26\n')
    const r = spawnSync(process.execPath, [KAPI_YOLU, '--pr-govde-dosyasi', govde], { encoding: 'utf8', env: { ...process.env, VENTHUB_KANBAN_DB: yol } })
    expect(r.status).toBe(0)
    expect(r.stderr).not.toMatch(/sınıf etiketi/)
  })
})
