import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  IMZA_PENCERESI_MS,
  imzaDogrula,
  imzaTekrarKumesiniSifirla,
  imzaUret,
} from '@/lib/webhook/imza'

/**
 * INV-WEBHOOK-2 (ALT-76) · Supabase webhook'u HMAC-SHA256 imza + replay koruması (CLAUDE.md kural 11).
 *
 * Davranışsal: gerçek rota GERÇEK istekle çağrılır. Geçiş aşamasında imzasız eski düz-secret yolu
 * (INV-WEBHOOK-1) sürer; ama imza başlığı varsa karar yalnız imzaya bağlıdır.
 * Her bir ret yolu (yanlış imza, gövde değişikliği, bayat zaman, tekrar) ayrı bir sabotaj vakasıdır:
 * ilgili kontrol kaynaktan silinirse ilgili vaka kırmızı olur.
 */

vi.mock('next/cache', () => ({ revalidateTag: vi.fn(), revalidatePath: vi.fn() }))
vi.mock('@/lib/supabase/static', () => ({
  supabaseStaticClient: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}))

const SECRET = 'imza-testi-secret'
const NEXT_SECRET = 'imza-testi-secret-next'
const GOVDE = JSON.stringify({
  type: 'UPDATE',
  table: 'products',
  schema: 'public',
  record: { id: 'p1', tenant_id: 't1' },
  old_record: { id: 'p1', tenant_id: 't1' },
})

function istek(headers: Record<string, string>, govde: string = GOVDE): NextRequest {
  return new NextRequest('http://localhost/api/webhook/supabase', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: govde,
  })
}

function simdiSn(): string {
  return String(Math.floor(Date.now() / 1000))
}

function imzali(secret: string, zamanSn: string, govde: string = GOVDE): Record<string, string> {
  return {
    'x-webhook-timestamp': zamanSn,
    'x-webhook-signature': imzaUret(secret, zamanSn, govde),
  }
}

