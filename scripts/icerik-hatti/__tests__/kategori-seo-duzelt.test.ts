/**
 * KTL-21 · kategori-meta-duzelt.mjs arama sonucu alanları (categories.seo_title / seo_desc KOLON,
 * metadata.seo_title_en / seo_desc_en) — betik GERÇEK alt süreç olarak koşar, PostgREST SAHTE yerel sunucudur
 * (gerçek DB'ye çıkmaz). Kural çekirdeği (kategori-meta-duzelt-kurallar.mjs) betik üzerinden ölçülür.
 *
 * Sabitlenen davranış:
 *   S1 kuru koşum varsayılan, kolon + metadata kalemleri sayılır, PATCH yok
 *   S2 --yaz: TEK PATCH; gövde kolonları + metadata'yı taşır, mevcut metadata anahtarları AYNEN kalır; geri okuma birebir
 *   S3 ikinci koşum idempotent ("zaten uygulanmış"), PATCH yok
 *   S4 uzunluk kapısı (başlık 20-50, açıklama 110-155), sınırda geçer, bir fazlada/eksikte RED
 *   S5 başlıkta " | VentHub" eki RED
 *   S6 yol kapısı: yalnız @kolon.seo_title|seo_desc ve metadata seo_*_en; başka yol RED
 *   S7 EN alanında Türkçe harf RED; abartı kalıbı RED
 *   S8 dolu kolon eski=null ile ezilmez (RED)
 *   S9 yalnız kolon değişince gövdede metadata YOK (gereksiz yeniden yazım yok)
 *   S10 yedek dosyası kolonları taşır
 *   S11 GERİ ALMA turu: yaz → yeni=null planı → kolonlar null, metadata anahtarları silinir, satır ilk haline döner
 *   S12 yeni=null kör silme yapmaz (eski dolu metin ZORUNLU) ve yalnız arama alanlarında geçerlidir
 *   S13 başkasının değiştirdiği alan geri alma ile ezilmez (RED, PATCH yok)
 *   S14 boş alanda geri alma idempotent (zaten boş), PATCH yok
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFile } from 'node:child_process'
import { createServer, type Server } from 'node:http'

vi.setConfig({ testTimeout: 60000 })

const BETIK = process.env.KMD_BETIK || join(process.cwd(), 'scripts', 'icerik-hatti', 'kategori-meta-duzelt.mjs')

type Meta = Record<string, unknown>
type Satir = { id: string; tenant_id: string; slug: string; metadata: Meta | null; updated_at: string; seo_title: string | null; seo_desc: string | null; name?: string | null }
type Istek = { yontem: string; url: string; govde?: Record<string, unknown> }
type Kalem = { slug: string; yol: Array<string | number>; eski: string | null; yeni: string | null; tam: boolean }

const ILK = '2026-10-10T10:00:00.123456+00:00'
let satirlar: Satir[] = []
let istekler: Istek[] = []
let patchSayisi = 0
let sunucu: Server
let dizin = ''
let envDosya = ''

// KTL-21 kaynak-sözcük kapısı: arama metni kategorinin KENDİ gövdesindeki sözcüklerden kurulur; sabitler gövdede de geçer.
const TR_BASLIK = 'Kanal Tipi Fanlar: Yuvarlak ve Dikdörtgen Kesitli' // 50 karakter eksiz sınırının altında
const TR_ACIKLAMA = 'Havayı kanal hattının içinde taşıyan, kanala seri bağlanan fanlar. Yuvarlak ve dikdörtgen kesitli modeller vardır.'
const EN_BASLIK = 'Duct Fans: Circular and Rectangular Models'
const EN_ACIKLAMA = 'Fans that move air inside the duct run, installed in-line with the ductwork. Circular and rectangular models are available.'

const meta1 = (): Meta => ({
  slug: { tr: 'kanal-fanlari', en: 'duct-fans' },
  hide_price: true,
  description_i18n: { tr: `Kanal fanları açıklaması. ${TR_BASLIK}. ${TR_ACIKLAMA} VentHub`, en: `Duct fans description. ${EN_BASLIK}. ${EN_ACIKLAMA} VentHub` },
  ek_alan: { x: [1, 2] },
})

beforeAll(async () => {
  dizin = mkdtempSync(join(tmpdir(), 'kseo-test-'))
  sunucu = createServer((req, res) => {
    const u = new URL(req.url ?? '/', 'http://x')
    let govde = ''
    req.on('data', (c) => (govde += c))
    req.on('end', () => {
      istekler.push({ yontem: req.method ?? '', url: u.pathname + u.search, govde: govde ? JSON.parse(govde) : undefined })
      const json = (kod: number, v: unknown, b: Record<string, string> = {}) => { res.writeHead(kod, { 'content-type': 'application/json', ...b }); res.end(JSON.stringify(v)) }
      if (u.pathname !== '/rest/v1/categories') return json(404, {})
      if (req.method === 'GET') {
        if (req.headers.range) return json(206, satirlar.slice(0, 1).map((s) => ({ id: s.id })), { 'content-range': `0-0/${satirlar.length}` })
        const id = u.searchParams.get('id')
        return json(200, id ? satirlar.filter((s) => `eq.${s.id}` === id) : satirlar)
      }
      if (req.method === 'PATCH') {
        patchSayisi++
        const s = satirlar.find((r) => `eq.${r.id}` === u.searchParams.get('id') && `eq.${r.tenant_id}` === u.searchParams.get('tenant_id') && `eq.${r.updated_at}` === u.searchParams.get('updated_at'))
        if (!s) return json(200, [])
        const g = JSON.parse(govde) as { metadata?: Meta; seo_title?: string | null; seo_desc?: string | null }
        if ('metadata' in g) s.metadata = g.metadata ?? null
        if ('seo_title' in g) s.seo_title = g.seo_title ?? null
        if ('seo_desc' in g) s.seo_desc = g.seo_desc ?? null
        s.updated_at = `2026-10-10T11:00:0${patchSayisi}.000001+00:00`
        return json(200, [{ id: s.id }])
      }
      json(405, {})
    })
  })
  await new Promise<void>((coz) => sunucu.listen(0, '127.0.0.1', () => coz()))
  const port = (sunucu.address() as { port: number }).port
  envDosya = join(dizin, 'env')
  writeFileSync(envDosya, `SUPABASE_URL=http://127.0.0.1:${port}\nSUPABASE_SERVICE_ROLE_KEY=test-anahtar\n`)
})
afterAll(() => { sunucu.close(); rmSync(dizin, { recursive: true, force: true }) })
beforeEach(() => {
  satirlar = [{ id: 'c1', tenant_id: 't1', slug: 'duct-fans', metadata: meta1(), updated_at: ILK, seo_title: null, seo_desc: null }]
  istekler = []; patchSayisi = 0
})

type Sonuc = { kod: number; cikti: string }
function kos(plan: unknown, o: { yaz?: boolean; onay?: boolean; yedek?: string } = {}): Promise<Sonuc> {
  const planYolu = join(dizin, 'plan.json')
  writeFileSync(planYolu, JSON.stringify(plan))
  const args = [BETIK, '--plan', planYolu]
  if (o.yaz) args.push('--yaz')
  if (o.yedek) args.push('--yedek', o.yedek)
  return new Promise((coz) => {
    execFile(process.execPath, args, { env: { ...process.env, VENTHUB_ENV: envDosya, CANLI_YAZIM_ONAYI: o.onay ? 'evet' : '' } },
      (hata, so, se) => coz({ kod: hata ? Number((hata as NodeJS.ErrnoException).code) : 0, cikti: `${so}${se}` }))
  })
}
const kalem = (yol: Kalem['yol'], yeni: string | null, o: Partial<Kalem> = {}): Kalem => ({ slug: 'duct-fans', yol, eski: null, yeni, tam: true, ...o })
/** Yazım planının tersi: her kalemde eski ↔ yeni (yazımdan önce alanlar boştu → geri alma yeni=null). */
const geriAlmaPlani = () => ({ kalemler: tamPlan().kalemler.map((k) => ({ ...k, eski: k.yeni, yeni: null })) })
const tamPlan = () => ({ kalemler: [
  kalem(['@kolon', 'seo_title'], TR_BASLIK),
  kalem(['@kolon', 'seo_desc'], TR_ACIKLAMA),
  kalem(['seo_title_en'], EN_BASLIK),
  kalem(['seo_desc_en'], EN_ACIKLAMA),
] })
const patchler = () => istekler.filter((i) => i.yontem === 'PATCH')

