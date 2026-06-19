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
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
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
