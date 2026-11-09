import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-DEFTER-PR-KAPISI-1 · DEFTER PR KAPISI (scripts/ci/defter-pr-kapisi.cjs, OPS-258 / ALT-178).
 *
 * Kapı: manifestteki bir defterin `izlenen` yolu değişti ama defter dosyası değişmediyse (ya da `Son doğrulama` ilerlemediyse)
 * UYARI. Bu dosya kapının neyi YAKALAYIP neyi GEÇİRDİĞİNİ ve ci.yml'e doğru bağlandığını sabitler. Bloklar:
 *   1. glob / istisna / tarih ayrıştırma (saf),
 *   2. manifest şeması (plan §4.1): geçersiz kayıt kapı dışı kalır ve ihlal olur,
 *   3. karar: yakalama, muafiyet (istisna, bot, emekli, manifest yok), tarih kuralı, fail-closed,
 *   4. kip: UYARI hiçbir zaman kırmaz, KIRMIZI kırar; sayım satırı ve enjeksiyon kaçışı,
 *   5. `main`: ortamdan okuma, çökme -> ölçülemedi, PR dışı koşu,
 *   6. ci.yml bağlantısı (uyarı kipi, bloklamaz, yalnız env, PR dışında koşmaz),
 *   7. SABOTAJ: kaynağa tek tek hata sokulur; her hatalı kopya en az bir kontrolü kırmızıya çevirir.
 *
 * Manifest HARİTA'nın dosyası henüz birleşmedi: testler plan §4.1 şemasına karşı FİKSTÜR kullanır.
 */

const KOK = path.resolve(__dirname, '../../..')
const KAPI_YOLU = path.join(KOK, 'scripts/ci/defter-pr-kapisi.cjs')
const CI_YOLU = path.join(KOK, '.github/workflows/ci.yml')
const req = createRequire(import.meta.url)

type Kayit = {
  ad: string
  dosya: string
  sahip: string
  izlenen: string[]
  tazelikGun: number
  tetik: string[]
  olcum: string | null
  disKaynak: string | null
  durum: string
}
type Ihlal = { defter: string; tur: string; mesaj: string }
type Sonuc = {
  kip: string
  durum: string
  neden: string
  ihlaller: Ihlal[]
  istisna: { var: boolean; gecerli: boolean; sebepUzunlugu: number; kullanildi?: boolean }
  kapsam: { kontrolEdilen: number; kesisen: number; uyumlu: number; ihlalli: number; muaf: number }
}
type Girdi = {
  manifest?: { defterler: Kayit[] } | { bozuk: true } | null
  degisenYollar: string[] | null
  govde?: string
  yazar?: string
  prAcilisGunu?: string | null
  bugun?: string
  defterMetinleri?: Record<string, { onceki: string | null; sonraki: string | null }>
  depoDosyalari?: string[]
  kip?: string
}
type Bag = {
  okuManifest: () => unknown
  degisenYollar: () => string[] | null
  depoDosyalari: () => string[]
  okuSonraki: (d: string) => string | null
  okuOnceki: (d: string) => string | null
  yaz: (m: string) => void
  ozetYaz: (y: string, m: string) => void
  simdi: () => Date
}
type Kapi = {
  globEsle: (g: string, y: string) => boolean
  istisnaBul: (govde: string) => { var: boolean; gecerli: boolean; sebepUzunlugu: number }
  sonDogrulamaOku: (m: unknown) => string | null
  manifestiAyikla: (m: unknown, d?: string[]) => { bozuk: boolean; gecerli: Kayit[]; sorunlu: { ad: string; sorunlar: string[] }[] }
  degerlendir: (g: Girdi) => Sonuc
  cikisKodu: (s: Sonuc) => number
  aciklamaKacis: (s: string) => string
  satirlar: (s: Sonuc) => string[]
  ozetTablosu: (s: Sonuc) => string
  main: (env: Record<string, string | undefined>, bag: Bag) => number
  GENIS_GLOB_ESIGI: number
}

const kapi: Kapi = req(KAPI_YOLU)

const URUN: Kayit = {
  ad: 'urun-adres',
  dosya: 'docs/defter/urun-adres.md',
  sahip: 'URUN',
  izlenen: ['next.config.mjs', 'src/config/markaYonlendirmeleri.mjs', 'docs/standards/adres-semasi-standard.md'],
  tazelikGun: 14,
  tetik: ['kart-kapanisi', 'sure'],
  olcum: null,
  disKaynak: null,
  durum: 'pilot',
}
const GEO: Kayit = { ...URUN, ad: 'geo-seo-dizin', dosya: 'docs/defter/geo-seo-dizin.md', sahip: 'GEO-SEO', izlenen: ['scripts/seo/dizin-*.mjs', 'docs/seo/**'] }
const MANIFEST = { defterler: [URUN, GEO] }
const UYGUN_SEBEP = 'Defter-gerekmez: yalnız biçim düzeltmesi, adres kuralı değişmedi'

