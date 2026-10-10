/**
 * URN-84 — iletişim sayfasındaki telefon kartı: başlığı sözlükte BOŞ ('') bırakılırsa boş <h3> basılmaz.
 *
 * NİÇİN: `contactPage.form.cardPhoneTitle` tabloda BOŞ (numara bilinçli olarak yok, O17). Kart yalnız numara ENV'i
 * (`NEXT_PUBLIC_SHOP_WHATSAPP`) tanımlıyken üretilir — canlıda tanımsız, yani kart çizilmiyor. ENV bir gün
 * tanımlanırsa (ya da bir ön izleme dağıtımında) başlığı boş kart boş bir <h3> ile çıkardı; kapı bunu önceden tutar.
 */
import { render } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import ContactPage from '../ContactPage'

const durum = vi.hoisted(() => ({ telefonBasligi: '' }))

vi.mock('../../i18n/I18nProvider', () => ({
  useI18n: () => ({
    lang: 'tr',
    t: (k: string) =>
      ({
        'contactPage.form.cardPhoneTitle': durum.telefonBasligi,
        'contactPage.form.cardPhoneLabel': 'Şimdi Ara',
        'contactPage.form.cardEmailTitle': 'E-posta',
        'contactPage.form.cardEmailLabel': 'Yaz',
      } as Record<string, string>)[k] ?? k,
  }),
}))
vi.mock('../../hooks/useLocalizedRoutes', () => ({
  useLocalizedRoutes: () => ({ legal: { kvkk: () => '/tr/kvkk' } }),
}))
vi.mock('../../lib/supabase/client', () => ({ supabaseBrowserClient: {} }))
vi.mock('../../lib/services/contactMessageService', () => ({ submitContactMessage: vi.fn() }))
vi.mock('../../lib/errorReporter', () => ({ reportError: vi.fn() }))
vi.stubGlobal(
  'IntersectionObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)

/** Hızlı iletişim kartları: telefon (ENV varken) ve e-posta; her biri bir <a> ve başlığı <h3>. */
const kartlar = (container: HTMLElement) => Array.from(container.querySelectorAll('section a.group'))

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SHOP_WHATSAPP', '905551112233')
})
afterEach(() => {
  vi.unstubAllEnvs()
  durum.telefonBasligi = ''
})

describe('ContactPage — başlığı boş telefon kartı boş <h3> basmaz', () => {
  it('başlık boşken telefon kartı numarasıyla durur, <h3> yok; e-posta kartı başlığıyla çizilir', () => {
    durum.telefonBasligi = ''
    const { container } = render(<ContactPage />)
    const cizilen = kartlar(container)
    expect(cizilen).toHaveLength(2)
    expect(cizilen[0].textContent).toContain('+905551112233')
    expect(cizilen[0].querySelector('h3')).toBeNull()
    expect(cizilen[1].querySelector('h3')?.textContent).toBe('E-posta')
    expect(Array.from(container.querySelectorAll('h3')).filter((h) => !h.textContent?.trim())).toHaveLength(0)
  })

  it('OLUMLU KONTROL: başlık doluysa telefon kartı başlığıyla çizilir', () => {
    durum.telefonBasligi = 'Telefon başlığı'
    const { container } = render(<ContactPage />)
    expect(kartlar(container)[0].querySelector('h3')?.textContent).toBe('Telefon başlığı')
  })
})
