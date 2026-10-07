import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-TEST-SEC-GERIYE-1 · geriye dönük doğrulamanın SAYIM MANTIĞI (scripts/ci/test-sec-geriye.cjs, karar 308 B4).
 *
 * Bu betik "kaçırılan = 0" iddiasını üretir; sayımı yanlışsa iddia boştur. Ölçülen: bir koşu TEK kategoriye girer (öncelik sabit); yalnız ASIL kategorideki
 * `KACIRILDI` kaçırma sayısına girer (ayrı kategoriler AYRI sayılır ve kaçırma sayısına KARIŞMAZ); özet kaçırılanları adlarıyla verir; B4 girdi biçimi
 * (kırılan test dizgesi, değişen dosya dizgesi ya da { filename, status, previous_filename } kaydı) doğru çözülür; PR türü sınıflaması belge-yalnız,
 * küresel, kod ve diğerini ayırır. `gh`/`git`/`vitest` çağrısı yoktur (saf yardımcılar).
 */

type Aciklama = { test: string; baslik: string | null; sinif: string; gercek: boolean; kok?: { runId: number; dal: string; olay: string; guvence: string } }
type Satir = { kategori: string; durum?: string; kacirilan?: string[]; runId?: number; attempt?: number; prNo?: number | null; dal?: string; tur?: string; gercek?: boolean; aciklama?: Aciklama[] }
type Ozet = {
  tur: string
  kosu: number
  asil: { toplam: number; secildi: number; tam: number; kacirildi: number; olculemedi: number }
  ayri: Record<string, { toplam: number; kacirildi: number }>
  kacirilanlar: Array<{ runId?: number; kacirilan?: string[] }>
  ayriKacirilanlar: Array<{ kategori: string; kacirilan?: string[] }>
  aciklanan: Record<string, number>
  gercekKacirilan: Array<{ runId?: number; kacirilan?: string[] }>
}
type Kayit = {
  event?: string
  testAyiklanamadi?: boolean
  dalDeneme?: boolean
  sonradanYesilAyniCommit?: boolean
  kirilanTestDosyalari?: unknown[]
  runId?: number
  attempt?: number
  dal?: string
  olusturma?: string
  kirilanBasliklar?: Record<string, string[]>
}
type AcikGirdi = {
  kayitlar: Kayit[]
  sonuclar: Satir[]
  dunyaTestleri: string[]
  kaynakOku: (yol: string) => string
}
type CiSure = { sureler: Map<string, { sn: number; test: number }>; dosyaBasiYuk: number; dosyaToplami: number }
type Geriye = {
  ciGunluguOku: (metin: string) => CiSure
  basliklariCikar: (metin: string, test: string) => string[]
  baslikVarMi: (kaynak: string, zincir: string) => boolean
  kacirilanlariAcikla: (g: AcikGirdi) => Map<string, { aciklama: Aciklama[]; gercek: boolean }>
  kategori: (k: Kayit) => string
  kirilanTestler: (k: Kayit) => string[]
  ozetKur: (satirlar: Satir[]) => Ozet
  dosyaKumeleri: (kayitlar: unknown[]) => { degisen: string[]; silinen: Set<string> }
  prTuru: (degisen: string[]) => string
}

const require_ = createRequire(import.meta.url)
const G = require_(path.resolve(__dirname, '../test-sec-geriye.cjs')) as Geriye

const TEST = 'src/__tests__/conformance/x.test.ts'

