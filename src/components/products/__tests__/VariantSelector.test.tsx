/**
 * URN-21 — Modeller bölümü: her satır gerçek `<a href>` (model sayfası adresi), satır başına TAM 1 bağlantı.
 * Üç görünüm de kapsanır (hap ≤12, aranabilir liste 13-19, matris ≥20). Düz tık yerinde seçer;
 * değiştirici tuşlu tık tarayıcıya kalır.
 */
import { fireEvent, render } from '@testing-library/react'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { FamilyVariant } from '@/lib/services/family.service'

import { VariantSelector } from '../VariantSelector'

vi.mock('@/i18n/I18nProvider', () => ({
  useI18n: () => ({ t: (k: string) => k, lang: 'tr' }),
}))

function varyant(i: number): FamilyVariant {
  return {
    id: `id-${i}`,
    sku: `sku-${i}`,
    name: `Model ${i}`,
    slug: null,
    model_code: `MC-${i}`,
    price: 100 + i,
    stock_qty: 1,
    technical_specs: { debi: i, guc: i * 2 },
    description: null,
    images: [],
  }
}
const liste = (n: number) => Array.from({ length: n }, (_, i) => varyant(i + 1))
const adres = (sku: string) => `/tr/products/aile?sku=${sku}`

function html(n: number) {
  return renderToStaticMarkup(
    <VariantSelector variants={liste(n)} selectedSku="sku-1" onSelect={() => {}} modelAdresi={adres} quoteMode={false} />,
  )
}
const baglantilar = (h: string) => [...h.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'))

describe('VariantSelector: Modeller satırları gerçek bağlantı', () => {
  it.each([[5], [12], [15]])('%i model (hap/liste): satır başına tam 1 <a>, hedef model adresi, <button> yok', (n) => {
    const h = html(n)
    expect(baglantilar(h)).toEqual(liste(n).map((v) => adres(v.sku)))
    expect(h).not.toMatch(/<button[^>]*aria-pressed/)
  })

  it('seçili satır aria-current, diğerleri değil', () => {
    const h = html(5)
    expect(h.match(/aria-current="true"/g)).toHaveLength(1)
  })

  it('20+ model matris görünümünde de satır başına 1 <a> (liste görünümü varsayılan)', () => {
    const { container, getByText } = render(
      <VariantSelector variants={liste(24)} selectedSku="sku-1" onSelect={() => {}} modelAdresi={adres} quoteMode={false} />,
    )
    expect(container.querySelectorAll('a[href]')).toHaveLength(24)
    fireEvent.click(getByText('pdp.variant.viewMatrix'))
    const a = [...container.querySelectorAll('a[href]')].map((e) => e.getAttribute('href'))
    expect(a).toEqual(liste(24).map((v) => adres(v.sku)))
  })

  it('mobilde dokunma hedefi 44px: hap ve satır bağlantılarında min-h-11', () => {
    expect(html(5).match(/<a\b[^>]*min-h-11/g)).toHaveLength(5)
    expect(html(15).match(/<a\b[^>]*min-h-11/g)).toHaveLength(15)
  })

  it('düz sol tık varsayılan gezinmeyi iptal edip onSelect çağırır', () => {
    const onSelect = vi.fn()
    const { container } = render(
      <VariantSelector variants={liste(5)} selectedSku={null} onSelect={onSelect} modelAdresi={adres} quoteMode={false} />,
    )
    const ikinci = container.querySelectorAll('a[href]')[1]
    const tiklamaDevam = fireEvent.click(ikinci)
    expect(onSelect).toHaveBeenCalledWith('sku-2')
    expect(tiklamaDevam).toBe(false) // preventDefault çağrıldı
  })

  it('Enter (tarayıcı click üretir, button=0) seçer; keydown Enter ayrıca seçmez (çift çağrı yok)', () => {
    const onSelect = vi.fn()
    const { container } = render(
      <VariantSelector variants={liste(5)} selectedSku={null} onSelect={onSelect} modelAdresi={adres} quoteMode={false} />,
    )
    const a = container.querySelectorAll('a[href]')[2]
    expect(fireEvent.keyDown(a, { key: 'Enter' })).toBe(true)
    expect(onSelect).not.toHaveBeenCalled()
    fireEvent.click(a, { button: 0, detail: 0 })
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('sku-3')
  })

  it('Space seçer ve sayfa kaymasın diye varsayılanı iptal eder (eski <button> davranışı)', () => {
    const onSelect = vi.fn()
    const { container } = render(
      <VariantSelector variants={liste(5)} selectedSku={null} onSelect={onSelect} modelAdresi={adres} quoteMode={false} />,
    )
    const a = container.querySelectorAll('a[href]')[3]
    expect(fireEvent.keyDown(a, { key: ' ' })).toBe(false)
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('sku-4')
  })

  it('değiştirici tuşlu Space ve diğer tuşlar seçmez', () => {
    const onSelect = vi.fn()
    const { container } = render(
      <VariantSelector variants={liste(5)} selectedSku={null} onSelect={onSelect} modelAdresi={adres} quoteMode={false} />,
    )
    const a = container.querySelectorAll('a[href]')[0]
    for (const ek of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }]) {
      expect(fireEvent.keyDown(a, { key: ' ', ...ek })).toBe(true)
    }
    fireEvent.keyDown(a, { key: 'a' })
    fireEvent.keyDown(a, { key: 'Tab' })
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('orta tık (button=1), sağ tık ve Alt tık seçmez, tarayıcıya kalır', () => {
    const onSelect = vi.fn()
    const { container } = render(
      <VariantSelector variants={liste(5)} selectedSku={null} onSelect={onSelect} modelAdresi={adres} quoteMode={false} />,
    )
    const ilk = container.querySelectorAll('a[href]')[0]
    expect(fireEvent.click(ilk, { button: 1 })).toBe(true)
    expect(fireEvent.click(ilk, { button: 2 })).toBe(true)
    expect(fireEvent.click(ilk, { altKey: true })).toBe(true)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('href tamamen modelAdresi prop\'undan gelir: model kısa adresi (bayrak AÇIK kipi) olduğu gibi yazılır', () => {
    const kisa = (sku: string) => `/tr/urun/aile-p-${sku}`
    const h = renderToStaticMarkup(
      <VariantSelector variants={liste(3)} selectedSku={null} onSelect={() => {}} modelAdresi={kisa} quoteMode={false} />,
    )
    expect(baglantilar(h)).toEqual(['/tr/urun/aile-p-sku-1', '/tr/urun/aile-p-sku-2', '/tr/urun/aile-p-sku-3'])
  })

  it('Ctrl/Cmd/Shift tık tarayıcıya bırakılır: onSelect çağrılmaz, gezinme iptal edilmez', () => {
    const onSelect = vi.fn()
    const { container } = render(
      <VariantSelector variants={liste(5)} selectedSku={null} onSelect={onSelect} modelAdresi={adres} quoteMode={false} />,
    )
    const ilk = container.querySelectorAll('a[href]')[0]
    for (const tus of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }]) {
      expect(fireEvent.click(ilk, tus)).toBe(true)
    }
    expect(onSelect).not.toHaveBeenCalled()
  })
})
