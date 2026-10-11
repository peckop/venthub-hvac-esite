import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { en } from '../../../i18n/dictionaries/en'
import { tr } from '../../../i18n/dictionaries/tr'
import { getDictValue } from '../../../i18n/getDictValue'
import CinematicProductShowcase from '../CinematicProductShowcase'

/**
 * URN-80 — vitrin görsellerinin alt metni OLGUSAL ve sözlükten gelir.
 *
 * NİÇİN: iki görselin alt metni koda gömülü ham İngilizce pazarlama sözüydü ('Futuristic Premium',
 * '360 Series View'): görselin ne gösterdiğini söylemiyor, dil değişince çevrilmiyor, ekran okuyucuya
 * "premium" diye okunuyordu. Görsellerin ikisi de Vortice Lineo serisi kanal tipi fandır (dosya adı +
 * sözlükteki seri adı). Gerçek sözlükle render edilir; alt metin tam sözlük metnine eşit olmalıdır.
 */
const durum = vi.hoisted(() => ({ lang: 'tr' as 'tr' | 'en' }))

vi.mock('../../../i18n/I18nProvider', async () => {
  const { tr: trSozluk } = await import('../../../i18n/dictionaries/tr')
  const { en: enSozluk } = await import('../../../i18n/dictionaries/en')
  const { getDictValue: coz } = await import('../../../i18n/getDictValue')
  return {
    useI18n: () => ({
      t: (k: string) => coz(durum.lang === 'en' ? enSozluk : trSozluk, k),
      lang: durum.lang,
    }),
  }
})

describe.each([
  ['tr', tr],
  ['en', en],
] as const)('CinematicProductShowcase görsel alt metinleri (URN-80) — %s', (dil, sozluk) => {
  it('büyük görsel ve küçük resim alt metinleri sözlükten gelir; "Futuristic"/"Premium"/"360 Series" yok', () => {
    durum.lang = dil
    const { container } = render(<CinematicProductShowcase />)
    const altlar = [...container.querySelectorAll('img')].map((i) => i.getAttribute('alt') ?? '')
    // boş evren muhafızı: büyük görsel (1) + iki küçük resim (2)
    expect(altlar.length).toBeGreaterThanOrEqual(3)
    const beklenen = [
      getDictValue(sozluk, 'home.cinematicShowcase.imageAlt.airflow'),
      getDictValue(sozluk, 'home.cinematicShowcase.imageAlt.side'),
    ]
    for (const alt of altlar) {
      expect(alt, 'alt metin boş').not.toBe('')
      expect(alt).not.toMatch(/futuristic|premium|360 series/i)
      expect(beklenen, `alt metin sözlükte yok: "${alt}"`).toContain(alt)
    }
    // ilk görsel (büyük) hava akışı çizgili olan, küçük resimler ikisi birden
    expect(altlar[0]).toBe(beklenen[0])
    expect(new Set(altlar)).toEqual(new Set(beklenen))
  })
})