describe('KTL-21 S1 · kuru koşum', () => {
  it('dört kalem (iki kolon, iki metadata) yazılacak sayılır, PATCH yok, çıkış 0', async () => {
    const r = await kos(tamPlan())
    expect(r.kod).toBe(0)
    expect(r.cikti).toContain('yazılacak 4')
    expect(r.cikti).toContain('KURU KOŞUM')
    expect(patchler()).toHaveLength(0)
  })
})

describe('KTL-21 S2 · yazım, tek PATCH, metadata korunur, geri okuma', () => {
  it('gövde kolonları ve metadata\'yı taşır; slug/hide_price/description_i18n/ek_alan AYNEN; geri okuma 1/1', async () => {
    const yedek = join(dizin, 'yedek-s2.json')
    const r = await kos(tamPlan(), { yaz: true, onay: true, yedek })
    expect(r.kod).toBe(0)
    expect(patchler()).toHaveLength(1)
    const g = patchler()[0].govde as { metadata: Meta; seo_title: string; seo_desc: string }
    expect(g.seo_title).toBe(TR_BASLIK)
    expect(g.seo_desc).toBe(TR_ACIKLAMA)
    expect(g.metadata.seo_title_en).toBe(EN_BASLIK)
    expect(g.metadata.seo_desc_en).toBe(EN_ACIKLAMA)
    const o = meta1()
    expect(g.metadata.slug).toEqual(o.slug)
    expect(g.metadata.hide_price).toBe(true)
    expect(g.metadata.description_i18n).toEqual(o.description_i18n)
    expect(g.metadata.ek_alan).toEqual(o.ek_alan)
    expect('@kolon' in g.metadata).toBe(false)
    expect(r.cikti).toContain('GERİ OKUMA: 1/1 kategori birebir')
    expect(satirlar[0].seo_title).toBe(TR_BASLIK)
  })
})

