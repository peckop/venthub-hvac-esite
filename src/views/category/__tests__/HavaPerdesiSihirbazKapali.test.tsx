// URN-83 — hava perdesi sihirbazının TÜM giriş noktaları kapalı (geçici çare).
//
// `EnhancedNeedsWizard` 3. adımdan sonra boş panel açıyor, 6. adıma ulaşılamıyor. Sihirbazın kendisine dokunulmadı;
// ziyaretçi bozuk akışa girmesin diye üç sayfa yüzeyi tek kapıdan (`airCurtainWizardGate.ts`) kapatıldı:
//   1. BottomCTA "Seçim Sihirbazını Aç" kartı (kategori sayfası + vitrin sayfası)
//   2. TypeComparison "Bana Yardım Et" kartı (kategori sayfası)
//   3. Showcase kahraman bölümündeki "Bana Uygun Modeli Bul" düğmesi (vitrin sayfası)
// Bu dosya üçünü de ÇİZİM düzeyinde ölçer. Kapı bilerek açıldığında (4. ve 5. adım çizilip 6'ya erişim
// doğrulanınca) bu dosyanın "kapalı" kolları bilerek tersine çevrilir.
//
// SESSİZ FAN KONTROLÜ: aynı BottomCTA kartı sessiz fan sayfasında ÇALIŞAN ayrı bir sihirbaza (SilentFanWizard) bağlı.
// Kapı onu da gizlerse bozuk olmayan bir özellik kaybolur; "sessiz fan kartı AÇIK" kolu bunu tutar.
import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { AIR_CURTAIN_WIZARD_ENABLED } from '@/components/category/airCurtainWizardGate'
import type { DbCategory } from '@/types/db-rows'
import type { FamilyListItem } from '@/types/ui-models'

import { mapDatabaseCategoryToDomain } from '../../../lib/type-converters'
import CategoryLanding from '../CategoryLandingView'
import CategoryShowcaseView from '../CategoryShowcaseView'

vi.mock('next/image', () => ({ default: () => null }))
vi.mock('@/i18n/I18nProvider', () => ({
  useI18n: () => ({
    t: (k: string) => k,
    lang: 'tr',
    dict: {
      category: {
        showcase: {
          whyVenthubTitle: 'Neden VentHub',
          premiumEngineeringAlt: '',
          features: [
            { title: 'a', desc: 'a' },
            { title: 'b', desc: 'b' },
            { title: 'c', desc: 'c' },
          ],
        },
      },
    },
  }),
}))
vi.mock('@/hooks/useLocalizedRoutes', () => ({
  useLocalizedRoutes: () => ({
    category: (...s: string[]) => `/tr/category/${s.join('/')}`,
    product: (s: string) => `/tr/products/${s}`,
  }),
}))
vi.mock('@/hooks/useCategoryViewModel', () => ({
  useCategoryViewModel: () => ({
    wrapCategory: (c?: { slug?: string }) => (c ? { displayName: c.slug ?? '', raw: c, imageUrl: null, description: '' } : undefined),
  }),
}))
vi.mock('@/hooks/useScrollAnimation', () => ({
  default: () => [{ current: null }, true],
  scrollAnimationClasses: new Proxy({}, { get: () => () => '' }),
}))
vi.mock('@/components/navigation/Breadcrumb', () => ({ default: () => null }))
vi.mock('@/components/ui/VentImage', () => ({ default: () => null }))
vi.mock('@/components/products/FamilyCard', () => ({ default: () => null }))
vi.mock('@/components/category/EnhancedNeedsWizard', () => ({
  default: () => <div data-testid="hava-perdesi-sihirbazi" />,
}))
vi.mock('@/components/category/SilentFanWizard', () => ({
  default: () => <div data-testid="sessiz-fan-sihirbazi" />,
}))
vi.mock('@/components/category/sections', () => {
  const kutu = (ad: string) => {
    const Kutu = () => <div data-testid={ad} />
    Kutu.displayName = `Kutu(${ad})`
    return Kutu
  }
  // BottomCTA ve TypeComparison PROP'LARINI dışarı verir: ölçülen şey "kart çizildi mi" değil, sayfanın
  // bileşene sihirbaz giriş noktası VERİP VERMEDİĞİ (gerçek bileşenin çizimi BottomCTA.test.tsx'te).
  const BottomCTA = ({ showWizard, onOpenWizard }: { showWizard?: boolean; onOpenWizard?: () => void }) => (
    <div data-testid="BottomCTA" data-show-wizard={String(Boolean(showWizard))} data-open-wizard={String(Boolean(onOpenWizard))} />
  )
  const TypeComparison = ({ onOpenWizard }: { onOpenWizard?: () => void }) => (
    <div data-testid="TypeComparison" data-open-wizard={String(Boolean(onOpenWizard))} />
  )
  return {
    BottomCTA,
    TypeComparison,
    FAQ: kutu('FAQ'),
    HowItWorks: kutu('HowItWorks'),
    ProblemSection: kutu('ProblemSection'),
    SilentFanFAQ: kutu('SilentFanFAQ'),
    SilentFanHowItWorks: kutu('SilentFanHowItWorks'),
    SilentFanProblem: kutu('SilentFanProblem'),
    SilentFanTypeComparison: kutu('SilentFanTypeComparison'),
    SilentFanVorticeBrand: kutu('SilentFanVorticeBrand'),
    TrustSignals: kutu('TrustSignals'),
    VorticeBrand: kutu('VorticeBrand'),
  }
})

