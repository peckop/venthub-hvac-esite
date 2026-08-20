import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'

/**
 * Fatura defteri servisi (T132-VH · Fatura v1).
 *
 * Cetvel: docs/standards/legal-compliance-standard.md §2.3
 *
 * TASARIM: "faturalandı" bir bayrak DEĞİL, `order_invoices` tablosunda **satırın
 * varlığıdır**. Bu yüzden burada `markAsInvoiced(order)` gibi kolon güncelleyen bir
 * fonksiyon YOKTUR — fatura kesmek bir kayıt eklemektir. İki doğruluk kaynağı
 * üretmemek bilinçli karardır: bayrak ile defter ayrışırsa hangisinin doğru olduğunu
 * kimse bilemez (bu depoda `status` ↔ `payment_status` karışımı tam bunu yaşattı).
 *
 * TİP NOTU: `order_invoices` ve `view_admin_uninvoiced_orders` bu dosya yazılırken
 * `database.types.ts` içinde YOK — tipler migration prod'a indikten sonra
 * `pnpm supabase:gen` ile üretilir. O ana kadar ilişki adı `as never` ile geçilir
 * (bu depoda kanıtlanmış desen: `inventory_velocity`, `inventory_summary`) ve dönen
 * satırlar aşağıdaki **çalışma anında okuyan** eşleyicilerle daraltılır. `any` yok,
 * kör dönüşüm yok: alan beklenmedik tipte gelirse eşleyici sessizce boş değil,
 * belirgin bir hata verir.
 */

export interface OrderInvoiceRow {
  id: string
  order_id: string
  invoice_no: string
  invoice_date: string
  invoice_type: string | null
  issued_by: string | null
  note: string | null
  created_at: string
}

export interface UninvoicedOrderRow {
  id: string
  order_number: string | null
  created_at: string
  total_amount: number | null
  customer_name: string | null
  customer_email: string | null
  invoice_type: string | null
}

export interface CreateInvoiceInput {
  orderId: string
  invoiceNo: string
  invoiceDate: string
  invoiceType?: string | null
  note?: string | null
}

const DEFTER = 'order_invoices'
const FATURASIZ_VIEW = 'view_admin_uninvoiced_orders'

/** Zorunlu metin alanı — yoksa sessizce boş dizeye düşmek yerine hata verir. */
function metin(kayit: Record<string, unknown>, alan: string): string {
  const deger = kayit[alan]
  if (typeof deger !== 'string' || deger === '') {
    throw new Error(`order_invoices: '${alan}' alanı beklenen metin değil (gelen: ${typeof deger})`)
  }
  return deger
}

/** İsteğe bağlı metin alanı. */
function metinVeyaBos(kayit: Record<string, unknown>, alan: string): string | null {
  const deger = kayit[alan]
  return typeof deger === 'string' && deger !== '' ? deger : null
}

function sayiVeyaBos(kayit: Record<string, unknown>, alan: string): number | null {
  const deger = kayit[alan]
  if (typeof deger === 'number') return deger
  if (typeof deger === 'string' && deger.trim() !== '' && Number.isFinite(Number(deger))) {
    return Number(deger)
  }
  return null
}

function faturaSatiri(ham: unknown): OrderInvoiceRow {
  const kayit = (ham ?? {}) as Record<string, unknown>
  return {
    id: metin(kayit, 'id'),
    order_id: metin(kayit, 'order_id'),
    invoice_no: metin(kayit, 'invoice_no'),
    invoice_date: metin(kayit, 'invoice_date'),
    invoice_type: metinVeyaBos(kayit, 'invoice_type'),
    issued_by: metinVeyaBos(kayit, 'issued_by'),
    note: metinVeyaBos(kayit, 'note'),
    created_at: metin(kayit, 'created_at'),
  }
}

function faturasizSatir(ham: unknown): UninvoicedOrderRow {
  const kayit = (ham ?? {}) as Record<string, unknown>
  return {
    id: metin(kayit, 'id'),
    order_number: metinVeyaBos(kayit, 'order_number'),
    created_at: metin(kayit, 'created_at'),
    total_amount: sayiVeyaBos(kayit, 'total_amount'),
    customer_name: metinVeyaBos(kayit, 'customer_name'),
    customer_email: metinVeyaBos(kayit, 'customer_email'),
    invoice_type: metinVeyaBos(kayit, 'invoice_type'),
  }
}

/** Fatura defteri — en yeni kayıt önce. */
export async function listInvoices(
  supabase: SupabaseClient<Database>,
  opts: { limit?: number; offset?: number } = {},
): Promise<{ rows: OrderInvoiceRow[]; count: number | null }> {
  const limit = opts.limit ?? 50
  const offset = opts.offset ?? 0

  const { data, error, count } = await supabase
    .from(DEFTER as never)
    .select('*', { count: 'exact' })
    .order('invoice_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return { rows: (data ?? []).map(faturaSatiri), count: count ?? null }
}

/** Tek siparişin faturaları (v1'de en fazla bir tane olur; düzeltme faturası kapsam dışı). */
export async function listInvoicesForOrder(
  supabase: SupabaseClient<Database>,
  orderId: string,
): Promise<OrderInvoiceRow[]> {
  const { data, error } = await supabase
    .from(DEFTER as never)
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(faturaSatiri)
}

/**
 * Ödemesi tamamlanmış ama defterde satırı olmayan siparişler — §2.3'ün 1. adımı.
 *
 * Filtre DB'de (view) yapılır. İstemcide hesaplansaydı sayfalama ile birlikte yanlış
 * sonuç verirdi: o sayfada görünmeyen bir fatura satırı yüzünden faturalı sipariş
 * "faturasız" listelenirdi.
 */
export async function listUninvoicedPaidOrders(
  supabase: SupabaseClient<Database>,
  opts: { limit?: number } = {},
): Promise<UninvoicedOrderRow[]> {
  const { data, error } = await supabase
    .from(FATURASIZ_VIEW as never)
    .select('*')
    .order('created_at', { ascending: true })
    .limit(opts.limit ?? 200)

  if (error) throw error
  return (data ?? []).map(faturasizSatir)
}

/**
 * Fatura kaydı ekler = siparişi "faturalandı" yapar.
 *
 * DB tarafındaki iki kapı burada TEKRARLANMAZ (tek yerde kalsınlar): ödenmemiş siparişe
 * kayıt açılamaz (tetik) ve fatura numarası tekildir (unique indeks). Buradaki iş
 * yalnızca girdiyi normalize etmek — kapıyı istemciye kopyalamak, kopyanın bir gün
 * asıldan ayrışması demektir.
 */
export async function createInvoice(
  supabase: SupabaseClient<Database>,
  input: CreateInvoiceInput,
): Promise<OrderInvoiceRow> {
  const invoiceNo = input.invoiceNo.trim()
  if (!invoiceNo) throw new Error('Fatura numarası boş olamaz')

  const { data: authData } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from(DEFTER as never)
    .insert({
      order_id: input.orderId,
      invoice_no: invoiceNo,
      invoice_date: input.invoiceDate,
      invoice_type: input.invoiceType ?? null,
      issued_by: authData?.user?.id ?? null,
      note: input.note?.trim() || null,
    } as never)
    .select('*')
    .single()

  if (error) throw error
  return faturaSatiri(data)
}
