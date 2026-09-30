import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import type { Database } from '../../../types/database.types'
import {
  clearProductFixedPrice,
  isProductFixedRuleConflict,
  isValidFixedPriceAmount,
  PRODUCT_FIXED_PRICE_MAX,
  setProductFixedPrice,
} from '../pricingAdmin.service'
import { DERIVED_VALID_FROM, MATERIALIZE_URUN_TAVANI, materializePrices } from '../pricingMaterialize.service'
import {
  clearProductPrice,
  setProductPrice,
  verifyProductStorefrontPrice,
} from '../pricingProductPrice.service'

// ── Filtre uygulayan sahte PostgREST ─────────────────────────────────────────
// GERÇEK supabase-js client + sahte fetch. Diğer fiyat testlerinin stub'ından FARKI: sorgu süzgeçlerini
// (`eq.` `is.` `in.`) fixture üstünde GERÇEKTEN uygular. Neden şart: "tek ürün kapsamı" testi, süzgeci yok sayan bir
// stub'da SAHTE YEŞİL verir — kod tüm kataloğu tarasa da stub zaten tümünü döner (INV-TAVAN-1 dersi: gerçeği
// taklit etmeyen stub'ın üstündeki test neyi ölçtüğünü bilmez). Yazmalar bellekteki tabloya işlenir; sonraki
// okuma yazılanı görür (yazdıktan sonra geri okuma testi bunu ister).

type Row = Record<string, unknown>
type Db = Record<string, Row[]>

interface Captured {
  method: string
  table: string
  url: URL
  body: unknown
  headers: Record<string, string>
}

interface StubOptions {
  /** Bu tabloya bu yöntemle yapılan istek 500 döner (yeniden hesap yazımı düşmesi senaryosu). */
  fail?: { table: string; method: string }
  /**
   * RLS USING dışında kalan satıra UPDATE: HATA YOK, 0 satır etkilenir ve gövde boş dizi döner (gerçek PostgREST
   * davranışı). Verilen tabloya PATCH bu şekilde yanıtlanır.
   */
  rlsSessizPatch?: string
  /**
   * `pricing_rule`a EKLEME, ürün başına tek sabit kural indeksine çarpar (gerçek PostgREST biçimi: 409 + 23505, indeks adı
   * `message` içinde, `details` anahtar değerini taşır). `rakip` verilirse çarpışan satır tabloya YAZILIR (yarışı kazanan
   * yöneticinin kuralı); yeniden okuma onu görür. `hep` verilirse her ekleme çarpar (yeniden deneme de çarpışırsa hata yayılır).
   */
  carpisma?: { rakip?: Row; hep?: boolean; indeks?: string }
}

const IGNORED_PARAMS = new Set(['select', 'order', 'limit', 'offset', 'on_conflict', 'columns'])

function matches(row: Row, params: URLSearchParams): boolean {
  for (const [col, raw] of params) {
    if (IGNORED_PARAMS.has(col)) continue
    const dot = raw.indexOf('.')
    const op = raw.slice(0, dot)
    const value = raw.slice(dot + 1)
    if (op === 'eq' && String(row[col]) !== value) return false
    if (op === 'is' && value === 'null' && row[col] !== null && row[col] !== undefined) return false
    if (op === 'in') {
      const list = value.replace(/^\(/, '').replace(/\)$/, '').split(',')
      if (!list.includes(String(row[col]))) return false
    }
  }
  return true
}

