/**
 * Sessiz fan serisinin SİTEDE CANLI model kodları — URN-135 (U3).
 *
 * NİÇİN VAR: kategori sayfasındaki sessiz fan metni ses aralığını söyler ("en düşük gövde değeri …"). Sayılar
 * yazılı metinden değil, ses veri modülünün (`src/data/sessizFan`) SİTEDEKİ modellerle KESİŞİMİNDEN türer;
 * veri modülünde olup sitede satılmayan kod (örn. 17163) sayıya girmez. Kesişimin sitedeki yarısı bu servistir:
 * serinin AKTİF ürünlerinin SKU'ları (`VRT-17164` → `17164`).
 *
 * Aday kümesi AİLEden çekilir (`getWizardCandidates` ile aynı desen: aile slug'ı → `family_id`, `status='active'`),
 * kategoriden değil: kategori Quiet'in yanında sessiz OLMAYAN modelleri de taşır (INV-SILENTFAN-SERI-1).
 * HATA YUTULMAZ (fırlatılır): "okunamadı" kararını çağıran verir; çağıran hatada ses cümlelerini çizmez.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

import { skudanModelKodlari } from '@/data/sessizFan/sesOzeti'
import type { Database } from '@/types/database.types'

export async function getSessizFanCanliKodlari(
  supabase: SupabaseClient<Database>,
  familySlug: string,
): Promise<string[]> {
  const { data: aile, error: aileHatasi } = await supabase
    .from('product_families')
    .select('id')
    .eq('slug', familySlug)
    .maybeSingle()

  if (aileHatasi) throw aileHatasi
  if (!aile) return []

  const { data, error } = await supabase
    .from('products')
    .select('sku')
    .eq('family_id', aile.id)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('sku', { ascending: true })

  if (error) throw error
  return skudanModelKodlari((data ?? []).map((satir) => satir.sku))
}
