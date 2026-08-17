/**
 * Teklif (RFQ) servisi — T067-VH (cetvel: docs/standards/quote-standard.md).
 *
 * DI kuralı (CLAUDE.md #2): her fonksiyon ilk parametre olarak
 * `SupabaseClient<Database>` alır; modül düzeyinde client importu yok.
 *
 * Fiyat otoritesi (cetvel Q3/R5): bu servis MÜŞTERİ yüzünün servisidir —
 * fiyat kolonlarına (unit_price/currency/valid_until) yazan hiçbir yol içermez.
 * Admin fiyatlaması admin kuyruğunda `mutateWithAudit` kapısından yapılır.
 *
 * Tipler `database.types.ts`'ten (supabase:gen) gelir; status/source DB'de text
 * olduğundan üretilen tip `string`'dir — geçiş meşruluğunu SSOT makinesi + DB
 * tetiği zorlar, UI kaynak-tip prop'ları için dar `QuoteSource` burada tanımlı.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'
import {
  allowedCustomerQuoteActions,
  type QuoteStatus,
} from '../quotes/quoteStatusMachine'

export type QuoteRow = Database['public']['Tables']['venthub_quotes']['Row']
export type QuoteItemRow = Database['public']['Tables']['venthub_quote_items']['Row']

/** v1 giriş kapıları (cetvel Q4) — DB check kısıtının UI aynası. */
export type QuoteSource = 'pdp' | 'cart' | 'project'

export interface QuoteRequestItemInput {
  productId: string | null
  productName: string
  qty: number
  note?: string | null
}

export interface CreateQuoteRequestInput {
  userId: string
  source: QuoteSource
  sourceProjectId?: string | null
  items: QuoteRequestItemInput[]
}

export interface QuoteWithItems extends QuoteRow {
  items: QuoteItemRow[]
}

/**
 * Teklif talebi aç: başlık + kalem snapshot'ları (cetvel Q1 — içerik kopyalanır,
 * kaynak satır ID'leri kopyalanmaz). Kalemsiz talep anlamsızdır → hata.
 */
export async function createQuoteRequest(
  supabase: SupabaseClient<Database>,
  input: CreateQuoteRequestInput,
): Promise<QuoteRow> {
  if (input.items.length === 0) {
    throw new Error('quote request needs at least one item')
  }

  const { data: quote, error } = await supabase
    .from('venthub_quotes')
    .insert({
      user_id: input.userId,
      source: input.source,
      source_project_id: input.sourceProjectId ?? null,
    })
    .select()
    .single()
  if (error) throw error

  const { error: itemsError } = await supabase.from('venthub_quote_items').insert(
    input.items.map((item) => ({
      quote_id: quote.id,
      product_id: item.productId,
      product_name: item.productName,
      qty: item.qty,
      note: item.note ?? null,
    })),
  )
  if (itemsError) {
    // Kalem yazımı düştüyse başlık tek başına anlamsız — ama DELETE politikası
    // bilinçli olarak yok (ticari kayıt silinmez). Yarım başlık 'requested'ta
    // kalır ve admin kuyruğunda kalemsiz görünür; sessiz yutmak yerine hatayı
    // yükselt ki kullanıcı yeniden denesin (fail-closed dikişi görünür olsun).
    throw itemsError
  }

  return quote
}

/** Oturum sahibinin teklifleri, kalemleriyle — en yeni önce. RLS zaten sahiplik süzer. */
export async function listMyQuotes(
  supabase: SupabaseClient<Database>,
): Promise<QuoteWithItems[]> {
  const { data: quotes, error } = await supabase
    .from('venthub_quotes')
    .select()
    .order('created_at', { ascending: false })
  if (error) throw error
  if (!quotes || quotes.length === 0) return []

  // Kalemler ikinci sorguyla (köprü şemada ilişki metadata'sı yok — nested select
  // regen'den SONRA düşünülebilir; iki düz sorgu tip-güvenli ve yeterli).
  const { data: items, error: itemsError } = await supabase
    .from('venthub_quote_items')
    .select()
    .in('quote_id', quotes.map((q) => q.id))
    .order('created_at', { ascending: true })
  if (itemsError) throw itemsError

  const byQuote = new Map<string, QuoteItemRow[]>()
  for (const item of items ?? []) {
    const list = byQuote.get(item.quote_id) ?? []
    list.push(item)
    byQuote.set(item.quote_id, list)
  }

  return quotes.map((q) => ({ ...q, items: byQuote.get(q.id) ?? [] }))
}

/** Tek teklif + kalemleri. Bulunamadıysa (ya da RLS süzdüyse) null. */
export async function getQuoteDetail(
  supabase: SupabaseClient<Database>,
  quoteId: string,
): Promise<QuoteWithItems | null> {
  const { data: quote, error } = await supabase
    .from('venthub_quotes')
    .select()
    .eq('id', quoteId)
    .maybeSingle()
  if (error) throw error
  if (!quote) return null

  const { data: items, error: itemsError } = await supabase
    .from('venthub_quote_items')
    .select()
    .eq('quote_id', quoteId)
    .order('created_at', { ascending: true })
  if (itemsError) throw itemsError

  return { ...quote, items: items ?? [] }
}

/**
 * Müşteri kararı: quoted → accepted | rejected. İzin SSOT'tan sorulur (R1);
 * DB tetiği + RLS politikası aynı sınırı sunucu tarafında da zorlar.
 */
export async function decideQuote(
  supabase: SupabaseClient<Database>,
  quote: Pick<QuoteRow, 'id' | 'status'>,
  decision: Extract<QuoteStatus, 'accepted' | 'rejected'>,
): Promise<void> {
  if (!allowedCustomerQuoteActions(quote.status).includes(decision)) {
    throw new Error(`invalid customer quote transition: ${quote.status} -> ${decision}`)
  }

  const { error } = await supabase
    .from('venthub_quotes')
    .update({ status: decision })
    .eq('id', quote.id)
  if (error) throw error
}
