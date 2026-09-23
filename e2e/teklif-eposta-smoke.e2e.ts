/**
 * REC-368 — "Teklif İste" formu → teklif e-postası UÇTAN UCA denemesi (yalnız ELLE tetiklenir).
 *
 * NİÇİN VAR: 2025-09-13'ten 2026-09-22'ye kadar gönderici Resend'in deneme adresiydi ve müşteriye hiç e-posta
 * gitmedi; hiçbir kapı bunu görmedi. Recep denemenin insan değil ajan tarafından yapılmasını istedi. Anahtar
 * gerektirmeyen tek canlı yol bu form: misafir teklifi → `quote-request-guest` Edge Function → `venthub_quotes`
 * INSERT → `trg_notify_quote_request_created` → `quote-notification-webhook` → Resend (alıcı = formdaki e-posta).
 *
 * İKİ KİP (varsayılan KURU):
 *   · KURU  (`E2E_TEKLIF_EPOSTA=1`)                      → formu açar, doldurur, gönder düğmesinin etkin olduğunu
 *                                                          doğrular, BASMAZ. Kayıt yok, e-posta yok.
 *   · GÖNDER (`E2E_TEKLIF_EPOSTA=1 E2E_TEKLIF_GONDER=1`) → düğmeye basar ve başarı ekranını bekler. CANLIDA gerçek
 *                                                          teklif kaydı + gerçek e-posta üretir → YALNIZ Recep'in
 *                                                          ilk elden "gönder" onayıyla koşulur (OPS aktarımı onay değildir).
 * `E2E_TEKLIF_EPOSTA` yoksa test ATLANIR → `e2e-smoke.yml`'deki `playwright test` bunu CI'da koşmaz.
 * Alıcı: `E2E_TEKLIF_ALICI` (zorunlu). Gelen kutusu ölçümü (varış süresi, SPF/DKIM/DMARC) bu testin DIŞINDA,
 * Gmail bağlayıcısıyla yapılır; bu test yalnız form tarafının gönderim anını (`GONDERIM_ANI`) basar.
 *
 * Koşum: E2E_BASE_URL=https://venthub.com.tr E2E_TEKLIF_EPOSTA=1 E2E_TEKLIF_ALICI=<adres> \
 *        pnpm exec playwright test e2e/teklif-eposta-smoke.e2e.ts --project=chromium
 */
import { expect, test } from '@playwright/test'

const ACIK = process.env.E2E_TEKLIF_EPOSTA === '1'
const GONDER = process.env.E2E_TEKLIF_GONDER === '1'
const ALICI = process.env.E2E_TEKLIF_ALICI || ''
const URUN_YOLU = process.env.E2E_TEKLIF_URUN || '/tr/products/vortice-lineo-quiet'

test.describe('REC-368 teklif formu → e-posta', () => {
  test.skip(!ACIK, 'yalnız elle: E2E_TEKLIF_EPOSTA=1 (CI koşmaz)')

  test(GONDER ? 'GÖNDER: form gönderilir, başarı ekranı görünür' : 'KURU: form doldurulur, gönder düğmesi etkin — BASILMAZ', async ({ page }) => {
    expect(ALICI, 'E2E_TEKLIF_ALICI verilmeli').toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)

    await page.goto(URUN_YOLU)
    const teklifDugmesi = page.getByRole('button', { name: /Teklif İste/i }).first()
    await expect(teklifDugmesi).toBeVisible()
    await teklifDugmesi.click()

    const ad = page.locator('#quote-request-contact-name')
    await expect(ad, 'misafir formu açılmadı (oturumlu kip e-postayı hesaptan alır — deneme misafir olmalı)').toBeVisible()
    await ad.fill('VentHub Otomatik Deneme')
    await page.locator('#quote-request-contact-phone').fill('05000000000')
    await page.locator('#quote-request-contact-email').fill(ALICI)
    await page.locator('#quote-request-note').fill(`REC-368 otomatik e-posta denemesi ${new Date().toISOString()}`)
    await page.locator('#quote-request-kvkk').check()
    // bal küpü alanı (website) BOŞ kalmalı — doluysa uç isteği bot sayar
    await expect(page.locator('#quote-request-website')).toHaveValue('')

    const gonder = page.getByRole('button', { name: 'Teklif Talebi Gönder', exact: true })
    await expect(gonder).toBeEnabled()

    if (!GONDER) {
      console.warn('KURU KİP: form hazır, gönder düğmesi etkin — BASILMADI (kayıt/e-posta yok)')
      return
    }
    const an = new Date().toISOString()
    await gonder.click()
    await expect(page.getByText('Teklif talebiniz alındı').first(), 'başarı bildirimi gelmedi').toBeVisible({ timeout: 30_000 })
    await expect(page.locator('#quote-request-contact-name'), 'başarı ekranına geçilmedi').toBeHidden()
    console.warn(`GONDERIM_ANI ${an} → alıcı ${ALICI}; gelen kutusu ölçümü Gmail bağlayıcısıyla yapılır`)
  })
})
