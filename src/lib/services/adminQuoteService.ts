/**
 * Admin teklif servisi — yayım yolu (REC-54 / E5 Faz 1b küçük onarım).
 * Cetvel: docs/standards/quote-standard.md §6 (yayım kapısı), §8 (yayım yolu).
 *
 * DI kuralı (CLAUDE.md #2): her fonksiyon ilk parametre olarak
 * `SupabaseClient<Database>` alır; modül düzeyinde client importu yok.
 *
 * NİÇİN VAR (canlıda ölçüldü 2026-09-24): admin ekranı yayımı `status` UPDATE'iyle
 * yapıyordu. Tetiğin yayım kapısı BAŞLIKTA `valid_until` + `currency` ister; bu iki
 * başlık kolonunun `authenticated` UPDATE yetkisi YOK ve olmamalı (müşteri kendi kabul
 * UPDATE'inin içinde süreyi uzatabilirdi — 20260828120000 başlığı). Onları yazabilen tek
 * yol `admin_publish_quote` RPC'si; ekran onu hiç çağırmıyordu → yayım HER ZAMAN düşüyordu.
 *
 * Başlık değerleri kalemlerden TÜRETİLİR (ekrana yeni alan eklemeden):
 *   - para birimi: bütün kalemlerde TEK ve aynı olmalı — karışık para birimli belgenin
 *     tek bir `currency` başlığı yalan söyler;
 *   - geçerlilik: kalemlerin EN ERKEN `valid_until`'i — belge, en kısa ömürlü kaleminden
 *     daha uzun geçerli ilan edilemez; ve gelecekte olmalı (§6 ek kural).
 * Denetim izi RPC gövdesinde, yazma ile aynı transaction'da yazılır (CLAUDE.md #11).
 */

import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'

type QuoteItemRow = Database['public']['Tables']['venthub_quote_items']['Row']

export type PublishItem = Pick<QuoteItemRow, 'unit_price' | 'currency' | 'valid_until'>

export type PublishHeader =
  | { ok: true; validUntil: string; currency: string }
  | { ok: false; reason: 'no-items' | 'price' | 'currency' | 'validity' }

const ISO_PARA = /^[A-Z]{3}$/

/** Kalemlerden yayım başlığını türetir; eksik/tutarsızsa yayımlanamaz nedenini döndürür. */
export function derivePublishHeader(items: readonly PublishItem[], now: Date = new Date()): PublishHeader {
  if (items.length === 0) return { ok: false, reason: 'no-items' }
  if (items.some((i) => typeof i.unit_price !== 'number')) return { ok: false, reason: 'price' }

  const paralar = new Set(items.map((i) => (i.currency ?? '').trim().toUpperCase()))
  const [para] = [...paralar]
  if (paralar.size !== 1 || !ISO_PARA.test(para)) return { ok: false, reason: 'currency' }

  const sureler = items.map((i) => (i.valid_until ? Date.parse(i.valid_until) : Number.NaN))
  if (sureler.some((s) => Number.isNaN(s))) return { ok: false, reason: 'validity' }
  const enErken = Math.min(...sureler)
  if (enErken <= now.getTime()) return { ok: false, reason: 'validity' }

  return { ok: true, validUntil: new Date(enErken).toISOString(), currency: para }
}

/** Taslak teklifi yayımlar (draft → quoted). Yetki ve kapılar DB'de; hata fırlatır. */
export async function publishQuote(
  supabase: SupabaseClient<Database>,
  quoteId: string,
  header: { validUntil: string; currency: string },
): Promise<void> {
  const { error } = await supabase.rpc('admin_publish_quote', {
    p_quote_id: quoteId,
    p_valid_until: header.validUntil,
    p_currency: header.currency,
  })
  if (error) throw error
}