function defter(tarih: string | null): string {
  return tarih ? `# Adres defteri\n\n**Son doğrulama:** ${tarih}\n\nİçerik.\n` : '# Adres defteri\n\nİçerik.\n'
}

function karar(g: Partial<Girdi>): Sonuc {
  return kapi.degerlendir({ manifest: MANIFEST, degisenYollar: [], govde: '', yazar: 'insan', prAcilisGunu: '2026-11-09', bugun: '2026-11-09', defterMetinleri: {}, ...g })
}

/** Sabotaj denetimi için çekirdek kontroller: gerçek modül 0 hata verir, hatalı kopya >= 1 hata verir. */
function denetle(m: Kapi): string[] {
  const hata: string[] = []
  const g = (x: Partial<Girdi>): Sonuc => m.degerlendir({ manifest: MANIFEST, degisenYollar: [], govde: '', yazar: 'insan', prAcilisGunu: '2026-11-09', bugun: '2026-11-09', defterMetinleri: {}, ...x })
  const dene = (ad: string, ok: () => boolean) => {
    let sonuc = false
    try { sonuc = ok() } catch { sonuc = false }
    if (!sonuc) hata.push(ad)
  }
  dene('izlenen yol değişti, defter değişmedi -> uyarı', () => {
    const s = g({ degisenYollar: ['next.config.mjs'] })
    return s.durum === 'uyari' && s.ihlaller.some((i) => i.tur === 'defter-degismedi')
  })
  dene('geçerli istisna muaf eder', () => g({ degisenYollar: ['next.config.mjs'], govde: UYGUN_SEBEP }).durum === 'yesil')
  dene('kısa istisna ihlal', () => g({ degisenYollar: ['next.config.mjs'], govde: 'Defter-gerekmez: kısa' }).ihlaller.some((i) => i.tur === 'istisna-kisa'))
  dene('defter değişti ve tarih ilerledi -> yeşil', () =>
    g({ degisenYollar: ['next.config.mjs', URUN.dosya], defterMetinleri: { [URUN.dosya]: { onceki: defter('2026-11-01'), sonraki: defter('2026-11-09') } } }).durum === 'yesil')
  dene('tarih ilerlemedi -> ihlal', () =>
    g({ degisenYollar: ['next.config.mjs', URUN.dosya], defterMetinleri: { [URUN.dosya]: { onceki: defter('2026-11-09'), sonraki: defter('2026-11-09') } } }).ihlaller.some((i) => i.tur === 'son-dogrulama-ilerlemedi'))
  dene('bot muaf', () => g({ degisenYollar: ['next.config.mjs'], yazar: 'dependabot[bot]' }).durum === 'atlandi')
  dene('değişen dosya okunamadı -> ölçülemedi', () => g({ degisenYollar: null }).durum === 'olculemedi')
  dene('UYARI kipi kırmaz', () => m.cikisKodu(g({ degisenYollar: ['next.config.mjs'], kip: 'uyari' })) === 0)
  dene('UYARI kipinde ölçülemedi de kırmaz', () => m.cikisKodu(g({ degisenYollar: null, kip: 'uyari' })) === 0)
  dene('KIRMIZI kip kırar', () => m.cikisKodu(g({ degisenYollar: ['next.config.mjs'], kip: 'kirmizi' })) === 1)
  dene('KIRMIZI kipte ölçülemedi kırar', () => m.cikisKodu(g({ degisenYollar: null, kip: 'kirmizi' })) === 1)
  dene('manifest yok -> atlandı', () => g({ manifest: null, degisenYollar: ['next.config.mjs'] }).durum === 'atlandi')
  dene('emekli kayıt kapı dışı', () => g({ manifest: { defterler: [{ ...URUN, durum: 'emekli' }] }, degisenYollar: ['next.config.mjs'] }).durum === 'yesil')
  dene('planli kayıt kapı dışı', () => g({ manifest: { defterler: [{ ...URUN, durum: 'planli' }] }, degisenYollar: ['next.config.mjs'] }).durum === 'yesil')
  dene('ilgisiz PR yeşil', () => g({ degisenYollar: ['src/app/page.tsx'] }).durum === 'yesil')
  return hata
}

