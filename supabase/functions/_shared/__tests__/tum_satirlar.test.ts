import { describe, expect, it } from 'vitest'

import { type FetchBenzeri, restSayfaOkuyucu, supabaseSayfaOkuyucu, tumSatirlar } from '../tum_satirlar'

/**
 * INV-EDGE-SAYFALAMA — `_shared/tum_satirlar.ts` sözleşmesinin kilidi.
 *
 * KAPATILAN SINIF: PostgREST'in sessiz 1000 satır tavanı. Kusur veri büyüyünce doğar,
 * kod değişmeden; çıktı 200 ve "ok" olduğu için hiçbir alarm çalmaz.
 *
 * ⭐STUB GERÇEĞİ TAKLİT ETMEZSE TEST KÖRDÜR (2026-09-07'de aynı gün ölçülen ders):
 * `Range` isteği okunmaz ve `Content-Range` dönülmezse paket yeşil yanar ama sayfalamayı
 * HİÇ ölçmemiş olur. Aşağıdaki sahte sunucu bu yüzden Range'i OKUR, dilimi kendi tavanıyla
 * KESER ve Content-Range döner — gerçek sunucunun ayırt edici davranışını taşır.
 */

/** Range/Content-Range semantiğini taşıyan sahte PostgREST. */
function sahteSunucu(toplam: number, opts: { contentRangeVer?: boolean; tavan?: number } = {}) {
  const contentRangeVer = opts.contentRangeVer !== false
  const tavan = opts.tavan ?? 1000
  const cagrilar: Array<[number, number]> = []
  const fetchFn: FetchBenzeri = async (_url, init) => {
    const range = init?.headers?.Range ?? '0-999'
    const [basS, sonS] = range.split('-')
    const bas = Number(basS)
    // Sunucu, istenen aralığı KENDİ tavanıyla kısıtlar — gerçekteki davranış budur.
    const son = Math.min(Number(sonS), bas + tavan - 1)
    cagrilar.push([bas, son])
    const uzunluk = Math.max(0, Math.min(son, toplam - 1) - bas + 1)
    const dilim = Array.from({ length: uzunluk }, (_, i) => ({ id: bas + i }))
    return {
      ok: true,
      status: 200,
      json: async () => dilim,
      text: async () => '',
      headers: {
        get: (ad: string) =>
          ad.toLowerCase() === 'content-range' && contentRangeVer ? `${bas}-${bas + dilim.length - 1}/${toplam}` : null,
      },
    }
  }
  return { fetchFn, cagrilar }
}

describe('INV-EDGE-SAYFALAMA: önce SAY, sonra TOPLA, sonunda KARŞILAŞTIR', () => {
  it('tavanın ALTINDA: tek sayfa, tek istek', async () => {
    const { fetchFn, cagrilar } = sahteSunucu(375)
    const satirlar = await tumSatirlar(restSayfaOkuyucu<{ id: number }>('u', {}, fetchFn), { ad: 'products' })
    expect(satirlar).toHaveLength(375)
    expect(cagrilar).toHaveLength(1)
  })

  it('⭐TAVANIN ÜSTÜNDE: 2500 satır TAMAMEN gelir (eski kod 1000 verirdi)', async () => {
    const { fetchFn, cagrilar } = sahteSunucu(2500)
    const satirlar = await tumSatirlar(restSayfaOkuyucu<{ id: number }>('u', {}, fetchFn), { ad: 'products' })
    expect(satirlar, 'sessiz tavan hâlâ kesiyor').toHaveLength(2500)
    // Ayırt edici ölçüt: birden çok istek yapılmış OLMALI. Tek istekte 2500 satır gelmesi,
    // sahte sunucunun tavanı taklit etmediğini ve testin kör olduğunu gösterir.
    expect(cagrilar.length, 'tek istekle 2500 satır "geldi" — sahte sunucu tavanı taklit etmiyor, test kör').toBeGreaterThan(1)
    expect(new Set(satirlar.map((s) => s.id)).size, 'aynı sayfa iki kez toplandı').toBe(2500)
  })

  it('⛔TOPLAM OKUNAMAZSA FIRLATIR ("ölçemedim" ≠ "hepsini aldım")', async () => {
    const { fetchFn } = sahteSunucu(2500, { contentRangeVer: false })
    await expect(tumSatirlar(restSayfaOkuyucu('u', {}, fetchFn), { ad: 'products' })).rejects.toThrow(/OKUNAMADI/)
  })

  it('⛔ÜST SINIR AŞILIRSA FIRLATIR, sessizce KESMEZ', async () => {
    const { fetchFn } = sahteSunucu(5000)
    await expect(tumSatirlar(restSayfaOkuyucu('u', {}, fetchFn), { ad: 'products', enFazla: 2000 })).rejects.toThrow(
      /ust sinir|Sessizce KESMIYORUM/,
    )
  })

  it('⛔EKSİK TOPLANIRSA FIRLATIR (sunucu boş sayfa dönse bile sessiz kalmaz)', async () => {
    // Sunucu 3000 diyor ama yalnız ilk sayfayı veriyor: klasik "başarılı görünen eksik iş".
    let cagri = 0
    const fetchFn: FetchBenzeri = async () => {
      cagri++
      const dilim = cagri === 1 ? Array.from({ length: 1000 }, (_, i) => ({ id: i })) : []
      return {
        ok: true,
        status: 200,
        json: async () => dilim,
        text: async () => '',
        headers: { get: (a: string) => (a.toLowerCase() === 'content-range' ? '0-999/3000' : null) },
      }
    }
    await expect(tumSatirlar(restSayfaOkuyucu('u', {}, fetchFn), { ad: 'products' })).rejects.toThrow(/3000 satir bildirdi/)
  })

  it('REST hata durumunu YUTMAZ', async () => {
    const fetchFn: FetchBenzeri = async () => ({
      ok: false,
      status: 503,
      json: async () => [],
      text: async () => 'gecici hata',
      headers: { get: () => null },
    })
    await expect(tumSatirlar(restSayfaOkuyucu('u', {}, fetchFn))).rejects.toThrow(/503/)
  })

  it('supabase-js okuyucusu: count SELECT çağrısına verilir ve range uygulanır', async () => {
    const gorulen: Array<{ secenek: unknown; aralik: [number, number] }> = []
    const oku = supabaseSayfaOkuyucu<{ id: number }>((secenek) => ({
      range: async (bas: number, son: number) => {
        gorulen.push({ secenek, aralik: [bas, son] })
        const toplam = 1200
        const uzunluk = Math.max(0, Math.min(son, toplam - 1) - bas + 1)
        const dilim = Array.from({ length: uzunluk }, (_, i) => ({ id: bas + i }))
        return { data: dilim, count: toplam, error: null }
      },
    }))
    const satirlar = await tumSatirlar(oku, { ad: 'products' })
    expect(satirlar).toHaveLength(1200)
    expect(gorulen[0].secenek, 'count seçeneği select çağrısına gitmedi — filtre zincirinin sonunda yutulur').toEqual({
      count: 'exact',
    })
    expect(gorulen).toHaveLength(2)
  })

  it('supabase-js: count null dönerse FIRLATIR', async () => {
    const oku = supabaseSayfaOkuyucu(() => ({
      range: async () => ({ data: [{ id: 1 }], count: null, error: null }),
    }))
    await expect(tumSatirlar(oku, { ad: 'products' })).rejects.toThrow(/OKUNAMADI/)
  })
})
