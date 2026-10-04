import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

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
 * ⭐KAPSAM GENİŞLEDİ (URN-32 + URN-33, 2026-10-04): kapı yalnız PDP ve JSON-LD'yi ölçüyordu,
 * kendi cümlesi ("HİÇBİR müşteri yüzeyinde") ise tümünü. URN-26 ölçümü açığı gösterdi: matris
 * satırı (`VariantSelector`, ≥20 modelli 5 aile) ve ürün föyü PDF'i (`Ref: product.sku`) ham
 * iç SKU basıyordu ve kapı yeşildi. Şimdi:
 *   · K5 — müşteri bileşenleri ADLA listelenir (boş evren korumalı) ve her biri ölçülür;
 *   · K6 — `src/{components,views,app}` altındaki ADMİN OLMAYAN her dosya taranır: bu yüzeylerde
 *          yeni bir `.sku` basımı, listeye eklenmesi unutulsa bile kırmızı verir;
 *   · K7 — ürün föyü PDF'i (`pdfGenerator.ts`) `sku` alanını HİÇ OKUMAZ;
 *   · K8 — dedektörün KENDİ ayırt ediciliği (sahte pozitif / sahte negatif örnekleriyle).
 *
 * ⭐SİPARİŞ DETAYI İSTİSNA DEĞİLDİR: `OrderDetailPage` müşteriye gösterilir ve sipariş-anı
 * `product_sku_snapshot`'ını basıyordu. Kuralın metninde "snapshot" ya da "fatura görünümü" diye
 * bir muafiyet YOK; snapshot alanı *sipariş kaydı* için SKU'yu saklar, *müşteri ekranı* için
 * değil. `model_code` snapshot'ı şemada olmadığından (migration bu işin kapsamı dışı) satır
 * kaldırıldı; müşteri eşleştirmeyi ürün adı + adet + tutar ile yapar. Model kodu snapshot'ı
 * istenirse ayrı bir kayıttır (bkz. URN-32 raporu).
 *
 * NİÇİN AST: `ts.Node.getText()` yorumları da taşır ve bu dosyanın kendi açıklamasında
 * yasaklı kalıplar geçiyor. Aynı tuzağa depoda bir kez düşüldü. AST yorumu, string
 * değişmezini ve `className` metnini zaten düğüm olarak görmez (`INV-SSR-GOVDE-2` örneği).
 *
 * BU KAPININ ÖLÇMEDİĞİ: `sku`nun TEKNİK kullanımını yasaklamaz ve yasaklamamalı —
 * `?sku=` adres parametresi, `key={v.sku}`, `onSelect(v.sku)`, karşılaştırma (`v.sku === x`),
 * koşul (`p.sku && …`) ve arama filtresi meşrudur. Ayırt edici: değer bir **metin düğümü
 * olarak ekrana** (JSX çocuğu ya da `title`/`alt`/`aria-label`/`placeholder` özniteliği) mi
 * gidiyor, yoksa kimlik olarak mı taşınıyor. Kapı birinciyi ölçer.
 *
 * ⚠KABUL EDİLEN SINIR, ADIYLA: değer bir FONKSİYONDAN geçip ekrana başka bir dosyada basılırsa
 * (`return v.sku` → başka bileşende `{etiket()}`) dedektör zinciri izlemez. Aynı dosyadaki
 * değişken takma adı (`const s = v.sku` → `{s}`) ve yapı bozma (`const { sku } = v`) İZLENİR.
 * Sunucu tarafı yüzeyleri (e-posta şablonu, Edge fonksiyonu) bu kapının DIŞINDADIR.
 */

const KOK = join(__dirname, '..', '..', '..')
const PDP = join(KOK, 'src', 'app', '_components', 'ProductDetailPageView.tsx')
const JSONLD = join(KOK, 'src', 'lib', 'seo', 'jsonld.ts')
const PDF_FOY = join(KOK, 'src', 'lib', 'pdfGenerator.ts')

/**
 * Müşteriye görünen bileşenler — ADLA. Her birinin canlı rotadan erişilebilirliği URN-32'de
 * ölçüldü (import zinciri); `QuickViewModal` hiçbir yerden import edilmiyor (ölü kod) ama
 * yeniden bağlandığı gün sızmasın diye listede.
 */