describe('INV-DEFTER-PR-KAPISI-1 · glob, istisna, tarih (saf)', () => {
  it('glob: tam yol, *, **, ? ve sondaki / dizin öneki', () => {
    expect(kapi.globEsle('next.config.mjs', 'next.config.mjs')).toBe(true)
    expect(kapi.globEsle('next.config.mjs', 'src/next.config.mjs')).toBe(false)
    expect(kapi.globEsle('scripts/seo/dizin-*.mjs', 'scripts/seo/dizin-takip.mjs')).toBe(true)
    expect(kapi.globEsle('scripts/seo/dizin-*.mjs', 'scripts/seo/alt/dizin-takip.mjs')).toBe(false)
    expect(kapi.globEsle('docs/seo/**', 'docs/seo/a/b/c.md')).toBe(true)
    expect(kapi.globEsle('docs/seo/', 'docs/seo/a.md')).toBe(true)
    expect(kapi.globEsle('docs/seo/**', 'docs/seo')).toBe(false)
    expect(kapi.globEsle('a?.ts', 'ab.ts')).toBe(true)
    expect(kapi.globEsle('a.b', 'aXb')).toBe(false) // nokta düz metin, her karakter DEĞİL
    expect(kapi.globEsle('docs\\seo\\x.md', 'docs/seo/x.md')).toBe(true) // ters eğik çizgi normalleşir
  })

  it('istisna: en az 20 karakter, kod çiti ve HTML yorumundaki satır sayılmaz, sebep metni sonuca yazılmaz', () => {
    expect(kapi.istisnaBul(UYGUN_SEBEP)).toMatchObject({ var: true, gecerli: true })
    expect(kapi.istisnaBul('Defter-gerekmez: kısa sebep')).toMatchObject({ var: true, gecerli: false })
    expect(kapi.istisnaBul('')).toMatchObject({ var: false, gecerli: false })
    expect(kapi.istisnaBul('```\n' + UYGUN_SEBEP + '\n```')).toMatchObject({ var: false })
    expect(kapi.istisnaBul('<!-- ' + UYGUN_SEBEP + ' -->')).toMatchObject({ var: false })
    expect(kapi.istisnaBul('  > **' + UYGUN_SEBEP)).toMatchObject({ var: true, gecerli: true }) // alıntı/kalın işaret önekleri hoşgörülür
    expect(kapi.istisnaBul('Metin Defter-gerekmez: satır ortasında geçen anahtar sayılmaz, sebep uzun olsa da')).toMatchObject({ var: false })
    const s = karar({ degisenYollar: ['next.config.mjs'], govde: UYGUN_SEBEP })
    expect(JSON.stringify(s)).not.toContain('biçim düzeltmesi')
  })

  it('Son doğrulama: kalın ya da düz, ğ ya da g, yoksa null', () => {
    expect(kapi.sonDogrulamaOku('**Son doğrulama:** 2026-11-09')).toBe('2026-11-09')
    expect(kapi.sonDogrulamaOku('Son doğrulama: 2026-11-09')).toBe('2026-11-09')
    expect(kapi.sonDogrulamaOku('- Son dogrulama: 2026-11-09')).toBe('2026-11-09')
    expect(kapi.sonDogrulamaOku('Son doğrulama: dün')).toBeNull()
    expect(kapi.sonDogrulamaOku('içerik')).toBeNull()
    expect(kapi.sonDogrulamaOku(null)).toBeNull()
  })
})

