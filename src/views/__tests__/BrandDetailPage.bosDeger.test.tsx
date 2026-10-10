/**
 * URN-84 — marka sayfasının "kurumsal özet" panelinde, etiketi sözlükte BOŞ ('') bırakılan satır çizilmez.
 *
 * NİÇİN: `brands.detail.statCountries` tabloda BOŞ (Vortice'nin "90+ ülke" beyanı sitede yazılmaz, BLG-7). `BRAND_DETAILS`
 * değeri koda gömülü olduğu dönemde etiket boşken bileşen satırı olduğu gibi basarsa panelde etiketsiz "90+" kalırdı:
 * değer tek başına anlamsız VE yazılmaması istenen beyan. URN-82 ile o satır VERİDEN de kalktı; koruma (etiketi boş satır
 * çizilmez) genel bir mekanizma olarak durur ve artık veride duran `statGroup` satırıyla sınanır; "90+" ayrıca
 * etiket dolu olsa bile çizilmez.
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

function sozlukte(anahtar: string, etiket: string): object {
  const kopya = JSON.parse(JSON.stringify(tr)) as { brands: { detail: Record<string, string> } }
  if (!(anahtar in kopya.brands.detail)) throw new Error(`sözlükte brands.detail.${anahtar} yok`)
  kopya.brands.detail[anahtar] = etiket
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
  // URN-82 ile Vortice'nin "90+ ülke" satırı VERİDEN kalktı (kaynak dizininde karşılığı yok); URN-84'ün koruması artık
  // veride hâlâ duran bir satırla sınanır: `statGroup` ("Vortice Group"). Koruma genel bir mekanizmadır, satıra bağlı değil.
  it('statGroup etiketi boşken "Vortice Group" satırı panelde YOK, etiketsiz satır da yok', async () => {
    kaynak.dict = sozlukte('statGroup', '')
    const { container } = render(<BrandDetailPage initialBrandSlug="vortice" />)
    await waitFor(() => expect(panelSatirlari(container).length).toBeGreaterThan(0))

    const satirlar = panelSatirlari(container)
    expect(satirlar.filter(([etiket]) => etiket === '')).toHaveLength(0)
    expect(satirlar.filter(([, deger]) => deger === 'Vortice Group')).toHaveLength(0)
    // Kalan satır yerinde: kuruluş yılı satırı çizilir.
    expect(satirlar.some(([, deger]) => deger === '1954')).toBe(true)
  })

  it('OLUMLU KONTROL: etiket doluysa aynı satır çizilir', async () => {
    kaynak.dict = sozlukte('statGroup', 'Grup Adı')
    const { container } = render(<BrandDetailPage initialBrandSlug="vortice" />)
    await waitFor(() => expect(panelSatirlari(container).length).toBeGreaterThan(0))
    expect(panelSatirlari(container)).toContainEqual(['Grup Adı', 'Vortice Group'])
  })

  it('"90+" ülke beyanı etiket dolu olsa bile çizilmez (veriden kalktı, yalnız etiketi boşaltmak yetmez)', async () => {
    kaynak.dict = sozlukte('statCountries', 'Ülke Sayısı')
    const { container } = render(<BrandDetailPage initialBrandSlug="vortice" />)
    await waitFor(() => expect(panelSatirlari(container).length).toBeGreaterThan(0))
    const satirlar = panelSatirlari(container)
    expect(satirlar.filter(([, deger]) => deger === '90+')).toHaveLength(0)
    expect(satirlar.filter(([etiket]) => etiket === 'Ülke Sayısı')).toHaveLength(0)
  })
})
