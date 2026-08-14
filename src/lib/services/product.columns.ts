// Kolon SSOT — F5-B W0.1 (docs/plans/f5b-family-architecture-plan.md)
// products / product_families select listelerinin TEK kaynağı. Kolon ekleme/çıkarma
// (özellikle W4.1 legacy DROP) yalnız bu dosyada yapılır; sorgularda ham literal yasak.

// W4b (2026-08-14): ham `price` kolonu bu listelerden ÇIKARILDI — müşteri yüzeyi
// artık ham fiyatı hiç ÇEKMEZ (INV-PRICE-1'in kaynaktaki karşılığı). Vitrin fiyatı
// TÜRETİLİR: `display_price(products)` computed column'ı → `get_display_prices` RPC'si
// → `displayPrice.service.ts`. Bu listelere `price` GERİ EKLEME.
// `purchase_price` KALIR: o alış/liste fiyatıdır, fiyat motorunun girdisidir.

// F5-B D4 (2026-08-12): legacy kolonlar DROP edildi (description, image_url,
// airflow_capacity, noise_level, pressure_rating, meta_title, meta_description,
// is_category_manual) — migration 20260812_f5b_d4_drop_legacy_columns.sql.
// Açıklama = description_i18n (JSONB {tr,en}) · spec'ler = technical_specs ·
// görsel = product_images + resolver. Bu listelere o kolonları GERİ EKLEME.

/** PDP ve tekil ürün okumaları — technical_specs dahil tam küme. */
export const VARIANT_DETAIL_COLUMNS =
  'id, name, brand, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description_i18n, family_id, stock_qty, low_stock_threshold, low_stock_override, technical_specs, created_at, updated_at, warehouse_location, supplier_name, purchase_price'

/**
 * Liste/kart bağlamları — technical_specs taşınmaz (PS-041: spec'ler liste
 * payload'ına girmez).
 */
export const VARIANT_LIST_COLUMNS =
  'id, name, brand, sku, slug, model_code, category_id, subcategory_id, status, is_featured, family_id, stock_qty, created_at, updated_at'

/** product_families liste okumaları (RPC dışı doğrudan select'ler için). */
export const FAMILY_LIST_COLUMNS =
  'id, name, slug, series_code, description, brand_id, category_id, subcategory_id, sort_order, created_at, updated_at'
