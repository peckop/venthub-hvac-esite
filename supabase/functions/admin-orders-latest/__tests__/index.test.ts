import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * `admin-orders-latest` DAVRANIŞ testi (OPS-213; #2209 güvenlik incelemesi LOW takibi).
 *
 * Statik kapılar (`edge-security.test.ts` R8/R13) bu ucun kodunda rol kapısı ve `tenant_id=eq.`
 * METNİNİN bulunduğunu ölçer; bu dosya GERÇEK `index.ts`'yi çalıştırıp kapının KARARINI ölçer:
 * kim reddedilir, PostgREST adresine hangi tenant girer, hata gövdesi ne taşır.
 * `Deno.serve` ve `fetch` taklittir; kimlik kapısı `resolveCaller` sahtedir (kendi testi
 * `_shared/__tests__/tenant.test.ts` + `caller.ts` kapıları).
 */

type Kimlik = {
  kind: 'anon' | 'user' | 'service_role'
  role?: string
  tenantId: string
  user: { id: string } | null
  source: string
}

const resolveCallerSahte = vi.fn<(req: Request) => Promise<Kimlik>>()
vi.mock('../../_shared/caller.ts', () => ({ resolveCaller: (req: Request) => resolveCallerSahte(req) }))

const ORTAM: Record<string, string | undefined> = {}
let isleyici: (req: Request) => Promise<Response>
const fetchSahte = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>()

const TENANT_A = '11111111-1111-4111-8111-111111111111'
const TENANT_B = '22222222-2222-4222-8222-222222222222'

const admin = (tenantId = TENANT_A, role = 'admin'): Kimlik => ({
  kind: 'user',
  role,
  tenantId,
  user: { id: 'u-1' },
  source: 'profile',
})

const istek = (yol = '', basliklar: Record<string, string> = {}, method = 'GET') =>
  new Request(`https://p.supabase.test/functions/v1/admin-orders-latest${yol}`, {
    method,
    headers: { authorization: 'Bearer jwt', ...basliklar },
  })

beforeAll(async () => {
  vi.stubGlobal('Deno', {
    env: { get: (k: string) => ORTAM[k] },
    serve: (h: (req: Request) => Promise<Response>) => {
      isleyici = h
    },
  })
  vi.stubGlobal('fetch', fetchSahte)
  await import('../index.ts')
  expect(typeof isleyici, 'Deno.serve isleyicisi yakalanamadi').toBe('function')
})

beforeEach(() => {
  for (const k of Object.keys(ORTAM)) delete ORTAM[k]
  Object.assign(ORTAM, {
    SUPABASE_URL: 'https://p.supabase.test',
    SUPABASE_SERVICE_ROLE_KEY: 'test-servis',
    SUPABASE_ANON_KEY: 'test-anon',
  })
  resolveCallerSahte.mockReset()
  fetchSahte.mockReset()
  fetchSahte.mockResolvedValue(
    new Response(JSON.stringify([{ id: 'o-1' }]), { status: 200, headers: { 'content-range': '0-0/1' } }),
  )
})

const govde = async (r: Response) => JSON.parse(await r.text()) as Record<string, unknown>

describe('admin-orders-latest · kimlik ve rol kapısı', () => {
  it('OPTIONS kapıya uğramadan 200 döner', async () => {
    const r = await isleyici(istek('', {}, 'OPTIONS'))
    expect(r.status).toBe(200)
    expect(resolveCallerSahte).not.toHaveBeenCalled()
  })

  it('ALLOWED_ORIGINS tanımlıyken başka köken 403 forbidden_origin, veriye gidilmez', async () => {
    ORTAM.ALLOWED_ORIGINS = 'https://venthub.com.tr'
    const r = await isleyici(istek('', { origin: 'https://kotu.example' }))
    expect(r.status).toBe(403)
    expect(await govde(r)).toEqual({ error: 'forbidden_origin' })
    expect(fetchSahte).not.toHaveBeenCalled()
  })

  it('kimliksiz çağıran 401, veriye gidilmez', async () => {
    resolveCallerSahte.mockResolvedValue({ kind: 'anon', tenantId: TENANT_A, user: null, source: 'default' })
    const r = await isleyici(istek())
    expect(r.status).toBe(401)
    expect(fetchSahte).not.toHaveBeenCalled()
  })

  it.each([
    ['müşteri rolü', admin(TENANT_A, 'customer')],
    ['rolsüz kullanıcı', { ...admin(), role: undefined }],
    ['service_role (tarayıcı ucu değil)', { kind: 'service_role', tenantId: TENANT_A, user: null, source: 'body' } as Kimlik],
  ])('%s 403, veriye gidilmez', async (_ad, kimlik) => {
    resolveCallerSahte.mockResolvedValue(kimlik)
    const r = await isleyici(istek())
    expect(r.status).toBe(403)
    expect(await govde(r)).toEqual({ error: 'forbidden' })
    expect(fetchSahte).not.toHaveBeenCalled()
  })

  it('kimlik kapısı ölçülemezse 500 auth_check_failed (fail-closed), iç metin yok', async () => {
    resolveCallerSahte.mockRejectedValue(new Error('PROFILE_LOOKUP_FAILED:ayse@example.com'))
    const r = await isleyici(istek())
    expect(r.status).toBe(500)
    expect(await govde(r)).toEqual({ error: 'auth_check_failed' })
    expect(fetchSahte).not.toHaveBeenCalled()
  })

  it('ortam eksikse 500 CONFIG_MISSING, kimlik kapısına bile gidilmez', async () => {
    delete ORTAM.SUPABASE_ANON_KEY
    const r = await isleyici(istek())
    expect(r.status).toBe(500)
    expect(await govde(r)).toEqual({ error: 'CONFIG_MISSING' })
    expect(resolveCallerSahte).not.toHaveBeenCalled()
  })
})

describe('admin-orders-latest · tenant kapsamı ve sorgu', () => {
  it.each([['admin'], ['super_admin']])('⭐%s yalnız KENDİ tenant\'ının siparişlerini ister', async (rol) => {
    resolveCallerSahte.mockResolvedValue(admin(TENANT_B, rol))
    const r = await isleyici(istek('?tenant_id=' + TENANT_A))
    expect(r.status).toBe(200)
    expect(await govde(r)).toEqual({ total: 1, page: 1, limit: 50, rows: [{ id: 'o-1' }] })
    const url = new URL(fetchSahte.mock.calls[0][0])
    expect(url.pathname).toBe('/rest/v1/venthub_orders')
    // İstekteki `?tenant_id=` yok sayılır; adres doğrulanmış kimliğin tenant'ını taşır.
    expect(url.searchParams.getAll('tenant_id')).toEqual([`eq.${TENANT_B}`])
  })

  it('sayfa ve limit sınırlanır; Range başlığı ofsetle kurulur', async () => {
    resolveCallerSahte.mockResolvedValue(admin())
    await isleyici(istek('?limit=999&page=3'))
    const init = fetchSahte.mock.calls[0][1] as RequestInit
    expect((init.headers as Record<string, string>).Range).toBe('200-299')
  })

  it('UUID araması id/conversation_id tam eşleşme, metin araması order_number ilike', async () => {
    resolveCallerSahte.mockResolvedValue(admin())
    await isleyici(istek(`?q=${TENANT_B}`))
    await isleyici(istek('?q=VH-2026'))
    const [uuidUrl, metinUrl] = fetchSahte.mock.calls.map((c) => new URL(c[0]))
    expect(uuidUrl.searchParams.get('or')).toBe(`(id.eq.${TENANT_B},conversation_id.eq.${TENANT_B})`)
    expect(metinUrl.searchParams.get('order_number')).toBe('ilike.*VH-2026*')
  })

  it('⭐beklenmeyen hata: 500 sabit kod + request_id, iç hata metni yanıta DÖNMEZ (K6)', async () => {
    resolveCallerSahte.mockResolvedValue(admin())
    fetchSahte.mockRejectedValue(new Error('baglanti koptu: ayse@example.com 05551234567'))
    const hata = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const r = await isleyici(istek())
    expect(r.status).toBe(500)
    const g = await govde(r)
    expect(g.error).toBe('internal_error')
    expect(typeof g.request_id).toBe('string')
    expect(r.headers.get('X-Request-Id')).toBe(g.request_id)
    expect(JSON.stringify(g)).not.toMatch(/baglanti|ayse|0555/)
    // Log ayrıntıyı taşır ama maskeli.
    const log = hata.mock.calls.map((c) => c.join(' ')).join('\n')
    expect(log).toContain('baglanti koptu')
    expect(log).not.toMatch(/ayse@example\.com|1234567/)
    hata.mockRestore()
  })
})
