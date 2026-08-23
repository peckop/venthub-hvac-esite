/**
 * CSV içe aktarımının SAF eşleme mantığı — kategori çözümü ve ürün slug üretimi.
 *
 * NİÇİN AYRI DOSYA: bu mantık daha önce `ProductCsvImport.tsx` içinde, bir tıklama
 * işleyicisinin gövdesinde yaşıyordu. Orada yaşayan mantık yalnız tarayıcıda, yalnız
 * gerçek bir CSV yüklenince çalışır; hiçbir kapı göremez. Aynı bileşenin bir başka saf
 * parçası bu yüzden `lib/data/csvImportGuard.ts`'e çıkarılmıştı (T148) — aynı kalıp.
 *
 * CETVEL: `docs/standards/csv-import-export-standard.md`
 *   §3 — "CSV slug = canlı DB slug'ı, BİREBİR. İcat etme, dil değiştirme, tahmin etme."
 *   §4 — `ERR_SLUG_NOT_IN_DB`: severity **Error**, satır `conflict`, **insana işaretlenir**.
 * Yani eşleşmeyen kategoriyi sessizce `null` bırakmak cetvelin ihlaliydi: kategorisiz ürün
 * vitrinde HİÇBİR yerde görünmez, ekranda ise "içe aktarma tamamlandı" yazardı.
 *
 * TAKSONOMİ: kanonik slug İngilizcedir (`categories.slug`), görünen slug dile göre
 * `metadata.slug = { tr, en }` içinde yaşar (CLAUDE.md kural 7). Bu yüzden eşleme ÜÇ
 * kaynağa birden bakar; yalnız birine bakmak "doğru slug'ı yazdım ama bulunamadı"
 * şikâyetini geri getirir.
 */
import { foldForSearch } from '@/i18n/case'

/** Bileşene giren kategori seçeneği. `slug`/`metadata` opsiyoneldir ki çağıran kademeli geçebilsin. */
export interface KategoriSecenegi {
  id: string
  name: string
  slug?: string | null
  metadata?: unknown
}

/**
 * Karşılaştırma anahtarı — hem CSV hücresine hem DB değerine uygulanır.
 *
 * NİÇİN TEK FONKSİYON: kullanıcı "Çatı Tipi Fan" da yazabilir `cati-tipi-fan` da; ikisi de
 * aynı kategoriyi kasteder. İki tarafı da aynı normalleştirmeden geçirmezsek biri boşlukla
 * biri tireyle temsil edilir ve eşleşme sessizce kaçar.
 *
 * NİÇİN `foldForSearch`: Türkçe harf çevrimi zaten I18N şeridinde yazılı ve sınanmış
 * (`src/i18n/case.ts`). Kendi tablomu yazsaydım iki kopya zamanla ayrışırdı — katalogdaki
 * 24 Türkçe adlı ürünün slug'ları o fonksiyonun ürettiğiyle birebir aynı.
 */
export function slugAnahtari(deger: string): string {
  return foldForSearch(String(deger ?? ''), 'tr')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Ürün slug'ı — ürün ADINDAN üretilir.
 *
 * ESKİ KUSUR: `.replace(/[^\w-]+/g, '')` kullanılıyordu. `\w` = `[A-Za-z0-9_]`, yani Türkçe
 * harfleri EŞLEŞTİRMEZ ve o dal harfi **siler**: "Çatı Tipi Fan" → `at-tipi-fan`.
 * Çevirmek yerine silmek sessizdir; kimse hata almaz, adres yanlış doğar.
 */
export function urunSlugUret(ad: string): string {
  return slugAnahtari(ad)
}

function kayitMi(deger: unknown): deger is Record<string, unknown> {
  return typeof deger === 'object' && deger !== null && !Array.isArray(deger)
}

/** `metadata.slug = { tr, en }` içindeki dile özgü slug'lar. Şekil bozuksa sessizce boş döner. */
export function metadataSluglari(metadata: unknown): string[] {
  if (!kayitMi(metadata)) return []
  const slug = metadata.slug
  if (!kayitMi(slug)) return []
  return Object.values(slug).filter((v): v is string => typeof v === 'string' && v.length > 0)
}

/**
 * CSV hücresinden kategori kimliği. Bulunamazsa **`null`** döner — çağıran bunu
 * `ERR_SLUG_NOT_IN_DB` olarak işler ve satırı YAZMAZ.
 *
 * SIRA ÖNEMLİ: önce slug'lar (kanonik + dile özgü), sonra ad. Ters sırada, bir kategorinin
 * ADI başka bir kategorinin SLUG'ıyla çakışırsa yanlış kategori kazanır.
 */
export function kategoriIdBul(girdi: string, kategoriler: readonly KategoriSecenegi[]): string | null {
  const aranan = slugAnahtari(girdi)
  if (!aranan) return null

  for (const kategori of kategoriler) {
    const adaylar = [kategori.slug ?? '', ...metadataSluglari(kategori.metadata)]
    if (adaylar.some(aday => aday && slugAnahtari(aday) === aranan)) return kategori.id
  }
  for (const kategori of kategoriler) {
    if (slugAnahtari(kategori.name) === aranan) return kategori.id
  }
  return null
}
