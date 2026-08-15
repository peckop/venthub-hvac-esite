# 20 Eksen → VentHub Karşılığı (ajan brifingi için hazır bağlam)

> **Bu dosyanın işi:** eksen ajanının keşifle token yakmasını engellemek. Her eksen için
> *hangi katman, hangi dosyalar, hangi projeye-özel tuzak* yazılı.
>
> ⚠️ **Buradaki maddeler İPUCU, VERDİKT DEĞİL.** 2026-08-15 taramasından çıktılar ve bir kısmı
> açıkça "doğrulanmalı" işaretli. Ajan her iddiayı **kodda `dosya:satır` ile** doğrulamadan
> bulgu yazamaz. Kod ile bu dosya çelişirse **kod kazanır** (dosya bayatlar).
>
> Kaynak metin: `axes.md` · Kapanmışlar: `kapanmis-bulgular.md`

## Önce oku — 4 dosya = 4 mini denetim raporu

Yeni tarama başlamadan şunların baş yorum blokları okunur; aynı sınıf hatayı **tekrar arama**,
ratchet baseline'ının **dışında** kalan yeni örnekleri ara:

- `src/__tests__/conformance/edge-security.test.ts` — R1–R6, 2026-08-14'ün gerçek prod açıklarını kodlar
- `src/__tests__/conformance/edge-select-columns.test.ts` — PostgREST select ↔ şema (INV-8)
- `src/__tests__/conformance/pricing-cache-invariants.test.ts`
- `src/__tests__/conformance/admin-mutate-real-write.test.ts`

## Mimari notu (CLAUDE.md'de yazmayan)

`src/lib/supabase.ts` **deprecated legacy monolitik client** (`export const supabase = ...`) hâlâ
duruyor; DI-dışı kod (`src/lib/orderStatusService.ts`, `src/lib/order.ts`) onu statik import ediyor.
ESLint DI guard'ı (`eslint.config.cjs:167`) yalnız `lib/supabase/client` ve `lib/supabase/server`
yollarını yasaklıyor — legacy `@/lib/supabase` barrel'ı **hiçbir yerde yasaklı değil**. Bugün bir
servis onu import etmiyor, ama guard yakalamazdı. (Boşluk gerçek; ihlal değil.)

---

## 1) Injection & Untrusted Input
- **Nerede:** string-interpolasyonlu PostgREST/URL sorguları — `supabase/functions/iyzico-payment/index.ts:302,366,421,568`; `_shared/tenant_config.ts:16-44`.
- **Giriş noktaları:** tüm `verify_jwt=false` uçlar (liste → `docs/standards/edge-function-security-standard.md` §3.1) + `resolveTenantId`.
- **Tuzak:** PostgREST select string'leri tsc'ye OPAK — INV-8 bu sınıfı ZATEN kapatıyor. Yeniden keşfetme, oradaki allowlist'e bak.

## 2) Authentication & Session
- **Nerede:** `src/middleware.ts:137-200` (admin RBAC kapısı), `resolveUserClaims` (`src/utils/router.ts`), edge'lerde `auth.getUser(jwt)`.
- **Tuzak:** **R1** — argümansız `auth.getUser()` edge'de oturum deposu arar, sessizce 401 verir. 2026-08-14'te 16 fonksiyonda vardı, baseline artık BOŞ → regresyon = FAIL. `middleware.ts:167-178`: `JWT_CLAIMS_COOKIE_SECRET` yoksa prod fail-closed, dev sabit anahtara düşüyor.

## 3) Authorization & IDOR
- **Nerede:** `src/lib/rbac.ts` (**yalnız UI-gating**, gerçek yetki değil), gerçek yetki RLS'te (`supabase/migrations/*f1_role_canonicalization*`, `*f3_tenant_isolation*`) ve edge R5/R6'da.
- **Tuzak:** **R6 + sıralama hatası** — `_shared/tenant_config.ts`: query `?tenant_id=` JWT'den ÖNCE okunuyor (satır 19-21) **ve** JWT payload'ı `atob()` ile imzasız çözülüyor (satır 29). İkisi aynı dosyada, **birlikte** değerlendir → cetvel §3.9. `rbac.ts` sadece UI gizler; "yetki var" sonucuna varmadan DAİMA RLS/edge'i doğrula.

