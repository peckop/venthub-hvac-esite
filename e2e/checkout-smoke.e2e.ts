import { expect,test } from '@playwright/test'

/**
 * Checkout funnel smoke — satınalma hunisi donma/loop bekçisi (ÖDEME ÖNCESİ DURUR).
 *
 * Amaç: gerçek bir kullanıcı gibi ürünü sepete ekleyip checkout hunisinin TÜM ödeme-öncesi
 * adımlarının (müşteri bilgisi → adres → özet) boot olduğunu, donmadığını ve interaktif
 * olduğunu kanıtlamak. [[admin-runtime-smoke-gate]] ile aynı sınıf: statik kapıların
 * (tsc/lint/conformance/build/vitest) göremediği runtime davranışını ölçer.
 *
 * ⚠️ GÜVENLİK SINIRI: "Ödemeye Geç" butonuna ASLA basılmaz. O buton (step 3) `initiatePayment`'ı
 * tetikler → İyzico'ya gider VE bekleyen sipariş (venthub_orders) yaratır (canlıda gerçek/geri
 * alınamaz). Bu yüzden test review (özet) adımına ulaşır, butonun VAR olduğunu doğrular ve DURUR.
 * Sonuç: hiçbir sipariş/ödeme oluşmaz; sadece test hesabının sepetine 1 ürün eklenir (zararsız).
 */

const EMAIL = process.env.E2E_ADMIN_EMAIL
const PASSWORD = process.env.E2E_ADMIN_PASSWORD

