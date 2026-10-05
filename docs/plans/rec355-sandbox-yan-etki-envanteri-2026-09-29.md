# REC-355 · İyzico sandbox provası — yan etki envanteri (OPS şart 4)

Tarih: 2026-09-29 · Sahip: ALTYAPI · Yöneten cetvel: `docs/plans/rec355-satis-kipi-edge-plani-2026-09-29.md` (v2, B′ hükmü şart 4) ·
Ölçüm yöntemi: canlı katalog salt okuma (`pg_trigger`, `pg_get_functiondef`) + edge kodu okuma (`supabase/functions`). Hiçbir yazma yok.

Amaç: satış kapalıyken B′ izniyle sandbox'ta verilecek TEK deneme siparişinin canlıda neye dokunacağını, prova ÖNCESİ bilmek.
Bu belge prova koşumunu onaylamaz; koşum ayrı Recep kapısıdır.

## 1. Akış (ölçüldü)

1. `iyzico-payment` → `order-validate` (fiyat + stok denetimi, yazmaz) → `venthub_orders` satırı servis anahtarıyla yazılır
   (`coupon_code` istekten kopyalanır, `coupon_discount` 0).
2. İyzico sandbox ödeme sayfası → `iyzico-callback`.
3. `iyzico-callback` (başarılı ödeme): kupon sonuçlandırma (`increment_coupon_usage` RPC, en iyi çaba) → stok düşümü
   (`process_order_stock_reduction` RPC, idempotent; kanıt `inventory_movements` `order_sale`) → düşük stok eşiği altındaysa
   `stock-alert` fonksiyonu → `payment_debug` güncellemesi.