describe('KTL-21 S3 · idempotent', () => {
  it('ikinci koşumda hepsi zaten uygulanmış, PATCH yok', async () => {
    await kos(tamPlan(), { yaz: true, onay: true, yedek: join(dizin, 'yedek-s3a.json') })
    istekler = []
    const r = await kos({ kalemler: tamPlan().kalemler.map((k) => ({ ...k })) })
    expect(r.kod).toBe(0)
    expect(r.cikti).toContain('yazılacak 0')
    expect(r.cikti).toContain('zaten aynı 4')
    expect(patchler()).toHaveLength(0)
  })
})

describe('KTL-21 S4 · uzunluk kapısı', () => {
  const dene = async (yol: Kalem['yol'], yeni: string) => (await kos({ kalemler: [kalem(yol, yeni)] }))
  it('başlık 50 geçer, 51 RED; 20 geçer, 19 RED', async () => {
    expect((await dene(['@kolon', 'seo_title'], 'a'.repeat(50))).kod).toBe(0)
    const fazla = await dene(['@kolon', 'seo_title'], 'a'.repeat(51))
    expect(fazla.kod).toBe(1); expect(fazla.cikti).toContain('R7 seo-uzunluk'); expect(fazla.cikti).toContain('51 karakter')
    expect((await dene(['@kolon', 'seo_title'], 'a'.repeat(20))).kod).toBe(0)
    expect((await dene(['@kolon', 'seo_title'], 'a'.repeat(19))).kod).toBe(1)
  })
  it('açıklama 110 geçer, 109 RED; 155 geçer, 156 RED', async () => {
    expect((await dene(['@kolon', 'seo_desc'], 'a'.repeat(110))).kod).toBe(0)
    expect((await dene(['@kolon', 'seo_desc'], 'a'.repeat(109))).kod).toBe(1)
    expect((await dene(['@kolon', 'seo_desc'], 'a'.repeat(155))).kod).toBe(0)
    expect((await dene(['@kolon', 'seo_desc'], 'a'.repeat(156))).kod).toBe(1)
  })
  it('EN alanları aynı aralıkta ölçülür', async () => {
    expect((await dene(['seo_title_en'], 'b'.repeat(51))).kod).toBe(1)
    expect((await dene(['seo_desc_en'], 'b'.repeat(109))).kod).toBe(1)
  })
})

