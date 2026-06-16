import { describe, expect, it } from 'vitest'

import { tr } from '../../i18n/dictionaries/tr'
import { getDictValue } from '../../i18n/getDictValue'

/**
 * INV-5 · i18n key-resolution conformance (kalıcı bekçi).
 *
 * Kullanıcıya görünen her statik `t('a.b.c')` çağrısının anahtarı sözlükte (SSOT: tr)
 * ÇÖZÜLMELİ. VentHub çözücüsü `getDictValue` NESTED-ONLY'dir: `path.split('.')` yapıp iç içe
 * objelerde iner, bulamazsa **ham path** döner → UI'da ham anahtar render eder (sessiz bug).
 *
 * Bu sınıfı mevcut hiçbir gate yakalamaz:
 *   • tsc — çözücü her zaman string döner (gevşek tip),
 *   • lint — literal sözlükte ama erişilemez,
 *   • test:i18n parity — tr & en AYNI kırık anahtarı taşır → parity GEÇER,
 *   • build — tip hatası yok.
 * Yalnız bu keycheck yakalar: kaynak taranır, her statik `t()` anahtarı gerçek çözücüyle
 * doğrulanır; `getDictValue(tr, key) === key` (ham döndü) ise FAIL.
 *
 * Sınıf örneği (PR#362, Antigravity admin merge): düz noktalı anahtar `'table.productCol'`
 * (nested `table` objesi dururken) → çözücü `table`'a inip `productCol` bulamaz → ham.
 * KURAL: yeni anahtar ya **tek-segment düz** (`'pageTitle'`) ya **gerçek nested** olmalı;
 * içinde-nokta düz anahtar (`'table.x'`) YASAK.
 *
 * Kapsam: yalnız STATİK string anahtar (≥2 segment). Dinamik anahtar (template literal /
 * değişken / `'prefix.' + x` concat) statik doğrulanamaz → bilinçle atlanır (sessiz cap değil).
 */

// import.meta.glob'u Vite birebir yazıldığında derler; vite/client tipleri yüklü değil.
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

// Render + etkileşim katmanı: t() çağrıları burada yaşar.
const SCOPE = ['components/', 'views/', 'app/', 'hooks/']

// t('a.b.c') / t("a.b.c") — kapanış tırnağı anahtardan HEMEN sonra gelmeli (\1).
// En az 2 segment (namespaced) ister; template literal t(`...`) ve t(değişken) yakalanmaz.
const T_CALL = /\bt\(\s*(['"])([A-Za-z][\w]*(?:\.[\w]+)+)\1/g

/** Yorumları siler ki commentlenmiş örnek t() çağrıları bekçiyi tetiklemesin. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function toRelPath(globKey: string): string {
  const marker = '/src/'
  const idx = globKey.indexOf(marker)
  return (idx >= 0 ? globKey.slice(idx + marker.length) : globKey).replace(/\\/g, '/')
}

/**
 * RATCHET (debt freeze): 2026-06-16'da master'da çözülmeyen anahtarlar. admin literal
 * batch (PR#364) bunlardan 15'ini (6 admin + 6 common + 3 products) çözdü → buradan SİLİNDİ
 * (ratchet 32→17 sıkıştı). Kalan 17 GERÇEK pre-existing bug — tek tek düzeltilip buradan
 * SİLİNECEK. YENİ entry EKLEME: yeni çözülmeyen anahtar = anahtarı düzelt, allowlist'leme.
 * (Aşağıdaki ikinci test, düzelen bir anahtar hâlâ listede kalırsa uyarır → liste bayatlamaz.)
 */
const KNOWN_UNRESOLVED = new Set<string>([
  'brands.title',
  'cart.errors.paymentError',
  'category.filters.title',
  'category.noProductsFound',
  'category.productsCount',
  'category.sort.name',
  'category.sort.priceHigh',
  'category.sort.priceLow',
  'category.sort.title',
  'category.view.grid',
  'category.view.list',
  'checkout.errors.emailInvalid',
  'checkout.errors.locationRequired',
  'orders.fetchError',
  'pdp.details',
  'product.starting_from',
  'series.premium_desc',
])

describe('INV-5 · i18n key-resolution conformance', () => {
  it("her statik t('...') anahtarı sözlükte çözülmeli (ham-key render yasak)", () => {
    const unresolved: { file: string; key: string }[] = []
    const seen = new Set<string>()

    for (const [globKey, source] of Object.entries(SOURCES)) {
      const rel = toRelPath(globKey)
      if (rel.endsWith('.d.ts') || rel.includes('__tests__') || rel.includes('.test.')) continue
      if (rel.startsWith('i18n/')) continue // sözlük + çözücü altyapısı (kendini tarama)
      if (!SCOPE.some((s) => rel.startsWith(s))) continue

      const clean = stripComments(source)
      let m: RegExpExecArray | null
      T_CALL.lastIndex = 0
      while ((m = T_CALL.exec(clean)) !== null) {
        const key = m[2]
        const after = clean.slice(m.index + m[0].length).trimStart()
        // Dinamik concat: `t('prefix.' + x)` → atla.
        if (after.startsWith('+')) continue
        // Alt-string fallback: `t('key', 'Görünür Metin')` → app miss'te alt'ı döndürür
        // (I18nProvider t(): hasTranslation false & paramsOrAlt string ise paramsOrAlt).
        // Bu graceful → görünür bug değil → atla. (Obje param `, { x }` atlanmaz.)
        if (/^,\s*['"]/.test(after)) continue

        const dedup = `${rel}::${key}`
        if (seen.has(dedup)) continue
        seen.add(dedup)

        if (getDictValue(tr, key) === key) {
          unresolved.push({ file: rel, key })
        }
      }
    }

    const offenders = unresolved.filter((u) => !KNOWN_UNRESOLVED.has(u.key))
    const offenderKeys = [...new Set(offenders.map((u) => u.key))].sort()

    expect(
      offenders,
      `Sözlükte ÇÖZÜLMEYEN yeni t() anahtarı (ham-key render = bug).\n` +
        `Düzelt: anahtar tek-segment düz ya da gerçek nested olmalı (içinde-nokta düz YASAK).\n` +
        `<<<KEYS\n${offenderKeys.join('\n')}\nKEYS>>>\n` +
        offenders.map((u) => `  ${u.key}  →  ${u.file}`).join('\n'),
    ).toEqual([])
  })

  it('RATCHET bayatlamamalı: allowlist anahtarı artık çözülüyorsa listeden çıkar', () => {
    const stale = [...KNOWN_UNRESOLVED].filter(
      (k) => k !== '__PLACEHOLDER__' && getDictValue(tr, k) !== k,
    )
    expect(
      stale,
      `Bu anahtarlar artık ÇÖZÜLÜYOR — KNOWN_UNRESOLVED'dan SİL (ratchet sıkışır):\n  ${stale.join('\n  ')}`,
    ).toEqual([])
  })
})
