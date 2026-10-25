/**
 * INV-FIYAT-SIZINTI-3 — teklif modunda gerçek fiyat RSC YÜKÜNE (self.__next_f) girmez. (URN-142)
 *
 * NİÇİN VAR (canlı ölçüm, 2026-10-25): INV-FIYAT-SIZINTI-1 görsel hükmü, -2 JSON-LD'yi kapatmıştı; ama
 * sayfa verisi ham fiyatlı `variants` ve `min_price` ile 'use client' bileşenlere (ProductDetailPage,
 * VariantSelector, FamilyCard, CategoryGridView) prop olarak iniyordu. 47 aile adresinin 36'sında
 * toplam 347 `"price":<sayı>`; çizim gizliyordu, VERİ taşınıyordu (kaynak-görüntüle ve önbellekte kalıcı).
 *
 * ⭐SAHTE-YEŞİL KORUMASI (quoteMode.ts dersi): fiyatsız kurguyla "fiyat yok" demek hiçbir şeyi ayırt etmez.
 * Tüm yardımcı testleri FİYATLI kurguyla koşar ve önce kurgunun gerçekten fiyat taşıdığını doğrular.
 *
 * Üç ayak: (a) saf yardımcı davranışı, (b) üç sayfa kökünde istemciye giden prop'un süzülmüş olması
 * (kaynak/AST), (c) SERİLEŞTİRİLMİŞ çıktıda `"price":<sayı>` / `"min_price":<sayı>` sayısı (RSC yükünün
 * vekili: istemciye prop olarak giden nesne JSON.stringify ile aynı biçime iner).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { listeFiyatiniSuz, teklifModundaMi, varyantFiyatiniSuz } from '../../lib/pricing/teklifModuSuzgeci'

const GIZLI = { metadata: { hide_price: true } }
const ACIK = { metadata: { hide_price: false } }

const varyantlar = [
  { id: 'a', sku: 'SEAT-35', price: 37773 },
  { id: 'b', sku: 'SEAT-45', price: 41200.5 },
  { id: 'c', sku: 'SEAT-55', price: null },
]
const liste = [
  { id: 'f1', slug: 'seat-serisi', min_price: 37773 },
  { id: 'f2', slug: 'radon', min_price: null },
]

const fiyatSayisi = (veri: unknown, alan: string) =>
  (JSON.stringify(veri).match(new RegExp(`"${alan}":[0-9][0-9.]*`, 'g')) ?? []).length

describe('INV-FIYAT-SIZINTI-3 · (a) saf yardımcı', () => {
  it('KURGU FİYATLI — sahte-yeşil olmasın', () => {
    expect(fiyatSayisi(varyantlar, 'price')).toBe(2)
    expect(fiyatSayisi(liste, 'min_price')).toBe(1)
  })

  it('mod bilinmiyorsa (kategori yok) teklif modu → fiyat çıkar', () => {
    expect(teklifModundaMi(null)).toBe(true)
    expect(teklifModundaMi(undefined)).toBe(true)
    expect(fiyatSayisi(varyantFiyatiniSuz(varyantlar, null), 'price')).toBe(0)
    expect(fiyatSayisi(listeFiyatiniSuz(liste, null), 'min_price')).toBe(0)
  })

  it('hide_price=true → varyant price ve liste min_price çıkar; diğer alanlar korunur', () => {
    const v = varyantFiyatiniSuz(varyantlar, GIZLI)
    expect(fiyatSayisi(v, 'price')).toBe(0)
    expect(v.map((x) => x.sku)).toEqual(['SEAT-35', 'SEAT-45', 'SEAT-55'])
    const l = listeFiyatiniSuz(liste, GIZLI)
    expect(fiyatSayisi(l, 'min_price')).toBe(0)
    expect(l.map((x) => x.slug)).toEqual(['seat-serisi', 'radon'])
  })

  it('max_price alanı varsa o da çıkar', () => {
    const l = listeFiyatiniSuz([{ id: 'x', min_price: 1, max_price: 2 }], GIZLI)
    expect(fiyatSayisi(l, 'max_price')).toBe(0)
    expect(fiyatSayisi(l, 'min_price')).toBe(0)
  })

  it('AYIRT EDİCİ — satış kipinde (hide_price=false) fiyat KORUNUR; girdi değiştirilmez', () => {
    expect(teklifModundaMi(ACIK)).toBe(false)
    expect(fiyatSayisi(varyantFiyatiniSuz(varyantlar, ACIK), 'price')).toBe(2)
    expect(fiyatSayisi(listeFiyatiniSuz(liste, ACIK), 'min_price')).toBe(1)
    expect(fiyatSayisi(varyantlar, 'price')).toBe(2) // girdi yerinde kalır
  })
})

describe('INV-FIYAT-SIZINTI-3 · (b) sayfa kökleri istemciye süzülmüş veri verir', () => {
  const oku = (yol: string) => readFileSync(join(process.cwd(), yol), 'utf8')

  /** JSX'te verilen attribute'un ifadesi (ham metin). */
  function jsxOznitelik(kaynak: string, etiket: string, ad: string): string | null {
    const sf = ts.createSourceFile('x.tsx', kaynak, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    let sonuc: string | null = null
    const gez = (n: ts.Node) => {
      if (ts.isJsxSelfClosingElement(n) || ts.isJsxOpeningElement(n)) {
        if (n.tagName.getText(sf) === etiket) {
          for (const a of n.attributes.properties) {
            if (ts.isJsxAttribute(a) && a.name.getText(sf) === ad && a.initializer && ts.isJsxExpression(a.initializer)) {
              sonuc = a.initializer.expression?.getText(sf) ?? null
            }
          }
        }
      }
      ts.forEachChild(n, gez)
    }
    gez(sf)
    return sonuc
  }

  it('aileSayfasi: PageComponent variants={varyantFiyatiniSuz(…)} — ham `variants` değil', () => {
    const ifade = jsxOznitelik(oku('src/app/_components/aileSayfasi.tsx'), 'PageComponent', 'variants')
    expect(ifade).not.toBeNull()
    expect(ifade).toMatch(/^varyantFiyatiniSuz\(\s*variants\s*,\s*mainCategory\s*\)$/)
  })

  it('urunlerSayfasi: CategoryMasterView\'a giden `families` listeFiyatiniSuz çıktısından atanır', () => {
    const k = oku('src/app/_components/urunlerSayfasi.tsx')
    expect(jsxOznitelik(k, 'CategoryMasterView', 'families')).toBe('families')
    expect(k).toMatch(/families\s*=\s*listeFiyatiniSuz\(\s*sonuc\.items\s*,\s*null\s*\)/)
    expect(k).not.toMatch(/families\s*=\s*sonuc\.items\b/)
  })

  it('kategoriSayfasi: PageComponent (CategoryMasterView) `families` listeFiyatiniSuz çıktısından atanır', () => {
    const k = oku('src/app/_components/kategoriSayfasi.tsx')
    expect(jsxOznitelik(k, 'PageComponent', 'families')).toBe('families')
    expect(k).toMatch(/families\s*=\s*listeFiyatiniSuz\(\s*familiesPage\.items\s*,\s*category\s*\)/)
    expect(k).not.toMatch(/families\s*=\s*familiesPage\.items\.map/)
  })

  it('JSON-LD sırası bozulmadı: buildProductGroupJsonLd ham varyantı süzgeçten ÖNCE alır', () => {
    const k = oku('src/app/_components/aileSayfasi.tsx')
    expect(k).toMatch(/buildProductGroupJsonLd\(\{[^}]*\bvariants\b[^}]*\}\)/)
    expect(k).not.toMatch(/buildProductGroupJsonLd\(\{[^}]*varyantFiyatiniSuz/)
  })
})

describe('INV-FIYAT-SIZINTI-3 · (c) serileştirilmiş yükte fiyat sayısı', () => {
  it('teklif modunda istemciye giden nesne: "price" ve "min_price" sayısı 0; satış kipinde > 0', () => {
    const istemciyeGiden = (kat: { metadata?: unknown } | null) => ({
      variants: varyantFiyatiniSuz(varyantlar, kat),
      families: listeFiyatiniSuz(liste, kat),
    })
    const teklif = istemciyeGiden(GIZLI)
    expect(fiyatSayisi(teklif, 'price')).toBe(0)
    expect(fiyatSayisi(teklif, 'min_price')).toBe(0)
    const satis = istemciyeGiden(ACIK)
    expect(fiyatSayisi(satis, 'price')).toBeGreaterThan(0)
    expect(fiyatSayisi(satis, 'min_price')).toBeGreaterThan(0)
  })
})
