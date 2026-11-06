import { randomUUID } from 'node:crypto'

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  IMZA_PENCERESI_MS,
  imzaDogrula,
  imzaTekrarKumesiniSifirla,
  imzaUret,
} from '@/lib/webhook/imza'
import { olayKimligi, olayTuket } from '@/lib/webhook/olayTekil'
import type { Database } from '@/types/database.types'

/**
 * INV-WEBHOOK-2 (ALT-76) · Supabase webhook'u HMAC-SHA256 imza + KALICI replay koruması (CLAUDE.md kural 11).
 *
 * Davranışsal: gerçek rota GERÇEK istekle çağrılır. PR 3'ten beri imza ZORUNLU (düz secret yolu kapalı)
 * ve gövdedeki `event_id` veritabanında (webhook_olay_tuket RPC'si) tüketilir. RPC burada SAHTE ama
 * migration'daki fonksiyonla aynı kararı verir: imzayı "Vault" sırrıyla yeniden hesaplar, 300 sn penceresini
 * ölçer, kimliği kalıcı kümeye yazar. Küme modül sıfırlamasından (sunucusuz yeni örnek) ETKİLENMEZ.
 *
 * Her ret yolu (yanlış imza, gövde değişikliği, bayat zaman, tekrar olay) ayrı vakadır; SABOTAJ KOLU
 * aynı istekleri KAPISIZ kopyaya gönderir ve hepsinin geçtiğini gösterir — yani kapılı rotadaki vakalar
 * kapı sökülünce KIRMIZI olur, vakumda yeşil değildir.
 */

const db = vi.hoisted(() => ({
  vaultSirri: 'imza-testi-secret',
  olaylar: new Set<string>(),
  rpcHatasi: null as string | null,
  rpcCagrisi: 0,
}))

vi.mock('next/cache', () => ({ revalidateTag: vi.fn(), revalidatePath: vi.fn() }))
vi.mock('@/lib/supabase/static', async () => {
  const { createHmac } = await import('node:crypto')
  return {
    supabaseStaticClient: {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
      // supabase/migrations/20261105090000_webhook_olay_tekillestirme.sql · webhook_olay_tuket taklidi.
      rpc: vi.fn(async (ad: string, a: { p_zaman: string; p_govde: string; p_imza: string }) => {
        db.rpcCagrisi++
        if (ad !== 'webhook_olay_tuket') return { data: null, error: { message: `bilinmeyen rpc ${ad}` } }
        if (db.rpcHatasi) return { data: null, error: { message: db.rpcHatasi } }
        if (!/^\d{9,12}$/.test(a.p_zaman)) return { data: 'bayat', error: null }
        if (Math.abs(Date.now() / 1000 - Number(a.p_zaman)) > 300) return { data: 'bayat', error: null }
        const beklenen = createHmac('sha256', db.vaultSirri).update(`${a.p_zaman}.${a.p_govde}`).digest('hex')
        if (a.p_imza.toLowerCase() !== beklenen) return { data: 'gecersiz', error: null }
        const olay = (JSON.parse(a.p_govde) as { event_id?: string }).event_id
        if (!olay) return { data: 'gecersiz', error: null }
        if (db.olaylar.has(olay)) return { data: 'tekrar', error: null }
        db.olaylar.add(olay)
        return { data: 'yeni', error: null }
      }),
    },
  }
})

const SECRET = 'imza-testi-secret'
const NEXT_SECRET = 'imza-testi-secret-next'

function govdeUret(eventId: string | null = randomUUID()): string {
  return JSON.stringify({
    ...(eventId ? { event_id: eventId } : {}),
    type: 'UPDATE',
    table: 'products',
    schema: 'public',
    record: { id: 'p1', tenant_id: 't1' },
    old_record: { id: 'p1', tenant_id: 't1' },
  })
}

function istek(headers: Record<string, string>, govde: string): NextRequest {
  return new NextRequest('http://localhost/api/webhook/supabase', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: govde,
  })
}

function simdiSn(): string {
  return String(Math.floor(Date.now() / 1000))
}

