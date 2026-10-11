// URN-83 — sipariş sonucu ekranı (/payment-success): doğrulamasız "Siparişiniz Tamamlandı" basılmaz.
//
// ÖLÇÜLEN KUSUR: `/tr/payment-success?status=success` adresi elle açılınca, hiçbir doğrulama yapılmadan
// "Siparişiniz Tamamlandı!" + `DEMO-ORDER` basılıyor ve sepet (bellekte + yerel depoda) siliniyordu.
// Sebep iki katmanlıydı:
//   (1) SATIŞ KİPİ: kip kapalıyken sipariş alınamaz, ama ekran olmayan bir siparişi var gösteriyordu.
//   (2) DOĞRULAMA: kip açıkken bile `status=success` URL parametresi TEK BAŞINA kanıt sayılıyordu; sipariş
//       kimliği olmayan ya da veritabanında ödenmiş görünmeyen bir adres de aynı ekranı basıyordu.
//
// KAPI 1 (kip): RSC sayfa `satisKipiOku()` + `odemeKarari()` okur (checkout ile aynı karar). Kapalıyken sonuç
// bileşeni HİÇ KURULMAZ — doğrulama, sepet temizleme ve yerel depo yazımı da çalışmaz; yerine ödeme sayfasının
// kapalı-kip kartı (`OdemeKapaliBilgi`) çizilir.
// KAPI 2 (doğrulama): kip açıkken `status=success` yalnız sipariş kimliği VAR ve sipariş veritabanında ödenmiş
// görünüyorsa başarı basar. Aksi hâlde başarı ekranı, sipariş numarası ve sepet temizliği çıkmaz.
//
// ⛔NE ÖLÇMEZ: gerçek Supabase'i (istemci sahte); iyzico-callback'in sunucu tarafı doğrulamasını; RLS'nin
// ziyaretçiye kendi siparişini okutup okutmadığını (o `useCheckoutPayment` yoklamasının aynı okumasıdır).
//
// `odemeKarari` GERÇEK çalışır; yalnız satıcı alanlarını dolduran bir yasal ayar enjekte edilir (gerçek ayar
// bugün yer tutuculu, yani anahtar açık olsa bile ödeme kapalı: o dal INV-SATIS-KIPI-6'da ölçülür).
import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { satisKipiOku } from '../../lib/kip/satisKipi'
import Page from '../[lang]/payment-success/page'

const { siparisSatiri, callbackCagrisi } = vi.hoisted(() => ({
  siparisSatiri: vi.fn(),
  callbackCagrisi: vi.fn(),
}))

vi.mock('../../lib/kip/satisKipi', () => ({ satisKipiOku: vi.fn() }))

vi.mock('../../config/legal', async (importOriginal) => {
  const gercek = await importOriginal<typeof import('../../config/legal')>()
  const dolu: Record<string, unknown> = { ...gercek.default }
  for (const alan of gercek.SATIS_ICIN_ZORUNLU_SATICI_ALANLARI) dolu[alan] = `Dolu ${alan}`
  return { ...gercek, default: dolu }
})

let sorguParams = new URLSearchParams()
vi.mock('next/navigation', () => ({ useSearchParams: () => sorguParams }))

// `t` KARARLI olmalı: kimliği her çizimde değişirse etki yeniden koşar ve doğrulama birden çok kez tetiklenirdi.
const cevir = (anahtar: string) => anahtar
vi.mock('../../i18n/I18nProvider', () => ({
  useI18n: () => ({ lang: 'tr', t: cevir }),
}))

const sepetiTemizle = vi.fn()
// `clearCart` kimliği HER ÇİZİMDE yeni: gerçek sepet bağlamı da kullanıcı / sunucu sepeti yüklenince kimliğini değiştirir
// (`useCallback([user, serverCartId, supabase])`). Çift koşu koruması bu sahte ile ölçülür.
vi.mock('../../hooks/useCartHook', () => ({
  useCart: () => ({ clearCart: (secenek?: unknown) => sepetiTemizle(secenek) }),
}))

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
    functions: { invoke: callbackCagrisi },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: siparisSatiri })) })),
    })),
  },
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('../../lib/errorReporter', () => ({ reportError: vi.fn() }))

const KAPALI = { acik: false, damga: null, kaynak: 'kapali-varsayilan' } as const
const ACIK = { acik: true, damga: null, kaynak: 'db' } as const

const SEPET_ANAHTARI = 'venthub-cart'

