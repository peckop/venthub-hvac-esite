import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * INV-SILENTFAN-SERI-1 — sessiz fan anlatısı SERİye bağlıdır, kategoriye değil.
 *
 * Cetvel: `docs/standards/catalog-depth-standard.md` §1.1 (K1.1) (Recep kararı, 2026-08-28).
 *
 * NİÇİN BU KAPI VAR — iki ayrı kusur sınıfı, ikisi de yaşandı:
 *
 * 1. ÖLÜ TETİKLEYİCİ. Anlatı `inline-duct-fans` kategorisine bağlıydı; o kategori pasif ve
 *    0 serili, yani koşul HİÇBİR ZAMAN açılmadı. Beş bileşenlik anlatı ve sihirbaz müşteriye
 *    bir kez bile görünmedi ve HİÇBİR KAPI bunu görmedi: tipler doğru, testler yeşil, katalog
 *    bütünlüğü sessiz. Kusur yalnız canlı vitrinde, Recep'in gözüyle bulundu.
 *
 * 2. AYRIŞMA (asıl tehlike, bu yüzden kapı AST okur). Görünme koşulu ile sihirbazın aday
 *    kümesi AYRI yazılırsa anlatı görünür ama sihirbaz BAŞKA ürün önerir. Ölçüldü: Quiet
 *    serisi `duct-fans` kategorisini 24 sessiz OLMAYAN modelle paylaşıyor (Lineo düz 7 ·
 *    Radon 5 · VORT Commercial 7+5). Kategori kapsamı o 24'ü de aday sayardı — "sessiz fan
 *    öner" derken sessiz olmayan ürün önermek. Bu kusur SAYIYA yansımaz: aday sayısı artar,
 *    hiçbir toplam bozulmaz, hiçbir test kırmızı yanmaz.
 *
 * NİÇİN METİN TARAMASI DEĞİL AST: "dosyada 'vortice-lineo-quiet' geçiyor mu" sorusu bir
 * YORUM satırıyla da tatmin olur. Kapı, sabitin GERÇEKTEN hem tetikleyicide hem sihirbaz
 * pervanesinde kullanıldığını görmek zorunda — yani bağın kendisini, anılmasını değil.
 */

const GORUNUM = path.join(process.cwd(), 'src', 'views', 'category', 'CategoryLandingView.tsx')
const SERVIS = path.join(process.cwd(), 'src', 'lib', 'services', 'wizard.service.ts')

function ayrıştır(dosya: string, tur: ts.ScriptKind): ts.SourceFile {
  return ts.createSourceFile(dosya, fs.readFileSync(dosya, 'utf8'), ts.ScriptTarget.Latest, true, tur)
}

function dolaş(kok: ts.Node, ziyaret: (n: ts.Node) => void): void {
  ziyaret(kok)
  kok.forEachChild((c) => dolaş(c, ziyaret))
}

/** `const <ad> = <ifade>` düğümünü adıyla bulur. */
function degiskenBildirimi(sf: ts.SourceFile, ad: string): ts.VariableDeclaration | null {
  let bulunan: ts.VariableDeclaration | null = null
  dolaş(sf, (n) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === ad) bulunan = n
  })
  return bulunan
}

/** Bir JSX elemanının verilen prop'unu döner (self-closing veya açık etiket). */
function jsxProp(sf: ts.SourceFile, eleman: string, prop: string): ts.JsxAttribute | null {
  let bulunan: ts.JsxAttribute | null = null
  dolaş(sf, (n) => {
    const etiket = ts.isJsxSelfClosingElement(n)
      ? n.tagName
      : ts.isJsxOpeningElement(n)
        ? n.tagName
        : null
    if (!etiket || etiket.getText(sf) !== eleman) return
    const nitelikler = (n as ts.JsxSelfClosingElement | ts.JsxOpeningElement).attributes.properties
    for (const a of nitelikler) {
      if (ts.isJsxAttribute(a) && a.name.getText(sf) === prop) bulunan = a
    }
  })
  return bulunan
}

