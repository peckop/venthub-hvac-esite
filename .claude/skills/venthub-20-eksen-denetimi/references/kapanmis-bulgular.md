# Kapanmış Bulgular (ratchet) — ajanlara VER, yeniden raporlanmasın

> **Kabul kuralı:** bir satırın buraya girmesi için **onu kilitleyen test** yolu yazılı olmalı.
> Kilitleyen testi olmayan "düzeltildi" kaydı **KABUL EDİLMEZ** — o bir yamadır, geri gelir.
> Sütun boşsa satır buraya değil, hâlâ açık bulgular listesine aittir.
>
> Bir kilit **kaldırılırsa** satırı buradan sil; yoksa gelecekteki ajan körleşir.

## 2026-08-13 → 2026-08-15 · Edge katmanı (T011 + T018 zinciri)

| Eksen | Bulgu | Kilitleyen |
|---|---|---|
| 2 | `auth.getUser()` argümansız — 16 fonksiyonda, edge'de daima 401 (checkout doğrulaması dâhil) | `src/__tests__/conformance/edge-security.test.ts` · **R1**, baseline BOŞ |
| 1/18 | Codemod `_`-rename ile edge kaynaklarını bozdu, prod'a deploy edildi (tsconfig `supabase/`'i hariç tutuyor, kapı kördü) | CI `deno check --node-modules-dir=none` + grep-guard (`.github/workflows/ci.yml`) — PR #494 |
| 18 | Codemod'un **üçüncü** zarar sınıfı: `getCorsHeaders` import edilip **çağrılmadı**, `Access-Control-Allow-Origin` silindi (9 fonksiyon) | CI "Edge CORS guard" adımı + **R2/R3** |
| 3 | `refund-order-mock` imzasız `atob(jwt)` ile sahte `sub` kabul → iade + stok iadesi | **R6** (baseline'da yalnız `tenant_config.ts:29` kaldı) |
| 3 | 4 canlı **anonim** açık: `admin-order-inspect`, `admin-iyzico-reconcile`, `refund-order-mock`, `stock-alert` | `supabase/config.toml` `verify_jwt=true` + **R5** + prod'dan **çağırarak** doğrulama (hepsi 401) |
| 3 | 2 **yatay yetki** açığı: `admin-orders-latest`, `admin-update-shipping` (oturumlu müşteri tüm siparişleri okuyor/yazıyordu) | cetvel §3.2 + prod doğrulaması; **statik kilit E9 HENÜZ YOK** → bu satır yarı-kapalı, ajan §3.2'yi yine denetlesin |
| 14 | 6 adet no-op/yanıltıcı per-fonksiyon `supabase/functions/*/supabase.toml` | **R4**, baseline BOŞ (2026-08-15'te bilerek bozulup FAIL görüldü) |
| 14/18 | CI 26 fonksiyondan yalnız **7'sini** deploy ediyordu; 19'u prod'da 11 ay dondu | `.github/workflows/deploy-functions.yml` (kapsam dizinden türetiliyor) + `scripts/edge/{select-functions,drift-check}.mjs` |
| 17 | PostgREST select ↔ şema uyuşmazlığı (statik select listeleri) | `src/__tests__/conformance/edge-select-columns.test.ts` (INV-8) |
| 11 | `iyzico-callback` sandbox URL'ini SABİT kodluyordu (prod anahtarıyla: para çekilir, sipariş doğrulanamaz) — T022-VH | *(kilit YOK — env-okuma deseni cetvelde yazılı değil; E-kuralı adayı)* |
| 12 | `shipping-webhook` replay guard'ı **"başlık VARSA uygula" = fail-OPEN** idi; kardeşi `returns-webhook` zorunlu tutuyordu (asimetri) — T025-VH | `tests/e2e/adversarial.test.ts` **test 7** (geçerli imzalı + timestamp'siz → 401). Bilerek-bozularak kanıtlandı. Cetvel §3.5 |
| 18 | **Repo ≠ prod sapması ÖLÇÜLDÜ: 26/26 fonksiyon + 5/5 `_shared` dosyası BİREBİR AYNI** (2026-08-15, CLI ile prod'dan indirilip karşılaştırıldı). W1/W2 deploy'ları tuttu; 11 aylık sapma kapandı. | `scripts/edge/drift-check.mjs` + günlük CI cron. ⚠️ Ölçüm **elle** yapıldı; otomatik dedektör T024-VH bitene kadar "ölçemedim" (exit 2) diyor — o iş bitmeden bu satır tam kilitli sayılmaz. |

| 15 | Edge'de **üç farklı** supabase-js sürümü; 5 import PİN'SİZ `@2` (esm.sh deploy anında çözer → aynı kaynak iki farklı sürüm). İki dosya AYNI dosyada iki sürüm taşıyordu. Kayma teorik değildi: `deno.lock` `@2`'yi 2.101.1'e çözmüştü — T028-VH | 27 import → tek sürüm (2.45.4); `deno check --node-modules-dir=none supabase/functions/*/index.ts` 26/26. **Statik kural HENÜZ YOK** → önerilen R12 (pin zorunlu + tek sürüm + dosya-içi tutarlılık) yazılmadı, bu satır yarı-kapalı |
| 14 | `ci.yml` ve `e2e-smoke.yml` hem `pull_request` hem `push:['**']` ile tetikleniyordu → **aynı commit iki kez** test ediliyordu. Private repo'da Actions dakikası ücretli; PR başına ~14,5 dk saf israf, hesabın iş başlatmayı reddetmesine katkı verdi (2026-08-15) | `push.branches` artık `[master]`. Kapsam kaybı yok (dalda `pull_request`, master'da `push`). *(Kilit yok — "iki tetikleyici çakışıyor mu" statik kuralı yazılabilir, aday)* |
| 2/3 | `resolveTenantId` tenant'ı istekten alıyordu; sınıf-(a) uçlarında rol sorgusu `tenant_id=eq.${tenantId}` ile filtreliydi → **profili okumak için tenant'ı bilmek gerekiyordu**, bu yüzden istekten okuma "zorunlu" görünüyordu — T026-VH Adım 1–5 | `_shared/tenant.ts` (isteği GÖREMEYEN saf modül) + `_shared/caller.ts`; `supabase/functions/_shared/__tests__/tenant.test.ts` 15 test, bilerek-bozularak kanıtlandı. R11 baseline Adım 6'da boşalacak |
| 3 | `order-confirmation` · `return-status-notification` · `shipping-notification` sınıf (a+b) oldukları hâlde `verify_jwt=false` ile geçidi açık bırakıyordu (§3.1 ihlali) | `config.toml` → `true`. Yön kontrolü yapıldı: prod'da üçü de `false` idi → deploy **sıkılaştırır**. Çağıranların hepsi geçerli JWT taşıyor (service_role veya oturumlu admin) |
| 19 | **R5 dedektörü körleşti:** kimlik kapısı ortak modüle taşınınca statik sinyaller uç dosyasında kalmadı; kural doğruydu, dedektör eskiydi → 3 uçta yanlış-pozitif | `IDENTITY_SIGNALS`'a **iki parçalı** sinyal: `resolveCaller(` **ve** `ctx.kind` okuması. Çift kanıt: uç `false`a döndürülünce tanındı; `.kind` okuması kaldırılınca yeniden FAIL etti (yani zayıflatmıyor) |

## Hâlâ AÇIK — bilinçli borç, yeniden raporlama gerekmez ama kapanmış da sayma

| Eksen | Borç | Kayıtlı olduğu yer |
|---|---|---|
| 3 | `_shared/tenant_config.ts` — query `?tenant_id=` JWT'yi eziyor + `atob` imzasız. **Yerine geçen modül hazır** (`_shared/tenant.ts`), uçlar Adım 2–5'te göçtü; eski modül **Adım 6**'da silinecek | cetvel **§3.9** · **R6 + R11 baseline'ında adıyla** (E12 artık CANLI) · plan `docs/plans/tenant-id-hardening-2026-08-15.md` |
| 3 | `apply-coupon` kendi `buildCors()`'unu yazıyor | R3 baseline |
| 3 | `iyzico-callback` (HMAC yok), `shipping-status` (yalnız IP rate-limit) | R5 baseline |
| 15 | **npm** tarafı `@supabase/{ssr,supabase-js}` hâlâ `"latest"` (pin yok; kurulu: 0.12.4 / 2.112.3). Edge tarafı T028'de kapandı, npm tarafı AÇIK | registry **T016-VH** |
| 5/16 | Prod hata raporlama zinciri **kod tarafında** bağlandı (T014) ama `log-client-error` varsayılan `REQUIRE_AUTH=true` → yalnız oturumlu kullanıcı hataları kaydediliyor; anonim ziyaretçi 401. Ayrıca Sentry DSN hiçbir `.env*.example`'da yok | registry **T014-VH** · pano notu LAUNCH'a |

## Nasıl güncellenir

Bir FAIL düzeltildiğinde: satırı **Kapanmış** tablosuna taşı, **kilitleyen test yolunu yaz**.
Kilit yazılamıyorsa "yazılamaz" gerekçesini açıkça yaz — sessizce kapanmış sayma.
