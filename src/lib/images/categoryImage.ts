/**
 * Kategori görseli TEK-KAYNAK resolver (REC-89 kusur 3, kod ayağı).
 *
 * NİÇİN VAR — aynı alan ÜÇ farklı biçimde yorumlanıyordu:
 *
 *   CategoryHero        → `${SUPABASE_URL}/storage/v1/object/public/category-images/${image_url}`
 *   CategoryShowcase    → aynı (kategori) · AMA alt kategori dalında `product-images` bucket'ı
 *   CategoryLandingView → `category.image_url` HAM kullanılıyor
 *
 * Canlı veri ölçüldü ve ham kullanım DOĞRU çıktı: `categories.image_url` dolu olan iki
 * kayıt YEREL DOSYA YOLU taşıyor (`/images/products/air-curtain.png`,
 * `/images/products/vortice_lineo_360.png`) ve bu iki dosya hem repoda hem canlıda 200
 * dönüyor. Depo öneki ekleyen üç kullanım ise bu değeri sarmalayınca
 * `.../category-images//images/products/air-curtain.png` gibi ÇİFT EĞİK ÇİZGİLİ, yanlış
 * bucket'lı ve 404 dönen bir adres üretiyordu.
 *
 * Kusur bugüne dek GÖRÜNMEDİ çünkü 37 kategorinin 35'inde alan BOŞ (ölçüldü) — null
 * kontrolleri devreye girip görseli hiç çizmiyordu. Yani veri girildiği anda üç sayfa
 * birden bozuk adres üretecekti. Bu modül, veri girişinden ÖNCE o tuzağı kapatır.
 *
 * İKİ BİÇİM DE GEÇERLİDİR ve ayrımı burada yapılır:
 *   1) `/` ile başlayan değer  → uygulamanın kendi statik varlığı (public/), olduğu gibi.
 *   2) `http(s)://` ile başlayan değer → zaten tam adres, olduğu gibi.
 *   3) Diğer her şey → Supabase Storage dosya adı, `category-images` bucket'ı ile çözülür.
 *
 * (3) kuruntu değil ölçüm: `storage.buckets` içinde `category-images` VAR ve public;
 * içinde admin panelinden yüklenmiş ÜÇ dosya duruyor (`cat_...webp`, 2025-12-10).
 * Not: o üç dosyanın hiçbiri bir kategoriye bağlı değil — ayrı bir bulgu olarak
 * bildirildi, bu modülün konusu değil.
 */

const CATEGORY_IMAGE_BUCKET = 'category-images'
const PUBLIC_OBJECT_SEGMENT = '/storage/v1/object/public/'

/**
 * `categories.image_url` → çizilebilir adres. Değer yoksa `null` döner; çağıran taraf
 * kendi yedeğine (VentImage fallback / ikon / varsayılan görsel) düşer.
 */
export function resolveCategoryImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null

  const deger = imageUrl.trim()
  if (!deger) return null

  // 1) Uygulamanın kendi statik varlığı — depo önekiyle sarılırsa 404 olur.
  if (deger.startsWith('/')) return deger

  // 2) Zaten tam adres.
  if (/^https?:\/\//i.test(deger)) return deger

  // 3) Storage dosya adı.
  const yolBucketli = deger.startsWith(`${CATEGORY_IMAGE_BUCKET}/`)
    ? deger
    : `${CATEGORY_IMAGE_BUCKET}/${deger}`

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return `/${yolBucketli}`

  return `${supabaseUrl}${PUBLIC_OBJECT_SEGMENT}${yolBucketli}`
}
