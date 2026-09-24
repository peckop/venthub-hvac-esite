import { defineConfig, devices } from '@playwright/test'

/**
 * CANLI KANIT — tek seferlik, canlıya YAZAN spec'lerin ayrı ayarı (karar 104, 2026-09-24).
 *
 * NİÇİN AYRI KLASÖR: kök `playwright.config.ts` `./e2e` altındaki HER spec'i koşar ve `e2e-smoke.yml`
 * onu her PR'da ve her master push'unda çağırır; o işin Supabase adresi de CANLI proje (ölçüldü).
 * Canlıya yazan bir spec oraya konsaydı her PR aynı yazımı tekrarlardı. Bu klasör kök ayarın
 * `testDir`'i dışında kalır; yalnız `.github/workflows/canli-kanit-tek-sefer.yml` elle tetiklenince koşar.
 *
 * `retries: 0` BİLİNÇLİ: yazım yarıda düşerse tekrar deneme ikinci bir yazım demektir. Düşen koşum
 * insan tarafından okunur, gerekirse yeniden tetiklenir. Bekçi: INV-CANLI-KANIT-1.
 *
 * trace/video/ekran görüntüsü KAPALI ve iş artefakt YÜKLEMEZ: trace forma yazılan parolayı kaydeder,
 * repo PUBLIC — artefaktı oturum açmış herkes indirir. Kanıt, spec'in `console.log` ile bastığı ölçüm
 * satırlarıdır (iş günlüğünde kalır; parola, e-posta, anahtar BASILMAZ).
 */
const BASE_URL = process.env.E2E_BASE_URL

if (!BASE_URL) {
  throw new Error('E2E_BASE_URL gerekli — canlı kanıt yerel sunucuya karşı koşmaz.')
}

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.e2e.ts',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
