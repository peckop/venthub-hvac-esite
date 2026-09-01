/**
 * INV-FIYAT-SIZINTI-2 — YAPISAL VERİ (JSON-LD) teklif modunda fiyat yayınlamaz.
 *
 * NİÇİN VAR (ölçülmüş canlı sızıntı, REC-111 / 2026-09-01):
 * Vitrin "Teklif Alın / Request Technical Offer" derken schema.org `Offer` düğümü
 * GERÇEK FİYATI yayınlıyordu. Canlı SSR ölçümü (JS çalıştırılmadan, yani botun gördüğü
 * hâl): sitemap'teki **80 ürün adresinin 72'sinde** `"price"` alanı, toplam **696**
 * fiyat. Örnek: sayfa "Request Technical Offer" yazarken JSON-LD
 * `"price":"37773.38","priceCurrency":"TRY"` diyordu.
 *
 * KÖK (hipotez değil — kaynak okunarak ve çağrı yerleri sayılarak doğrulandı):
 *   · `buildProductGroupJsonLd` kategoriyi PARAMETRE OLARAK ALMIYORDU → `hide_price`
 *     dalını sorması fiziken mümkün değildi.
 *   · `quoteModeHesapla` deponun TEK yerinde çağrılıyordu: ProductDetailPageView,
 *     yani GÖRSEL render kolu. Hüküm üç dallı (kategori yok · hide_price · fiyat
 *     geçersiz); JSON-LD yalnız üçüncüsünü uyguluyordu — üstelik kendi yorumunda
 *     "eşik vitrinle AYNIDIR" yazıyordu. Yorum yanlıştı, kod haklıydı.
 *
 * ⭐NİÇİN ESKİ KAPI GÖRMEDİ — ÖLÇÜT YÜZEYE ÖZGÜ TASARLANIR:
 * `INV-FIYAT-SIZINTI-1`'in canlı ölçütü `₺` + RAKAM idi ve GÖRSEL yüzey için doğruydu.
 * JSON-LD fiyatı `"price":"37773.38","priceCurrency":"TRY"` diye yazar — **`₺` işareti
 * YOKTUR**. O ölçüt bu yüzeyde iki halde de aynı cevabı verir: hiçbir şey ayırt etmez.
 * Bu kapının ölçütü bu yüzden karakter değil **YAPISAL ALAN VARLIĞI**.
 *
 * ⭐TEMİZ ÇIKANLAR KORUNDUĞU İÇİN TEMİZ DEĞİLDİ (aynı tuzak ikinci kez): JSON-LD'si
 * fiyatsız çıkan 4 ailenin DB'de **0 aktif fiyat kaydı** var (ölçüldü). Yani koruma
 * SIFIRDI. Bu yüzden aşağıdaki negatif kontrolde kurgunun fiyatlı olduğu AYRICA
 * doğrulanır — yoksa negatif kontrol boş çalışır ve kapı sahte-yeşil olur.
 *
 * Kardeş kapı: `storefront-fiyat-sizintisi.test.ts` (INV-FIYAT-SIZINTI-1, görsel yüzey).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { buildProductGroupJsonLd } from '../../lib/seo/jsonld'
import type { FamilyDetail, FamilyVariant } from '../../lib/services/family.service'

const KOK = join(process.cwd(), 'src')
const BASE_URL = 'https://venthub.com.tr'

const aile = (): FamilyDetail['family'] => ({
  id: 'f-1',
  name: 'Test Ailesi',
  slug: 'test-ailesi',
  series_code: null,
  description: { tr: 'aciklama', en: 'description' },
  brand_name: 'Vortice',
  category_id: null,
  subcategory_id: null,
  meta_title: null,
  meta_description: null,
  category: null,
  subcategory: null,
})

const fiyatliVaryant = (): FamilyVariant => ({
  id: 'v-1',
  sku: 'SKU-1',
  name: 'Model A',
  slug: 'model-a',
  model_code: '1001',
  price: 37773.38,
  stock_qty: 5,
  technical_specs: null,
  description: null,
  images: [],
})

/** JSON-LD ağacında herhangi bir derinlikte geçen anahtarları toplar. */
const anahtarlar = (dugum: unknown, biriktir: Set<string> = new Set()): Set<string> => {
  if (Array.isArray(dugum)) {
    for (const x of dugum) anahtarlar(x, biriktir)
  } else if (dugum && typeof dugum === 'object') {
    for (const [k, v] of Object.entries(dugum as Record<string, unknown>)) {
      biriktir.add(k)
      anahtarlar(v, biriktir)
    }
  }
  return biriktir
}

const kaynakDosyalari = (): string[] => {
  const bulunan: string[] = []
  const gez = (yol: string): void => {
    const st = statSync(yol)
    if (st.isFile()) {
      if (/\.tsx?$/.test(yol) && !/\.test\.tsx?$/.test(yol)) bulunan.push(yol)
      return
    }
    for (const ad of readdirSync(yol)) {
      if (ad === '__tests__') continue
      gez(join(yol, ad))
    }
  }
  gez(KOK)
  return bulunan
}

