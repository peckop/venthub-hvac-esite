import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

import { en } from '../../../i18n/dictionaries/en'
import { tr } from '../../../i18n/dictionaries/tr'
import { getDictValue } from '../../../i18n/getDictValue'
import { KIRINTI_ANA_SAYFA_ANAHTARI, kirintiAnaSayfaAdi } from '../kirinti'

/**
 * INV-KIRINTI-ANA-SAYFA-1 (URN-164) — konum yolunun (JSON-LD BreadcrumbList + görünür kırıntı) ilk basamak adı
 * TÜM sayfa türlerinde tek yazımdır: TR "Ana Sayfa", EN "Home", tek sözlük anahtarından (`category.breadcrumbHome`).
 * Canlıda ölçülen kusur (14 Kasım, SEO-112): kategori/ürün "Ana Sayfa", bilgi merkezi yazıları "Ana sayfa" yazıyordu.
 *
 * Kaynak taraması: ilk basamağı kendi anahtarından ya da düz metinle yazan sayfa türü kırmızı verir.
 */

const KOK = join(__dirname, '..', '..', '..')

function kaynakDosyalari(dizin: string, cikti: string[] = []): string[] {
  for (const ad of readdirSync(dizin)) {
    const yol = join(dizin, ad)
    if (statSync(yol).isDirectory()) {
      if (ad === '__tests__' || ad === 'node_modules') continue
      kaynakDosyalari(yol, cikti)
    } else if (/\.(ts|tsx)$/.test(ad) && !/\.test\./.test(ad)) {
      cikti.push(yol)
    }
  }
  return cikti
}

const DOSYALAR = kaynakDosyalari(KOK).map((yol) => ({ yol: relative(KOK, yol).replaceAll('\\', '/'), metin: readFileSync(yol, 'utf8') }))

const tDil = (sozluk: typeof tr | typeof en) => (anahtar: string) => getDictValue(sozluk, anahtar)

describe('INV-KIRINTI-ANA-SAYFA-1 — konum yolu ilk basamak adı tek yardımcıdan', () => {
  it('yardımcı tek anahtardan okur: TR "Ana Sayfa", EN "Home"', () => {
    expect(KIRINTI_ANA_SAYFA_ANAHTARI).toBe('category.breadcrumbHome')
    expect(kirintiAnaSayfaAdi(tDil(tr))).toBe('Ana Sayfa')
    expect(kirintiAnaSayfaAdi(tDil(en))).toBe('Home')
  })

  it('aynı anlamdaki diğer ana sayfa etiketi (common.homeLabel) ile aynı yazım', () => {
    expect(getDictValue(tr, 'common.homeLabel')).toBe(kirintiAnaSayfaAdi(tDil(tr)))
    expect(getDictValue(en, 'common.homeLabel')).toBe(kirintiAnaSayfaAdi(tDil(en)))
  })

  it('bilgi merkezi kendi ana sayfa anahtarını TAŞIMAZ (sözlükte ve kodda)', () => {
    expect((tr.bilgiMerkezi as Record<string, unknown>).anaSayfa).toBeUndefined()
    expect((en.bilgiMerkezi as Record<string, unknown>).anaSayfa).toBeUndefined()
    const kullanan = DOSYALAR.filter((d) => d.metin.includes('bilgiMerkezi.anaSayfa')).map((d) => d.yol)
    expect(kullanan).toEqual([])
  })

  it('JSON-LD zincirinde ana sayfa basamağını (`path: \'/\'`) kuran her dosya yardımcıyı çağırır (düz metin / özel anahtar yok)', () => {
    const kuranlar = DOSYALAR.filter((d) => /\{\s*name:\s*[^,{}]+,\s*path:\s*'\/'\s*\}/.test(d.metin) && d.yol !== 'lib/seo/kirinti.ts')
    expect(kuranlar.length, 'ölçüm evreni boş (kör test)').toBeGreaterThan(0)
    const yardimcisiz = kuranlar.filter((d) => !d.metin.includes('kirintiAnaSayfaAdi(')).map((d) => d.yol)
    expect(yardimcisiz).toEqual([])
  })

  it('görünür kırıntıda ana sayfa basamağı (`href: \'/\'`, `Routes.home()`) yalnız tek anahtardan ya da yardımcıdan yazılır', () => {
    const desen = /(?:label|name):\s*(?:t\('([^']+)'\)|kirintiAnaSayfaAdi\(t\)),\s*href:\s*(?:'\/'|Routes\.home\(\))/g
    const yazilan: { yol: string; anahtar: string }[] = []
    for (const d of DOSYALAR) {
      for (const m of d.metin.matchAll(desen)) yazilan.push({ yol: d.yol, anahtar: m[1] ?? KIRINTI_ANA_SAYFA_ANAHTARI })
    }
    expect(yazilan.length, 'ölçüm evreni boş (kör test)').toBeGreaterThan(0)
    expect(yazilan.filter((y) => y.anahtar !== KIRINTI_ANA_SAYFA_ANAHTARI)).toEqual([])
  })

  it('SABOTAJ — desen ayırt eder: özel anahtarla yazılan ana sayfa basamağı yakalanır', () => {
    const desen = /(?:label|name):\s*(?:t\('([^']+)'\)|kirintiAnaSayfaAdi\(t\)),\s*href:\s*(?:'\/'|Routes\.home\(\))/g
    const kotu = "{ label: t('bilgiMerkezi.anaSayfa'), href: '/' }"
    expect([...kotu.matchAll(desen)].map((m) => m[1])).toEqual(['bilgiMerkezi.anaSayfa'])
    const iyi = "{ label: t('category.breadcrumbHome'), href: '/' }"
    expect([...iyi.matchAll(desen)].map((m) => m[1])).toEqual([KIRINTI_ANA_SAYFA_ANAHTARI])
  })
})
