import { createRequire } from "node:module"

import react from "@vitejs/plugin-react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - NodeJS path module is available in the Vite environment but may lack explicit root types in some environments
import * as path from "path"
import type { PluginOption } from 'vite';
import { defineConfig } from "vitest/config"

// ALT-38: dünya durumu testleri (liste: scripts/ci/dunya-durumu-testleri.json) PR kapısından çıkar.
// `VENTHUB_DUNYA_DURUMU` boşsa TAM paket (yerel `pnpm test`, master push); `dislan` ise listedekiler dışarıda
// (yalnız pull_request olayında `ci` işi); `yalniz` ise yalnız onlar (zamanlı dunya-durumu.yml).
// Geçersiz değer FIRLATIR — sessizce "tam"a düşen bir yazım hatası kapıyı gizlice kaldırırdı.
interface DunyaSonucu {
  kip: string
  exclude: string[]
  include: string[] | null
  uyari?: string
  suzgeceTakilan?: string[]
}
// Yükleme BİLEREK parantezli ve takma adsız: `createRequire` değişkene bağlanırsa `INV-TEST-SEC-1` blok 7 (koşum kapanımı) çağrıyı izleyemez ve kırmızı verir.
const dunyaModulu = (createRequire(import.meta.url)("./scripts/ci/dunya-durumu.cjs") as {
  ayar: (env: NodeJS.ProcessEnv) => DunyaSonucu
  ozetSatiri: (env: NodeJS.ProcessEnv, sonuc: DunyaSonucu) => string | null
})
const dunyaDurumu = dunyaModulu.ayar(process.env)
// `dislan` yalnız TABANDA (base dalı) da yazılı kayıtları dışlar; taban okunamazsa hiçbir şey dışlanmaz (TAM paket koşar) ve neden burada
// SESSİZ kalmaz: yazılmazsa "dışlama çalışıyor" sanılır ama her PR'da tam paket koşardı (ALT-38a B3).
if (dunyaDurumu.uyari) process.stderr.write(`[dunya-durumu] ${dunyaDurumu.uyari}\n`)
// ALT-38i (Ö4): `dislan`da tek özet satırı — dışlanan / süzgeçle kapıda kalan / değişen dosya sayısı. Dışlama sessiz bir karardır; günlükte sayılar görünmezse beklenmeyen bir
// `değişen=0` ya da hep aynı `dışlanan` kimsenin gözüne çarpmaz. `tam` ve `yalniz` kiplerinde satır yazılmaz.
const dunyaOzeti = dunyaModulu.ozetSatiri(process.env, dunyaDurumu)
if (dunyaOzeti) process.stderr.write(`[dunya-durumu] ${dunyaOzeti}\n`)

// ALT-38c-2: `VENTHUB_TEST_SHARD_DOSYALARI` (JSON liste dosyası) doluysa YALNIZ o listedeki test dosyaları koşar (ci.yml `test-shard` işleri; liste
// scripts/ci/test-shard.cjs ile üretilir, parçaların birleşimi TÜM paketin listesidir: INV-CI-SHARD-2). Boşsa (yerel `pnpm test`, master push, edited,
// zamanlı koşu) hiçbir şey değişmez. Bozuk/boş liste FIRLATIR: sessizce tam pakete ya da boş pakete düşmez.
const shardInclude = (createRequire(import.meta.url)("./scripts/ci/test-shard.cjs") as {
  ortamdanInclude: (env: NodeJS.ProcessEnv) => string[] | null
}).ortamdanInclude(process.env)
if (shardInclude && dunyaDurumu.include) throw new Error("VENTHUB_TEST_SHARD_DOSYALARI ile VENTHUB_DUNYA_DURUMU=yalniz birlikte kullanılamaz")

export default defineConfig({
  plugins: [react() as PluginOption],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "https://esm.sh/@supabase/supabase-js@2.45.4": "@supabase/supabase-js",
      "https://esm.sh/@supabase/supabase-js@2.39.3": "@supabase/supabase-js",
      "https://esm.sh/@supabase/supabase-js@2": "@supabase/supabase-js",
      "https://esm.sh/zod@3.23.8": "zod",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    globalSetup: ['vitest.global-setup.ts'],
    setupFiles: ['vitest.setup.ts', 'vitest-setup.tsx'],
    css: true,
    server: {
      deps: {
        inline: [/supabase\/functions/],
      },
    },
    // `tests/e2e/empirical_*` CANLI veritabanına bağlanır: repo kökündeki `.env`i
    // fs.readFileSync ile okuyup DATABASE_URL'den doğrudan pg bağlantısı açarlar.
    // CI'da `.env` yoktur → ENOENT. Birim/bileşen paketinin parçası değiller;
    // yerelde elle koşulacak ampirik DB denetimleridir:
    //   pnpm vitest run tests/e2e/empirical_db.test.ts   (repo kökünde .env varken)
    // `tests/smoke/**` AYRI koşar (`vitest.smoke.config.ts` · `pnpm test:ssr-smoke`):
    // ⚠BU AD BİR KEZ BAYATLADI: burada `pnpm test:smoke` yazıyordu, oysa o ad repo'da
    // ZATEN Playwright'ın (`playwright test`). Betik adı `test:ssr-smoke` olduğunda bu
    // yorum güncellenmemişti — yani yorum, olmayan bir komuta yönlendiriyordu.
    // ayakta bir sunucu ister ve SMOKE_BASE_URL yoksa fail-closed DÜŞER (REC-134).
    // Burada kalsaydı `ci`'nin Test adımı onu sunucusuz toplayıp kırmızı verirdi.
    // Eskiden buradaydı ve `describe.skipIf` ile SIFIR test topluyordu — yani
    // kilit hiç koşmadı ve kontrol listesinde yeşil göründü.
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/empirical_*.test.ts', 'tests/smoke/**', ...dunyaDurumu.exclude],
    ...(dunyaDurumu.include ? { include: dunyaDurumu.include } : {}),
    ...(shardInclude ? { include: shardInclude } : {}),
    // Use threads pool (default) for better stability on Windows/CI
    pool: 'threads',
    testTimeout: 20000,
    hookTimeout: 12000,
    teardownTimeout: 8000,
    onConsoleLog(log, type) {
      // AccountSecurity testindeki beklenen hata mesajını (stderr) CI çıkış kodunu bozmaması için filtreleyelim
      if (type === 'stderr' && typeof log === 'string' && log.includes('update failed')) {
        return false
      }
      // React Router future flag uyarılarını test çıktısından filtrele
      if (type === 'stderr' && typeof log === 'string' && log.includes('React Router Future Flag Warning')) {
        return false
      }
    },
  },
})