const MUSTERI_BILESENLERI = [
  ['src', 'app', '_components', 'ProductDetailPageView.tsx'],
  ['src', 'components', 'products', 'VariantSelector.tsx'],
  ['src', 'components', 'ProductCard.tsx'],
  ['src', 'components', 'QuickViewModal.tsx'],
  ['src', 'components', 'SearchOverlay.tsx'],
  ['src', 'components', 'navigation', 'TeklifPaneliIcerigi.tsx'],
  ['src', 'views', 'CartPage.tsx'],
  ['src', 'views', 'account', 'FavoritesPage.tsx'],
  ['src', 'views', 'account', 'OrderDetailPage.tsx'],
].map((parcalar) => join(KOK, ...parcalar))

/** Taranan müşteri ağacı kökleri (admin ve test hariç). */
const TARAMA_KOKLERI = ['components', 'views', 'app'].map((a) => join(KOK, 'src', a))

/** `sku`yu taşıyan alan adları (UI modeli, RPC satırı, sipariş snapshot'ı). */
const SKU_ALANLARI: ReadonlySet<string> = new Set(['sku', 'product_sku', 'product_sku_snapshot'])

/** Değeri ekranda GÖRÜNEN öznitelikler — kimlik değil, metin taşırlar. */
const GORUNUR_OZNITELIKLER: ReadonlySet<string> = new Set([
  'title',
  'alt',
  'aria-label',
  'aria-description',
  'aria-valuetext',
  'placeholder',
])

/** Sonucu `boolean` üreten ikili operatörler: değer ekrana gitmez, karşılaştırılır. */
const KARSILASTIRMA: ReadonlySet<ts.SyntaxKind> = new Set([
  ts.SyntaxKind.EqualsEqualsToken,
  ts.SyntaxKind.EqualsEqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsToken,
  ts.SyntaxKind.ExclamationEqualsEqualsToken,
  ts.SyntaxKind.LessThanToken,
  ts.SyntaxKind.LessThanEqualsToken,
  ts.SyntaxKind.GreaterThanToken,
  ts.SyntaxKind.GreaterThanEqualsToken,
  ts.SyntaxKind.InKeyword,
  ts.SyntaxKind.InstanceOfKeyword,
])

/** Üzerinde çağrılınca sonuç DEĞERİN KENDİSİ olmayan üyeler (doğruluk, sayı, sıra). */
const DEGER_URETMEYEN: ReadonlySet<string> = new Set([
  'some',
  'every',
  'includes',
  'indexOf',
  'lastIndexOf',
  'findIndex',
  'has',
  'startsWith',
  'endsWith',
  'localeCompare',
  'test',
  'length',
])

/** Geri çağrısının dönüşü bir KOŞUL olan dizi yöntemleri. */
const KOSUL_GERI_CAGRILARI: ReadonlySet<string> = new Set([
  'filter',
  'some',
  'every',
  'find',
  'findIndex',
  'findLast',
  'findLastIndex',
  'sort',
  'toSorted',
  'forEach',
])

function ayristir(yol: string, kaynak?: string): ts.SourceFile {
  const metin = kaynak ?? readFileSync(yol, 'utf8')
  const tur = yol.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  return ts.createSourceFile(yol, metin, ts.ScriptTarget.Latest, true, tur)
}

function ayristirDosya(yol: string): ts.SourceFile {
  const kaynak = readFileSync(yol, 'utf8')
  expect(kaynak.length, `BOŞ EVREN: ${yol} okunamadı ya da boş`).toBeGreaterThan(500)
  return ayristir(yol, kaynak)
}

/** Düğüm bir `sku` alanı OKUYUŞU mu? (`x.sku`, `x['sku']`) — ad konumundaki kimlikler hariç. */
function skuErisimiMi(n: ts.Node): boolean {
  if (ts.isPropertyAccessExpression(n)) return SKU_ALANLARI.has(n.name.text)
  if (ts.isElementAccessExpression(n)) {
    const arg = n.argumentExpression
    return ts.isStringLiteralLike(arg) && SKU_ALANLARI.has(arg.text)
  }
  return false
}