/** Sipariş veritabanında ödenmiş görünüyor (yoklamanın ve callback'in yazdığı hâl: status confirmed + payment_status paid). */
const ODENMIS = { data: { status: 'confirmed', payment_status: 'paid' }, error: null }
const BEKLEYEN = { data: { status: 'pending', payment_status: 'pending' }, error: null }
const BULUNAMADI = { data: null, error: null }

async function sayfayiCiz(adres: Record<string, string>) {
  sorguParams = new URLSearchParams(adres)
  const arayuz = await Page({ searchParams: Promise.resolve(adres) })
  render(arayuz)
  // Sonuç bileşeni kurulduysa `verify()` etkisi burada çalışır; kurulmadıysa hiçbir şey olmaz.
  await act(async () => {
    await new Promise((cozum) => setTimeout(cozum, 0))
  })
}

/** Başarı ekranı ve sahte sipariş numarası ASLA çıkmamalı (ortak olumsuz beklenti). */
function basariBasilmadi() {
  expect(screen.queryByText('payment.orderCompletedTitle')).toBeNull()
  expect(screen.queryByText('DEMO-ORDER')).toBeNull()
}

describe('/payment-success — satış kipi kapısı (URN-83)', () => {
  beforeEach(() => {
    sepetiTemizle.mockClear()
    siparisSatiri.mockReset()
    callbackCagrisi.mockReset()
    vi.mocked(satisKipiOku).mockReset()
    localStorage.clear()
    localStorage.setItem(SEPET_ANAHTARI, JSON.stringify([{ sku: 'X', qty: 1 }]))
  })

  it('kip KAPALI: "Siparişiniz Tamamlandı" ekranı BASILMAZ, kapalı-kip kartı çıkar', async () => {
    vi.mocked(satisKipiOku).mockResolvedValue(KAPALI)
    await sayfayiCiz({ status: 'success', orderId: 'ord-1' })

    basariBasilmadi()
    // Pozitif kontrol: ekran boş değil, ödeme sayfasının kapalı-kip kartı çiziliyor (sahte-yeşil muhafızı).
    expect(screen.getByText('checkout.kapali.baslik')).toBeInTheDocument()
  })

  it('kip KAPALI: sepet SİLİNMEZ — temizleme çağrısı yok, yerel depodaki sepet duruyor', async () => {
    vi.mocked(satisKipiOku).mockResolvedValue(KAPALI)
    await sayfayiCiz({ status: 'success', orderId: 'ord-1' })

    expect(sepetiTemizle).not.toHaveBeenCalled()
    expect(localStorage.getItem(SEPET_ANAHTARI)).not.toBeNull()
    expect(localStorage.getItem('vh_last_order_status')).toBeNull()
    // Kapalıyken doğrulama çağrısı da yapılmaz: sonuç bileşeni hiç kurulmadı.
    expect(siparisSatiri).not.toHaveBeenCalled()
    expect(callbackCagrisi).not.toHaveBeenCalled()
  })
})