describe('INV-WEBHOOK-2 · HMAC imza + replay', () => {
  const envOnce = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    imzaTekrarKumesiniSifirla()
    process.env.SUPABASE_WEBHOOK_SECRET = SECRET
    delete process.env.SUPABASE_WEBHOOK_SECRET_NEXT
  })
  afterEach(() => {
    process.env = { ...envOnce }
  })

  async function post(req: NextRequest) {
    const { POST } = await import('@/app/api/webhook/supabase/route')
    return POST(req)
  }

  it('geçerli imza (düz secret başlığı OLMADAN) kabul edilir', async () => {
    const res = await post(istek(imzali(SECRET, simdiSn())))
    expect(res.status).toBe(200)
  })

  it('rotasyon: SUPABASE_WEBHOOK_SECRET_NEXT ile atılmış imza da kabul edilir', async () => {
    process.env.SUPABASE_WEBHOOK_SECRET_NEXT = NEXT_SECRET
    const res = await post(istek(imzali(NEXT_SECRET, simdiSn())))
    expect(res.status).toBe(200)
  })

  it('SABOTAJ yanlış secret ile atılmış imza 401', async () => {
    const res = await post(istek(imzali('baska-secret', simdiSn())))
    expect(res.status).toBe(401)
  })

  it('SABOTAJ imza geçerli ama gövde değişmiş: 401', async () => {
    const zaman = simdiSn()
    const bozuk = GOVDE.replace('"p1"', '"p2"')
    const res = await post(istek(imzali(SECRET, zaman, GOVDE), bozuk))
    expect(res.status).toBe(401)
  })

  it('SABOTAJ bayat zaman damgası (pencere dışı, geçmiş) 401', async () => {
    const eski = String(Math.floor((Date.now() - IMZA_PENCERESI_MS - 60_000) / 1000))
    const res = await post(istek(imzali(SECRET, eski)))
    expect(res.status).toBe(401)
  })

  it('SABOTAJ ileri tarihli zaman damgası (pencere dışı) 401', async () => {
    const ileri = String(Math.floor((Date.now() + IMZA_PENCERESI_MS + 60_000) / 1000))
    const res = await post(istek(imzali(SECRET, ileri)))
    expect(res.status).toBe(401)
  })

  it('SABOTAJ imza var ama zaman damgası yok: 401', async () => {
    const zaman = simdiSn()
    const res = await post(istek({ 'x-webhook-signature': imzaUret(SECRET, zaman, GOVDE) }))
    expect(res.status).toBe(401)
  })

  it('SABOTAJ replay: aynı imzalı istek pencere içinde ikinci kez 401', async () => {
    const baslik = imzali(SECRET, simdiSn())
    expect((await post(istek(baslik))).status).toBe(200)
    expect((await post(istek(baslik))).status).toBe(401)
  })

  it('SABOTAJ replay büyük/küçük harf farkıyla atlatılamaz: aynı imzanın BÜYÜK harfli hâli 401', async () => {
    const baslik = imzali(SECRET, simdiSn())
    expect((await post(istek(baslik))).status).toBe(200)
    const buyuk = { ...baslik, 'x-webhook-signature': baslik['x-webhook-signature'].toUpperCase() }
    expect((await post(istek(buyuk))).status).toBe(401)
  })

  it('SABOTAJ imzalı ama geçersiz istek DOĞRU düz secret ile kurtarılamaz: 401', async () => {
    const res = await post(
      istek({ ...imzali('baska-secret', simdiSn()), 'x-webhook-secret': SECRET }),
    )
    expect(res.status).toBe(401)
  })

  it('GEÇİŞ: imzasız istek eski düz secret ile hâlâ kabul edilir (INV-WEBHOOK-1 ile uyumlu)', async () => {
    const res = await post(istek({ 'x-webhook-secret': SECRET }))
    expect(res.status).toBe(200)
  })

  it('SABOTAJ kimliksiz istekte bozuk JSON 401 döner (500 ve ayrıştırma mesajı sızmaz)', async () => {
    const res = await post(istek({}, 'xyz'))
    expect(res.status).toBe(401)
    expect(JSON.stringify(await res.json())).not.toContain('JSON')
  })

  it('kimliği doğrulanmış çağırana bozuk JSON 400 döner, iç mesaj yok', async () => {
    const res = await post(istek({ 'x-webhook-secret': SECRET }, 'xyz'))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid JSON body' })
  })

  it('imzasız ve secret yok: 401', async () => {
    const res = await post(istek({}))
    expect(res.status).toBe(401)
  })
})

describe('imzaDogrula · saf birim', () => {
  const simdiMs = Date.now()
  const zaman = String(Math.floor(simdiMs / 1000))

  it('imza başlığı yoksa imza-yok (çağıran eski yola düşebilir)', () => {
    expect(
      imzaDogrula({ secrets: [SECRET], zamanSn: zaman, imza: null, hamGovde: GOVDE, simdiMs }),
    ).toBe('imza-yok')
  })

  it('geçerli imza gecerli, büyük harfli hex de kabul', () => {
    const imza = imzaUret(SECRET, zaman, GOVDE)
    for (const i of [imza, imza.toUpperCase()]) {
      expect(
        imzaDogrula({ secrets: [SECRET], zamanSn: zaman, imza: i, hamGovde: GOVDE, simdiMs }),
      ).toBe('gecerli')
    }
  })

  it('SABOTAJ secret listesi boşsa hiçbir imza geçmez', () => {
    const imza = imzaUret(SECRET, zaman, GOVDE)
    expect(
      imzaDogrula({ secrets: [], zamanSn: zaman, imza, hamGovde: GOVDE, simdiMs }),
    ).toBe('gecersiz')
  })

  it('SABOTAJ farklı uzunlukta imza fırlatmadan gecersiz döner', () => {
    expect(
      imzaDogrula({ secrets: [SECRET], zamanSn: zaman, imza: 'abc', hamGovde: GOVDE, simdiMs }),
    ).toBe('gecersiz')
  })
})