4. Veritabanı tetikleri (`venthub_orders`, canlı katalogdan): `trg_sync_payment_status_ins/upd`, `trg_stamp_order_paid_at`,
   `set_order_number_trigger`, `trg_notify_order_paid` (AFTER UPDATE; e-posta/webhook), `orders_istemci_yazma_bekcisi`
   (#1454, istemci yazmasını keser; servis rolü geçer). `venthub_order_items`: `order_items_istemci_yazma_bekcisi`.
5. `trg_notify_order_paid` → `order-paid-webhook` → `order_email_events` + müşteri e-postası.
6. Fatura: `order_invoices` tetiği `trg_invoice_requires_paid_order` (BEFORE INSERT) yalnız ödenmiş siparişe fatura kaydına izin verir.
   Fatura oluşturan otomatik bir kod yolu bu ölçümde bulunmadı (entegratör seçilmedi).

## 2. Yan etki tablosu

| Etki | Ne olur | Gerçek veriye dokunur mu | Provada önlem | Ölçüm durumu |
|---|---|---|---|---|
| Stok | `process_order_stock_reduction` `inventory_movements`e `order_sale` yazar, stok düşer | EVET (deneme ürünü gerçek ürünse gerçek stok) | Gerçek stoka dokunmayan deneme ürünü YA DA prova sonunda iade/iptal ile `process_order_stock_restore` | ÖLÇÜLDÜ (canlı tanım): `process_order_stock_reduction` YALNIZ `inventory_movements` günceller, `products`a doğrudan yazmaz, `adjust_stock_v2` çağırmaz. `process_order_stock_restore` `inventory_movements` ekler VE `products` günceller (geri vermede vitrin tetikleri ateşlenir). Ürün stokunun düşüşünün hangi yoldan `products`a yansıdığı ölçülmedi (sipariş oluşturma anındaki rezervasyon yolu okunmalı) |
| Kupon | Siparişte `couponCode` varsa kullanım sayısı artar | EVET (sayaç) | Provada kupon KULLANILMAZ | ÖLÇÜLDÜ: `increment_coupon_usage` yalnız `coupons` günceller; `coupons` üzerinde yalnız `updated_at` tetiği var, başka yan etki yok |
| E-posta | `order-paid-webhook` müşteri e-postası + `order_email_events` satırı; düşük stokta `stock-alert` | EVET (dış etki) | Alıcı yalnız Recep'in kendi adresi; e-posta alanı doğrulanmadan (karar 192) e-posta adımı yapılmaz | Alan doğrulaması bekliyor; `*_email_events` 3 tablo boş |
| Fatura | Otomatik yol yok; elle `order_invoices` girişi ancak ödenmiş siparişe | HAYIR (bu ölçümde) | Provada fatura kaydı açılmaz | Otomatik yol arandı, bulunmadı |
| Denetim izi | Sipariş güncelleme admin yolundan yapılırsa `admin_audit_log`; ürün stoku değişince `denetim_izi_products*` | EVET (satır ekler) | Prova sonrası satırlar "deneme" bayrağıyla ayırt edilir | Ürün tetikleri ölçüldü; `admin_audit_log` alanları okunmadı |
| Vitrin/arama | Ürün satırı güncellenince `on_products_change` (webhook), `arama_urun_tazele`, `url_takma_ad_urun` tetiklenir: vitrin sayfası yeniden üretilebilir | EVET (canlı sayfa tazelenir) | Stok düşümü ürün satırını GÜNCELLİYORSA tetiklenir; deneme ürünü yayında olmayan bir ürünse etkisi vitrine yansımaz | Stok düşümünün `products` satırını güncelleyip güncellemediği ölçülmedi |
| Ödeme | Sandbox: gerçek para hareketi yok | HAYIR | Şart 7: canlı `IYZICO_BASE_URL` sandbox mı, secret okumadan ölçülür | Ölçülmedi (ayrı adım) |

## 3. Açık ölçümler (prova ÖNCESİ kapanmalı)

1. (KISMEN KAPANDI, bkz. tablo) Ürün stokunun sipariş sırasında hangi yoldan düştüğü: `products` satırı güncelleniyorsa vitrin tetikleri ateşlenir; `iyzico-payment` sipariş yazma bölgesi ve rezervasyon yolu okunmalı.
2. (KAPANDI) `increment_coupon_usage` yalnız `coupons` yazar; kuponsuz provada sayaç değişmez.
3. Deneme ürünü seçeneği: `order-validate` yayında olmayan ya da fiyatı 1 TL olan ürünü kabul ediyor mu (`is_active` denetimi).
4. `stock-alert` alıcısı (deneme stok eşiğini geçerse kime e-posta gider).
5. Geri alma yolu: `iyzico-refund` sandbox'ta çalışıyor mu; iade sonrası `process_order_stock_restore` stoğu sıfırlıyor mu.

## 4. Öneri (karar OPS/Recep'te)

Deneme ürünü + kuponsuz + alıcı Recep'in adresi + prova sonunda iade adımı (geri almayı ve "iade" akışını birlikte sınar).
Bu önerinin dayandığı üç ölçüm (3.1, 3.3, 3.5) yapılana kadar prova KOŞULMAZ.

## 4b. Bağımsız çürütmeden gelen, provayı ilgilendiren notlar (2026-09-29)

- **Deneme bayrağı sipariş satırında DEĞİL, `admin_audit_log`'da** (OPS şart 3'ten bilinçli sapma). Sebep: `iyzico-callback` `payment_debug`'ı
  baştan yazıyor (`index.ts:348`, `:490`); bayrak orada ödemeden sonra kaybolurdu. Sonuç: `venthub_orders` satırı normal `pending` sipariş görünür;
  stok düşümü, onay e-postası, fatura ve raporlar satırdan deneme olduğunu göremez. Deneme siparişini ayırt etmek için
  `admin_audit_log.row_pk = venthub_orders.id` birleşimi gerekir. Denetim satırında `actor` boş kalır (servis anahtarında `sub` yok);
  kullanıcı kimliği `after.user_id` içindedir. Kalıcı satır bayrağı istenirse ayrı kolon gerekir (migration, ayrı Recep kapısı).
- Sipariş yazımı düşerse denetim satırı boşta kalır (var olmayan `row_pk`); temizlikte birleşim boş döner, zararsız.
- Şart 6 alarmı ("liste dolu ama ortam sandbox değil") yalnız ödeme isteği gelince çalışır; `auditConfig`/healthz `SATIS_KIPI_DENEME_KULLANICILARI`'na bakmaz.
  Canlıya geçişte kimse ödeme denemezse unutulmuş liste sessiz kalır → açık iş: `auditConfig`'e "ortam prod + liste dolu" kalemi.
- Konformans testinin "sipariş yazan uç" tespiti dar (tek tırnaklı `method: 'POST'` + şablon `fetch`); supabase-js `.insert`/RPC ile sipariş yaratan
  yeni bir uç yakalanmaz. Bugünkü evren tek dosya ve doğru → açık iş: tespiti genişlet.

## 5. Geri alma (prova sonrası)

Deneme siparişi `payment_debug` içindeki deneme bayrağıyla ayrılır; stok `process_order_stock_restore` ile geri verilir; kupon kullanılmadığı için sayaç işi yok;
B′ izin listesi (`SATIS_KIPI_DENEME_KULLANICILARI`) boşaltılır ve "ortam canlı + liste dolu" alarmı kapalı doğrulanır (şart 6).