describe('INV-TEST-SEC-GERIYE-1 · kategori önceliği (bir koşu TEK kategoriye girer)', () => {
  it('normal PR koşusu ASIL', () => {
    expect(G.kategori({ event: 'pull_request', kirilanTestDosyalari: [TEST] })).toBe('ASIL')
    expect(G.kategori({ kirilanTestDosyalari: [TEST] })).toBe('ASIL')
  })
  it.each([
    ['test dosyası ayıklanamadı', { testAyiklanamadi: true, kirilanTestDosyalari: [] }, 'TEST-AYIKLANAMADI'],
    ['kırılan test listesi boş (kırmızı adım Test değil)', { event: 'pull_request', kirilanTestDosyalari: [] }, 'TEST-YOK'],
    ['dal denemesi', { event: 'pull_request', dalDeneme: true, kirilanTestDosyalari: [TEST] }, 'DAL-DENEME'],
    ['aynı commit sonradan yeşile döndü', { event: 'pull_request', sonradanYesilAyniCommit: true, kirilanTestDosyalari: [TEST] }, 'SONRADAN-YESIL'],
    ['PR olmayan olay (push)', { event: 'push', kirilanTestDosyalari: [TEST] }, 'PR-DISI'],
    ['PR olmayan olay (workflow_dispatch)', { event: 'workflow_dispatch', kirilanTestDosyalari: [TEST] }, 'PR-DISI'],
  ] as const)('%s → %s', (_ad, kayit, beklenen) => {
    expect(G.kategori(kayit as Kayit)).toBe(beklenen)
  })
  it('öncelik: ayıklanamadı > test yok > PR dışı > dal denemesi > sonradan yeşil', () => {
    expect(G.kategori({ testAyiklanamadi: true, dalDeneme: true, sonradanYesilAyniCommit: true, event: 'push' })).toBe('TEST-AYIKLANAMADI')
    expect(G.kategori({ dalDeneme: true, sonradanYesilAyniCommit: true, event: 'push', kirilanTestDosyalari: [TEST] })).toBe('PR-DISI')
    expect(G.kategori({ dalDeneme: true, sonradanYesilAyniCommit: true, event: 'pull_request', kirilanTestDosyalari: [TEST] })).toBe('DAL-DENEME')
  })
  it('kırılan test dosyaları: dizge, { dosya | file } kaydı, ters bölü, yinelenen ve boş eleman temizlenir, sıralanır', () => {
    expect(G.kirilanTestler({ kirilanTestDosyalari: ['b.test.ts', { dosya: 'a.test.ts' }, { file: 'c\\d.test.ts' }, 'b.test.ts', '', null, 5] })).toEqual(['a.test.ts', 'b.test.ts', 'c/d.test.ts'])
    expect(G.kirilanTestler({})).toEqual([])
  })
})

describe('INV-TEST-SEC-GERIYE-1 · özet: kaçırma yalnız ASIL kategoriden; ayrı kategoriler AYRI sayılır', () => {
  const satirlar: Satir[] = [
    { kategori: 'ASIL', durum: 'SECILDI', runId: 1, kacirilan: [] },
    { kategori: 'ASIL', durum: 'TAM', runId: 2, kacirilan: [] },
    { kategori: 'ASIL', durum: 'KACIRILDI', runId: 3, attempt: 1, prNo: 77, dal: 'x/y', kacirilan: [TEST] },
    { kategori: 'ASIL', durum: 'OLCULEMEDI', runId: 4, kacirilan: [] },
    { kategori: 'DAL-DENEME', durum: 'KACIRILDI', runId: 5, kacirilan: [TEST] },
    { kategori: 'SONRADAN-YESIL', durum: 'SECILDI', runId: 6, kacirilan: [] },
    { kategori: 'TEST-AYIKLANAMADI', runId: 7 },
    { kategori: 'TEST-YOK', runId: 8 },
    { kategori: 'PR-DISI', durum: 'KACIRILDI', runId: 9, kacirilan: [TEST, 'b.test.ts'] },
  ]
  it('ASIL sayıları ve kaçırılan listesi', () => {
    const o = G.ozetKur(satirlar)
    expect(o.tur).toBe('OZET')
    expect(o.kosu).toBe(9)
    expect(o.asil).toEqual({ toplam: 4, secildi: 1, tam: 1, kacirildi: 1, olculemedi: 1 })
    expect(o.kacirilanlar).toEqual([{ runId: 3, attempt: 1, prNo: 77, dal: 'x/y', kacirilan: [TEST] }])
  })
  it('ayrı kategorilerin kaçırmaları kaçırma sayısına KARIŞMAZ; ayrı listede bilgi olarak görünür', () => {
    const o = G.ozetKur(satirlar)
    expect(o.ayri['DAL-DENEME']).toEqual({ toplam: 1, kacirildi: 1 })
    expect(o.ayri['PR-DISI']).toEqual({ toplam: 1, kacirildi: 1 })
    expect(o.ayri['SONRADAN-YESIL']).toEqual({ toplam: 1, kacirildi: 0 })
    expect(o.ayri['TEST-AYIKLANAMADI']).toEqual({ toplam: 1, kacirildi: 0 })
    expect(o.ayri['TEST-YOK']).toEqual({ toplam: 1, kacirildi: 0 })
    expect(o.ayriKacirilanlar.map((x) => x.kategori).sort()).toEqual(['DAL-DENEME', 'PR-DISI'])
    expect(o.asil.kacirildi).toBe(1)
  })
  it('hiç kaçırma yoksa kacirilanlar boş, asil.kacirildi 0', () => {
    const o = G.ozetKur([{ kategori: 'ASIL', durum: 'SECILDI', kacirilan: [] }, { kategori: 'DAL-DENEME', durum: 'KACIRILDI', kacirilan: [TEST] }])
    expect(o.asil.kacirildi).toBe(0)
    expect(o.kacirilanlar).toEqual([])
  })
  it('OZET satırının kendisi ve boş girdi sayıma girmez', () => {
    const o = G.ozetKur([{ kategori: 'ASIL', durum: 'KACIRILDI', kacirilan: [TEST] }, { kategori: 'OZET', tur: 'OZET' }])
    expect(o.kosu).toBe(1)
    expect(o.asil.kacirildi).toBe(1)
    expect(G.ozetKur([]).kosu).toBe(0)
  })
})