## 4) Secrets & Sensitive Data
- **Nerede:** `scripts/db/migrations/{force-migrate,migrate-db}.js` (artık `process.env.SUPABASE_DB_PASSWORD` — eski literal-şifre bulgusu düzeltilmiş görünüyor; `scripts/db/migrations/backups/` ayrıca bakılmalı), `.env*`, `sentry.*.config.ts`, edge `Deno.env.get(...)`.
- **Tuzak:** `middleware.ts:178` dev fallback sabiti — "hardcoded secret" derken bunu **yanlış-pozitif sayma**; bilinçli dev-only, prod yolu fail-closed.

## 5) Error Handling & Failure Paths
- **Nerede:** `src/lib/errorReporter.ts` — `reportError` var ama `manualReporter` sabit `null` (satır 2), hiç "install" edilmiyor → prod'da **sessiz no-op**; yalnız 3 çağıran. Sentry ayrı yerden mi geliyor (`sentry.{client,server,edge}.config.ts`) **doğrulanmalı**.
- **Giriş noktaları:** edge `catch` blokları — çoğu `console.error` + generic 500; bazıları `if (res.ok)` guard'ıyla sessizce boş veriye düşüyor (INV-8'in sınıfı).

## 6) Concurrency & Races
- **Nerede:** `release-expired-reservations`, `order-housekeeping`, iyzico-callback stok düşümü (~satır 300-310, "atomic idempotent RPC" **iddiası** — RPC'nin atomikliği migration'da doğrulanmalı).
- **Tuzak:** cron fonksiyonlarında advisory-lock **görünmüyor**; eşzamanlı iki koşum aynı süresi-dolmuş rezervasyonu iki kez serbest bırakabilir mi, DB constraint'e mi güveniliyor → doğrula.

## 7) Resource Lifecycle & Leaks
- **Nerede:** `src/lib/pdfGenerator.ts`, `src/lib/images/productImage.ts`, `src/components/products/3d/**` (GLB/GLTF loader, `useEffect` dispose).
- **Tuzak:** 3D conformance testleri (`3d-asset-validity`, `3d-single-canvas`) **statik**; geometry/texture `.dispose()` eksikliğini **KAPSAMIYOR** — runtime leak testi yok.

## 8) Data Access & N+1
- **Nerede:** `src/hooks/useAdminTable.ts`, `src/lib/services/{product,category,family}.service.ts`.
- **Giriş noktaları:** admin liste/detay sayfaları (`src/views/admin/*`) — ilişkili veri ayrı ayrı mı çekiliyor, `select` join mü.
- **Tuzak:** edge'de de N+1 var; `iyzico-payment:366` toplu `id=in.(...)` kullanıyor (iyi örnek) ama `_shared` altında ortak `batchFetch` **yok** → her fonksiyon kendi çözümünü yazıyor (eksen 18 ile kesişir).

## 9) Algorithmic Complexity
- **Nerede:** `src/lib/hvacCalculations.ts`, `src/lib/services/pricingMaterialize.service.ts` (453 satır, ürün×kural×kur), `family.service.ts`.
- **Tuzak:** `pricing-cache-invariants.test.ts` **fonksiyonel doğruluğu** korur, **karmaşıklığı korumaz** — ayrı eksen.

## 10) Memory & Unbounded Growth
- **Nerede:** `scripts/kademe2-load/load.mjs` (CSV tam belleğe mi okunuyor, stream mi), `src/lib/services/inventoryReport.service.ts`, i18n sözlükleri (build-time sabit → runtime riski yok).
- **Tuzak:** admin'de limitsiz `.select()` ara. `useAdminTable.ts` içinde `range()`/`limit()` **ilk taramada bulunamadı** — pagination'ı nasıl uyguladığı ayrıca doğrulanmalı.

## 11) External Calls & Timeouts
- **Nerede:** `iyzico-{payment,callback,refund}`, `notification-service`, `order-confirmation`, `{shipping,delivery,return-status}-notification`, `tcmb-rates-sync`.
- **Tuzak:** **hiçbir `fetch()`'te `AbortController`/timeout görülmedi** (iyzico-payment'taki 6+ çağrının hiçbiri). Platform timeout'u var ama uygulama-seviyesi retry/timeout YOK.

