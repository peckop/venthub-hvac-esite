import { VARIANT_DETAIL_COLUMNS } from '@/lib/services/product.columns'

/**
 * Yönetici ürün formu — vitrin kümesi + alış fiyatı (REC-140, 2026-09-24).
 *
 * Form alış fiyatını okuyup geri yazar; bu kolon okunmazsa kaydedilen ürünün alış fiyatı
 * 0'a ezilir (ProductFormModal.alisFiyati testi). Liste BİLEREK yönetici klasöründe:
 * product.columns.ts vitrin paketlerine de girer; oradaki bir `purchase_price` dizgesi,
 * kullanılmasa bile istemci JS'ine taşınabilirdi (ölçüm: düzeltme öncesi iki vitrin
 * parçasında kolon adları görünüyordu). `as const` şablonu literal tipte tutar, PostgREST
 * tip-ayrıştırıcısı onu okur.
 */
export const ADMIN_PRODUCT_FORM_COLUMNS = `${VARIANT_DETAIL_COLUMNS}, purchase_price` as const