describe('INV-TEST-SEC-GERIYE-1 · değişen dosya kayıtları ve PR türü', () => {
  it('dizge, { filename | dosya | yol | path } kaydı, durum (removed | silindi | deleted) ve taşıma (eski yol silinmiş sayılır)', () => {
    const k = G.dosyaKumeleri([
      'docs/a.md',
      'docs\\b.md',
      { filename: 'src/x.ts', status: 'modified' },
      { filename: 'src/y.ts', status: 'removed' },
      { dosya: 'src/z.ts', durum: 'silindi' },
      { filename: 'src/yeni.ts', status: 'renamed', previous_filename: 'src/eski.ts' },
      { path: 'p/q.ts' },
      null,
      7,
      { filename: 5 },
    ])
    expect(k.degisen).toEqual(['docs/a.md', 'docs/b.md', 'p/q.ts', 'src/eski.ts', 'src/x.ts', 'src/y.ts', 'src/yeni.ts', 'src/z.ts'])
    expect([...k.silinen].sort()).toEqual(['src/eski.ts', 'src/y.ts', 'src/z.ts'])
    expect(G.dosyaKumeleri([]).degisen).toEqual([])
  })
  it.each([
    [['docs/a.md', 'docs/b/c.md', 'README.md', '.claude/skills/x/SKILL.md'], 'belge'],
    [['docs/a.md', 'src/lib/x.ts'], 'kod'],
    [['src/lib/x.ts'], 'kod'],
    [['package.json', 'src/x.ts'], 'kuresel'],
    [['supabase/migrations/20260101000000_x.sql', 'docs/a.md'], 'kuresel'],
    [['scripts/ci/a.cjs'], 'kuresel'],
    [['scripts/seo/a.cjs'], 'diger'],
    [['supabase/functions/x/index.ts'], 'diger'],
    [['LICENSE'], 'diger'],
  ] as const)('%j → %s', (degisen, beklenen) => {
    expect(G.prTuru([...degisen])).toBe(beklenen)
  })
})