describe('INV-SILENTFAN-SERI-1 — anlatı ve sihirbaz aynı SERİye bağlı', () => {
  const gorunum = ayrıştır(GORUNUM, ts.ScriptKind.TSX)

  it('SABİT — seri kimliği tek bir yerde, dizgi değişmezi olarak yaşar', () => {
    const sabit = degiskenBildirimi(gorunum, 'SESSIZ_FAN_SERISI')
    expect(sabit, 'SESSIZ_FAN_SERISI sabiti bulunamadı').not.toBeNull()
    const deger = sabit!.initializer
    expect(deger && ts.isStringLiteral(deger), 'sabit bir dizgi değişmezi olmalı').toBe(true)
    expect((deger as ts.StringLiteral).text).toBe('vortice-lineo-quiet')
  })

  it('TETİKLEYİCİ — isSilentFan SERİ listesinden hesaplanır, kategori slugundan DEĞİL', () => {
    const tetikleyici = degiskenBildirimi(gorunum, 'isSilentFan')
    expect(tetikleyici, 'isSilentFan bildirimi bulunamadı').not.toBeNull()
    const ifade = tetikleyici!.initializer!.getText(gorunum)

    // Pozitif kol: sabit gerçekten tetikleyicide kullanılıyor.
    expect(ifade).toContain('SESSIZ_FAN_SERISI')
    // Ayırt edici kol: eski (ölü) bağ geri gelirse kırmızı yanar.
    expect(ifade, 'tetikleyici kategori sluguna bağlanamaz').not.toContain('category.slug')
  })

  it('TEK KAYNAK — sihirbaz, tetikleyicinin kullandığı AYNI sabitle beslenir', () => {
    const prop = jsxProp(gorunum, 'SilentFanWizard', 'familySlug')
    expect(prop, 'SilentFanWizard familySlug prop\'u yok (categorySlug kaldı olabilir)').not.toBeNull()

    const deger = prop!.initializer
    expect(deger && ts.isJsxExpression(deger), 'familySlug bir ifade olmalı').toBe(true)
    const ic = (deger as ts.JsxExpression).expression
    expect(ic && ts.isIdentifier(ic), 'familySlug gömülü dizgi değil SABİT almalı').toBe(true)

    // ASIL KOL: sihirbaza giden ad ile tetikleyicinin okuduğu ad AYNI olmalı.
    // Ayrışırlarsa anlatı görünür, sihirbaz başka ürün önerir — ve hiçbir sayı bozulmaz.
    expect((ic as ts.Identifier).text).toBe('SESSIZ_FAN_SERISI')
  })

  it('SİHİRBAZ artık kategori prop\'u KABUL ETMEZ (eski bağ geri sızamaz)', () => {
    expect(jsxProp(gorunum, 'SilentFanWizard', 'categorySlug')).toBeNull()
  })

  it('SERVİS — adaylar AİLEden çekilir, kategoriden değil', () => {
    const servis = ayrıştır(SERVIS, ts.ScriptKind.TS)
    let govde = ''
    dolaş(servis, (n) => {
      if (ts.isFunctionDeclaration(n) && n.name?.text === 'getWizardCandidates') {
        govde = n.body ? n.body.getText(servis) : ''
      }
    })
    expect(govde, 'getWizardCandidates bulunamadı').not.toBe('')

    // Pozitif: aile tablosundan çözülüp family_id ile daraltılıyor.
    expect(govde).toContain("'product_families'")
    expect(govde).toContain("'family_id'")
    // Ayırt edici: kategori kapsamı geri gelirse kırmızı. Bu iki dize, kusurun ta kendisiydi.
    expect(govde, 'aday kümesi kategoriye geri bağlanamaz').not.toContain("'categories'")
    expect(govde, 'aday kümesi kategoriye geri bağlanamaz').not.toContain("'subcategory_id'")
  })
})
