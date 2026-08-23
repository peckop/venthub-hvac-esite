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

import { VARIANT_DETAIL_COLUMNS } from './product.columns'

/**
 * Aynı fiziksel büyüklük markaya göre FARKLI anahtar adıyla yazılıyor
 * (2026-08-23 T140 denetimi, `products.technical_specs`):
 *   · güç  → Vortice/SEAT/AVenS `max_absorbed_power_w` · Danfoss `rated_power_w`
 *   · debi → Vortice `max_delivery_m3h` · SEAT/AVenS ağırlıkla `nominal_delivery_m3h`
 *   · ses  → Vortice `noise_level_db_a` · SEAT `noise_lpa_3m_db`
 *
 * Tek anahtar okunursa o markanın ürünleri sihirbazda sessizce "verisi yok" sayılır ve
 * hiç önerilmez. O yüzden okuma KAVRAM bazlıdır: sırayla denenir, ilk dolu olan kazanır.
 * Sıra anlamlıdır — baştaki, o kavramın kanonik adıdır.
 */
const KAVRAM_ANAHTARLARI = {
  debiM3h: ['max_delivery_m3h', 'nominal_delivery_m3h'],
  sesDbA: ['noise_level_db_a', 'noise_lpa_3m_db'],
  gucW: ['max_absorbed_power_w', 'rated_power_w'],
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
    maksDebiM3h: sayiOku(specs, KAVRAM_ANAHTARLARI.debiM3h),
    sesDbA: sayiOku(specs, KAVRAM_ANAHTARLARI.sesDbA),
    gucW: sayiOku(specs, KAVRAM_ANAHTARLARI.gucW),
    capMm: sayiOku(specs, KAVRAM_ANAHTARLARI.capMm),
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
    .or(`category_id.eq.${kategori.id}, subcategory_id.eq.${kategori.id}`)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (error) throw error

  return ((data as DbProduct[]) ?? []).map(satiriAdayaCevir)
}