describe('INV-TEST-SEC-GERIYE-1 · günlükten kırılan başlıklar ve bugünkü kaynakta var mı', () => {
  const ESC = String.fromCharCode(27)
  const satir = (yol: string, zincir: string) => `2026-09-07T17:24:12.0000000Z ${ESC}[41m${ESC}[1m FAIL ${ESC}[22m${ESC}[49m ${yol} > ${zincir}`
  it('ANSI ve zaman damgası temizlenir, yalnız İSTENEN test dosyasının başlıkları gelir, yinelenenler tek, sıralı', () => {
    const metin = [
      satir('src/a.test.ts', 'B suite > ikinci'),
      satir('src/b.test.ts', 'başka dosya > karışmaz'),
      satir('src/a.test.ts', 'A suite > birinci'),
      satir('src/a.test.ts', 'A suite > birinci'),
      '2026-09-07T17:24:12.0000000Z  ✓ src/a.test.ts (3 tests) 12ms',
      satir('src/a.test.ts', '   '),
    ].join('\n')
    expect(G.basliklariCikar(metin, 'src/a.test.ts')).toEqual(['A suite > birinci', 'B suite > ikinci'])
    expect(G.basliklariCikar(metin, 'src/yok.test.ts')).toEqual([])
    expect(G.basliklariCikar('', 'src/a.test.ts')).toEqual([])
  })
  it('başlığın SON halkası (testin adı) kaynakta aynen aranır; kaçışlı tırnak düz tırnağa çevrilir', () => {
    expect(G.baslikVarMi("it('kol bir', () => {})", 'S > kol bir')).toBe(true)
    expect(G.baslikVarMi("it('kol bir', () => {})", 'S > kol iki')).toBe(false)
    expect(G.baslikVarMi("it('Recep\\'in son mesajı', () => {})", "S > Recep'in son mesajı")).toBe(true)
    expect(G.baslikVarMi('', 'S > kol bir')).toBe(false)
  })
  it('yer tutuculu (it.each: %s, $ad) ya da boş başlık kaynakla karşılaştırılamaz: VAR sayılır (güvenli yön, kırmızı bugünkü kapıda kalır)', () => {
    expect(G.baslikVarMi('hiç ilgisiz', 'S > durum %s için')).toBe(true)
    expect(G.baslikVarMi('hiç ilgisiz', 'S > $ad için')).toBe(true)
    expect(G.baslikVarMi('hiç ilgisiz', '')).toBe(true)
  })
})