describe('/payment-success — doğrulama kapısı, kip AÇIK (URN-83)', () => {
  beforeEach(() => {
    sepetiTemizle.mockClear()
    siparisSatiri.mockReset()
    callbackCagrisi.mockReset()
    callbackCagrisi.mockResolvedValue({ data: null, error: null })
    vi.mocked(satisKipiOku).mockReset()
    vi.mocked(satisKipiOku).mockResolvedValue(ACIK)
    localStorage.clear()
    localStorage.setItem(SEPET_ANAHTARI, JSON.stringify([{ sku: 'X', qty: 1 }]))
  })

  it('DOĞRULANMIŞ ödeme (sipariş kimliği + veritabanında ödenmiş) bozulmaz: başarı çıkar, sepet temizlenir', async () => {
    siparisSatiri.mockResolvedValue(ODENMIS)
    await sayfayiCiz({ status: 'success', orderId: 'ord-1' })

    await waitFor(() => {
      expect(screen.getByText('payment.orderCompletedTitle')).toBeInTheDocument()
    })
    // Sipariş numarası gerçek kimlikten gelir; sahte numara yok.
    expect(screen.getByText('ord-1')).toBeInTheDocument()
    expect(screen.queryByText('DEMO-ORDER')).toBeNull()
    expect(sepetiTemizle).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(SEPET_ANAHTARI)).toBeNull()
    expect(localStorage.getItem('vh_last_order_status')).toBe('success')
    expect(screen.queryByText('checkout.kapali.baslik')).toBeNull()
  })

  it('status=success ama SİPARİŞ KİMLİĞİ YOK: başarı ekranı, DEMO-ORDER ve sepet temizliği ÇIKMAZ', async () => {
    await sayfayiCiz({ status: 'success' })

    // Pozitif anchor: yükleme bitti ve "kontrol ediliyor" ekranı çizildi (aksi hâlde olumsuz beklentiler erken geçerdi).
    // Güvenlik incelemesi 10-10 bulgu 1: doğrulanamayan ödeme "Başarısız / Tekrar Dene" DEĞİL, belirsizdir.
    expect(await screen.findByText('payment.pendingTitle')).toBeInTheDocument()
    expect(screen.queryByText('payment.failedTitle')).toBeNull()
    expect(screen.queryByText('payment.retry')).toBeNull()
    basariBasilmadi()
    expect(sepetiTemizle).not.toHaveBeenCalled()
    expect(localStorage.getItem(SEPET_ANAHTARI)).not.toBeNull()
    expect(localStorage.getItem('vh_last_order_status')).not.toBe('success')
    // Kimliksiz adres için veritabanına sorgu da gitmez.
    expect(siparisSatiri).not.toHaveBeenCalled()
  })

  it('status=success + kimlik var ama sipariş BULUNAMADI (uydurma adres): başarı çıkmaz, sepet silinmez', async () => {
    siparisSatiri.mockResolvedValue(BULUNAMADI)
    await sayfayiCiz({ status: 'success', orderId: 'uydurma-id' })

    expect(await screen.findByText('payment.pendingTitle')).toBeInTheDocument()
    expect(screen.queryByText('payment.retry')).toBeNull()
    basariBasilmadi()
    expect(sepetiTemizle).not.toHaveBeenCalled()
    expect(localStorage.getItem(SEPET_ANAHTARI)).not.toBeNull()
    expect(localStorage.getItem('vh_last_order_status')).not.toBe('success')
  })

  it('status=success + sipariş var ama ÖDENMEMİŞ (bekleyen): başarı çıkmaz, sepet silinmez', async () => {
    siparisSatiri.mockResolvedValue(BEKLEYEN)
    await sayfayiCiz({ status: 'success', orderId: 'ord-bekleyen' })

    expect(await screen.findByText('payment.pendingTitle')).toBeInTheDocument()
    expect(screen.queryByText('payment.retry')).toBeNull()
    basariBasilmadi()
    expect(sepetiTemizle).not.toHaveBeenCalled()
    expect(localStorage.getItem(SEPET_ANAHTARI)).not.toBeNull()
  })

  it('doğrulama BİR KEZ koşar: veritabanı yanıtı beklenirken yeniden çizim (clearCart kimliği değişimi) çift temizlik üretmez', async () => {
    // İlk okuma askıda kalır; bu sırada bileşen iki kez daha çizilir (etki bağımlılığı `clearCart` her çizimde yeni).
    let oku!: (yanit: typeof ODENMIS) => void
    siparisSatiri
      .mockImplementationOnce(() => new Promise((cozum) => { oku = cozum }))
      .mockResolvedValue(ODENMIS)
    const adres = { status: 'success', orderId: 'ord-1' }
    sorguParams = new URLSearchParams(adres)
    const ciz = () => Page({ searchParams: Promise.resolve(adres) })
    const { rerender } = render(await ciz())
    // Yeni öğe nesnesi şart: aynı öğe referansıyla `rerender` React'te atlanır ve yeniden çizim ölçülmezdi.
    rerender(await ciz())
    rerender(await ciz())
    await act(async () => {
      oku(ODENMIS)
      await new Promise((cozum) => setTimeout(cozum, 0))
    })

    await waitFor(() => {
      expect(screen.getByText('payment.orderCompletedTitle')).toBeInTheDocument()
    })
    expect(sepetiTemizle).toHaveBeenCalledTimes(1)
  })

  it('token ile doğrulanan başarıda sipariş numarası YOKSA sahte numara yazılmaz (satır hiç çıkmaz)', async () => {
    callbackCagrisi.mockResolvedValue({ data: { status: 'success' }, error: null })
    await sayfayiCiz({ token: 'tok-1' })

    await waitFor(() => {
      expect(screen.getByText('payment.orderCompletedTitle')).toBeInTheDocument()
    })
    expect(screen.queryByText('DEMO-ORDER')).toBeNull()
    expect(screen.queryByText(/payment\.orderNoLabel/)).toBeNull()
    // Sipariş kimliği yokken "sipariş detayı" düğmesi boş kimlikli adrese gitmez; sipariş listesine gider.
    const baglanti = screen.getByText('payment.viewOrderDetails').closest('a')
    expect(baglanti?.getAttribute('href')).toBe('/tr/hesabim/siparisler')
  })

  it('token başarısı + URL\'deki orderId veritabanında ÖDENMİŞ GÖRÜNMÜYORSA: bağlantı o kimliğe değil sipariş listesine gider', async () => {
    callbackCagrisi.mockResolvedValue({ data: { status: 'success', iyzico: { conversationId: 'conv-sunucu' } }, error: null })
    siparisSatiri.mockResolvedValue(BEKLEYEN)
    await sayfayiCiz({ token: 'tok-1', orderId: 'baskasinin-siparisi' })

    await waitFor(() => {
      expect(screen.getByText('payment.orderCompletedTitle')).toBeInTheDocument()
    })
    // Numara sunucudan gelen değerdir; URL'deki kimlik ekrana basılmaz.
    expect(screen.getByText('conv-sunucu')).toBeInTheDocument()
    expect(screen.queryByText('baskasinin-siparisi')).toBeNull()
    const baglanti = screen.getByText('payment.viewOrderDetails').closest('a')
    expect(baglanti?.getAttribute('href')).toBe('/tr/hesabim/siparisler')
  })
})