describe('INV-DEFTER-PR-KAPISI-1 · manifest şeması (plan §4.1)', () => {
  it('geçerli iki kayıt kapıya girer', () => {
    const a = kapi.manifestiAyikla(MANIFEST)
    expect(a.bozuk).toBe(false)
    expect(a.gecerli.map((k) => k.ad)).toEqual(['urun-adres', 'geo-seo-dizin'])
    expect(a.sorunlu).toEqual([])
  })

  it('geçersiz kayıt kapı dışı kalır ve ihlal olur: mutlak yol, .., boş izlenen, çıplak **, bilinmeyen durum, tekrarlı ad/dosya', () => {
    const kotu = [
      { ...URUN, ad: 'mutlak', dosya: 'docs/defter/m.md', izlenen: ['/etc/passwd'] },
      { ...URUN, ad: 'ust', dosya: 'docs/defter/u.md', izlenen: ['../disari'] },
      { ...URUN, ad: 'bos', dosya: 'docs/defter/b.md', izlenen: [] },
      { ...URUN, ad: 'cok-genis', dosya: 'docs/defter/g.md', izlenen: ['**'] },
      { ...URUN, ad: 'durum', dosya: 'docs/defter/d.md', durum: 'bilinmiyor' },
    ]
    const a = kapi.manifestiAyikla({ defterler: [...kotu, URUN, { ...GEO, dosya: URUN.dosya }, { ...URUN, ad: 'urun-adres', dosya: 'docs/defter/baska.md' }] })
    expect(a.sorunlu.map((s) => s.ad)).toEqual(expect.arrayContaining(['mutlak', 'ust', 'bos', 'cok-genis', 'durum']))
    expect(a.sorunlu.some((s) => s.sorunlar.includes('aynı dosya birden çok kayıtta'))).toBe(true)
    expect(a.sorunlu.some((s) => s.sorunlar.includes('ad tekrarlı'))).toBe(true)
    const s = karar({ manifest: { defterler: kotu }, degisenYollar: ['x'] })
    expect(s.ihlaller.filter((i) => i.tur === 'manifest-gecersiz')).toHaveLength(kotu.length)
  })

  it('geniş glob (eşikten çok dosya) kayıt dışı bırakılır', () => {
    const dosyalar = Array.from({ length: kapi.GENIS_GLOB_ESIGI + 1 }, (_, i) => `docs/buyuk/d${i}.md`)
    const a = kapi.manifestiAyikla({ defterler: [{ ...URUN, izlenen: ['docs/buyuk/**'] }] }, dosyalar)
    expect(a.gecerli).toHaveLength(0)
    expect(a.sorunlu[0]?.sorunlar.join(' ')).toContain('eşik')
    const dar = kapi.manifestiAyikla({ defterler: [{ ...URUN, izlenen: ['docs/buyuk/**'] }] }, dosyalar.slice(0, 10))
    expect(dar.gecerli).toHaveLength(1)
  })

  it('manifest kök yapısı bozuksa bozuk işaretlenir', () => {
    expect(kapi.manifestiAyikla({ defterler: 'x' }).bozuk).toBe(true)
    expect(kapi.manifestiAyikla(null).bozuk).toBe(true)
  })
})

describe('INV-DEFTER-PR-KAPISI-1 · gerçek manifest (PR #2440, sema:1)', () => {
  const gercek = {
    sema: 1,
    _not: 'x',
    defterler: [
      { ...URUN, ozet: 'Canlı adres şeması', durum: 'planli' },
      { ...GEO, ozet: 'Dizin takibi', disKaynak: 'gsc', durum: 'planli' },
    ],
  }

  it('ek alanlar (sema, ozet, _not) şemayı bozmaz; planli kayıtlar geçerli ama kapı dışıdır', () => {
    const a = kapi.manifestiAyikla(gercek)
    expect(a.sorunlu).toEqual([])
    expect(a.gecerli).toHaveLength(2)
    expect(karar({ manifest: gercek, degisenYollar: ['next.config.mjs'] })).toMatchObject({ durum: 'yesil', kapsam: { kontrolEdilen: 0 } })
  })

  it('aynı manifest pilot olunca kapı devreye girer', () => {
    const pilot = { ...gercek, defterler: gercek.defterler.map((k) => ({ ...k, durum: 'pilot' })) }
    expect(karar({ manifest: pilot, degisenYollar: ['next.config.mjs'] }).durum).toBe('uyari')
  })
})

