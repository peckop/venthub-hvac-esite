/**
 * URN-127 — sihirbaz aday servisi, eğrinin KAYNAK etiketini adaya taşır (karar 320/348).
 *
 * `technical_specs.pq_curve_kaynak` okunmazsa sihirbaz kartı, grafikten okunmuş 6 noktalı eğriyi
 * etiketsiz (notsuz) gösterir ve hiçbir tip hatası görmez: alan opsiyoneldir. Bu test sorguyu
 * gerçek supabase-js istemcisi + sahte `fetch` ile (repo deseni: family.service.slugs.test.ts) çözer ve
 * adaya geçen değeri ölçer.
 */
import { createClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import { egriNotuTuru } from '@/lib/hvac/ductFanSelection'
import type { Database } from '@/types/database.types'

import { getWizardCandidates } from '../wizard.service'

const ALTI_NOKTA = '[[0, 210.9], [100, 190], [255, 105.5], [380, 55], [450, 25], [510, 0]]'

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function istemci(urunler: unknown[]) {
  const fakeFetch: typeof fetch = async (input) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    if (url.includes('/rest/v1/product_families')) return jsonResponse([{ id: 'fam-1' }])
    if (url.includes('/rest/v1/products')) return jsonResponse(urunler)
    return jsonResponse([])
  }
  return createClient<Database>('http://localhost:54321', 'anon-test-key', {
    global: { fetch: fakeFetch },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

const satir = (id: string, specs: Record<string, unknown> | null) => ({
  id,
  sku: `SKU-${id}`,
  name: `Model ${id}`,
  slug: `model-${id}`,
  technical_specs: specs,
})

describe('getWizardCandidates — pq_curve_kaynak adaya aktarılır (URN-127)', () => {
  it('kaynak etiketi pqCurveKaynak olarak taşınır; etiketsiz ürün null alır', async () => {
    const adaylar = await getWizardCandidates(
      istemci([
        satir('a', { pq_curve: ALTI_NOKTA, pq_curve_kaynak: 'kitapcik_grafik', max_delivery_m3h: 510 }),
        satir('b', { pq_curve: ALTI_NOKTA, max_delivery_m3h: 510 }),
        satir('c', null),
      ]),
      'vortice-lineo-quiet',
    )

    expect(adaylar.map((a) => a.id)).toEqual(['a', 'b', 'c'])
    expect(adaylar[0].pqCurveKaynak).toBe('kitapcik_grafik')
    expect(adaylar[1].pqCurveKaynak).toBeNull()
    expect(adaylar[2].pqCurveKaynak).toBeNull()
  })

  it('uçtan uca: aktarılan etiket eğri notunu değiştirir (aynı eğri, etiketli → grafikten okundu, etiketsiz → not yok)', async () => {
    const [etiketli, etiketsiz] = await getWizardCandidates(
      istemci([
        satir('a', { pq_curve: ALTI_NOKTA, pq_curve_kaynak: 'kitapcik_grafik' }),
        satir('b', { pq_curve: ALTI_NOKTA }),
      ]),
      'vortice-lineo-quiet',
    )
    expect(egriNotuTuru(etiketli.pqCurveHam, etiketli.pqCurveKaynak)).toBe('grafikten-okundu')
    expect(egriNotuTuru(etiketsiz.pqCurveHam, etiketsiz.pqCurveKaynak)).toBeNull()
  })
})
