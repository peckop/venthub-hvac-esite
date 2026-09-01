import type { CategoryMetadata } from '../../types/db-rows'

/**
 * TEKLİF MODU HÜKMÜ — sitenin fiyat gösterip göstermeyeceğine karar veren TEK kural.
 *
 * Saf fonksiyon: sunucuda da istemcide de aynı girdiye aynı cevabı verir.
 *
 * ⭐NİÇİN AYRI FONKSİYON OLDU (ölçülmüş sızıntı, 2026-08-31 · REC-97):
 * Kural satır içindeydi ve `mainCategory` ÇÖZÜLEMEDİĞİNDE sessizce "fiyatlı mod"a
 * düşüyordu. `mainCategory` istemci bağlamından gelir; sunucu render'ında o liste
 * BOŞTUR. Sonuç: statik HTML'e gerçek fiyat basılıyor, hydration sonrası istemci onu
 * gizliyordu — ekranda bir an görünüp kayboluyor ama kaynak-görüntüle ve önbellekte
 * KALICI kalıyordu. 40 aile sayfasının 36'sında ölçüldü.
 *
 * ⭐NİÇİN BURAYA TAŞINDI (ikinci ölçülmüş sızıntı, 2026-09-01 · REC-111):
 * Fonksiyon `app/_components/ProductDetailPageView.tsx` içinde yaşıyordu, yani
 * GÖRSEL render koluna aitti. `lib/seo/jsonld.ts` ise kendi fiyat kararını AYRI verdi
 * ve yalnız bu kuralın ÜÇÜNCÜ dalını (fiyat geçerli mi) uyguladı; kategori `hide_price`
 * dalını hiç sormadı — zaten kategoriyi parametre olarak ALMIYORDU. Sonuç: vitrin
 * "Teklif Alın" derken schema.org `Offer` içinde gerçek fiyat yayınlanıyordu.
 * CANLI ÖLÇÜM (2026-09-01): 80 ürün adresinin **72'sinde** JSON-LD'de `price` alanı,
 * toplam **696** fiyat. Temiz çıkan 4 aile KORUNDUĞU İÇİN DEĞİL, `product_prices`
 * kaydı olmadığı için temizdi (DB'den doğrulandı: 4 ailenin 4'ünde de 0 fiyat kaydı)
 * — yani koruma SIFIRDI, tıpkı 2026-08-31'deki gibi.
 *
 * ⭐DERS: aynı hüküm İKİ YÜZEYDE ayrı ayrı yazılırsa, biri düzeltilince diğeri sessizce
 * eski davranışta kalır. Bu dosya o yüzden var: hüküm TEK yerde yaşar, her yüzey
 * buradan çağırır. Yeni bir yüzey (RSS, besleme, PDF, e-posta) fiyat basacaksa
 * kendi kuralını YAZMAZ, bunu çağırır.
 *
 * KURAL: mod BİLİNMİYORSA teklif modu varsayılır. Bilinmemek "fiyat göster" demek
 * değildir; güvenli duruş fiyatı BASMAMAKTIR.
 *
 * Kapılar: `INV-FIYAT-SIZINTI-1` (görsel yüzey) · `INV-FIYAT-SIZINTI-2` (yapısal veri)
 */
export function quoteModeHesapla(
  mainCategory: { metadata?: unknown } | null | undefined,
  selectedVariant: { price?: number | string | null } | null | undefined,
): boolean {
  // (1) Mod bilinmiyor → teklif modu. Sunucu render'ının düştüğü dal budur.
  if (!mainCategory) return true

  // (2) Kategori açıkça fiyatı gizliyor.
  if (Boolean((mainCategory.metadata as CategoryMetadata | null)?.hide_price)) return true

  // (3) Gösterilecek geçerli bir fiyat yok.
  if (selectedVariant == null) return true
  if (selectedVariant.price == null) return true
  return Number(selectedVariant.price) <= 0
}
