import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright — admin runtime smoke (donma/loop bekçisi).
 *
 * Amaç: statik kapıların (cetvel/INV/tsc/lint/build) GÖRMEDİĞİ runtime davranışını ölçmek —
 * admin gerçekten boot olup interaktif mi, yoksa "Yükleniyor"da mı donuyor (2026-06-19 useRole
 * render-loop'u gibi). E2E testleri `e2e/*.e2e.ts` (vitest `.test/.spec`'i kapar, bunları DEĞİL).
 */
const PORT = Number(process.env.E2E_PORT || 3000)
const BASE_URL = process.env.E2E_BASE_URL || `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 20_000 },
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    /**
     * T050: mobil viewport hattı. Repo bugüne dek TEK masaüstü projeyle koştu —
     * mobil cihaz emülasyonu (dokunma, mobil UA, deviceScaleFactor) hiç test
     * edilmiyordu; yalnız mobilde kırılan bir şey hiçbir kapıya görünmezdi.
     *
     * Kapsam bilinçli DAR ve KANITLANABİLİR olanla sınırlı:
     *  · reflow.e2e.ts — yerelde ölçülüp doğrulandı (mobil emülasyonda 5/5 yeşil).
     *  · checkout-smoke BİLİNÇLİ DIŞARIDA: gerçek login ister, parolası CI secret'ı
     *    (`E2E_ADMIN_PASSWORD`) — yerelde koşturulamıyor. Doğrulayamadığım bir spec'i
     *    ZORUNLU kontrole (`admin-smoke`) sokmak, kırmızı çıkarsa herkesin merge'ini
     *    bloklardı. Mobil huni ayrı iş olarak kayıtlı (cetvel §Kapsam).
     *  · admin BİLİNÇLİ DIŞARIDA: mobil/dar tasarımı henüz yok (ADMIN Faz-5 kaydı) —
     *    regresyon değil eksik-özellik kırmızısı üretir ve kapı söktürür.
     */
    {
      name: 'mobile-storefront',
      use: { ...devices['Pixel 7'] },
      testMatch: '**/reflow.e2e.ts',
    },
  ],
  // E2E_BASE_URL verilmişse (deploy edilmiş URL'e karşı) sunucu başlatma; yoksa prod build'i servis et.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm start',
        port: PORT,
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
      },
})
