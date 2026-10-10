import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'

/**
 * VİTRİN SAYAÇLARI (URN-75, OPS 2026-10-09): Hakkımızda sayfasındaki marka / aktif ürün / aile sayıları.
 *
 * NİÇİN CANLI VERİ: sayfadaki dört sayı elle yazılıydı (6, 50+, 81 …) ve biri ("81 il") dayanaksız bir vaatti.
 * Sayı koda gömülünce ürün eklendiğinde ya da bir marka ürünsüz kaldığında sayfa sessizce yanlış olur.
 *
 * TANIM (vitrinin kendi süzgeciyle AYNI; `get_product_families_enriched` RPC'siyle birebir):
 * - aile: silinmemiş, markası olan ve EN AZ BİR aktif (`status='active'`, silinmemiş) ürünü olan aile;
 * - aktif ürün: o ailelerdeki aktif ürünlerin toplamı;
 * - marka: o ailelerden en az birine sahip marka (Flexiva gibi ürünsüz marka sayılmaz; marka sayfasında da
 *   "ürünsüz marka" noindex'tir).
 * Tek sorgu: üç sayı aynı satır kümesinden türediği için birbirini tutmayan sayı çıkmaz.
 *
 * HATA YUTULMAZ: sorgu hatası ve boş sonuç FIRLATILIR (sıfır sayıya ÇEVRİLMEZ). Sayfa hatada kartları hiç
 * çizmez; "0 marka" yazmak yanlış bir vaattir (aynı gerekçe: `getBrandFamilyCount`).
 */
export interface SiteSayaclari {
  markaSayisi: number
  aktifUrunSayisi: number
  aileSayisi: number
}

/**
 * PostgREST üst satır sınırı (varsayılan 1000). Marka tablosu bunun çok altındadır (7); aşılırsa fazlası SESSİZCE
 * kesilip sayı eksik görünmesin diye hata verilir (urunlerSayfasi `PAGE_SIZE` notundaki sessiz eksilme dersi).
 */
const UST_SATIR_SINIRI = 1000

export async function getSiteSayaclari(supabase: SupabaseClient<Database>): Promise<SiteSayaclari> {
  const { data, error } = await supabase
    .from('brands')
    .select('id, product_families!inner(id, products!inner(id))')
    .is('product_families.deleted_at', null)
    .eq('product_families.products.status', 'active')
    .is('product_families.products.deleted_at', null)
    .limit(UST_SATIR_SINIRI)
  if (error) throw error

  const markalar = data ?? []
  if (markalar.length === 0) {
    throw new Error('getSiteSayaclari: ürünü olan marka bulunamadı (boş sonuç sıfır sayıya çevrilmez)')
  }
  if (markalar.length >= UST_SATIR_SINIRI) {
    throw new Error(`getSiteSayaclari: marka sayısı ${UST_SATIR_SINIRI} sınırına ulaştı, sayı eksik olabilir`)
  }

  let aileSayisi = 0
  let aktifUrunSayisi = 0
  for (const marka of markalar) {
    for (const aile of marka.product_families) {
      aileSayisi += 1
      aktifUrunSayisi += aile.products.length
    }
  }
  return { markaSayisi: markalar.length, aktifUrunSayisi, aileSayisi }
}
