import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { YAZILAR } from '../data/bilgiMerkezi/yazilar'
import { ORNEK_YAZI } from '../lib/bilgiMerkezi/__tests__/ornekYazi'
import { sahteKaynak } from '../lib/bilgiMerkezi/__tests__/sahteKaynak'
import { yaziSayfasiHazirla } from '../lib/bilgiMerkezi/sayfa'
import { YaziRotasi } from '../views/knowledge/bilgiMerkeziRotasi'
import RehberYazisiSayfasi from '../views/knowledge/RehberYazisiSayfasi'

/**
 * INV-REHBER-KATEGORI-KARTI-METINSIZ-1 (URN-175, OPS-368) — rehber yazısı sonundaki "İlgili ürün kategorileri"
 * kartı kategori tanıtım paragrafını basmaz (aynı metin kategori sayfasında durur): kartta yalnız kategori adı,
 * düğme etiketi ve bağlantı vardır. Bağlantı sayısı ve hedefleri veri modelinden (`kategoriKartlari`) gelir ve
 * değişmez. Sabotaj: ölçüt tanıtım metnini gerçekten yakalar.
 */
vi.mock('../lib/data/bilgiMerkeziKaynak', async () => {
  const { sahteKaynak: sahte } = await import('../lib/bilgiMerkezi/__tests__/sahteKaynak')
  return { varsayilanKaynak: sahte() }
})

const KART = 'section[aria-labelledby="ilgili-kategoriler"] li a'

/** Ölçüt: her kategori kartında tanıtım metni yok (yalnız ad + düğme etiketi, 2 span). null = geçti. */
function kartMetinsizMi(kap: ParentNode, beklenenKart: number): string | null {
  const kartlar = Array.from(kap.querySelectorAll<HTMLAnchorElement>(KART))
  if (kartlar.length !== beklenenKart) return `${kartlar.length} kart (beklenen ${beklenenKart})`
  for (const k of kartlar) {
    const span = k.querySelectorAll('span').length
    if (span !== 2) return `kartta ${span} metin satırı (beklenen 2: ad + düğme)`
  }
  return null
}

describe('kategori kartı — tanıtım metni yok', () => {
  it('örnek yazı: kartta açıklama yok, bağlantı ve hedef veri modeliyle aynı', async () => {
    const yazi = { ...ORNEK_YAZI, ilgiliKategoriler: ['vh:kategori/duct-fans', 'vh:kategori/roof-fans'] as const }
    const sayfa = await yaziSayfasiHazirla(yazi, 'tr', sahteKaynak(), [yazi])
    expect(sayfa.kategoriKartlari.some((k) => k.aciklama.length > 0)).toBe(true) // veri hâlâ dolu: ölçüt boş veride yeşil olmasın
    const { container } = render(<RehberYazisiSayfasi sayfa={sayfa} />)
    expect(kartMetinsizMi(container, 2)).toBeNull()
    const kartlar = Array.from(container.querySelectorAll<HTMLAnchorElement>(KART))
    expect(kartlar.map((a) => a.getAttribute('href'))).toEqual(sayfa.kategoriKartlari.map((k) => k.href))
    for (const [i, a] of kartlar.entries()) {
      expect(a.textContent).not.toContain(sayfa.kategoriKartlari[i]?.aciklama)
      expect(a.textContent).toContain(sayfa.kategoriKartlari[i]?.ad)
    }
  })

  it('yayındaki HER TR yazı: kategori kartı varsa metinsiz ve bağlantı sayısı veri modeliyle aynı', async () => {
    let kartli = 0
    for (const yazi of YAZILAR.filter((y) => y.diller.tr)) {
      const m = yazi.diller.tr
      if (!m) continue
      const params = Promise.resolve({ lang: 'tr', yazi: m.slug })
      const { container, unmount } = render(await YaziRotasi({ params, bolumDili: 'tr' }))
      const n = container.querySelectorAll(KART).length
      expect(n, yazi.kimlik).toBe(yazi.ilgiliKategoriler?.length ?? 0)
      if (n > 0) {
        kartli += 1
        expect(kartMetinsizMi(container, n), yazi.kimlik).toBeNull()
      }
      unmount()
    }
    expect(kartli).toBeGreaterThanOrEqual(3)
  })
})

describe('kategori kartı — sabotaj kolu', () => {
  it('karta açıklama satırı eklenirse ölçüt kırmızı verir', async () => {
    const yazi = { ...ORNEK_YAZI, ilgiliKategoriler: ['vh:kategori/duct-fans'] as const }
    const sayfa = await yaziSayfasiHazirla(yazi, 'tr', sahteKaynak(), [yazi])
    const { container } = render(<RehberYazisiSayfasi sayfa={sayfa} />)
    const kart = container.querySelector(KART) as HTMLElement
    const aciklama = document.createElement('span')
    aciklama.textContent = 'Kategori tanıtım paragrafı'
    kart.appendChild(aciklama)
    expect(kartMetinsizMi(container, 1)).toMatch(/3 metin satırı/)
  })

  it('kart sayısı tutmazsa ölçüt kırmızı verir', async () => {
    const yazi = { ...ORNEK_YAZI, ilgiliKategoriler: ['vh:kategori/duct-fans'] as const }
    const sayfa = await yaziSayfasiHazirla(yazi, 'tr', sahteKaynak(), [yazi])
    const { container } = render(<RehberYazisiSayfasi sayfa={sayfa} />)
    expect(kartMetinsizMi(container, 2)).toMatch(/1 kart/)
  })
})