describe('INV-DEFTER-PR-KAPISI-1 · karar', () => {
  it('çekirdek kontrol listesi gerçek modülde 0 hata verir', () => {
    expect(denetle(kapi)).toEqual([])
  })

  it('YAKALAR: izlenen yol değişti, defter değişmedi', () => {
    const s = karar({ degisenYollar: ['next.config.mjs', 'src/app/x.tsx'] })
    expect(s.durum).toBe('uyari')
    expect(s.ihlaller).toEqual([expect.objectContaining({ defter: 'urun-adres', tur: 'defter-degismedi' })])
    expect(s.kapsam).toMatchObject({ kesisen: 1, ihlalli: 1, uyumlu: 0 })
  })

  it('YAKALAR: iki defter, yalnız biri güncel', () => {
    const s = karar({
      degisenYollar: ['next.config.mjs', URUN.dosya, 'scripts/seo/dizin-takip.mjs'],
      defterMetinleri: { [URUN.dosya]: { onceki: defter('2026-11-01'), sonraki: defter('2026-11-09') } },
    })
    expect(s.ihlaller.map((i) => i.defter)).toEqual(['geo-seo-dizin'])
    expect(s.kapsam).toMatchObject({ kesisen: 2, uyumlu: 1, ihlalli: 1 })
  })

  it('GEÇİRİR: ilgisiz PR, güncel defter, geçerli istisna, bot, emekli kayıt, manifest yok', () => {
    expect(karar({ degisenYollar: ['src/app/x.tsx'] })).toMatchObject({ durum: 'yesil', neden: 'ilgisiz-pr' })
    expect(karar({ degisenYollar: ['next.config.mjs', URUN.dosya], defterMetinleri: { [URUN.dosya]: { onceki: null, sonraki: defter('2026-11-09') } } }).durum).toBe('yesil')
    const istisnali = karar({ degisenYollar: ['next.config.mjs'], govde: UYGUN_SEBEP })
    expect(istisnali).toMatchObject({ durum: 'yesil', kapsam: { muaf: 1 }, istisna: { kullanildi: true } })
    expect(karar({ degisenYollar: ['next.config.mjs'], yazar: 'dependabot[bot]' })).toMatchObject({ durum: 'atlandi', neden: 'bot' })
    expect(karar({ degisenYollar: ['next.config.mjs'], yazar: 'Renovate[bot]' }).durum).toBe('atlandi')
    expect(karar({ manifest: { defterler: [{ ...URUN, durum: 'emekli' }] }, degisenYollar: ['next.config.mjs'] }).durum).toBe('yesil')
    expect(karar({ manifest: null, degisenYollar: ['next.config.mjs'] })).toMatchObject({ durum: 'atlandi', neden: 'manifest-yok' })
  })

  it('istisna yalnız sebep uzunsa muaf eder; kısa istisna ayrıca ihlal sayılır', () => {
    const s = karar({ degisenYollar: ['next.config.mjs'], govde: 'Defter-gerekmez: kısa' })
    expect(s.ihlaller.map((i) => i.tur).sort()).toEqual(['defter-degismedi', 'istisna-kisa'])
  })

  it('tarih kuralı: yok, ilerlemedi, PR gününden geri, gelecek; yeni dosyada önceki tarih aranmaz', () => {
    const tur = (onceki: string | null, sonraki: string | null, ek: Partial<Girdi> = {}): string[] =>
      karar({ degisenYollar: ['next.config.mjs', URUN.dosya], defterMetinleri: { [URUN.dosya]: { onceki, sonraki } }, ...ek }).ihlaller.map((i) => i.tur)
    expect(tur(defter('2026-11-01'), defter(null))).toEqual(['son-dogrulama-yok'])
    expect(tur(defter('2026-11-09'), defter('2026-11-09'))).toEqual(['son-dogrulama-ilerlemedi'])
    expect(tur(defter('2026-11-09'), defter('2026-11-05'))).toEqual(['son-dogrulama-ilerlemedi'])
    expect(tur(defter('2026-10-01'), defter('2026-11-05'))).toEqual(['son-dogrulama-geri'])
    expect(tur(defter('2026-11-01'), defter('2026-11-12'))).toEqual(['son-dogrulama-gelecek'])
    expect(tur(null, defter('2026-11-09'))).toEqual([])
    expect(tur(defter('2026-11-01'), defter('2026-11-09'))).toEqual([])
  })

  it('tarih ihlali de geçerli istisnayla muaf olur (defter gerekmediyse tarih de gerekmez)', () => {
    const s = karar({ degisenYollar: ['next.config.mjs', URUN.dosya], govde: UYGUN_SEBEP, defterMetinleri: { [URUN.dosya]: { onceki: defter('2026-11-09'), sonraki: defter('2026-11-09') } } })
    expect(s.durum).toBe('yesil')
  })

  it('FAIL-CLOSED: değişen dosya listesi yok ya da manifest bozuk -> ölçülemedi', () => {
    expect(karar({ degisenYollar: null })).toMatchObject({ durum: 'olculemedi', neden: 'degisen-dosya-okunamadi' })
    expect(karar({ manifest: { bozuk: true }, degisenYollar: ['x'] })).toMatchObject({ durum: 'olculemedi', neden: 'manifest-bozuk' })
  })
})

