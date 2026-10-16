/**
 * URN-135: sessiz fan rehberine KORUMALI geri bağlantı.
 * - Saf çözücü: yazı kaydı yoksa `null`, varsa dil önekli adres (TR `/tr/bilgi-merkezi/…`, EN `/en/knowledge-hub/…`).
 * - Bileşen: `rehberHref` null ise bağlantı çizilmez; doluysa sözlükten gelen metinle çizilir.
 */
import { render, screen } from '@testing-library/react'
import React from 'react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import SilentFanFAQ from '@/components/category/sections/silent-fan/SilentFanFAQ'
import type { RehberYazisi, YaziDili, YaziMetni } from '@/data/bilgiMerkezi/yazilar'
import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getDictValue } from '@/i18n/getDictValue'

import { SESSIZ_FAN_REHBER_SLUG, sessizFanRehberHref } from '../sessizFanRehberi'

const kaynak = vi.hoisted(() => ({ lang: 'tr' as 'tr' | 'en' }))

vi.mock('@/i18n/I18nProvider', async () => {
  const sozlukler = { tr: (await import('@/i18n/dictionaries/tr')).tr, en: (await import('@/i18n/dictionaries/en')).en }
  const { getDictValue: oku } = await import('@/i18n/getDictValue')
  return {
    useI18n: () => ({
      lang: kaynak.lang,
      t: (anahtar: string) => oku(sozlukler[kaynak.lang], anahtar),
      dict: sozlukler[kaynak.lang],
    }),
  }
})

const EN_SLUG = 'how-to-choose-a-quiet-fan'

function metin(slug: string): YaziMetni {
  return { slug, ozet: 'ozet', kartOzeti: 'kart', govde: '# Baslik' }
}

function ornekYazi(slugTr: string | null, slugEn: string | null): RehberYazisi {
  const diller: Partial<Record<YaziDili, YaziMetni>> = {}
  if (slugTr) diller.tr = metin(slugTr)
  if (slugEn) diller.en = metin(slugEn)
  return { kimlik: 'sessiz-fan', konu: 'verimlilik', yayinTarihi: '2026-10-17', guncellemeTarihi: '2026-10-17', urunler: [], diller }
}

describe('sessizFanRehberHref: yazı kaydı yoksa bağlantı yok', () => {
  it('yazı listesi boşken TR ve EN için null', () => {
    expect(sessizFanRehberHref('tr', [], true)).toBeNull()
    expect(sessizFanRehberHref('en', [], true)).toBeNull()
  })

  it('gerçek yayın listesi rehberi henüz taşımıyorsa null (kayıt gelince bu test bilerek güncellenir)', () => {
    expect(sessizFanRehberHref('tr')).toBeNull()
  })

  it('başka slug taşıyan yazı rehber sayılmaz', () => {
    expect(sessizFanRehberHref('tr', [ornekYazi('baska-yazi', null)], true)).toBeNull()
  })
})

describe('sessizFanRehberHref: yazı kaydı varsa dil önekli adres', () => {
  it('TR adresi /tr/bilgi-merkezi/<slug>', () => {
    expect(sessizFanRehberHref('tr', [ornekYazi(SESSIZ_FAN_REHBER_SLUG, null)], true)).toBe(`/tr/bilgi-merkezi/${SESSIZ_FAN_REHBER_SLUG}`)
  })

  it('EN adresi kayıttaki EN slug ile /en/knowledge-hub/<slug>', () => {
    expect(sessizFanRehberHref('en', [ornekYazi(SESSIZ_FAN_REHBER_SLUG, EN_SLUG)], true)).toBe(`/en/knowledge-hub/${EN_SLUG}`)
  })

  it('yazı yalnız TR ise EN null (başka dile düşme yok)', () => {
    expect(sessizFanRehberHref('en', [ornekYazi(SESSIZ_FAN_REHBER_SLUG, null)], true)).toBeNull()
  })

  it('EN yayını kapalıyken EN null, TR etkilenmez', () => {
    const yazilar = [ornekYazi(SESSIZ_FAN_REHBER_SLUG, EN_SLUG)]
    expect(sessizFanRehberHref('en', yazilar, false)).toBeNull()
    expect(sessizFanRehberHref('tr', yazilar, false)).toBe(`/tr/bilgi-merkezi/${SESSIZ_FAN_REHBER_SLUG}`)
  })
})

describe('SilentFanFAQ rehber bağlantısı (bileşen)', () => {
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

  it('sözlük anahtarı TR ve EN dolu ve ham dB taşımaz', () => {
    for (const sozluk of [tr, en]) {
      const deger = String(getDictValue(sozluk, 'categorySilentFan.faq.rehberBaglantisi'))
      expect(deger.trim().length).toBeGreaterThan(0)
      expect(deger).not.toMatch(/dB/i)
    }
  })

  it('rehberHref null/undefined: bağlantı çizilmez', () => {
    kaynak.lang = 'tr'
    const { container, rerender } = render(<SilentFanFAQ rehberHref={null} />)
    expect(container.querySelector('a[href*="bilgi-merkezi"]')).toBeNull()
    rerender(<SilentFanFAQ />)
    expect(container.querySelector('a[href*="bilgi-merkezi"]')).toBeNull()
    expect(screen.queryByText(String(getDictValue(tr, 'categorySilentFan.faq.rehberBaglantisi')))).toBeNull()
  })

  it('TR: href ve metin sözlükten', () => {
    kaynak.lang = 'tr'
    render(<SilentFanFAQ rehberHref="/tr/bilgi-merkezi/sessiz-fan-nasil-secilir" />)
    const a = screen.getByRole('link', { name: String(getDictValue(tr, 'categorySilentFan.faq.rehberBaglantisi')) })
    expect(a.getAttribute('href')).toBe('/tr/bilgi-merkezi/sessiz-fan-nasil-secilir')
  })

  it('EN: href ve metin sözlükten', () => {
    kaynak.lang = 'en'
    render(<SilentFanFAQ rehberHref={`/en/knowledge-hub/${EN_SLUG}`} />)
    const a = screen.getByRole('link', { name: String(getDictValue(en, 'categorySilentFan.faq.rehberBaglantisi')) })
    expect(a.getAttribute('href')).toBe(`/en/knowledge-hub/${EN_SLUG}`)
  })
})