/** Çıplak kimlik bir DEĞER başvurusu mu (bildirim/ad konumu değil)? */
function degerBasvurusuMu(n: ts.Identifier): boolean {
  const p = n.parent
  if (!p) return false
  if (ts.isPropertyAccessExpression(p)) return p.expression === n
  if (ts.isPropertyAssignment(p)) return p.initializer === n
  if (ts.isShorthandPropertyAssignment(p)) return true
  // Bildirimde yalnız İLKLEYİCİ bir değer başvurusudur (`const z = s`); ad konumu değildir.
  if (ts.isVariableDeclaration(p) || ts.isParameter(p) || ts.isBindingElement(p)) {
    return p.initializer === n
  }
  if (
    ts.isJsxAttribute(p) ||
    ts.isPropertySignature(p) ||
    ts.isPropertyDeclaration(p) ||
    ts.isMethodDeclaration(p) ||
    ts.isFunctionDeclaration(p) ||
    ts.isTypeReferenceNode(p) ||
    ts.isImportSpecifier(p) ||
    ts.isExportSpecifier(p) ||
    ts.isLabeledStatement(p)
  ) {
    return false
  }
  return true
}

type Yolculuk = 'basilir' | 'basilmaz' | { takmaAd: string }

/**
 * Bir `sku` düğümünün değeri nereye akıyor?
 *  · `basilir`  — JSX çocuğu ya da görünür öznitelik: müşteri okur.
 *  · `basilmaz` — kimlik/koşul/karşılaştırma/handler: ekrana metin olarak gitmez.
 *  · `takmaAd`  — `const x = <değer>`: aynı dosyada `x` ayrıca izlenir.
 */
function yolculuk(dugum: ts.Node): Yolculuk {
  let cocuk: ts.Node = dugum
  let ust: ts.Node | undefined = dugum.parent
  while (ust) {
    if (ts.isJsxExpression(ust)) {
      const anne = ust.parent
      if (anne && (ts.isJsxElement(anne) || ts.isJsxFragment(anne))) return 'basilir'
      if (anne && ts.isJsxAttribute(anne)) {
        return GORUNUR_OZNITELIKLER.has(anne.name.getText()) ? 'basilir' : 'basilmaz'
      }
      return 'basilmaz'
    }
    if (ts.isJsxAttribute(ust)) {
      // Dize değişmezi değil ifade konumundaki değer (`title={v.sku}` JsxExpression'dan geçerdi);
      // buraya gelen, doğrudan atanan başka biçimdir.
      return 'basilmaz'
    }
    // Koşul KONUMU: değer yalnız dal seçer, ekrana gitmez.
    if (ts.isConditionalExpression(ust) && ust.condition === cocuk) return 'basilmaz'
    if (ts.isBinaryExpression(ust)) {
      const op = ust.operatorToken.kind
      if (KARSILASTIRMA.has(op)) return 'basilmaz'
      if (op === ts.SyntaxKind.AmpersandAmpersandToken && ust.left === cocuk) return 'basilmaz'
    }
    if (ts.isPrefixUnaryExpression(ust) && ust.operator === ts.SyntaxKind.ExclamationToken) {
      return 'basilmaz'
    }
    if (ts.isTypeOfExpression(ust)) return 'basilmaz'
    // Değerden ÖLÇÜ/DOĞRULUK üreten çağrılar (`[v.sku, …].some(...)`, `v.sku.length`): sonuç
    // `sku` değildir, ekrana basılan şey de o değildir.
    if (ts.isPropertyAccessExpression(ust) && ust.expression === cocuk && DEGER_URETMEYEN.has(ust.name.text)) {
      return 'basilmaz'
    }
    // Değerin akışı: ifade gövdeli ok fonksiyonu değeri DIŞARI döndürür — ama süzgeç/sıralama
    // geri çağrısının dönüşü bir KOŞULDUR, değer değil.
    if (ts.isArrowFunction(ust)) {
      const cagri: ts.Node | undefined = ust.parent
      if (
        cagri &&
        ts.isCallExpression(cagri) &&
        cagri.arguments.includes(ust) &&
        ts.isPropertyAccessExpression(cagri.expression) &&
        KOSUL_GERI_CAGRILARI.has(cagri.expression.name.text)
      ) {
        return 'basilmaz'
      }
      if (ust.body !== cocuk) return 'basilmaz'
      cocuk = ust
      ust = ust.parent
      continue
    }
    if (ts.isVariableDeclaration(ust)) {
      if (ust.initializer === cocuk && ts.isIdentifier(ust.name)) return { takmaAd: ust.name.text }
      return 'basilmaz'
    }
    if (ts.isReturnStatement(ust)) {
      cocuk = ust
      ust = ust.parent
      continue
    }
    // Başka her deyim (ifade deyimi, if, blok, fonksiyon bildirimi…) JSX çocuğu değildir.
    if (ts.isStatement(ust) || ts.isFunctionLike(ust) || ts.isSourceFile(ust)) return 'basilmaz'
    cocuk = ust
    ust = ust.parent
  }
  return 'basilmaz'
}

