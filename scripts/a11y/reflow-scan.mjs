/**
 * WCAG 2.2 SC 1.4.10 (Reflow, Level AA) ÖLÇÜM ARACI
 *
 * Başarı ölçütü: içerik **320 CSS px** genişlikte, **iki yönlü scroll gerektirmeden**
 * sunulabilmeli. 320px ≡ 1280px viewport @ %400 zoom.
 *
 * Bu betik iki şeyi ölçer:
 *   1. Belge yatay taşması — `scrollingElement.scrollWidth > innerWidth`
 *      (`overflow-x: hidden` içerik taşmasını GİZLER ama `scrollWidth` gerçek
 *      genişliği raporlamaya devam eder → kural yerindeyken bile latent taşma ölçülebilir)
 *   2. Suçlu elemanlar — viewport'un sağ kenarını aşan en geniş öğeler
 *
 * Neden `e2e/` içinde değil: `e2e/**` ve `playwright.config.ts` EDGE şeridinde.
 * Bu, kalıcı bir kapı değil TEŞHİS aracıdır; kalıcı kapı e2e tarafına eklenecek.
 *
 * Kullanım:
 *   node scripts/a11y/reflow-scan.mjs <baseUrl> [rota,rota,...]
 *   node scripts/a11y/reflow-scan.mjs https://example.vercel.app /tr,/tr/products
 */

// Repo `@playwright/test` bağımlılığını taşıyor (düz `playwright` paketi yok).
import { chromium } from '@playwright/test'

/**
 * 320px SC 1.4.10'un eşiği, ama TEK BAŞINA yetmez: dar ekranda çoğu düzen mobil
 * dala geçip kurtulur. Admin'de ölçülen kırpılma tam olarak ~768-1100px bandındaydı
 * (masaüstü dalı devrede, alan yetersiz). Bu yüzden ara genişlikler de taranır.
 */
const DEFAULT_WIDTHS = [320, 768, 1024, 1280]
const REFLOW_HEIGHT = 256
const TOLERANCE = 1 // sub-pixel yuvarlama payı

const baseUrl = process.argv[2]
if (!baseUrl) {
  console.error('Kullanım: node scripts/a11y/reflow-scan.mjs <baseUrl> [rotalar]')
  process.exit(2)
}

const routes = (
  process.argv[3] ??
  '/tr,/tr/products,/tr/cart,/tr/support,/tr/hakkimizda'
).split(',')

const widths = (process.argv[4] ?? DEFAULT_WIDTHS.join(','))
  .split(',')
  .map((w) => Number(w.trim()))
  .filter((w) => Number.isFinite(w) && w > 0)

const browser = await chromium.launch()
const results = []

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: REFLOW_HEIGHT },
  })
  const page = await context.newPage()

  for (const route of routes) {
    const url = new URL(route, baseUrl).toString()
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 })
    } catch {
      results.push({ route, width, error: 'yüklenemedi' })
      continue
    }

    const measurement = await page.evaluate((tol) => {
    const doc = document.scrollingElement ?? document.documentElement
    const viewportWidth = window.innerWidth
    const htmlOverflowX = getComputedStyle(document.documentElement).overflowX
    const bodyOverflowX = getComputedStyle(document.body).overflowX

    /**
     * KRİTİK ÖLÇÜM NOTU (bilerek-boz testiyle kanıtlandı):
     * `html/body { overflow-x: hidden }` yürürlükteyken `scrollingElement.scrollWidth`
     * taşmayı RAPORLAMAZ — sayfaya 3000px genişlikte bir öğe enjekte edildiğinde bile
     * değer değişmedi. Yani kural yerindeyken doğrudan ölçüm KÖRDÜR.
     *
     * Bu yüzden kuralı geçici olarak `visible`'a çevirip ölçüyoruz; bu aynı zamanda
     * "kuralı kaldırırsam ne olur" sorusunun birebir cevabıdır. Ölçüm sonrası
     * eski değerler geri konur (sayfa zaten atılıyor, yine de temiz bırakılır).
     */
    const prevHtml = document.documentElement.style.overflowX
    const prevBody = document.body.style.overflowX
    document.documentElement.style.overflowX = 'visible'
    document.body.style.overflowX = 'visible'
    // Yeniden düzen tetikle
    void document.body.offsetWidth
    const overflowPx = doc.scrollWidth - viewportWidth
    const scrollWidthUnclamped = doc.scrollWidth

    // Sağ kenarı aşan öğeleri bul; en geniş 8 tanesini raporla.
    const offenders = []
    for (const el of document.querySelectorAll('body *')) {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) continue
      const over = rect.right - viewportWidth
      if (over <= tol) continue
      const cls = typeof el.className === 'string' ? el.className : ''
      offenders.push({
        tag: el.tagName.toLowerCase(),
        overPx: Math.round(over),
        widthPx: Math.round(rect.width),
        cls: cls.slice(0, 120),
      })
    }
    offenders.sort((a, b) => b.overPx - a.overPx)

    // Aynı sınıf imzasını tekrar tekrar raporlama.
    const seen = new Set()
    const unique = []
    for (const o of offenders) {
      const key = `${o.tag}|${o.cls}`
      if (seen.has(key)) continue
      seen.add(key)
      unique.push(o)
      if (unique.length >= 8) break
    }

    document.documentElement.style.overflowX = prevHtml
    document.body.style.overflowX = prevBody

    return {
      viewportWidth,
      scrollWidth: scrollWidthUnclamped,
      overflowPx,
      htmlOverflowX,
      bodyOverflowX,
      offenders: unique,
    }
    }, TOLERANCE)

    results.push({ route, width, ...measurement })
  }

  await context.close()
}

await browser.close()

// ── Rapor ──────────────────────────────────────────────────────────────────
let failed = 0
let errored = 0
console.log(`\nWCAG SC 1.4.10 Reflow taraması — genişlikler: ${widths.join(', ')} CSS px`)
console.log(`Hedef: ${baseUrl}\n`)

for (const r of results) {
  if (r.error) {
    // ÖLÇÜLEMEDİ ≠ GEÇTİ. Yüklenemeyen rota sessizce başarı sayılamaz, aksi halde
    // tüm hedef erişilemezken tarama "hepsi temiz" der (ilk koşuda birebir yaşandı).
    errored++
    console.log(`HATA   [${r.width}px] ${r.route} — ${r.error}`)
    continue
  }
  const ok = r.overflowPx <= TOLERANCE
  if (!ok) failed++
  // Taşma yoksa suçlu listesini yazdırma — o öğeler bir ata tarafından kırpılıyor
  // ve belge genişliğine katkı vermiyorlar; gürültü olur.
  console.log(
    `${ok ? 'GECTI' : 'TASMA'}  [${r.width}px] ${r.route}  ` +
      `scrollWidth=${r.scrollWidth}px (taşma ${r.overflowPx}px)  html.overflow-x=${r.htmlOverflowX}`
  )
  if (!ok) {
    for (const o of r.offenders) {
      console.log(`         └─ <${o.tag}> +${o.overPx}px (genişlik ${o.widthPx}px) ${o.cls}`)
    }
  }
}

const measured = results.length - errored
console.log(
  `\nÖzet: ${measured} rota ÖLÇÜLDÜ, ${measured - failed} temiz, ${failed} taşıyor.` +
    (errored ? `  ${errored} rota ÖLÇÜLEMEDİ (sonuç geçersiz).` : '')
)
// Ölçülemeyen rota da başarısızlıktır — "sessizlik başarı değildir".
process.exit(failed > 0 || errored > 0 ? 1 : 0)
