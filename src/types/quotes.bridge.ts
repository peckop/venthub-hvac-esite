/**
 * ⚠️ GEÇİCİ KÖPRÜ TİPLERİ — MERGE SONRASI `pnpm supabase:gen` KOŞ + BU DOSYAYI SİL.
 *
 * `venthub_quotes` / `venthub_quote_items` tabloları migration
 * (20260816125346_quotes_v1.sql) merge edilip prod'a uygulanana kadar
 * `src/types/database.types.ts` içinde YOK; typed client `.from('venthub_quotes')`
 * çağrısını reddeder. Bu dosya o boşluğu DAR bir şema ile köprüler
 * (Seçenek C — OPS-AUDIT kararı, 2026-08-16; kanıtlı desen: ADMIN #557→#561).
 *
 * KURALLAR:
 *  - `database.types.ts`'e ELLE DOKUNULMAZ (drift riski orada ölümcül; burada köprü
 *    izole ve silinmek üzere işaretli).
 *  - Yalnız KULLANILAN alanlar tanımlı — tablo genişlerse regen zaten getirecek.
 *  - Köprü şema `Database`'in KESİŞİM genişletmesidir (yabancı bir şemaya çift-adımlı
 *    unknown dökümü DEĞİL): mevcut tüm tablolar tip görünümünde aynen kalır, yalnız
 *    iki yeni tablo eklenir; `withQuotesSchema` tek `as` ile akraba tipe daraltır.
 *  - Migration merge olduğu GÜN: `pnpm supabase:gen` → bu dosyayı sil →
 *    `withQuotesSchema(supabase)` çağrılarını düz `supabase`'e çevir (takip: registry T067-VH).
 */

import type { SupabaseClient } from '@supabase/supabase-js'

import type { QuoteStatus } from '../lib/quotes/quoteStatusMachine'
import type { Database } from './database.types'

export type QuoteSource = 'pdp' | 'cart' | 'project'

export type QuoteRow = {
  id: string
  user_id: string
  source: QuoteSource
  source_project_id: string | null
  status: QuoteStatus
  tenant_id: string
  created_at: string
  updated_at: string
}

export type QuoteInsert = {
  user_id: string
  source: QuoteSource
  source_project_id?: string | null
}

export type QuoteUpdate = {
  status?: QuoteStatus
}

export type QuoteItemRow = {
  id: string
  quote_id: string
  product_id: string | null
  product_name: string
  qty: number
  note: string | null
  unit_price: number | null
  currency: string | null
  valid_until: string | null
  tenant_id: string
  created_at: string
  updated_at: string
}

export type QuoteItemInsert = {
  quote_id: string
  product_id?: string | null
  product_name: string
  qty: number
  note?: string | null
}

/** Yalnız admin fiyatlama yolu kullanır (cetvel Q3/R5 — müşteri yüzünde bu tip import edilmez). */
export type QuoteItemPriceUpdate = {
  unit_price?: number | null
  currency?: string | null
  valid_until?: string | null
}

type QuotesTables = {
  venthub_quotes: {
    Row: QuoteRow
    Insert: QuoteInsert
    Update: QuoteUpdate
    Relationships: []
  }
  venthub_quote_items: {
    Row: QuoteItemRow
    Insert: QuoteItemInsert
    Update: QuoteItemPriceUpdate
    Relationships: []
  }
}

/** Database + iki yeni tablo — regen sonrası bu tipin kendisi gereksizleşir ve silinir. */
type QuotesBridgeDatabase = Omit<Database, 'public'> & {
  public: Omit<Database['public'], 'Tables'> & {
    Tables: Database['public']['Tables'] & QuotesTables
  }
}

/**
 * Mevcut DI client'ını (SupabaseClient<Database>) quotes tablolarını da tanıyan
 * genişletilmiş şemaya daraltır. Runtime'da HİÇBİR ŞEY yapmaz — yalnız tip görünümü.
 * İkinci bir client YARATILMAZ (çift-GoTrueClient donma dersi).
 */
export function withQuotesSchema(
  supabase: SupabaseClient<Database>,
): SupabaseClient<QuotesBridgeDatabase> {
  return supabase as SupabaseClient<QuotesBridgeDatabase>
}