function kategori(slug: string) {
  const satir: DbCategory = {
    id: `cat-${slug}`,
    tenant_id: 'tenant-1',
    name: slug,
    slug,
    parent_id: null,
    level: 0,
    is_active: true,
    is_featured: false,
    sort_order: 0,
    image_url: null,
    seo_title: null,
    seo_desc: null,
    display_mode: null,
    menu_label: null,
    marketing_title: null,
    translation_key: null,
    description: null,
    metadata: null,
    authority_content: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  }
  return mapDatabaseCategoryToDomain(satir)
}

function aile(slug: string): FamilyListItem {
  return {
    id: slug,
    name: slug,
    slug,
    series_code: null,
    description: null,
    brand_name: null,
    category_id: 'cat-1',
    subcategory_id: null,
    cover_image_path: null,
    variant_count: 1,
    min_price: null,
    total_count: 1,
  }
}

describe('hava perdesi sihirbazı kapısı (URN-83)', () => {
  it('kapı bilerek KAPALI — açılırsa bu dosyanın "kapalı" kolları bilerek tersine çevrilir', () => {
    expect(AIR_CURTAIN_WIZARD_ENABLED).toBe(false)
  })

  describe('kategori sayfası (CategoryLandingView, slug: air-curtains)', () => {
    it('BottomCTA sihirbaz giriş noktası ALMAZ (kart ve tetikleyici yok)', () => {
      render(<CategoryLanding category={kategori('air-curtains')} families={[aile('vortice-hava-perdesi')]} />)
      const cta = screen.getByTestId('BottomCTA')
      expect(cta.getAttribute('data-show-wizard')).toBe('false')
      expect(cta.getAttribute('data-open-wizard')).toBe('false')
    })

    it('TypeComparison "Bana Yardım Et" tetikleyicisi ALMAZ', () => {
      render(<CategoryLanding category={kategori('air-curtains')} families={[aile('vortice-hava-perdesi')]} />)
      expect(screen.getByTestId('TypeComparison').getAttribute('data-open-wizard')).toBe('false')
    })

    it('sihirbazın kendisi sayfaya hiç takılmaz', () => {
      render(<CategoryLanding category={kategori('air-curtains')} families={[aile('vortice-hava-perdesi')]} />)
      expect(screen.queryByTestId('hava-perdesi-sihirbazi')).toBeNull()
    })

    it('SESSİZ FAN sayfasında kart AÇIK kalır: ayrı ve çalışan sihirbaz kapıdan etkilenmez', () => {
      render(
        <CategoryLanding
          category={kategori('duct-fans')}
          families={[aile('vortice-lineo-quiet-sessiz-kanal-fanlari')]}
        />,
      )
      const cta = screen.getByTestId('BottomCTA')
      expect(cta.getAttribute('data-show-wizard')).toBe('true')
      expect(cta.getAttribute('data-open-wizard')).toBe('true')
      expect(screen.getByTestId('sessiz-fan-sihirbazi')).toBeInTheDocument()
      expect(screen.queryByTestId('hava-perdesi-sihirbazi')).toBeNull()
    })
  })

  describe('vitrin sayfası (CategoryShowcaseView, slug hava-perde içerir)', () => {
    it('kahraman bölümündeki "Bana Uygun Modeli Bul" düğmesi çizilmez', () => {
      render(<CategoryShowcaseView category={kategori('hava-perdesi')} subCategories={[]} />)
      expect(screen.queryByText('category.findModel')).toBeNull()
    })

    it('BottomCTA sihirbaz giriş noktası ALMAZ ve sihirbaz sayfaya takılmaz', () => {
      render(<CategoryShowcaseView category={kategori('hava-perdesi')} subCategories={[]} />)
      const cta = screen.getByTestId('BottomCTA')
      expect(cta.getAttribute('data-show-wizard')).toBe('false')
      expect(cta.getAttribute('data-open-wizard')).toBe('false')
      expect(screen.queryByTestId('hava-perdesi-sihirbazi')).toBeNull()
    })
  })
})
