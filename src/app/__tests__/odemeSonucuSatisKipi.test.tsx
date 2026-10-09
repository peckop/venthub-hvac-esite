// URN-83 — sipariş sonucu ekranı (/payment-success) SATIŞ KİPİNE bağlı.
//
// ÖLÇÜLEN KUSUR: `/tr/payment-success?status=success` adresi elle açılınca, hiçbir doğrulama yapılmadan
// "Siparişiniz Tamamlandı!" + `DEMO-ORDER` basılıyor ve sepet (bellekte + yerel depoda) siliniyordu.
// Satış kipi kapalıyken sipariş alınamaz; ekran olmayan bir siparişi var gösteriyordu.
//
// KAPI: checkout ile aynı mekanizma — RSC sayfa `satisKipiOku()` + `odemeKarari()` okur. Kapalıyken sonuç
// bileşeni HİÇ KURULMAZ (doğrulama, sepet temizleme ve yerel depo yazımı da çalışmaz); yerine ödeme
// sayfasının kapalı-kip kartı (`OdemeKapaliBilgi`) çizilir. Açıkken eski davranış aynen kalır.
//
// `odemeKarari` GERÇEK çalışır; yalnız satıcı alanlarını dolduran bir yasal ayar enjekte edilir (gerçek ayar
// bugün yer tutuculu, yani anahtar açık olsa bile ödeme kapalı: o dal INV-SATIS-KIPI-6'da ölçülür).
import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { satisKipiOku } from '../../lib/kip/satisKipi'
import Page from '../[lang]/payment-success/page'

vi.mock('../../lib/kip/satisKipi', () => ({ satisKipiOku: vi.fn() }))

vi.mock('../../config/legal', async (importOriginal) => {
  const gercek = await importOriginal<typeof import('../../config/legal')>()
  const dolu: Record<string, unknown> = { ...gercek.default }
  for (const alan of gercek.SATIS_ICIN_ZORUNLU_SATICI_ALANLARI) dolu[alan] = `Dolu ${alan}`
  return { ...gercek, default: dolu }
})

const sorguParams = new URLSearchParams({ status: 'success', orderId: 'ord-1' })
vi.mock('next/navigation', () => ({ useSearchParams: () => sorguParams }))

vi.mock('../../i18n/I18nProvider', () => ({
  useI18n: () => ({ lang: 'tr', t: (k: string) => k }),
}))

const sepetiTemizle = vi.fn()
vi.mock('../../hooks/useCartHook', () => ({ useCart: () => ({ clearCart: sepetiTemizle }) }))

vi.mock('../../hooks/useLocalizedRoutes', () => ({
  useLocalizedRoutes: () => ({
    home: () => '/tr',
    checkout: () => '/tr/odeme',
    cart: () => '/tr/sepet',
    account: { orders: () => '/tr/hesabim/siparisler', orderDetail: (id: string) => `/tr/hesabim/siparisler/${id}` },
  }),
}))

vi.mock('@/lib/supabase/client', () => ({
  supabaseBrowserClient: {
    functions: { invoke: vi.fn() },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: null, error: null })) })) })),
    })),
  },
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('../../lib/errorReporter', () => ({ reportError: vi.fn() }))

const KAPALI = { acik: false, damga: null, kaynak: 'kapali-varsayilan' } as const
const ACIK = { acik: true, damga: null, kaynak: 'db' } as const

const SEPET_ANAHTARI = 'venthub-cart'

async function sayfayiCiz() {
  const arayuz = await Page()
  render(arayuz)
  // Sonuç bileşeni kurulduysa `verify()` etkisi burada çalışır; kurulmadıysa hiçbir şey olmaz.
  await act(async () => {
    await new Promise((cozum) => setTimeout(cozum, 0))
  })
}

describe('/payment-success — satış kipi kapısı (URN-83)', () => {
  beforeEach(() => {
    sepetiTemizle.mockClear()
    vi.mocked(satisKipiOku).mockReset()
    localStorage.clear()
    localStorage.setItem(SEPET_ANAHTARI, JSON.stringify([{ sku: 'X', qty: 1 }]))
  })

  it('kip KAPALI: "Siparişiniz Tamamlandı" ekranı BASILMAZ, kapalı-kip kartı çıkar', async () => {
    vi.mocked(satisKipiOku).mockResolvedValue(KAPALI)
    await sayfayiCiz()

    expect(screen.queryByText('payment.orderCompletedTitle')).toBeNull()
    expect(screen.queryByText('DEMO-ORDER')).toBeNull()
    // Pozitif kontrol: ekran boş değil, ödeme sayfasının kapalı-kip kartı çiziliyor (sahte-yeşil muhafızı).
    expect(screen.getByText('checkout.kapali.baslik')).toBeInTheDocument()
  })

  it('kip KAPALI: sepet SİLİNMEZ — temizleme çağrısı yok, yerel depodaki sepet duruyor', async () => {
    vi.mocked(satisKipiOku).mockResolvedValue(KAPALI)
    await sayfayiCiz()

    expect(sepetiTemizle).not.toHaveBeenCalled()
    expect(localStorage.getItem(SEPET_ANAHTARI)).not.toBeNull()
    expect(localStorage.getItem('vh_last_order_status')).toBeNull()
  })

  it('kip AÇIK: eski davranış aynen kalır — sonuç ekranı çıkar, sepet temizlenir', async () => {
    vi.mocked(satisKipiOku).mockResolvedValue(ACIK)
    await sayfayiCiz()

    await waitFor(() => {
      expect(screen.getByText('payment.orderCompletedTitle')).toBeInTheDocument()
    })
    expect(sepetiTemizle).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(SEPET_ANAHTARI)).toBeNull()
    expect(localStorage.getItem('vh_last_order_status')).toBe('success')
    expect(screen.queryByText('checkout.kapali.baslik')).toBeNull()
  })
})