describe('INV-TEST-SEC-GERIYE-1 · kaçırılan koşuların açıklanması (açıklanamayan = GERÇEK kaçırma; her belirsizlikte güvenli yön)', () => {
  const T = 'src/__tests__/conformance/a.test.ts'
  const DUNYA = 'src/__tests__/conformance/a-dunya.test.ts'
  const BASLIK = 'INV-X · suite > kol bir'
  const BUGUN: Record<string, string> = { [T]: "it('kol bir', () => {})", [DUNYA]: "it('kol iki', () => {})" }
  const kaynakOku = (yol: string) => BUGUN[yol] ?? ''
  const zaman = (saat: number, dakika = 0) => new Date(Date.UTC(2026, 8, 7, saat, dakika, 0)).toISOString()
  const kayit = (runId: number, saat: number, dal: string, ek: Partial<Kayit> = {}): Kayit => ({
    runId,
    attempt: 1,
    dal,
    event: 'pull_request',
    olusturma: zaman(saat),
    kirilanTestDosyalari: [T],
    kirilanBasliklar: { [T]: [BASLIK] },
    ...ek,
  })
  const kacirildi = (runId: number): Satir => ({ kategori: 'ASIL', durum: 'KACIRILDI', runId, attempt: 1, kacirilan: [T] })
  const secildi = (runId: number): Satir => ({ kategori: 'ASIL', durum: 'SECILDI', runId, attempt: 1, kacirilan: [] })
  const acikla = (kayitlar: Kayit[], sonuclar: Satir[], kaynak = kaynakOku) => G.kacirilanlariAcikla({ kayitlar, sonuclar, dunyaTestleri: [DUNYA], kaynakOku: kaynak })

  it('DEVRALINAN: kök PR dışı (master push TAM koşar) → güvence var, gerçek kaçırma DEĞİL', () => {
    const s = acikla([kayit(1, 8, 'master', { event: 'push' }), kayit(2, 9, 'x/b')], [{ kategori: 'PR-DISI', durum: 'TAM', runId: 1, attempt: 1, kacirilan: [] }, kacirildi(2)])
    const r = s.get('2#1')
    expect(r?.gercek).toBe(false)
    expect(r?.aciklama[0]).toMatchObject({ sinif: 'DEVRALINAN', gercek: false, kok: { runId: 1, guvence: 'master-push-tam' } })
  })
  it('DEVRALINAN: kök bir PR koşusu ve seçici onu SEÇMİŞ → güvence var', () => {
    const s = acikla([kayit(1, 8, 'x/a'), kayit(2, 9, 'x/b')], [secildi(1), kacirildi(2)])
    expect(s.get('2#1')?.aciklama[0]).toMatchObject({ sinif: 'DEVRALINAN', gercek: false, kok: { guvence: 'secildi' } })
    expect(s.get('2#1')?.gercek).toBe(false)
  })
  it('DEVRALINAN ama kök de seçicinin KAÇIRDIĞI PR koşusu → İKİSİ de GERÇEK kaçırma (kök KOK, ardıllar güvencesiz)', () => {
    const s = acikla([kayit(1, 8, 'x/a'), kayit(2, 9, 'x/b')], [kacirildi(1), kacirildi(2)])
    expect(s.get('1#1')?.aciklama[0]).toMatchObject({ sinif: 'KOK', gercek: true })
    expect(s.get('2#1')?.aciklama[0]).toMatchObject({ sinif: 'DEVRALINAN', gercek: true, kok: { guvence: 'yok' } })
    expect(s.get('2#1')?.gercek).toBe(true)
  })
  it('aynı dalın KENDİ tekrarı devralınan SAYILMAZ (PR kendi kırmızısını tekrarlıyor): gerçek', () => {
    const s = acikla([kayit(1, 8, 'x/a'), kayit(2, 9, 'x/a')], [kacirildi(1), kacirildi(2)])
    expect(s.get('2#1')?.aciklama[0].sinif).toBe('KOK')
    expect(s.get('2#1')?.gercek).toBe(true)
  })
  it('zincir penceresi 12 saat: 11 saat sonrası devralınan, 13 saat sonrası yeni zincir (KOK, gerçek)', () => {
    const yakin = acikla([kayit(1, 8, 'x/a'), kayit(2, 19, 'x/b')], [secildi(1), kacirildi(2)])
    expect(yakin.get('2#1')?.aciklama[0].sinif).toBe('DEVRALINAN')
    const uzak = acikla([kayit(1, 8, 'x/a'), kayit(2, 21, 'x/b')], [secildi(1), kacirildi(2)])
    expect(uzak.get('2#1')?.aciklama[0].sinif).toBe('KOK')
    expect(uzak.get('2#1')?.gercek).toBe(true)
  })
  it('zincir kayarak uzar: aralarında 12 saati aşmayan her kırmızı aynı zincirdir', () => {
    const s = acikla([kayit(1, 0, 'x/a'), kayit(2, 10, 'x/b'), kayit(3, 20, 'x/c')], [secildi(1), kacirildi(2), kacirildi(3)])
    expect(s.get('3#1')?.aciklama[0]).toMatchObject({ sinif: 'DEVRALINAN', kok: { runId: 1 } })
  })
  it('FARKLI başlık aynı zincirden sayılmaz', () => {
    const s = acikla([kayit(1, 8, 'x/a', { kirilanBasliklar: { [T]: ['S > kol bir baska'] } }), kayit(2, 9, 'x/b')], [secildi(1), kacirildi(2)], (y) => (y === T ? "it('kol bir', () => {}); it('kol bir baska', () => {})" : ''))
    expect(s.get('2#1')?.aciklama[0].sinif).toBe('KOK')
    expect(s.get('2#1')?.gercek).toBe(true)
  })
  it('DUNYA-KOLU-TASINDI: başlık bugünkü dosyada yok, dünya durumu testinde var → gerçek kaçırma değil', () => {
    const bugun: Record<string, string> = { ...BUGUN, [T]: "it('başka bir kol', () => {})", [DUNYA]: "it('kol bir', () => {})" }
    const s = acikla([kayit(1, 8, 'x/a')], [kacirildi(1)], (y) => bugun[y] ?? '')
    expect(s.get('1#1')?.aciklama[0]).toMatchObject({ sinif: 'DUNYA-KOLU-TASINDI', gercek: false })
    expect(s.get('1#1')?.gercek).toBe(false)
  })
  it('TEST-DEGISTI: başlık ne bugünkü dosyada ne dünya testlerinde var → bugünkü haritayla değerlendirilemez (ayrı sınıf, gerçek sayılmaz)', () => {
    const s = acikla([kayit(1, 8, 'x/a')], [kacirildi(1)], () => "it('tamamen farklı', () => {})")
    expect(s.get('1#1')?.aciklama[0]).toMatchObject({ sinif: 'TEST-DEGISTI', gercek: false })
  })
  it('BASLIK-YOK: başlık bilinmiyorsa koşu AÇIKLANMIŞ SAYILMAZ (gerçek)', () => {
    const s = acikla([kayit(1, 8, 'x/a', { kirilanBasliklar: undefined })], [kacirildi(1)])
    expect(s.get('1#1')?.aciklama[0]).toMatchObject({ sinif: 'BASLIK-YOK', gercek: true })
    const bos = acikla([kayit(1, 8, 'x/a', { kirilanBasliklar: { [T]: [] } })], [kacirildi(1)])
    expect(bos.get('1#1')?.gercek).toBe(true)
  })
  it('yer tutuculu başlık "bugünkü kapıda var" sayılır: dünya kolu diye AÇIKLANMAZ, zincir kuralına gider', () => {
    const s = acikla([kayit(1, 8, 'x/a', { kirilanBasliklar: { [T]: ['S > durum %s için'] } })], [kacirildi(1)])
    expect(s.get('1#1')?.aciklama[0].sinif).toBe('KOK')
    expect(s.get('1#1')?.gercek).toBe(true)
  })
  it('bir koşuda iki başlık varsa YALNIZ hepsi açıklanırsa koşu açıklanmış olur', () => {
    const k = kayit(2, 9, 'x/b', { kirilanBasliklar: { [T]: [BASLIK, 'S > kol uc'] } })
    const s = acikla([kayit(1, 8, 'x/a', { kirilanBasliklar: { [T]: [BASLIK] } }), k], [secildi(1), kacirildi(2)], (y) => (y === T ? "it('kol bir'); it('kol uc')" : ''))
    const r = s.get('2#1')
    expect(r?.aciklama.map((a) => a.sinif).sort()).toEqual(['DEVRALINAN', 'KOK'])
    expect(r?.gercek).toBe(true)
  })
  it('yalnız ASIL + KACIRILDI satırları sonuçta yer alır; seçilen, TAM ve PR dışı satırlar yer almaz', () => {
    const s = acikla([kayit(1, 8, 'x/a'), kayit(2, 9, 'x/b'), kayit(3, 10, 'master', { event: 'push' })], [secildi(1), { kategori: 'ASIL', durum: 'TAM', runId: 2, attempt: 1, kacirilan: [] }, { kategori: 'PR-DISI', durum: 'KACIRILDI', runId: 3, attempt: 1, kacirilan: [T] }])
    expect([...s.keys()]).toEqual([])
  })
  it('zaman damgası geçersiz kayıt zincire GİRMEZ (kendi başına kök): açıklanamaz', () => {
    const s = acikla([kayit(1, 8, 'x/a'), kayit(2, 9, 'x/b', { olusturma: 'bozuk' })], [secildi(1), kacirildi(2)])
    expect(s.get('2#1')?.aciklama[0].sinif).toBe('KOK')
    expect(s.get('2#1')?.gercek).toBe(true)
  })
})

