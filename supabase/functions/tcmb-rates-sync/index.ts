// tcmb-rates-sync — TCMB günlük gösterge kurlarını currency_rates'e ekler (append-only).
// Tetik: pg_cron 'tcmb-rates-sync-daily' (12:45 UTC = 15:45 TSİ; migration 20260813_pricing_w0_cost_parity).
// Auth yok (verify_jwt=false) — bilinçli: yazılan veri yalnız resmî TCMB kuru ve bülten-tarihi
// idempotency'si (partial unique index) aynı bülteni ikinci kez yazdırmaz; açık çağrı = no-op tekrarı.
// Hafta sonu/tatil: today.xml son yayınlanan bülteni döndürür → satır zaten var → no-op.
// Kur taşıma sözleşmesi: çözücü "en güncel effective_date ≤ bugün" okur (currency_rates_latest_idx).

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { bultenTamMi, cooldownKarari, damgaAtilsinMi, istanbulBugun, type CooldownNedeni } from './cooldown.ts'

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

// D5 (OPS-293): uç `verify_jwt=false` ve kimliksiz; yetkisiz çağrı sahte kur YAZDIRAMAZ ama her çağrı
// TCMB'ye gider (kaynak tüketimi, kota). Sertleştirme (karar: ./cooldown.ts, saf ve testli): bugünün (İstanbul)
// bülteni DB'de varsa, bu isolate son 30 dk içinde başarılı bir TCMB isteği yaptıysa ya da bir istek sürüyorsa
// TCMB'ye HİÇ gitmeden `carried:true` döner. Kimlik denetimi (JWT + Actions) bu işin DIŞINDA: ayrı karar.
let sonBasariMs = 0 // isolate ömrü boyunca; yalnız yazım TAM başarılıysa (bkz. damgaAtilsinMi) kurulur
let surenIstek = false // eşzamanlı çağrılar tek uçuşa iner (await'ten ÖNCE, eşzamanlı kurulur)

// `neden` hangi kapının tetiklendiğini ayırt eder (cron sessizce kaçarsa net._http_response'ta görünür).
const cooldownYanit = (neden: CooldownNedeni) =>
  new Response(JSON.stringify({ ok: true, carried: true, reason: neden }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })

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

  // 1) Eşzamanlı kapı (await YOK): sürmekte olan istek ya da yakın başarılı istek varsa hemen dön.
  const ilkKarar = cooldownKarari({ simdiMs: Date.now(), sonBasariMs, surenIstek, bugununBultenTam: null })
  if (ilkKarar !== 'devam') return cooldownYanit(ilkKarar)
  surenIstek = true
  try {
    // 2) Bugünün bülteni HER kiracı × HER kur için yazıldıysa TCMB'ye gitme ("herhangi bir satır" yetmez: eksik
    //    yazımı onarmak kilitlenirdi). Okuma hatası fail-open (eski davranış), yalnız loga yazılır.
    const [{ data: kiracilar, error: kiracilarHatasi }, { data: bugunSatirlari, error: bugunHatasi }] = await Promise.all([
      supabase.from('tenants').select('id'),
      supabase
        .from('currency_rates')
        .select('tenant_id, quote_ccy')
        .eq('source', 'tcmb')
        .eq('effective_date', istanbulBugun(Date.now()))
    ])
    if (kiracilarHatasi || bugunHatasi) console.error('[tcmb-rates-sync] cooldown okunamadi:', kiracilarHatasi ?? bugunHatasi)
    const bugununBultenTam =
      kiracilarHatasi || bugunHatasi || !kiracilar || !bugunSatirlari
        ? null
        : bultenTamMi(
            (kiracilar as { id: string }[]).map((k) => k.id),
            QUOTE_CURRENCIES,
            bugunSatirlari as { tenant_id: string; quote_ccy: string }[]
          )
    const dbKarari = cooldownKarari({ simdiMs: Date.now(), sonBasariMs, surenIstek: false, bugununBultenTam })
    if (dbKarari !== 'devam') return cooldownYanit(dbKarari)
    return await esitle(supabase)
  } finally {
    surenIstek = false
  }
})

async function esitle(supabase: ReturnType<typeof createClient>): Promise<Response> {
  let xml = ''
  try {
    // Zaman aşımı: asılı kalan TCMB bağlantısı süren-istek bayrağını isolate sınırına kadar tutmasın (cron kaçmasın).
    const res = await fetch(TCMB_URL, { headers: { Accept: 'application/xml' }, signal: AbortSignal.timeout(10_000) })
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
  // S4 (güvenlik karnesi 2026-11): uç `verify_jwt=false`; DB'nin iç hata metni yanıta DÖNMEZ,
  // yalnız loga yazılır. Yanıtta sabit kod ve Postgres hata kodu kalır (teşhis için yeterli).
  if (tenantsError || !tenants) {
    console.error('[tcmb-rates-sync] tenants okunamadi:', tenantsError)
    return new Response(JSON.stringify({ ok: false, error: 'tenants-read-failed' }), {
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
        console.error(`[tcmb-rates-sync] ${code} okunamadi:`, readError)
        errors.push(`${code}: read-failed (${readError.code ?? '?'})`)
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
        else {
          console.error(`[tcmb-rates-sync] ${code} yazilamadi:`, insertError)
          errors.push(`${code}: insert-failed (${insertError.code ?? '?'})`)
        }
      } else {
        inserted++
      }
    }
  }

  const ok = errors.length === 0
  // Bellek damgası yalnız yazım TAM başarılıysa ve cron anını gölgelemiyorsa (bkz. damgaAtilsinMi).
  if (ok && damgaAtilsinMi(bulletin.effectiveDate, Date.now())) sonBasariMs = Date.now()
  return new Response(
    JSON.stringify({ ok, bulletinDate: bulletin.effectiveDate, rates: bulletin.rates, inserted, skipped, errors }),
    { status: ok ? 200 : 500, headers: { 'Content-Type': 'application/json' } }
  )
}
