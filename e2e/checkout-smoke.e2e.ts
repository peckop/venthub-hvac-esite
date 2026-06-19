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

// ⚠️ KARANTİNA (2026-06-19): Sepete-ekleme adımı (CI'da yüklü koşullarda localStorage'a sepet
// yazılması) KARARSIZ — aynı commit push'ta geçip PR'da timeout atıyor. Kararsız test = yalan-kırmızı,
// güveni/dikkati yer (testsizlikten beter). Sağlam `admin-smoke` çalışmaya devam ediyor. Bu test,
// sepet seed'i deterministik hale getirilene kadar (ör. ürün-detay sayfasından ya da doğrudan
// güvenilir bir mekanizmayla) `describe.skip` ile çalışmaz. Mantık aşağıda korunuyor.
test.describe.skip('checkout funnel smoke (pre-payment)', () => {
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

    // 2) Ürün listesi → ilk ürünü sepete ekle (gerçek kullanıcı yolu).
    //    title sabit çapadır: ProductCard @generated olduğu için data-testid ekleyemeyiz,
    //    ama add butonu title="Sepete Ekle" taşır (header'da title=Sepet YOK → çakışmaz).
    await page.goto('/tr/products')
    const addBtn = page.getByTitle('Sepete Ekle', { exact: true }).first()
    await expect(addBtn, 'Ürün kartı "Sepete Ekle" butonu görünmedi (ürün listesi boot olmadı?)')
      .toBeVisible({ timeout: 30_000 })
    // Sepet localStorage'a yazılana kadar HER TURDA yeniden tıkla.
    // Neden dispatchEvent: normal click(), kartın hover-transform'u (`hover:-translate-y-1`)
    //   yüzünden "stable değil / kart pointer intercept ediyor" diye takılır (gerçek kullanıcıda
    //   sorun yok; buton stopPropagation ile Link navigasyonunu da keser). dispatch onClick'i
    //   doğrudan tetikler.
    // Neden poll içinde tekrar: toBeVisible yalnız SSR DOM'unu görür; React onClick henüz BAĞLI
    //   olmayabilir (hidrasyon yarışı) → erken dispatch sessizce düşer. Sepet dolana kadar yeniden
    //   tıklarız (aynı ürün → qty++, satır sayısı 1 kalır = idempotent, length>0 yeterli).
    await expect
      .poll(
        async () => {
          await addBtn.dispatchEvent('click').catch(() => { /* detached/yeniden render: bir sonraki tur */ })
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
