/**
 * E2E HIZLI DERLEME — `next build`in TİP ve LİNT aşamasını yalnız e2e-smoke Build adımında kapatan anahtar (ALT-38f).
 *
 * NİÇİN: `admin-smoke` işinin Build adımı (`next build`, gerçek Supabase env) ölçüldü (2026-10-07, 88 başarılı koşu): medyan 166,5 sn;
 * tek bir koşunun günlüğünde 92 sn derleme, 51 sn "Linting and checking validity of types", 26 sn sayfa üretimi. Aynı iki denetim `ci`
 * işinde (zorunlu kontrol) ZATEN üç kez koşar: Lint, Type check ve `Build (blocking)`in kendi aşaması. Tip ya da lint hatası orada kırmızı
 * verir; e2e işinde bir kez daha ölçmek aynı hatayı ikinci kez bulmaktır. Bu dosya o tekrarı YALNIZ e2e işinde keser.
 *
 * ANAHTAR: `VENTHUB_E2E_TIP_LINT_ATLA`. YALNIZ tam `1` açar; yok, boş, `true`, `0`, ` 1 `, `01` = KAPALI (güvenli yön: yanlış yazılmış
 * anahtar tip denetimini gizlice kaldırmasın). Anahtar yalnız `.github/workflows/e2e-smoke.yml`in Build adımında, ADIM düzeyi env olarak
 * verilir; iş düzeyinde, `$GITHUB_ENV`de, `ci`de, Vercel'de, `package.json`da ve izlenen `.env*` dosyalarında YOKTUR.
 * Kapalıyken `typescript` ve `eslint` anahtarları yapılandırmaya HİÇ eklenmez: bugünkü ayarla birebir aynı.
 * Kapı: src/__tests__/conformance/e2e-hizli-derleme.test.ts (INV-E2E-HIZLI-1/2/3).
 *
 * NİÇİN .mjs: `next.config.mjs` TypeScript içe aktaramaz (aynı gerekçe: rotaDili.mjs). Testler aynı fonksiyonları doğrudan çağırır;
 * yayındaki kural ile test edilen kural aynı koddur.
 */

/** Anahtarın ortam değişkeni adı. İş akışı ve kapı AYNI sabiti okur: yazım ayrışması kırmızı verir. */
export const E2E_TIP_LINT_ATLA_ANAHTARI = 'VENTHUB_E2E_TIP_LINT_ATLA'

/**
 * Ortam değişkeni değerinden anahtarı okur. YALNIZ tam `'1'` açar; başka her şey kapalı.
 * @param {string | undefined} deger
 * @returns {boolean}
 */
export function e2eTipLintAtlaOku(deger) {
  return deger === '1'
}

/**
 * `next.config`e eklenecek parça. Anahtar kapalıysa BOŞ nesne döner (hiçbir anahtar eklenmez); açıksa tip hatası ve lint
 * `next build`i durdurmaz ve bu iki aşama koşmaz.
 * @param {boolean} acik `e2eTipLintAtlaOku` çıktısı
 * @returns {{ typescript?: { ignoreBuildErrors: true }, eslint?: { ignoreDuringBuilds: true } }}
 */
export function e2eHizliDerlemeAyari(acik) {
  if (!acik) return {}
  return { typescript: { ignoreBuildErrors: true }, eslint: { ignoreDuringBuilds: true } }
}