describe('INV-TEST-SEC-GERIYE-1 · CI günlüğünden dosya başına maliyet modeli (test süresi + dosya başı ortak yük)', () => {
  const ESC = String.fromCharCode(27)
  const GUNLUK = [
    'ci\tTest\t2026-10-07T09:05:12.2743002Z  ^[[32m✓^[[39m src/a.test.ts ^[[2m(^[[22m^[[2m163 tests^[[22m^[[2m)^[[22m^[[33m 466^[[2mms^[[22m^[[39m',
    'ci\tTest\t2026-10-07T09:05:28.0866010Z  ^[[32m✓^[[39m src/b.test.tsx ^[[2m(^[[22m^[[2m109 tests^[[22m^[[2m | ^[[22m^[[33m4 skipped^[[39m^[[2m)^[[22m^[[33m 11125^[[2mms^[[22m^[[39m',
    'ci\tTest\t2026-10-07T09:05:14.5533899Z      ^[[32m✓^[[39m 1500 rastgele LİSTE (1-6 yol): sonuç aynı  375^[[2mms^[[22m',
    'ci\tTest\t2026-10-07T09:05:15.0000000Z  ^[[32m✓^[[39m scripts/c.test.ts ^[[2m(^[[22m^[[2m6 tests^[[22m^[[2m)^[[22m',
    'ci\tTest\t2026-10-07T09:09:40.5512055Z  ^[[2m Test Files ^[[22m ^[[1m^[[32m3 passed^[[39m^[[22m^[[2m (^[[22m3^[[2m)^[[22m',
    'ci\tTest\t2026-10-07T09:09:40.5565493Z  ^[[2m   Duration ^[[22m 20.00s^[[2m (transform 1.00s, setup 2.00s, import 3.00s, tests 9.00s, environment 4.00s)^[[22m',
  ].join('\n')
  it('dosya satırlarından test sayısı ve ms; iç içe test satırları ve başka satırlar sayılmaz', () => {
    const k = G.ciGunluguOku(GUNLUK)
    expect([...k.sureler.keys()].sort()).toEqual(['scripts/c.test.ts', 'src/a.test.ts', 'src/b.test.tsx'])
    expect(k.sureler.get('src/b.test.tsx')?.test).toBe(109)
    expect(k.sureler.get('scripts/c.test.ts')?.test).toBe(6)
    expect(k.dosyaToplami).toBe(3)
  })
  it('dosya başı ortak yük = (transform + setup + import + environment) ÷ dosya sayısı; dosya maliyeti = test süresi + bu pay (tests süresi yüke girmez)', () => {
    const k = G.ciGunluguOku(GUNLUK)
    expect(k.dosyaBasiYuk).toBeCloseTo(10 / 3, 6)
    expect(k.sureler.get('src/a.test.ts')?.sn).toBeCloseTo(0.466 + 10 / 3, 6)
    expect(k.sureler.get('src/b.test.tsx')?.sn).toBeCloseTo(11.125 + 10 / 3, 6)
    expect(k.sureler.get('scripts/c.test.ts')?.sn).toBeCloseTo(10 / 3, 6)
  })
  it('gerçek ESC kaçışları da temizlenir; özet satırı yoksa ortak yük 0, ms yoksa 0 sayılır (varsayım uydurulmaz)', () => {
    const k = G.ciGunluguOku(`${ESC}[32m✓${ESC}[39m src/d.test.ts (4 tests) 250ms\n${ESC}[32m✓${ESC}[39m src/e.test.ts (2 tests)`)
    expect(k.dosyaBasiYuk).toBe(0)
    expect(k.sureler.get('src/d.test.ts')).toEqual({ sn: 0.25, test: 4 })
    expect(k.sureler.get('src/e.test.ts')).toEqual({ sn: 0, test: 2 })
  })
  it('boş ve anlamsız girdi boş harita verir, çökmez', () => {
    expect(G.ciGunluguOku('').sureler.size).toBe(0)
    expect(G.ciGunluguOku('ilgisiz metin\nbaşka satır').sureler.size).toBe(0)
  })
})

