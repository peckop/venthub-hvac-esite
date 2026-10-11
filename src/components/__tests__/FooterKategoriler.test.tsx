import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import Footer from '../Footer'

/**
 * OPS-51 — altbilgi kategori sütunu TÜM ürünlü kökleri gösterir.
 *
 * NİÇİN: kategoriler `level, name` sırasıyla gelir ve altbilgi iki ardışık `.slice` ile ilk 6 kökü kesiyordu.
 * Sığınak 7. kök olunca (ad sırasında en sonda) altbilgiden SESSİZCE düşecekti; hiçbir kapı görmezdi.
 * Ölçüm (canlı, 2026-10-04, ürünlü kökler ad sırasıyla): Aksesuarlar, Fanlar, Hava Perdeleri, İklimlendirme…,
 * Isı Geri Kazanım, Kontrol Sistemleri, Sığınak Havalandırma Fanları.
 */
const KOKLER = [
  ['accessories', 'Aksesuarlar'],
  ['fans', 'Fanlar'],
  ['air-curtains', 'Hava Perdeleri'],
  ['air-treatment', 'İklimlendirme ve Hava Şartlandırma'],
  ['heat-recovery-vmc', 'Isı Geri Kazanım (VMC)'],
  ['control-systems', 'Kontrol Sistemleri'],
  ['shelter-ventilation', 'Sığınak Havalandırma Fanları'],
].map(([slug, name], i) => ({
  id: `k${i}`,
  slug,
  name,
  parent_id: null,
  metadata: { slug: { tr: slug, en: slug } },
}))
const ALT = { id: 'alt1', slug: 'duct-fans', name: 'Kanal Tipi Fanlar', parent_id: 'k1', metadata: { slug: { tr: 'duct-fans', en: 'duct-fans' } } }

vi.mock('../../i18n/I18nProvider', () => ({
  useI18n: () => ({ t: (k: string) => k, lang: 'tr' }),
}))

vi.mock('../../contexts/CategoryContext', () => ({
  useCategories: () => ({ categories: [...KOKLER, ALT] }),
}))

vi.mock('../../hooks/useLocalizedRoutes', () => {
  const rota = (): unknown =>
    new Proxy(() => '/x', {
      get: (_hedef, ozellik) => (ozellik === 'category' ? (slug: string) => `/tr/category/${slug}` : rota()),
      apply: () => '/x',
    })
  return { useLocalizedRoutes: () => rota() }
})

vi.mock('../BuildTag', () => ({ default: () => null }))

describe('Footer kategori sütunu (OPS-51)', () => {
  it('7 ürünlü kökün HEPSİ bağlantı olarak çizilir; alt kategori çizilmez', () => {
    const { container } = render(<Footer />)
    const kategoriBaglantilari = [...container.querySelectorAll('a[href^="/tr/category/"]')].map((a) => a.getAttribute('href'))
    expect(kategoriBaglantilari).toEqual(KOKLER.map((k) => `/tr/category/${k.slug}`))
    expect(kategoriBaglantilari).toContain('/tr/category/shelter-ventilation')
    expect(kategoriBaglantilari).not.toContain('/tr/category/duct-fans')
  })
})
