import { createClient } from '@supabase/supabase-js'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Database } from '../../../types/database.types'
import { getBrandFamilyCount } from '../../services/family.service'
import { markaUrunsuzMu, urunsuzMarkaSluglari, urunsuzMu } from '../markaUrunDurumu'

/**
 * INV-MARKA-URUN-DURUMU-1 (OPS-51) — "ürünsüz marka" kararı DB'deki aktif ürün sayısından türer; tek eşik, tek HATA YOLU.
 *
 * Marka sayfası üst verisi, gövdesi ve site haritası aynı yardımcıdan karar verir (`markaKaynagi.test.ts` tek-nokta
 * bekçisi). Bu dosya yardımcının kendi davranışını ve sayım servisini ölçer: eşik, geçersiz sayı, sayaç hatası
 * (gerçek DB'de FIRLAR, yalnız `dummy.supabase.co` CI derlemesinde "ürünlü" sayılır), RPC sözleşmesi.
 */
afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('urunsuzMu: tek eşik', () => {
  it('0 → ürünsüz; ≥1 → ürünlü', () => {
    expect(urunsuzMu(0)).toBe(true)
    expect(urunsuzMu(1)).toBe(false)
    expect(urunsuzMu(53)).toBe(false)
  })

  it.each([Number.NaN, -1, 1.5, Number.POSITIVE_INFINITY])('geçersiz sayı (%s) karar yerine HATA üretir (NaN yanlışlıkla "ürünsüz" yazmaz)', (sayi) => {
    expect(() => urunsuzMu(sayi)).toThrow(/geçersiz aktif ürün sayısı/)
  })
})

describe('markaUrunsuzMu: HATA YOLU', () => {
  const dusenSayac = async (): Promise<number> => {
    throw new Error('ağ yok')
  }

  it('sayaç hata verirse (gerçek veritabanı) karar FIRLATIR — "ürünsüz" de "ürünlü" de varsayılmaz', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://gercek.supabase.co')
    await expect(markaUrunsuzMu('Flexiva', dusenSayac)).rejects.toThrow('ağ yok')
  })

  it('sayaç geçersiz sayı dönerse (NaN) gerçek veritabanında FIRLATIR', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://gercek.supabase.co')
    await expect(markaUrunsuzMu('Flexiva', async () => Number.NaN)).rejects.toThrow(/geçersiz/)
  })

  it('boş / tanımsız / kaçak adres sahte sayılmaz: hata gevşek kola GİRMEZ (xdummy, boş, sonu eğik çizgili)', async () => {
    for (const adres of ['https://xdummy.supabase.co', '', 'https://dummy.supabase.co/']) {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', adres)
      await expect(markaUrunsuzMu('Flexiva', dusenSayac), `adres: "${adres}"`).rejects.toThrow('ağ yok')
    }
  })

  it('YALNIZ sahte-veritabanlı CI derlemesinde (dummy.supabase.co) hata "ürünlü" sayılır ve uyarı basılır (build düşmez)', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://dummy.supabase.co')
    const uyari = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await expect(markaUrunsuzMu('Flexiva', dusenSayac)).resolves.toBe(false)
    expect(uyari).toHaveBeenCalled()
  })

  it('sayaç sayıyı dönerse hatasız karar: 0 → true, 4 → false (marka adı sayaca olduğu gibi geçer)', async () => {
    const gorulen: string[] = []
    const sayac = (n: number) => async (ad: string) => {
      gorulen.push(ad)
      return n
    }
    expect(await markaUrunsuzMu('Flexiva', sayac(0))).toBe(true)
    expect(await markaUrunsuzMu('Flexiva', sayac(4))).toBe(false)
    expect(gorulen).toEqual(['Flexiva', 'Flexiva'])
  })
})

describe('urunsuzMarkaSluglari: site haritası girdisi', () => {
  const markalar = [
    { name: 'Casals', slug: 'casals' },
    { name: 'Flexiva', slug: 'flexiva' },
    { name: 'Nicotra Gebhardt', slug: 'nicotra-gebhardt' },
  ]

  it('yalnız sayısı 0 olan marka kümeye girer; sayı değişince AYNI marka kümeden çıkar', async () => {
    const tablo: Record<string, number> = { Casals: 53, Flexiva: 0, 'Nicotra Gebhardt': 35 }
    const sayac = async (ad: string) => tablo[ad]
    expect([...(await urunsuzMarkaSluglari(markalar, sayac))]).toEqual(['flexiva'])
    tablo.Flexiva = 4
    expect([...(await urunsuzMarkaSluglari(markalar, sayac))]).toEqual([])
  })

  it('tek marka sayımı düşerse TÜM karar fırlar (kısmi harita üretilmez)', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://gercek.supabase.co')
    const sayac = async (ad: string) => {
      if (ad === 'Flexiva') throw new Error('rpc düştü')
      return 5
    }
    await expect(urunsuzMarkaSluglari(markalar, sayac)).rejects.toThrow('rpc düştü')
  })
})

describe('getBrandFamilyCount: sayım servisi sözleşmesi', () => {
  /** Gerçek istemci üzerine yalnız `rpc` sahte yanıtla bindirilir (ağ yok; tür dökümü yok). */
  function istemci(yanit: { data: unknown; error: unknown }) {
    const cagrilar: { ad: string; args: Record<string, unknown> }[] = []
    const sahte = Object.assign(createClient<Database>('https://gercek.supabase.co', 'anahtar'), {
      rpc: async (ad: string, args: Record<string, unknown>) => {
        cagrilar.push({ ad, args })
        return yanit
      },
    })
    return { sahte, cagrilar }
  }

  it('aile RPC\'sini marka adı + limit 1 ile çağırır ve window sayımı (total_count) döner', async () => {
    const { sahte, cagrilar } = istemci({ data: [{ id: 'f1', total_count: 4 }], error: null })
    await expect(getBrandFamilyCount(sahte, 'Flexiva')).resolves.toBe(4)
    expect(cagrilar).toEqual([{ ad: 'get_product_families_enriched', args: { p_limit: 1, p_offset: 0, p_brand: 'Flexiva' } }])
  })

  it('bigint metin olarak gelirse de sayıya çevrilir', async () => {
    const { sahte } = istemci({ data: [{ id: 'f1', total_count: '7' }], error: null })
    await expect(getBrandFamilyCount(sahte, 'Casals')).resolves.toBe(7)
  })

  it('satır yok (marka ürünsüz) → 0', async () => {
    const { sahte } = istemci({ data: [], error: null })
    await expect(getBrandFamilyCount(sahte, 'Flexiva')).resolves.toBe(0)
    const { sahte: bos } = istemci({ data: null, error: null })
    await expect(getBrandFamilyCount(bos, 'Flexiva')).resolves.toBe(0)
  })

  it('RPC hatası FIRLATILIR (sıfıra çevrilmez: yanlış "ürünsüz" kararı noindex yazardı)', async () => {
    const { sahte } = istemci({ data: null, error: new Error('statement timeout') })
    await expect(getBrandFamilyCount(sahte, 'Flexiva')).rejects.toThrow('statement timeout')
  })

  it('satır var ama total_count okunamıyorsa FIRLATILIR (yine sıfır varsayılmaz)', async () => {
    const { sahte } = istemci({ data: [{ id: 'f1' }], error: null })
    await expect(getBrandFamilyCount(sahte, 'Flexiva')).rejects.toThrow(/total_count okunamadı/)
  })
})
