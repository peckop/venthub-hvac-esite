/**
 * 404 sayfası tek başlık basar ve ziyaretçinin dilinde konuşur.
 *
 * NİÇİN VAR (2026-09-24 canlı ölçüm): özel 404 yokken Next.js'in hazır sayfası `/tr/...` adresinde
 * İngilizce "404: This page could not be found." yazıyor ve kendi `<title>`'ını kök düzenin başlığına
 * EKLİYORDU — sayfada iki `<title>`. Ürün/kategori sayfalarının `notFound()` çağrısı da aynı sayfaya
 * düşüyordu. Bu test iki yüzü kilitler: görünüm `<title>` çizmez; metin sözlükten gelir.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'
import { testA11y } from '../../utils/testA11y'
import NotFoundView from '../NotFoundView'

vi.mock('../../i18n/I18nProvider', () => ({
  useI18n: () => ({ lang: 'tr', t: (k: string) => k }),
}))
vi.mock('../../hooks/useLocalizedRoutes', () => ({
  useLocalizedRoutes: () => ({ home: () => '/tr', products: () => '/tr/products' }),
}))

describe('404 görünümü', () => {
  it('tek h1 + iki yerelleştirilmiş bağlantı; <title> ÇİZMEZ', async () => {
    const { container } = render(<NotFoundView />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('sayfaBulunamadi.baslik')
    expect(screen.getByRole('link', { name: 'sayfaBulunamadi.urunler' }).getAttribute('href')).toBe('/tr/products')
    expect(screen.getByRole('link', { name: 'sayfaBulunamadi.anaSayfa' }).getAttribute('href')).toBe('/tr')
    // React 19 <title>'ı <head>'e taşır; container'da olmaması yetmez → document'ta da yok
    expect(container.querySelector('title')).toBeNull()
    expect(document.querySelectorAll('title')).toHaveLength(0)
    expect(await testA11y(container)).toHaveNoViolations()
  })

  it('kök not-found dosyası kendi başlığını ve metadata alanını üretmez (tek başlık kök düzenden)', () => {
    const kaynak = readFileSync(join(__dirname, '..', '..', 'app', 'not-found.tsx'), 'utf8')
    const kod = kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(?<!:)\/\/.*$/gm, '')
    expect(kod).not.toMatch(/<title\b/)
    expect(kod).not.toMatch(/export\s+(const|async function|function)\s+(metadata|generateMetadata)\b/)
    expect(kod).toMatch(/NotFoundView/)
  })

  it('metin iki dilde de var ve farklı (İngilizce adreste Türkçe basılmaz)', () => {
    for (const k of ['baslik', 'aciklama', 'anaSayfa', 'urunler'] as const) {
      expect(tr.sayfaBulunamadi[k].length).toBeGreaterThan(0)
      expect(en.sayfaBulunamadi[k].length).toBeGreaterThan(0)
      expect(en.sayfaBulunamadi[k]).not.toBe(tr.sayfaBulunamadi[k])
    }
  })
})
