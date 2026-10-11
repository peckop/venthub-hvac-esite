import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'
import { getDictValue } from '../../i18n/getDictValue'
import Footer from '../Footer'

/**
 * URN-80 — altbilgide ÇALIŞMA SAATİ yok; yerinde iletişim formu bağlantısı ve info@ satırı var.
 *
 * NİÇİN: "09:00 - 18:00 / 09:00 - 14:00" 2025-08-23 ilk şablon commit'inden kalmaydı, hiçbir kayıtta
 * karşılığı yoktu. Gerçek sözlükle ve GERÇEK bileşenle render edilir: sözlük anahtarı geri gelirse
 * (ya da bileşende sabit yeniden belirirse) basılan metinde saat görünür ve kol kırılır.
 * Yapı kapısı (kaynak taraması): src/__tests__/conformance/vitrin-kaynaksiz-metin-yok.test.ts.
 */
const durum = vi.hoisted(() => ({ lang: 'tr' as 'tr' | 'en' }))

vi.mock('../../i18n/I18nProvider', async () => {
  const { tr: trSozluk } = await import('../../i18n/dictionaries/tr')
  const { en: enSozluk } = await import('../../i18n/dictionaries/en')
  const { getDictValue: coz } = await import('../../i18n/getDictValue')
  return {
    useI18n: () => ({
      t: (k: string) => coz(durum.lang === 'en' ? enSozluk : trSozluk, k),
      lang: durum.lang,
    }),
  }
})

vi.mock('../../contexts/CategoryContext', () => ({
  useCategories: () => ({ categories: [] }),
}))

vi.mock('../../hooks/useLocalizedRoutes', () => {
  const rota = (): unknown =>
    new Proxy(() => '/x', {
      get: (_hedef, ozellik) => (ozellik === 'contact' ? () => '/tr/iletisim' : rota()),
      apply: () => '/x',
    })
  return { useLocalizedRoutes: () => rota() }
})

vi.mock('../BuildTag', () => ({ default: () => null }))

describe.each([
  ['tr', tr],
  ['en', en],
] as const)('Footer iletişim bloğu (URN-80) — %s', (dil, sozluk) => {
  it('çalışma saati kutusu, saat aralığı ve saat başlığı basılmaz', () => {
    durum.lang = dil
    const { container } = render(<Footer />)
    const metin = container.textContent ?? ''
    expect(metin, 'altbilgide saat aralığı görünüyor').not.toMatch(/\d{1,2}:\d{2}/)
    expect(metin).not.toMatch(/Çalışma Saatleri|Working Hours|Hafta İçi|Cumartesi|Saturday|Monday - Friday/i)
    // boş evren muhafızı: gerçek sözlük çözüldü, ham anahtar basılmadı
    expect(metin).not.toContain('footer.')
    expect(metin).toContain(getDictValue(sozluk, 'footer.contact'))
  })

  it('iletişim formu bağlantısı iletişim rotasına gider ve sözlük metnini taşır', () => {
    durum.lang = dil
    const { container } = render(<Footer />)
    const bag = [...container.querySelectorAll('a')].find((a) => a.textContent === getDictValue(sozluk, 'footer.contactForm'))
    expect(bag, 'altbilgide iletişim formu bağlantısı yok').toBeDefined()
    expect(bag?.getAttribute('href')).toBe('/tr/iletisim')
  })

  it('info@ adresi tıklanabilir e-posta bağlantısıdır ve sözlükteki adresi AYNEN kullanır', () => {
    durum.lang = dil
    const { container } = render(<Footer />)
    const adres = getDictValue(sozluk, 'footer.email')
    expect(adres).toBe('info@venthub.com.tr')
    const bag = container.querySelector(`a[href="mailto:${adres}"]`)
    expect(bag, 'info@ satırı mailto bağlantısı değil').not.toBeNull()
    expect(bag?.textContent).toBe(adres)
  })
})
