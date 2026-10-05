/**
 * Yönetici ürün formunun okuduğu kolonlar (REC-140, 2026-09-24).
 *
 * Form bu alanları okuyup güncelleme yüküne AYNEN geri yazar; burada olmayan bir alan
 * yüklenmez ve kaydette boş/0 ile ezilir (alış fiyatı için ProductFormModal.alisFiyati
 * testi ölçer). Bu yüzden liste vitrin listesinden TÜRETİLMEZ: vitrin yükünü küçültmek
 * için VARIANT_DETAIL_COLUMNS'tan bir alan çıkarılırsa (PS-041 liste için yaptı) form o
 * alanı sessizce silmeye başlardı. "Güncelleme yüküne giden her alan bu listeyle okunmuş
 * olmalı" bağını ProductFormModal.alisFiyati testi sabitler.
 *
 * BİLEREK yönetici klasöründe: product.columns.ts vitrin paketlerine girer; oradaki bir
 * `purchase_price` dizgesi istemci JS'ine taşınabilirdi (düzeltme öncesi canlı ölçüm: iki
 * vitrin parçasında kolon adları görünüyordu).
 */
export const ADMIN_PRODUCT_FORM_COLUMNS =
  'id, name, sku, brand, model_code, category_id, status, purchase_price, stock_qty, low_stock_threshold, description_i18n, technical_specs'
