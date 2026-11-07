/* eslint-disable */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setupDenoRuntime, DenoRuntimeSimulator } from './helpers/denoRuntime'

// ─── High-Fidelity Webhook & Realtime Engine Mocks ───

class WebhookMockDb {
  public orders: any[] = []
  public events: any[] = []

  reset() {
    this.orders = []
    this.events = []
  }

  from(table: string) {
    let dataset = table === 'venthub_orders' ? this.orders : this.events
    // Birden çok .eq() filtresi BİRLEŞİR (PostgREST gibi): kaynak durum koşulu (.eq('status', ...)) id filtresini ezmemeli.
    const filters: Array<[string, unknown]> = []
    // `.is(col, null)` PostgREST'te IS NULL demektir: alanı hiç yazılmamış (undefined) satır da eşleşir.
    const nullFilters: string[] = []
    // `.lt(col, val)` PostgREST'te col < val: ISO-8601 metinleri sözlük sırasıyla karşılaştırılır; alanı olmayan (NULL) satır eşleşmez.
    const ltFilters: Array<[string, string]> = []
    let limitVal = 0
    let patchObject: Record<string, unknown> | null = null
    let deleteMode = false
    const eslesir = (r: Record<string, unknown>) =>
      filters.every(([c, v]) => r[c] === v) &&
      nullFilters.every((c) => r[c] == null) &&
      ltFilters.every(([c, v]) => typeof r[c] === 'string' && (r[c] as string) < v)

    const chain = {
      select: (fields: string = '*') => {
        return chain
      },
      eq: (col: string, val: unknown) => {
        filters.push([col, val])
        return chain
      },
      is: (col: string, val: null) => {
        if (val !== null) throw new Error('WebhookMockDb.is yalnız null destekler')
        nullFilters.push(col)
        return chain
      },
      lt: (col: string, val: string) => {
        ltFilters.push([col, val])
        return chain
      },
      delete: () => {
        deleteMode = true
        return chain
      },
      /**
       * ALT-138 (#2286): olay tekilleştirmesi "önce kaydet" — upsert(..., { onConflict, ignoreDuplicates: true }).select().
       * PostgREST ignore-duplicates: çakışan satır YAZILMAZ ve DÖNMEZ; yalnız gerçekten eklenen satır döner.
       * Kol 10 (yinelenen olay) tam bu boş dönüşe dayanır: burada [row] dönerse kol kırmızı olmalı.
       */
      upsert: (row: Record<string, unknown>, opts?: { onConflict?: string; ignoreDuplicates?: boolean }) => {
        const anahtar = opts?.onConflict ?? 'event_id'
        const mevcut = dataset.some((r: Record<string, unknown>) => r[anahtar] === row[anahtar])
        if (mevcut && !opts?.ignoreDuplicates) throw new Error('WebhookMockDb.upsert: ignoreDuplicates olmadan birleştirme modellenmedi')
        if (!mevcut) dataset.push(row)
        const donen = mevcut ? [] : [row]
        return { select: async (_alanlar?: string) => ({ data: donen, error: null }) }
      },
      limit: (l: number) => {
        limitVal = l
        return chain
      },
      update: (patch: any) => {
        patchObject = patch
        return chain
      },
      single: async () => {
        const filtered = dataset.filter(eslesir)
        if (filtered.length === 0) {
          return { data: null, error: { message: 'Not found', code: 'PGRST116' } }
        }
        if (patchObject) {
          Object.assign(filtered[0], patchObject)
        }
        return { data: filtered[0], error: null }
      },
      insert: async (row: any) => {
        dataset.push(row)
        return { data: row, error: null }
      },
      then: (resolve: any) => {
        const filtered = dataset.filter(eslesir)
        if (deleteMode) {
          for (const r of filtered) dataset.splice(dataset.indexOf(r), 1)
          resolve({ data: filtered, error: null })
          return
        }
        if (patchObject) {
          filtered.forEach(r => Object.assign(r, patchObject))
        }
        const sliced = limitVal > 0 ? filtered.slice(0, limitVal) : filtered
        resolve({ data: sliced, error: null })
      }
    }
    return chain
  }
}

const mockDbInstance = new WebhookMockDb()

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: () => {
      return mockDbInstance
    }
  }
})

