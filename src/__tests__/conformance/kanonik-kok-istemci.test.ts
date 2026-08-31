/**
 * INV-KANONIK-KOK-1 — `'use client'` dosyalar `config/siteUrl`'i DOĞRUDAN kullanamaz.
 *
 * NİÇİN (REC-100, 2026-08-31): `src/config/siteUrl.ts`'nin kendi başlığı bu kuralı
 * kelimesi kelimesine yazıyordu — "istemci bileşenlerinde kullanılırsa `localhost`'a
 * düşülür, o yüzden istemcide kullanma" — ama kuralı zorlayan HİÇBİR kapı yoktu.
 * Sonucu canlıda ölçüldü: `Seo.tsx` (bir `'use client'` bileşeni) `SITE_URL` okuyordu ve
 * her ürün/marka sayfasında ikinci bir `canonical` + `og:url` + `og:image`
 * `http://localhost:3000` gösteriyordu; marka sayfasında ÜÇ canonical vardı.
 * `Breadcrumb.tsx` ise aynı değeri BreadcrumbList yapısal verisine yazıyordu.
 *
 * Kusuru hiçbir mevcut kapı göremezdi: `tsc` için `string` `string`'dir, `lint` bir
 * import'u yasaklamıyordu, testler SSR çıktısına bakıyordu — ve SSR çıktısı DOĞRUYDU.
 * Yanlış değer yalnız hidrasyondan sonra, tarayıcıda beliriyordu.
 *
 * ÖLÇÜT NEDEN AST DEĞİL, DÜZ ARAMA DEĞİL: import ifadesi yapısal olarak sabit bir
 * kalıp; ama yorum içinde de aynı yol geçiyor (bu dosyanın kendisi dahil). Bu yüzden
 * yalnız `import ... from '<yol>'` biçimi eşleniyor, yorum satırları elenmiyor —
 * yorumda `from` + tırnak dizilimi bulunmadığı için doğal olarak kapsam dışında kalır.
 */
import { readdirSync,readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect,it } from 'vitest'

const KOK = join(process.cwd(), 'src')

/** `config/siteUrl` import'u — göreli ya da alias, tek tırnak ya da çift. */
const SITEURL_IMPORT = /import\s+[^;]*?from\s+['"][^'"]*config\/siteUrl['"]/

/** Yardımcının kendisi MUAF: sunucu/istemci ayrımını yapan yer tam orasıdır. */
const MUAF = ['lib/seo/canonicalOrigin.ts']

/**
 * `src/` altındaki tüm kaynak dosyaları toplar. `glob` paketi bilerek KULLANILMADI:
 * depoda bağımlılık olarak yok ve bir konformans testi için yeni paket eklemek,
 * kapının maliyetini ölçtüğü kusurun üstüne çıkarır.
 */
const kaynakDosyalari = (dizin: string): string[] => {
  const cikti: string[] = []
  for (const girdi of readdirSync(dizin, { withFileTypes: true })) {
    const tam = join(dizin, girdi.name)
    if (girdi.isDirectory()) {
      if (girdi.name === '__tests__' || girdi.name === 'node_modules') continue
      cikti.push(...kaynakDosyalari(tam))
    } else if (/\.tsx?$/.test(girdi.name) && !/\.(test|spec)\.tsx?$|\.d\.ts$/.test(girdi.name)) {
      cikti.push(tam)
    }
  }
  return cikti
}

const istemciDosyalari = (): string[] =>
  kaynakDosyalari(KOK).filter(dosya => {
    // `'use client'` yönergesi dosyanın BAŞINDA olmak zorundadır; ilk 200 bayta bakmak
    // hem yeterli hem de gövdedeki bir dizeyi yanlışlıkla eşlemeyi önler.
    const ilkSatirlar = readFileSync(dosya, 'utf8').slice(0, 200)
    return /^\s*['"]use client['"]/m.test(ilkSatirlar)
  })

describe('INV-KANONIK-KOK-1', () => {
  const istemciler = istemciDosyalari()

  it('taramanın kendisi çalışıyor: en az bir istemci dosyası bulundu', () => {
    // Vacuous-guard: glob deseni ya da `'use client'` sezimi bozulursa aşağıdaki
    // asıl iddia BOŞ küme üzerinde koşup sessizce yeşil kalırdı.
    expect(istemciler.length).toBeGreaterThan(10)
  })

  it("hiçbir 'use client' dosyası config/siteUrl'i doğrudan import etmiyor", () => {
    const ihlal = istemciler
      .filter(dosya => {
        const goreli = relative(KOK, dosya).replace(/\\/g, '/')
        if (MUAF.includes(goreli)) return false
        return SITEURL_IMPORT.test(readFileSync(dosya, 'utf8'))
      })
      .map(dosya => relative(KOK, dosya).replace(/\\/g, '/'))

    expect(ihlal).toEqual([])
  })

  it('sunucu metadata\'sı olan sayfalar <Seo> ile İKİNCİ kez yazmıyor', () => {
    // REC-100'ün ikinci yarısı: origin doğru olsa bile AYNI sayfada iki canonical
    // yazıcısı olması başlı başına kusurdur — arama motoru çelişen canonical'da
    // ikisini de yok sayabilir. `generateMetadata`'sı olan rotanın görünümü `<Seo>`
    // KULLANMAZ. (Metadata'sı OLMAYAN sayfalarda `<Seo>` tek kaynaktır ve kalır.)
    const ciftYazici: string[] = []
    const kontroller: [string, string][] = [
      ['app/[lang]/products/[slug]/page.tsx', 'app/_components/ProductDetailPageView.tsx'],
      ['app/[lang]/brands/[slug]/page.tsx', 'views/BrandDetailPage.tsx'],
    ]
    for (const [rota, gorunum] of kontroller) {
      const rotaKaynak = readFileSync(join(KOK, rota), 'utf8')
      if (!rotaKaynak.includes('generateMetadata')) continue
      const gorunumKaynak = readFileSync(join(KOK, gorunum), 'utf8')
      // ÖLÇÜT IMPORT'TUR, JSX ETİKETİ DEĞİL. İlk yazdığımda `<Seo` arıyordum ve kapı
      // KENDİ AÇIKLAMA YORUMUMU yakaladı ("<Seo> KALDIRILDI" cümlesini). Import satırı
      // yorumda geçmez ve bileşen import edilmeden kullanılamaz — hem daha dar hem daha
      // sağlam ölçüt. (Aynı sınıf: metin taraması yorumla tatmin olur.)
      if (/^\s*import\s+Seo\s+from/m.test(gorunumKaynak)) ciftYazici.push(gorunum)
    }
    expect(ciftYazici).toEqual([])
  })

  it('ölçüt gerçekten ayırt ediyor: muaf yardımcı import ediyor OLMALI', () => {
    // Negatif kontrol. Kural "kimse import etmesin" değil; "istemci dosyaları
    // etmesin, ayrımı yapan TEK yer etsin". Yardımcı import'u bırakırsa kural
    // anlamını yitirir ve bu kapı da hiçbir şey ölçmez olur.
    const yardimci = readFileSync(join(KOK, 'lib', 'seo', 'canonicalOrigin.ts'), 'utf8')
    expect(SITEURL_IMPORT.test(yardimci)).toBe(true)
  })
})