// ⚠️ KARARLI HALE GETİRİLDİ (2026-06-19): Sepete-ekleme adımı artık ürün detay sayfasından
// data-testid="pdp-add-to-cart" butonuyla gerçekleştiriliyor. Böylece hover-transform / pointer
// intercepting gibi liste sayfası sorunları elenmiştir.
// ⏸️ KARANTİNA (2026-08-11, Kademe-2 F0 tasfiyesi): DB'de satın alınabilir ürün yoktu — legacy
// katalog silinmiş, yeni katalog fiyat motoru gelene dek "Teklif Al" modundaydı (price=null).
// Satın alınabilir kart şartı o pencerede YAPISAL olarak sağlanamıyordu.
//
// ▶️ KARANTİNA KALDIRILDI (2026-08-15). Kaldırma kriteri fiyat motorunun satış fiyatlarını
// yazmasıydı; seed koştu ve prod'dan ÖLÇÜLDÜ: 374 aktif ürün, 1044 fiyat satırı,
// 348 ürünün `display_price > 0`. Yani "satın alınabilir kart" artık var.
//
// NİÇİN ŞİMDİ ÖNEMLİ — bu testin asıl işi bugün değişti. 2026-08-15'te ödeme yolu
// FAIL-CLOSED yapıldı (T041-VH): `order-validate` doğrulaması yapılamazsa `iyzico-payment`
// ödemeyi BAŞLATMIYOR ve istemci fiyatına düşen yedek yol SİLİNDİ. Bu doğru karar ama yeni
// bir risk getirdi: fail-closed mantığında bir hata olsa checkout tamamen ölür ve **bunu
// yakalayacak hiçbir çalışma-zamanı kapısı yoktu** — 794 testin tamamı statik/birim, hiçbiri
// tarayıcı açmıyor. Bu dosya o boşluğu kapatır.
//
// Ödeme adımına HÂLÂ girilmez (aşağıdaki güvenlik sınırı); ölçülen şey, hunının ödeme
// düğmesine kadar boot olup interaktif kaldığıdır.
test.describe('checkout funnel smoke (pre-payment)', () => {
  // Secret/credential yoksa atla (CI'ı kırma) — admin smoke ile aynı kimlik.
  test.skip(!EMAIL || !PASSWORD, 'E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD gerekli (CI var+secret).')

  test('login → sepete ekle → checkout hunisi boot olur, donmaz ve ozet adimina ulasir', async ({ page }) => {
    // 1) Gerçek login (admin smoke ile birebir aynı çapalar)
    await page.goto('/tr/auth/login')
    await page.fill('input[name="email"]', EMAIL as string)
    await page.fill('input[name="password"]', PASSWORD as string)
    await page.click('button[type="submit"]')
    await page
      .waitForURL((u) => !u.pathname.includes('/auth/login'), { timeout: 25_000 })
      .catch(() => { /* yine de devam; aşağıda net patlar */ })

    // 2) Ürün listesi → teklif isteme gerektirmeyen ilk satın alınabilir ürünün detay sayfasına git → sepete ekle
    await page.goto('/tr/products')
    const productCardLink = page.locator('a[href*="/products/"]').filter({ hasNotText: 'Teklif İste' }).first()
    await expect(productCardLink, 'Satın alınabilir ürün kartı linki görünmedi').toBeVisible({ timeout: 30_000 })
    // Karta click() YERİNE href'i alıp DOĞRUDAN git: kartın hover-transform'u / üstteki katman
    // click()'i "stable değil / pointer intercept" diye 60sn timeout'a sokuyordu (master'da flaky).
    // goto deterministiktir — actionability beklemesi yok.
    const productHref = await productCardLink.getAttribute('href')
    if (!productHref) throw new Error('Ürün kartı href alınamadı (liste boot olmadı?)')
    await page.goto(productHref)

    // Detay sayfasına geçişi doğrula
    await page.waitForURL(/\/products\//, { timeout: 25_000 })

    // Ürün detay sayfasındaki "Sepete Ekle" butonu
    const addToCartBtn = page.getByTestId('pdp-add-to-cart')
    await expect(addToCartBtn, 'Detay sayfasındaki "Sepete Ekle" butonu görünmedi').toBeVisible({ timeout: 20_000 })

    // Sepet localStorage'a yazılana kadar hidrasyon/bağlanma yarışını tolere ederek yeniden tıkla.
    await expect
      .poll(
        async () => {
          await addToCartBtn.click().catch(() => { /* detached veya yeniden render */ })
          return page.evaluate(() => {
            try {
              const raw = localStorage.getItem('venthub-cart')
              if (!raw) return 0
              const arr = JSON.parse(raw)
              return Array.isArray(arr) ? arr.length : 0
            } catch {
              return 0
            }
          })
        },
        { timeout: 30_000, intervals: [400, 800, 1500], message: 'Sepet kaydedilmedi (addToCart hidrasyon/handler?)' },
      )
      .toBeGreaterThan(0)

    // 3) Checkout'a git — boş-sepet guard'ına TAKILMAMALI (sepette ürün var).
    await page.goto('/tr/checkout')
    await expect(
      page.getByTestId('checkout-root'),
      'Checkout boot olmadı (boş-sepet guard veya auth takıldı?)',
    ).toBeVisible({ timeout: 25_000 })

    // 4) ADIM 1 (müşteri bilgisi) mount oldu + interaktif (donmuş/spinner değil).
    const email = page.getByTestId('checkout-customer-email')
    await expect(email, 'Adım 1 (müşteri) formu mount olmadı — "Yükleniyor"da donmuş olabilir').toBeVisible({
      timeout: 20_000,
    })
    await page.getByTestId('checkout-customer-name').fill('E2E Smoke Test')
    await email.fill(EMAIL as string)
    await page.getByTestId('checkout-customer-phone').fill('5551112233')

    // İleri → ADIM 2 (adres). Donmuş/pegli orchestrator step geçişini işlemezdi.
    await page.getByTestId('checkout-next-btn').click()
    const city = page.getByTestId('checkout-ship-city')
    await expect(city, 'Adım 2 (adres) açılmadı — orchestrator donmuş/takılı olabilir').toBeVisible({
      timeout: 20_000,
    })

    // 5) Adres doldur (validateAddress: full_address + city + district yeterli; legal onaylar
    //    yalnız ödeme anında gerekir, o yüzden buraya kadar onay gerekmez).
    await page.getByTestId('checkout-ship-address').fill('E2E Test Mah. Smoke Sk. No:1 D:2')
    await city.fill('İstanbul')
    await page.getByTestId('checkout-ship-district').fill('Kadıköy')

    // İleri → ADIM 3 (özet / review). Huni burada donsaydı review mount olmazdı.
    await page.getByTestId('checkout-next-btn').click()
    await expect(
      page.getByTestId('checkout-review'),
      'Adım 3 (özet) açılmadı — checkout hunisi donmuş olabilir',
    ).toBeVisible({ timeout: 20_000 })

    // 6) GÜVENLİK SINIRI: "Ödemeye Geç" butonunun VAR olduğunu doğrula — ama ASLA tıklama.
    //    Tıklamak İyzico'yu çağırır + venthub_orders'a bekleyen sipariş yazar (geri alınamaz).
    await expect(
      page.getByTestId('checkout-next-btn'),
      '"Ödemeye Geç" butonu görünmedi (özet adımı tamamlanmadı?)',
    ).toBeVisible()
    // DUR. Ödeme adımı (step 4) bilinçli olarak tetiklenmez — gerçek sipariş/ödeme oluşmaması için.
  })
})