describe('KTL-21 S5 · marka eki', () => {
  it('başlıkta " | VentHub" RED (kod ekler)', async () => {
    const r = await kos({ kalemler: [kalem(['@kolon', 'seo_title'], 'Kanal Tipi Fanlar | VentHub')] })
    // Metindeki bütün sözcükler gövdede var ve uzunluk sınır içinde: yalnız ek kuralı düşebilir.
    expect(r.kod).toBe(1); expect(r.cikti).toContain('✗R7 baslik-ek-yok')
    expect(r.cikti).not.toContain('✗R7 seo-kaynak-sozcuk'); expect(r.cikti).not.toContain('✗R7 seo-uzunluk')
  })
})

describe('KTL-21 S6 · yol kapısı', () => {
  it.each([
    [['@kolon', 'name']], [['@kolon']], [['seo_title']], [['@kolon', 'seo_title', 'x']], [['metadata', 'seo_title_en']], [['constructor']],
  ])('izinsiz yol %j RED', async (yol: unknown) => {
    const r = await kos({ kalemler: [kalem(yol as Kalem['yol'], TR_ACIKLAMA)] })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('yol izinli değil')
    expect(patchler()).toHaveLength(0)
  })
})

describe('KTL-21 S7 · metin kapıları', () => {
  it('seo_desc_en içinde Türkçe harf RED', async () => {
    const r = await kos({ kalemler: [kalem(['seo_desc_en'], 'Kanal fanları: çatı ve duvar için ' + 'x'.repeat(80))] })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('R3b')
  })
  it('abartı kalıbı RED', async () => {
    const r = await kos({ kalemler: [kalem(['@kolon', 'seo_desc'], 'En iyi kanal fanları: ' + 'x'.repeat(100))] })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('R3d')
  })
})

describe('KTL-21 S8 · dolu kolon ezilmez', () => {
  it('seo_title dolu iken eski=null RED, PATCH yok', async () => {
    satirlar[0].seo_title = 'Elle yazılmış başlık metni'
    const r = await kos({ kalemler: [kalem(['@kolon', 'seo_title'], TR_BASLIK)] })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('eski=null')
    expect(patchler()).toHaveLength(0)
  })
  it('eski doğru verilirse (tam değer) değişir', async () => {
    satirlar[0].seo_title = 'Elle yazılmış başlık metni'
    const r = await kos({ kalemler: [kalem(['@kolon', 'seo_title'], TR_BASLIK, { eski: 'Elle yazılmış başlık metni' })] }, { yaz: true, onay: true, yedek: join(dizin, 'yedek-s8.json') })
    expect(r.kod).toBe(0)
    expect(satirlar[0].seo_title).toBe(TR_BASLIK)
  })
})

