/**
 * INV-ARAMA-KESINTISIZ-1 · arama cetveli K14.7 — sunucu duraklayınca ekran BOŞALMAZ.
 *
 * NİÇİN: Recep (2026-09-21) "yazmaya başladığımda ürünler gelmesi lazım, bazen gelmiyor, sağda
 * dönen bir yuvarlak çıkıyor" dedi. Karar 59 ölçümü (2026-09-22): sunucu ara sıra 0,4–10 sn
 * duraklıyor. Eski kod bekleme sırasında listeyi GİZLİYORDU → ekran boş + dönen yuvarlak.
 *
 * Kollar: (a) yeni arama beklerken önceki sonuçlar ekranda kalır ve alan `aria-busy` olur ·
 * (b) 600 ms'yi geçen beklemede "aranıyor" satırı çıkar, hızlı cevapta çıkmaz · (c) yeni harf
 * eski isteği iptal eder (AbortSignal) · (d) arama sürerken kutu boşaltılırsa bekleme durumu
 * kapanır (eskiden dönen yuvarlak takılı kalıyordu) · (e) iptal edilen istek hata göstermez ·
 * (f) odak açılış anında verilir (görsel kanıtta "lineo" → "ineo" harf kaybı yakalandı).
 */
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const ftsCagrisi = vi.fn()
const oneriCagrisi = vi.fn()

vi.mock('../../lib/services/product.service', () => ({
  ftsSearchProducts: (...a: unknown[]) => ftsCagrisi(...a),
  getSearchSuggestions: (...a: unknown[]) => oneriCagrisi(...a),
}))

// ⚠Kanca nesneleri ve çeviri fonksiyonu TEK KEZ kurulur (bkz. SearchOverlayTekListe.test.tsx:
// her çağrıda yeni `t` üreten sahte, `t`'ye bağlı effect'i sonsuz döngüye sokar).
const sabit = vi.hoisted(() => {
  const s: Record<string, string> = {
    'search.placeholder': 'Ara',
    'search.noResults': 'Sonuç bulunamadı',
    'search.failed': 'Arama şu an yapılamadı.',
    'search.retry': 'Tekrar dene',
    'search.slowHint': 'Aranıyor, sonuçlar geliyor…',
    'common.close': 'Kapat',
  }
  return {
    ceviri: { lang: 'tr', t: (k: string) => s[k] || k },
    router: { push: () => undefined },
    kategoriler: { categories: [] as unknown[], getCategoryBySlug: () => undefined },
    rotalar: { home: () => '/tr', products: () => '/tr/urunler' },
  }
})

vi.mock('../../i18n/I18nProvider', () => ({ useI18n: () => sabit.ceviri }))
vi.mock('next/navigation', () => ({ useRouter: () => sabit.router }))
vi.mock('../../contexts/CategoryContext', () => ({ useCategories: () => sabit.kategoriler }))
vi.mock('../../hooks/useLocalizedRoutes', () => ({ useLocalizedRoutes: () => sabit.rotalar }))
vi.mock('../../lib/supabase/client', () => ({ supabaseBrowserClient: {} }))
vi.mock('../../lib/images/productImage', () => ({ resolveProductImageUrl: () => null }))
vi.mock('../../utils/getCategoryIcon', () => ({ getCategoryIcon: () => () => null }))

import SearchOverlay from '../SearchOverlay'

const urun = (id: string, name: string) => ({ id, name, sku: `S-${id}`, brand: 'SEAT', price: 1, rank: 1, family_slug: 'f', cover_image_path: null })

/** Elle çözülen söz: sunucu duraklamasını taklit eder. */
function bekleyen<T>() {
  let coz!: (v: T) => void
  const soz = new Promise<T>((r) => { coz = r })
  return { soz, coz }
}

const metin = () => document.body.textContent ?? ''
const mesgulAlan = () => document.querySelector('[aria-busy]')

beforeEach(() => {
  ftsCagrisi.mockReset()
  oneriCagrisi.mockReset()
  oneriCagrisi.mockResolvedValue([])
})

