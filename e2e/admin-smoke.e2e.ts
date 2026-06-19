import { expect,test } from '@playwright/test'

/**
 * Admin runtime smoke — donma/loop bekçisi.
 *
 * 2026-06-19'da `useRole` her render yeni fonksiyon döndürüp CommandPalette/AdminRealtimeNotifications'ı
 * sonsuz re-render döngüsüne soktu → admin "Yükleniyor"da dondu, HİÇBİR ŞEY tıklanmadı, console TEMİZ.
 * Hiçbir statik kapı (cetvel/INV/tsc/lint/build) bunu görmedi. Bu test gerçek tarayıcıda admin'i boot
 * edip TAM O SEMPTOMU ölçer: (a) shell mount oluyor mu, (b) dashboard "Yükleniyor"da donmuyor mu,
 * (c) client İNTERAKTİF mi (menüye tıkla → gerçekten gidiyor mu; donmuş client tıklamayı işlemez).
 */

const EMAIL = process.env.E2E_ADMIN_EMAIL
const PASSWORD = process.env.E2E_ADMIN_PASSWORD

test.describe('admin runtime smoke', () => {
  // Secret/credential yoksa atla (CI'ı kırma) — ama sebebini açıkça yaz.
  test.skip(!EMAIL || !PASSWORD, 'E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD gerekli (CI var+secret).')

  test('login → /admin boot olur, donmaz ve interaktiftir', async ({ page }) => {
    // 1) Gerçek login (email+şifre)
    await page.goto('/tr/auth/login')
    await page.fill('input[name="email"]', EMAIL as string)
    await page.fill('input[name="password"]', PASSWORD as string)
    await page.click('button[type="submit"]')

    // Login formundan çıkana kadar bekle (session cookie set olsun). Başarısızsa aşağıda net patlar.
    await page
      .waitForURL((u) => !u.pathname.includes('/auth/login'), { timeout: 25_000 })
      .catch(() => { /* yine de /admin'i deneyeceğiz */ })

    // 2) Admin'e git
    await page.goto('/admin')

    // 3) Shell mount oldu mu — sidebar menü linki görünür (auth çözüldü, spinner geçti)
    const ordersLink = page.locator('a[href="/admin/orders"]').first()
    await expect(ordersLink, 'Admin shell render olmadı (auth/spinner takıldı?)').toBeVisible({
      timeout: 25_000,
    })

    // 4) Dashboard "Yükleniyor"da DONMUYOR — içerik mount oldu (render-loop olsaydı burada kalırdı)
    await expect(
      page.getByTestId('admin-dashboard'),
      'Dashboard mount olmadı — "Yükleniyor"da donmuş olabilir (render-loop?)',
    ).toBeVisible({ timeout: 25_000 })

    // 5) İNTERAKTİF mi — menüye tıkla, GERÇEKTEN gitsin. Donmuş/pegli client tıklamayı işlemez.
    await ordersLink.click()
    await expect(page, 'Menü tıklaması navigasyon yapmadı — client donmuş olabilir').toHaveURL(
      /\/admin\/orders/,
      { timeout: 20_000 },
    )
  })
})
