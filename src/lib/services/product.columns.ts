// Kolon SSOT — F5-B W0.1 (docs/plans/f5b-family-architecture-plan.md)
// products / product_families select listelerinin TEK kaynağı. Kolon ekleme/çıkarma
// (özellikle W4.1 legacy DROP) yalnız bu dosyada yapılır; sorgularda ham literal yasak.

// W4b (2026-08-14): ham `price` kolonu bu listelerden ÇIKARILDI — müşteri yüzeyi
// artık ham fiyatı hiç ÇEKMEZ (INV-PRICE-1'in kaynaktaki karşılığı). Vitrin fiyatı
// TÜRETİLİR: `display_price(products)` computed column'ı → `get_display_prices` RPC'si
// → `displayPrice.service.ts`. Bu listelere `price` GERİ EKLEME.

// REC-140 (2026-09-24): `purchase_price`, `supplier_name` ve `warehouse_location` vitrin
// listesinden ÇIKARILDI. VARIANT_DETAIL_COLUMNS vitrin sorgularının kümesidir (ana sayfa
// RSC yükü, sepet, ürün seçici, sipariş detayı); alış fiyatı ana sayfa HTML'inde 12 kez
// görünüyordu. Yönetici formu kendi listesini kullanır: ADMIN_PRODUCT_FORM_COLUMNS.
// Vitrin listelerine maliyet/tedarikçi kolonu GERİ EKLEME — vitrin-maliyet-kolonu testi
// kırmızı yanar.

// F5-B D4 (2026-08-12): legacy kolonlar DROP edildi (description, image_url,
// airflow_capacity, noise_level, pressure_rating, meta_title, meta_description,
// is_category_manual) — migration 20260812_f5b_d4_drop_legacy_columns.sql.
// Açıklama = description_i18n (JSONB {tr,en}) · spec'ler = technical_specs ·
// görsel = product_images + resolver. Bu listelere o kolonları GERİ EKLEME.

/** PDP ve tekil ürün okumaları — technical_specs dahil tam küme. */
export const VARIANT_DETAIL_COLUMNS =
  'id, name, brand, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description_i18n, family_id, stock_qty, low_stock_threshold, low_stock_override, technical_specs, created_at, updated_at'

/**
 * Yönetici ürün formu — vitrin kümesi + alış fiyatı. Form alış fiyatını okuyup geri
 * yazar; bu kolon okunmazsa kaydedilen ürünün alış fiyatı 0'a ezilir. YALNIZ yönetici
 * yüzeyi (RLS yazmayı zaten yöneticiye kısıtlar; okuma kısıtı DB tarafında ayrı iş).
 */
export const ADMIN_PRODUCT_FORM_COLUMNS =
  'id, name, brand, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description_i18n, family_id, stock_qty, low_stock_threshold, low_stock_override, technical_specs, created_at, updated_at, purchase_price'

/**
 * Liste/kart bağlamları — technical_specs taşınmaz (PS-041: spec'ler liste
 * payload'ına girmez).
 */
export const VARIANT_LIST_COLUMNS =
  'id, name, brand, sku, slug, model_code, category_id, subcategory_id, status, is_featured, family_id, stock_qty, created_at, updated_at'

/** product_families liste okumaları (RPC dışı doğrudan select'ler için). */
export const FAMILY_LIST_COLUMNS =
  'id, name, slug, series_code, description, brand_id, category_id, subcategory_id, sort_order, created_at, updated_at'