## 12) Idempotency & Retry Safety
- **Nerede:** `iyzico-callback:300-310` (idempotent RPC iddiası → migration'da doğrula), `returns-webhook:75-90` (zorunlu `x-timestamp`), `shipping-webhook:117-129`.
- **Tuzak:** `shipping-webhook` replay guard'ı **opsiyonel** (timestamp header varsa zorluyor), `returns-webhook` **mecburi** → iki webhook farklı sıkılıkta. Cetvel §3.5 mecburi diyor.

## 13) Transaction & Consistency
- **Nerede:** `src/lib/orderStatusService.ts` (statü + return upsert + audit = üç yazma; tek transaction mı **doğrulanmalı**), migration'lardaki plpgsql RPC'ler (gerçek transaction sınırı) vs edge'in ardışık REST çağrıları (sınır YOK).
- **Tuzak:** CLAUDE.md §11 "durumlar MONOTON" — monotonluk DB constraint'inde mi yalnız servis katmanında mı? `iyzico-callback` doğrudan REST ile `venthub_orders` PATCH ediyor → servisi BYPASS ediyor, iki yerde ayrı kontrol = drift riski.

## 14) Config & Env Hardening
- **Nerede:** `supabase/config.toml` (verify_jwt SSOT — R4 per-fonksiyon toml'ları yasaklıyor), `next.config.mjs` (CSP), `middleware.ts:91-96`.
- **Tuzak:** `middleware.ts:94-96` — `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` tanımsızsa `setTenantCookie(response)` ile **erken dönüyor**; admin RBAC bloğu (satır 138) ve UUID redirect (99) bu dönüşten SONRA → env eksikse ikisi de hiç çalışmaz. Güvenlik açığı değil ama davranış sürprizi; **doğrula**.

## 15) Dependency & Supply Chain
- **Nerede:** `package.json` — **`@supabase/ssr` ve `@supabase/supabase-js` = `"latest"`** (satır 40-41, PIN YOK → her install farklı sürüm, CI/prod tutarsızlığı). `pnpm.overrides` bilinçli CVE patch'leri taşıyor (iyi sinyal, güncel tut).
- **Tuzak:** edge'ler CDN import'u kullanıyor; `release-expired-reservations/index.ts` içinde **aynı dosyada iki farklı supabase-js sürümü** (`@2.39.3` ve `@2.45.4`), bazı yerlerde pin'siz `@2`.

## 16) Logging & Observability
- **Nerede:** `src/lib/errorReporter.ts` (eksen 5), `sentry.{client,server,edge}.config.ts`, `supabase/functions/_shared/sentry.ts`, `supabase/functions/log-client-error/`.
- **Tuzak:** "Sentry var → loglama tamam" diye **atlama**. `errorReporter.ts` ayrı ve boş bir katman; `manualReporter`'a `Sentry.captureException` set eden bir yer bulunamadı.

## 17) API Contract Consistency
- **Nerede:** `src/types/database.types.ts` (üretilmiş SSOT, `pnpm supabase:gen`), `src/types/{ui-models,db-rows}.ts`, `src/lib/type-converters.ts`.
- **Tuzak:** INV-8 yalnız **statik** select listelerini doğrular; `select=*` ve template-interpolasyonlu dinamik listeler **bilinçli kapsam dışı** → elle taranmalı.

## 18) Cross-Module Contracts
- **Nerede:** `src/lib/services/registry.ts`, `supabase/functions/_shared/*` (cors/notify/rate_limit/sentry/tenant_config), migration↔edge↔frontend üçgeni (pricing conformance testleri).
- **Tuzak:** **repo ≠ prod edge drift** — 11 ay sürdü. "Kod böyle diyor" YETMEZ. `.github/workflows/deploy-functions.yml` artık kapsamı dizinden türetiyor ve `scripts/edge/drift-check.mjs` sapmayı CI'da ölçüyor; iddia yazmadan önce **drift raporuna** bak.

## 19) Test Gap & Assertion Quality
- **Nerede:** `src/__tests__/conformance/` (güçlü, ratchet-disiplinli — iyi örnek seti), `src/lib/services/__tests__/` (pricing iyi kaplı: 24+16+13+11 test), `vitest.config.ts` (coverage threshold **YOK**).
- **Tuzak:** `supabase/` klasörü `tsconfig.json`'da **HARİÇ** → `deno check` ayrı koşmadıkça edge kodu hiçbir type-check'ten geçmez (`--node-modules-dir=none` ile). Edge fonksiyonlarının **birim testi yok** — edge açıklarının statik conformance ile yakalanıp davranışsal testle yakalanmamasının kök nedeni.

## 20) Falsification pass
`axes.md`'deki metni birebir uygula. VentHub'a özel ek: **repo ≠ prod** ve **kapsam ≠ gerçek** iki
klasik yanlış-pozitif/yanlış-negatif kaynağıdır — "prod'da kırık" iddiası deploy edilmiş kaynaktan
doğrulanmadan CONFIRMED olamaz.
