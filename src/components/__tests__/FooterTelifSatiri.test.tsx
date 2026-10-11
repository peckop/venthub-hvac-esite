import { render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Footer from '../Footer'

/**
 * URN-83 — altbilgi telif satırı yasal unvan / uydurma ek taşımaz.
 *
 * KORUDUĞU KUSUR: altbilgi "© 2026 VentHub HVAC. Tüm hakları saklıdır." yazıyordu. Giriş sayfasındaki
 * "© 2026 VentHub HVAC Solutions." ile aynı sınıftan bir kusur: şirket henüz kurulmadı; "HVAC." eki marka adına
 * yapışık bir unvan gibi okunur. Telif satırı yalnız marka adını ("VentHub") taşır ve adı giriş sayfasıyla AYNI
 * sözlük anahtarından (`common.brandLegalName`) alır — unvan kesinleşince tek yerden değişir.
 *
 * Giriş sayfası tarafı kaynak + sözlük düzeyinde `giris-alt-yazi-marka.test.ts`'te ölçülür; bu dosya altbilgiyi
 * GERÇEK sözlüklerle ÇİZİP ekranda okur (iki dil).
 *
 * NE ÖLÇMEZ: altbilgideki diğer metinleri; yasal unvanın kesinleşmiş hâlini (o gün bu kapı bilerek güncellenir).
 */
let dil: 'tr' | 'en' = 'tr'

vi.mock('../../i18n/I18nProvider', async () => {
  const { getDictValue } = await import('../../i18n/getDictValue')
  const { tr } = await import('../../i18n/dictionaries/tr')
  const { en } = await import('../../i18n/dictionaries/en')
  return {
    useI18n: () => ({ lang: dil, t: (anahtar: string) => getDictValue(dil === 'tr' ? tr : en, anahtar) }),
  }
})

vi.mock('../../contexts/CategoryContext', () => ({ useCategories: () => ({ categories: [] }) }))

vi.mock('../../hooks/useLocalizedRoutes', () => {
  const rota = (): unknown => new Proxy(() => '/x', { get: () => rota(), apply: () => '/x' })
  return { useLocalizedRoutes: () => rota() }
})

vi.mock('../BuildTag', () => ({ default: () => null }))

const YIL = new Date().getFullYear()

describe('Footer telif satırı (URN-83)', () => {
  beforeEach(() => {
    dil = 'tr'
  })

  it.each([
    ['tr', `© ${YIL} VentHub. Tüm hakları saklıdır.`],
    ['en', `© ${YIL} VentHub. All rights reserved.`],
  ] as const)('%s: telif satırı yalnız marka adını taşır', (kod, beklenen) => {
    dil = kod
    render(<Footer />)
    // Pozitif anchor: satır bulunur (bulunamazsa getByText kendisi kırar → ölçüt kör kalamaz).
    const satir = screen.getByText(/^©/)
    expect(satir.textContent?.replace(/\s+/g, ' ').trim()).toBe(beklenen)
  })

  it.each(['tr', 'en'] as const)('%s: telif satırında "HVAC" eki ya da unvan kalıbı yok', (kod) => {
    dil = kod
    render(<Footer />)
    const satir = screen.getByText(/^©/).textContent ?? ''
    expect(satir).not.toMatch(/HVAC/i)
    expect(satir).not.toMatch(/\b(solutions|a\.?ş\.?|ltd\.?|limited|şti\.?|inc\.?|llc|gmbh|corp\.?)\b/i)
  })
})