interface Ihlal {
  satir: number
  metin: string
}

/** Dosyada müşteriye METİN olarak basılan her `sku` okuyuşu. */
function basilanSkular(kaynak: ts.SourceFile): Ihlal[] {
  const takmaAdlar = new Set<string>()
  // Takma ad kümesi sabitlenene dek tara (alias'ın alias'ı).
  for (let tur = 0; tur < 4; tur += 1) {
    const onceki = takmaAdlar.size
    const gez = (n: ts.Node): void => {
      if (skuErisimiMi(n)) {
        const y = yolculuk(n)
        if (typeof y === 'object') takmaAdlar.add(y.takmaAd)
      } else if (ts.isBindingElement(n) && ts.isIdentifier(n.name)) {
        // `const { sku } = v` ya da `const { sku: s } = v`
        const kaynakAd = n.propertyName && ts.isIdentifier(n.propertyName) ? n.propertyName.text : n.name.text
        if (SKU_ALANLARI.has(kaynakAd)) takmaAdlar.add(n.name.text)
      } else if (ts.isIdentifier(n) && degerBasvurusuMu(n) && (SKU_ALANLARI.has(n.text) || takmaAdlar.has(n.text))) {
        const y = yolculuk(n)
        if (typeof y === 'object') takmaAdlar.add(y.takmaAd)
      }
      ts.forEachChild(n, gez)
    }
    gez(kaynak)
    if (takmaAdlar.size === onceki) break
  }

  const ihlaller: Ihlal[] = []
  const gez = (n: ts.Node): void => {
    const hedef =
      skuErisimiMi(n) ||
      (ts.isIdentifier(n) && degerBasvurusuMu(n) && (SKU_ALANLARI.has(n.text) || takmaAdlar.has(n.text)))
    if (hedef && yolculuk(n) === 'basilir') {
      ihlaller.push({
        satir: kaynak.getLineAndCharacterOfPosition(n.getStart()).line + 1,
        metin: n.getText().slice(0, 60),
      })
    }
    ts.forEachChild(n, gez)
  }
  gez(kaynak)
  return ihlaller
}

/** Dosyada `sku` alanının HERHANGİ bir okuyuşu (föy PDF'i için: teknik kullanımı da yok). */
function skuOkumalari(kaynak: ts.SourceFile): Ihlal[] {
  const bulunan: Ihlal[] = []
  const gez = (n: ts.Node): void => {
    const hedef =
      skuErisimiMi(n) ||
      (ts.isBindingElement(n) &&
        ts.isIdentifier(n.name) &&
        SKU_ALANLARI.has(n.propertyName && ts.isIdentifier(n.propertyName) ? n.propertyName.text : n.name.text)) ||
      (ts.isIdentifier(n) && degerBasvurusuMu(n) && SKU_ALANLARI.has(n.text))
    if (hedef) {
      bulunan.push({
        satir: kaynak.getLineAndCharacterOfPosition(n.getStart()).line + 1,
        metin: n.getText().slice(0, 60),
      })
    }
    ts.forEachChild(n, gez)
  }
  gez(kaynak)
  return bulunan
}

function goreli(yol: string): string {
  return relative(KOK, yol).split(sep).join('/')
}

function musteriDosyalari(kok: string): string[] {
  const bulunan: string[] = []
  if (!existsSync(kok)) return bulunan
  for (const ad of readdirSync(kok)) {
    const yol = join(kok, ad)
    if (statSync(yol).isDirectory()) {
      // Yönetici yüzeyi müşteri yüzeyi DEĞİLDİR (SKU orada kimliktir); testler tarif eder, ihlal etmez.
      if (ad === 'admin' || ad === '__tests__' || ad === 'node_modules') continue
      bulunan.push(...musteriDosyalari(yol))
      continue
    }
    if (/\.tsx$/.test(ad) && !/\.(test|spec)\.tsx$/.test(ad)) bulunan.push(yol)
  }
  return bulunan
}

const satirlar = (ihlaller: Ihlal[]): string => ihlaller.map((i) => `  satır ${i.satir}: ${i.metin}`).join('\n')