function imzali(secret: string, zamanSn: string, govde: string): Record<string, string> {
  return {
    'x-webhook-timestamp': zamanSn,
    'x-webhook-signature': imzaUret(secret, zamanSn, govde),
  }
}

/** Tetiğin göndereceği istek: taze olay kimliği, şimdiki zaman, doğru imza. */
function mesruIstek(secret: string = SECRET): NextRequest {
  const g = govdeUret()
  return istek(imzali(secret, simdiSn(), g), g)
}

async function post(req: NextRequest) {
  const { POST } = await import('@/app/api/webhook/supabase/route')
  return POST(req)
}

/** Yeni sunucusuz örnek: modül önbelleği ve bellek içi tekrar kümesi sıfır; DB kümesi KALIR. */
function yeniOrnek(): void {
  vi.resetModules()
  imzaTekrarKumesiniSifirla()
}

const envOnce = { ...process.env }

function ortamiKur(): void {
  yeniOrnek()
  db.olaylar.clear()
  db.rpcHatasi = null
  db.rpcCagrisi = 0
  db.vaultSirri = SECRET
  process.env.SUPABASE_WEBHOOK_SECRET = SECRET
  delete process.env.SUPABASE_WEBHOOK_SECRET_NEXT
}

/**
 * Kapının reddetmesi gereken istekler. Hem kapılı rotada (401 beklenir) hem kapısız kopyada
 * (sabotaj kolu, 200 beklenir) AYNI liste koşar.
 */
const RET_VAKALARI: Array<{ ad: string; kos: () => Promise<Response> }> = [
  {
    ad: 'yanlış secret ile atılmış imza',
    kos: async () => {
      const g = govdeUret()
      return post(istek(imzali('baska-secret', simdiSn(), g), g))
    },
  },
  {
    ad: 'imza geçerli ama gövde değişmiş',
    kos: async () => {
      const g = govdeUret()
      const bozuk = g.replace('"p1"', '"p2"')
      return post(istek(imzali(SECRET, simdiSn(), g), bozuk))
    },
  },
  {
    ad: 'bayat zaman damgası (pencere dışı, geçmiş)',
    kos: async () => {
      const g = govdeUret()
      const eski = String(Math.floor((Date.now() - IMZA_PENCERESI_MS - 60_000) / 1000))
      return post(istek(imzali(SECRET, eski, g), g))
    },
  },
  {
    ad: 'tekrar olay: aynı imzalı istek aynı örnekte ikinci kez',
    kos: async () => {
      const g = govdeUret()
      const b = imzali(SECRET, simdiSn(), g)
      await post(istek(b, g))
      return post(istek(b, g))
    },
  },
  {
    ad: 'tekrar olay: aynı istek BAŞKA sunucusuz örnekte (bellek kümesi boş, DB kalıcı)',
    kos: async () => {
      const g = govdeUret()
      const b = imzali(SECRET, simdiSn(), g)
      await post(istek(b, g))
      yeniOrnek()
      return post(istek(b, g))
    },
  },
]

