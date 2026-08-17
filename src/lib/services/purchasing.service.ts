/**
 * Satınalma servisi (T062 D3) — cetvel: docs/standards/purchasing-standard.md §7.
 *
 * Kural 2 (DI): her fonksiyon ilk parametre olarak `SupabaseClient<Database>` alır.
 * Durum sözlüğü SSOT: `src/lib/purchasing/poStatusMachine.ts` — burada İKİNCİ bir
 * geçiş haritası YOKTUR (INV-PURCH-1/R1).
 *
 * Fiyat motoru köprüsü v1'de KAPALI (cetvel §5.4): bu dosya `refreshCostInBase`/
 * `materializePrices` zincirini ÇAĞIRMAZ ve `products.purchase_price`'a YAZMAZ —
 * ikisi de INV-PURCH-1'de (R3/R4) ayrı assert'tür. Maliyet yansıması (`last_purchase_*`)
 * tamamen `process_goods_receipt` RPC'sinin içindedir; istemci tarafında maliyet
 * yazan hiçbir yol yoktur.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

import { logAdminAction } from '@/lib/audit'
import { isManualPoTransitionAllowed } from '@/lib/purchasing/poStatusMachine'
import type { Database, Json } from '@/types/database.types'

export type SupplierRow = Database['public']['Tables']['suppliers']['Row']
export type SupplierInsert = Database['public']['Tables']['suppliers']['Insert']
export type SupplierUpdate = Database['public']['Tables']['suppliers']['Update']
export type PurchaseOrderRow = Database['public']['Tables']['purchase_orders']['Row']
export type PurchaseOrderItemRow = Database['public']['Tables']['purchase_order_items']['Row']
export type GoodsReceiptRow = Database['public']['Tables']['goods_receipts']['Row']

/** PO satır girdisi: maliyet SNAPSHOT'ı sipariş anında burada verilir (cetvel §5.1). */
export interface PurchaseOrderLineInput {
  product_id: string
  qty_ordered: number
  unit_cost: number
  /** Boş bırakılırsa PO başlığının para birimi kullanılır. */
  currency?: string
  tax_rate?: number
}

export interface PurchaseOrderInput {
  supplier_id: string
  currency: string
  expected_at?: string | null
  note?: string | null
  lines: PurchaseOrderLineInput[]
}

export interface PurchaseOrderWithItems extends PurchaseOrderRow {
  purchase_order_items: PurchaseOrderItemRow[]
}

/** `process_goods_receipt` RPC zarfı — `success === true` kontrolü ZORUNLU (T052 dersi). */
export interface GoodsReceiptResult {
  success: boolean
  error?: string
  receipt_id?: string
  processed_count?: number
  received_units?: number
  po_status?: string
}

export interface GoodsReceiptLineInput {
  product_id: string
  qty: number
  /** Fatura farkı: verilmezse PO satırı snapshot'ı kullanılır (RPC içinde). */
  unit_cost?: number
}

// ---------------------------------------------------------------------------
// Tedarikçiler
// ---------------------------------------------------------------------------

