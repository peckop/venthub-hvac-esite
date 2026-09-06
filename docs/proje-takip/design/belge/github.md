
repo: peckop/venthub-hvac-esite
branch: master
path: supabase/migrations, src/views/legal, src/config, src/utils, src/lib/kvkk, src/i18n/dictionaries

## Last sync
date: 2026-09-06T11:09:13Z
### Updated in this project
- Keşif Raporu dizildi: `20251218_wizard_selections.sql` + `20260612000000_dealer_layer_baseline.sql` (user_projects · project_items) okundu — keşfin sistemdeki karşılığı `wizard_selections`; tablonun kendi yorumu gerekçeyi veriyor ("hukuki koruma amaçlı")
- Kutucuk listeleri kolon değerlerinden: usage_location (4) · wind_condition (4) · traffic_intensity (3) · climate_zone (3) · heating_needed (3); hesap sonuçları `calculated_*` üç kolon, kâğıtta BOŞ (formülü sistem çalıştırır)
- Ölçüm: raporun yedi alanının kolonu YOK (müşteri/adres/yetkili/telefon · saha personeli · mahal alanı/tavan yüksekliği · kroki · rapor düzeyi bulgu · müşteri onayı · rapor no) → 153-28

## Onceki sync
date: 2026-09-06T09:53:05Z
### Updated in this project
- KVKK seti dizildi: `20260816120000_kvkk_data_subject_requests.sql` (T063) + `src/lib/kvkk/dueState.ts` okundu — `data_subject_requests` 16 kolon, `request_type` altı tür, `status` beş durum; listeler CHECK kısıtından, uydurma yok
- 30 gün belgeye sayı olarak YAZILMADI: otorite DB `due_at` default'u — `dueState.ts` gün aritmetiğini istemciye bağlamayı açıkça reddediyor; gecikme sayacı `TERMINAL_STATUSES`'ta donar
- Kısmi ret gerekçesi kodun kendi format string'i (`anonymize_user_personal_data` → `retained_data_note`); işlem dökümü tablosu fonksiyonun jsonb rapor anahtarlarından (silinen · anonimleştirilen · saklanan)
- Ölçüm: başvuru kâğıdının beş alanının kolonu YOK (talep metni · ad soyad · kimlik no/adres · telefon · başvuru no) → 153-27

## Sync history
- 2026-09-06T06:05Z — Satınalma seti EN: `20260816143015_purchasing_t062_core.sql`. Ölçüm: PO numarası kolonu yok, RFQ ve uygunsuzluk kaydı için tablo yok → 153-20/21/22; `UNIQUE (po_id, document_no)` kilidi belgeye geçti
- 2026-09-06T04:52Z — Yasal set: `DistanceSalesAgreementContent.tsx` (14 bölüm) + `PreInformationContent.tsx` (15 bölüm) birebir; yer tutucu konvansiyonu `src/config/legal.ts`. `venthub_returns` ölçüldü: kalem/adet · tutar · başvuru no kolonu yok
- 2026-09-06T04:00Z — Ürün teknik föyü: spec mantığı `src/utils/productHelpers.ts`'ten; etiketler `src/i18n/dictionaries/tr.ts` → `pdp.specs.*` (zincir `specLabel.ts`)
- 2026-09-05T16:50Z — E-posta şablonları: `order_confirmation.html` + `index.ts`. Motor sınırı ölçüldü (`renderTemplate` yalnız `{{alan}}` ve `{{#if}}`, döngü yok)
- 2026-09-05T10:35Z (tree 6ec284ab3c09) — satınalma modülü bulundu, K3 listesinde yoktu → kapsam görüşü

