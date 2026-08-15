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

## Hâlâ AÇIK — bilinçli borç, yeniden raporlama gerekmez ama kapanmış da sayma

| Eksen | Borç | Kayıtlı olduğu yer |
|---|---|---|
| 3 | `_shared/tenant_config.ts` — query `?tenant_id=` JWT'yi eziyor + `atob` imzasız | cetvel **§3.9** · R6 baseline · E12 (yazılmadı) |
| 3 | `apply-coupon` kendi `buildCors()`'unu yazıyor | R3 baseline |
| 3 | `iyzico-callback` (HMAC yok), `shipping-status` (yalnız IP rate-limit) | R5 baseline |
| 12 | `shipping-webhook` replay guard'ı opsiyonel, `returns-webhook` mecburi | cetvel §3.5 |
| 5/16 | `errorReporter.manualReporter` hiç install edilmiyor → prod'da sessiz no-op | *(kayıtsız — ilk denetimde açılacak iş)* |
| 15 | `@supabase/{ssr,supabase-js}` = `"latest"` (pin yok) | *(kayıtsız)* |

## Nasıl güncellenir

Bir FAIL düzeltildiğinde: satırı **Kapanmış** tablosuna taşı, **kilitleyen test yolunu yaz**.
Kilit yazılamıyorsa "yazılamaz" gerekçesini açıkça yaz — sessizce kapanmış sayma.
