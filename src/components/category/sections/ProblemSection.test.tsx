import { render } from '@testing-library/react'
import React from 'react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getDictValue } from '@/i18n/getDictValue'

import ProblemSection from './ProblemSection'

/**
 * URN-80 — hava perdesi "problem" bölümü KAYNAKSIZ rakam basmaz.
 *
 * NİÇİN: dört kartta büyük "stat" rakamları ('%30', '15°C', '2.5 m/s', '7/24') ve "Hava perdesi ile"
 * listesinde "%30'a varan tasarruf" vardı. Kaynak dizininde (Vortice AIR DOOR kataloğu) bu rakamların
 * hiçbiri geçmiyor; katalog yalnız ısıtma ve soğutma maliyetinde tasarruftan söz ediyor.
 * GERÇEK sözlükle ve GERÇEK bileşenle render edilir; kart başlıkları ve açıklamaları yerinde kalır
 * (düzen bozulmaz, boş rakam kutusu çıkmaz). Kaynak taraması: conformance/vitrin-kaynaksiz-metin-yok.test.ts.
 */
const durum = vi.hoisted(() => ({ lang: 'tr' as 'tr' | 'en' }))

vi.mock('@/i18n/I18nProvider', async () => {
  const { tr: trSozluk } = await import('@/i18n/dictionaries/tr')
  const { en: enSozluk } = await import('@/i18n/dictionaries/en')
  const { getDictValue: coz } = await import('@/i18n/getDictValue')
  return {
    useI18n: () => ({
      t: (k: string) => coz(durum.lang === 'en' ? enSozluk : trSozluk, k),
      lang: durum.lang,
    }),
  }
})

beforeAll(() => {
  class MockIntersectionObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

describe.each([
  ['tr', tr],
  ['en', en],
] as const)('ProblemSection (URN-80) — %s', (dil, sozluk) => {
  it('kaynaksız rakamlar ("%30", "15°C", "2.5 m/s", "7/24") hiçbir yerde basılmaz', () => {
    durum.lang = dil
    const { container } = render(<ProblemSection />)
    const metin = container.textContent ?? ''
    expect(metin, 'bölüm rakam basıyor').not.toMatch(/\d/)
    // boş evren muhafızı: sözlük çözüldü, ham anahtar basılmadı
    expect(metin).not.toContain('problemSection.')
    expect(metin).toContain(getDictValue(sozluk, 'category.problemSection.headerTitle'))
  })

  it('dört kartın dördü de başlık + açıklamayla kalır; rakam kutusu (büyük rakam öğesi) yok', () => {
    durum.lang = dil
    const { container } = render(<ProblemSection />)
    const kartlar = [...container.querySelectorAll('.group')]
    expect(kartlar).toHaveLength(4)
    const anahtarlar = ['energyLoss', 'tempDiff', 'airflow', 'pest'] as const
    anahtarlar.forEach((a, i) => {
      const baslik = getDictValue(sozluk, `category.problemSection.${a}Title`)
      const aciklama = getDictValue(sozluk, `category.problemSection.${a}Desc`)
      expect(kartlar[i].querySelector('h3')?.textContent).toBe(baslik)
      expect(kartlar[i].querySelector('p')?.textContent).toBe(aciklama)
      // eski rakam kutusu `text-2xl sm:text-4xl font-bold` sınıflı tek `div` idi; kartta artık büyük rakam öğesi yok
      expect(kartlar[i].querySelector('.sm\\:text-4xl'), `${a} kartında eski rakam kutusu geri gelmiş`).toBeNull()
    })
  })

  it('"Hava perdesi ile" listesi yüzde vaadi taşımaz, katalogdaki olguyu söyler', () => {
    durum.lang = dil
    const { container } = render(<ProblemSection />)
    const nokta = getDictValue(sozluk, 'category.problemSection.withPoint2')
    expect(container.textContent).toContain(nokta)
    expect(nokta).not.toMatch(/\d|%/)
  })
})