## Screen map
| Ekran | Depo dosyaları |
|---|---|
| alan-envanteri-2026-09-05.md | supabase/migrations/20260816125346_quotes_v1.sql · 20260826233000_quote_v2_schema.sql · 20260828120000_quote_admin_yazma_yolu.sql · 20260820090000_order_invoices.sql · docs/database_schema_master.md · docs/standards/quote-standard.md |
| Teklif Talebi Ozeti v1.dc.html | venthub_quotes · venthub_quote_items · project_items · user_projects · src/lib/services/quoteService.ts |
| Teklif v1.dc.html | venthub_quotes v2 alanları · venthub_quote_items fiyat alanları · user_invoice_profiles · quote-standard §6 §7 §12 |
| Proforma v1.dc.html | venthub_orders · venthub_order_items snapshot alanları · quote-standard §10 (fiyat otoritesi) |
| E-Fatura Gorunumu v1.dc.html | order_invoices (20260820090000_order_invoices.sql) · venthub_orders.invoice_type · invoice_info · billing_address |
| Siparis Onayi v1.dc.html | venthub_orders (order_number · payment_status · legal_consents · subtotal_snapshot · total_amount) · venthub_order_items |
| Kargo Bildirimi v1.dc.html | venthub_orders (carrier · tracking_number · tracking_url · shipped_at · delivered_at · shipping_method) · 202508271740_add_shipping_tracking_fields.sql |
| email/talep-alindi.html · email/teklif-yanitlandi.html · email/hesap-olusturuldu.html | supabase/functions/order-confirmation/templates/email/order_confirmation.html · supabase/functions/order-confirmation/index.ts (renderTemplate · getTenantBranding alanları) |
| E-Posta Provasi.dc.html | aynı iki dosya (motor kuralları birebir taklit) |
| Urun Teknik Foyu.dc.html | src/utils/productHelpers.ts · src/utils/specLabel.ts · src/i18n/dictionaries/tr.ts (pdp.specs.*) (translateSpecKey · formatSpecValue · groupTechnicalSpecs · SPEC_SORT_ORDER · getProductDisplayName/ModelLabel) |
| kapsam-ve-belge-sistemi-onerisi-2026-09-05.md | 20260816143015_purchasing_t062_core.sql · 20260816120000_kvkk_data_subject_requests.sql · 202508271900_venthub_returns.sql · 20260816120000_pricing_w5_policy_fx_lock.sql · docs/standards/quote-standard.md |
| Mesafeli Satis Sozlesmesi v1.dc.html | src/views/legal/components/tr/DistanceSalesAgreementContent.tsx · src/config/legal.ts |
| On Bilgilendirme Formu v1.dc.html | src/views/legal/components/tr/PreInformationContent.tsx · src/config/legal.ts |
| Cayma ve Iade Formu v1.dc.html | supabase/migrations/202508271900_venthub_returns.sql (metin yok — alan yerleşimi) |
| Purchase Order v1.dc.html | supabase/migrations/20260816143015_purchasing_t062_core.sql (purchase_orders · purchase_order_items · suppliers) |
| Request for Quotation v1.dc.html | aynı migration (suppliers) · products — RFQ kaydı şemada yok |
| Goods Receipt Note v1.dc.html | aynı migration (goods_receipts · process_goods_receipt · inventory_movements kanıt alanları) |
| Supplier Non-Conformance Report v1.dc.html | aynı migration (suppliers · purchase_orders.close_note · goods_receipts.note) — uygunsuzluk kaydı şemada yok |
| KVKK Basvuru Formu v1.dc.html | supabase/migrations/20260816120000_kvkk_data_subject_requests.sql (data_subject_requests · request_type CHECK · status CHECK · identity_verified_at) |
| KVKK Basvuru Yanit Yazisi v1.dc.html | aynı migration (outcome · retained_data_note · due_at · anonymize_user_personal_data jsonb raporu) · src/lib/kvkk/dueState.ts (TERMINAL_STATUSES · due_at otoritesi) |
| Kesif Raporu v1.dc.html | supabase/migrations/20251218_wizard_selections.sql (door_width_cm · usage_location · wind_condition · traffic_intensity · climate_zone · heating_needed · calculated_* · recommended_series) · 20260612000000_dealer_layer_baseline.sql (user_projects · project_items) |

