/**
 * URN-19 — arama kutusunun yedek kategori çipleri TR sayfada kanonik EN slug'a gitmemeli.
 *
 * NİÇİN: kategori listesi boşken çipler `fans` / `air-curtains` / `heat-recovery-vmc` slug'ını
 * olduğu gibi adrese koyuyordu; TR ziyaretçi `/tr/category/fans` → 308 → `fanlar` zinciriyle
 * varıyordu. Bağlantının kendisi doğru adres olmalı. Test, TR'de görünen slug'ın, EN'de kanonik
 * slug'ın, liste doluyken de DB'deki görünen slug'ın kullanıldığını ölçer.
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../lib/services/product.service', () => ({
  ftsSearchProducts: () => Promise.resolve([]),
  getSearchSuggestions: () => Promise.resolve([]),
}))

const sabit = vi.hoisted(() => ({
  push: vi.fn(),
  router: { push: (...a: unknown[]) => sabit.push(...a) },
  kategoriler: {
    categories: [] as unknown[],
    getCategoryBySlug: (_s: string): unknown => undefined,
  },
  rotalar: { home: () => '/tr', products: () => '/tr/urunler', category: (s: string) => `/tr/category/${s}` },
  ceviri: { lang: 'tr', t: (k: string) => k },
}))

vi.mock('next/navigation', () => ({ useRouter: () => sabit.router }))
vi.mock('../../i18n/I18nProvider', () => ({ useI18n: () => sabit.ceviri }))
vi.mock('../../contexts/CategoryContext', () => ({ useCategories: () => sabit.kategoriler }))
vi.mock('../../hooks/useLocalizedRoutes', () => ({ useLocalizedRoutes: () => sabit.rotalar }))
vi.mock('../../lib/supabase/client', () => ({ supabaseBrowserClient: {} }))
vi.mock('../../lib/images/productImage', () => ({ resolveProductImageUrl: () => null }))
vi.mock('../../utils/getCategoryIcon', () => ({ getCategoryIcon: () => () => null }))

import SearchOverlay from '../SearchOverlay'

const CIP_ANAHTARLARI = ['home.hero.quickChips.fans', 'home.hero.quickChips.airCurtains', 'home.hero.quickChips.heatRecovery']

async function cipeTikla(anahtar: string) {
  render(<SearchOverlay open onClose={vi.fn()} />)
  await userEvent.click(screen.getByRole('button', { name: anahtar }))
}

describe('SearchOverlay yedek çipleri — görünen slug dile göre (URN-19)', () => {
  beforeEach(() => {
    sabit.push.mockClear()
    sabit.ceviri.lang = 'tr'
    sabit.kategoriler.getCategoryBySlug = () => undefined
  })

  it.each([
    [CIP_ANAHTARLARI[0], '/tr/category/fanlar'],
    [CIP_ANAHTARLARI[1], '/tr/category/hava-perdeleri'],
    [CIP_ANAHTARLARI[2], '/tr/category/isi-geri-kazanim'],
  ])('TR, liste boş: %s → %s', async (anahtar, beklenen) => {
    await cipeTikla(anahtar)
    expect(sabit.push).toHaveBeenCalledWith(beklenen)
  })

  it('EN, liste boş: kanonik EN slug', async () => {
    sabit.ceviri.lang = 'en'
    sabit.rotalar.category = (s: string) => `/en/category/${s}`
    await cipeTikla(CIP_ANAHTARLARI[1])
    expect(sabit.push).toHaveBeenCalledWith('/en/category/air-curtains')
  })

  it('TR, liste dolu: slug listedeki kategorinin görünen slug\'ından gelir', async () => {
    sabit.rotalar.category = (s: string) => `/tr/category/${s}`
    sabit.kategoriler.getCategoryBySlug = (s: string) =>
      s === 'air-curtains' ? { slug: 'air-curtains', metadata: { slug: { tr: 'hava-perdesi-yeni', en: 'air-curtains' } } } : undefined
    await cipeTikla(CIP_ANAHTARLARI[1])
    expect(sabit.push).toHaveBeenCalledWith('/tr/category/hava-perdesi-yeni')
  })
})
