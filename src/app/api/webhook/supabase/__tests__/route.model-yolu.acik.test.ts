import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { yayindaListesiAyarla } from '@/config/__tests__/yayindaTestKiti'

/**
 * INV-WEBHOOK-MODEL-YOLU-1 (açık kip) — adres şeması bayrağı AÇIKKEN (`ADRES_SEMASI_K3B = true`) webhook'un
 * tazelediği model yolu, sitenin o anda SERVİS ETTİĞİ model adresidir: `adresUret` varsayılan bayrakla ürettiği
 * adres ile birebir aynı. Kapalı kipin karşılığı `route.model-yolu.test.ts`. Webhook bayrağı OKUMAZ (yollar iki
 * şemada üretilir: derleme sabiti, açılış anında önceki derlemenin önbelleği ve geri alma da güvenli kalır).
 */
const revalidatePathMock = vi.fn()

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
}))

vi.mock('@/config/features', async (orijinal) => ({ ...(await orijinal<Record<string, unknown>>()), ADRES_SEMASI_K3B: true }))
vi.mock('@/config/yayindaModeller', async () => (await import('@/config/__tests__/yayindaTestKiti')).sahteYayindaModulu())

vi.mock('@/lib/supabase/static', () => ({
  supabaseStaticClient: {
    from: () => {
      const builder = {
        select: () => builder,
        eq: () => builder,
        is: () => builder,
        single: async () => ({ data: null, error: null }),
        then: (resolve: (v: { data: unknown }) => unknown) => resolve({ data: [] }),
      }
      return builder
    },
  },
}))

const WEBHOOK_SECRET = 'test-webhook-secret-mock'

async function urunGuncelle(record: Record<string, unknown>) {
  const { POST } = await import('../route')
  const res = await POST(
    new NextRequest('http://localhost/api/webhook/supabase', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-webhook-secret': WEBHOOK_SECRET },
      body: JSON.stringify({ type: 'UPDATE', table: 'products', schema: 'public', record, old_record: null }),
    })
  )
  return (await res.json()) as { revalidatedPaths: string[] }
}

describe('INV-WEBHOOK-MODEL-YOLU-1 — açık kip: tazelenen yol sitenin servis ettiği model adresi', () => {
  const originalSecret = process.env.SUPABASE_WEBHOOK_SECRET

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('SUPABASE_WEBHOOK_SECRET', WEBHOOK_SECRET)
    yayindaListesiAyarla({ modeller: { 'aile-a': ['AAA-100'] } })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    if (originalSecret === undefined) delete process.env.SUPABASE_WEBHOOK_SECRET
    else process.env.SUPABASE_WEBHOOK_SECRET = originalSecret
  })

  it('bayrak AÇIK: model yolu, bayraksız (varsayılan) adresUret çıktısıyla aynı; TR + EN', async () => {
    const { adresUret } = await import('@/utils/adresUret')
    const json = await urunGuncelle({ id: 'p1', sku: 'AAA-100' })
    for (const dil of ['tr', 'en'] as const) {
      const servisEdilen = String(adresUret({ tur: 'model', aileSlug: 'aile-a', sku: 'AAA-100' }, dil))
      // Model adresi (…-p-<sku>) ve sorgusuz: bayrak açıkken varsayılan adresUret model sayfasının kendisini verir.
      expect(servisEdilen).toMatch(/-p-aaa-100$/)
      expect(servisEdilen).not.toContain('?')
      expect(json.revalidatedPaths).toContain(servisEdilen)
      expect(revalidatePathMock).toHaveBeenCalledWith(servisEdilen)
    }
  })

  it('bayrak AÇIK, liste dışı SKU → model yolu yok (liste dışı SKU sayfasız: aile ?sku= seçimi)', async () => {
    const json = await urunGuncelle({ id: 'p1', sku: 'ZZZ-999' })
    expect(json.revalidatedPaths.filter((p) => p.includes('zzz-999') || p.includes('ZZZ-999'))).toEqual([])
  })
})
