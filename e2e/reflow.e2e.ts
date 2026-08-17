import { expect, type Page,test } from '@playwright/test'

/**
 * INV-REFLOW-1 — WCAG 2.2 SC 1.4.10 (Reflow, AA): vitrin, 320 CSS px genişlikte
 * yatay kaydırma GEREKTİRMEDEN sunulabilmeli (320px ≡ 1280px @ %400 zoom).
 *
 * NİÇİN VAR (T050-VH · cetvel docs/standards/storefront-reflow-standard.md)
 *
 * 2026-08-15'te iki yatay taşma (#540) ancak ELLE ölçümle bulundu; hiçbir kapı
 * görmüyordu çünkü tüm kapılar statikti ve taşma bir RUNTIME özelliğidir.
 * `scripts/a11y/reflow-scan.mjs` teşhis aracıdır (elle koşulur); bu dosya aynı
 * ölçümün KALICI, her-PR'da koşan biçimidir.
 *
 * ÖLÇÜM GEÇERLİLİĞİ — üç yaşanmış tuzağa karşı üç zorunlu katman:
 *
 *  1. UYGULAMA-GERÇEKLİĞİ: Vercel önizleme koruması 302 ile KORUMA SAYFASI döndürür;
 *     araç 8 rotayı "tertemiz" raporlamıştı çünkü yanlış hedefi ölçüyordu. Burada her
 *     rota, uygulamaya ait bir işaret (html[lang] + site içeriği) doğrulanmadan ÖLÇÜLMEZ.
 *  2. ENSTRÜMAN KANITI (bilerek-taşma): `overflow-x: clip` altında `scrollWidth`
 *     taşmayı ASLA raporlayamaz — araç sessizce hep-yeşil olur. Her sayfada gerçek
 *     ölçümden önce kasıtlı 5000px'lik bir eleman enjekte edilir; araç onu GÖREMEZSE
 *     test ölçüm-geçersiz diye KIRMIZI yanar (ölçülemedi ≠ geçti).
 *  3. KIRPMA YASAĞI: html/body üzerinde `overflow-x: hidden|clip` taşmayı kullanıcıdan
 *     GİZLER ama içerik yine erişilmezdir (SC 1.4.10 ihlali sürer) — b6a2e14d bu yüzden
 *     kaldırdı. Geri gelirse bu kapı düşer.
 */

/**
 * 320 SC eşiği; ara genişlikler de taranır çünkü dar ekranda düzen mobil dala geçip
 * kurtulur — ölçülen kırılmalar ~768-1100px bandındaydı (masaüstü dalı, alan dar).
 */
const WIDTHS = [320, 768, 1024, 1280] as const
const TOLERANCE = 1 // sub-pixel yuvarlama payı

/**
 * Kritik vitrin rotaları. Checkout bilinçli DIŞARIDA: sepet durumu ister; hunisi
 * checkout-smoke.e2e.ts'te ayrıca koşuyor. Admin bilinçli DIŞARIDA: mobil/dar
 * tasarımı henüz yok (bilinen açık, ADMIN şeridinin Faz-5 ölçümünde) — kapıya
 * koymak regresyon değil eksik-özellik kırmızısı üretir ve kapı sökülür.
 */
const ROUTES = ['/tr', '/tr/products', '/tr/cart', '/tr/support', '/tr/hakkimizda']

const SENTINEL_ID = 'reflow-gate-sentinel'

type Olcum = {
  provoked: number
  overflow: number
  htmlOverflowX: string
  bodyOverflowX: string
}

/**
 * Bir genişlikteki TÜM ölçüm tek `evaluate` turunda yapılır. Sebep ölçüldü, tahmin
 * değil: her Playwright aksiyonu bir trace anlık-görüntüsü üretir ve 5000px'lik
 * enstrüman elemanı sayfadayken bu anlık-görüntü ağır rotada (`/tr/products`) test
 * başına 60sn sınırını aşıyordu — taşma yokken bile KIRMIZI. Yani kapı, ölçtüğü şeyi
 * değil kendi enstrümanını raporluyordu. Tek tur + bu spec'te trace/video kapalı
 * (aşağıdaki `test.use`) bunu 39sn'den saniyelere indirir.
 *
 * `scrollWidth` okuması senkron layout flush'ı zorlar; enjeksiyon-ölç-kaldır aynı
 * turda güvenlidir (ayrıca araya await girmediği için ara durum da sızmaz).
 */
async function olc(page: Page, sentinelId: string): Promise<Olcum> {
  return page.evaluate(async (id) => {
    // Medya dalının/React yeniden-render'ının oturması için bir çerçeve.
    await new Promise<void>((r) => requestAnimationFrame(() => r()))
    const doc = () => document.scrollingElement ?? document.documentElement
    const measure = () => doc().scrollWidth - window.innerWidth

    const el = document.createElement('div')
    el.id = id
    el.style.cssText = 'position:static;width:5000px;height:1px'
    document.body.appendChild(el)
    const provoked = measure()
    el.remove()

    return {
      provoked,
      overflow: measure(),
      htmlOverflowX: getComputedStyle(document.documentElement).overflowX,
      bodyOverflowX: getComputedStyle(document.body).overflowX,
    }
  }, sentinelId)
}

