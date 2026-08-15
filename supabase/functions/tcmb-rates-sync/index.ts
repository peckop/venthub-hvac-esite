// tcmb-rates-sync — TCMB günlük gösterge kurlarını currency_rates'e ekler (append-only).
// Tetik: pg_cron 'tcmb-rates-sync-daily' (12:45 UTC = 15:45 TSİ; migration 20260813_pricing_w0_cost_parity).
// Auth yok (verify_jwt=false) — bilinçli: yazılan veri yalnız resmî TCMB kuru ve bülten-tarihi
// idempotency'si (partial unique index) aynı bülteni ikinci kez yazdırmaz; açık çağrı = no-op tekrarı.
// Hafta sonu/tatil: today.xml son yayınlanan bülteni döndürür → satır zaten var → no-op.
// Kur taşıma sözleşmesi: çözücü "en güncel effective_date ≤ bugün" okur (currency_rates_latest_idx).

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const TCMB_URL = 'https://www.tcmb.gov.tr/kurlar/today.xml'
const QUOTE_CURRENCIES = ['EUR', 'USD']

interface ParsedBulletin {
  effectiveDate: string // ISO yyyy-mm-dd
  rates: Record<string, number>
}

// rate = Efektif Satış (BanknoteSelling; boşsa ForexSelling) — pricing-standard §5,
// maliyet çevirisinde güvenli (yüksek) taraf.
function parseBulletin(xml: string): ParsedBulletin | null {
  const dateMatch = xml.match(/Tarih_Date[^>]*\bDate="(\d{2})\/(\d{2})\/(\d{4})"/)
  if (!dateMatch) return null
  const [, month, day, year] = dateMatch
  const rates: Record<string, number> = {}
  for (const code of QUOTE_CURRENCIES) {
    const block = xml.match(new RegExp(`<Currency[^>]*CurrencyCode="${code}"[\\s\\S]*?</Currency>`))
    if (!block) continue
    const pick = (tag: string): number => {
      const m = block[0].match(new RegExp(`<${tag}>([\\d.]+)</${tag}>`))
      return m ? Number(m[1]) : NaN
    }
    const banknote = pick('BanknoteSelling')
    const forex = pick('ForexSelling')
    const rate = Number.isFinite(banknote) && banknote > 0 ? banknote : forex
    if (Number.isFinite(rate) && rate > 0) rates[code] = rate
  }
  if (Object.keys(rates).length === 0) return null
  return { effectiveDate: `${year}-${month}-${day}`, rates }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase config' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  const supabase = createClient(supabaseUrl, serviceKey)

  let xml = ''
  try {
    const res = await fetch(TCMB_URL, { headers: { Accept: 'application/xml' } })
    if (!res.ok) {
      // TCMB erişilemez → hata değil taşıma: mevcut son satır geçerli kalır (çözücü latest okur)
      return new Response(JSON.stringify({ ok: true, carried: true, reason: `tcmb-http-${res.status}` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    xml = await res.text()
  } catch (_err) {
    return new Response(JSON.stringify({ ok: true, carried: true, reason: 'tcmb-unreachable' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const bulletin = parseBulletin(xml)
  if (!bulletin) {
    return new Response(JSON.stringify({ ok: false, error: 'tcmb-parse-failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const { data: tenants, error: tenantsError } = await supabase.from('tenants').select('id')
  if (tenantsError || !tenants) {
    return new Response(JSON.stringify({ ok: false, error: tenantsError?.message ?? 'tenants-read-failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  let inserted = 0
  let skipped = 0
  const errors: string[] = []
  for (const tenant of tenants as { id: string }[]) {
    for (const [code, rate] of Object.entries(bulletin.rates)) {
      const { data: existing, error: readError } = await supabase
        .from('currency_rates')
        .select('id')
        .eq('tenant_id', tenant.id)
        .eq('quote_ccy', code)
        .eq('effective_date', bulletin.effectiveDate)
        .eq('source', 'tcmb')
        .limit(1)
      if (readError) {
        errors.push(`${code}: ${readError.message}`)
        continue
      }
      if (existing && existing.length > 0) {
        skipped++
        continue
      }
      const { error: insertError } = await supabase.from('currency_rates').insert({
        tenant_id: tenant.id,
        base_ccy: 'TRY',
        quote_ccy: code,
        rate,
        source: 'tcmb',
        effective_date: bulletin.effectiveDate
      })
      if (insertError) {
        // Yarış durumunda unique index ikinci yazımı engeller → no-op say
        if (insertError.code === '23505') skipped++
        else errors.push(`${code}: ${insertError.message}`)
      } else {
        inserted++
      }
    }
  }

  const ok = errors.length === 0
  return new Response(
    JSON.stringify({ ok, bulletinDate: bulletin.effectiveDate, rates: bulletin.rates, inserted, skipped, errors }),
    { status: ok ? 200 : 500, headers: { 'Content-Type': 'application/json' } }
  )
})