describe('INV-SKU-GORUNMEZ-1 — sku müşteri yüzeyinde basılmaz', () => {
  it('K1: PDP — `.sku` JSX METNİ olarak basılmıyor (kimlik kullanımı serbest)', () => {
    const ihlaller = basilanSkular(ayristirDosya(PDP))
    expect(
      ihlaller,
      'PDP müşteriye `sku` (iç kod) basıyor. Görünen kod YALNIZ `model_code` olmalı — ' +
        '`getProductModelLabel` kullan, null dönerse satırı hiç çizme (REC-272 hükmü).\n' +
        satirlar(ihlaller),
    ).toEqual([])
  })

  it('K2: JSON-LD — `sku` alanı ürün düğümüne YAZILMIYOR', () => {
    const kaynak = ayristirDosya(JSONLD)
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
    const kaynak = ayristirDosya(JSONLD)
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

  it('K5: adla listelenen müşteri bileşenlerinin hiçbiri `sku` BASMIYOR', () => {
    const ihlalli: string[] = []
    for (const yol of MUSTERI_BILESENLERI) {
      expect(existsSync(yol), `BOŞ EVREN: ${goreli(yol)} yok — yeniden adlandırıldıysa listeyi güncelle`).toBe(true)
      const ihlaller = basilanSkular(ayristirDosya(yol))
      if (ihlaller.length > 0) ihlalli.push(`${goreli(yol)}\n${satirlar(ihlaller)}`)
    }
    expect(
      ihlalli,
      'Müşteri bileşeni iç SKU basıyor. Görünen kod YALNIZ `model_code` (`getProductModelLabel`); ' +
        'yoksa satırı HİÇ çizme, ad zaten `getProductDisplayName`dan gelir.\n' +
        ihlalli.join('\n'),
    ).toEqual([])
  })

  it('K6: `src/{components,views,app}` altındaki ADMİN OLMAYAN hiçbir dosya `sku` basmıyor', () => {
    const dosyalar = TARAMA_KOKLERI.flatMap(musteriDosyalari)
    // Boş evren: tarama gerçekten büyük bir ağacı gördü ve listelenen bileşenler içinde.
    expect(dosyalar.length, 'taranan müşteri ağacı beklenenden küçük — yol değişmiş olabilir').toBeGreaterThan(150)
    for (const yol of MUSTERI_BILESENLERI) {
      expect(dosyalar, `${goreli(yol)} taramanın DIŞINDA kalmış`).toContain(yol)
    }

    const ihlalli: string[] = []
    for (const yol of dosyalar) {
      // Ucuz ön süzgeç: dosyada `sku` geçmiyorsa ayrıştırmaya gerek yok.
      if (!/sku/i.test(readFileSync(yol, 'utf8'))) continue
      const ihlaller = basilanSkular(ayristir(yol))
      if (ihlaller.length > 0) ihlalli.push(`${goreli(yol)}\n${satirlar(ihlaller)}`)
    }
    expect(
      ihlalli,
      'Müşteri yüzeyinde ham SKU basan dosya var. Yönetici ekranıysa `admin` dizinine ait olmalı; ' +
        'müşteri ekranıysa `getProductModelLabel` kullan.\n' +
        ihlalli.join('\n'),
    ).toEqual([])
  })

  it('K7: ürün föyü PDF — `sku` alanı HİÇ okunmuyor (müşteri belgesi, kimlik kullanımı yok)', () => {
    const okumalar = skuOkumalari(ayristirDosya(PDF_FOY))
    expect(
      okumalar,
      'Föy PDF`i `sku` okuyor — müşteri belgesine iç kod basılır (URN-33: `Ref: product.sku`). ' +
        'Model kodu zaten `getProductModelLabel` ile gövdede basılıyor; üst bilgiye ikinci kopya koyma.\n' +
        satirlar(okumalar),
    ).toEqual([])
  })

  describe('K8: dedektörün ayırt ediciliği (sahte pozitif / sahte negatif)', () => {
    const olc = (kod: string) => basilanSkular(ayristir('ornek.tsx', kod)).length

    it.each([
      ['düz JSX çocuğu', 'const A = () => <b>{v.sku}</b>'],
      ['metinle yan yana', 'const A = () => <b>{v.brand} • {v.sku}</b>'],
      ['şablon dizesi', 'const A = () => <b>{`№ ${v.sku}`}</b>'],
      ['çeviri anahtarına parametre', "const A = () => <b>{t('k', { sku: item.product_sku })}</b>"],
      ['sipariş snapshot alanı', 'const A = () => <b>{it.product_sku_snapshot}</b>'],
      ['fonksiyon argümanı', 'const A = () => <b>{vurgula(r.sku, q)}</b>'],
      ['üçlü dal', "const A = () => <b>{a ? v.sku : ''}</b>"],
      ['?? ile', "const A = () => <b>{v.sku ?? ''}</b>"],
      ['köşeli erişim', "const A = () => <b>{v['sku']}</b>"],
      ['takma ad', 'const A = () => { const s = v.sku; return <b>{s}</b> }'],
      ['takma adın takma adı', 'const A = () => { const s = v.sku; const z = s; return <b>{z}</b> }'],
      ['yapı bozma', 'const A = ({ v }) => { const { sku } = v; return <b>{sku}</b> }'],
      ['yapı bozma, yeniden adlı', 'const A = ({ v }) => { const { sku: kod } = v; return <b>{kod}</b> }'],
      ['dizi eşleme sonucu', "const A = () => <b>{l.map((v) => v.sku).join(', ')}</b>"],
      ['title özniteliği', 'const A = () => <b title={v.sku} />'],
      ['alt özniteliği', 'const A = () => <img alt={v.sku} />'],
      ['aria-label özniteliği', 'const A = () => <b aria-label={`${v.sku}`} />'],
      ['kısa yazım parametre', "const A = ({ sku }) => <b>{t('k', { sku })}</b>"],
    ])('basılır → yakalanır: %s', (_ad, kod) => {
      expect(olc(kod)).toBeGreaterThan(0)
    })

    it.each([
      ['key özniteliği', 'const A = () => <li key={v.sku} />'],
      ['href parametresi', 'const A = () => <a href={adres(v.sku)} />'],
      ['olay işleyicisi', 'const A = () => <a onClick={() => sec(v.sku)} />'],
      ['karşılaştırma', 'const A = () => <b>{v.sku === s && <i>x</i>}</b>'],
      ['süzgeç geri çağrısı', 'const A = () => <b>{l.filter((v) => v.sku === s).length}</b>'],
      ['koşul konumu', 'const A = () => <b>{v.sku ? <i>{v.ad}</i> : null}</b>'],
      ['&& sol operand', 'const A = () => <b>{v.sku && <i>{v.ad}</i>}</b>'],
      ['ünlemli koşul', 'const A = () => <b>{!v.sku ? 1 : 2}</b>'],
      ['bileşik anahtar', 'const A = () => <li key={`${v.sku}:${k}`} />'],
      ['yorum', 'const A = () => <b>{/* v.sku */}{/* {v.sku} */}</b>\n// {v.sku}'],
      ['dize değişmezi', "const A = () => <b className=\"{v.sku}\">{'v.sku'}</b>"],
      ['className metni', 'const A = () => <b className="sku product_sku" />'],
      ['sözlük anahtarı etiketi', "const A = () => <b>{t('pdp.labels.sku')}</b>"],
      ['ifade deyimi', 'function f(v) { izle(v.sku) }'],
      [
        'arama süzgeci (VariantSelector deseni)',
        'const A = () => { const f = useMemo(() => l.filter((v) => [v.sku, v.model_code].filter(Boolean).some((x) => String(x).includes(q))), []); return <b>{f.length}{f.map((v) => v.ad)}</b> }',
      ],
      ['sıralama geri çağrısı', 'const A = () => <b>{l.sort((a, b) => a.sku.localeCompare(b.sku)).length}</b>'],
      ['kullanılmayan takma ad','const A = () => { const s = v.sku; return <b>{v.ad}</b> }'],
      ['başka alan', 'const A = () => <b>{v.model_code}</b>'],
      ['alan adı bildirimi', 'const A = ({ x }: { x: { sku: string } }) => <b>{x.ad}</b>'],
    ])('basılmaz → yakalanmaz: %s', (_ad, kod) => {
      expect(olc(kod)).toBe(0)
    })

    it('föy kolu `sku` OKUYUŞUNU ayrıca yakalar (alan adı bildirimi ve yorum hariç)', () => {
      const olc2 = (kod: string) => skuOkumalari(ayristir('ornek.ts', kod)).length
      expect(olc2('const r = `Ref: ${product.sku}`')).toBe(1)
      expect(olc2("doc.text(product['sku'])")).toBe(1)
      expect(olc2('const { sku } = product')).toBe(1)
      expect(olc2('// product.sku\nconst a = "product.sku"')).toBe(0)
      expect(olc2('interface P { sku: string }')).toBe(0)
      expect(olc2('const a = product.model_code')).toBe(0)
    })
  })
})
