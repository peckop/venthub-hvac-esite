// Kolon SSOT — F5-B W0.1 (docs/plans/f5b-family-architecture-plan.md)
// products / product_families select listelerinin TEK kaynağı. Kolon ekleme/çıkarma
// (özellikle W4.1 legacy DROP) yalnız bu dosyada yapılır; sorgularda ham literal yasak.

// F5-B W3.2 (legacy-okuma temizliği) doğruladı: description, image_url,
// airflow_capacity, noise_level, pressure_rating, meta_title, meta_description,
// is_category_manual kolonları prod'da fiilen hep NULL/redundant (description hariç —
// o da description_i18n->>'tr' ile birebir aynı). D4'te (kolon DROP) bu iki satırdan
// -- D4'te çıkacaklar: description, image_url, airflow_capacity, noise_level,
// pressure_rating, is_category_manual, meta_description, meta_title
// aynı anda çıkarılacak. O ana kadar select listesinde KALIR (davranış değişmesin) —
// tüm okuyucular şimdiden description_i18n/technical_specs/resolver'a geçirildi.

/** PDP ve tekil ürün okumaları — technical_specs dahil tam küme. */
export const VARIANT_DETAIL_COLUMNS =
  'id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, description, description_i18n, family_id, image_url, stock_qty, low_stock_threshold, low_stock_override, technical_specs, airflow_capacity, noise_level, pressure_rating, created_at, updated_at, warehouse_location, supplier_name, is_category_manual, meta_description, meta_title, purchase_price'

/**
 * Liste/kart bağlamları — technical_specs taşınmaz (PS-041: spec'ler liste
 * payload'ına girmez). W2.1 aile-listeleme bu kümeyi kullanır; mevcut varyant
 * listeleri W2.1'e dek VARIANT_DETAIL_COLUMNS'ta kalır (davranış değişmesin).
 * -- D4'te çıkacak: image_url (bu kümedeki tek DROP-adayı kolon).
 */
export const VARIANT_LIST_COLUMNS =
  'id, name, brand, price, sku, slug, model_code, category_id, subcategory_id, status, is_featured, family_id, image_url, stock_qty, created_at, updated_at'

/** product_families liste okumaları (RPC dışı doğrudan select'ler için). */
export const FAMILY_LIST_COLUMNS =
  'id, name, slug, series_code, description, brand_id, category_id, subcategory_id, sort_order, created_at, updated_at'
