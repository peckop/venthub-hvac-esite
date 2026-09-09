import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * INV-SKU-GORUNMEZ-1 — `sku` HİÇBİR müşteri yüzeyinde basılmaz; görünen kod YALNIZ `model_code`
 *
 * KORUNAN DEĞİŞMEZ:
 *   "Müşteriye (ve arama motoruna) gösterilen ürün kodu yalnız `model_code`'dur.
 *    `model_code` yoksa kod satırı HİÇ çizilmez ve JSON-LD'ye kod alanı yazılmaz."
 *
 * NİÇİN (REC-146, 2026-09-09): Recep sözü *"kodu boşalt"* — amaç, müşterinin **uydurma kod
 * görmemesi**. Katalog şeridi beş üründe uydurma kodu (VRT-16076..16080) temizleyecek.
 * Ölçüldü, iki yer `sku` basıyordu:
 *   · PDP: `{t('pdp.labels.sku')}: {selectedVariant.sku}` → müşteriye İÇ KOD
 *   · JSON-LD: `sku: variant.sku` → arama motoruna iç kod (ve uydurma kod) BEYANI
 *
 * ⭐İLKE YENİ DEĞİL, YERİ EKSİKTİ: `getProductModelLabel` (REC-272) zaten
 * *"`model_code` yoksa null döner, `sku`ya DÜŞMEZ — etiketi hiç göstermemek, müşteriye iç
 * kod göstermekten iyidir"* diyor. `VariantSelector:78` ve JSON-LD `mpn` çoktan ona
 * geçmişti; geride kalan iki yer buydu. Kapı, ilkeyi tüm yüzeylere bağlar.
 *
 * NİÇİN AST: `ts.Node.getText()` yorumları da taşır ve bu dosyanın kendi açıklamasında
 * yasaklı kalıplar geçiyor. Aynı tuzağa depoda bir kez düşüldü.
 *
 * BU KAPININ ÖLÇMEDİĞİ: `sku`nun TEKNİK kullanımını yasaklamaz ve yasaklamamalı —
 * `?sku=` adres parametresi, `key={v.sku}`, `onSelect(v.sku)` ve arama filtresi meşrudur.
 * Ayırt edici: değer bir **metin düğümü olarak ekrana** mı gidiyor, yoksa kimlik olarak mı
 * taşınıyor. Kapı birinciyi ölçer.
 */

const KOK = join(__dirname, '..', '..', '..')
const PDP = join(KOK, 'src', 'app', '_components', 'ProductDetailPageView.tsx')
const JSONLD = join(KOK, 'src', 'lib', 'seo', 'jsonld.ts')

function ayristir(yol: string): ts.SourceFile {
  const kaynak = readFileSync(yol, 'utf8')
  expect(kaynak.length, `BOŞ EVREN: ${yol} okunamadı ya da boş`).toBeGreaterThan(500)
  return ts.createSourceFile(yol, kaynak, ts.ScriptTarget.Latest, true)
}

/** Düğüm bir JSX ifadesinin İÇİNDE mi — yani ekrana METİN olarak mı gidiyor? */
function jsxMetniMi(n: ts.Node): boolean {
  let p: ts.Node | undefined = n.parent
  while (p) {
    if (ts.isJsxExpression(p)) {
      // `key={...}`, `onClick={...}`, `aria-*={...}` gibi ÖZNİTELİKLER ekrana metin
      // basmaz; yalnız çocuk konumundaki ifade basar.
      const ust = p.parent
      if (ust && (ts.isJsxElement(ust) || ts.isJsxFragment(ust))) return true
      return false
    }
    if (ts.isJsxAttribute(p)) return false
    p = p.parent
  }
  return false
}

describe('INV-SKU-GORUNMEZ-1 — sku müşteri yüzeyinde basılmaz', () => {
  it('K1: PDP — `.sku` JSX METNİ olarak basılmıyor (kimlik kullanımı serbest)', () => {
    const kaynak = ayristir(PDP)
    const ihlaller: string[] = []

    const gez = (n: ts.Node): void => {
      if (ts.isPropertyAccessExpression(n) && n.name.text === 'sku' && jsxMetniMi(n)) {
        const satir = kaynak.getLineAndCharacterOfPosition(n.getStart()).line + 1
        ihlaller.push(`ProductDetailPageView.tsx:${satir}`)
      }
      ts.forEachChild(n, gez)
    }
    gez(kaynak)

    expect(
      ihlaller,
      'PDP müşteriye `sku` (iç kod) basıyor. Görünen kod YALNIZ `model_code` olmalı — ' +
        '`getProductModelLabel` kullan, null dönerse satırı hiç çizme (REC-272 hükmü).\n' +
        ihlaller.join('\n'),
    ).toEqual([])
  })

  it('K2: JSON-LD — `sku` alanı ürün düğümüne YAZILMIYOR', () => {
    const kaynak = ayristir(JSONLD)
    let yazim = 0

    const gez = (n: ts.Node): void => {
      // `sku: <ifade>` (nesne değişmezi) ya da `node.sku = <ifade>` (atama)
      if (ts.isPropertyAssignment(n) && ts.isIdentifier(n.name) && n.name.text === 'sku') yazim += 1
      if (
        ts.isBinaryExpression(n) &&
        n.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        ts.isPropertyAccessExpression(n.left) &&
        n.left.name.text === 'sku'
      ) {
        yazim += 1
      }
      ts.forEachChild(n, gez)
    }
    gez(kaynak)

    expect(
      yazim,
      'JSON-LD `sku` alanı yazıyor — arama motoruna İÇ KOD (ve uydurma kod) beyan edilir. ' +
        'Kod yayınlama yolu tek olmalı: `mpn` (yani `model_code`), o da yoksa hiçbiri.',
    ).toBe(0)
  })

  it('K3: `mpn` hâlâ koşullu yazılıyor — kardeş kural bozulmadı (REC-272)', () => {
    const kaynak = ayristir(JSONLD)
    let kosulsuzMpn = 0
    const gez = (n: ts.Node): void => {
      if (ts.isPropertyAssignment(n) && ts.isIdentifier(n.name) && n.name.text === 'mpn') {
        kosulsuzMpn += 1
      }
      ts.forEachChild(n, gez)
    }
    gez(kaynak)
    expect(
      kosulsuzMpn,
      '`mpn` bir nesne değişmezinde koşulsuz yazılmış — REC-272: model_code yoksa alan hiç yazılmaz',
    ).toBe(0)
  })

  it('K4: BOŞ EVREN DEĞİL — iki dosya da gerçekten okundu ve kod alanı geçiyor', () => {
    const pdp = readFileSync(PDP, 'utf8')
    const jsonld = readFileSync(JSONLD, 'utf8')
    expect(/getProductModelLabel/.test(pdp), 'PDP doğru çözücüyü hiç kullanmıyor').toBe(true)
    expect(/mpn/.test(jsonld), 'jsonld\'de `mpn` hiç geçmiyor — yanlış dosya ölçülüyor').toBe(true)
  })
})
