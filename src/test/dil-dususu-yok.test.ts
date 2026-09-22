/**
 * INV-DIL-DUSUSU-1 · vitrin metni sayfanın dilinde yoksa BAŞKA DİLE DÜŞMEZ; yüzey gizlenir.
 *
 * NİÇİN (Recep 2026-09-22): "müşteriye görünen dil/eksik içerik kusuru karar değil onarımdır."
 * Ölçüm: 47 ailenin 45'inde TR, 20'sinde EN açıklama → 25 aile sayfası /en/ altında Türkçe gövde
 * metni basıyordu; 24 kategorinin açıklamasında EN 0 ve legacy `hero_description` (Türkçe) EN
 * sayfaya düşüyordu. Üç ayrı `pickLang` kopyası "tercih → tr → en" sırasıyla çözüyordu.
 *
 * Kollar: (a) çözücü davranışı · (b) kaynakta çapraz dil düşüşü deseni 0 (tüm src/, test hariç)
 * · (b-çapa) desen eski kodu yakalar · (c) kategori çözücüsü EN'de Türkçe legacy alana düşmez.
 * Canlı HTML kolu: e2e/dil-dususu.e2e.ts (EN ürün + kategori sayfasında TR gövde metni 0).
 * Cetvel: docs/standards/vitrin-metni-standard.md "Dil kuralı".
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { getCategoryDescription } from '../utils/categoryHelpers'
import { dildekiMetin } from '../utils/dilMetni'

const KOK = resolve(__dirname, '../..')
// Çapa için eski kodun kopyasına yöneltilebilir (ölçüldü 2026-09-22: eski src/ → 5 ihlal —
// ürün sayfası, PDP, JSON-LD, kategori dönüştürücü, seri sayfası; kategori hero düşüşü (c) kolunda).
const SRC = process.env.DIL_DUSUSU_SRC ?? join(KOK, 'src')

function kaynaklar(dizin: string): string[] {
  return readdirSync(dizin).flatMap((ad) => {
    const yol = join(dizin, ad)
    if (statSync(yol).isDirectory()) return ad === '__tests__' || ad === 'test' ? [] : kaynaklar(yol)
    return /\.(ts|tsx)$/.test(ad) && !/\.(test|spec)\.tsx?$/.test(ad) ? [yol] : []
  })
}

/** Yorumları düşürür: açıklama metnindeki örnek kod ihlal sayılmaz. */
function yorumsuz(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1')
}

// `x.tr || x.en`, `x?.en ?? y.tr`, `meta[lang] || meta['tr']` … — bir dilden ötekine düşüş.
const DUSUS = [
  /\.(tr|en)\s*(\|\||\?\?)\s*[\w$.?\[\]'"]*\??\.(en|tr)\b/g,
  /\[\s*lang\s*\]\s*(\|\||\?\?)\s*[\w$.?]*\[\s*['"](tr|en)['"]\s*\]/g,
]

function ihlaller(kod: string): string[] {
  const alanDususu = [...kod.matchAll(DUSUS[0])].map((m) => m[0])
    // aynı dil iki kez (ör. a.tr || b.tr) düşüş değildir
    .filter((m) => new Set(m.match(/\.(tr|en)\b/g) ?? []).size > 1)
  // `x[lang] || x['tr']`: aktif dil sabit bir dile düşüyor — her eşleşme ihlal.
  const anahtarDususu = [...kod.matchAll(DUSUS[1])].map((m) => m[0])
  return [...alanDususu, ...anahtarDususu]
}

describe('INV-DIL-DUSUSU-1', () => {
  it('(a) dildekiMetin başka dile düşmez, boşluğu metin saymaz', () => {
    expect(dildekiMetin({ tr: 'Türkçe metin', en: null }, 'en')).toBeNull()
    expect(dildekiMetin({ tr: null, en: 'English text' }, 'tr')).toBeNull()
    expect(dildekiMetin({ tr: 'Türkçe', en: '   ' }, 'en')).toBeNull()
    expect(dildekiMetin({ tr: 'Türkçe', en: 'English' }, 'en')).toBe('English')
    expect(dildekiMetin({ tr: 'Türkçe', en: 'English' }, 'tr')).toBe('Türkçe')
    expect(dildekiMetin(null, 'tr')).toBeNull()
  })

  it('(b) kaynakta çapraz dil düşüşü deseni yok', () => {
    const bulunan = kaynaklar(SRC).flatMap((dosya) =>
      ihlaller(yorumsuz(readFileSync(dosya, 'utf8'))).map((m) => `${relative(KOK, dosya)}: ${m}`)
    )
    expect(bulunan).toEqual([])
  })

  it('(b-çapa) desen eski kodu yakalar, aynı dili yakalamaz', () => {
    const eski = `
      return preferred || value.tr || value.en || null
      series.description?.tr || series.description?.en || t('x')
      const localized = (meta[lang] || meta['tr'] || meta)
      const ayni = a.tr || b.tr
    `
    expect(ihlaller(eski)).toHaveLength(3)
  })

  it('(c) kategori çözücüsü EN sayfada Türkçe legacy alana düşmez', () => {
    const yalnizTr = { description: 'Düz kolon', metadata: { hero_description: 'Türkçe hero', description_i18n: { tr: 'TR' } } }
    expect(getCategoryDescription(yalnizTr, 'en')).toBe('')
    expect(getCategoryDescription(yalnizTr, 'tr')).toBe('TR')
    expect(getCategoryDescription({ description: null, metadata: { hero_description: 'Türkçe hero' } }, 'tr')).toBe('Türkçe hero')
    expect(getCategoryDescription({ description: null, metadata: { description_i18n: { en: 'EN' } } }, 'en')).toBe('EN')
  })
})