export async function listSuppliers(
  supabase: SupabaseClient<Database>,
  opts: { includeInactive?: boolean } = {},
): Promise<SupplierRow[]> {
  let q = supabase.from('suppliers').select('*').order('name')
  if (!opts.includeInactive) q = q.eq('is_active', true)
  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

export async function createSupplier(
  supabase: SupabaseClient<Database>,
  input: SupplierInsert,
): Promise<SupplierRow> {
  const { data, error } = await supabase.from('suppliers').insert(input).select('*').single()
  if (error) throw error
  await logAdminAction(supabase, {
    table_name: 'suppliers',
    row_pk: data.id,
    action: 'INSERT',
    after: data,
  })
  return data
}

export async function updateSupplier(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: SupplierUpdate,
): Promise<SupplierRow> {
  const { data, error } = await supabase
    .from('suppliers')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  await logAdminAction(supabase, {
    table_name: 'suppliers',
    row_pk: id,
    action: 'UPDATE',
    after: data,
  })
  return data
}

// ---------------------------------------------------------------------------
// Satınalma siparişleri
// ---------------------------------------------------------------------------

export async function listPurchaseOrders(
  supabase: SupabaseClient<Database>,
  opts: { status?: string } = {},
): Promise<PurchaseOrderRow[]> {
  let q = supabase.from('purchase_orders').select('*').order('created_at', { ascending: false })
  if (opts.status) q = q.eq('status', opts.status)
  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

export async function getPurchaseOrder(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<PurchaseOrderWithItems | null> {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*, purchase_order_items(*)')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Taslak PO oluşturur (başlık + satırlar). Satır snapshot'ları burada doğar.
 *
 * İstemci tarafında transaction yoktur: satır ekleme başarısız olursa başlık
 * best-effort silinir (taslak aşamasında hiçbir stok/maliyet izi yoktur, yani
 * yarım kalan başlık veri bütünlüğünü bozmaz — yalnızca çöp bırakır).
 */
export async function createPurchaseOrder(
  supabase: SupabaseClient<Database>,
  input: PurchaseOrderInput,
): Promise<PurchaseOrderWithItems> {
  if (input.lines.length === 0) throw new Error('PO en az bir satır içermeli')

  const { data: po, error: poError } = await supabase
    .from('purchase_orders')
    .insert({
      supplier_id: input.supplier_id,
      currency: input.currency,
      expected_at: input.expected_at ?? null,
      note: input.note ?? null,
    })
    .select('*')
    .single()
  if (poError) throw poError

  const { data: items, error: itemsError } = await supabase
    .from('purchase_order_items')
    .insert(
      input.lines.map((l) => ({
        po_id: po.id,
        product_id: l.product_id,
        qty_ordered: l.qty_ordered,
        unit_cost: l.unit_cost,
        currency: l.currency ?? input.currency,
        tax_rate: l.tax_rate ?? 0,
      })),
    )
    .select('*')
  if (itemsError) {
    await supabase.from('purchase_orders').delete().eq('id', po.id)
    throw itemsError
  }

  await logAdminAction(supabase, {
    table_name: 'purchase_orders',
    row_pk: po.id,
    action: 'INSERT',
    after: { ...po, line_count: items?.length ?? 0 },
  })

  return { ...po, purchase_order_items: items ?? [] }
}

/**
 * ELLE durum geçişi (draft→ordered, →cancelled, →closed). Türev statüler
 * (`partially_received`/`received`) burada REDDEDİLİR — onları yalnız RPC türetir
 * (cetvel §3.2). Kısa kapamada gerekçe zorunlu (cetvel §3.1).
 *
 * Yarış kapısı: UPDATE, `status = mevcut` şartıyla atılır — iki eş zamanlı geçiş
 * denemesinden yalnız biri satır bulur; diğeri hata alır (okuma-anı statüsüne
 * güvenmek, okuma ile yazma arasındaki değişikliği ezerdi).
 */
export async function setPurchaseOrderStatus(
  supabase: SupabaseClient<Database>,
  poId: string,
  next: string,
  opts: { closeNote?: string } = {},
): Promise<PurchaseOrderRow> {
  const { data: current, error: readError } = await supabase
    .from('purchase_orders')
    .select('id, status')
    .eq('id', poId)
    .maybeSingle()
  if (readError) throw readError
  if (!current) throw new Error('PO bulunamadı')

  if (!isManualPoTransitionAllowed(current.status, next)) {
    throw new Error(`Geçersiz PO geçişi: ${current.status} → ${next}`)
  }
  if (current.status === 'partially_received' && next === 'closed' && !opts.closeNote?.trim()) {
    throw new Error('Kısa kapama gerekçesi (closeNote) zorunlu')
  }

  const patch: Database['public']['Tables']['purchase_orders']['Update'] = {
    status: next,
    updated_at: new Date().toISOString(),
  }
  if (opts.closeNote) patch.close_note = opts.closeNote

  const { data, error } = await supabase
    .from('purchase_orders')
    .update(patch)
    .eq('id', poId)
    .eq('status', current.status)
    .select('*')
    .single()
  if (error) throw error

  await logAdminAction(supabase, {
    table_name: 'purchase_orders',
    row_pk: poId,
    action: 'UPDATE',
    before: { status: current.status },
    after: { status: next, close_note: opts.closeNote ?? null },
    comment: 'po-status-transition',
  })

  return data
}

// ---------------------------------------------------------------------------
// Mal kabul — stok girişinin TEK yolu (cetvel §4)
// ---------------------------------------------------------------------------

/** Jsonb zarfını cast'siz, alan alan daraltarak okur — beklenmeyen şekil = başarısızlık. */
function parseGoodsReceiptResult(data: Json | null): GoodsReceiptResult {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return { success: false, error: 'unexpected RPC response shape' }
  }
  return {
    success: data.success === true,
    error: typeof data.error === 'string' ? data.error : undefined,
    receipt_id: typeof data.receipt_id === 'string' ? data.receipt_id : undefined,
    processed_count: typeof data.processed_count === 'number' ? data.processed_count : undefined,
    received_units: typeof data.received_units === 'number' ? data.received_units : undefined,
    po_status: typeof data.po_status === 'string' ? data.po_status : undefined,
  }
}

/**
 * `process_goods_receipt` RPC'sini çağırır ve zarfı okur. Stok/maliyet yazımının
 * TAMAMI RPC'nin içindedir; bu fonksiyon istemci tarafında stok yazmaz.
 * HTTP 200'e güvenilmez: `success === true` şart (T052 dersi — PostgREST, RPC
 * gövdesi `success:false` dönse de 200 verir).
 */
export async function processGoodsReceipt(
  supabase: SupabaseClient<Database>,
  args: { poId: string; documentNo: string; lines: GoodsReceiptLineInput[]; note?: string },
): Promise<GoodsReceiptResult> {
  const { data, error } = await supabase.rpc('process_goods_receipt', {
    p_po_id: args.poId,
    p_document_no: args.documentNo,
    // Taze nesne literali: arayüz tipi Json'a atanamaz (index imzası yok), literal atanır.
    p_lines: args.lines.map((l) => ({
      product_id: l.product_id,
      qty: l.qty,
      unit_cost: l.unit_cost ?? null,
    })),
    p_note: args.note,
  })
  if (error) throw error

  const result = parseGoodsReceiptResult(data ?? null)
  if (result.success === true) {
    await logAdminAction(supabase, {
      table_name: 'goods_receipts',
      row_pk: result.receipt_id ?? null,
      action: 'CUSTOM',
      after: result,
      comment: `goods-receipt po=${args.poId} doc=${args.documentNo}`,
    })
  }
  return result
}

export async function listGoodsReceipts(
  supabase: SupabaseClient<Database>,
  poId: string,
): Promise<GoodsReceiptRow[]> {
  const { data, error } = await supabase
    .from('goods_receipts')
    .select('*')
    .eq('po_id', poId)
    .order('received_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