function stub(db: Db, options?: StubOptions): { supabase: SupabaseClient<Database>; calls: Captured[]; db: Db } {
  const calls: Captured[] = []
  let idCounter = 0
  let carpismaKullanildi = false
  const fakeFetch: typeof fetch = (input, init) => {
    const href = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    const url = new URL(href)
    const table = url.pathname.split('/').pop() ?? ''
    const method = (init?.method ?? 'GET').toUpperCase()
    const headers: Record<string, string> = {}
    new Headers(init?.headers).forEach((value, key) => {
      headers[key.toLowerCase()] = value
    })
    const single = (headers['accept'] ?? '').includes('pgrst.object')
    const json = (payload: unknown, status = 200) =>
      Promise.resolve(new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } }))

    let body: unknown = null
    if (typeof init?.body === 'string') body = JSON.parse(init.body)
    if (method !== 'GET') calls.push({ method, table, url, body, headers })

    if (options?.fail && options.fail.table === table && options.fail.method === method) {
      return json({ code: 'XX000', message: 'sahte sunucu hatası', details: null, hint: null }, 500)
    }

    db[table] ??= []
    const rows = db[table]

    if (method === 'GET') {
      const filtered = rows.filter((r) => matches(r, url.searchParams))
      const offset = url.searchParams.get('offset')
      const limit = url.searchParams.get('limit')
      const bas = Number(offset ?? 0)
      const found =
        offset !== null || limit !== null
          ? filtered.slice(bas, limit !== null ? bas + Number(limit) : undefined)
          : filtered
      // ⛔Gerçek PostgREST gibi: `count=exact` istenirse KESİN toplam (süzülmüş küme) Content-Range'de gelir.
      // Başlık yoksa sayfalı çekim kapısı (INV-TAVAN-1) "sayı gelmedi" diye hata verir.
      const basliklar: Record<string, string> = { 'Content-Type': 'application/json' }
      if ((headers['prefer'] ?? '').includes('count=exact')) {
        basliklar['Content-Range'] =
          found.length > 0 ? `${bas}-${bas + found.length - 1}/${filtered.length}` : `*/${filtered.length}`
      }
      return Promise.resolve(new Response(JSON.stringify(single ? (found[0] ?? null) : found), { status: 200, headers: basliklar }))
    }

    if (method === 'POST') {
      if (table === 'pricing_rule' && options?.carpisma && (options.carpisma.hep === true || !carpismaKullanildi)) {
        carpismaKullanildi = true
        if (options.carpisma.rakip) rows.push(options.carpisma.rakip)
        return json(
          {
            code: '23505',
            message: `duplicate key value violates unique constraint "${options.carpisma.indeks ?? 'pricing_rule_urun_tek_sabit_uq'}"`,
            details: 'Key (tenant_id, product_id)=(tenant-1, p1) already exists.',
            hint: null,
          },
          409,
        )
      }
      const incoming = (Array.isArray(body) ? body : [body]) as Row[]
      const written: Row[] = []
      for (const item of incoming) {
        if (url.searchParams.get('on_conflict')) {
          const at = rows.findIndex(
            (r) =>
              r['product_id'] === item['product_id'] &&
              r['price_list_id'] === item['price_list_id'] &&
              r['currency'] === item['currency'] &&
              r['valid_from'] === item['valid_from'],
          )
          if (at >= 0) {
            rows[at] = { ...rows[at], ...item }
            written.push(rows[at])
            continue
          }
        }
        idCounter += 1
        // Gerçek DB sütun varsayılanlarını (vat_rate_pct=20, surcharge=0, ...) yazar; stub da yazmalı, yoksa
        // yeni kural hesaplanamaz (NaN) olup sessizce bir sonraki kurala düşer ve test yalancı kırmızı verir.
        const defaults = table === 'pricing_rule' ? ruleRow({}) : {}
        const created = { ...defaults, id: `yeni-${idCounter}`, tenant_id: 'tenant-1', ...item }
        rows.push(created)
        written.push(created)
      }
      return json(single ? written[0] : written, 201)
    }

    if (method === 'PATCH') {
      if (options?.rlsSessizPatch === table) return json(single ? null : [])
      const touched = rows.filter((r) => matches(r, url.searchParams))
      for (const r of touched) Object.assign(r, body as Row)
      return json(single ? (touched[0] ?? null) : touched)
    }

    if (method === 'DELETE') {
      const removed = rows.filter((r) => matches(r, url.searchParams))
      db[table] = rows.filter((r) => !removed.includes(r))
      return json(removed)
    }

    return json(null)
  }
  const supabase = createClient<Database>('http://stub.local', 'stub-key', {
    global: { fetch: fakeFetch },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return { supabase, calls, db }
}

// ── Fixture yardımcıları ─────────────────────────────────────────────────────

function ruleRow(partial: Row): Row {
  return {
    id: 'rule-x',
    tenant_id: 'tenant-1',
    price_book_id: null,
    scope: 4,
    product_id: null,
    brand_id: null,
    category_id: null,
    method: 'cost_plus',
    base: 'cost',
    margin_pct: 40,
    surcharge: 0,
    fixed_price: null,
    vat_rate_pct: 20,
    price_is_vat_inclusive: false,
    min_margin_abs: null,
    max_margin_abs: null,
    round_to: null,
    charm_ending: null,
    min_quantity: 1,
    priority: 0,
    is_exclusive: true,
    currency: null,
    valid_from: null,
    valid_to: null,
    created_at: '2026-08-13T00:00:00Z',
    updated_at: '2026-08-13T00:00:00Z',
    updated_by: null,
    ...partial,
  }
}

function productRow(id: string, cost: number | null = 1000): Row {
  return {
    id,
    name: `Ürün ${id}`,
    sku: `SKU-${id}`,
    brand: '',
    category_id: null,
    cost_in_base: cost,
    status: 'active',
    deleted_at: null,
  }
}

function cacheRow(id: string, productId: string, partial: Row = {}): Row {
  return {
    id,
    product_id: productId,
    price_list_id: 'pl-individual',
    currency: 'TRY',
    valid_from: DERIVED_VALID_FROM,
    is_derived: true,
    is_active: true,
    net_price: 1400,
    gross_price: 1680,
    ...partial,
  }
}

const INDIVIDUAL = { id: 'pl-individual', user_type: 'individual', is_active: true }

/** Katalog: 3 ürün, tek genel %40 marj kuralı, bireysel liste, her ürün için etkin türetilmiş cache satırı. */
function katalog(extra: Partial<Db> = {}): Db {
  return {
    pricing_rule: [ruleRow({ id: 'genel-40' })],
    pricing_policy: [],
    price_lists: [INDIVIDUAL],
    brands: [],
    products: [productRow('p1'), productRow('p2'), productRow('p3')],
    product_prices: [cacheRow('cp1', 'p1'), cacheRow('cp2', 'p2'), cacheRow('cp3', 'p3')],
    ...extra,
  }
}

// ── tutar doğrulaması ────────────────────────────────────────────────────────

describe('isValidFixedPriceAmount', () => {
  it('yalnız 0 < tutar ≤ üst sınırı kabul eder', () => {
    expect(isValidFixedPriceAmount(0.01)).toBe(true)
    expect(isValidFixedPriceAmount(PRODUCT_FIXED_PRICE_MAX)).toBe(true)
    for (const kotu of [0, -5, Number.NaN, Number.POSITIVE_INFINITY, PRODUCT_FIXED_PRICE_MAX + 1]) {
      expect(isValidFixedPriceAmount(kotu)).toBe(false)
    }
  })
})

// ── setProductFixedPrice ─────────────────────────────────────────────────────

describe('setProductFixedPrice', () => {
  it('kural YOKSA oluşturur: tenant gönderilmez, yöntem başlığı taşınır, öncelik 0', async () => {
    const { supabase, calls } = stub({ pricing_rule: [ruleRow({ id: 'genel-40' })] })

    const rule = await setProductFixedPrice(supabase, 'p1', { amount: 2400, vatIncluded: true }, 'panel', 'user-1')

    const yazma = calls.filter((c) => c.table === 'pricing_rule')
    expect(yazma).toHaveLength(1)
    expect(yazma[0].method).toBe('POST')
    expect(yazma[0].body).toMatchObject({
      scope: 1,
      product_id: 'p1',
      method: 'fixed',
      fixed_price: 2400,
      price_is_vat_inclusive: true,
      min_quantity: 1,
      priority: 0,
      updated_by: 'user-1',
    })
    expect(yazma[0].body).not.toHaveProperty('tenant_id')
    expect(yazma[0].headers['x-degisiklik-yontemi']).toBe('panel')
    expect(rule.id).toBe('yeni-1')
  })

  it('ürünün başka ürün-kapsamlı kuralı varsa onun ÜSTÜNDE kazanacak öncelik alır', async () => {
    const { supabase, calls } = stub({
      pricing_rule: [ruleRow({ id: 'marj', scope: 1, product_id: 'p1', priority: 5 })],
    })

    await setProductFixedPrice(supabase, 'p1', { amount: 100, vatIncluded: false }, 'panel', null)

    expect(calls[0].body).toMatchObject({ priority: 6, price_is_vat_inclusive: false, updated_by: null })
  })

  it('sabit kural VARSA günceller (yeni satır açmaz), yöntem başlığı liste', async () => {
    const { supabase, calls } = stub({
      pricing_rule: [
        ruleRow({
          id: 'sabit-1',
          scope: 1,
          product_id: 'p1',
          method: 'fixed',
          fixed_price: 1000,
        }),
      ],
    })

    const rule = await setProductFixedPrice(supabase, 'p1', { amount: 1500, vatIncluded: false }, 'liste', 'user-2')

    expect(calls).toHaveLength(1)
    expect(calls[0].method).toBe('PATCH')
    expect(calls[0].url.searchParams.get('id')).toBe('eq.sabit-1')
    expect(calls[0].body).toMatchObject({
      fixed_price: 1500,
      price_is_vat_inclusive: false,
      valid_from: null,
      valid_to: null,
      updated_by: 'user-2',
    })
    expect(calls[0].headers['x-degisiklik-yontemi']).toBe('liste')
    expect(rule.fixed_price).toBe(1500)
  })

  it('güncellerken eski kuraldan kalan ek ücret/kelepçe/yuvarlama/charm SIFIRLANIR, KDV oranı korunur, öncelik diğer kuralların üstüne çıkar', async () => {
    const { supabase, calls } = stub({
      pricing_rule: [
        ruleRow({
          id: 'sabit-1',
          scope: 1,
          product_id: 'p1',
          method: 'fixed',
          fixed_price: 1000,
          priority: 0,
          surcharge: 50,
          min_margin_abs: 200,
          max_margin_abs: 300,
          round_to: 10,
          charm_ending: 0.99,
          vat_rate_pct: 10,
        }),
        ruleRow({ id: 'sonradan-marj', scope: 1, product_id: 'p1', priority: 7 }),
      ],
    })

    await setProductFixedPrice(supabase, 'p1', { amount: 500, vatIncluded: false }, 'panel', null)

    const govde = calls[0].body as Row
    expect(govde).toMatchObject({
      surcharge: 0,
      min_margin_abs: null,
      max_margin_abs: null,
      round_to: null,
      charm_ending: null,
      currency: null,
      priority: 8,
    })
    expect(govde).not.toHaveProperty('vat_rate_pct')
  })

  it('başka ürünün, kademeli (adet>1) ya da kitaba özel sabit kuralı "ürünün sabit kuralı" SAYILMAZ', async () => {
    const { supabase, calls } = stub({
      pricing_rule: [
        ruleRow({ id: 'baska-urun', scope: 1, product_id: 'p9', method: 'fixed', fixed_price: 1 }),
        ruleRow({ id: 'kademeli', scope: 1, product_id: 'p1', method: 'fixed', fixed_price: 1, min_quantity: 10 }),
        ruleRow({ id: 'kitap', scope: 1, product_id: 'p1', method: 'fixed', fixed_price: 1, price_book_id: 'pl-dealer' }),
      ],
    })

    await setProductFixedPrice(supabase, 'p1', { amount: 50, vatIncluded: true }, 'panel', null)

    expect(calls.map((c) => c.method)).toEqual(['POST'])
    // kademeli (0) ve kitaba özel (0) kuralların en yükseği 0 → yeni kural 1.
    expect(calls[0].body).toMatchObject({ priority: 1 })
  })

  it('para birimli ya da dönemli (kampanya) sabit kural "ürünün sabit kuralı" SAYILMAZ: süresiz kural yeni açılır, kampanya kuralı DOKUNULMAZ', async () => {
    const { supabase, calls, db } = stub({
      pricing_rule: [
        ruleRow({ id: 'usd', scope: 1, product_id: 'p1', method: 'fixed', fixed_price: 1, currency: 'USD', priority: 3 }),
        ruleRow({ id: 'kampanya', scope: 1, product_id: 'p1', method: 'fixed', fixed_price: 2, valid_from: '2027-01-01', valid_to: '2027-02-01', priority: 4 }),
      ],
    })

    await setProductFixedPrice(supabase, 'p1', { amount: 50, vatIncluded: true }, 'panel', null)

    expect(calls.map((c) => c.method)).toEqual(['POST'])
    expect(calls[0].body).toMatchObject({ priority: 5 })
    expect(calls[0].body).not.toHaveProperty('currency')
    expect(db['pricing_rule'].filter((r) => r['id'] === 'usd' || r['id'] === 'kampanya')).toHaveLength(2)
  })

  it('aynı üründe birden çok sabit kural veri anomalisidir: HATA, hiçbir şey yazılmaz', async () => {
    const { supabase, calls } = stub({
      pricing_rule: [
        ruleRow({ id: 'a', scope: 1, product_id: 'p1', method: 'fixed', fixed_price: 1 }),
        ruleRow({ id: 'b', scope: 1, product_id: 'p1', method: 'fixed', fixed_price: 2 }),
      ],
    })

    await expect(setProductFixedPrice(supabase, 'p1', { amount: 9, vatIncluded: true }, 'panel', null)).rejects.toThrow(
      /2 sabit kural/,
    )
    expect(calls).toHaveLength(0)
  })

  it('geçersiz tutar hiçbir istek atmadan RangeError verir', async () => {
    const { supabase, calls } = stub({})
    for (const kotu of [0, -1, Number.NaN, PRODUCT_FIXED_PRICE_MAX * 10]) {
      await expect(setProductFixedPrice(supabase, 'p1', { amount: kotu, vatIncluded: true }, 'panel', null)).rejects.toThrow(
        RangeError,
      )
    }
    expect(calls).toHaveLength(0)
  })

  it('yazma hatasını (RLS/ağ) yutmaz, ATAR', async () => {
    const { supabase } = stub({ pricing_rule: [] }, { fail: { table: 'pricing_rule', method: 'POST' } })
    await expect(setProductFixedPrice(supabase, 'p1', { amount: 10, vatIncluded: true }, 'panel', null)).rejects.toMatchObject({
      message: 'sahte sunucu hatası',
    })
  })

  describe('yarış: iki yönetici aynı ürüne aynı anda İLK fiyatı girer (tekillik indeksi)', () => {
    it('ekleme indeks ihlali alırsa kazananın kuralını yeniden okur ve GÜNCELLER: hata yok, tek sabit kural kalır', async () => {
      const rakip = ruleRow({ id: 'rakip-1', scope: 1, product_id: 'p1', method: 'fixed', fixed_price: 999 })
      const { supabase, calls, db } = stub({ pricing_rule: [] }, { carpisma: { rakip } })

      const rule = await setProductFixedPrice(supabase, 'p1', { amount: 2400, vatIncluded: true }, 'panel', 'user-1')

      expect(calls.map((c) => c.method)).toEqual(['POST', 'PATCH'])
      expect(calls[1].url.searchParams.get('id')).toBe('eq.rakip-1')
      expect(calls[1].headers['x-degisiklik-yontemi']).toBe('panel')
      expect(rule.id).toBe('rakip-1')
      expect(rule.fixed_price).toBe(2400)
      const sabitler = db['pricing_rule'].filter((r) => r['product_id'] === 'p1' && r['method'] === 'fixed')
      expect(sabitler).toHaveLength(1)
    })

    it('yeniden denemede de çakışma çıkarsa TEK deneme sonunda hata yayılır (döngü yok)', async () => {
      const { supabase, calls } = stub({ pricing_rule: [] }, { carpisma: { hep: true } })

      await expect(setProductFixedPrice(supabase, 'p1', { amount: 10, vatIncluded: true }, 'panel', null)).rejects.toMatchObject({
        code: '23505',
      })
      expect(calls.filter((c) => c.method === 'POST')).toHaveLength(2)
    })

    it('başka bir indeksin 23505 hatası bu yarış DEĞİLDİR: yeniden denenmez, atar', async () => {
      const { supabase, calls } = stub({ pricing_rule: [] }, { carpisma: { hep: true, indeks: 'baska_indeks_uq' } })

      await expect(setProductFixedPrice(supabase, 'p1', { amount: 10, vatIncluded: true }, 'panel', null)).rejects.toMatchObject({
        code: '23505',
      })
      expect(calls.filter((c) => c.method === 'POST')).toHaveLength(1)
    })
  })
})

describe('isProductFixedRuleConflict', () => {
  it('yalnız 23505 + tekillik indeksi adını taşıyan düz hata nesnesini tanır', () => {
    const iyi = { code: '23505', message: 'duplicate key value violates unique constraint "pricing_rule_urun_tek_sabit_uq"' }
    expect(isProductFixedRuleConflict(iyi)).toBe(true)
    expect(isProductFixedRuleConflict({ ...iyi, code: '23514' })).toBe(false)
    expect(isProductFixedRuleConflict({ ...iyi, message: 'duplicate key value violates unique constraint "baska_uq"' })).toBe(false)
    expect(isProductFixedRuleConflict(new Error('pricing_rule_urun_tek_sabit_uq'))).toBe(false)
    expect(isProductFixedRuleConflict(null)).toBe(false)
    expect(isProductFixedRuleConflict('23505')).toBe(false)
  })
})

// ── clearProductFixedPrice ───────────────────────────────────────────────────

describe('clearProductFixedPrice', () => {
  it('yalnız o ürünün TEK sabit kuralını siler (süzgeçler adrestedir), sayıyı döner', async () => {
    const { supabase, calls, db } = stub({
      pricing_rule: [
        ruleRow({ id: 'sabit-1', scope: 1, product_id: 'p1', method: 'fixed', fixed_price: 1 }),
        ruleRow({ id: 'marj-1', scope: 1, product_id: 'p1' }), // marj override'ı DOKUNULMAZ
        ruleRow({ id: 'sabit-p2', scope: 1, product_id: 'p2', method: 'fixed', fixed_price: 1 }),
        ruleRow({ id: 'usd-1', scope: 1, product_id: 'p1', method: 'fixed', fixed_price: 1, currency: 'USD' }), // kampanya/para birimli: DOKUNULMAZ
        ruleRow({ id: 'kampanya-1', scope: 1, product_id: 'p1', method: 'fixed', fixed_price: 1, valid_to: '2027-02-01' }),
      ],
    })

    const removed = await clearProductFixedPrice(supabase, 'p1', 'panel')

    expect(removed).toBe(1)
    const sorgu = calls[0].url.searchParams
    expect(calls[0].method).toBe('DELETE')
    expect(sorgu.get('scope')).toBe('eq.1')
    expect(sorgu.get('product_id')).toBe('eq.p1')
    expect(sorgu.get('method')).toBe('eq.fixed')
    expect(sorgu.get('price_book_id')).toBe('is.null')
    expect(sorgu.get('min_quantity')).toBe('eq.1')
    expect(sorgu.get('currency')).toBe('is.null')
    expect(sorgu.get('valid_from')).toBe('is.null')
    expect(sorgu.get('valid_to')).toBe('is.null')
    expect(calls[0].headers['x-degisiklik-yontemi']).toBe('panel')
    expect(db['pricing_rule'].map((r) => r['id'])).toEqual(['marj-1', 'sabit-p2', 'usd-1', 'kampanya-1'])
  })

  it('silinecek kural yoksa 0 döner (hata değil)', async () => {
    const { supabase } = stub({ pricing_rule: [] })
    expect(await clearProductFixedPrice(supabase, 'p1', 'liste')).toBe(0)
  })
})

// ── materializePrices: tek/birkaç ürün kapsamı ──────────────────────────────

describe('materializePrices · productIds kapsamı', () => {
  it('yalnız kapsamdaki ürünü yazar; taranmayan ürünlerin cache satırı PASİFLEŞTİRİLMEZ', async () => {
    const { supabase, calls, db } = stub(katalog())

    const summary = await materializePrices(supabase, { dryRun: false, productIds: ['p1'] })

    expect(summary.productsScanned).toBe(1)
    const upsert = calls.filter((c) => c.table === 'product_prices' && c.method === 'POST')
    expect(upsert).toHaveLength(1)
    expect((upsert[0].body as Row[]).map((r) => r['product_id'])).toEqual(['p1'])
    // ⛔ANA REGRESYON: kapsam daraltılmazsa p2/p3 "bu koşuda üretilmedi" sayılıp pasifleşirdi.
    expect(calls.filter((c) => c.table === 'product_prices' && c.method === 'PATCH')).toHaveLength(0)
    expect(summary.deactivated).toBe(0)
    expect(db['product_prices'].filter((r) => r['is_active'] === true)).toHaveLength(3)
  })

  it('kapsamdaki ürünün bayat cache satırı yine tasfiye edilir (kural kalktı → Teklif Alın)', async () => {
    const { supabase, calls, db } = stub(
      katalog({ pricing_rule: [ruleRow({ id: 'yalniz-p2', scope: 1, product_id: 'p2', method: 'fixed', fixed_price: 500 })] }),
    )

    // p1'in artık geçerli kuralı yok; kapsam yalnız p1.
    const summary = await materializePrices(supabase, { dryRun: false, productIds: ['p1'] })

    expect(summary.deactivated).toBe(1)
    const patch = calls.filter((c) => c.table === 'product_prices' && c.method === 'PATCH')
    expect(patch).toHaveLength(1)
    expect(patch[0].url.searchParams.get('id')).toBe('in.(cp1)')
    expect(db['product_prices'].find((r) => r['id'] === 'cp2')?.['is_active']).toBe(true)
  })

  it('yöntem etiketi çağırandan gelir; verilmezse yeniden_hesap', async () => {
    const a = stub(katalog())
    await materializePrices(a.supabase, { dryRun: false, productIds: ['p1'], yontem: 'liste' })
    expect(a.calls.find((c) => c.table === 'product_prices')?.headers['x-degisiklik-yontemi']).toBe('liste')

    const b = stub(katalog())
    await materializePrices(b.supabase, { dryRun: false, productIds: ['p1'] })
    expect(b.calls.find((c) => c.table === 'product_prices')?.headers['x-degisiklik-yontemi']).toBe('yeniden_hesap')
  })

  it('BOŞ kapsam = hiçbir ürün: hiçbir istek atılmaz (fail-open yasak)', async () => {
    const { supabase, calls } = stub(katalog())
    const summary = await materializePrices(supabase, { dryRun: false, productIds: [] })
    expect(summary.productsScanned).toBe(0)
    expect(calls).toHaveLength(0)
  })

  it('kapsam tavanını aşan liste (adres tavanı) sessizce kesilmez, HATA verir', async () => {
    const { supabase } = stub(katalog())
    const cokUrun = Array.from({ length: MATERIALIZE_URUN_TAVANI + 1 }, (_, i) => `p${i}`)
    await expect(materializePrices(supabase, { dryRun: false, productIds: cokUrun })).rejects.toThrow(/productIds/)
  })
})

// ── verifyProductStorefrontPrice ─────────────────────────────────────────────

describe('verifyProductStorefrontPrice', () => {
  const beklenen = { net: 1400, gross: 1680 }

  it('vitrin satırı beklenenle aynıysa dogrulandi', async () => {
    const { supabase } = stub(katalog())
    expect(await verifyProductStorefrontPrice(supabase, 'p1', beklenen)).toEqual({
      status: 'dogrulandi',
      net: 1400,
      gross: 1680,
      isDerived: true,
    })
  })

  it('yarım kuruş altı fark yuvarlamadır, üstü farklidir', async () => {
    const { supabase } = stub(katalog({ product_prices: [cacheRow('c', 'p1', { gross_price: 1680.004 })] }))
    expect((await verifyProductStorefrontPrice(supabase, 'p1', beklenen)).status).toBe('dogrulandi')

    const fark = stub(katalog({ product_prices: [cacheRow('c', 'p1', { gross_price: 1700 })] }))
    expect(await verifyProductStorefrontPrice(fark.supabase, 'p1', beklenen)).toMatchObject({
      status: 'farkli',
      gross: 1700,
      expected: beklenen,
    })
  })

  it('aktif satır yoksa yok (vitrin Teklif Alın görür); pasif satır sayılmaz', async () => {
    const { supabase } = stub(katalog({ product_prices: [cacheRow('c', 'p1', { is_active: false })] }))
    expect(await verifyProductStorefrontPrice(supabase, 'p1', beklenen)).toEqual({ status: 'yok' })
  })

  it('başka ürünün, başka para biriminin ve bayi listesinin satırları p1 için sayılmaz', async () => {
    const { supabase } = stub(
      katalog({
        price_lists: [INDIVIDUAL, { id: 'pl-dealer', user_type: 'dealer', is_active: true }],
        product_prices: [
          cacheRow('a', 'p2'),
          cacheRow('b', 'p1', { currency: 'EUR' }),
          cacheRow('c', 'p1', { price_list_id: 'pl-dealer' }),
        ],
      }),
    )
    expect(await verifyProductStorefrontPrice(supabase, 'p1', beklenen)).toEqual({ status: 'yok' })
  })

  it('birden çok aktif satır → belirsiz; bireysel liste yok → belirsiz; fiyatı boş satır → belirsiz', async () => {
    const cift = stub(katalog({ product_prices: [cacheRow('a', 'p1'), cacheRow('b', 'p1', { valid_from: '2026-02-01T00:00:00Z' })] }))
    expect(await verifyProductStorefrontPrice(cift.supabase, 'p1', beklenen)).toEqual({ status: 'belirsiz', rows: 2 })

    const listesiz = stub(katalog({ price_lists: [{ id: 'pl-dealer', user_type: 'dealer', is_active: true }] }))
    expect(await verifyProductStorefrontPrice(listesiz.supabase, 'p1', beklenen)).toEqual({ status: 'belirsiz', rows: 0 })

    const bos = stub(katalog({ product_prices: [cacheRow('a', 'p1', { net_price: null })] }))
    expect(await verifyProductStorefrontPrice(bos.supabase, 'p1', beklenen)).toEqual({ status: 'belirsiz', rows: 1 })
  })

  it('beklenen fiyat yoksa satırı okur ama kıyaslamaz (beklenen-yok)', async () => {
    const { supabase } = stub(katalog())
    expect(await verifyProductStorefrontPrice(supabase, 'p1', null)).toMatchObject({ status: 'beklenen-yok', gross: 1680 })
  })

  it('okuma hatasını yutmaz, ATAR', async () => {
    const { supabase } = stub(katalog(), { fail: { table: 'product_prices', method: 'GET' } })
    await expect(verifyProductStorefrontPrice(supabase, 'p1', beklenen)).rejects.toMatchObject({ message: 'sahte sunucu hatası' })
  })
})

// ── setProductPrice / clearProductPrice (uçtan uca) ─────────────────────────

describe('setProductPrice', () => {
  it('kural yaz → YALNIZ o ürünü yeniden hesapla → vitrini geri oku: KDV dahil 2400 → net 2000 / brüt 2400 dogrulandi', async () => {
    const { supabase, calls } = stub(katalog())

    const sonuc = await setProductPrice(
      supabase,
      'p1',
      { amount: 2400, vatIncluded: true },
      { yontem: 'panel', recalculate: true, updatedBy: 'user-1' },
    )

    expect(sonuc.recalc).toBe('tamam')
    expect(sonuc.verification).toEqual({ status: 'dogrulandi', net: 2000, gross: 2400, isDerived: true })
    const upsert = calls.filter((c) => c.table === 'product_prices' && c.method === 'POST')
    expect((upsert[0].body as Row[]).map((r) => r['product_id'])).toEqual(['p1'])
    expect(upsert[0].headers['x-degisiklik-yontemi']).toBe('panel')
    expect(upsert[0].headers['x-degisiklik-oturumu']).toMatch(/^[0-9a-f-]{36}$/)
    // p2 ve p3'e hiçbir yazma gitmedi.
    expect(calls.filter((c) => c.table === 'product_prices' && c.method === 'PATCH')).toHaveLength(0)
  })

  it('KDV HARİÇ giriş: 2000 net → brüt 2400', async () => {
    const { supabase } = stub(katalog())
    const sonuc = await setProductPrice(
      supabase,
      'p1',
      { amount: 2000, vatIncluded: false },
      { yontem: 'liste', recalculate: true, updatedBy: null },
    )
    expect(sonuc.verification).toMatchObject({ status: 'dogrulandi', net: 2000, gross: 2400 })
  })

  it('⛔SESSİZ BAŞARI YOK: başka bir kural (scope 0 varyant) vitrini belirliyorsa dogrulandi DENMEZ, farkli + golgelendi', async () => {
    const { supabase } = stub(
      katalog({
        pricing_rule: [
          ruleRow({ id: 'genel-40' }),
          // scope 0, sabit kuralın (scope 1) ÖNÜNDE sıralanır: vitrin 500 gösterir.
          ruleRow({ id: 'varyant', scope: 0, product_id: 'p1', method: 'fixed', fixed_price: 500, price_is_vat_inclusive: false }),
        ],
      }),
    )

    const sonuc = await setProductPrice(
      supabase,
      'p1',
      { amount: 2400, vatIncluded: true },
      { yontem: 'panel', recalculate: true, updatedBy: null },
    )

    expect(sonuc.recalc).toBe('tamam')
    expect(sonuc.golgelendi).toBe(true)
    expect(sonuc.kazananKuralId).toBe('varyant')
    expect(sonuc.verification).toMatchObject({ status: 'farkli', gross: 600, expected: { net: 2000, gross: 2400 } })
  })

  it('kural sayfasından sonradan eklenen yüksek öncelikli marj kuralı güncellemede geçilir: vitrin girilen tutarı gösterir', async () => {
    const { supabase } = stub(
      katalog({
        pricing_rule: [
          ruleRow({ id: 'genel-40' }),
          ruleRow({ id: 'sabit-p1', scope: 1, product_id: 'p1', method: 'fixed', fixed_price: 1000, priority: 0, surcharge: 100, min_margin_abs: 5000 }),
          ruleRow({ id: 'marj-p1', scope: 1, product_id: 'p1', priority: 9 }),
        ],
      }),
    )

    const sonuc = await setProductPrice(
      supabase,
      'p1',
      { amount: 2400, vatIncluded: true },
      { yontem: 'panel', recalculate: true, updatedBy: null },
    )

    expect(sonuc.golgelendi).toBe(false)
    expect(sonuc.verification).toEqual({ status: 'dogrulandi', net: 2000, gross: 2400, isDerived: true })
  })

  it('RLS bayat satırı SESSİZCE pasifleştirmezse (0 satır etkilendi) yeniden hesap "tamam" DEMEZ: recalc hata', async () => {
    // p1'in kuralı kalktı → cache satırı bayat; pasifleştirme RLS yüzünden hiçbir satırı etkilemiyor.
    const { supabase } = stub(
      katalog({ pricing_rule: [ruleRow({ id: 'yalniz-p2', scope: 1, product_id: 'p2', method: 'fixed', fixed_price: 500 })] }),
      { rlsSessizPatch: 'product_prices' },
    )

    const sonuc = await clearProductPrice(supabase, 'p1', { yontem: 'panel', recalculate: true })

    expect(sonuc.recalc).toBe('hata')
    expect(sonuc.recalcError).toMatch(/pasifleştirilebildi/)
    expect(sonuc.verification).toBeNull()
  })

  it('moderatör (recalculate:false): kural yazılır, product_prices\'a HİÇ dokunulmaz', async () => {
    const { supabase, calls } = stub(katalog())

    const sonuc = await setProductPrice(
      supabase,
      'p1',
      { amount: 2400, vatIncluded: true },
      { yontem: 'panel', recalculate: false, updatedBy: 'mod-1' },
    )

    expect(sonuc).toMatchObject({ recalc: 'yapilmadi', verification: null })
    expect(sonuc.rule.fixed_price).toBe(2400)
    expect(calls.some((c) => c.table === 'product_prices')).toBe(false)
  })

  it('kural yazıldı ama yeniden hesap düştü: KISMİ BAŞARI açık (recalc:hata), fonksiyon atmaz', async () => {
    const { supabase, db } = stub(katalog(), { fail: { table: 'product_prices', method: 'POST' } })

    const sonuc = await setProductPrice(
      supabase,
      'p1',
      { amount: 2400, vatIncluded: true },
      { yontem: 'panel', recalculate: true, updatedBy: null },
    )

    expect(sonuc.recalc).toBe('hata')
    expect(sonuc.recalcError).toBe('sahte sunucu hatası')
    expect(sonuc.verification).toBeNull()
    expect(sonuc.rule.fixed_price).toBe(2400)
    expect(db['pricing_rule'].some((r) => r['product_id'] === 'p1' && r['method'] === 'fixed')).toBe(true)
  })

  it('kural yazımı düşerse ATAR ve yeniden hesap hiç denenmez', async () => {
    const { supabase, calls } = stub(katalog(), { fail: { table: 'pricing_rule', method: 'POST' } })
    await expect(
      setProductPrice(supabase, 'p1', { amount: 2400, vatIncluded: true }, { yontem: 'panel', recalculate: true, updatedBy: null }),
    ).rejects.toMatchObject({ message: 'sahte sunucu hatası' })
    expect(calls.some((c) => c.table === 'product_prices')).toBe(false)
  })

  it('elle ezilmiş (is_derived=false) aktif satır motorun konusu değil: fiyat yansımaz, vitrin girilenden FARKLI ve sayaç açık', async () => {
    const { supabase } = stub(
      katalog({ product_prices: [cacheRow('elle', 'p1', { is_derived: false, net_price: 900, gross_price: 1080 })] }),
    )

    const sonuc = await setProductPrice(
      supabase,
      'p1',
      { amount: 2400, vatIncluded: true },
      { yontem: 'panel', recalculate: true, updatedBy: null },
    )

    expect(sonuc.recalc).toBe('tamam')
    expect(sonuc.summary?.skippedManual).toBe(1)
    // Vitrinde hâlâ ESKİ elle fiyat görünür — "yansıdı" DENMEZ: girilen 2400 ≠ vitrin 1080.
    expect(sonuc.verification).toMatchObject({
      status: 'farkli',
      gross: 1080,
      isDerived: false,
      expected: { net: 2000, gross: 2400 },
    })
  })
})

describe('clearProductPrice', () => {
  it('sabit kuralı kaldırır, ürünü genel kurala döndürür ve vitrini doğrular (marj %40: 1000 → 1400/1680)', async () => {
    const { supabase, db } = stub(
      katalog({
        pricing_rule: [
          ruleRow({ id: 'genel-40' }),
          ruleRow({ id: 'sabit-p1', scope: 1, product_id: 'p1', method: 'fixed', fixed_price: 2400, price_is_vat_inclusive: true }),
        ],
        product_prices: [cacheRow('cp1', 'p1', { net_price: 2000, gross_price: 2400 })],
      }),
    )

    const sonuc = await clearProductPrice(supabase, 'p1', { yontem: 'panel', recalculate: true })

    expect(sonuc.removed).toBe(1)
    expect(sonuc.recalc).toBe('tamam')
    expect(sonuc.verification).toEqual({ status: 'dogrulandi', net: 1400, gross: 1680, isDerived: true })
    expect(db['pricing_rule'].map((r) => r['id'])).toEqual(['genel-40'])
  })

  it('moderatör: kural silinir, yeniden hesap YAPILMAZ', async () => {
    const { supabase, calls } = stub(
      katalog({ pricing_rule: [ruleRow({ id: 'sabit-p1', scope: 1, product_id: 'p1', method: 'fixed', fixed_price: 1 })] }),
    )
    const sonuc = await clearProductPrice(supabase, 'p1', { yontem: 'liste', recalculate: false })
    expect(sonuc).toMatchObject({ removed: 1, recalc: 'yapilmadi', verification: null })
    expect(calls.some((c) => c.table === 'product_prices')).toBe(false)
  })
})