// Güvenlik incelemesi 10-10, bulgu 1: doğrulanamayan ödeme "Ödeme Başarısız / Tekrar Dene" DEMEZ (çift tahsilat).
// BELİRSİZ = "kontrol ediliyor" ekranı, tekrar dene bağlantısı YOK, sipariş numarası ve iletişim var.
// AÇIK RED = yalnız callback'in `failure` cevabı / yönlendirmesi ya da `errorMessage`: "Ödeme Başarısız" ekranı.
describe('/payment-success — belirsiz sonuç ile açık red ayrımı (URN-83, güvenlik bulgusu 1)', () => {
  const UUID = '3f1c2a9e-5b7d-4c1a-9e8f-0a1b2c3d4e5f'

  beforeEach(() => {
    sepetiTemizle.mockClear()
    siparisSatiri.mockReset()
    callbackCagrisi.mockReset()
    callbackCagrisi.mockResolvedValue({ data: null, error: null })
    vi.mocked(satisKipiOku).mockReset()
    vi.mocked(satisKipiOku).mockResolvedValue(ACIK)
    localStorage.clear()
    localStorage.setItem(SEPET_ANAHTARI, JSON.stringify([{ sku: 'X', qty: 1 }]))
  })

  /** Belirsiz sonuç ekranı: "kontrol ediliyor" başlığı var; başarısız başlığı ve tekrar dene bağlantısı YOK; sepet durur. */
  async function belirsizEkran() {
    expect(await screen.findByText('payment.pendingTitle')).toBeInTheDocument()
    expect(screen.queryByText('payment.failedTitle')).toBeNull()
    expect(screen.queryByText('payment.retry')).toBeNull()
    expect(screen.queryByText('checkout.backToCart')).toBeNull()
    expect(screen.getByText('payment.viewOrderDetails')).toBeInTheDocument()
    expect(sepetiTemizle).not.toHaveBeenCalled()
    expect(localStorage.getItem(SEPET_ANAHTARI)).not.toBeNull()
  }

  it('BELİRSİZ: doğrulama çağrısı düştü (ağ/sunucu hatası) → "kontrol ediliyor", tekrar dene YOK', async () => {
    callbackCagrisi.mockResolvedValue({ data: null, error: { message: 'Failed to fetch' } })
    await sayfayiCiz({ token: 'tok-1', orderId: UUID })
    await belirsizEkran()
  })

  it('BELİRSİZ: callback "pending" döndü → "kontrol ediliyor", tekrar dene YOK', async () => {
    callbackCagrisi.mockResolvedValue({ data: { status: 'pending' }, error: null })
    await sayfayiCiz({ token: 'tok-1', orderId: UUID })
    await belirsizEkran()
  })

  it('BELİRSİZ: sipariş satırı okunamadı (veritabanı hatası) → "kontrol ediliyor", tekrar dene YOK', async () => {
    siparisSatiri.mockResolvedValue({ data: null, error: { message: 'timeout' } })
    await sayfayiCiz({ orderId: UUID })
    await belirsizEkran()
  })

  it('BELİRSİZ: sipariş var ama ödenmiş görünmüyor (parametresiz dönüş) → "kontrol ediliyor"', async () => {
    siparisSatiri.mockResolvedValue(BEKLEYEN)
    await sayfayiCiz({ orderId: UUID })
    await belirsizEkran()
  })

  it('BELİRSİZ ekranı sipariş numarasını ve iletişim adresini gösterir; "ödeme alındı" demez', async () => {
    callbackCagrisi.mockResolvedValue({ data: { status: 'pending' }, error: null })
    await sayfayiCiz({ token: 'tok-1', orderId: UUID })
    await belirsizEkran()
    expect(screen.getByText(UUID)).toBeInTheDocument()
    // İletişim: sözlükteki e-posta bağlantısı (test sahtesinde anahtarın kendisi).
    expect(screen.getByText('footer.email').closest('a')?.getAttribute('href')).toBe('mailto:footer.email')
    expect(screen.queryByText('payment.reviewTitle')).toBeNull()
  })

  it('AÇIK RED: callback "failure" döndü → "Ödeme Başarısız" ekranı ve tekrar dene bağlantısı', async () => {
    callbackCagrisi.mockResolvedValue({ data: { status: 'failure', iyzico: { errorMessage: 'Kart limiti yetersiz' } }, error: null })
    await sayfayiCiz({ token: 'tok-1', orderId: UUID })

    expect(await screen.findByText('payment.failedTitle')).toBeInTheDocument()
    expect(screen.getByText('payment.retry')).toBeInTheDocument()
    expect(screen.queryByText('payment.pendingTitle')).toBeNull()
  })

  it('AÇIK RED: callback `status=failure` ile yönlendirdi → "Ödeme Başarısız" ekranı', async () => {
    siparisSatiri.mockResolvedValue(BEKLEYEN)
    await sayfayiCiz({ status: 'failure', orderId: UUID })

    expect(await screen.findByText('payment.failedTitle')).toBeInTheDocument()
    expect(screen.getByText('payment.retry')).toBeInTheDocument()
  })

  it('URL\'deki errorMessage ekrana BASILMAZ (adres elle yazılabilir): sözlükteki genel metin çıkar', async () => {
    siparisSatiri.mockResolvedValue(BEKLEYEN)
    await sayfayiCiz({ errorMessage: 'Hesabiniz kilitlendi, su numarayi arayin 0555' })

    expect(await screen.findByText('payment.failedTitle')).toBeInTheDocument()
    expect(screen.queryByText(/Hesabiniz kilitlendi/)).toBeNull()
    expect(screen.getAllByText('payment.failedGeneric').length).toBeGreaterThan(0)
  })

  it('URL\'deki sipariş numarası güvenli biçimde değilse ekrana BASILMAZ (cümle enjeksiyonu)', async () => {
    siparisSatiri.mockResolvedValue(BEKLEYEN)
    await sayfayiCiz({ status: 'success', orderId: 'Hesabiniz kilitlendi, su numarayi arayin' })

    expect(await screen.findByText('payment.pendingTitle')).toBeInTheDocument()
    expect(screen.queryByText(/Hesabiniz kilitlendi/)).toBeNull()
    expect(screen.queryByText(/payment\.orderNoLabel/)).toBeNull()
  })
})