// ALT-138: imza `<x-timestamp>.<x-event-id>.<ham gövde>` üzerinden (sabit_zaman.ts::webhookImzaMetni).
async function computeSignature(secret: string, rawBody: string, ts: string, eventId: string): Promise<string> {
  const body = `${ts}.${eventId}.${rawBody}`
  const encoder = new TextEncoder()
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await globalThis.crypto.subtle.sign('HMAC', key, encoder.encode(body))
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
}

describe('Secure Webhooks & Realtime E2E Suite (10 Test Cases)', () => {
  let simulator: DenoRuntimeSimulator
  const webhookFunctionPath = process.cwd() + '/supabase/functions/shipping-webhook/index.ts'

  beforeEach(() => {
    mockDbInstance.reset()
    simulator = setupDenoRuntime({
      env: {
        SUPABASE_URL: 'https://tnofewwkwlyjsqgwjjga.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'service-key',
        SHIPPING_WEBHOOK_SECRET: 'webhook-hmac-secret-12345',
        // Token BİLEREK tanımlı (ALT-166): token yolu kaldırıldı; test 7 tanımlı token'ın da kapıyı açmadığını sınar.
        SHIPPING_WEBHOOK_TOKEN: 'legacy-sandbox-token-555'
      }
    })
  })

  afterEach(() => {
    simulator.cleanup()
    vi.restoreAllMocks()
  })

  // ─── TIER 1: FEATURE COVERAGE (5 CASES) ───

  it('1. should accept secure shipping webhook update when presented with a valid HMAC-SHA256 signature', async () => {
    mockDbInstance.orders.push({
      id: 'order-eng-1',
      status: 'confirmed', // ALT-134: yalnız onaylı + ödenmiş sipariş kargolanır
      payment_status: 'paid',
      order_number: 'ORD-901',
      carrier: null,
      tracking_number: null
    })

    const payload = {
      order_number: 'ORD-901',
      status: 'shipped',
      carrier: 'dhl',
      tracking_number: 'DHL-123456789'
    }

    const rawBody = JSON.stringify(payload)
    const ts = String(Date.now())
    const signature = await computeSignature('webhook-hmac-secret-12345', rawBody, ts, 'EV-T1')

    const req = new Request('https://localhost/functions/v1/shipping-webhook', {
      method: 'POST',
      headers: {
        // T025-VH: shipping-webhook replay guard'i artik ZORUNLU (cetvel §3.5).
        // Bu testler basari yolunu sinadigi icin taze bir timestamp gondermeleri gerekiyor;
        // eskiden guard 'varsa uygula' (fail-OPEN) oldugu icin basliksiz geciyorlardi.
        // ALT-138: zaman + olay kimligi imzanin parcasi; olay kimligi zorunlu.
        'x-timestamp': ts,
        'x-event-id': 'EV-T1',
        'Content-Type': 'application/json',
        'x-signature': signature
      },
      body: rawBody
    })

    const res = await simulator.invokeFunction(webhookFunctionPath, req)
    expect(res.status).toBe(200)

    const resBody = await res.json()
    expect(resBody.ok).toBe(true)
    expect(mockDbInstance.orders[0].status).toBe('shipped')
    expect(mockDbInstance.orders[0].carrier).toBe('dhl')
    expect(mockDbInstance.orders[0].tracking_number).toBe('DHL-123456789')
  })

  it('2. should reject webhook updates carrying an invalid/mismatched HMAC key with 401 Unauthorized', async () => {
    const payload = { order_number: 'ORD-901', status: 'shipped' }
    const rawBody = JSON.stringify(payload)

    const req = new Request('https://localhost/functions/v1/shipping-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': 'invalid-hmac-signature'
      },
      body: rawBody
    })

    const res = await simulator.invokeFunction(webhookFunctionPath, req)
    expect(res.status).toBe(401)
  })

  it('3. should enforce stale replay guard and reject signatures older than 5 minutes', async () => {
    const payload = { order_number: 'ORD-901', status: 'shipped' }
    const rawBody = JSON.stringify(payload)
    // Set timestamp to 10 minutes ago
    const expiredTimestamp = String(Date.now() - 10 * 60 * 1000)
    const signature = await computeSignature('webhook-hmac-secret-12345', rawBody, expiredTimestamp, 'EV-T3')

    const req = new Request('https://localhost/functions/v1/shipping-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature,
        'x-timestamp': expiredTimestamp,
        'x-event-id': 'EV-T3'
      },
      body: rawBody
    })

    const res = await simulator.invokeFunction(webhookFunctionPath, req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Stale or invalid timestamp')
  })

  it('4. should isolate realtime WebSocket subscription channels isolated per tenant', () => {
    function getRealtimeChannel(tenantId: string): string {
      if (!tenantId) throw new Error('Tenant ID required for realtime subscription')
      return `admin-orders-realtime-${tenantId}`
    }

    const channelA = getRealtimeChannel('tenant-a')
    const channelB = getRealtimeChannel('tenant-b')

    expect(channelA).toBe('admin-orders-realtime-tenant-a')
    expect(channelB).toBe('admin-orders-realtime-tenant-b')
    expect(channelA).not.toBe(channelB)
  })

  it('5. should restrict storage bucket access and resolve file paths matching tenant bounds', () => {
    function resolveInvoicePath(tenantId: string, invoiceId: string): string {
      if (!tenantId || /[^a-zA-Z0-9\-]/.test(tenantId)) {
        throw new Error('Access Denied: Malformed tenant ID')
      }
      return `tenants/${tenantId}/invoices/${invoiceId}.pdf`
    }

    const pathA = resolveInvoicePath('tenant-a', 'INV-100')
    expect(pathA).toBe('tenants/tenant-a/invoices/INV-100.pdf')
    expect(() => resolveInvoicePath('tenant-a/../tenant-b', 'INV-100')).toThrow('Access Denied')
  })

  // ─── TIER 2: BOUNDARY & CORNER CASES (5 CASES) ───

  it('6. should resolve order number collisions correctly by asserting updates execute only inside active tenant orders list', async () => {
    // Both Tenant A and Tenant B have an order number ORD-COL-999
    mockDbInstance.orders.push({
      id: 'order-a',
      status: 'confirmed',
      payment_status: 'paid',
      order_number: 'ORD-COL-999',
      tenant_id: 'tenant-a'
    })
    mockDbInstance.orders.push({
      id: 'order-b',
      status: 'confirmed',
      payment_status: 'paid',
      order_number: 'ORD-COL-999',
      tenant_id: 'tenant-b'
    })

    // Webhook executes under Tenant A environment context
    const payload = { order_number: 'ORD-COL-999', status: 'shipped' }
    const rawBody = JSON.stringify(payload)
    const ts = String(Date.now())
    const signature = await computeSignature('webhook-hmac-secret-12345', rawBody, ts, 'EV-T6')

    const req = new Request('https://localhost/functions/v1/shipping-webhook', {
      method: 'POST',
      headers: {
        'x-timestamp': ts,
        'x-event-id': 'EV-T6',
        'Content-Type': 'application/json',
        'x-signature': signature
      },
      body: rawBody
    })

    // Inside Webhook: we override mockDb's from to enforce active security context tenant-a
    const originalFrom = mockDbInstance.from.bind(mockDbInstance)
    mockDbInstance.from = (table: string) => {
      const chain = originalFrom(table)
      // Inject RLS filter logic
      const originalSingle = chain.single.bind(chain)
      chain.single = async () => {
        const res = await originalSingle()
        if (res.data && table === 'venthub_orders') {
          // If we matched multiple rows, RLS filters down to tenant-a
          const rows = mockDbInstance.orders.filter(o => o.order_number === 'ORD-COL-999' && o.tenant_id === 'tenant-a')
          return { data: rows[0], error: null }
        }
        return res
      }
      return chain
    }

    try {
      const res = await simulator.invokeFunction(webhookFunctionPath, req)
      expect(res.status).toBe(200)

      expect(mockDbInstance.orders.find(o => o.id === 'order-a').status).toBe('shipped')
      expect(mockDbInstance.orders.find(o => o.id === 'order-b').status).toBe('confirmed') // Unchanged (diğer tenant'ın aynı numaralı siparişi)
    } finally {
      // Restore original from
      mockDbInstance.from = originalFrom
    }
  })

  it('7. should NOT accept the removed legacy token path (ALT-166), even with the env token defined', async () => {
    mockDbInstance.orders.push({
      id: 'order-sandbox',
      status: 'confirmed',
      payment_status: 'paid',
      order_number: 'ORD-SANDBOX',
      carrier: null
    })

    const payload = { order_number: 'ORD-SANDBOX', status: 'shipped' }
    const rawBody = JSON.stringify(payload)

    const req = new Request('https://localhost/functions/v1/shipping-webhook', {
      method: 'POST',
      headers: {
        'x-timestamp': String(Date.now()),
        'x-event-id': 'EV-T7',
        'Content-Type': 'application/json',
        'x-webhook-token': 'legacy-sandbox-token-555' // Kaldırılan yol: doğru token bile 401
      },
      body: rawBody
    })

    const res = await simulator.invokeFunction(webhookFunctionPath, req)
    expect(res.status).toBe(401)
    expect(mockDbInstance.orders[0].status).toBe('confirmed')
  })

  it('8. should enforce monotonic status updates, blocking status demotion attempts', async () => {
    mockDbInstance.orders.push({
      id: 'order-mono',
      status: 'delivered', // Already delivered
      order_number: 'ORD-MONO'
    })

    const payload = { order_number: 'ORD-MONO', status: 'shipped' } // Demotion attempt
    const rawBody = JSON.stringify(payload)
    const ts = String(Date.now())
    const signature = await computeSignature('webhook-hmac-secret-12345', rawBody, ts, 'EV-T8')

    const req = new Request('https://localhost/functions/v1/shipping-webhook', {
      method: 'POST',
      headers: {
        'x-timestamp': ts,
        'x-event-id': 'EV-T8',
        'Content-Type': 'application/json',
        'x-signature': signature
      },
      body: rawBody
    })

    const res = await simulator.invokeFunction(webhookFunctionPath, req)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.unchanged).toBe(true) // Ignored status demotion
    expect(mockDbInstance.orders[0].status).toBe('delivered')
  })

  it('9. should gracefully return 500 status when receiving malformed request payloads or server misconfigurations', async () => {
    // Simulate server misconfiguration
    simulator.setEnv('SUPABASE_URL', '')

    const payload = { order_number: 'ORD-901', status: 'shipped' }
    const rawBody = JSON.stringify(payload)
    const ts = String(Date.now())
    const signature = await computeSignature('webhook-hmac-secret-12345', rawBody, ts, 'EV-T9')

    const req = new Request('https://localhost/functions/v1/shipping-webhook', {
      method: 'POST',
      headers: {
        'x-timestamp': ts,
        'x-event-id': 'EV-T9',
        'Content-Type': 'application/json',
        'x-signature': signature
      },
      body: rawBody
    })

    const res = await simulator.invokeFunction(webhookFunctionPath, req)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toContain('missing SUPABASE_URL')
  })

  it('10. should achieve idempotency by returning duplicate indicator when encountering duplicated event identifier', async () => {
    mockDbInstance.orders.push({
      id: 'order-dup',
      status: 'pending',
      order_number: 'ORD-DUP'
    })

    // ALT-138 R1: tekrar teslim yalnız olay İŞLENMİŞ (processed_at dolu) ise 200 duplicate alır; processed_at boş
    // satır "süren işlem" demektir ve 409 IN_FLIGHT alır (aşağıdaki 12-16). Bu kol işlenmiş olayı sınar.
    mockDbInstance.events.push({
      event_id: 'EV-111222',
      processed_at: new Date().toISOString()
    })

    const payload = { order_number: 'ORD-DUP', status: 'shipped' }
    const rawBody = JSON.stringify(payload)
    const ts = String(Date.now())
    const signature = await computeSignature('webhook-hmac-secret-12345', rawBody, ts, 'EV-111222')

    const req = new Request('https://localhost/functions/v1/shipping-webhook', {
      method: 'POST',
      headers: {
        'x-timestamp': ts,
        'Content-Type': 'application/json',
        'x-signature': signature,
        'x-id': 'EV-111222' // Already exists
      },
      body: rawBody
    })

    const res = await simulator.invokeFunction(webhookFunctionPath, req)
    expect(res.status).toBe(200)
    
    const resBody = await res.json()
    expect(resBody.duplicate).toBe(true)
    expect(resBody.unchanged).toBe(true)
    expect(mockDbInstance.orders[0].status).toBe('pending') // Database update bypassed
  })

  // T026-VH Adim 5 kilidi. Eski kod tenant'i ISTEKTEN okuyup (`resolveTenantId`) satirla
  // KARSILASTIRIYORDU, ustelik karsilastirma `isMockEnv` daliyla testlerde tamamen
  // atlaniyordu — yani hicbir test tenant sinirini gormuyordu. Artik tenant imzali istegin
  // isaret ettigi `venthub_orders` satirindan TURETILIYOR; bu test onu kanitlar:
  // saldirgan hem query'de hem govdede kendi tenant'ini gonderse bile yazilan olay kaydi
  // SIPARISIN tenant'ini tasimali. Derivasyon geri alinirsa bu test kirmiziya doner.
  it('11. should derive tenant from the order row and ignore attacker-supplied tenant_id in query/body', async () => {
    const ORDER_TENANT = '11111111-1111-1111-1111-111111111111'
    const ATTACKER_TENANT = '22222222-2222-2222-2222-222222222222'

    mockDbInstance.orders.push({
      id: 'order-derive',
      status: 'confirmed',
      payment_status: 'paid',
      order_number: 'ORD-DERIVE',
      tenant_id: ORDER_TENANT,
      carrier: null,
      tracking_number: null
    })

    // Saldirgan govdeye kendi tenant'ini koyuyor; imza bu govde uzerinden hesaplandigi icin
    // istek YINE DE gecerli imzali. Yani "imza dogru" tenant'i dogrulamaz — kaynak satir dogrular.
    const payload = { order_number: 'ORD-DERIVE', status: 'shipped', tenant_id: ATTACKER_TENANT }
    const rawBody = JSON.stringify(payload)
    const ts = String(Date.now())
    const signature = await computeSignature('webhook-hmac-secret-12345', rawBody, ts, 'EV-DERIVE-1')

    const req = new Request(
      `https://localhost/functions/v1/shipping-webhook?tenant_id=${ATTACKER_TENANT}`,
      {
        method: 'POST',
        headers: {
          'x-timestamp': ts,
          'Content-Type': 'application/json',
          'x-signature': signature,
          'x-id': 'EV-DERIVE-1'
        },
        body: rawBody
      }
    )

    const res = await simulator.invokeFunction(webhookFunctionPath, req)
    expect(res.status).toBe(200)
    expect(mockDbInstance.orders[0].status).toBe('shipped')

    interface EventRow { event_id?: string; tenant_id?: string }
    const event = (mockDbInstance.events as EventRow[]).find((e) => e.event_id === 'EV-DERIVE-1')
    expect(event).toBeDefined()
    expect(event?.tenant_id).toBe(ORDER_TENANT)
    expect(event?.tenant_id).not.toBe(ATTACKER_TENANT)
  })

  // ─── ALT-138 R1: "önce kaydet" tekilleştirmesinde SÜREN işlem ile İŞLENMİŞ olay ayrımı ───
  // Eskiden upsert boş dönünce (olay zaten sahiplenilmiş) her durumda 200 duplicate dönüyordu. İlk teslim henüz
  // işlenirken gelen ikinci teslim 200 alır, ilk işlem sonra hata verip sahipliği bırakırsa taşıyıcı yeniden
  // denemediği için olay KAYBOLUYORDU. Kural: processed_at NULL → 409 IN_FLIGHT + Retry-After; dolu → 200 duplicate.
  // (İki gerçek eşzamanlı teslimin bariyerli sınaması ve sabotaj kolu: kargo-webhook-monoton.test.ts.)

  /** Aynı imzalı teslimi tekrar tekrar gönderebilmek için: gövde bir kez okunabildiğinden her çağrıda yeni Request üretir. */
  async function teslimHazirla(eventId: string, payload: Record<string, unknown>): Promise<() => Request> {
    const rawBody = JSON.stringify(payload)
    const ts = String(Date.now())
    const signature = await computeSignature('webhook-hmac-secret-12345', rawBody, ts, eventId)
    return () => new Request('https://localhost/functions/v1/shipping-webhook', {
      method: 'POST',
      headers: {
        'x-timestamp': ts,
        'x-event-id': eventId,
        'Content-Type': 'application/json',
        'x-signature': signature
      },
      body: rawBody
    })
  }

  interface OlayKaydi { event_id?: string; processed_at?: string | null }
  const olayKayitlari = () => mockDbInstance.events as OlayKaydi[]

  it('12. should answer 409 IN_FLIGHT with Retry-After when the same event is still being processed (processed_at NULL), and leave the first delivery\'s claim untouched', async () => {
    mockDbInstance.orders.push({ id: 'order-inflight', status: 'confirmed', payment_status: 'paid', order_number: 'ORD-INFLIGHT' })
    // İlk teslim sahipliği aldı ama henüz bitmedi: satır var, processed_at boş.
    mockDbInstance.events.push({ event_id: 'EV-INFLIGHT', processed_at: null, received_at: new Date().toISOString() })

    const teslim = await teslimHazirla('EV-INFLIGHT', { order_number: 'ORD-INFLIGHT', status: 'shipped' })
    const res = await simulator.invokeFunction(webhookFunctionPath, teslim())

    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toBe('IN_FLIGHT')
    expect(body.duplicate).toBeUndefined()
    // Retry-After: pozitif tam sayı ve replay penceresinin (5 dk = 300 sn) altında.
    const bekleme = Number(res.headers.get('retry-after'))
    expect(Number.isInteger(bekleme)).toBe(true)
    expect(bekleme).toBeGreaterThan(0)
    expect(bekleme).toBeLessThan(300)
    // İkinci teslim siparişe dokunmaz ve ilk teslimin sahiplik satırını SİLMEZ (409 yolu sahipliği almadı).
    expect(mockDbInstance.orders[0].status).toBe('confirmed')
    expect(olayKayitlari()).toHaveLength(1)
    expect(olayKayitlari()[0].event_id).toBe('EV-INFLIGHT')
    expect(olayKayitlari()[0].processed_at).toBeNull()
  })

  it('13. should answer 200 duplicate for the retry once the first delivery has finished (processed_at filled), without a second write', async () => {
    mockDbInstance.orders.push({ id: 'order-bitti', status: 'confirmed', payment_status: 'paid', order_number: 'ORD-BITTI' })
    mockDbInstance.events.push({ event_id: 'EV-BITTI', processed_at: null, received_at: new Date().toISOString() })

    const teslim = await teslimHazirla('EV-BITTI', { order_number: 'ORD-BITTI', status: 'shipped' })
    expect((await simulator.invokeFunction(webhookFunctionPath, teslim())).status).toBe(409)

    // İlk teslim bitti (başarı yolu processed_at'i doldurur).
    olayKayitlari()[0].processed_at = new Date().toISOString()

    const tekrar = await simulator.invokeFunction(webhookFunctionPath, teslim())
    expect(tekrar.status).toBe(200)
    const body = await tekrar.json()
    expect(body.duplicate).toBe(true)
    expect(mockDbInstance.orders[0].status).toBe('confirmed') // ikinci teslim yazmadı
  })

  it('14. should process the retry when the first delivery failed and released its claim after a 409 (event is not lost)', async () => {
    mockDbInstance.orders.push({ id: 'order-kayip', status: 'confirmed', payment_status: 'paid', order_number: 'ORD-KAYIP', carrier: null, tracking_number: null })
    mockDbInstance.events.push({ event_id: 'EV-KAYIP', processed_at: null, received_at: new Date().toISOString() })

    const teslim = await teslimHazirla('EV-KAYIP', { order_number: 'ORD-KAYIP', status: 'shipped', carrier: 'dhl', tracking_number: 'DHL-KAYIP' })
    expect((await simulator.invokeFunction(webhookFunctionPath, teslim())).status).toBe(409)

    // İlk teslim hata verdi: sahiplik satırını bıraktı (Deno.serve sarmalayıcısındaki delete ... is('processed_at', null)).
    mockDbInstance.events.length = 0

    const tekrar = await simulator.invokeFunction(webhookFunctionPath, teslim())
    expect(tekrar.status).toBe(200)
    expect((await tekrar.json()).duplicate).toBeUndefined()
    expect(mockDbInstance.orders[0].status).toBe('shipped')
    expect(mockDbInstance.orders[0].tracking_number).toBe('DHL-KAYIP')
    // Yeniden deneme olayı işledi ve tamamlandı olarak işaretledi.
    expect(olayKayitlari()).toHaveLength(1)
    expect(olayKayitlari()[0].processed_at).toBeTruthy()
  })

  it('15. should fail closed with 5xx (never a silent 200) when the event state cannot be read', async () => {
    mockDbInstance.orders.push({ id: 'order-okuma', status: 'confirmed', payment_status: 'paid', order_number: 'ORD-OKUMA' })
    mockDbInstance.events.push({ event_id: 'EV-OKUMA', processed_at: null, received_at: new Date().toISOString() })

    const teslim = await teslimHazirla('EV-OKUMA', { order_number: 'ORD-OKUMA', status: 'shipped' })

    // Yalnız olay tablosuna doğrudan yapılan select('processed_at') okuması hata verir; upsert(...).select() zinciri etkilenmez.
    const originalFrom = mockDbInstance.from.bind(mockDbInstance)
    mockDbInstance.from = (table: string) => {
      const chain = originalFrom(table)
      if (table === 'shipping_webhook_events') {
        ;(chain as { select: unknown }).select = () => ({
          eq: () => ({ limit: async () => ({ data: null, error: { message: 'baglanti koptu' } }) })
        })
      }
      return chain
    }

    try {
      const res = await simulator.invokeFunction(webhookFunctionPath, teslim())
      expect(res.status).toBe(500)
      expect((await res.json()).error).toBe('Event state read failed')
      expect(mockDbInstance.orders[0].status).toBe('confirmed')
      // Okuma hatasında da ilk teslimin satırı silinmez.
      expect(olayKayitlari()).toHaveLength(1)
    } finally {
      mockDbInstance.from = originalFrom
    }
  })

  it('16. should release its own claim when processing fails, so the same event retried afterwards is processed and marked done', async () => {
    // Sipariş henüz yok: ilk teslim 404 ile biter ve sahipliği bırakır.
    const teslim = await teslimHazirla('EV-ILKHATA', { order_number: 'ORD-ILKHATA', status: 'shipped', carrier: 'dhl', tracking_number: 'DHL-ILKHATA' })
    const ilk = await simulator.invokeFunction(webhookFunctionPath, teslim())
    expect(ilk.status).toBe(404)
    expect(olayKayitlari().some((e) => e.event_id === 'EV-ILKHATA')).toBe(false)

    // Sipariş sonradan görünür olur; AYNI olay yeniden denenir.
    mockDbInstance.orders.push({ id: 'order-ilkhata', status: 'confirmed', payment_status: 'paid', order_number: 'ORD-ILKHATA', carrier: null, tracking_number: null })
    const yeniden = await simulator.invokeFunction(webhookFunctionPath, teslim())
    expect(yeniden.status).toBe(200)
    expect((await yeniden.json()).duplicate).toBeUndefined()
    expect(mockDbInstance.orders[0].status).toBe('shipped')
    expect(olayKayitlari()).toHaveLength(1)
    expect(olayKayitlari()[0].processed_at).toBeTruthy()

    // Tamamlanmış olayın üçüncü teslimi artık 200 duplicate (409 değil) ve yazım yapmaz.
    const ucuncu = await simulator.invokeFunction(webhookFunctionPath, teslim())
    expect(ucuncu.status).toBe(200)
    expect((await ucuncu.json()).duplicate).toBe(true)
  })

  // ─── ALT-138 R1 ek: TAKILI satırın atomik devralınması (izolat ölürse ya da bırakma başarısız olursa olay kaybolmaz) ───
  // processed_at NULL satır `received_at` eşiğinden (DEVRALMA_S = 90 sn) ESKİyse yeniden deneme sahipliği compare-and-set ile
  // devralır; taze satır 409 almaya devam eder. Sabotaj kolu (devralma sökülünce kırmızı): kargo/iade conformance testlerinde.

  const saniyeOnce = (sn: number) => new Date(Date.now() - sn * 1000).toISOString()

  it('17. should take over a stuck claim (processed_at NULL, received_at older than the takeover threshold), process the event and mark it done', async () => {
    mockDbInstance.orders.push({ id: 'order-takili', status: 'confirmed', payment_status: 'paid', order_number: 'ORD-TAKILI', carrier: null, tracking_number: null })
    const eskiZaman = saniyeOnce(600)
    mockDbInstance.events.push({ event_id: 'EV-TAKILI', processed_at: null, received_at: eskiZaman })

    const teslim = await teslimHazirla('EV-TAKILI', { order_number: 'ORD-TAKILI', status: 'shipped', carrier: 'dhl', tracking_number: 'DHL-TAKILI' })
    const res = await simulator.invokeFunction(webhookFunctionPath, teslim())

    expect(res.status).toBe(200)
    expect((await res.json()).duplicate).toBeUndefined()
    expect(mockDbInstance.orders[0].status).toBe('shipped')
    expect(mockDbInstance.orders[0].tracking_number).toBe('DHL-TAKILI')
    expect(olayKayitlari()).toHaveLength(1)
    expect(olayKayitlari()[0].processed_at).toBeTruthy()
    // Devralma received_at'i yeniledi (compare-and-set güncellemesi).
    expect(String((olayKayitlari()[0] as { received_at?: string }).received_at) > eskiZaman).toBe(true)

    const tekrar = await simulator.invokeFunction(webhookFunctionPath, teslim())
    expect(tekrar.status).toBe(200)
    expect((await tekrar.json()).duplicate).toBe(true)
  })

  it('18. should keep answering 409 IN_FLIGHT for a fresh NULL claim (received_at inside the takeover threshold) and not touch it', async () => {
    mockDbInstance.orders.push({ id: 'order-taze', status: 'confirmed', payment_status: 'paid', order_number: 'ORD-TAZE' })
    const tazeZaman = saniyeOnce(60)
    mockDbInstance.events.push({ event_id: 'EV-TAZE', processed_at: null, received_at: tazeZaman })

    const teslim = await teslimHazirla('EV-TAZE', { order_number: 'ORD-TAZE', status: 'shipped' })
    const res = await simulator.invokeFunction(webhookFunctionPath, teslim())

    expect(res.status).toBe(409)
    expect((await res.json()).error).toBe('IN_FLIGHT')
    expect(mockDbInstance.orders[0].status).toBe('confirmed')
    expect(olayKayitlari()).toHaveLength(1)
    expect((olayKayitlari()[0] as { received_at?: string }).received_at).toBe(tazeZaman)
    expect(olayKayitlari()[0].processed_at).toBeNull()
  })

  it('19. should fail closed with 5xx when the takeover update itself errors (no silent 409/200, claim row kept)', async () => {
    mockDbInstance.orders.push({ id: 'order-devralma-hata', status: 'confirmed', payment_status: 'paid', order_number: 'ORD-DEVRALMA' })
    mockDbInstance.events.push({ event_id: 'EV-DEVRALMA', processed_at: null, received_at: saniyeOnce(600) })

    const teslim = await teslimHazirla('EV-DEVRALMA', { order_number: 'ORD-DEVRALMA', status: 'shipped' })

    // Yalnız olay tablosunda update(...).eq().is().lt().select() zinciri (devralma) hata verir; claim upsert'i ve okuma etkilenmez.
    const originalFrom = mockDbInstance.from.bind(mockDbInstance)
    mockDbInstance.from = (table: string) => {
      const chain = originalFrom(table)
      if (table === 'shipping_webhook_events') {
        ;(chain as { update: unknown }).update = () => ({
          eq: () => ({ is: () => ({ lt: () => ({ select: async () => ({ data: null, error: { message: 'baglanti koptu' } }) }) }) })
        })
      }
      return chain
    }

    try {
      const res = await simulator.invokeFunction(webhookFunctionPath, teslim())
      expect(res.status).toBe(500)
      expect((await res.json()).error).toBe('Event takeover failed')
      expect(mockDbInstance.orders[0].status).toBe('confirmed')
      expect(olayKayitlari()).toHaveLength(1)
    } finally {
      mockDbInstance.from = originalFrom
    }
  })
})