describe('INV-DEFTER-PR-KAPISI-1 · kip, sayım satırı, kaçış', () => {
  it('UYARI kipi hiçbir durumda kırmaz; KIRMIZI kip ihlalde ve ölçülemedide kırar; bilinmeyen kip UYARI olur', () => {
    const ihlalli = { degisenYollar: ['next.config.mjs'] }
    expect(kapi.cikisKodu(karar({ ...ihlalli, kip: 'uyari' }))).toBe(0)
    expect(kapi.cikisKodu(karar({ degisenYollar: null, kip: 'uyari' }))).toBe(0)
    expect(kapi.cikisKodu(karar({ ...ihlalli, kip: 'kirmizi' }))).toBe(1)
    expect(kapi.cikisKodu(karar({ degisenYollar: null, kip: 'kirmizi' }))).toBe(1)
    expect(kapi.cikisKodu(karar({ degisenYollar: ['src/a.ts'], kip: 'kirmizi' }))).toBe(0)
    expect(karar({ ...ihlalli, kip: 'KIRMIZI-DEGIL' }).kip).toBe('uyari')
  })

  it('her koşu sabit anahtarlı tek sayım satırı yazar ve sebep metnini taşımaz', () => {
    const s = karar({ degisenYollar: ['next.config.mjs'], govde: UYGUN_SEBEP })
    const sayim = kapi.satirlar(s).filter((x) => x.startsWith('DEFTER_KAPISI '))
    expect(sayim).toHaveLength(1)
    const veri = JSON.parse(sayim[0].slice('DEFTER_KAPISI '.length))
    expect(veri).toMatchObject({ kip: 'uyari', durum: 'yesil', istisna: { var: true, gecerli: true, kullanildi: true } })
    expect(sayim[0]).not.toContain('biçim düzeltmesi')
  })

  it('ihlal ::warning (UYARI) ya da ::error (KIRMIZI) olur', () => {
    expect(kapi.satirlar(karar({ degisenYollar: ['next.config.mjs'] })).some((x) => x.startsWith('::warning '))).toBe(true)
    expect(kapi.satirlar(karar({ degisenYollar: ['next.config.mjs'], kip: 'kirmizi' })).some((x) => x.startsWith('::error '))).toBe(true)
  })

  it('açıklama kaçışı: yüzde, satır sonu ve :: iş akışı komutu enjeksiyonunu engeller', () => {
    const k = kapi.aciklamaKacis('a%b\nc\r::set-output name=x::1')
    expect(k).not.toMatch(/[\r\n]/)
    expect(k).not.toContain('::')
    expect(k).toContain('%25')
    expect(k).toContain('%0A')
    const zehirli = karar({ manifest: { defterler: [{ ...URUN, ad: 'x', dosya: 'docs/defter/x.md', izlenen: ['/mutlak'] }] }, degisenYollar: ['a'] })
    for (const satir of kapi.satirlar(zehirli)) expect(satir.split('\n')).toHaveLength(1)
  })

  it('adım özeti tablosu sayıları ve ihlal satırlarını yazar; | karakteri kaçar', () => {
    const t = kapi.ozetTablosu(karar({ degisenYollar: ['next.config.mjs'] }))
    expect(t).toContain('| 2 | 1 | 0 | 1 | 0 |')
    expect(t).toContain('defter-degismedi')
  })
})