// Güvenlik incelemesi 10-10, bulgu 3: `?status=needs_review` tek başına sepeti silmez.
describe('/payment-success — needs_review dalı doğrulanır (URN-83, güvenlik bulgusu 3)', () => {
  const UUID = '3f1c2a9e-5b7d-4c1a-9e8f-0a1b2c3d4e5f'

  beforeEach(() => {
    sepetiTemizle.mockClear()
    siparisSatiri.mockReset()
    callbackCagrisi.mockReset()
    callbackCagrisi.mockResolvedValue({ data: null, error: null })
    vi.mocked(satisKipiOku).mockReset()
    vi.mocked(satisKipiOku).mockResolvedValue(ACIK)
    localStorage.clear()
    localStorage.setItem(SEPET_ANAHTARI, JSON.stringify([{ sku: 'X', qty: 1 }]))
  })

  it('sipariş kimliği YOK: inceleme ekranı çıkar ama sepet silinmez, yerel depoya yazım yok', async () => {
    await sayfayiCiz({ status: 'needs_review' })

    expect(await screen.findByText('payment.pendingTitle')).toBeInTheDocument()
    expect(sepetiTemizle).not.toHaveBeenCalled()
    expect(localStorage.getItem(SEPET_ANAHTARI)).not.toBeNull()
    expect(localStorage.getItem('vh_last_order_status')).toBeNull()
  })

  it('sipariş kimliği var ama kayıt bulunamadı (uydurma): sepet silinmez', async () => {
    siparisSatiri.mockResolvedValue(BULUNAMADI)
    await sayfayiCiz({ status: 'needs_review', orderId: UUID })

    expect(await screen.findByText('payment.pendingTitle')).toBeInTheDocument()
    expect(sepetiTemizle).not.toHaveBeenCalled()
    expect(localStorage.getItem(SEPET_ANAHTARI)).not.toBeNull()
  })

  it('OLUMLU KONTROL: kayıt bu ziyaretçiye görünüyorsa gerçek inceleme akışı çalışır — sepet silinir, "doğrulama sürüyor"', async () => {
    siparisSatiri.mockResolvedValue({ data: { id: UUID, total_amount: 100, created_at: '2026-10-10T08:00:00Z' }, error: null })
    await sayfayiCiz({ status: 'needs_review', orderId: UUID })

    expect(await screen.findByText('payment.reviewTitle')).toBeInTheDocument()
    expect(screen.queryByText('payment.pendingTitle')).toBeNull()
    expect(sepetiTemizle).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('vh_last_order_status')).toBe('needs_review')
    expect(screen.queryByText('payment.retry')).toBeNull()
  })
})

