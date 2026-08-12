/**
 * F5-B W1.1 — Ürün görseli TEK-KAYNAK resolver.
 *
 * product_images.path (Supabase Storage yolu) → public URL dönüşümü ve
 * "hangi alan önce" önceliği burada merkezileşir. PDP (ProductDetailPageView /
 * ImageGallery) bu modülü KULLANMAZ (W2.2 sahası, kasıtlı olarak dokunulmadı);
 * mantık oradan buraya KOPYALANDI, taşınmadı.
 *
 * Türetildiği mevcut kod:
 *  - src/utils/imageUtils.ts → normalizeImageUrl (satır 62-73): aynı
 *    NEXT_PUBLIC_SUPABASE_URL + `/storage/v1/object/public/<bucket>/<path>` deseni.
 *  - src/components/ImageGallery.tsx (satır 122, 193, 218, 245): bucket adı
 *    sabit `product-images` — path'in önüne `product-images/` eklenerek VentImage'a verilir.
 */

const PRODUCT_IMAGE_BUCKET = 'product-images';
const PUBLIC_OBJECT_SEGMENT = '/storage/v1/object/public/';
const PRODUCT_IMAGE_PLACEHOLDER = '/images/placeholders/product-placeholder.png';

/**
 * product_images.path (Storage yolu) → herkese açık (public) Supabase Storage URL'i.
 * Bucket sabiti ImageGallery.tsx ile aynı: `product-images`.
 */
export function storagePathToUrl(path: string): string {
  const trimmed = path.trim();
  const pathWithBucket = trimmed.startsWith(`${PRODUCT_IMAGE_BUCKET}/`)
    ? trimmed
    : `${PRODUCT_IMAGE_BUCKET}/${trimmed}`;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return `/${pathWithBucket}`;

  // Zaten tam public URL olarak gelmiş olabilir — mükerrer prefix'i temizle.
  const cleanPath = pathWithBucket.replace(`${supabaseUrl}${PUBLIC_OBJECT_SEGMENT}`, '');
  return `${supabaseUrl}${PUBLIC_OBJECT_SEGMENT}${cleanPath}`;
}

/**
 * Ürün görseli için tek karar noktası. Öncelik:
 *   1) cover_image_path (product_images.path) → storagePathToUrl
 *   2) image_url — yalnızca zaten tam bir URL ise olduğu gibi kullanılır
 *   3) null (çağıran taraf productImagePlaceholder / VentImage fallback'ine düşer)
 */
export function resolveProductImageUrl(p: {
  image_url?: string | null;
  cover_image_path?: string | null;
}): string | null {
  if (p.cover_image_path) {
    return storagePathToUrl(p.cover_image_path);
  }
  if (p.image_url && /^https?:\/\//.test(p.image_url)) {
    return p.image_url;
  }
  return null;
}

/**
 * Deterministik yerel placeholder. Ürüne-özel .webp üretmez; mevcut genel
 * public/images/placeholders/product-placeholder.png asset'ini döner.
 */
export function productImagePlaceholder(_seed: string): string {
  return PRODUCT_IMAGE_PLACEHOLDER;
}
