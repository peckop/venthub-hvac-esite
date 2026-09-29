import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import type { Database } from '../../../types/database.types'
import { FAMILY_RPC_ESZAMANLI, getFamiliesEnriched } from '../family.service'

/**
 * INV-FAMILY-RPC-ESZAMANLI-1 — `get_product_families_enriched` çağrıları süreç içinde SIRAYA alınır.
 *
 * NİÇİN (ALTYAPI ölçümü 2026-09-29): RPC çağrı başına ~14.185 tampon okur (tek başına 77 ms); build
 * ≈ 52 çağrıyı eşzamanlı yapınca anon 3 sn `statement_timeout`'a düşüyordu. Kapı ÜÇ şey tutar:
 *  (1) TEPE eşzamanlılık `FAMILY_RPC_ESZAMANLI`'yı aşmaz (sayaç `rpc` içinde ölçülür),
 *  (2) çağrı SAYISI ve sonuçlar değişmez (hiçbiri kaybolmaz, çift çağrı yok),
 *  (3) hata slotu BIRAKIR — bir çağrı düşerse kuyruk kilitlenmez, sonrakiler çalışır.
 */
function sahteIstemci(davranis: (n: number) => { data: unknown; error: unknown } | Promise<never>) {
  const durum = { cagri: 0, sirada: 0, tepe: 0 }
  const istemci = {
    rpc: async (ad: string) => {
      if (ad !== 'get_product_families_enriched') return { data: [], error: null }
      const n = ++durum.cagri
      durum.sirada++
      durum.tepe = Math.max(durum.tepe, durum.sirada)
      try {
        await new Promise((r) => setTimeout(r, 5))
        return await davranis(n)
      } finally {
        durum.sirada--
      }
    },
    // Ad çevirileri yalnız dolu listede sorulur; bu testte listeler boş.
    from: () => ({ select: () => ({ in: async () => ({ data: [], error: null }) }) }),
  }
  return { istemci: istemci as unknown as SupabaseClient<Database>, durum }
}

describe('INV-FAMILY-RPC-ESZAMANLI-1', () => {
  it('sınır 1: eşzamanlı çağrı sayısı ne olursa olsun tepe eşzamanlılık sınırı aşmaz', async () => {
    const { istemci, durum } = sahteIstemci(() => ({ data: [], error: null }))
    const sonuclar = await Promise.all(Array.from({ length: 12 }, (_, i) => getFamiliesEnriched(istemci, { limit: i + 1 })))
    expect(sonuclar).toHaveLength(12)
    expect(durum.cagri).toBe(12) // çağrı SAYISI değişmedi, hiçbiri kaybolmadı
    expect(durum.tepe).toBeLessThanOrEqual(FAMILY_RPC_ESZAMANLI)
  })

  it('sıra KORUNUR: her çağrı kendi sonucunu alır (araya girme yok)', async () => {
    const { istemci } = sahteIstemci((n) => ({ data: [{ id: `f${n}`, slug: `s${n}`, total_count: 1 }], error: null }))
    const sonuc = await Promise.all([1, 2, 3].map(() => getFamiliesEnriched(istemci)))
    expect(sonuc.map((s) => s.items[0]?.slug)).toEqual(['s1', 's2', 's3'])
  })

  it('HATA slotu bırakır: ilk çağrı düşerse sonrakiler yine çalışır (kuyruk kilitlenmez)', async () => {
    const { istemci, durum } = sahteIstemci((n) => (n === 1 ? { data: null, error: new Error('timeout') } : { data: [], error: null }))
    const [ilk, ...gerisi] = await Promise.allSettled([1, 2, 3, 4].map(() => getFamiliesEnriched(istemci)))
    expect(ilk.status).toBe('rejected')
    expect(gerisi.map((s) => s.status)).toEqual(['fulfilled', 'fulfilled', 'fulfilled'])
    expect(durum.tepe).toBeLessThanOrEqual(FAMILY_RPC_ESZAMANLI)
  })

  it('RPC fırlatırsa (reject) da slot bırakılır', async () => {
    const { istemci } = sahteIstemci((n) => {
      if (n === 1) return Promise.reject(new Error('ağ koptu'))
      return { data: [], error: null }
    })
    const sonuc = await Promise.allSettled([1, 2, 3].map(() => getFamiliesEnriched(istemci)))
    expect(sonuc.map((s) => s.status)).toEqual(['rejected', 'fulfilled', 'fulfilled'])
  })
})