describe('KTL-21 S9 · yalnız kolon değişince metadata gönderilmez', () => {
  it('PATCH gövdesinde metadata anahtarı yok', async () => {
    const r = await kos({ kalemler: [kalem(['@kolon', 'seo_title'], TR_BASLIK)] }, { yaz: true, onay: true, yedek: join(dizin, 'yedek-s9.json') })
    expect(r.kod).toBe(0)
    const g = patchler()[0].govde as Record<string, unknown>
    expect('metadata' in g).toBe(false)
    expect(g.seo_title).toBe(TR_BASLIK)
    expect(satirlar[0].metadata).toEqual(meta1())
  })
})

describe('KTL-21 S10 · yedek kolonları taşır', () => {
  it('yedek dosyası seo_title/seo_desc eski değerini ve metadata\'yı içerir', async () => {
    satirlar[0].seo_desc = 'Eski açıklama değeri'
    const yedek = join(dizin, 'yedek-s10.json')
    const r = await kos({ kalemler: [kalem(['@kolon', 'seo_title'], TR_BASLIK)] }, { yaz: true, onay: true, yedek })
    expect(r.kod).toBe(0)
    expect(existsSync(yedek)).toBe(true)
    const y = JSON.parse(readFileSync(yedek, 'utf8')) as { satirlar: Array<Record<string, unknown>> }
    expect(y.satirlar[0].seo_title).toBeNull()
    expect(y.satirlar[0].seo_desc).toBe('Eski açıklama değeri')
    expect(y.satirlar[0].metadata).toEqual(meta1())
  })
})

describe('KTL-21 S11 · geri alma turu', () => {
  it('yazımdan sonra geri alma planı satırı ilk haline döndürür (kolonlar null, anahtarlar silinir, geri okuma 1/1)', async () => {
    const yaz = await kos(tamPlan(), { yaz: true, onay: true, yedek: join(dizin, 'yedek-s11a.json') })
    expect(yaz.kod).toBe(0)
    expect(satirlar[0].seo_title).toBe(TR_BASLIK)
    istekler = []
    const geri = await kos(geriAlmaPlani(), { yaz: true, onay: true, yedek: join(dizin, 'yedek-s11b.json') })
    expect(geri.kod).toBe(0)
    expect(geri.cikti).toContain('yazılacak 4')
    expect(geri.cikti).toContain('(boş — alan temizlenir)')
    expect(patchler()).toHaveLength(1)
    const g = patchler()[0].govde as { metadata: Meta; seo_title: unknown; seo_desc: unknown }
    expect(g.seo_title).toBeNull()
    expect(g.seo_desc).toBeNull()
    expect('seo_title_en' in g.metadata).toBe(false)
    expect('seo_desc_en' in g.metadata).toBe(false)
    expect(geri.cikti).toContain('GERİ OKUMA: 1/1 kategori birebir')
    expect(satirlar[0].seo_title).toBeNull()
    expect(satirlar[0].seo_desc).toBeNull()
    expect(satirlar[0].metadata).toEqual(meta1())
  })
})

describe('KTL-21 S12 · yeni=null kör silme yapmaz, yalnız arama alanlarında geçerli', () => {
  it('eski=null ile boşaltma RED (kör silme yok)', async () => {
    satirlar[0].seo_title = TR_BASLIK
    const r = await kos({ kalemler: [kalem(['@kolon', 'seo_title'], null, { eski: null })] })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('kör silme yok')
    expect(patchler()).toHaveLength(0)
  })
  it('tam=false ile boşaltma RED', async () => {
    satirlar[0].seo_title = TR_BASLIK
    const r = await kos({ kalemler: [kalem(['@kolon', 'seo_title'], null, { eski: TR_BASLIK, tam: false })] })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('tam=true gerekli')
  })
  it.each([
    [['description_i18n', 'tr']], [['hero_description']], [['marketing_title']], [['features', 0, 'title']],
  ])('arama alanı olmayan yol %j boşaltılamaz', async (yol: unknown) => {
    const r = await kos({ kalemler: [kalem(yol as Kalem['yol'], null, { eski: 'Kanal fanları açıklaması.' })] })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('yalnız arama alanlarında geçerli')
    expect(patchler()).toHaveLength(0)
  })
})