describe('INV-ARAMA-KESINTISIZ-1', () => {
  it('(a)(b) duraklamada önceki sonuçlar kalır, 600 ms sonra "aranıyor" satırı çıkar', async () => {
    const kullanici = userEvent.setup()
    ftsCagrisi.mockResolvedValueOnce([urun('1', 'Lineo 100')])
    render(<SearchOverlay open onClose={() => undefined} />)
    await kullanici.type(screen.getByPlaceholderText('Ara'), 'lin')
    await waitFor(() => expect(metin()).toContain('Lineo 100'))

    const ikinci = bekleyen<ReturnType<typeof urun>[]>()
    ftsCagrisi.mockReturnValueOnce(ikinci.soz)
    await kullanici.type(screen.getByPlaceholderText('Ara'), 'eo')

    // Beklerken: önceki sonuç EKRANDA, alan meşgul.
    await waitFor(() => expect(mesgulAlan()?.getAttribute('aria-busy')).toBe('true'))
    expect(metin()).toContain('Lineo 100')
    expect(metin()).not.toContain('Aranıyor, sonuçlar geliyor…')

    // 600 ms'yi geçince ipucu.
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Aranıyor, sonuçlar geliyor…'), { timeout: 2000 })

    await act(async () => { ikinci.coz([urun('2', 'Lineo 125')]) })
    await waitFor(() => expect(metin()).toContain('Lineo 125'))
    expect(screen.queryByRole('status')).toBeNull()
    expect(mesgulAlan()?.getAttribute('aria-busy')).toBe('false')
  })

  it('(b) hızlı cevapta "aranıyor" satırı hiç çıkmaz', async () => {
    const kullanici = userEvent.setup()
    ftsCagrisi.mockResolvedValue([urun('1', 'Jet 20')])
    render(<SearchOverlay open onClose={() => undefined} />)
    await kullanici.type(screen.getByPlaceholderText('Ara'), 'jet')
    await waitFor(() => expect(metin()).toContain('Jet 20'))
    await new Promise((r) => setTimeout(r, 700))
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('(c)(e) yeni harf eski isteği iptal eder; iptal hata göstermez', async () => {
    const kullanici = userEvent.setup()
    const ilk = bekleyen<ReturnType<typeof urun>[]>()
    ftsCagrisi.mockReturnValueOnce(ilk.soz).mockResolvedValueOnce([urun('3', 'Radon 150')])
    render(<SearchOverlay open onClose={() => undefined} />)
    await kullanici.type(screen.getByPlaceholderText('Ara'), 'rad')
    await waitFor(() => expect(ftsCagrisi).toHaveBeenCalledTimes(1))
    const ilkSinyal = ftsCagrisi.mock.calls[0][4] as AbortSignal
    expect(ilkSinyal).toBeInstanceOf(AbortSignal)
    expect(ilkSinyal.aborted).toBe(false)

    await kullanici.type(screen.getByPlaceholderText('Ara'), 'on')
    await waitFor(() => expect(ilkSinyal.aborted).toBe(true))
    await waitFor(() => expect(metin()).toContain('Radon 150'))

    // Eski istek iptal sonrası HATAYLA dönse bile ekranda hata çıkmaz.
    await act(async () => { ilk.coz([]) })
    expect(screen.queryByRole('alert')).toBeNull()
    // Öneri çağrısı da aynı sinyali taşır.
    expect(oneriCagrisi.mock.calls[0][3]).toBe(ilkSinyal)
  })

  it('(f) odak AÇILIŞ ANINDA verilir — ilk tuş kaybolmaz', () => {
    render(<SearchOverlay open onClose={() => undefined} />)
    // 50 ms beklemeden: pencere askısız çizildiği için (K14.6) ilk tuş hemen gelebilir.
    expect(document.activeElement).toBe(screen.getByPlaceholderText('Ara'))
  })

  it('(d) arama sürerken kutu boşaltılırsa bekleme kapanır (dönen yuvarlak takılı kalmaz)', async () => {
    const kullanici = userEvent.setup()
    const asili = bekleyen<ReturnType<typeof urun>[]>()
    ftsCagrisi.mockReturnValueOnce(asili.soz)
    render(<SearchOverlay open onClose={() => undefined} />)
    const kutu = screen.getByPlaceholderText('Ara')
    await kullanici.type(kutu, 'kan')
    await waitFor(() => expect(mesgulAlan()?.getAttribute('aria-busy')).toBe('true'))
    await kullanici.clear(kutu)
    await waitFor(() => expect(mesgulAlan()?.getAttribute('aria-busy')).toBe('false'))
    expect(document.querySelector('.animate-spin')).toBeNull()
  })
})
