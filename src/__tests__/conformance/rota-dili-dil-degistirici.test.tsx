import { fireEvent, render, renderHook, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * INV-ROTA-DILI-DIL-DEGISTIRICI-1 — gerçek `LanguageSwitcher` bileşeni ve `useLocalizedRoutes` vekili
 * (OPS-52 PR-C1, ALT-14). Tarayıcı davranışı jsdom'da: tıklama → `router.push` hedefi.
 *
 * ÖLÇTÜĞÜ: (1) açık kipte spike'ın 404 bulgusu (`/tr/iletisim` → EN → `/en/contact`); (2) sorgu dizesi ve parça
 * dil değişince kaybolmaz; (3) Bilgi Merkezi'nden EN'e geçiş 404 değil Ürün Seçici'ne gider; (4) vekil
 * (header / footer bağlantılarının kaynağı) açık kipte yeni adres, kapalıda eski adres üretir.
 */

const ANAHTAR = 'NEXT_PUBLIC_ADRES_DILI'
const ilkDeger = process.env[ANAHTAR]

afterEach(() => {
  if (ilkDeger === undefined) delete process.env[ANAHTAR]
  else process.env[ANAHTAR] = ilkDeger
  vi.doUnmock('next/navigation')
  vi.resetModules()
  window.history.replaceState({}, '', '/')
  document.cookie = 'NEXT_LOCALE=; path=/; max-age=0'
})

/** Bileşeni TAZE yükler (anahtar derleme anı sabitidir); `push` casusunu ve konum bilgisini kurar. */
async function kur(anahtar: string | undefined, pathname: string, konum: string, lang: 'tr' | 'en') {
  if (anahtar === undefined) delete process.env[ANAHTAR]
  else process.env[ANAHTAR] = anahtar
  vi.resetModules()
  const push = vi.fn()
  vi.doMock('next/navigation', () => ({
    usePathname: () => pathname,
    useRouter: () => ({ push, refresh: vi.fn() }),
  }))
  window.history.replaceState({}, '', konum)
  const { default: LanguageSwitcher } = await import('../../components/LanguageSwitcher')
  const { I18nProvider } = await import('../../i18n/I18nProvider')
  render(
    <I18nProvider lang={lang}>
      <LanguageSwitcher />
    </I18nProvider>,
  )
  return { push }
}

const tikla = (kod: 'TR' | 'EN') => fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${kod}`) }))

describe('LanguageSwitcher — açık kip (NEXT_PUBLIC_ADRES_DILI=1)', () => {
  it('⭐/tr/iletisim → EN: /en/contact (spike\'ta /en/iletisim 404 idi); sorgu ve parça korunur', async () => {
    const { push } = await kur('1', '/tr/iletisim', '/tr/iletisim?dept=satis#form', 'tr')
    tikla('EN')
    expect(push).toHaveBeenCalledWith('/en/contact?dept=satis#form')
  })

  it('/tr/hakkimizda → EN: /en/about', async () => {
    const { push } = await kur('1', '/tr/hakkimizda', '/tr/hakkimizda', 'tr')
    tikla('EN')
    expect(push).toHaveBeenCalledWith('/en/about')
  })

  it('/en/contact → TR: /tr/iletisim; /en/about → TR: /tr/hakkimizda', async () => {
    const a = await kur('1', '/en/contact', '/en/contact', 'en')
    tikla('TR')
    expect(a.push).toHaveBeenCalledWith('/tr/iletisim')
  })

  it('/en/about → TR: /tr/hakkimizda (404 ya da 308 sıçraması yok)', async () => {
    const { push } = await kur('1', '/en/about', '/en/about#ekip', 'en')
    tikla('TR')
    expect(push).toHaveBeenCalledWith('/tr/hakkimizda#ekip')
  })
})

describe('LanguageSwitcher — kapalı kip: bugünkü davranış + sorgu / parça korunur', () => {
  it('anahtar yok: /tr/contact → EN: /en/contact; sorgu ve parça eklenir (ALT-14 b)', async () => {
    const { push } = await kur(undefined, '/tr/contact', '/tr/contact?dept=satis#form', 'tr')
    tikla('EN')
    expect(push).toHaveBeenCalledWith('/en/contact?dept=satis#form')
  })

  it('anahtar yok: sorgu / parça olmayan sayfada çıktı yalnız yol (eskisiyle birebir)', async () => {
    const { push } = await kur(undefined, '/tr/about', '/tr/about', 'tr')
    tikla('EN')
    expect(push).toHaveBeenCalledWith('/en/about')
  })

  it('anahtar "0": /tr/about yolu aynen taşınır', async () => {
    const { push } = await kur('0', '/en/about', '/en/about', 'en')
    tikla('TR')
    expect(push).toHaveBeenCalledWith('/tr/about')
  })
})

describe('LanguageSwitcher — ALT-14 (a): Bilgi Merkezi (anahtardan bağımsız, EN yayını kapalı)', () => {
  it.each([
    [undefined, '/en/urun-secici'],
    ['1', '/en/selector'],
  ])('anahtar %s: /tr/bilgi-merkezi/yazi → EN: 404 değil %s (açıkken Ürün Seçici\'nin görünen adresi), sorgu / parça düşer', async (anahtar, hedef) => {
    const { push } = await kur(anahtar, '/tr/bilgi-merkezi/frekans-konvertoru-nedir', '/tr/bilgi-merkezi/frekans-konvertoru-nedir?x=1#bolum', 'tr')
    tikla('EN')
    expect(push).toHaveBeenCalledWith(hedef)
  })

  it('/tr/bilgi-merkezi (liste) → EN: /en/urun-secici', async () => {
    const { push } = await kur(undefined, '/tr/bilgi-merkezi', '/tr/bilgi-merkezi', 'tr')
    tikla('EN')
    expect(push).toHaveBeenCalledWith('/en/urun-secici')
  })
})

describe('LanguageSwitcher — kaynak kuralları', () => {
  it('sorgu / parça tıklama işleyicisinde window.location\'dan okunur; useSearchParams YOK (kural 5)', async () => {
    const { readFileSync } = await import('node:fs')
    const { join } = await import('node:path')
    const kaynak = readFileSync(join(process.cwd(), 'src', 'components', 'LanguageSwitcher.tsx'), 'utf8')
    const kod = kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
    expect(kod).toMatch(/window\.location\.search/)
    expect(kod).toMatch(/window\.location\.hash/)
    expect(kod).not.toMatch(/useSearchParams/)
  })
})

describe('useLocalizedRoutes vekili (header / footer bağlantı kaynağı)', () => {
  async function vekil(anahtar: string | undefined, lang: 'tr' | 'en') {
    if (anahtar === undefined) delete process.env[ANAHTAR]
    else process.env[ANAHTAR] = anahtar
    vi.resetModules()
    const { useLocalizedRoutes } = await import('../../hooks/useLocalizedRoutes')
    const { I18nProvider } = await import('../../i18n/I18nProvider')
    const Sarmal = ({ children }: { children: React.ReactNode }) => <I18nProvider lang={lang}>{children}</I18nProvider>
    return renderHook(() => useLocalizedRoutes(), { wrapper: Sarmal }).result.current
  }

  it('açık kip: about / contact yeni adres (iki dil)', async () => {
    const tr = await vekil('1', 'tr')
    expect(tr.about()).toBe('/tr/hakkimizda')
    expect(tr.contact()).toBe('/tr/iletisim')
    expect(tr.contact('satis')).toBe('/tr/iletisim?dept=satis')
    const en = await vekil('1', 'en')
    expect(en.about()).toBe('/en/about')
    expect(en.contact()).toBe('/en/contact')
  })

  it('kapalı kip: bugünkü adresler', async () => {
    const tr = await vekil(undefined, 'tr')
    expect(tr.about()).toBe('/tr/about')
    expect(tr.contact()).toBe('/tr/contact')
    expect(tr.legal.kvkk()).toBe('/tr/legal/kvkk')
  })
})
