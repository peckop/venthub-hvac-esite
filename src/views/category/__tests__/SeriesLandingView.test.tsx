import { render, screen, within } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { I18nProvider,type Lang } from '@/i18n/I18nProvider'
import type { SeriesLanding } from '@/lib/services/family.service'
import type { DbCategory } from '@/types/db-rows'

import SeriesLandingView from '../SeriesLandingView'

/**
 * T138-VH K7 — SeriesLandingView breadcrumb bekçisi.
 *
 * ÖLÇÜM (K1'in bıraktığı hâl): breadcrumb yalnız İKİ basamak basıyordu — Ana Sayfa + seri adı.
 * Kategori/alt kategori katmanı YOKTU. Bu dosya o basamağı kilitler: kategori/alt kategori
 * VARSA breadcrumb'a girer (link + doğru href), YOKSA basamak sessizce atlanır (kırılmaz).
 *
 * `useI18n()` provider'sız da ÇALIŞIR ama `t()` fallback'i HAM ANAHTARI döner (ör.
 * "category.breadcrumbHome"), gerçek sözlük metnini DEĞİL — provider'sız test "Ana Sayfa"yı
 * hiç görmeden yeşil kalırdı (sahte-yeşil). Bu yüzden gerçek `I18nProvider` ile sarılır ve
 * sayfanın gerçekte aldığı `lang` PROP'uyla (RSC → view) BİREBİR aynı `lang` verilir — kök
 * layout'ta (`app/[lang]/layout.tsx`) ikisi hep birlikte kurulur, test de aynı eşleşmeyi taklit eder.
 */
function renderView(series: SeriesLanding['series'], lang: Lang = 'tr') {
  return render(
    <I18nProvider lang={lang}>
      <SeriesLandingView series={series} models={[]} lang={lang} />
    </I18nProvider>
  )
}

/**
 * Sorguları breadcrumb `<nav>`'ıyla SINIRLAR. Sayfanın geri kalanı (hero `<h1>`, BottomCTA)
 * kendi metnini/link'ini taşır — `screen` (tüm doküman) üzerinden sorgu, breadcrumb'a AİT
 * olmayan eşleşmeleri de sayar ve testi kırar (ölçüldü: `h1` "Lineo Quiet"i tekrarlıyor,
 * BottomCTA kendi link'ini basıyor).
 */
function breadcrumbNav() {
  return screen.getByRole('navigation', { name: 'Breadcrumb' })
}

function makeCategory(overrides: Partial<DbCategory> = {}): DbCategory {
  return {
    id: 'cat-1',
    tenant_id: 'tenant-1',
    name: 'Kanal Tipi Fanlar',
    slug: 'kanal-tipi-fanlar',
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
    ...overrides,
  }
}

function makeSeries(overrides: Partial<SeriesLanding['series']> = {}): SeriesLanding['series'] {
  return {
    id: 'series-1',
    name: 'Lineo Quiet',
    slug: 'lineo-quiet',
    series_code: 'LINEO',
    description: null,
    brand_name: 'Vortice',
    category_id: null,
    subcategory_id: null,
    category: null,
    subcategory: null,
    ...overrides,
  }
}

describe('SeriesLandingView breadcrumb', () => {
  it('kategori YOKSA yalnız Ana Sayfa + seri adı basamağı gösterir (K1 davranışı korunur)', () => {
    renderView(makeSeries())
    const nav = within(breadcrumbNav())

    expect(nav.getByRole('link', { name: /Ana Sayfa/i })).toBeInTheDocument()
    // Seri adı SON basamak — link değil, aktif sayfa (aria-current="page").
    expect(nav.getByText('Lineo Quiet')).toBeInTheDocument()
    expect(nav.queryAllByRole('link')).toHaveLength(1) // yalnız Ana Sayfa link'i
  })

  it('kategori VARSA breadcrumb\'a girer — doğru ada ve /category/<slug> href\'ine sahip', () => {
    const category = makeCategory({ id: 'cat-1', name: 'Kanal Tipi Fanlar', slug: 'kanal-tipi-fanlar' })
    renderView(makeSeries({ category_id: 'cat-1', category }))
    const nav = within(breadcrumbNav())

    const categoryLink = nav.getByRole('link', { name: 'Kanal Tipi Fanlar' })
    expect(categoryLink).toBeInTheDocument()
    expect(categoryLink.getAttribute('href')).toBe('/tr/category/kanal-tipi-fanlar')
  })

  it('kategori + alt kategori VARSA breadcrumb DÖRT basamaklı olur ve alt kategori href\'i iki segmentli kurulur', () => {
    const category = makeCategory({ id: 'cat-1', name: 'Fanlar', slug: 'fanlar' })
    const subcategory = makeCategory({ id: 'sub-1', name: 'Kanal Tipi', slug: 'kanal-tipi' })
    renderView(
      makeSeries({
        category_id: 'cat-1',
        subcategory_id: 'sub-1',
        category,
        subcategory,
      })
    )
    const nav = within(breadcrumbNav())

    // Ana Sayfa + Kategori + Alt kategori = 3 link; seri adı (son basamak) link DEĞİL.
    expect(nav.queryAllByRole('link')).toHaveLength(3)
    const subLink = nav.getByRole('link', { name: 'Kanal Tipi' })
    expect(subLink.getAttribute('href')).toBe('/tr/category/fanlar/kanal-tipi')
  })

  it('lang="en" iken breadcrumb href\'leri /en önekiyle kurulur (elle /tr/ yazılmaz — INV-2)', () => {
    const category = makeCategory({ id: 'cat-1', name: 'Fanlar', slug: 'fanlar' })
    renderView(makeSeries({ category_id: 'cat-1', category }), 'en')
    const nav = within(breadcrumbNav())

    const categoryLink = nav.getByRole('link', { name: 'Fanlar' })
    expect(categoryLink.getAttribute('href')).toBe('/en/category/fanlar')
  })
})
