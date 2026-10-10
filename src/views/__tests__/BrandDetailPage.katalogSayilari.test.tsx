import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '@/i18n/I18nProvider'

import BrandDetailPage from '../BrandDetailPage'

/**
 * URN-82 — "Katalogda" kutusunun sayıları SUNUCUDAN gelir ve ham şablon basılmaz.
 *
 * Sözlük cümlesi `{{ad}} … {{aile}} … {{model}}` ister (Blog metin tablosu); eskiden görünüm yalnız marka adını
 * ekliyordu, ekranda "{aile} ürün ailesi" ham kalacaktı. Burada AYNI bileşen, yalnız `katalogSayilari` prop'u değişir:
 * sayı varsa cümle eksiksiz kurulur, yoksa kutu hiç çizilmez (eksik sayı ya da boş şablon yok).
 */
vi.mock('next/navigation', () => ({
  useParams: () => ({}),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/en/brands/vortice',
}))
vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: {} }))
vi.mock('../../lib/services/family.service', () => ({
  getFamiliesEnriched: async () => ({ items: [], total: 0 }),
}))

vi.stubGlobal(
  'IntersectionObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)

function ciz(lang: 'tr' | 'en', katalogSayilari?: { aile: number; model: number } | null) {
  return render(
    <I18nProvider lang={lang}>
      <BrandDetailPage initialBrandSlug="vortice" katalogSayilari={katalogSayilari} />
    </I18nProvider>,
  )
}

describe('BrandDetailPage: "Katalogda" kutusu sunucunun verdiği sayıyla kurulur', () => {
  it('EN: sayı verilince cümle eksiksiz, hiçbir yer tutucu açıkta değil', async () => {
    const { container } = ciz('en', { aile: 12, model: 87 })
    await waitFor(() =>
      expect(screen.getByText('Vortice has 12 product families and 87 models in the VentHub catalogue.')).toBeTruthy(),
    )
    expect(container.textContent).not.toMatch(/\{\{|\{\w+\}/)
  })

  it('TR: aynı cümle Türkçe kurulur', async () => {
    ciz('tr', { aile: 3, model: 41 })
    await waitFor(() =>
      expect(screen.getByText('Vortice, VentHub kataloğunda 3 ürün ailesi ve 41 model ile yer alıyor.')).toBeTruthy(),
    )
  })

  it('sayı verilmezse kutu hiç çizilmez: başlık da cümle de yok, ham şablon da yok', async () => {
    const { container } = ciz('en', null)
    await waitFor(() => expect(screen.getByText('This brand has no products in the catalogue yet.')).toBeTruthy())
    expect(screen.queryByText('In the Catalogue')).toBeNull()
    expect(container.textContent).not.toMatch(/product families and|\{\{|\{\w+\}/)
  })
})