describe('INV-TEST-SEC-GERIYE-1 · özet açıklamayı sayar ama GERÇEK kaçırmayı gizlemez', () => {
  const T = 'src/__tests__/conformance/a.test.ts'
  const acik: Aciklama = { test: T, baslik: 'S > b', sinif: 'DEVRALINAN', gercek: false }
  it('açıklanan koşu `aciklanan`a, açıklanmayan (gercek true ya da hiç sınıflanmamış) koşu `gercekKacirilan`a düşer; ham sayı korunur', () => {
    const o = G.ozetKur([
      { kategori: 'ASIL', durum: 'KACIRILDI', runId: 1, attempt: 1, kacirilan: [T], gercek: false, aciklama: [acik, { ...acik, sinif: 'DUNYA-KOLU-TASINDI' }] },
      { kategori: 'ASIL', durum: 'KACIRILDI', runId: 2, attempt: 1, kacirilan: [T], gercek: true, aciklama: [{ ...acik, sinif: 'KOK', gercek: true }] },
      { kategori: 'ASIL', durum: 'KACIRILDI', runId: 3, attempt: 1, kacirilan: [T] },
    ])
    expect(o.asil.kacirildi).toBe(3)
    expect(o.aciklanan).toEqual({ DEVRALINAN: 1, 'DUNYA-KOLU-TASINDI': 1 })
    expect(o.gercekKacirilan.map((g) => g.runId)).toEqual([2, 3])
  })
  it('hiç kaçırma yoksa ikisi de boş', () => {
    const o = G.ozetKur([{ kategori: 'ASIL', durum: 'SECILDI', runId: 1, kacirilan: [] }])
    expect(o.aciklanan).toEqual({})
    expect(o.gercekKacirilan).toEqual([])
  })
})
