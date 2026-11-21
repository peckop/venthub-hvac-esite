import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { YAZILAR } from '../data/bilgiMerkezi/yazilar'
import { ORNEK_YAZI } from '../lib/bilgiMerkezi/__tests__/ornekYazi'
import { sahteKaynak } from '../lib/bilgiMerkezi/__tests__/sahteKaynak'
import { yaziSayfasiHazirla } from '../lib/bilgiMerkezi/sayfa'
import { YaziRotasi } from '../views/knowledge/bilgiMerkeziRotasi'
import RehberYazisiSayfasi from '../views/knowledge/RehberYazisiSayfasi'

/**
 * INV-REHBER-ICINDEKILER-TEK-1 (URN-174, OPS-359, SEO-137) — içindekiler ham HTML'de TEK kez basılır.
 * Eski şablon mobil `<details>` ve masaüstü `<aside>` için `Icindekiler`i iki kez çağırdı; Geo-SEO 16/16
 * yazıda listeyi iki kez ölçtü. Şimdi:
 *   1. her yazıda `nav[data-icindekiler]` en çok 1 tane, bağlantı sayısı = içindekiler öğe sayısı,
 *   2. liste sunucu HTML'indedir (`<details>` içinde; kapalı kutu HTML'den düşmez),
 *   3. masaüstünde içeriği açık tutan CSS kuralı gerçekten vardır (sessiz görsel regresyon olmasın),
 *   4. sabotaj: ölçüt iki kopyayı ve eksik bağlantıyı gerçekten yakalar.
 */
vi.mock('../lib/data/bilgiMerkeziKaynak', async () => {
  const { sahteKaynak: sahte } = await import('../lib/bilgiMerkezi/__tests__/sahteKaynak')
  return { varsayilanKaynak: sahte() }
})

const listeler = (kap: ParentNode): HTMLElement[] => Array.from(kap.querySelectorAll<HTMLElement>('nav[data-icindekiler]'))

/** Ölçüt: tek liste ve her öğe bir kez. null = geçti, metin = hata. */
function icindekilerTekMi(kap: ParentNode, beklenenOge: number): string | null {
  const l = listeler(kap)
  if (beklenenOge === 0) return l.length === 0 ? null : `öğe yokken ${l.length} liste basıldı`
  if (l.length !== 1) return `${l.length} liste basıldı (beklenen 1)`
  const baglanti = l[0].querySelectorAll('a[href^="#"]').length
  return baglanti === beklenenOge ? null : `${baglanti} bağlantı (beklenen ${beklenenOge})`
}

describe('içindekiler tek liste — örnek sayfa', () => {
  it('örnek yazıda liste 1, <details> içinde, sunucu HTML’inde', async () => {
    const sayfa = await yaziSayfasiHazirla(ORNEK_YAZI, 'tr', sahteKaynak(), [ORNEK_YAZI])
    expect(sayfa.icindekiler.length).toBeGreaterThan(0)
    const { container } = render(<RehberYazisiSayfasi sayfa={sayfa} />)
    expect(icindekilerTekMi(container, sayfa.icindekiler.length)).toBeNull()
    const kutu = container.querySelector('details.icindekiler-detay')
    expect(kutu).not.toBeNull()
    expect(kutu?.querySelector('summary')).not.toBeNull()
    expect(kutu?.querySelectorAll('nav[data-icindekiler]')).toHaveLength(1)
    expect(container.querySelectorAll('details')).toHaveLength(1)
  })

  it('içindekiler boşsa hiçbir liste ve kutu basılmaz', async () => {
    const sayfa = await yaziSayfasiHazirla(ORNEK_YAZI, 'tr', sahteKaynak(), [ORNEK_YAZI])
    const { container } = render(<RehberYazisiSayfasi sayfa={{ ...sayfa, icindekiler: [] }} />)
    expect(icindekilerTekMi(container, 0)).toBeNull()
    expect(container.querySelector('details.icindekiler-detay')).toBeNull()
  })
})

describe('içindekiler tek liste — yayındaki HER yazı (yeni yazı otomatik ölçülür)', () => {
  it('her TR yazının rotasında liste en çok bir, öğeler bir kez', async () => {
    const trYazilar = YAZILAR.filter((y) => y.diller.tr)
    expect(trYazilar.length).toBeGreaterThanOrEqual(3)
    let listeli = 0
    for (const yazi of trYazilar) {
      const m = yazi.diller.tr
      if (!m) continue
      const params = Promise.resolve({ lang: 'tr', yazi: m.slug })
      const { container, unmount } = render(await YaziRotasi({ params, bolumDili: 'tr' }))
      const l = listeler(container)
      expect(l.length, yazi.kimlik).toBeLessThanOrEqual(1)
      if (l.length === 1) {
        listeli += 1
        expect(icindekilerTekMi(container, l[0].querySelectorAll('li').length), yazi.kimlik).toBeNull()
      }
      unmount()
    }
    expect(listeli).toBeGreaterThanOrEqual(3)
  })
})

describe('içindekiler tek liste — sabotaj kolu', () => {
  it('iki kopya basılırsa ölçüt kırmızı verir', async () => {
    const sayfa = await yaziSayfasiHazirla(ORNEK_YAZI, 'tr', sahteKaynak(), [ORNEK_YAZI])
    const { container } = render(<RehberYazisiSayfasi sayfa={sayfa} />)
    const nav = container.querySelector('nav[data-icindekiler]') as HTMLElement
    container.appendChild(nav.cloneNode(true))
    expect(icindekilerTekMi(container, sayfa.icindekiler.length)).toMatch(/2 liste/)
  })

  it('bağlantı sayısı tutmazsa ölçüt kırmızı verir', async () => {
    const sayfa = await yaziSayfasiHazirla(ORNEK_YAZI, 'tr', sahteKaynak(), [ORNEK_YAZI])
    const { container } = render(<RehberYazisiSayfasi sayfa={sayfa} />)
    expect(icindekilerTekMi(container, sayfa.icindekiler.length + 1)).toMatch(/bağlantı/)
  })
})

describe('içindekiler tek liste — masaüstü CSS kuralı', () => {
  const css = readFileSync(join(process.cwd(), 'src', 'index.css'), 'utf8').replace(/\r\n/g, '\n')

  it('lg ve üstünde içeriği açık tutan ve özeti gizleyen kural var', () => {
    const blok = css.slice(css.indexOf('/* URN-174'))
    expect(blok).toContain('@media (min-width: 1024px)')
    expect(blok).toContain('@supports selector(::details-content)')
    expect(blok).toMatch(/\.icindekiler-detay > summary\s*\{\s*display: none;/)
    expect(blok).toMatch(/\.icindekiler-detay::details-content\s*\{[^}]*content-visibility: visible/)
  })

  it('özet yalnız @supports içinde gizlenir (desteksiz tarayıcıda özet kalır)', () => {
    const baslangic = css.indexOf('@media (min-width: 1024px) {\n  @supports selector(::details-content)')
    expect(baslangic).toBeGreaterThan(-1)
    const disarisi = css.slice(0, baslangic) + css.slice(css.indexOf('.custom-scrollbar::-webkit-scrollbar { width: 4px; }'))
    expect(disarisi).not.toMatch(/\.icindekiler-detay/)
  })
})
