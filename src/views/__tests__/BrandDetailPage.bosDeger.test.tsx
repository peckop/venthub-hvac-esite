/**
 * URN-84 — marka sayfasının "kurumsal özet" panelinde, etiketi sözlükte BOŞ ('') bırakılan satır çizilmez.
 *
 * NİÇİN: `brands.detail.statCountries` tabloda BOŞ (Vortice'nin "90+ ülke" beyanı sitede yazılmaz, BLG-7), ama
 * `BRAND_DETAILS` değeri ('90+') koda gömülü. Etiket boşken bileşen satırı olduğu gibi basarsa panelde
 * etiketsiz "90+" kalırdı: değer tek başına anlamsız VE yazılmaması istenen beyan.
 */
import { render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { tr } from '@/i18n/dictionaries/tr'

import BrandDetailPage from '../BrandDetailPage'

const kaynak = vi.hoisted(() => ({ dict: {} as object }))

vi.mock('@/i18n/I18nProvider', async () => {
  const { getDictValue } = await import('@/i18n/getDictValue')
  return {
    useI18n: () => ({
      lang: 'tr' as const,
      t: (anahtar: string) => getDictValue(kaynak.dict, anahtar),
      dict: kaynak.dict,
    }),
  }
})
vi.mock('next/navigation', () => ({
  useParams: () => ({}),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/tr/brands/vortice',
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

function sozlukte(ulkeEtiketi: string): object {
  const kopya = JSON.parse(JSON.stringify(tr)) as { brands: { detail: Record<string, string> } }
  if (!('statCountries' in kopya.brands.detail)) throw new Error('sözlükte brands.detail.statCountries yok')
  kopya.brands.detail.statCountries = ulkeEtiketi
  return kopya
}

/** Panel satırları: [etiket, değer]. */
function panelSatirlari(container: HTMLElement): Array<[string, string]> {
  return Array.from(container.querySelectorAll('aside div.flex.justify-between')).map((satir) => {
    const spanlar = satir.querySelectorAll('span, a')
    return [spanlar[0]?.textContent?.trim() ?? '', spanlar[1]?.textContent?.trim() ?? '']
  })
}

afterEach(() => {
  kaynak.dict = {}
})

describe('BrandDetailPage — etiketi boş istatistik satırı çizilmez', () => {
  it('statCountries etiketi boşken "90+" satırı panelde YOK, etiketsiz satır da yok', async () => {
    kaynak.dict = sozlukte('')
    const { container } = render(<BrandDetailPage initialBrandSlug="vortice" />)
    await waitFor(() => expect(panelSatirlari(container).length).toBeGreaterThan(0))

    const satirlar = panelSatirlari(container)
    expect(satirlar.filter(([etiket]) => etiket === '')).toHaveLength(0)
    expect(satirlar.filter(([, deger]) => deger === '90+')).toHaveLength(0)
    // Kalan satırlar yerinde: grup satırı çizilir.
    expect(satirlar.some(([, deger]) => deger === 'Vortice Group')).toBe(true)
  })

  it('OLUMLU KONTROL: etiket doluysa aynı satır çizilir', async () => {
    kaynak.dict = sozlukte('Ülke Sayısı')
    const { container } = render(<BrandDetailPage initialBrandSlug="vortice" />)
    await waitFor(() => expect(panelSatirlari(container).length).toBeGreaterThan(0))
    expect(panelSatirlari(container)).toContainEqual(['Ülke Sayısı', '90+'])
  })
})
