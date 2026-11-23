/**
 * Yönetici ürün formunun okuduğu kolonlar (REC-140, 2026-09-24; ALT-123 okuyucu geçişi).
 *
 * Form bu alanları okur; güncelleme yükü (payload) YALNIZ yazılması gereken alanı taşır. Alış fiyatı
 * `products`'tan değil `product_costs`'tan (gömme, RLS: yalnız yönetici) okunur ve yüke yalnız alan
 * değiştiyse ve kullanıcı yöneticiyse girer (bkz. productForm.payload.ts). Liste vitrin listesinden
 * TÜRETİLMEZ: vitrin yükünü küçültmek için VARIANT_DETAIL_COLUMNS'tan bir alan çıkarılırsa form o
 * alanı sessizce silmeye başlardı. ProductFormModal.alisFiyati testi bağı sabitler.
 *
 * BİLEREK yönetici klasöründe: product.columns.ts vitrin paketlerine girer; oradaki bir
 * `purchase_price` dizgesi istemci JS'ine taşınabilirdi (düzeltme öncesi canlı ölçüm: iki
 * vitrin parçasında kolon adları görünüyordu).
 */
export const ADMIN_PRODUCT_FORM_COLUMNS =
  'id, name, sku, brand, model_code, category_id, status, stock_qty, low_stock_threshold, description_i18n, technical_specs, product_costs(purchase_price)'