/**
 * Trace/video bu spec'te KAPALI — yukarıda ölçülen maliyet sebebiyle. Kayıp yok:
 * bu kapının teşhis yolu trace değil, hata mesajındaki rota+genişlik+px ve
 * `scripts/a11y/reflow-scan.mjs` (ağaçta inen kök-kanıtlı ölçüm).
 */
test.use({ trace: 'off', video: 'off' })

/**
 * MOBİL EMÜLASYONDA VIEWPORT YENİDEN BOYUTLANDIRILMAZ — ölçüldü, tahmin değil.
 *
 * `mobile-storefront` projesi (Pixel 7) altında `setViewportSize` ile 1024px'e çıkınca
 * kasıtlı 5000px'lik enstrüman elemanı yalnız **904px** olarak ölçüldü: mobil tarayıcı
 * `<meta viewport>` + shrink-to-fit modeliyle düzeni ölçekliyor, yani belge taşması
 * masaüstündeki anlamını YİTİRİYOR. Bu yanlış ölçümü kapının kendi enstrüman kanıtı
 * yakaladı (yeşil vermedi, "ölçülemedi" dedi) — kuralın ilk günündeki gerçek kanıtı budur.
 *
 * Doğru biçim: mobilde CİHAZIN KENDİ genişliğinde ölç (Pixel 7 → 412px; sentinel 3352px
 * olarak görülüyor, ölçüm geçerli). Genişlik taraması masaüstü projesinin işi.
 */
test.describe('INV-REFLOW-1 · vitrin yatay taşmasız sunulur (SC 1.4.10)', () => {
  for (const route of ROUTES) {
    test(`${route} · reflow`, async ({ page }, testInfo) => {
      const mobil = testInfo.project.use.isMobile === true
      const genislikler: ReadonlyArray<number | null> = mobil ? [null] : WIDTHS
      // networkidle DEĞİL: realtime/analytics poll'u olan sayfada asılı kalır
      // (mevcut smoke'lar da kullanmıyor). Ölçüm hazırlığı: iskelet görünür + fontlar.
      await page.goto(route)

      // 1) UYGULAMA-GERÇEKLİĞİ — koruma/hata sayfasını ölçmek sessiz hep-yeşildir.
      const lang = await page.locator('html').getAttribute('lang')
      expect(
        lang,
        `${route}: html[lang] yok — bu uygulama değil (koruma sayfası / hata sayfası?). ` +
          'Yanlış hedefi ölçmek aracı sessizce hep-yeşil yapar; ölçüm reddedildi.',
      ).toBeTruthy()
      await expect(
        page.locator('header, [data-testid="site-header"], nav').first(),
        `${route}: site iskeleti yok — ölçülen sayfa uygulamaya ait görünmüyor.`,
      ).toBeVisible()
      // Font metrikleri genişliği değiştirebilir; ölçümden önce otursun.
      await page.evaluate(() => document.fonts.ready.then(() => undefined))

      for (const genislik of genislikler) {
        if (genislik !== null) await page.setViewportSize({ width: genislik, height: 720 })
        const width = genislik ?? (page.viewportSize()?.width ?? 0)
        const m = await olc(page, SENTINEL_ID)

        // 2) ENSTRÜMAN KANITI — kasıtlı taşma görünmüyorsa ölçüm geçersizdir.
        expect(
          m.provoked,
          `${route} @${width}px: kasıtlı 5000px taşma ÖLÇÜLEMEDİ (${m.provoked}px). ` +
            'Bir ata overflow kırpıyor demektir (örn. overflow-x: clip) — araç kör, ' +
            'yeşili anlamsız. Önce ölçümü mümkün kıl (ölçülemedi ≠ geçti).',
        ).toBeGreaterThan(1000)

        // 3) KIRPMA YASAĞI — gizlenen taşma çözülmüş taşma değildir.
        for (const [el, v] of [
          ['html', m.htmlOverflowX],
          ['body', m.bodyOverflowX],
        ] as const) {
          expect(
            ['hidden', 'clip'].includes(v),
            `${route} @${width}px: ${el} overflow-x:${v} — taşmayı GİZLER, erişilebilir ` +
              'yapmaz (SC 1.4.10 ihlali sürer) ve clip altında ölçümü de körleştirir. ' +
              'Kural b6a2e14d ile kaldırılmıştı; taşmayı kökünden düzelt, kırpma.',
          ).toBe(false)
        }

        // GERÇEK ÖLÇÜM
        expect(
          m.overflow,
          `${route} @${width}px: belge ${m.overflow}px yatay taşıyor (SC 1.4.10). ` +
            'Suçluyu bulmak için: node scripts/a11y/reflow-scan.mjs <url> ' +
            `${route} ${width} (ağaçta inen kök-kanıtlı ölçüm).`,
        ).toBeLessThanOrEqual(TOLERANCE)
      }
    })
  }
})
