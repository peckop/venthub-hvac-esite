/**
 * URN-21 — Modeller satırının `<a href>` adresi tek üreticiden gelir (`modelBaglantiAdresi`) ve
 * `ProductDetailPageView` seçiciye bunu verir. Bayrak KAPALI: `?sku=`; AÇIK: modelin kısa adresi.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { modelBaglantiAdresi } from '../yuzeyAdresleri'

describe('modelBaglantiAdresi', () => {
  it('KAPALI: aile adresi + ?sku= (model sayfası yokken var olan sayfaya gider), her iki dilde', () => {
    expect(modelBaglantiAdresi('tr', 'avens-bvu-ls', 'ABC-1', false)).toBe('/tr/products/avens-bvu-ls?sku=ABC-1')
    expect(modelBaglantiAdresi('en', 'avens-bvu-ls', 'ABC-1', false)).toBe('/en/products/avens-bvu-ls?sku=ABC-1')
  })

  it('AÇIK: modelin kendi kısa adresi, ?sku= yok; sku küçük harf (plan §2)', () => {
    const tr = modelBaglantiAdresi('tr', 'avens-bvu-ls', 'ABC-1', true)
    const en = modelBaglantiAdresi('en', 'avens-bvu-ls', 'ABC-1', true)
    expect(tr).toBe('/tr/urun/avens-bvu-ls-p-abc-1')
    expect(en).toBe('/en/products/avens-bvu-ls-p-abc-1')
    expect(`${tr}${en}`).not.toContain('sku=')
  })
})

describe('ProductDetailPageView → VariantSelector bağlaması (kaynak denetimi)', () => {
  const kaynak = readFileSync(join(process.cwd(), 'src/app/_components/ProductDetailPageView.tsx'), 'utf8')

  it('modelAdresi üreticiden kurulur ve iki seçici örneğine de verilir', () => {
    expect(kaynak).toMatch(/const modelAdresi = \(sku: string\): string => modelBaglantiAdresi\(adresDili\(lang\), family\?\.slug \?\? '', sku\)/)
    expect(kaynak.match(/modelAdresi=\{modelAdresi\}/g)).toHaveLength(2)
  })
})