describe('INV-FIYAT-SIZINTI-2 · yapısal veri teklif modunda fiyat yayınlamaz', () => {
  it('⭐KATEGORİ FİYATI GİZLİYORSA — JSON-LD ağacında price/offers HİÇ yok', () => {
    const jsonLd = buildProductGroupJsonLd({
      family: aile(),
      variants: [fiyatliVaryant()],
      lang: 'tr',
      baseUrl: BASE_URL,
      mainCategory: { metadata: { hide_price: true } },
    })
    const k = anahtarlar(jsonLd)
    expect([...k].filter((x) => ['price', 'offers', 'priceCurrency'].includes(x))).toEqual([])
    // Düğüm yine üretilir — sızıntıyı kapatmak, yapısal veriyi yok etmek değildir.
    expect(JSON.stringify(jsonLd)).toContain('hasVariant')
  })

  it('⭐MOD BİLİNMİYORSA (kategori null) — yine fiyat yok (güvenli duruş)', () => {
    const jsonLd = buildProductGroupJsonLd({
      family: aile(),
      variants: [fiyatliVaryant()],
      lang: 'tr',
      baseUrl: BASE_URL,
      mainCategory: null,
    })
    expect([...anahtarlar(jsonLd)].includes('offers')).toBe(false)
  })

  it('⭐AYNA İDDİA — SATIŞ MODUNDA fiyat alanı VAR (dönüş yolculuğu güvencesi)', () => {
    // Bu kol iki işi birden yapar:
    // (1) AYIRT EDİCİLİK: olmasa kapı sahte-yeşil olurdu — `offers`i tamamen silsem
    //     de "teklif modunda fiyat yok" iddiası geçerdi.
    // (2) ⭐DÖNÜŞ YÖNÜ: site bir gün fiyatlı moda dönecek. Kapı yalnız "kapalıyken
    //     yok" derse, düğme geri çevrildiğinde fiyatın GELMEDİĞİ yerler sessiz kalır
    //     ve tersine bir sızıntı avı başlar. Bu yüzden mod-bağımlı her kapı İKİ YÖNLÜ
    //     yazılır: kapalıyken YOK, açıkken VAR.
    const varyant = fiyatliVaryant()
    expect(Number(varyant.price)).toBeGreaterThan(0) // kurgu gerçekten fiyatlı mı

    const jsonLd = buildProductGroupJsonLd({
      family: aile(),
      variants: [varyant],
      lang: 'tr',
      baseUrl: BASE_URL,
      mainCategory: { metadata: { hide_price: false } },
    })
    const metin = JSON.stringify(jsonLd)
    expect(metin).toContain('"offers"')
    expect(metin).toContain('37773.38')
  })

  it('⭐HÜKÜM TEK KAYNAKTAN — jsonld.ts kendi fiyat kuralını yazmaz', () => {
    // Kök buydu: iki yüzey aynı hükmü ayrı ayrı yazınca biri düzeltilince diğeri
    // sessizce eski davranışta kaldı. AST ile ölçülür (metin taraması yorumla
    // tatmin olur — bu sınıf 2026-09-01'de üç kez yaşandı).
    const kaynak = readFileSync(join(KOK, 'lib', 'seo', 'jsonld.ts'), 'utf8')
    const sf = ts.createSourceFile('jsonld.ts', kaynak, ts.ScriptTarget.Latest, true)
    let cagriVar = false
    const gez = (n: ts.Node): void => {
      if (
        ts.isCallExpression(n) &&
        ts.isIdentifier(n.expression) &&
        n.expression.text === 'quoteModeHesapla'
      ) {
        cagriVar = true
      }
      ts.forEachChild(n, gez)
    }
    gez(sf)
    expect(cagriVar, 'jsonld.ts teklif modunu SORMUYOR — kendi kuralını yazıyor olabilir').toBe(true)
  })

  it('HER ÇAĞRI YERİ MODU BİLDİRİR — mainCategory atlanamaz', () => {
    // TypeScript bunu zaten zorunlu kılıyor; bu kol, imza gevşetilirse (opsiyonel
    // yapılırsa) sessizce eski davranışa dönülmesini engeller.
    const ihlaller: string[] = []
    let toplamCagri = 0
    for (const dosya of kaynakDosyalari()) {
      const kaynak = readFileSync(dosya, 'utf8')
      if (!kaynak.includes('buildProductGroupJsonLd')) continue
      const sf = ts.createSourceFile('x.tsx', kaynak, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
      const gez = (n: ts.Node): void => {
        if (
          ts.isCallExpression(n) &&
          ts.isIdentifier(n.expression) &&
          n.expression.text === 'buildProductGroupJsonLd'
        ) {
          toplamCagri += 1
          const arg = n.arguments[0]
          const bildirdi =
            !!arg &&
            ts.isObjectLiteralExpression(arg) &&
            arg.properties.some(
              (p) => !!p.name && ts.isIdentifier(p.name) && p.name.text === 'mainCategory'
            )
          if (!bildirdi) ihlaller.push(dosya.replace(KOK, 'src'))
        }
        ts.forEachChild(n, gez)
      }
      gez(sf)
    }
    expect(toplamCagri).toBeGreaterThan(0) // boşluk muhafızı
    expect(ihlaller).toEqual([])
  })
})
