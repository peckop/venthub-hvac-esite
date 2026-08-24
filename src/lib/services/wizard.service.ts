/**
 * Seçim sihirbazı aday servisi — T150-VH.
 *
 * NİÇİN VAR (2026-08-23 ölçümü):
 * `EnhancedNeedsWizard` adaylarını `products.contains('category_slugs', [slug])` ile
 * çekiyordu. **`category_slugs` diye bir kolon YOK** — ne canlı `public.products`'ta,
 * ne `archive_pre_kademe2.products`'ta; tüm kod tabanında tek geçtiği yer o satırdı.
 * Sorgu hata veriyor, `catch` bloğu hatayı yutuyor, kullanıcı boş sonuç ekranı görüyordu.
 * Kırılma: `66ff386f` (2026-03-15) — çalışan `category_id` sorgusunu olmayan bir kolona
 * çevirmişti. Beş ay boyunca hiçbir kapı görmedi.
 *
 * Bu servis o sorguyu `product.service.ts`'teki KANITLI desene bağlar
 * (`category_id` VEYA `subcategory_id`) ve hatayı YUTMAZ — çağıran görsün diye fırlatır.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

import type { FanAdayi } from '@/lib/hvac/ductFanSelection'
import type { Database } from '@/types/database.types'
import type { DbJson, DbProduct } from '@/types/db-rows'
import { eqValue, orConditions } from '@/utils/adminQueryFilters'

import { VARIANT_DETAIL_COLUMNS } from './product.columns'

/**
 * Okunacak spec anahtarları — **EKSEN KARIŞTIRMADAN**.
 *
 * ÖNEMLİ DÜZELTME (2026-08-23, aynı gün): burada önce şu liste vardı —
 * `sesDbA: ['noise_level_db_a', 'noise_lpa_3m_db']`, `gucW: [..., 'rated_power_w']`.
 * "Aynı büyüklük farklı adla yazılmış, ikisini de oku" diye düşünmüştüm. YANLIŞTI ve
 * ölçümle çürüdü:
 *
 *   · `noise_lpa_3m_db` **3 metrede** ölçülmüş ses basıncıdır (SEAT, 45–77 dB);
 *     `noise_level_db_a` mesafe belirtmez (Vortice, 25–79,5 dB). Aynı sütuna konursa
 *     3 m'de 45 dB olan fan, yakından 45 dB ölçülenle EŞİT sayılır — oysa çok daha
 *     gürültülüdür. Sonuç: yanlış "en sessiz" önerisi.
 *   · `rated_power_w` **Danfoss frekans konvertörlerinin** anma gücüdür (34 ürün,
 *     `frequency-converters` kategorisi) — fan değil, sürücü. Fanın çektiği güçle
 *     kıyaslanamaz.
 *   · `nominal_delivery_m3h` ile `max_delivery_m3h` farklı ÇALIŞMA NOKTASIDIR.
 *
 * KURAL: sessizce birleştirme YOK. Aynı eksende olmayan bir alan okunmaz; o ürün için
 * değer `null` kalır ve motor onu "bu boyutta bilgi yok" diye ele alır (elenmez, yalnız
 * o boyutta öne çıkmaz). Yanlış sıralamaktansa bilmediğini söylemek doğrudur.
 *
 * Debi tek istisnadır ve YÖNÜ güvenlidir: `nominal` her zaman `max`'tan küçüktür, yani
 * yedek olarak okunması fanı olduğundan GÜÇLÜ değil ZAYIF gösterir. Zaten yalnız P-Q
 * eğrisi yokken kaba yedek olarak kullanılır.
 */
const SPEC_ANAHTARLARI = {
  /** Yedek yön güvenli: nominal ≤ max, yani fanı abartmaz. */
  debiM3h: ['max_delivery_m3h', 'nominal_delivery_m3h'],
  /** TEK eksen — `noise_lpa_3m_db` BİLEREK dışarıda (farklı ölçüm mesafesi). */
  sesDbA: ['noise_level_db_a'],
  /** TEK eksen — `rated_power_w` BİLEREK dışarıda (sürücü gücü, fan değil). */
  gucW: ['max_absorbed_power_w'],
  capMm: ['diameter_mm'],
} as const

/** `technical_specs` içinden ilk dolu sayısal kavramı okur; bulamazsa null. */
function sayiOku(
  specs: Record<string, DbJson> | null,
  anahtarlar: readonly string[],
): number | null {
  if (!specs) return null
  for (const anahtar of anahtarlar) {
    const ham = specs[anahtar]
    if (ham == null) continue
    const sayi = typeof ham === 'number' ? ham : Number(String(ham).replace(',', '.'))
    if (Number.isFinite(sayi)) return sayi
  }
  return null
}

/** Ürün satırından sihirbaz adayı üretir. */
function satiriAdayaCevir(satir: DbProduct): FanAdayi {
  const specs = satir.technical_specs
  return {
    id: satir.id,
    sku: satir.sku ?? '',
    ad: satir.name ?? '',
    slug: satir.slug ?? '',
    pqCurveHam: specs?.pq_curve ?? null,
    maksDebiM3h: sayiOku(specs, SPEC_ANAHTARLARI.debiM3h),
    sesDbA: sayiOku(specs, SPEC_ANAHTARLARI.sesDbA),
    gucW: sayiOku(specs, SPEC_ANAHTARLARI.gucW),
    capMm: sayiOku(specs, SPEC_ANAHTARLARI.capMm),
  }
}

/**
 * Bir kategori slug'ı altındaki aktif ürünleri sihirbaz adayı olarak getirir.
 *
 * Kategori kanonik slug ile aranır (`categories.slug`) — görünen/lokalize slug ile DEĞİL.
 * Kategori bulunamazsa boş dizi döner (sihirbaz "uygun ürün yok" der); sorgu hata
 * verirse hata FIRLATILIR — sessizce boş dönmek, bu ekranı beş ay boş tutan kusurdu.
 */
export async function getWizardCandidates(
  supabase: SupabaseClient<Database>,
  categorySlug: string,
): Promise<FanAdayi[]> {
  const { data: kategori, error: kategoriHatasi } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .maybeSingle()

  if (kategoriHatasi) throw kategoriHatasi
  if (!kategori) return []

  const { data, error } = await supabase
    .from('products')
    .select(VARIANT_DETAIL_COLUMNS)
    // INV-FILTER-1: `or()` bir GRAMER; ham interpolasyon yasak. Kaçış tek yerde yaşar
    // (`adminQueryFilters`), ikinci kopya yazılmaz.
    .or(orConditions([eqValue('category_id', kategori.id), eqValue('subcategory_id', kategori.id)]))
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (error) throw error

  return ((data as DbProduct[]) ?? []).map(satiriAdayaCevir)
}