describe('INV-DEFTER-PR-KAPISI-1 · main (ortam girişi)', () => {
  function bagKur(ek: Partial<Bag> = {}): { bag: Bag; cikti: string[]; ozet: string[] } {
    const cikti: string[] = []
    const ozet: string[] = []
    const bag: Bag = {
      okuManifest: () => MANIFEST,
      degisenYollar: () => ['next.config.mjs'],
      depoDosyalari: () => ['next.config.mjs'],
      okuSonraki: () => defter('2026-11-09'),
      okuOnceki: () => defter('2026-11-01'),
      yaz: (m) => cikti.push(m),
      ozetYaz: (_y, m) => ozet.push(m),
      simdi: () => new Date('2026-11-09T10:00:00Z'),
      ...ek,
    }
    return { bag, cikti, ozet }
  }

  it('PR dışı koşu (PR_YAZAR yok): atlanır, çıkış 0', () => {
    const { bag, cikti } = bagKur()
    expect(kapi.main({}, bag)).toBe(0)
    expect(cikti.join('\n')).toContain('"neden":"pr-degil"')
  })

  it('UYARI kipinde ihlal: uyarı satırı, çıkış 0, özet yazılır', () => {
    const { bag, cikti, ozet } = bagKur()
    expect(kapi.main({ PR_YAZAR: 'insan', PR_GOVDE: '', PR_ACILIS: '2026-11-09T08:00:00Z', GITHUB_STEP_SUMMARY: 'ozet.md', DEFTER_KAPISI_KIP: 'uyari' }, bag)).toBe(0)
    expect(cikti.some((x) => x.startsWith('::warning '))).toBe(true)
    expect(ozet.join('')).toContain('Defter PR kapısı')
  })

  it('KIRMIZI kipte ihlal çıkış 1; ortam değişkeni verilmezse varsayılan UYARI', () => {
    const girdi = { PR_YAZAR: 'insan', PR_GOVDE: '', PR_ACILIS: '2026-11-09T08:00:00Z' }
    expect(kapi.main({ ...girdi, DEFTER_KAPISI_KIP: 'kirmizi' }, bagKur().bag)).toBe(1)
    expect(kapi.main({ ...girdi }, bagKur().bag)).toBe(0)
    expect(kapi.main({ ...girdi, DEFTER_KAPISI_KIP: 'kirmizi' }, bagKur({ degisenYollar: () => ['src/a.ts'] }).bag)).toBe(0)
  })

  it('defter da değişince eski ve yeni metni okur: tarih ilerlemişse yeşil', () => {
    const { bag, cikti } = bagKur({ degisenYollar: () => ['next.config.mjs', URUN.dosya] })
    expect(kapi.main({ PR_YAZAR: 'insan', PR_ACILIS: '2026-11-09T08:00:00Z', DEFTER_KAPISI_KIP: 'kirmizi' }, bag)).toBe(0)
    expect(cikti.join('\n')).toContain('"durum":"yesil"')
  })

  it('çökme ve okuma hataları ölçülemedi olur, UYARI kipinde çıkış 0, KIRMIZI kipte 1', () => {
    const girdi = { PR_YAZAR: 'insan', PR_ACILIS: '2026-11-09T08:00:00Z' }
    const fırlat = (): never => { throw new Error('boom') }
    const bozukManifest = bagKur({ okuManifest: fırlat })
    expect(kapi.main({ ...girdi }, bozukManifest.bag)).toBe(0)
    expect(bozukManifest.cikti.join('\n')).toContain('manifest-bozuk')
    expect(kapi.main({ ...girdi, DEFTER_KAPISI_KIP: 'kirmizi' }, bagKur({ okuManifest: fırlat }).bag)).toBe(1)
    const degisenYok = bagKur({ degisenYollar: fırlat })
    expect(kapi.main({ ...girdi }, degisenYok.bag)).toBe(0)
    expect(degisenYok.cikti.join('\n')).toContain('degisen-dosya-okunamadi')
    expect(kapi.main({ ...girdi, DEFTER_KAPISI_KIP: 'kirmizi' }, bagKur({ degisenYollar: fırlat }).bag)).toBe(1)
    expect(kapi.main({ ...girdi }, bagKur({ simdi: fırlat }).bag)).toBe(0) // beklenmeyen hata: ic-hata
  })

  it('manifest yoksa (null) kapı atlanır, çıkış 0 (KIRMIZI kipte bile)', () => {
    const { bag, cikti } = bagKur({ okuManifest: () => null })
    expect(kapi.main({ PR_YAZAR: 'insan', DEFTER_KAPISI_KIP: 'kirmizi' }, bag)).toBe(0)
    expect(cikti.join('\n')).toContain('manifest-yok')
  })
})

