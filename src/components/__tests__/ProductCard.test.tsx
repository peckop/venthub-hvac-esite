/**
 * REC-493 — ürün kartı AİLE adresine doğrudan bağlanır (308 ara durağı olmadan).
 *
 * NİÇİN (canlı kapı 2026-10-09): ana sayfadaki 4 ürün kartının dördü de
 * `/tr/products/12-kw-elektrikli-isitici-13034` gibi MODEL slug'ına bağlıydı; PDP aile adresidir, bu yüzden
 * her tıklama `/tr/products/avens-elektrikli-kanal-isiticilari?sku=AVE-13034`'e 308 alıyordu. Kartın
 * elinde yalnız model slug'ı vardı (aile slug'ı satırla gelmiyordu).
 *
 * Kilitlenenler: (1) aile slug'ı varsa adres `/<dil>/products/<aile>?sku=<kod>`, TR ve EN; (2) aile slug'ı
 * yoksa (null ya da hiç gelmedi) ESKİ model adresi AYNEN — yedek, hata değil; (3) liste görünümü de aynı;
 * (4) `?sku=` yalnız adreste durur, kartın görünen metnine SIZMAZ (INV-SKU-GORUNMEZ-1).
 */
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

// ⚠Çeviri nesnesi TEK KEZ kurulur: gerçek `useI18n` kararlı döndürür, `useLocalizedRoutes` onun `lang`ine
// `useMemo` bağlar. Dil değişimi testte `mockReturnValue` ile yapılır, her çağrıda yeni nesne üretilmez.
const i18n = vi.hoisted(() => ({
  durum: { lang: 'tr', t: (k: string) => k },
}))

vi.mock('../../i18n/I18nProvider', () => ({ useI18n: () => i18n.durum }))
vi.mock('../../lib/images/productImage', () => ({ resolveProductImageUrl: () => null }))
vi.mock('../ui/VentImage', () => ({ default: () => null }))
vi.mock('../HVACIcons', () => ({ BrandIcon: () => null }))

import type { StorefrontProduct } from '../ProductCard'
import ProductCard from '../ProductCard'

function urun(ek: Partial<StorefrontProduct> = {}): StorefrontProduct {
  const taban: Partial<StorefrontProduct> = {
    id: 'p-12kw',
    name: '12 kW Elektrikli Isıtıcı',
    brand: 'AVENS',
    sku: 'AVE-13034',
    slug: '12-kw-elektrikli-isitici-13034',
    model_code: null,
    is_featured: false,
    ...ek,
  }
  return taban as StorefrontProduct
}

function baglanti(container: HTMLElement): string | null {
  return container.querySelector('a')?.getAttribute('href') ?? null
}

const AILE = 'avens-elektrikli-kanal-isiticilari'

describe('ProductCard · ürün bağlantısı (REC-493)', () => {
  it('aile slug\'ı varsa TR kart doğrudan aile adresine + ?sku= ile bağlanır', () => {
    i18n.durum = { lang: 'tr', t: (k: string) => k }
    const { container } = render(<ProductCard product={urun({ family_slug: AILE })} compact hidePrice />)
    expect(baglanti(container)).toBe(`/tr/products/${AILE}?sku=AVE-13034`)
  })

  it('aynı kart EN dilinde /en önekiyle aynı aile adresine bağlanır', () => {
    i18n.durum = { lang: 'en', t: (k: string) => k }
    const { container } = render(<ProductCard product={urun({ family_slug: AILE })} compact hidePrice />)
    expect(baglanti(container)).toBe(`/en/products/${AILE}?sku=AVE-13034`)
  })

  it('aile slug\'ı null ise ESKİ model adresi aynen korunur (yedek kilitli)', () => {
    i18n.durum = { lang: 'tr', t: (k: string) => k }
    const { container } = render(<ProductCard product={urun({ family_slug: null })} compact hidePrice />)
    expect(baglanti(container)).toBe('/tr/products/12-kw-elektrikli-isitici-13034')
  })

  it('aile slug\'ı hiç gelmediyse (alan yok) ESKİ model adresi aynen korunur', () => {
    i18n.durum = { lang: 'tr', t: (k: string) => k }
    const { container } = render(<ProductCard product={urun()} compact hidePrice />)
    expect(baglanti(container)).toBe('/tr/products/12-kw-elektrikli-isitici-13034')
  })

  it('boş aile slug\'ı aile sayılmaz: kırık /products/?sku= üretmez, model adresine düşer', () => {
    i18n.durum = { lang: 'tr', t: (k: string) => k }
    const { container } = render(<ProductCard product={urun({ family_slug: '' })} compact hidePrice />)
    expect(baglanti(container)).toBe('/tr/products/12-kw-elektrikli-isitici-13034')
  })

  it('liste görünümü de aynı kuralı izler', () => {
    i18n.durum = { lang: 'tr', t: (k: string) => k }
    const aileli = render(<ProductCard product={urun({ family_slug: AILE })} layout="list" hidePrice />)
    expect(baglanti(aileli.container)).toBe(`/tr/products/${AILE}?sku=AVE-13034`)
    aileli.unmount()

    const ailesiz = render(<ProductCard product={urun({ family_slug: null })} layout="list" hidePrice />)
    expect(baglanti(ailesiz.container)).toBe('/tr/products/12-kw-elektrikli-isitici-13034')
  })

  it('SKU adreste durur, kartın görünen metnine SIZMAZ (INV-SKU-GORUNMEZ-1)', () => {
    i18n.durum = { lang: 'tr', t: (k: string) => k }
    const { container } = render(<ProductCard product={urun({ family_slug: AILE })} compact hidePrice />)
    expect(container.textContent ?? '').not.toContain('AVE-13034')
  })
})