describe('KTL-21 S13 · başkasının değiştirdiği alan ezilmez', () => {
  it('canlı değer eski\'ye eşit değilse RED, PATCH yok, satır dokunulmaz', async () => {
    satirlar[0].seo_title = 'ADMIN formundan elle değiştirilmiş başlık'
    const r = await kos({ kalemler: [kalem(['@kolon', 'seo_title'], null, { eski: TR_BASLIK })] }, { yaz: true, onay: true, yedek: join(dizin, 'yedek-s13.json') })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('boşaltılmaz')
    expect(patchler()).toHaveLength(0)
    expect(satirlar[0].seo_title).toBe('ADMIN formundan elle değiştirilmiş başlık')
  })
})

describe('KTL-21 S14 · boş alanda geri alma idempotent', () => {
  it('yazılmamış satırda geri alma planı "zaten aynı 4", PATCH yok, çıkış 0', async () => {
    const r = await kos(geriAlmaPlani())
    expect(r.kod).toBe(0)
    expect(r.cikti).toContain('yazılacak 0')
    expect(r.cikti).toContain('zaten aynı 4')
    expect(patchler()).toHaveLength(0)
  })
})

// Bağımsız iddia okumasının bulguları: eski kapılar bu girdilere KÖRDÜ (112/112 geçiyordu).
const DOLGU = ' kanal hattının içinde taşıyan kanala seri bağlanan fanlar yuvarlak ve dikdörtgen kesitli modeller vardır' // gövdede geçen sözcükler, ≥110 kr için

describe('KTL-21 S15 · rakam ve yüzde yazılmaz', () => {
  it.each([['yüzde 95 daha sessiz'], ['%95 daha sessiz'], ['95 dB altında çalışır'], ['ISO 9001 kapsamındadır'], ['2G sınıfı için uygundur']])('"%s" RED', async (parca: string) => {
    const r = await kos({ kalemler: [kalem(['@kolon', 'seo_desc'], `fanlar ${parca}${DOLGU}`)] })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('✗R7 seo-rakam-yok')
    expect(patchler()).toHaveLength(0)
  })
})

describe('KTL-21 S16 · iddia kökü yazılmaz (çekimli biçimler dahil)', () => {
  it.each([['enerji tasarrufu sağlar'], ['işletme maliyeti düşüktür'], ['garantili çalışır'], ['sertifikalı üründür'], ['operating cost is low'], ['energy savings']])('"%s" RED', async (parca: string) => {
    const r = await kos({ kalemler: [kalem(['@kolon', 'seo_desc'], `fanlar ${parca}${DOLGU}`)] })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('✗R7 seo-iddia-koku-yok')
  })
})

