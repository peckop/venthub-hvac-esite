import { describe, expect, it } from 'vitest'

/**
 * INV-2 · Localized-route SSOT conformance (kalıcı bekçi).
 *
 * Kullanıcıya görünen TÜM navigasyon URL'leri dil önekini SSOT üzerinden almalı:
 *   • client bileşeni  → useLocalizedRoutes() proxy'si (Routes.x() çağrısı /tr|/en önekli döner)
 *   • RSC / paylaşılan render (Breadcrumb gibi) → localizedHref(url, lang)  — src/utils/routes.ts
 *
 * Bu testin hedefi iki kaçak deseni (yalnız components/ + views/ render katmanı taranır):
 *   1. ELLE DİL ÖNEKİ: `/${lang}/...` veya `/${locale}/...` birleştirme. localizedHref dururken
 *      elle önek = SSOT kaçağı; biri tr/en dalını unutursa link sessizce kırılır
 *      (2026-06 anasayfa kategori + CookieConsent bug sınıfı tam buydu).
 *   2. SABİT APP-YOLU LITERAL'İ: href:/to: '/category|/products|/account|...' — hem Routes
 *      builder'ını hem dil önekini atlar; dilsiz URL render eder ve /[lang] segmentine uymaz.
 *
 * Meşru altyapı (middleware locale-routing, sitemap + canonical SEO URL'leri, Routes/localizedHref
 * tanımının kendisi) components/ + views/ DIŞINDA yaşadığından kapsam dışıdır — kapı yalnız render
 * katmanını tarar, böylece SEO/altyapı URL'lerinde yanlış-pozitif üretmez.
 *
 * NOT: Kaynağı Vite'ın import.meta.glob('?raw')'ı ile okuyoruz (INV-1 ile aynı sebep — node 'fs'
 * tipleri bu projede tsc'de çözülmüyor). Yorumlar taranmadan silinir → açıklayıcı örnek desenler
 * bekçiyi tetiklemez.
 */

// import.meta.glob'u Vite birebir yazıldığında derler; vite/client tipleri yüklü
// olmadığından imzayı yerel olarak bildiriyoruz.
declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SOURCES: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// Yalnız UI render katmanı: navigasyon href'leri burada yaşar.
const SCOPE = ['components/', 'views/']

/**
 * ⭐ ALTYAPI KATMANI (D3, 2026-08-17 · render denetimi K7'nin işaret ettiği boşluk).
 *
 * `SCOPE` yalnız render katmanını tarıyordu; `app/`, `utils/`, `lib/` kapsam DIŞIYDI.
 * Denetimin tespiti buydu ve haklıydı: K2 (webhook'un TR kategori yollarını hiç
 * tazelememesi) TAM bu boşlukta yaşadı, hiçbir kapı görmedi.
 *
 * ÖNCE ÖLÇTÜM (ölçmeden kural yazmamak için): bu üç katmanda **46 isabet / 11 dosya**
 * var ve BUGÜN HEPSİ MEŞRU — locale-routing altyapısı, SEO kanonik URL'leri, sunucu
 * `permanentRedirect`'leri, webhook `revalidatePath`'i ve `utils/routes.ts`'in KENDİSİ.
 * Yani bu genişletme bugün sıfır kaçak buluyor.
 *
 * O HÂLDE NİÇİN: kapının işi bugünkü ihlali bulmak değil, YARINKİNİ engellemek.
 * 11 dosya ADLA muaf; listede olmayan bir `app/`/`utils/`/`lib/` dosyası elle dil
 * öneki kurarsa kapı kırmızı yanar. Liste sessizce büyüyemez — her satır gerekçeli.
 */
const INFRA_SCOPE = ['app/', 'utils/', 'lib/']

/**
 * Altyapıda dil öneki İKİ biçimde kurulur ve ikisi de sayılmalı:
 *   - şablon:  `/${lang}/...`  → `MANUAL_LANG_PREFIX`
 *   - LİTERAL: `'/tr/...'` / `"/en/..."` → aşağıdaki desen
 * Bunu bayatlık testi ortaya çıkardı: webhook allowlist'teydi ama şablon biçimini
 * kullanmadığı için desene HİÇ takılmıyordu, yani muafiyet boşa yazılmıştı ve o
 * dosyada gerçek bir literal `/tr/` kullanımı kapının dışında kalıyordu.
 * (Aynı ders bugün ikinci kez: bir kuralın iki yazım biçimi = iki ayrı kapsam.)
 */
