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
import { urunSatiriDogrula } from '@/lib/csv/semalar'
import type { Database } from '@/types/database.types'

type UrunYazimi = Database['public']['Tables']['products']['Insert']

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

/** Kategorisi çözülemediği için YAZILMAYACAK satır. Cetvel §4: ERR_SLUG_NOT_IN_DB. */
export interface ReddedilenSatir {
  sku: string
  deger: string
}

/** Şema doğrulamasından geçmeyen satır (ADM-6, cetvel §1.2). `alan` = ilk hatalı sütun. */
export interface GecersizSatir {
  satir: number
  sku: string
  alan: string
}

export interface HazirlamaSonucu {
  payloads: UrunYazimi[]
  reddedilen: ReddedilenSatir[]
  /** Çağıran bu liste boş değilse HİÇBİR satırı yazmaz (kısmi yazım yok). */
  gecersiz: GecersizSatir[]
  /**
   * `price` sütunu DOLU gelip YOK SAYILAN satır sayısı (2026-09-24). Emekli `products.price`'a
   * yazılmaz: vitrin o alanı okumuyor, satış fiyatını fiyat motoru hesaplıyor
   * (csv-import-export-standard: "TL gömme YOK"). Sessiz yok sayma değil — çağıran bunu gösterir.
   */
  yoksayilanFiyat: number
}

/**
 * CSV satırlarını yazım nesnelerine çevirir.
 *
 * NİÇİN BİLEŞENDE DEĞİL BURADA: bu döngü bir tıklama işleyicisinin gövdesinde yaşıyordu.
 * Orada yaşayan mantığın DAVRANIŞI ölçülemez — kapı ancak dosyada geçen kelimelere
 * bakabilir. Nitekim ilk yazdığım kapı tam bu yüzden kör kaldı: reddetme dalını silen
 * sabotaj (S4) kelimeler yerinde durduğu için YEŞİL geçti. Mantık saf hâle gelince
 * sabotaj davranışı bozar ve kapı görür.
 *
 * SÖZLEŞME: kategori değeri verilmiş ama canlı DB'de karşılığı yoksa satır `payloads`a
 * GİRMEZ, `reddedilen`e düşer. Sessiz `null` YOK.
 *
 * ADM-6 (cetvel §1.2): her satır önce zod şemasından geçer (`gecersiz`). `category_id`
 * doğrudan verilse bile `kategoriler` listesinde olmalıdır: liste çağıranın kendi tenant'ının
 * okumasıdır, dışındaki kimlik (başka tenant ya da uydurma) reddedilir.
 *
 * `satirNolari`: her satırın dosyadaki satır numarası (ayrıştırıcıdan); verilmezse sıra + 2.
 */
export function hazirlaUrunSatirlari(
  rows: readonly Record<string, string>[],
  kategoriler: readonly KategoriSecenegi[],
  satirNolari: readonly number[] = [],
): HazirlamaSonucu {
  const payloads: UrunYazimi[] = []
  const reddedilen: ReddedilenSatir[] = []
  const gecersiz: GecersizSatir[] = []
  const kategoriKimlikleri = new Set(kategoriler.map((k) => k.id))
  let yoksayilanFiyat = 0

  rows.forEach((r, i) => {
    // sku ya da name boş satır atlanır (mevcut davranış; önizleme geçerli satır sayısını gösterir).
    if (!r['sku']?.trim() || !r['name']?.trim()) return
    const dogrulama = urunSatiriDogrula(r)
    if (!dogrulama.ok) {
      gecersiz.push({ satir: satirNolari[i] ?? i + 2, sku: r['sku'].trim(), alan: dogrulama.alan })
      return
    }
    const v = dogrulama.veri
    const p: UrunYazimi = {
      sku: v.sku,
      name: v.name,
      slug: urunSlugUret(v.name),
      brand: v.brand || 'Generic',
    }
    const modelKodu = v.model_code ?? v.model
    if (modelKodu) p.model_code = modelKodu
    if (v.status) p.status = v.status
    // ⛔`price` → emekli alan YAZILMAZ (bkz. HazirlamaSonucu.yoksayilanFiyat). Sayılır, uyarılır.
    if (r['price']?.trim()) yoksayilanFiyat++
    if (v.stock_qty !== undefined) p.stock_qty = v.stock_qty
    if (v.low_stock_threshold !== undefined) p.low_stock_threshold = v.low_stock_threshold

    if (v.category_id) {
      if (!kategoriKimlikleri.has(v.category_id)) {
        reddedilen.push({ sku: v.sku, deger: v.category_id })
        return
      }
      p.category_id = v.category_id
    } else if (v.category_slug || v.category) {
      const deger = v.category_slug || v.category || ''
      const id = kategoriIdBul(deger, kategoriler)
      if (!id) {
        reddedilen.push({ sku: v.sku, deger })
        return
      }
      p.category_id = id
    }
    payloads.push(p)
  })

  return { payloads, reddedilen, gecersiz, yoksayilanFiyat }
}
