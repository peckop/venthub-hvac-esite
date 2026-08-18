import { beforeEach, describe, expect, it, vi } from 'vitest'

import { resolveFxLockFreeze } from '@/lib/services/fxLockAdmin.service'

/**
 * KUR KİLİDİ KARARI — [D] KURALININ KAPISI (FX-LOCK 2/2b).
 *
 * Kural: kapsamda tek alış para birimi varsa kur dondurulur, birden çoksa kayıt
 * REDDEDİLİR. Reddi kaldırırsanız kilit yine "çalışır" görünür ama ürünlerin bir
 * kısmı YANLIŞ kurdan donar ve bunu hiçbir ekran söylemez — sessiz para hatası.
 *
 * Bu dosya kararı MODAL'DAN BAĞIMSIZ ölçer: iddia render'a değil, karara bağlı.
 */

const { distinctMock, rateMock } = vi.hoisted(() => ({
  distinctMock: vi.fn(),
  rateMock: vi.fn(),
}))

vi.mock('@/lib/services/pricingAdmin.service', () => ({
  distinctPurchaseCurrenciesInScope: distinctMock,
}))
vi.mock('@/lib/services/fxRate.service', () => ({
  resolveFxRate: rateMock,
}))

/** Karar fonksiyonu istemciyi yalnız İLETİR; bu testte çağrılmaz. */
const supabase = {} as never
const TODAY = '2026-08-18'

beforeEach(() => {
  distinctMock.mockReset()
  rateMock.mockReset()
})

describe('resolveFxLockFreeze', () => {
  it('kapsamda ürün yoksa REDDEDER (kilitlenecek bir şey yok)', async () => {
    distinctMock.mockResolvedValue([])
    const decision = await resolveFxLockFreeze(supabase, 4, null, TODAY)
    expect(decision).toEqual({ kind: 'noProducts' })
    // Kur çözücüsü BOŞUNA çağrılmamalı: karar zaten verilmiştir.
    expect(rateMock).not.toHaveBeenCalled()
  })

  it('İKİ para birimi varsa REDDEDER ve ikisini de listeler (ASIL ASSERT)', async () => {
    distinctMock.mockResolvedValue(['EUR', 'USD'])
    const decision = await resolveFxLockFreeze(supabase, 2, 'brand-1', TODAY)
    expect(decision).toEqual({ kind: 'multiCurrency', currencies: ['EUR', 'USD'] })
    // Reddedilen kapsamda kur çözmek anlamsız; çözülseydi "bir kuru" seçmiş olurduk.
    expect(rateMock).not.toHaveBeenCalled()
  })

  it('tek para birimi + kur VARSA dondurulacak kuru döndürür', async () => {
    distinctMock.mockResolvedValue(['EUR'])
    rateMock.mockResolvedValue({ rate: 47.25, effectiveDate: '2026-08-17' })

    const decision = await resolveFxLockFreeze(supabase, 3, 'cat-1', TODAY)

    expect(decision).toEqual({
      kind: 'ok',
      currency: 'EUR',
      rate: 47.25,
      effectiveDate: '2026-08-17',
    })
    // Kur TEK ÇÖZÜCÜDEN gelir (INV-PRICE-8): ikinci bir kur kopyası doğmaz.
    expect(rateMock).toHaveBeenCalledWith(supabase, 'EUR', TODAY)
  })

  it('tek para birimi ama kur YOKSA reddeder — künyesiz kilit yazılmaz', async () => {
    distinctMock.mockResolvedValue(['SEK'])
    rateMock.mockResolvedValue(null)

    const decision = await resolveFxLockFreeze(supabase, 4, null, TODAY)

    // DB CHECK zaten reddederdi; buradaki ret ADI OLAN bir rettir, ham DB hatası değil.
    expect(decision).toEqual({ kind: 'rateUnavailable', currency: 'SEK' })
  })

  it('kapsam ve hedef yardımcıya OLDUĞU GİBİ geçilir (fakir argüman kapısı)', async () => {
    distinctMock.mockResolvedValue(['USD'])
    rateMock.mockResolvedValue({ rate: 41, effectiveDate: TODAY })

    await resolveFxLockFreeze(supabase, 2, 'brand-42', TODAY)

    // "Çağrı var" yetmez: yanlış/eksik argümanla çağrılırsa kapsam 2-3 hiç eşleşmez
    // ve kapsam sessizce BOŞ görünür — kilit "ürün yok" diye reddedilirdi.
    expect(distinctMock).toHaveBeenCalledWith(supabase, 2, 'brand-42')
  })

  it('TRY tek para birimiyse kilit KABUL edilir (kur 1, no-op ama tutarlı)', async () => {
    distinctMock.mockResolvedValue(['TRY'])
    rateMock.mockResolvedValue({ rate: 1, effectiveDate: TODAY })

    const decision = await resolveFxLockFreeze(supabase, 4, null, TODAY)

    expect(decision).toEqual({ kind: 'ok', currency: 'TRY', rate: 1, effectiveDate: TODAY })
  })
})
