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
     * ÖLÇÜM GEÇERLİLİK SINAMASI — "sessizlik başarı değildir"in üçüncü katmanı.
     *
     * Yaşanmış tuzak (başka bir şerit bildirdi, teşekkürler): Vercel ÖNİZLEMESİ
     * deployment protection ile korunuyor (curl 302). Tarayıcı uygulamayı değil
     * KORUMA SAYFASINI ölçtü; o sayfada `overflow-x: clip` var ve `clip` altında
     * `scrollWidth` `clientWidth`'i ASLA aşamaz → araç 8 rotayı da "tertemiz"
     * raporladı. Yani yanlış hedefi ölçmek, aracı sessizce hep-yeşil yapar.
     *
     * Bu yüzden ölçümden ÖNCE iki şey doğrulanır:
     *   1. `overflow-x: clip` yürürlükte değil (clip'i `visible`'a çevirmek de
     *      taşmayı geri getirmez; ölçüm yapısal olarak kör olur),
     *   2. Sayfa gerçekten uygulama gibi görünüyor (asgari DOM hacmi).
     * Şüphe varsa sonuç "temiz" DEĞİL, "GEÇERSİZ" olarak raporlanır.
     */
    const domNodes = document.querySelectorAll('body *').length
    const invalidReasons = []
    if (htmlOverflowX === 'clip' || bodyOverflowX === 'clip') {
      invalidReasons.push(`overflow-x:clip (html=${htmlOverflowX}, body=${bodyOverflowX})`)
    }
    if (domNodes < 30) {
      invalidReasons.push(`DOM cok kucuk (${domNodes} dugum) — koruma/hata sayfasi olabilir`)
    }

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

    /**
     * SUÇLU BULMA — ADAY LİSTESİ DEĞİL, KANIT.
     *
     * Eski sürüm "sağ kenarı aşan elemanları" `getBoundingClientRect` ile listeliyordu.
     * Bu YANILTICI: atası `overflow:hidden` olan bir eleman kırpılır ve belge
     * `scrollWidth`'ine KATKI VERMEZ — yani listede görünür ama suçlu değildir.
     * Başka bir şerit bu yüzden neredeyse yanlış dosyayı onaracaktı (aday liste
     * `NavShell` üst şeridini gösteriyordu; oysa o şerit `md` altında
     * `h-0 opacity-0 overflow-hidden`, yani masum).
     *
     * Doğru yöntem AĞAÇTA İNMEK: her seviyede çocukları tek tek `display:none`
     * yapıp `scrollWidth`'i yeniden ölç. Taşmayı KAPATAN çocuk gerçek suçludur;
     * onun içine in. Bu, ölçümle kanıtlanmış tek zincir verir.
     */
    const unique = []
    if (overflowPx > tol) {
      let node = document.body
      let depth = 0
      const chain = []
      while (node && depth < 25) {
        const children = Array.from(node.children)
        let culprit = null
        for (const child of children) {
          const prevDisplay = child.style.display
          child.style.display = 'none'
          void document.body.offsetWidth
          const closed = doc.scrollWidth - viewportWidth <= tol
          child.style.display = prevDisplay
          if (closed) {
            culprit = child
            break
          }
        }
        if (!culprit) {
          // Hiçbir çocuk tek başına taşmayı kapatmıyorsa suçlu ÇOCUK DEĞİL, bu
          // düğümün KENDİSİDİR (genişliği / padding'i / min-width'i). Zinciri
          // burada bitirmek yanıltıcı olurdu — düğümü açıkça işaretle.
          if (node !== document.body) {
            const rect = node.getBoundingClientRect()
            const cls = typeof node.className === 'string' ? node.className : ''
            chain.push({
              tag: node.tagName.toLowerCase(),
              overPx: Math.round(rect.right - viewportWidth),
              widthPx: Math.round(rect.width),
              cls: cls.slice(0, 120),
              depth,
              self: true,
            })
          }
          break
        }
        const rect = culprit.getBoundingClientRect()
        const cls = typeof culprit.className === 'string' ? culprit.className : ''
        chain.push({
          tag: culprit.tagName.toLowerCase(),
          overPx: Math.round(rect.right - viewportWidth),
          widthPx: Math.round(rect.width),
          cls: cls.slice(0, 120),
          depth,
        })
        node = culprit
        depth++
      }
      // En derin düğüm gerçek suçludur; zinciri kökten yaprağa raporla.
      unique.push(...chain.slice(-6))
    }

    document.documentElement.style.overflowX = prevHtml
    document.body.style.overflowX = prevBody

    return {
      viewportWidth,
      scrollWidth: scrollWidthUnclamped,
      overflowPx,
      htmlOverflowX,
      bodyOverflowX,
      domNodes,
      invalidReasons,
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
  // ÖLÇÜM GEÇERSİZSE "temiz" DEME. Korunan/hata sayfası ölçüldüğünde `overflow-x:clip`
  // yüzünden scrollWidth asla clientWidth'i aşmaz ve araç her sayfayı yeşil raporlar.
  if (r.invalidReasons?.length) {
    errored++
    console.log(
      `GECERSIZ [${r.width}px] ${r.route} — ${r.invalidReasons.join(' · ')}  ` +
        `(DOM ${r.domNodes} düğüm). Olculen sayfa uygulama olmayabilir; sonuc SAYILMADI.`
    )
    continue
  }
  const ok = r.overflowPx <= TOLERANCE
  if (!ok) failed++
  console.log(
    `${ok ? 'GECTI' : 'TASMA'}  [${r.width}px] ${r.route}  ` +
      `scrollWidth=${r.scrollWidth}px (taşma ${r.overflowPx}px)  html.overflow-x=${r.htmlOverflowX}`
  )
  // Suçlu zinciri yalnız taşma varken yazdırılır ve ÖLÇÜMLE kanıtlanmıştır
  // (display:none ile taşmayı kapatan düğüm); en alttaki satır gerçek suçludur.
  if (!ok) {
    for (const o of r.offenders) {
      const pad = '  '.repeat(o.depth ?? 0)
      // `self` = hiçbir çocuğu taşmayı kapatmadı → taşma bu düğümün KENDİ
      // genişliğinden/padding'inden/min-width'inden geliyor. Onarım burada.
      const mark = o.self ? ' ← SUÇLU (kendi genişliği)' : ''
      console.log(
        `         └─${pad} <${o.tag}> +${o.overPx}px (genişlik ${o.widthPx}px) ${o.cls}${mark}`
      )
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
