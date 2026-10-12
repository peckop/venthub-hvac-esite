/**
 * URN-21 — görünür kırıntı: bağlantısı olan her basamak gerçek `<a href>`, son basamak bağlantı değil.
 * Ham HTML ölçümü (JS yok) ile aynı varsayım: `renderToStaticMarkup` çıktısı sunucunun yazdığı HTML'dir.
 */
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { aileKirintiAdimlari } from '@/lib/seo/kirinti'

import { AileKirintisi } from '../AileKirintisi'

const adimlar = aileKirintiAdimlari({
  dil: 'tr',
  anasayfaAdi: 'Ana Sayfa',
  ana: { ad: 'Fanlar', slug: 'fanlar' },
  alt: { ad: 'Aksiyel Fanlar', slug: 'aksiyel-fanlar' },
  aile: { ad: 'BVU LS', slug: 'avens-bvu-ls' },
  model: null,
  bayrak: false,
})

const baglantilar = (html: string) => [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]

describe('AileKirintisi', () => {
  it('aile sayfası: kategori + alt dahil ≥2 gerçek <a>, adres üreticisinden, dil önekli; marka bağlantısı YOK (URN-126)', () => {
    const html = renderToStaticMarkup(<AileKirintisi adimlar={adimlar} lang="tr" etiket="Sayfa yolu" />)
    const a = baglantilar(html)
    expect(a.length).toBeGreaterThanOrEqual(2)
    expect(a.map((m) => m[1])).toEqual(['/tr', '/tr/category/fanlar', '/tr/category/aksiyel-fanlar'])
    expect(a.map((m) => m[2].replace(/<[^>]+>/g, ''))).toEqual(['Ana Sayfa', 'Fanlar', 'Aksiyel Fanlar'])
    // Kategori listesinden gelen kullanıcı bir adım yukarıda kategoriye iner; markaya giden bağlantı yok.
    expect(html).not.toMatch(/href="[^"]*\/(brands|markalar)(\/|")/)
  })

  it('model sayfası: son bağlantı AİLE (kategori sırasının hemen altı), marka yok; model bağlantısız', () => {
    const modelAdimlari = aileKirintiAdimlari({
      dil: 'tr',
      anasayfaAdi: 'Ana Sayfa',
      ana: { ad: 'Fanlar', slug: 'fanlar' },
      alt: { ad: 'Aksiyel Fanlar', slug: 'aksiyel-fanlar' },
      aile: { ad: 'BVU LS', slug: 'avens-bvu-ls' },
      model: { etiket: 'BVU LS 200' },
      bayrak: false,
    })
    const html = renderToStaticMarkup(<AileKirintisi adimlar={modelAdimlari} lang="tr" etiket="Sayfa yolu" />)
    const a = baglantilar(html)
    expect(a.map((m) => m[2].replace(/<[^>]+>/g, ''))).toEqual(['Ana Sayfa', 'Fanlar', 'Aksiyel Fanlar', 'BVU LS'])
    expect(a.at(-1)?.[1]).toBe('/tr/products/avens-bvu-ls')
    expect(html).toMatch(/<span[^>]*aria-current="page"[^>]*>BVU LS 200<\/span>/)
    expect(html).not.toMatch(/href="[^"]*\/(brands|markalar)(\/|")/)
  })

  it('son basamak bulunulan sayfa: bağlantı değil, aria-current; nav etiketli', () => {
    const html = renderToStaticMarkup(<AileKirintisi adimlar={adimlar} lang="tr" etiket="Sayfa yolu" />)
    expect(html).toMatch(/<nav aria-label="Sayfa yolu">/)
    expect(html).toMatch(/<span[^>]*aria-current="page"[^>]*>BVU LS<\/span>/)
    expect(baglantilar(html).some((m) => m[2].includes('BVU LS'))).toBe(false)
  })

  it('bağlantılar mobilde 44px dokunma hedefi (min-h-11) ve klavye odağı görünür (focus-visible)', () => {
    const html = renderToStaticMarkup(<AileKirintisi adimlar={adimlar} lang="tr" etiket="Sayfa yolu" />)
    for (const m of baglantilar(html)) {
      const etiket = m[0]
      expect(etiket).toContain('min-h-11')
      expect(etiket).toContain('focus-visible:ring-2')
    }
  })

  it('boş adım listesi hiçbir şey çizmez', () => {
    expect(renderToStaticMarkup(<AileKirintisi adimlar={[]} lang="tr" etiket="x" />)).toBe('')
  })
})
