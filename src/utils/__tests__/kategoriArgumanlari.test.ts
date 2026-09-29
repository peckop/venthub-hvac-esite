import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { adresUret } from '../adresUret'
import { adresRotalari, kategoriArgumanlari } from '../yuzeyAdresleri'

/**
 * REC-403 — üst kategoriyi ve dile göre slug'ı bilen yüzeyler `Routes.category`'ye TAM nesneyi verir.
 *
 * Ölçüm (2026-09-29, bayrak AÇIK): tek slug verilen dal (`/tr/kategori/kanal-tipi-fanlar`) ve EN kanonik
 * slug verilen TR kök (`/tr/kategori/fans`) kanonik adrese doğrudan değil, sayfa katmanının 308'i
 * üzerinden bir fazla sıçramayla ulaşıyordu. Kapalıyken (bugün) yüzeylerin çağrısı BİREBİR aynı kalmalı.
 */

const KANONIK_DAL = adresUret({ tur: 'kategori', kok: 'fanlar', dal: 'kanal-tipi-fanlar' }, 'tr', true)

describe('REC-403 · kategoriArgumanlari', () => {
  it('bayrak KAPALI: bugünkü tek slug çağrısı birebir (üst ve dil slug\'ı YOK SAYILIR)', () => {
    const k = kategoriArgumanlari('fans', { slug: 'fanlar', ustSlug: 'ust' }, false)
    expect(k).toEqual({ slug: 'fans' })
    const r = adresRotalari('tr', false)
    expect(r.category(k.slug, k.subSlug)).toBe(r.category('fans'))
  })

  it('bayrak AÇIK, dal + üst: kanonik iki seviyeli adres, sıçramasız', () => {
    const k = kategoriArgumanlari('kanal-tipi-fanlar', { slug: 'kanal-tipi-fanlar', ustSlug: 'fanlar' }, true)
    expect(k).toEqual({ slug: 'fanlar', subSlug: 'kanal-tipi-fanlar' })
    const r = adresRotalari('tr', true)
    expect(r.category(k.slug, k.subSlug)).toBe(KANONIK_DAL)
  })

  it('bayrak AÇIK: eski tek slug çağrısı kanoniğe EŞİT DEĞİL (sıçrama vardı — ölçüm kaydı)', () => {
    const r = adresRotalari('tr', true)
    expect(r.category('kanal-tipi-fanlar')).not.toBe(KANONIK_DAL)
  })

  it('bayrak AÇIK, dile göre kök slug: TR sayfada `fanlar`, kanonik adres', () => {
    const k = kategoriArgumanlari('fans', { slug: 'fanlar' }, true)
    expect(k).toEqual({ slug: 'fanlar' })
    const r = adresRotalari('tr', true)
    expect(r.category(k.slug, k.subSlug)).toBe(adresUret({ tur: 'kategori', kok: 'fanlar' }, 'tr', true))
  })

  it('bayrak AÇIK: üst yok ya da dalın kendisi ise tek slug', () => {
    expect(kategoriArgumanlari('x', { slug: 'x', ustSlug: null }, true)).toEqual({ slug: 'x' })
    expect(kategoriArgumanlari('x', { slug: 'x', ustSlug: 'x' }, true)).toEqual({ slug: 'x' })
    expect(kategoriArgumanlari('x', { slug: 'x', ustSlug: '' }, true)).toEqual({ slug: 'x' })
  })
})

describe('REC-403 · yüzeyler yardımcıyı KULLANIR (kaynak kapısı)', () => {
  const oku = (yol: string) => readFileSync(resolve(__dirname, '../../', yol), 'utf8')

  it('Orbital çift tık ve Hub alt kategori dalı ham tek slug çağrısına dönmemiş', () => {
    const orbital = oku('components/products/OrbitalProductsShowcase.tsx')
    expect(orbital).toContain('kategoriArgumanlari(')
    expect(orbital).not.toMatch(/Routes\.category\(\s*item\.id\s*\)/)

    const hub = oku('components/navigation/CategoryHubOverlay.tsx')
    expect(hub).toContain('kategoriArgumanlari(')
    expect(hub).not.toMatch(/Routes\.category\(\s*getLocalizedCategorySlug\(subCategory,\s*lang\)\s*\)/)
  })

  it('karusel dal kartlarına üst slug\'ı ve dile göre slug\'ı verir', () => {
    const karusel = oku('components/products/CategoryOrbitCarousel.tsx')
    expect(karusel).toContain('parentSlug: activeMainUrlSlug')
    expect(karusel.match(/urlSlug: getLocalizedCategorySlug\(vm\.raw, lang\)/g)?.length).toBe(2)
  })
})
