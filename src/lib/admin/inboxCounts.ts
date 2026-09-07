import { SupabaseClient } from '@supabase/supabase-js'

import { tumSatirlariCek } from '@/lib/supabase/tumSatirlar'
import { Database } from '@/types/database.types'

/** Düşük stok sayacının okuduğu kolonlar. */
type DusukStokSatiri = Pick<
  Database['public']['Tables']['products']['Row'],
  'stock_qty' | 'low_stock_threshold'
>

export interface InboxCounts {
  pendingReturnsCount: number
  pendingShipmentsCount: number
  /**
   * Düşük stok alarmı sayısı — **`null` = ÖLÇÜLEMEDİ**, sıfır DEĞİL.
   *
   * Niçin ayrı bir hâl: bu sayaç istemcide, tüm ürün satırları çekilerek hesaplanıyor
   * (ölçüt iki kolonu karşılaştırıyor, PostgREST bunu sunucuda filtreleyemiyor). Çekim
   * eksik kalırsa `tumSatirlariCek` fırlatır — ve eskiden o dalda sayaç 0 kalıyordu,
   * yani panel "alarm yok" diyordu. Ölçülemeyen bir şeyi "yok" diye göstermek
   * fail-open'ın ta kendisidir: yönetici stoku bitmiş ürünü göremez ve sorun olmadığını
   * sanır. `null` bu iki hâli ayırır; panel onu "ölçülemedi" diye gösterir.
   */
  lowStockAlarmsCount: number | null
  unresolvedErrorsCount: number
}

/**
 * Parallel aggregation query for "attention required" counts.
 * It uses dependency injection (no module-level static client import)
 * and executes 4 isolated queries in parallel using Promise.allSettled.
 */
export async function fetchInboxCounts(supabase: SupabaseClient<Database>): Promise<InboxCounts> {
  const [returnsRes, shipRes, productsRes, errorsRes] = await Promise.allSettled([
    // 1. Pending Returns (status in ('requested', 'approved'))
    supabase.from('venthub_returns').select('id', { count: 'exact', head: true }).in('status', ['requested', 'approved']),

    // 2. Pending Shipments (status in ('confirmed', 'processing') and shipped_at is null)
    supabase.from('venthub_orders').select('id', { count: 'exact', head: true }).is('shipped_at', null).in('status', ['confirmed', 'processing']),

    // 3. Low stock products (stock_qty <= low_stock_threshold)
    //
    // ⛔SAYFALAMA ŞART (INV-TAVAN-1). Bu sayaç istemcide hesaplanıyor, yani TÜM satırlar
    // gerekiyor; sayfalanmamış tek okuma PostgREST'in 1000 satır tavanına takılır ve
    // alarm sayısı SESSİZCE eksik çıkar. Eksik alarm, hiç alarm olmamasından beterdir:
    // panel "her şey yolunda" der. Ölçüldü (2026-09-07, prod): 375 ürün — tavan bugün
    // ısırmıyor, sınır ise yoktu.
    //
    // Diğer üç sorgu `head: true` + `count: 'exact'` ile SUNUCUDA sayıyor, bu yüzden
    // tavandan etkilenmiyor. Bu sorgu sunucuda sayılamıyor çünkü ölçüt iki KOLONU
    // karşılaştırıyor (stock_qty <= low_stock_threshold) ve PostgREST filtreleri
    // kolon-kolon karşılaştırma yapmaz. Sunucu tarafına taşımak bir RPC ister
    // (migration → Recep onayı); o gelene kadar doğru çözüm sayfalamaktır.
    tumSatirlariCek<DusukStokSatiri>(
      'products (düşük stok alarmı)',
      (bas, son) =>
        supabase
          .from('products')
          .select('stock_qty, low_stock_threshold', { count: 'exact' })
          .order('id', { ascending: true })
          .range(bas, son),
    ),

    // 4. Unresolved error groups (status != 'resolved')
    supabase.from('error_groups').select('id', { count: 'exact', head: true }).neq('status', 'resolved')
  ])

  const pendingReturnsCount = returnsRes.status === 'fulfilled' && !returnsRes.value.error ? (returnsRes.value.count ?? 0) : 0
  const pendingShipmentsCount = shipRes.status === 'fulfilled' && !shipRes.value.error ? (shipRes.value.count ?? 0) : 0

  // FAIL-CLOSED: ölçülemeyen sayaç `null` kalır, 0 OLMAZ.
  //
  // `tumSatirlariCek` eksik çekimde fırlatır — yani `rejected` dalı GERÇEK bir arıza
  // demek. Eskiden o dalda sayaç 0'a düşüyordu ve panel "alarm yok" gösteriyordu;
  // ölçülemeyen bir şeyi "yok" diye göstermek, yöneticinin stoku bitmiş ürünü
  // görmemesi demekti. Artık `null` dönüyor ve panel "ölçülemedi" rozeti basıyor.
  let lowStockAlarmsCount: number | null = null
  if (productsRes.status === 'fulfilled') {
    lowStockAlarmsCount = 0
    const rawProducts = productsRes.value
    for (let i = 0; i < rawProducts.length; i++) {
      const p = rawProducts[i]
      const stockQty = typeof p.stock_qty === 'number' ? p.stock_qty : 0
      const lowStockThreshold = typeof p.low_stock_threshold === 'number' ? p.low_stock_threshold : 5
      if (stockQty <= lowStockThreshold) {
        lowStockAlarmsCount++
      }
    }
  }

  const unresolvedErrorsCount = errorsRes.status === 'fulfilled' && !errorsRes.value.error ? (errorsRes.value.count ?? 0) : 0

  return {
    pendingReturnsCount,
    pendingShipmentsCount,
    lowStockAlarmsCount,
    unresolvedErrorsCount
  }
}