// Güvenlik incelemesi 10-10, bulgu 2: kip kapıyken de GEÇERLİ BİÇİMLİ orderId ile dönen müşteri sonucunu görür.
describe('/payment-success — kip kapısı orderId ile dönen müşteriyi engellemez (URN-83, güvenlik bulgusu 2)', () => {
  const UUID = '3f1c2a9e-5b7d-4c1a-9e8f-0a1b2c3d4e5f'

  beforeEach(() => {
    sepetiTemizle.mockClear()
    siparisSatiri.mockReset()
    callbackCagrisi.mockReset()
    callbackCagrisi.mockResolvedValue({ data: null, error: null })
    vi.mocked(satisKipiOku).mockReset()
    vi.mocked(satisKipiOku).mockResolvedValue(KAPALI)
    localStorage.clear()
    localStorage.setItem(SEPET_ANAHTARI, JSON.stringify([{ sku: 'X', qty: 1 }]))
  })

  it('kip KAPALI + geçerli orderId + sipariş ödenmiş: sonuç ekranı çıkar, kapalı-kip kartı ÇIKMAZ', async () => {
    siparisSatiri.mockResolvedValue(ODENMIS)
    await sayfayiCiz({ status: 'success', orderId: UUID })

    await waitFor(() => {
      expect(screen.getByText('payment.orderCompletedTitle')).toBeInTheDocument()
    })
    expect(screen.queryByText('checkout.kapali.baslik')).toBeNull()
    expect(sepetiTemizle).toHaveBeenCalledTimes(1)
  })

  it('kip KAPALI + geçerli biçimli ama UYDURMA orderId: kapı gevşemez — başarı yok, sepet silinmez, yazım yok', async () => {
    siparisSatiri.mockResolvedValue(BULUNAMADI)
    await sayfayiCiz({ status: 'success', orderId: UUID })

    expect(await screen.findByText('payment.pendingTitle')).toBeInTheDocument()
    basariBasilmadi()
    expect(sepetiTemizle).not.toHaveBeenCalled()
    expect(localStorage.getItem(SEPET_ANAHTARI)).not.toBeNull()
    expect(localStorage.getItem('vh_last_order_status')).toBeNull()
  })

  it('kip KAPALI + orderId YOK ya da biçimi bozuk: kapalı-kip kartı, doğrulama çağrısı yok', async () => {
    await sayfayiCiz({ status: 'success' })
    expect(screen.getByText('checkout.kapali.baslik')).toBeInTheDocument()
    await sayfayiCiz({ status: 'success', orderId: 'ord-1' })
    expect(screen.getAllByText('checkout.kapali.baslik').length).toBeGreaterThan(0)
    expect(siparisSatiri).not.toHaveBeenCalled()
    expect(callbackCagrisi).not.toHaveBeenCalled()
    expect(sepetiTemizle).not.toHaveBeenCalled()
  })
})
