import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '@/i18n/I18nProvider'

import BrandDetailPage from '../BrandDetailPage'

/**
 * INV-MARKA-KAYNAK-1 (e) — marka sayfasının "teklif isteyin" cümlesi sunucunun `urunsuz` kararına bağlıdır (OPS-51).
 *
 * Karar `markaSayfasi.tsx` → `markaUrunDurumu.ts` (DB'deki aktif ürün sayısı); üst veri (noindex) ve site haritasıyla AYNI
 * kaynaktır. Bu test istemci görünümünün bu kararı AYNEN yansıttığını ölçer: AYNI marka (flexiva), AYNI bileşen,
 * yalnız `urunsuz` prop'u değişir → cümle + iletişim bağlantısı çıkar / kalkar. Aile listesi (istemci tarafı) boştur:
 * ürün kartı olmadığında boş-durum dalı çizilir.
 */
vi.mock('next/navigation', () => ({
  useParams: () => ({}),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/en/brands/flexiva',
}))
vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: {} }))
vi.mock('../../lib/services/family.service', () => ({
  getFamiliesEnriched: async () => ({ items: [], total: 0 }),
}))

// `useScrollAnimation` (hero animasyonu) jsdom'da olmayan IntersectionObserver ister; bu testin konusu animasyon değil.
vi.stubGlobal(
  'IntersectionObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)

// BLG-6 (10-09): tedarik ima eden "Request a quote" cümlesi kalktı; ürünsüz marka cümlesi katalogda olmadığını söyler.
const TEKLIF_EN = 'Flexiva products are not in the catalogue yet; you can use the contact form for questions.'
const URUNSUZ_DEGIL_EN = 'This brand has no products in the catalogue yet.'

function ciz(urunsuz: boolean | undefined) {
  return render(
    <I18nProvider lang="en">
      <BrandDetailPage initialBrandSlug="flexiva" urunsuz={urunsuz} />
    </I18nProvider>,
  )
}

describe('BrandDetailPage: urunsuz prop\'u teklif cümlesini belirler', () => {
  it('urunsuz=true → "teklif isteyin" cümlesi + iletişim bağlantısı; eski "ürün yok" cümlesi YOK', async () => {
    ciz(true)
    await waitFor(() => expect(screen.getByText(TEKLIF_EN)).toBeTruthy())
    expect(screen.queryByText(URUNSUZ_DEGIL_EN)).toBeNull()
    expect(screen.getByText('Go to the contact form').closest('a')?.getAttribute('href')).toBe('/en/contact')
  })

  it('urunsuz=false → teklif cümlesi ve bağlantısı YOK (ürün gelince kendiliğinden kalkar); bugünkü boş-durum cümlesi', async () => {
    ciz(false)
    await waitFor(() => expect(screen.getByText(URUNSUZ_DEGIL_EN)).toBeTruthy())
    expect(screen.queryByText(TEKLIF_EN)).toBeNull()
    expect(screen.queryByText('Go to the contact form')).toBeNull()
  })

  it('prop verilmezse (varsayılan) ürünlü sayılır: teklif cümlesi çizilmez', async () => {
    ciz(undefined)
    await waitFor(() => expect(screen.getByText(URUNSUZ_DEGIL_EN)).toBeTruthy())
    expect(screen.queryByText(TEKLIF_EN)).toBeNull()
  })
})