describe('KTL-21 S17 · büyük harfli sözcük kategorinin kendi kaynağında geçmeli', () => {
  it.each([[['@kolon', 'seo_desc']], [['seo_desc_en']]])('kaynakta olmayan marka RED (%j)', async (yol: unknown) => {
    const r = await kos({ kalemler: [kalem(yol as Kalem['yol'], `Siemens motorlu fanlar${DOLGU}`)] })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('✗R7 seo-kaynak-sozcuk'); expect(r.cikti).toContain('Siemens')
  })
  it('cümle başındaki kaynak dışı sözcük de yakalanır', async () => {
    const r = await kos({ kalemler: [kalem(['@kolon', 'seo_desc'], `Vortice fanları${DOLGU}`)] })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('Vortice')
  })
  it('kaynakta geçen büyük harfli sözcükler (çekimli) geçer, çıkış 0', async () => {
    // "Kanalın" gövdede tam bu biçimde YOK (gövdede "kanal", "kanala"); ilk 5 harf eşleşmesi çekimi karşılar.
    const r = await kos({ kalemler: [kalem(['@kolon', 'seo_desc'], 'Kanalın hattının içinde havayı taşıyan Fanlar. Yuvarlak ve Dikdörtgen kesitli modeller vardır, kanala seri bağlanır.')] })
    expect(r.kod).toBe(0)
  })
  it('kategorinin kendi seo_title_en değeri kaynak sayılmaz (kalem kendini doğrulayamaz)', async () => {
    // 1. kalem GEÇERLİ (yeni sözcük küçük harfli, kapıya takılmaz); 2. kalem aynı sözcüğü büyük harfle kullanır.
    // seo_title_en kaynak sayılsaydı 2. kalem geçerdi.
    const r = await kos({ kalemler: [kalem(['seo_title_en'], 'Duct Fans: circular models with zorlu'), kalem(['seo_desc_en'], `Zorlu fans${DOLGU}`)] })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('✗R7 seo-kaynak-sozcuk'); expect(r.cikti).toContain('Zorlu')
  })
})

const DOLGU_EN = ' fans move air inside the duct run installed in-line with the ductwork circular and rectangular models' // EN gövdede geçen sözcükler

describe('KTL-21 S18 · kaynak-sözcük kapısının kapsamı', () => {
  it('BAŞLIKTA tamamı büyük harfli marka/model (SIEMENS) kaynakta yoksa RED', async () => {
    const r = await kos({ kalemler: [kalem(['@kolon', 'seo_title'], 'Kanal Fanları: SIEMENS Motorlu')] })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('✗R7 seo-kaynak-sozcuk'); expect(r.cikti).toContain('SIEMENS')
  })
  it('başlıkta Title Case sözcük (büyük harf bilgi taşımaz) kaynak gerektirmez, ALL-CAPS kaynakta ise geçer', async () => {
    const r = await kos({ kalemler: [kalem(['@kolon', 'seo_title'], 'Kanal Fanları: Zorlu Seriler')] })
    expect(r.kod).toBe(0)
  })
  it('AÇIKLAMADA aynı Title Case sözcük denetlenir (bilgi taşır)', async () => {
    const r = await kos({ kalemler: [kalem(['@kolon', 'seo_desc'], `Zorlu Seriler${DOLGU}`)] })
    expect(r.kod).toBe(1); expect(r.cikti).toContain('Zorlu')
  })
  it('satırın kendi name sütunu kaynaktır (sayfa h1\'i oradan gelir)', async () => {
    satirlar[0].name = 'Özgün Adlı Kategori'
    const r = await kos({ kalemler: [kalem(['@kolon', 'seo_desc'], `Özgün Adlı fanlar${DOLGU}`)] })
    expect(r.kod).toBe(0)
  })
  it('İngilizce büyük I ile başlayan sözcük kaynaktaki küçük harfli biçimle eşleşir (ı→i katlama)', async () => {
    satirlar[0].name = 'installation guide'
    const r = await kos({ kalemler: [kalem(['seo_desc_en'], `Installation${DOLGU_EN}`)] })
    expect(r.kod).toBe(0)
  })
  it('PATCH gövdesine ve yedeğe satırın name/description sütunları SIZMAZ (yalnız metadata ve arama kolonları)', async () => {
    satirlar[0].name = 'Özgün Adlı Kategori'
    const yedek = join(dizin, 'yedek-s18.json')
    const r = await kos({ kalemler: [kalem(['@kolon', 'seo_title'], TR_BASLIK)] }, { yaz: true, onay: true, yedek })
    expect(r.kod).toBe(0)
    const g = patchler()[0].govde as Record<string, unknown>
    expect(Object.keys(g).sort()).toEqual(['seo_title'])
    const y = JSON.parse(readFileSync(yedek, 'utf8')) as { satirlar: Array<Record<string, unknown>> }
    expect('name' in y.satirlar[0]).toBe(false)
  })
})
