/**
 * INV-VORTICE-SAYAC-1 (URN-95, URN-82 devamı) — Vortice marka bölümlerindeki "Ürün Ailesi" ve "Aktif Model" sayaç
 * kartlarının DEĞERİ sunucudan gelen katalog sayısıdır; sayı yoksa kart çizilmez, ham şablon asla basılmaz.
 *
 * NİÇİN VAR: BLG-6 tablosu iki kartı `{aile}` / `{model}` şablonuyla yazmıştı; bu bileşenlere sayı hiç verilmiyordu ve
 * canlıda ham şablon görünecekti (URN-82 kartları boşalttı). Üç tuzağı sabitler:
 *  1. Sayı varsa kart değeri o sayıdır, etiket sözlükten (TR + EN).
 *  2. Sayı yoksa ya da geçersizse (0, kesirli, negatif, NaN) kart HİÇ çizilmez; etiket tek başına basılmaz.
 *  3. İki bölüm (hava perdesi ve sessiz fan) AYNI tabloyu (`vorticeSayac.ts`) okur: biri ötekinden ayrışamaz.
 *
 * ÖLÇMEDİĞİ: sayının DB'den doğru türediği (servis testi `family.service.marka-ozeti` ve canlı ölçüm). Sunucudan
 * bölüme zincir (`kategoriSayfasi.tsx` → `CategoryPage` → `CategoryMasterView` → `CategoryLandingView`) yalnız METİN
 * düzeyinde sabitlenir (her halkanın prop'u bir sonrakine verdiği); gerçek veriyle uçtan uca ölçüm canlı sayfada
 * ayrıca yapılır.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { render } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'

import SilentFanVorticeBrand from './silent-fan/SilentFanVorticeBrand'
import VorticeBrand from './VorticeBrand'
import { SAYAC_KAYNAGI, sayacDegeri } from './vorticeSayac'

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

vi.mock('@/components/ui/VentImage', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

beforeAll(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

afterEach(() => {
  kaynak.dict = {}
})

const BOLUMLER = [
  ['hava perdesi (VorticeBrand)', (sayilar?: { aile: number; model: number } | null) => <VorticeBrand katalogSayilari={sayilar} />],
  ['sessiz fan (SilentFanVorticeBrand)', (sayilar?: { aile: number; model: number } | null) => <SilentFanVorticeBrand katalogSayilari={sayilar} />],
] as const

const SABLON = /\{\{?\s*(?:aile|model)\s*\}?\}/

describe('sayacDegeri / SAYAC_KAYNAGI', () => {
  it('1. kart ürün ailesi, 2. kart model; diğer kartlar sayaç değildir', () => {
    expect(SAYAC_KAYNAGI).toEqual({ 1: 'aile', 2: 'model' })
    expect(sayacDegeri({ aile: 12, model: 87 }, 1)).toBe('12')
    expect(sayacDegeri({ aile: 12, model: 87 }, 2)).toBe('87')
    expect(sayacDegeri({ aile: 12, model: 87 }, 0)).toBeUndefined()
    expect(sayacDegeri({ aile: 12, model: 87 }, 3)).toBeUndefined()
  })

  it('hata yolları: sayı yok ya da geçersiz → null (kart çizilmez)', () => {
    for (const gecersiz of [null, undefined]) {
      expect(sayacDegeri(gecersiz, 1)).toBeNull()
      expect(sayacDegeri(gecersiz, 2)).toBeNull()
    }
    for (const sayi of [0, -3, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(sayacDegeri({ aile: sayi, model: sayi }, 1), `aile=${sayi}`).toBeNull()
      expect(sayacDegeri({ aile: sayi, model: sayi }, 2), `model=${sayi}`).toBeNull()
    }
  })
})

describe.each(BOLUMLER)('Vortice sayaç kartları · %s', (_ad, cizBolum) => {
  it('TR: sayı varsa iki kart değer + etiketle çizilir, ham şablon yok', () => {
    kaynak.dict = tr
    const { container } = render(cizBolum({ aile: 12, model: 87 }))
    const metin = container.textContent ?? ''
    expect(metin).toContain('Vortice Ürün Ailesi')
    expect(metin).toContain('Vortice Aktif Model')
    expect(metin).toContain('12')
    expect(metin).toContain('87')
    expect(metin).not.toMatch(SABLON)
  })

  it('EN: etiketler İngilizce sözlükten', () => {
    kaynak.dict = en
    const { container } = render(cizBolum({ aile: 12, model: 87 }))
    const metin = container.textContent ?? ''
    expect(metin).toContain('Vortice Product Families')
    expect(metin).toContain('Vortice Active Models')
    expect(metin).not.toContain('Vortice Ürün Ailesi')
    expect(metin).not.toMatch(SABLON)
  })

  it('sayı yoksa (null / verilmedi) iki kart da çizilmez; etiket tek başına basılmaz', () => {
    kaynak.dict = tr
    for (const sayilar of [null, undefined]) {
      const { container, unmount } = render(cizBolum(sayilar))
      const metin = container.textContent ?? ''
      expect(metin).not.toContain('Vortice Ürün Ailesi')
      expect(metin).not.toContain('Vortice Aktif Model')
      expect(metin).not.toMatch(SABLON)
      unmount()
    }
  })

  it('kesik sayı: model geçersizse yalnız o kart düşer, ürün ailesi kartı çizilir', () => {
    kaynak.dict = tr
    const { container } = render(cizBolum({ aile: 12, model: 0 }))
    const metin = container.textContent ?? ''
    expect(metin).toContain('Vortice Ürün Ailesi')
    expect(metin).not.toContain('Vortice Aktif Model')
  })

  it('olumlu kontrol: sayaç dışı kart (ülke) sayı olmasa da çizilir', () => {
    kaynak.dict = tr
    const { container } = render(cizBolum(null))
    expect(container.textContent ?? '').toContain('İtalya')
  })
})

describe('sunucudan bölüme zincir: her halka sayıyı bir sonrakine verir', () => {
  const kaynakOku = (...parca: string[]) => readFileSync(join(process.cwd(), 'src', ...parca), 'utf8')

  it('kategoriSayfasi → CategoryPage → CategoryMasterView (iki görünüm) → CategoryLandingView → iki bölüm', () => {
    expect(kaynakOku('app', '_components', 'kategoriSayfasi.tsx')).toMatch(/vorticeKatalogSayilari=\{vorticeSayilari\}/)
    expect(kaynakOku('views', 'CategoryPage.tsx')).toMatch(/vorticeKatalogSayilari=\{vorticeKatalogSayilari\}/)
    const master = kaynakOku('views', 'CategoryMasterView.tsx')
    expect(master.match(/vorticeKatalogSayilari=\{vorticeKatalogSayilari\}/g)).toHaveLength(2)
    const landing = kaynakOku('views', 'category', 'CategoryLandingView.tsx')
    expect(landing).toMatch(/<VorticeBrand katalogSayilari=\{vorticeKatalogSayilari\}/)
    expect(landing).toMatch(/<SilentFanVorticeBrand katalogSayilari=\{vorticeKatalogSayilari\}/)
  })
})
