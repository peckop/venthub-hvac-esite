import { expect, test } from '@playwright/test'

/**
 * Admin filtre çipi — donma / adres döngüsü bekçisi (REC-411).
 *
 * 2026-09-28'de /admin/products'ta "Pasif" çipine basınca sayfa kilitleniyor, adres iki değer
 * arasında gidip geliyor ve tarayıcı `ERR_INSUFFICIENT_RESOURCES` basıyordu. Kök sebep ortak
 * `AdminToolbar`'ın kalıcılık yüklemesiydi (her render'da koşup kullanıcı değişikliğini geri
 * çeviriyordu). Birim test bunu jsdom'da yakalar; bu adım GERÇEK tarayıcıda, gerçek Next
 * yönlendiricisiyle aynı şeyi ölçer: çipe basınca (a) sayfa yanıt veriyor mu, (b) adres bir iki
 * kezden fazla yazılıyor mu.
 *
 * Yalnız OKUR: çip bir liste filtresidir, veritabanına yazmaz. Yine de çip `finally` içinde geri
 * kapatılır ki test kırılırsa tarayıcı oturumundaki filtre durumu kirli kalmasın.
 */

const EMAIL = process.env.E2E_ADMIN_EMAIL
const PASSWORD = process.env.E2E_ADMIN_PASSWORD

const ADRES_YAZIMI = '__adresYazimi'
const YANIT_SURESI_MS = 5_000
const EN_FAZLA_ADRES_YAZIMI = 2

test.describe('admin filtre çipi', () => {
  test.skip(!EMAIL || !PASSWORD, 'E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD gerekli (CI var+secret).')

  test('ürün tablosunda çipe basmak sayfayı dondurmaz ve adresi döngüye sokmaz', async ({ page }) => {
    // Her gezinmede sıfırlanan sayaç: Next `router.replace` çağrısını `history.replaceState` ile yapar.
    await page.addInitScript((anahtar) => {
      Reflect.set(window, anahtar, 0)
      const orijinal = history.replaceState.bind(history)
      history.replaceState = (...args: Parameters<History['replaceState']>) => {
        Reflect.set(window, anahtar, Number(Reflect.get(window, anahtar) ?? 0) + 1)
        return orijinal(...args)
      }
    }, ADRES_YAZIMI)

    await page.goto('/tr/auth/login')
    await page.fill('input[name="email"]', EMAIL as string)
    await page.fill('input[name="password"]', PASSWORD as string)
    await page.click('button[type="submit"]')
    await page
      .waitForURL((u) => !u.pathname.includes('/auth/login'), { timeout: 25_000 })
      .catch(() => { /* yine de /admin/products denenecek */ })

    await page.goto('/admin/products')

    const cip = page.getByRole('button', { name: /^(Pasif|Inactive)$/ }).first()
    await expect(cip, 'Pasif çipi görünmedi (ürün tablosu / araç çubuğu mount olmadı?)').toBeVisible({
      timeout: 25_000,
    })

    /** Sayfa kilitliyse `evaluate` hiç dönmez; bu yüzden zamanlayıcıyla yarıştırılır. */
    const yanitVerirMi = async (): Promise<boolean> => {
      const sonuc = await Promise.race([
        page.evaluate(() => true),
        new Promise<boolean>((coz) => setTimeout(() => coz(false), YANIT_SURESI_MS)),
      ])
      return sonuc
    }
    const adresYazimi = (): Promise<number> =>
      page.evaluate((anahtar) => Number(Reflect.get(window, anahtar) ?? 0), ADRES_YAZIMI)

    // Açılıştaki ilk yazım (varsayılan sıralama adrese işlenir) sayılmaz: sayaç sıfırlanır.
    await page.evaluate((anahtar) => Reflect.set(window, anahtar, 0), ADRES_YAZIMI)

    try {
      await cip.click({ timeout: 10_000 })

      expect(
        await yanitVerirMi(),
        `Çipe basınca sayfa ${YANIT_SURESI_MS / 1000} sn içinde yanıt vermedi — render/adres döngüsü (REC-411)`,
      ).toBe(true)

      // Döngü varsa bu bekleme sırasında yüzlerce yazım birikir; kararlı durumda 1 yazım + 1 yankı.
      await page.waitForTimeout(1_500)
      expect(
        await adresYazimi(),
        `Çipe basınca adres ${EN_FAZLA_ADRES_YAZIMI} kereden fazla yazıldı — adres döngüsü (REC-411)`,
      ).toBeLessThanOrEqual(EN_FAZLA_ADRES_YAZIMI)

      await expect(cip, 'Çip basılı durumda kalmadı (kalıcılık kullanıcı değişikliğini geri çevirmiş olabilir)').toHaveAttribute(
        'aria-pressed',
        'true',
      )
      await expect(page).toHaveURL(/status=inactive/)
    } finally {
      // Çip açık kaldıysa kapat: oturum filtre durumu sonraki testlere sızmasın.
      if ((await cip.getAttribute('aria-pressed', { timeout: 3_000 }).catch(() => null)) === 'true') {
        await cip.click({ timeout: 5_000 }).catch(() => { /* sayfa kilitliyse yapılacak bir şey yok */ })
      }
    }

    // Kapatma da kararlı olmalı: sayfa yanıt verir, çip bırakılır.
    expect(await yanitVerirMi(), 'Çipi kapatınca sayfa yanıt vermedi').toBe(true)
    await expect(cip).toHaveAttribute('aria-pressed', 'false')
  })
})
