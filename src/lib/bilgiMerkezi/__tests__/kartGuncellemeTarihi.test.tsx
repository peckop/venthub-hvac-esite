import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { YAZILAR } from '../../../data/bilgiMerkezi/yazilar'
import BilgiMerkeziListe, { listeKartlari } from '../../../views/knowledge/BilgiMerkeziListe'
import { tarihYaz } from '../../../views/knowledge/RehberYazisiSayfasi'
import { ORNEK_YAZI } from './ornekYazi'

/**
 * INV-BILGI-MERKEZI-KART-2 (URN-90 ek, karar OPS'ta 10 Ekim 2026) — liste kartı güncelleme tarihini de basar.
 *
 * KURAL: güncelleme tarihi yayın tarihinden farklıysa kartta yayın tarihinin yanında "Güncelleme <tarih>"
 * görünür (yazı künyesiyle AYNI kural, `RehberYazisiSayfasi`); aynıysa kart yalnız yayın tarihini basar.
 * Tarih alanı `guncellemeTarihi`dir; site haritası `lastmod` ve Article `dateModified` aynı alanı izler
 * (kapı: `kartOzeti.test.tsx`). Tarih basmayan yüzeyler (ana sayfa bloğu, "bu konudaki rehberler",
 * yazı altı "ilgili yazılar") bu kapının dışındadır: onlarda yayın tarihi de yoktur.
 */
const GUNCELLENMIS = { ...ORNEK_YAZI, kimlik: 'guncellenmis-ornek', yayinTarihi: '2026-09-25', guncellemeTarihi: '2026-10-10' }
const AYNI_TARIHLI = { ...ORNEK_YAZI, kimlik: 'ayni-tarihli-ornek', yayinTarihi: '2026-09-25', guncellemeTarihi: '2026-09-25' }

describe('liste kartı — güncelleme tarihi', () => {
  it('veri: güncelleme tarihi yayın tarihinden farklıysa kart biçimli ve ISO değeri taşır (tr ve en)', () => {
    for (const dil of ['tr', 'en'] as const) {
      const kartlar = listeKartlari(dil, [GUNCELLENMIS])
      expect(kartlar).toHaveLength(1)
      expect(kartlar[0].guncelleme).toBe(tarihYaz('2026-10-10', dil))
      expect(kartlar[0].guncellemeIso).toBe('2026-10-10')
      expect(kartlar[0].tarihIso).toBe('2026-09-25')
    }
    expect(listeKartlari('tr', [GUNCELLENMIS])[0].guncelleme).toBe('10 Ekim 2026')
  })

  it('veri: iki tarih eşitse güncelleme alanları null (kart yalnız yayın tarihini basar)', () => {
    for (const dil of ['tr', 'en'] as const) {
      const [kart] = listeKartlari(dil, [AYNI_TARIHLI])
      expect(kart.guncelleme).toBeNull()
      expect(kart.guncellemeIso).toBeNull()
    }
  })

  it('görünüm: "Güncelleme 10 Ekim 2026" yayın tarihinin yanında, iki ayrı <time> olarak basılır', () => {
    const { container } = render(<BilgiMerkeziListe dil="tr" yazilar={[GUNCELLENMIS]} />)
    const zamanlar = Array.from(container.querySelectorAll('time')).map((t) => t.getAttribute('datetime'))
    expect(zamanlar).toEqual(['2026-09-25', '2026-10-10'])
    expect(container.textContent).toContain('Güncelleme 10 Ekim 2026')
  })

  it('görünüm: iki tarih eşitse "Güncelleme" basılmaz, tek <time> vardır', () => {
    const { container } = render(<BilgiMerkeziListe dil="tr" yazilar={[AYNI_TARIHLI]} />)
    expect(Array.from(container.querySelectorAll('time')).map((t) => t.getAttribute('datetime'))).toEqual(['2026-09-25'])
    expect(container.textContent).not.toContain('Güncelleme')
  })

  it('görünüm (en): "Updated" etiketi güncelleme tarihinin yanında', () => {
    const { container } = render(<BilgiMerkeziListe dil="en" yazilar={[GUNCELLENMIS]} />)
    expect(container.textContent).toContain(`Updated ${tarihYaz('2026-10-10', 'en')}`)
  })

  it('yayındaki içerik: frekans konvertörü yazısının güncelleme tarihi 2026-10-10 ve kartı "10 Ekim 2026" basar', () => {
    const yazi = YAZILAR.find((y) => y.kimlik === 'frekans-konvertoru')
    expect(yazi, 'yazı yayın listesinde yok').toBeDefined()
    expect(yazi?.guncellemeTarihi).toBe('2026-10-10')
    const kartlar = listeKartlari('tr', YAZILAR)
    expect(kartlar.some((k) => k.guncelleme === '10 Ekim 2026' && k.guncellemeIso === '2026-10-10')).toBe(true)
  })
})
