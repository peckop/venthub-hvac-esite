// @vitest-environment node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * INV-ODEME-P2-1 + INV-ADMIN-SIPARIS-P11-1 · karne 2026-11 §4 P2 ve P11 kilitleri (Kanban OPS-222).
 *
 * DAVRANIŞLA ölçülür (kalıp: kargo-webhook-monoton.test.ts): üç uç gerçek `index.ts` hâliyle yüklenir,
 * `Deno.serve`'e verilen işleyici yakalanır. supabase-js ve ortak kimlik kapısı (`_shared/caller.ts`,
 * uzak içe aktarması var) sahteyle değişir; diğer `_shared` modülleri GERÇEKTİR. Ağ `fetch` sahtesi
 * PostgREST'i ve `iyzico-callback`i taklit eder, her çağrı kaydedilir.
 *
 * P2 kilidi (karne): pending sipariş + aynı `order_id` için `PAYMENT_ORDER_MISMATCH` kaydı → release koşar,
 * sipariş pending kalır; housekeeping'de callback `pending` dönünce sipariş sonlandırılmaz.
 * P11 kilidi (karne): `status` yokken 400; pending→confirmed 409 ya da gerekçe ister; her çağrı tam 1
 * `admin_audit_log` satırı.
 */

const KOK = path.resolve(__dirname, '../../..')
const SIPARIS = '33333333-3333-4333-8333-333333333333'
const TENANT = 'd3b07384-d113-495f-a558-8c38634e0000'
const ADMIN = '44444444-4444-4444-8444-444444444444'
const URL_TABAN = 'https://ornek.supabase.co'

type Isleyici = (req: Request) => Promise<Response>
type Cagri = { url: string; method: string; govde: unknown; basliklar: Record<string, string> }

let cagrilar: Cagri[] = []
/** Sahte ağ: test başına yönlendirici; null dönerse 404. */
let yonlendirici: (c: Cagri) => Response | Promise<Response> | null = () => null

async function sahteFetch(girdi: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof girdi === 'string' ? girdi : girdi instanceof URL ? girdi.href : girdi.url
  const method = (init?.method ?? 'GET').toUpperCase()
  let govde: unknown = null
  if (typeof init?.body === 'string') {
    try { govde = JSON.parse(init.body) } catch { govde = init.body }
  }
  const basliklar: Record<string, string> = {}
  new Headers(init?.headers).forEach((v, k) => { basliklar[k] = v })
  const c: Cagri = { url: decodeURIComponent(url), method, govde, basliklar }
  cagrilar.push(c)
  const r = await yonlendirici(c)
  return r ?? new Response('[]', { status: 404 })
}

const json = (v: unknown, durum = 200, ek: Record<string, string> = {}) =>
  new Response(JSON.stringify(v), { status: durum, headers: { 'content-type': 'application/json', ...ek } })

const denetimSatirlari = () => cagrilar.filter((c) => c.method === 'POST' && c.url.includes('/rest/v1/admin_audit_log'))
const siparisPatchleri = () => cagrilar.filter((c) => c.method === 'PATCH' && c.url.includes('/rest/v1/venthub_orders?id=eq.'))
const alarmlar = () => cagrilar.filter((c) => c.method === 'POST' && c.url.includes('/rest/v1/client_errors'))
const mismatchSorgusu = (c: Cagri) => c.method === 'GET' && c.url.includes('/rest/v1/client_errors') && c.url.includes('PAYMENT_ORDER_MISMATCH')

// ─────────────────────────────────────────────────────────── yükleyici

let tmp = ''
function dizin(): string {
  if (!tmp) tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'odeme-p2-p11-'))
  return tmp
}

