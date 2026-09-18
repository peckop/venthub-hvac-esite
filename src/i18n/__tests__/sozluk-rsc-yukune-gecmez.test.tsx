/**
 * INV-SOZLUK-RSC-1 — sözlük nesnesi istemci provider'ına PROP olarak geçirilmez.
 *
 * NİÇİN VAR (2026-09-18, canlı anonim ölçüm): `src/app/[lang]/layout.tsx` sözlüğün TAMAMINI
 * `<I18nProvider dictionary={...}>` diye geçiriyordu. `I18nProvider` bir `'use client'` bileşeni
 * olduğu için prop RSC yükünde serileşiyor ve sözlük her sayfanın HTML'ine gömülüyordu:
 *
 *   /tr/products/avens-bvu-ls   300,9 KB → gömülü sözlük ~196,4 KB (%65,3)
 *   /tr/category/fanlar         318,5 KB → ~196,4 KB (%61,7)
 *   /tr/products                425,6 KB → ~195,9 KB (%46,0)
 *   /tr                         420,5 KB → ~194,3 KB (%46,2)
 *
 * Admin sözlüğünün 1008 ayırt edici anahtarının tamamı dört sayfada da vardı (~51 KB'ı yalnız
 * admin). Somut örnek, canlı HTML'den: fiyatlandırma yönetim ekranının yardım metni
 * `defaultCharmEndingDesc` müşterinin ürün sayfasında duruyordu.
 *
 * ⚠ÖLÇÜM DERSİ (bu kapının yazılma sebebi kadar önemli): sözlük RSC yükünde **çift serileşmiş**
 * geliyor, yani HTML içinde `\"anahtar\"` biçiminde. Düz `"anahtar"` deseniyle arayan ilk ölçümüm
 * 0 buldu ve "bulgu yanlıştı" diyecektim. Canlı HTML'de arama yapan her ölçüm kaçışlı biçimi de
 * denemek zorundadır.
 *
 * Kapı üç şeyi ayrı ayrı ölçer:
 *   1. layout kaynağında provider'a sözlük prop'u geçişi YOK (yapısal — eski kodda KIRMIZI).
 *   2. provider'ın prop tipinde `dictionary` YOK (ikinci kilit: TypeScript'in kendisi).
 *   3. provider prop'suzken `t()` doğru dilde metin veriyor (davranış — onarımın bedavaya
 *      gelmediğinin kanıtı; sözlük modül düzeyindeki DICTS'ten okunuyor).
 *
 * Cetvel: `docs/standards/rendering-cache-standard.md` · `docs/standards/vitrin-metni-standard.md` K1.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { en } from '../dictionaries/en'
import { tr } from '../dictionaries/tr'
import { I18nProvider, useI18n } from '../I18nProvider'

const KOK = join(__dirname, '..', '..', '..')
const LAYOUT = join(KOK, 'src', 'app', '[lang]', 'layout.tsx')
const PROVIDER = join(KOK, 'src', 'i18n', 'I18nProvider.tsx')

/** Yorum satırlarını düşürür — açıklamada geçen `dictionary=` örneği yanlış kırmızı vermesin. */
function yorumsuz(kaynak: string): string {
  return kaynak
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

describe('INV-SOZLUK-RSC-1 · sözlük istemci provider ına prop olarak geçmez', () => {
  it('1. layout, I18nProvider a sözlük prop u geçirmez', () => {
    const kaynak = yorumsuz(readFileSync(LAYOUT, 'utf8'))

    // Provider çağrısını bul ve prop listesini ölç.
    const cagri = kaynak.match(/<I18nProvider\b[^>]*>/)
    expect(cagri, 'layout içinde <I18nProvider ...> çağrısı bulunamadı (yapı değiştiyse testi güncelle)').not.toBeNull()

    const propListesi = cagri![0]
    expect(
      propListesi,
      'layout provider a sözlük geçiriyor: bu prop RSC yükünde serileşir ve sözlüğün tamamı ' +
        'her sayfanın HTML ine gömülür (2026-09-18 ölçümü: ürün sayfasının %65 i). ' +
        'Sözlük zaten I18nProvider içinde modül düzeyinde duruyor.',
    ).not.toMatch(/\bdictionary\s*=/)

    // Sözlüğün başka bir adla geçirilmesi de aynı kusurdur.
    expect(
      propListesi,
      'provider a sözlük benzeri bir nesne başka adla geçiriliyor olabilir — prop listesini gözden geçir.',
    ).not.toMatch(/=\s*\{\s*(tr|en|dict|dictionary|sozluk)\b/)
  })

  it('2. provider ın prop tipinde dictionary yok (ikinci kilit)', () => {
    const kaynak = yorumsuz(readFileSync(PROVIDER, 'utf8'))
    const tip = kaynak.match(/interface I18nProviderProps\s*\{[\s\S]*?\}/)
    expect(tip, 'I18nProviderProps arayüzü bulunamadı').not.toBeNull()
    expect(
      tip![0],
      'prop tipi dictionary i kabul ediyor: tip açık kalırsa biri sözlüğü yeniden geçirebilir ve ' +
        'derleyici uyarmaz. Tip kapalı olduğunda kapı TypeScript in kendisi olur.',
    ).not.toMatch(/\bdictionary\b/)
  })

  it('3. prop olmadan da doğru dil: TR', () => {
    const Sonda: React.FC = () => {
      const { t, lang } = useI18n()
      return <span data-testid="s">{`${lang}|${t('meta.siteTitle')}`}</span>
    }
    render(
      <I18nProvider lang="tr">
        <Sonda />
      </I18nProvider>,
    )
    expect(screen.getByTestId('s').textContent).toBe(`tr|${tr.meta.siteTitle}`)
  })

  it('3. prop olmadan da doğru dil: EN', () => {
    const Sonda: React.FC = () => {
      const { t, lang } = useI18n()
      return <span data-testid="s">{`${lang}|${t('meta.siteTitle')}`}</span>
    }
    render(
      <I18nProvider lang="en">
        <Sonda />
      </I18nProvider>,
    )
    expect(screen.getByTestId('s').textContent).toBe(`en|${en.meta.siteTitle}`)
  })

  it('3. dict bağlamı da prop suz doluyor (yalnız t değil)', () => {
    const Sonda: React.FC = () => {
      const { dict } = useI18n()
      return <span data-testid="s">{(dict as typeof tr).meta.siteTitle}</span>
    }
    render(
      <I18nProvider lang="tr">
        <Sonda />
      </I18nProvider>,
    )
    expect(screen.getByTestId('s').textContent).toBe(tr.meta.siteTitle)
  })
})
