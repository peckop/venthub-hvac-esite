import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

import { aramaAlanlariniAyikla, kategoriMetniniIndir } from '../../utils/categoryHelpers'

/**
 * INV-KATEGORI-SEO-GOMULU-1 — kategorinin arama sonucu alanları (`seo_title`, `seo_desc`, `metadata.seo_*_en`)
 * İSTEMCİYE GİDEN veriden çıkarılır (URN-105, 2026-10-10).
 *
 * NİÇİN VAR: KTL-21 28 kategoriyi doldurduğu gün `e2e/dil-dususu` (INV-DIL-DUSUSU-1) kırmızı verdi ve her PR'ın
 * E2E'sini kırdı: Türkçe `seo_desc` metni EN sayfanın gömülü verisinde duruyordu (canlı ölçüm: `/en` 56,
 * `/en/category/fans` 24 dolu alan). Sütun boşken görünmüyordu; kusur kodda önceden vardı.
 *
 * BU KAPI NE ÖLÇER:
 *  1) Yardımcı davranışı: sütunlar null, iki `*_en` anahtarı düşer, diğer metadata aynen kalır, girdi değişmez.
 *  2) İki sınır (kategori sayfası ve ana sayfa) satırı bu yardımcıdan geçirir.
 *  3) DÜZELTMENİN DAYANDIĞI VARSAYIM: vitrin istemci kodu bu alanları OKUMAZ (okusaydı çıkarmak onu bozardı).
 *
 * ÖLÇMEDİĞİ: canlı HTML (e2e/dil-dususu.e2e.ts "gömülü arama alanları" kolu ölçer).
 */

const KOK = join(__dirname, '..', '..')

const SATIR = {
  id: 'k1',
  slug: 'fans',
  seo_title: 'Fanlar: Kanal, Çatı, Aksiyel ve Radyal Aileler',
  seo_desc: 'Havayı bir yerden alıp başka bir yere taşıyan cihazlar.',
  description: 'Fan kategorisi',
  metadata: {
    slug: { tr: 'fanlar', en: 'fans' },
    hide_price: true,
    hero_notu: { tr: 'Fanlar notu', en: 'Fans note' },
    seo_title_en: 'Fans: Duct, Roof, Axial and Radial Families',
    seo_desc_en: 'Devices that move air from one place to another.',
  },
}

function kaynak(...parcalar: string[]): string {
  return readFileSync(join(KOK, ...parcalar), 'utf8')
}

describe('INV-KATEGORI-SEO-GOMULU-1 — yardımcı davranışı', () => {
  it('sütunlar null olur, iki *_en anahtarı düşer, kalan metadata aynen kalır', () => {
    const cikti = aramaAlanlariniAyikla(SATIR)
    expect(cikti.seo_title).toBeNull()
    expect(cikti.seo_desc).toBeNull()
    expect(cikti.metadata).not.toHaveProperty('seo_title_en')
    expect(cikti.metadata).not.toHaveProperty('seo_desc_en')
    expect(cikti.metadata.slug).toEqual({ tr: 'fanlar', en: 'fans' })
    expect(cikti.metadata.hide_price).toBe(true)
    expect(cikti.metadata.hero_notu).toEqual({ tr: 'Fanlar notu', en: 'Fans note' })
    expect(cikti.id).toBe('k1')
  })

  it('girdiyi DEĞİŞTİRMEZ (sunucuda başlık üretimi aynı satırı okur)', () => {
    aramaAlanlariniAyikla(SATIR)
    expect(SATIR.seo_title).toBe('Fanlar: Kanal, Çatı, Aksiyel ve Radyal Aileler')
    expect(SATIR.metadata.seo_desc_en).toBe('Devices that move air from one place to another.')
  })

  it('alanı olmayan satırda sütun uydurmaz, metadata yoksa dokunmaz', () => {
    const cikti = aramaAlanlariniAyikla({ id: 'k2', metadata: undefined })
    expect(cikti).toEqual({ id: 'k2', metadata: undefined })
    expect(cikti).not.toHaveProperty('seo_title')
  })

  it('kategoriMetniniIndir iki dilde de arama alanlarını taşımaz', () => {
    for (const lang of ['tr', 'en']) {
      const cikti = kategoriMetniniIndir(SATIR, lang)
      const duz = JSON.stringify(cikti)
      expect(duz, `${lang}: Türkçe arama metni gömülü veride`).not.toContain('Havayı bir yerden')
      expect(duz, `${lang}: İngilizce arama metni gömülü veride`).not.toContain('Devices that move air')
      expect(cikti.metadata).toHaveProperty('slug')
    }
  })
})

describe('INV-KATEGORI-SEO-GOMULU-1 — iki sınır yardımcıdan geçer', () => {
  it('kategori sayfası: ana kategori ve alt kategoriler kategoriMetniniIndir ile istemciye gider', () => {
    const s = kaynak('app', '_components', 'kategoriSayfasi.tsx')
    expect(s).toMatch(/initialCategory=\{kategoriMetniniIndir\(category,\s*lang\)\}/)
    expect(s).toMatch(/initialSubCategories=\{subCategories\.map\(\(s\) => kategoriMetniniIndir\(s,\s*lang\)\)\}/)
  })

  it('ana sayfa: istemci bileşenlerine giden ham kategori listesi aramaAlanlariniAyikla ile geçer', () => {
    const s = kaynak('app', '[lang]', 'page.tsx')
    expect(s).toMatch(/rawCategories=\{categories\.map\(\(c\) => aramaAlanlariniAyikla\(c\)\)\}/)
  })
})

describe('INV-KATEGORI-SEO-GOMULU-1 — varsayım: vitrin istemci kodu bu alanları okumaz', () => {
  /** Yönetim paneli kendi sorgusuyla okur ve bu sınırın dışındadır. */
  const DISLANAN = [join('components', 'admin'), join('views', 'admin'), '__tests__', 'database.types.ts']

  function tara(dizin: string, bulunan: string[]) {
    for (const ad of readdirSync(dizin)) {
      const yol = join(dizin, ad)
      const goreli = relative(KOK, yol)
      if (DISLANAN.some((d) => goreli.includes(d))) continue
      if (statSync(yol).isDirectory()) {
        tara(yol, bulunan)
      } else if (/\.(tsx?|jsx?)$/.test(ad) && /\bseo_(title|desc)\b/.test(readFileSync(yol, 'utf8'))) {
        bulunan.push(goreli)
      }
    }
  }

  it("components ve views altında (admin hariç) 'seo_title' / 'seo_desc' okuyan istemci kodu yok", () => {
    const bulunan: string[] = []
    tara(join(KOK, 'components'), bulunan)
    tara(join(KOK, 'views'), bulunan)
    expect(bulunan, "bu alanları okuyan vitrin bileşeni var: yardımcıyı daraltmadan önce ona bakın").toEqual([])
  })
})