describe('INV-DEFTER-PR-KAPISI-1 · ci.yml bağlantısı', () => {
  const yml = readFileSync(CI_YOLU, 'utf8').replace(/\r\n/g, '\n')
  const satirlar = yml.split('\n')
  const bas = satirlar.findIndex((s) => /^\s+- name:/.test(s) && s.includes('Defter PR kapısı'))
  const sonraki = satirlar.findIndex((s, i) => i > bas && /^\s+- name:/.test(s))
  const blok = bas < 0 ? [] : satirlar.slice(bas, sonraki < 0 ? undefined : sonraki)
  const yorumsuz = blok.filter((s) => !/^\s*#/.test(s)).join('\n')

  it('adım var, PR kayıt kapısından SONRA gelir, betik var', () => {
    expect(bas).toBeGreaterThan(-1)
    const kayit = satirlar.findIndex((s) => /^\s+- name:/.test(s) && s.includes('PR kayıt kapısı'))
    expect(kayit).toBeGreaterThan(-1)
    expect(bas).toBeGreaterThan(kayit)
    expect(yorumsuz).toContain('run: node scripts/ci/defter-pr-kapisi.cjs')
    expect(readFileSync(KAPI_YOLU, 'utf8')).toContain('main(')
  })

  it('yalnız pull_request olayında koşar ve BLOKLAMAZ (continue-on-error), kip uyari', () => {
    expect(yorumsuz).toContain("if: github.event_name == 'pull_request'")
    expect(yorumsuz).toContain('continue-on-error: true')
    expect(yorumsuz).toMatch(/DEFTER_KAPISI_KIP:\s*uyari\s*$/m)
  })

  it('PR gövdesi ve yazar yalnız env altında; run satırında ${{ }} yok; ci işine pull-requests: write girmedi', () => {
    const runSatiri = yorumsuz.split('\n').filter((s) => /^\s+run:/.test(s)).join('\n')
    expect(runSatiri).not.toContain('${{')
    expect(yorumsuz).toContain('PR_GOVDE: ${{ github.event.pull_request.body }}')
    expect(yorumsuz).toContain('PR_YAZAR: ${{ github.event.pull_request.user.login }}')
    expect(yorumsuz).toContain('PR_ACILIS: ${{ github.event.pull_request.created_at }}')
    expect(yorumsuz).not.toContain('secrets.')
    const yorumsuzYml = satirlar.filter((s) => !/^\s*#/.test(s)).join('\n')
    expect(yorumsuzYml).not.toMatch(/pull-requests:\s*write/)
  })
})

describe('INV-DEFTER-PR-KAPISI-1 · SABOTAJ (her hatalı kopya en az bir kontrolü kırar)', () => {
  const kaynak = readFileSync(KAPI_YOLU, 'utf8')
  const gecici = mkdtempSync(path.join(tmpdir(), 'defter-kapi-'))
  afterAll(() => rmSync(gecici, { recursive: true, force: true }))

  const SABOTAJLAR: { ad: string; eski: string; yeni: string }[] = [
    { ad: 'defter değişmedi yakalanmaz', eski: 'if (!dokunuldu) {', yeni: 'if (false) {' },
    { ad: 'istisna her şeyi muaf eder', eski: 'if (istisna.gecerli) { kapsam.muaf++; istisnaKullanildi = true; continue; }\n      kapsam.ihlalli++;\n      ihlaller.push({ defter: k.ad, tur: \'defter-degismedi\'', yeni: 'if (true) { kapsam.muaf++; istisnaKullanildi = true; continue; }\n      kapsam.ihlalli++;\n      ihlaller.push({ defter: k.ad, tur: \'defter-degismedi\'' },
    { ad: 'tarih ilerlemedi geçer (<= yerine <)', eski: 'yeni <= eski', yeni: 'yeni < eski' },
    { ad: 'bot muaf değil', eski: "BOT_YAZARLAR.has(String(girdi.yazar || '').toLowerCase())", yeni: 'false' },
    { ad: 'UYARI kipi de kırar', eski: "if (s.kip !== 'kirmizi') return 0;", yeni: '' },
    { ad: 'ölçülemedi yeşil sayılır', eski: "return sonuc('olculemedi', 'degisen-dosya-okunamadi', { istisna });", yeni: "return sonuc('yesil', 'x');" },
    { ad: 'istisna sebebi uzunluğa bakmaz', eski: 'const ISTISNA_MIN_SEBEP = 20;', yeni: 'const ISTISNA_MIN_SEBEP = 1;' },
    { ad: 'emekli/planlı kayıt kapıya girer', eski: 'if (ATLANAN_DURUMLAR.includes(k.durum)) continue;', yeni: '' },
    { ad: 'manifest yokken kırar', eski: "return sonuc('atlandi', 'manifest-yok');", yeni: "return sonuc('olculemedi', 'manifest-yok');" },
  ]

  it('gerçek kaynak 0 hata verir (sabotaj denetiminin kontrol kolu)', () => {
    expect(denetle(kapi)).toEqual([])
  })

  for (const [i, s] of SABOTAJLAR.entries()) {
    it(`sabotaj: ${s.ad}`, () => {
      expect(kaynak.split(s.eski).length - 1, `kaynakta "${s.ad}" için hedef metin tam bir kez geçmeli`).toBe(1)
      const yol = path.join(gecici, `sabotaj-${i}.cjs`)
      writeFileSync(yol, kaynak.replace(s.eski, s.yeni))
      const hatali: Kapi = req(yol)
      expect(denetle(hatali).length, `sabotaj "${s.ad}" hiçbir kontrolü kırmadı`).toBeGreaterThan(0)
    })
  }
})