describe('INV-WEBHOOK-2 · HMAC imza + kalıcı replay (kapılı rota)', () => {
  beforeEach(ortamiKur)
  afterEach(() => {
    process.env = { ...envOnce }
  })

  it('POZİTİF ÇAPA: geçerli imza + yeni olay kimliği 200, olay DB kümesine yazılır', async () => {
    const res = await post(mesruIstek())
    expect(res.status).toBe(200)
    expect(db.olaylar.size).toBe(1)
  })

  it('rotasyon: Vault yeni değere geçmişken SUPABASE_WEBHOOK_SECRET_NEXT ile atılmış imza 200', async () => {
    process.env.SUPABASE_WEBHOOK_SECRET_NEXT = NEXT_SECRET
    db.vaultSirri = NEXT_SECRET
    const res = await post(mesruIstek(NEXT_SECRET))
    expect(res.status).toBe(200)
  })

  for (const v of RET_VAKALARI) {
    it(`SABOTAJ ${v.ad}: 401`, async () => {
      const res = await v.kos()
      expect(res.status).toBe(401)
    })
  }

  it('SABOTAJ ileri tarihli zaman damgası (pencere dışı) 401', async () => {
    const g = govdeUret()
    const ileri = String(Math.floor((Date.now() + IMZA_PENCERESI_MS + 60_000) / 1000))
    expect((await post(istek(imzali(SECRET, ileri, g), g))).status).toBe(401)
  })

  it('SABOTAJ imza var ama zaman damgası yok: 401', async () => {
    const g = govdeUret()
    const res = await post(istek({ 'x-webhook-signature': imzaUret(SECRET, simdiSn(), g) }, g))
    expect(res.status).toBe(401)
  })

  it('SABOTAJ tekrar olay büyük/küçük harf farkıyla atlatılamaz: aynı imzanın BÜYÜK harfli hâli 401', async () => {
    const g = govdeUret()
    const b = imzali(SECRET, simdiSn(), g)
    expect((await post(istek(b, g))).status).toBe(200)
    const buyuk = { ...b, 'x-webhook-signature': b['x-webhook-signature'].toUpperCase() }
    expect((await post(istek(buyuk, g))).status).toBe(401)
  })

  it('SABOTAJ aynı olay kimliği YENİDEN imzalanıp (yeni zaman) gelse de 401 — kimlik kalıcı tüketildi', async () => {
    const g = govdeUret(randomUUID())
    expect((await post(istek(imzali(SECRET, simdiSn(), g), g))).status).toBe(200)
    yeniOrnek()
    const ikinciZaman = String(Number(simdiSn()) - 1)
    expect((await post(istek(imzali(SECRET, ikinciZaman, g), g))).status).toBe(401)
  })

  it('SABOTAJ eski düz secret yolu KAPALI: yalnız x-webhook-secret başlığı (doğru değer) 401', async () => {
    const res = await post(istek({ 'x-webhook-secret': SECRET }, govdeUret()))
    expect(res.status).toBe(401)
    expect(db.rpcCagrisi).toBe(0)
  })

  it('SABOTAJ imzalı ama geçersiz istek DOĞRU düz secret ile kurtarılamaz: 401', async () => {
    const g = govdeUret()
    const res = await post(istek({ ...imzali('baska-secret', simdiSn(), g), 'x-webhook-secret': SECRET }, g))
    expect(res.status).toBe(401)
  })

  it('SABOTAJ imzalı ama event_id yok: 400 ve DB tüketimi çağrılmaz', async () => {
    const g = govdeUret(null)
    const res = await post(istek(imzali(SECRET, simdiSn(), g), g))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Missing event_id' })
    expect(db.rpcCagrisi).toBe(0)
  })

  it('SABOTAJ DB imzayı reddederse (Vault ile env ayrışmış) 401', async () => {
    db.vaultSirri = 'vault-baska-deger'
    expect((await post(mesruIstek())).status).toBe(401)
  })

  it('FAIL-CLOSED: DB tüketimine ulaşılamazsa 503, yenileme yapılmaz', async () => {
    db.rpcHatasi = 'connection refused'
    const { revalidateTag, revalidatePath } = await import('next/cache')
    vi.mocked(revalidateTag).mockClear()
    vi.mocked(revalidatePath).mockClear()
    const res = await post(mesruIstek())
    expect(res.status).toBe(503)
    expect(revalidateTag).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('SABOTAJ kimliksiz istekte bozuk JSON 401 döner (500 ve ayrıştırma mesajı sızmaz)', async () => {
    const res = await post(istek({}, 'xyz'))
    expect(res.status).toBe(401)
    expect(JSON.stringify(await res.json())).not.toContain('JSON')
  })

  it('imzalı çağırana bozuk JSON 400 döner, iç mesaj yok', async () => {
    const res = await post(istek(imzali(SECRET, simdiSn(), 'xyz'), 'xyz'))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid JSON body' })
  })

  it('imzasız ve secret yok: 401', async () => {
    expect((await post(istek({}, govdeUret()))).status).toBe(401)
  })
})

/**
 * SABOTAJ KOLU — kapısız kopya. İmza doğrulaması her şeyi 'gecerli' sayan, bellek ve DB tekrar
 * korumaları hiçbir şeyi reddetmeyen bir rota kurulur ve RET_VAKALARI'nın HER BİRİ ona gönderilir.
 * Hepsi 200 alır: yani kapılı rotadaki 401 beklentileri kapı sökülünce kırmızıya döner.
 */
describe('SABOTAJ KOLU · kapısız kopyada ret vakaları GEÇER (vakalar ayırt edicidir)', () => {
  beforeEach(() => {
    ortamiKur()
    vi.doMock('@/lib/webhook/imza', async (orijinal) => ({
      ...(await orijinal<Record<string, unknown>>()),
      imzaDogrula: () => 'gecerli',
      imzaTekrariMi: () => false,
    }))
    vi.doMock('@/lib/webhook/olayTekil', async (orijinal) => ({
      ...(await orijinal<Record<string, unknown>>()),
      olayTuket: async () => 'yeni',
    }))
  })
  afterEach(() => {
    vi.doUnmock('@/lib/webhook/imza')
    vi.doUnmock('@/lib/webhook/olayTekil')
    process.env = { ...envOnce }
  })

  for (const v of RET_VAKALARI) {
    it(`kapısız kopya: ${v.ad} → 200 (kapılı rotada 401)`, async () => {
      const res = await v.kos()
      expect(res.status).toBe(200)
    })
  }
})

describe('imzaDogrula · saf birim', () => {
  const simdiMs = Date.now()
  const zaman = String(Math.floor(simdiMs / 1000))
  const GOVDE = govdeUret()

  it('imza başlığı yoksa imza-yok (rota bunu da 401 sayar)', () => {
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
    expect(imzaDogrula({ secrets: [], zamanSn: zaman, imza, hamGovde: GOVDE, simdiMs })).toBe('gecersiz')
  })

  it('SABOTAJ farklı uzunlukta imza fırlatmadan gecersiz döner', () => {
    expect(
      imzaDogrula({ secrets: [SECRET], zamanSn: zaman, imza: 'abc', hamGovde: GOVDE, simdiMs }),
    ).toBe('gecersiz')
  })
})

describe('olayTekil · birim (gerçek supabase-js istemcisi, sahte ağ)', () => {
  it('olayKimligi yalnız UUID biçimli event_id kabul eder', () => {
    const id = randomUUID()
    expect(olayKimligi({ event_id: id })).toBe(id)
    expect(olayKimligi({ event_id: 'abc' })).toBeNull()
    expect(olayKimligi({ event_id: 42 })).toBeNull()
    expect(olayKimligi({})).toBeNull()
    expect(olayKimligi(null)).toBeNull()
  })

  function istemci(yanit: () => Promise<Response>) {
    return createClient<Database>('http://localhost:54321', 'anon-test', {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'olay-test' },
      global: { fetch: () => yanit() },
    })
  }
  const json = (govde: unknown, status = 200) => async () =>
    new Response(JSON.stringify(govde), { status, headers: { 'content-type': 'application/json' } })
  const args = { zamanSn: '1', hamGovde: '{}', imza: 'x' }

  it('RPC sonuçları eşlenir; bilinmeyen sonuç, RPC hatası ve ağ düşmesi FAIL-CLOSED hata', async () => {
    expect(await olayTuket(istemci(json('yeni')), args)).toBe('yeni')
    expect(await olayTuket(istemci(json('tekrar')), args)).toBe('tekrar')
    expect(await olayTuket(istemci(json('gecersiz')), args)).toBe('reddedildi')
    expect(await olayTuket(istemci(json('bayat')), args)).toBe('reddedildi')
    expect(await olayTuket(istemci(json('yapilandirma')), args)).toBe('hata')
    expect(await olayTuket(istemci(json({ message: 'x', code: 'PGRST202' }, 404)), args)).toBe('hata')
    expect(
      await olayTuket(
        istemci(async () => {
          throw new Error('ağ yok')
        }),
        args,
      ),
    ).toBe('hata')
  })
})