function nodeKopyasi(islev: string): string {
  const metin = fs.readFileSync(path.join(KOK, `supabase/functions/${islev}/index.ts`), 'utf8')
  const istemci = path.join(dizin(), 'sahte-supabase.mjs')
  fs.writeFileSync(istemci, 'export const createClient = (...a) => globalThis.__sahteIstemci(...a)\n')
  const caller = path.join(dizin(), 'sahte-caller.mjs')
  fs.writeFileSync(
    caller,
    [
      'export const resolveCaller = async () => globalThis.__sahteCaller',
      "export const ayricalikliMi = (c) => c.kind === 'service_role' || (c.kind === 'user' && (c.role === 'admin' || c.role === 'super_admin'))",
      'export class TenantMismatchError extends Error {}',
      '',
    ].join('\n'),
  )
  const paylasilan = pathToFileURL(path.join(KOK, 'supabase/functions/_shared')).href
  const cevrilmis = metin
    .replace(/["']https:\/\/esm\.sh\/@supabase\/supabase-js@[\d.]+["']/, `'${pathToFileURL(istemci).href}'`)
    .replace(/(['"])\.\.\/_shared\/caller\.ts\1/g, `'${pathToFileURL(caller).href}'`)
    .replace(/(['"])\.\.\/_shared\//g, `$1${paylasilan}/`)
  if (/https:\/\/(esm\.sh|deno\.land)|["']npm:|['"]\.\.\//.test(cevrilmis)) {
    throw new Error(`${islev} yeni bir uzak/göreli içe aktarma eklemiş: nodeKopyasi güncellenmeli`)
  }
  const yol = path.join(dizin(), `${islev}.mts`)
  fs.writeFileSync(yol, cevrilmis)
  return yol
}

async function isleyiciYukle(islev: string): Promise<Isleyici> {
  let yakalanan: Isleyici | null = null
  vi.stubGlobal('Deno', {
    serve: (f: Isleyici) => { yakalanan = f },
    env: {
      get: (k: string) =>
        ({
          SUPABASE_URL: URL_TABAN,
          SUPABASE_SERVICE_ROLE_KEY: 'test-servis-anahtari',
          SUPABASE_ANON_KEY: 'test-anon-anahtari',
        })[k],
    },
  })
  await import(/* @vite-ignore */ pathToFileURL(nodeKopyasi(islev)).href)
  if (!yakalanan) throw new Error(`${islev}: Deno.serve çağrılmadı`)
  return yakalanan
}

let adminUcu: Isleyici
let housekeeping: Isleyici
let release: Isleyici

beforeAll(async () => {
  vi.stubGlobal('fetch', sahteFetch)
  adminUcu = await isleyiciYukle('admin-update-order')
  housekeeping = await isleyiciYukle('order-housekeeping')
  release = await isleyiciYukle('release-expired-reservations')
})

afterAll(() => {
  vi.unstubAllGlobals()
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true })
})

beforeEach(() => {
  cagrilar = []
  yonlendirici = () => null
  Object.assign(globalThis, {
    __sahteCaller: { kind: 'service_role', user: null, tenantId: TENANT, source: 'default' },
    __sahteIstemci: () => ({
      auth: { getUser: async () => ({ data: { user: { id: ADMIN, app_metadata: {} } }, error: null }) },
    }),
  })
})

// ─────────────────────────────────────────────────────────── P11 · admin-update-order

type Satir = { id: string; status: string; payment_status: string }
let satir: Satir
/** PATCH'e verilecek zorla cevap (ör. VH409). */
let patchCevabi: (() => Response) | null = null
let denetimDurumu = 201

function adminYonlendirici(c: Cagri): Response | null {
  if (c.url.includes('/rest/v1/user_profiles')) return json([{ role: 'admin', tenant_id: TENANT }])
  if (c.url.includes('/rest/v1/admin_audit_log')) return new Response(null, { status: denetimDurumu })
  if (c.url.includes('/rest/v1/client_errors')) return new Response(null, { status: 201 })
  if (c.url.includes('/rest/v1/venthub_orders')) {
    const idEslesir = c.url.includes(`id=eq.${satir.id}`)
    if (c.method === 'GET') return json(idEslesir ? [{ ...satir }] : [])
    if (c.method === 'PATCH') {
      if (patchCevabi) return patchCevabi()
      const kosul = /status=eq\.(\w+)/.exec(c.url.replace(/payment_status=eq\.\w+/, ''))
      if (!idEslesir || (kosul && kosul[1] !== satir.status)) return json([])
      satir = { ...satir, ...(c.govde as Partial<Satir>) }
      return json([{ ...satir }])
    }
  }
  return null
}

async function adminCagir(govde: Record<string, unknown>): Promise<{ http: number; json: Record<string, unknown> }> {
  const r = await adminUcu(
    new Request(`${URL_TABAN}/functions/v1/admin-update-order`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: 'Bearer kullanici-jwt' },
      body: JSON.stringify(govde),
    }),
  )
  return { http: r.status, json: (await r.json()) as Record<string, unknown> }
}

describe('INV-ADMIN-SIPARIS-P11-1 · admin-update-order', () => {
  beforeEach(() => {
    satir = { id: SIPARIS, status: 'pending', payment_status: 'pending' }
    patchCevabi = null
    denetimDurumu = 201
    yonlendirici = adminYonlendirici
  })

  it('⭐karne kilidi: status yokken 400, yazım yok, tam 1 denetim satırı', async () => {
    const r = await adminCagir({ id: SIPARIS })
    expect(r.http).toBe(400)
    expect(r.json.error).toBe('missing_status')
    expect(siparisPatchleri()).toHaveLength(0)
    expect(denetimSatirlari()).toHaveLength(1)
    expect(satir.status).toBe('pending')
  })

  it('sözlük dışı değer (eski varsayılan `paid`) 400, yazım yok, 1 denetim satırı', async () => {
    const r = await adminCagir({ id: SIPARIS, status: 'paid' })
    expect(r.http).toBe(400)
    expect(r.json.error).toBe('invalid_status')
    expect(siparisPatchleri()).toHaveLength(0)
    expect(denetimSatirlari()).toHaveLength(1)
  })

  it('⭐karne kilidi: pending→confirmed gerekçesiz 409 REASON_REQUIRED, sipariş pending kalır, 1 denetim satırı', async () => {
    const r = await adminCagir({ id: SIPARIS, status: 'confirmed' })
    expect(r.http).toBe(409)
    expect(r.json.error).toBe('REASON_REQUIRED')
    expect(siparisPatchleri()).toHaveLength(0)
    expect(satir.status).toBe('pending')
    const d = denetimSatirlari()
    expect(d).toHaveLength(1)
    expect(d[0].govde).toMatchObject({ action: 'order_status_rejected', row_pk: SIPARIS, actor: ADMIN, tenant_id: TENANT })
  })

  it('pending→confirmed gerekçeyle yazılır; denetim satırı kim, önce/sonra ve gerekçeyi taşır', async () => {
    const gerekce = 'Havale dekontu muhasebe ile kontrol edildi'
    const r = await adminCagir({ id: SIPARIS, status: 'confirmed', reason: gerekce })
    expect(r.http).toBe(200)
    expect(r.json).toMatchObject({ ok: true, from: 'pending', to: 'confirmed', audit: 'yazildi' })
    expect(satir.status).toBe('confirmed')
    // koşullu yazım: kaynak durum filtresi + tenant filtresi
    const p = siparisPatchleri()
    expect(p).toHaveLength(1)
    expect(p[0].url).toContain('status=eq.pending')
    expect(p[0].url).toContain(`tenant_id=eq.${TENANT}`)
    const d = denetimSatirlari()
    expect(d).toHaveLength(1)
    expect(d[0].govde).toMatchObject({
      action: 'order_status_update',
      table_name: 'venthub_orders',
      row_pk: SIPARIS,
      actor: ADMIN,
      tenant_id: TENANT,
      comment: gerekce,
      before: { status: 'pending', payment_status: 'pending' },
      after: { status: 'confirmed' },
    })
  })

  it.each([
    ['delivered', 'confirmed'],
    ['shipped', 'processing'],
    ['cancelled', 'pending'],
  ])('geri geçiş %s → %s: 409 INVALID_TRANSITION, yazım yok, 1 denetim satırı', async (mevcut, hedef) => {
    satir = { ...satir, status: mevcut, payment_status: 'paid' }
    const r = await adminCagir({ id: SIPARIS, status: hedef, reason: 'yeterince uzun bir gerekçe' })
    expect(r.http).toBe(409)
    expect(r.json.error).toBe('INVALID_TRANSITION')
    expect(siparisPatchleri()).toHaveLength(0)
    expect(satir.status).toBe(mevcut)
    expect(denetimSatirlari()).toHaveLength(1)
  })

  it('ileri geçiş gerekçesiz yazılır (confirmed → processing), 1 denetim satırı', async () => {
    satir = { ...satir, status: 'confirmed', payment_status: 'paid' }
    const r = await adminCagir({ id: SIPARIS, status: 'processing' })
    expect(r.http).toBe(200)
    expect(satir.status).toBe('processing')
    expect(denetimSatirlari()).toHaveLength(1)
  })

  it('veritabanı tetiği (VH409) reddederse 409; ham gövde yanıta konmaz; 1 denetim satırı', async () => {
    satir = { ...satir, status: 'confirmed', payment_status: 'paid' }
    patchCevabi = () => json({ code: 'VH409', message: 'ALT131_MONOTON: gizli ayrinti' }, 400)
    const r = await adminCagir({ id: SIPARIS, status: 'shipped' })
    expect(r.http).toBe(409)
    expect(JSON.stringify(r.json)).not.toContain('gizli ayrinti')
    expect(denetimSatirlari()).toHaveLength(1)
  })

  it('okuma ile yazma arasında durum değişirse (0 satır) 409 CONCURRENT_CHANGE, 1 denetim satırı', async () => {
    satir = { ...satir, status: 'confirmed', payment_status: 'paid' }
    patchCevabi = () => json([])
    const r = await adminCagir({ id: SIPARIS, status: 'processing' })
    expect(r.http).toBe(409)
    expect(r.json.error).toBe('CONCURRENT_CHANGE')
    expect(denetimSatirlari()).toHaveLength(1)
  })

  it('sipariş yok / tanımlayıcı yok: 404 / 400, her biri 1 denetim satırı', async () => {
    const yok = await adminCagir({ id: '55555555-5555-4555-8555-555555555555', status: 'cancelled' })
    expect(yok.http).toBe(404)
    expect(denetimSatirlari()).toHaveLength(1)
    cagrilar = []
    const tanimsiz = await adminCagir({ status: 'cancelled' })
    expect(tanimsiz.http).toBe(400)
    expect(tanimsiz.json.error).toBe('missing_identifier')
    expect(denetimSatirlari()).toHaveLength(1)
  })

  it('denetim satırı yazılamazsa sessiz kalmaz: yanıtta audit=yazilamadi + gelir alarmı', async () => {
    denetimDurumu = 500
    satir = { ...satir, status: 'confirmed', payment_status: 'paid' }
    const r = await adminCagir({ id: SIPARIS, status: 'processing' })
    expect(r.json.audit).toBe('yazilamadi')
    expect(denetimSatirlari()).toHaveLength(1)
    expect(alarmlar().some((a) => JSON.stringify(a.govde).includes('ADMIN_AUDIT_YAZILAMADI'))).toBe(true)
  })

  it('yönetici olmayan çağıran 403 alır ve denetim satırı yazılmaz (iz yalnız doğrulanmış yöneticiye)', async () => {
    yonlendirici = (c) => (c.url.includes('/rest/v1/user_profiles') ? json([{ role: 'user', tenant_id: TENANT }]) : adminYonlendirici(c))
    const r = await adminCagir({ id: SIPARIS, status: 'cancelled' })
    expect(r.http).toBe(403)
    expect(denetimSatirlari()).toHaveLength(0)
    expect(siparisPatchleri()).toHaveLength(0)
  })
})

// ─────────────────────────────────────────────────────────── P2 · order-housekeeping

const CALLBACK = 'https://ornek.functions.supabase.co/iyzico-callback'
/** İyzico'nun ödemeyi açıkça reddettiği gerçek cevap (sorgu başarılı, ödeme başarısız). */
const ODEME_REDDI = { status: 'failure', iyzico: { status: 'success', paymentStatus: 'FAILURE' } }
let callbackCevabi: () => Response = () => json(ODEME_REDDI)
let mismatchKaydi: string[] = []
let mismatchDurumu = 200

function housekeepingYonlendirici(c: Cagri): Response | null {
  if (c.url.startsWith(CALLBACK)) return callbackCevabi()
  if (mismatchSorgusu(c)) {
    return mismatchDurumu === 200 ? json(mismatchKaydi.map((id) => ({ extra: { code: 'PAYMENT_ORDER_MISMATCH', order_id: id } }))) : new Response('x', { status: mismatchDurumu })
  }
  if (c.method === 'POST' && c.url.includes('/rest/v1/client_errors')) return new Response(null, { status: 201 })
  if (c.url.includes('/rest/v1/venthub_orders')) {
    if (c.method === 'PATCH' && c.url.includes('payment_token=is.null')) return json([], 200, { 'content-range': '*/0' })
    if (c.method === 'GET' && c.url.includes('payment_token=not.is.null')) return json([{ id: SIPARIS }], 200, { 'content-range': '0-0/1' })
    if (c.method === 'PATCH' && c.url.includes('id=eq.')) return new Response(null, { status: 204 })
  }
  return null
}

async function housekeepingKos(): Promise<{ http: number; json: Record<string, unknown> }> {
  const r = await housekeeping(
    new Request(`${URL_TABAN}/functions/v1/order-housekeeping`, { method: 'POST', headers: { Authorization: 'Bearer servis' } }),
  )
  return { http: r.status, json: (await r.json()) as Record<string, unknown> }
}

describe('INV-ODEME-P2-1 · order-housekeeping ödemesi bilinmeyen/eşleşmeyen siparişi sonlandırmaz', () => {
  beforeEach(() => {
    callbackCevabi = () => json(ODEME_REDDI)
    mismatchKaydi = []
    mismatchDurumu = 200
    yonlendirici = housekeepingYonlendirici
  })

  it("⭐karne kilidi: callback retrieve ağ hatasıyla `pending` dönünce sipariş sonlandırılmaz", async () => {
    callbackCevabi = () => json({ status: 'pending', error: 'fetch failed' })
    const r = await housekeepingKos()
    expect(siparisPatchleri()).toHaveLength(0)
    expect(r.json.failed).toEqual([])
    expect(r.json.belirsiz).toEqual([SIPARIS])
    expect(r.http).toBe(200)
  })

  it('callback çağrısı hiç ulaşmazsa (ağ) ya da 5xx dönerse sonlandırma yok', async () => {
    callbackCevabi = () => { throw new TypeError('fetch failed') }
    await housekeepingKos()
    expect(siparisPatchleri()).toHaveLength(0)
    cagrilar = []
    callbackCevabi = () => json(ODEME_REDDI, 502)
    const r = await housekeepingKos()
    expect(siparisPatchleri()).toHaveLength(0)
    expect(r.json.belirsiz).toEqual([SIPARIS])
  })

  it.each([
    ['İyzico API hata zarfı (status=failure, paymentStatus yok)', { status: 'failure', iyzico: { status: 'failure', errorCode: '1001' } }],
    ['İyzico zarfı yok', { status: 'failure' }],
    ['İyzico sorgusu başarılı ama paymentStatus boş', { status: 'failure', iyzico: { status: 'success' } }],
  ])('OPS-225 MEDIUM-1: callback `failure` + %s → sonlandırma yok, belirsiz', async (_ad, govde) => {
    callbackCevabi = () => json(govde)
    const r = await housekeepingKos()
    expect(siparisPatchleri()).toHaveLength(0)
    expect(r.json.belirsiz).toEqual([SIPARIS])
    expect(r.json.failed).toEqual([])
  })

  it('needs_review cevabı sonlandırmaz (mevcut REC-355 dalı korunur)', async () => {
    callbackCevabi = () => json({ status: 'needs_review' })
    const r = await housekeepingKos()
    expect(siparisPatchleri()).toHaveLength(0)
    expect(r.json.inceleme_bekleyen).toEqual([SIPARIS])
  })

  it('failure + aynı order_id için PAYMENT_ORDER_MISMATCH kaydı → sipariş pending kalır, inceleme kovasında', async () => {
    mismatchKaydi = [SIPARIS]
    const r = await housekeepingKos()
    expect(siparisPatchleri()).toHaveLength(0)
    expect(r.json.inceleme_bekleyen).toEqual([SIPARIS])
    expect(r.json.failed).toEqual([])
  })

  it('failure + kayıt yok → sonlandırılır (pending koşullu, cancelled + failed)', async () => {
    const r = await housekeepingKos()
    const p = siparisPatchleri()
    expect(p).toHaveLength(1)
    expect(p[0].url).toContain('status=eq.pending')
    expect(p[0].govde).toMatchObject({ status: 'cancelled', payment_status: 'failed' })
    expect(r.json.failed).toEqual([SIPARIS])
  })

  it('kayıt sorgusu ölçülemezse hiçbir aday sonlandırılmaz ve rapor ok=false/500', async () => {
    mismatchDurumu = 503
    const r = await housekeepingKos()
    expect(siparisPatchleri()).toHaveLength(0)
    expect(r.http).toBe(500)
    expect(r.json.ok).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────── P2 · release-expired-reservations

type Guncelleme = { govde: Record<string, unknown>; filtreler: [string, unknown][] }
let guncellemeler: Guncelleme[] = []
let secimFiltreleri: [string, unknown][] = []
let rpcCagrilari = 0

function releaseIstemcisi() {
  return {
    from(tablo: string) {
      const d: { op: 'select' | 'update' | 'insert'; govde: Record<string, unknown>; filtreler: [string, unknown][] } = { op: 'select', govde: {}, filtreler: [] }
      const b = {
        select() { return b },
        eq(k: string, v: unknown) { d.filtreler.push([k, v]); return b },
        is(k: string, v: unknown) { d.filtreler.push([`${k}:is`, v]); return b },
        lt() { return b },
        limit() { return b },
        maybeSingle() { return Promise.resolve({ data: { reservation_timeout_hours: 24 }, error: null }) },
        update(g: Record<string, unknown>) { d.op = 'update'; d.govde = g; return b },
        insert() { d.op = 'insert'; return Promise.resolve({ data: null, error: null }) },
        then(coz: (v: unknown) => unknown) {
          if (tablo === 'venthub_orders' && d.op === 'select') secimFiltreleri = [...d.filtreler]
          if (tablo === 'venthub_orders' && d.op === 'select') return Promise.resolve({ data: [{ id: SIPARIS, order_number: 'VH-1' }], error: null }).then(coz)
          if (tablo === 'venthub_orders' && d.op === 'update') {
            guncellemeler.push({ govde: d.govde, filtreler: d.filtreler })
            return Promise.resolve({ data: [{ id: SIPARIS }], error: null }).then(coz)
          }
          return Promise.resolve({ data: null, error: null }).then(coz)
        },
      }
      return b
    },
    rpc() { rpcCagrilari++; return Promise.resolve({ data: { success: true, restored_count: 0 }, error: null }) },
  }
}

async function releaseKos(): Promise<{ http: number; json: Record<string, unknown> }> {
  const r = await release(
    new Request(`${URL_TABAN}/functions/v1/release-expired-reservations`, { method: 'POST', headers: { Authorization: 'Bearer servis' } }),
  )
  return { http: r.status, json: (await r.json()) as Record<string, unknown> }
}

describe('INV-ODEME-P2-1 · release-expired-reservations eşleşmeyen ödemeli siparişi iptal etmez', () => {
  beforeEach(() => {
    guncellemeler = []
    secimFiltreleri = []
    rpcCagrilari = 0
    mismatchKaydi = []
    mismatchDurumu = 200
    yonlendirici = housekeepingYonlendirici
    Object.assign(globalThis, { __sahteIstemci: releaseIstemcisi })
  })

  it('⭐karne kilidi: pending sipariş + aynı order_id için PAYMENT_ORDER_MISMATCH → release koşar, sipariş pending kalır', async () => {
    mismatchKaydi = [SIPARIS]
    const r = await releaseKos()
    expect(r.http).toBe(200)
    expect(guncellemeler).toHaveLength(0)
    expect(rpcCagrilari).toBe(0)
    expect(r.json.released_count).toBe(0)
    expect(r.json.inceleme_bekleyen).toEqual([SIPARIS])
    expect(alarmlar().some((a) => JSON.stringify(a.govde).includes('PAYMENT_NEEDS_REVIEW_SURESI_DOLDU'))).toBe(true)
  })

  it('kayıt yoksa iptal edilir; yazım hâlâ pending/pending koşullu', async () => {
    const r = await releaseKos()
    expect(r.json.released_count).toBe(1)
    expect(guncellemeler).toHaveLength(1)
    expect(guncellemeler[0].govde).toMatchObject({ status: 'cancelled', payment_status: 'failed' })
    expect(guncellemeler[0].filtreler).toEqual(expect.arrayContaining([['id', SIPARIS], ['status', 'pending'], ['payment_status', 'pending']]))
  })

  it('OPS-225 MEDIUM-2: ödemesi başlamış (token’lı) sipariş seçilmez; housekeeping’in “belirsiz” beklettiği sipariş burada iptal olmaz', async () => {
    await releaseKos()
    expect(secimFiltreleri).toEqual(expect.arrayContaining([['payment_token:is', null], ['status', 'pending'], ['payment_status', 'pending']]))
  })

  it('kayıt sorgusu yalnız iyzico-callback edge alarmına bakar (OPS-225 LOW-2)', async () => {
    mismatchKaydi = [SIPARIS]
    await releaseKos()
    const s = cagrilar.find(mismatchSorgusu)
    expect(s?.url).toContain('env=eq.edge')
    expect(s?.url).toContain('extra->>fn=eq.iyzico-callback')
  })

  it('kayıt sorgusu ölçülemezse hiçbir sipariş iptal edilmez (500)', async () => {
    mismatchDurumu = 500
    const r = await releaseKos()
    expect(r.http).toBe(500)
    expect(guncellemeler).toHaveLength(0)
  })
})