const LITERAL_LANG_PREFIX = /['"`]\/(?:tr|en)\//

const INFRA_ALLOWLIST = new Set<string>([
  // Dil önekini KURAN altyapının kendisi.
  'utils/routes.ts',
  // SEO yüzeyleri: kanonik/alternate URL'ler mutlak ve dil-açık olmak ZORUNDA.
  'app/sitemap.ts',
  'app/[lang]/page.tsx',
  'lib/seo/jsonld.ts',
  // Sunucu tarafı yönlendirme: locale zaten segmentten çözülü, `useLocalizedRoutes`
  // bir React hook'u olduğu için burada kullanılamaz.
  'app/auth/callback/route.ts',
  'app/auth/signout/route.ts',
  'app/[lang]/category/[categorySlug]/page.tsx',
  'app/[lang]/category/[categorySlug]/[subCategorySlug]/page.tsx',
  'app/[lang]/products/[slug]/page.tsx',
  // `revalidatePath` literal yol ister (Next sözleşmesi).
  // ⚠️ NOT: bu dosyanın TR yollarını KANONİK slug'la kurması AYRI bir kusurdur
  // (render denetimi K2, Dalga-1'de düzeltilecek). Buradaki muafiyet onu AKLAMAZ,
  // yalnız "bu kapının konusu değil" der — muafiyet, kusuru görünmez yapmamalı.
  'app/api/webhook/supabase/route.ts',
])

// 1) Elle `/${lang}` / `/${locale}` dil-öneki birleştirme.
const MANUAL_LANG_PREFIX = /\/\$\{\s*(?:lang|locale)\s*\}/

// 2) href:/to:/href= ile sabit app-yolu literal'i (Routes + localize atlanmış).
const HARDCODED_APP_PATH =
  /\b(?:href|to)\s*[:=]\s*\{?\s*['"`]\/(?:category|products|account|legal|brands|checkout|cart|destek|contact|about|auth)\b/

// 3) Ham Routes importu (utils/routes'tan { Routes }) AMA localize sarmalayıcı YOK.
//    Client'ta Routes.x() dilsiz URL döndürür; useLocalizedRoutes proxy'si ya da localizedHref
//    olmadan render edilirse dil öneki kaybolur (middleware redirect'e bel bağlar = fazladan hop + drift).
const RAW_ROUTES_IMPORT = /import\s*\{[^}]*\bRoutes\b[^}]*\}\s*from\s*['"][^'"]*utils\/routes['"]/
const HAS_LOCALIZER = /\b(?:localizedHref|useLocalizedRoutes)\b/
// İstisna: /admin rotaları dil-öneki ALMAZ (localizeUrl admin'i atlar); R3F bileşeni React
// context'i Canvas sınırını geçmediğinden hook kullanamaz (programatik push redirect'le çalışır).
const RAW_ROUTES_ALLOWLIST = [
  'components/admin/',
  'views/admin/',
  'components/products/BentPlaneGeometry.tsx',
]

/** Yorumları siler ki açıklayıcı yorumlardaki örnek desenler bekçiyi tetiklemesin. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '') // blok yorum
    .replace(/(^|[^:])\/\/.*$/gm, '$1') // satır yorum ("http://" gibi şemaları koru)
}

function toRelPath(globKey: string): string {
  const marker = '/src/'
  const idx = globKey.indexOf(marker)
  return (idx >= 0 ? globKey.slice(idx + marker.length) : globKey).replace(/\\/g, '/')
}

describe('INV-2 · localized-route SSOT conformance', () => {
  it('navigasyon URL leri SSOT ile localize edilmeli (elle önek / sabit app-yolu yasak)', () => {
    const manualPrefix: string[] = []
    const hardcodedPath: string[] = []

    for (const [key, source] of Object.entries(SOURCES)) {
      const rel = toRelPath(key)
      if (rel.endsWith('.d.ts') || rel.includes('__tests__') || rel.includes('.test.')) continue
      if (!SCOPE.some((s) => rel.startsWith(s))) continue

      const clean = stripComments(source)
      if (MANUAL_LANG_PREFIX.test(clean)) manualPrefix.push(rel)
      if (HARDCODED_APP_PATH.test(clean)) hardcodedPath.push(rel)
    }

    expect(
      { manualPrefix, hardcodedPath },
      `SSOT-dışı navigasyon URL'i bulundu — localizedHref / useLocalizedRoutes kullan:\n` +
        `  elle dil öneki : ${manualPrefix.join('\n                   ') || '—'}\n` +
        `  sabit app-yolu : ${hardcodedPath.join('\n                   ') || '—'}`,
    ).toEqual({ manualPrefix: [], hardcodedPath: [] })
  })

  /**
   * D3 — ALTYAPI KATMANI: `app/` + `utils/` + `lib/` içinde elle dil öneki yalnız
   * ADLA muaf dosyalarda olabilir. Render katmanı (yukarıdaki test) sıfır kaçakla
   * temiz; bu test o temizliği altyapıya taşır ve YENİ kaçağı engeller.
   */
  it('altyapı katmanında elle dil öneki yalnız ADLA muaf dosyalarda olabilir', () => {
    const offenders: string[] = []

    for (const [key, source] of Object.entries(SOURCES)) {
      const rel = toRelPath(key)
      if (rel.endsWith('.d.ts') || rel.includes('__tests__') || rel.includes('.test.')) continue
      if (!INFRA_SCOPE.some((s) => rel.startsWith(s))) continue
      if (INFRA_ALLOWLIST.has(rel)) continue

      const clean = stripComments(source)
      if (MANUAL_LANG_PREFIX.test(clean) || LITERAL_LANG_PREFIX.test(clean)) offenders.push(rel)
    }

    expect(
      offenders,
      'Altyapı katmanında SSOT-dışı dil öneki — `localizedHref` kullan ya da meşruysa ' +
        'INFRA_ALLOWLIST\'e GEREKÇESİYLE ekle:\n  ' + offenders.join('\n  '),
    ).toEqual([])
  })

  /**
   * Muafiyet listesi bayatlamasın: dosya silinir ya da dil önekini bırakırsa satır
   * SİLİNMELİ. Aksi halde liste sessizce kalıcılaşır ve kapı o dosyayı sonsuza dek görmez.
   */
  it('INFRA_ALLOWLIST bayat değil (dil önekini bırakan dosya listede kalmamalı)', () => {
    const stale: string[] = []

    for (const allowed of INFRA_ALLOWLIST) {
      const entry = Object.entries(SOURCES).find(([k]) => toRelPath(k) === allowed)
      if (!entry) {
        stale.push(`${allowed} (dosya artık yok)`)
        continue
      }
      const clean = stripComments(entry[1])
      if (!MANUAL_LANG_PREFIX.test(clean) && !LITERAL_LANG_PREFIX.test(clean)) {
        stale.push(`${allowed} (artık elle dil öneki kurmuyor — listeden SİL)`)
      }
    }

    expect(stale, `INFRA_ALLOWLIST bayat:\n  ${stale.join('\n  ')}`).toEqual([])
  })

  it('client/RSC nav bileşeni ham Routes değil localize SSOT kullanmalı', () => {
    const offenders: string[] = []

    for (const [key, source] of Object.entries(SOURCES)) {
      const rel = toRelPath(key)
      if (rel.endsWith('.d.ts') || rel.includes('__tests__') || rel.includes('.test.')) continue
      if (!SCOPE.some((s) => rel.startsWith(s))) continue
      if (RAW_ROUTES_ALLOWLIST.some((a) => rel.startsWith(a))) continue

      const clean = stripComments(source)
      if (RAW_ROUTES_IMPORT.test(clean) && !HAS_LOCALIZER.test(clean)) offenders.push(rel)
    }

    expect(
      offenders,
      `Ham Routes (dilsiz) kullanan nav bileşeni — useLocalizedRoutes() ya da localizedHref kullan:\n  ${offenders.join('\n  ')}`,
    ).toEqual([])
  })
})
