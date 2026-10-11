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
 *   · K6 — `src/**\/*.tsx` altındaki ADMİN OLMAYAN (`admin` dizini ve testler hariç) her dosya
 *          taranır: yeni bir `.sku` basımı, listeye eklenmesi unutulsa bile kırmızı verir;
 *   · K7 — JSX DIŞINDA belge basan iki dosya (föy PDF'i `pdfGenerator.ts`, sipariş detayındaki
 *          proforma PDF'inin bulunduğu `OrderDetailPage.tsx`) `sku` alanını HİÇ OKUMAZ — jsPDF
 *          `doc.text` ve `autoTable` gövdesi JSX olmadığı için K5/K6 dedektörü onları göremez
 *          (sabotajla ölçüldü: proforma gövdesine SKU eklenince yalnız K7 kırmızı verir);
 *   · K8 — dedektörün KENDİ ayırt ediciliği (sahte pozitif / sahte negatif örnekleriyle).
 *
 * ⭐SİPARİŞ DETAYI İSTİSNA DEĞİLDİR: `OrderDetailPage` müşteriye gösterilir ve sipariş-anı
 * `product_sku_snapshot`'ını basıyordu. Kuralın metninde "snapshot" ya da "fatura görünümü" diye
 * bir muafiyet YOK; snapshot alanı *sipariş kaydı* için SKU'yu saklar, *müşteri ekranı* için
 * değil. Satır kaldırıldı ve sorgudan da çıktı. Yerine kalemde `products.model_code` gösterilir
 * (embed `products ( model_code )`): bu GÜNCEL katalog kodudur, sipariş-anı snapshot'ı DEĞİL —
 * şemada `model_code` snapshot'ı yok (migration bu işin kapsamı dışı). Ad tekilliğine
 * dayanılmaz: `products.name` üzerinde UNIQUE yok (bugün 442 üründe çakışma 0, bkz.
 * product-schema-standard §11.4 ölçüm notu); ayırt edicilik ad + model kodu ile sağlanır.
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
 * ⚠KABUL EDİLEN SINIRLAR, ADIYLA (kapı "yok" demez, "bu yazılışlar yok" der):
 *   1. İZLENENLER (aynı dosya içinde): değişken takma adı (`const s = v.sku` → `{s}`), yapı
 *      bozma (`const { sku } = v`), ok/ifade/adlı fonksiyon dönüşü (`return x.sku` → `{f(v)}`;
 *      adlı fonksiyon yalnız ÇAĞRILINCA değer sayılır, `modelAdresi={f}` işlev başvurusudur),
 *      dizi eşleme sonucu (`v.map((x) => x.sku).join()`), görünür öznitelikler (düz HTML: title,
 *      alt, aria-label, placeholder, value, label, content, text, description) ve ÖZEL BİLEŞEN
 *      proplarının tümü (`<Row kod={v.sku}/>`) — teknik adlar (key, href, id, on*, data-*, *Sku,
 *      className…) muaftır.
 *   2. İZLENMEYENLER: değerin FONKSİYONDAN geçip başka DOSYADA basılması; özel bileşenin kendi
 *      içinde `sku=` propunu metne çevirmesi (prop adı teknik görünür; bileşenin içi K6'da kendi
 *      dosyası olarak ölçülür); `dangerouslySetInnerHTML`, `document.title =` gibi JSX dışı yollar.
 *   3. KAPSAM KÖR NOKTALARI: K6 yalnız `.tsx` tarar. `.ts` dosyaları (`utils/`, `hooks/`,
 *      `contexts/`, `lib/`) JSX içermez ama metin üretebilir (ör. `utils/whatsapp.ts`
 *      `stockInquiryWithSku` mesajı: bugün ölü kod, çağıranı yok) — bunları bu kapı ölçmez.
 *      Sunucu tarafı yüzeyler (e-posta şablonu, Edge fonksiyonu, `supabase/`) kapı DIŞIDIR.
 *      `admin` dizinleri bilerek kapsam dışıdır (SKU orada kimliktir).
 */

const KOK = join(__dirname, '..', '..', '..')
const PDP = join(KOK, 'src', 'app', '_components', 'ProductDetailPageView.tsx')
const JSONLD = join(KOK, 'src', 'lib', 'seo', 'jsonld.ts')
/**
 * JSX DIŞINDA belge basan müşteri dosyaları: ürün föyü PDF'i ve sipariş detayındaki proforma PDF'i
 * (`OrderDetailPage.handleInvoicePdf`, jsPDF `doc.text` + `autoTable` gövdesi). Basım varış yeri JSX
 * olmadığı için `basilanSkular` bunları göremez; burada `sku` okumanın kendisi yasak.
 */
const SKU_OKUMAYAN_DOSYALAR = [
  join(KOK, 'src', 'lib', 'pdfGenerator.ts'),
  join(KOK, 'src', 'views', 'account', 'OrderDetailPage.tsx'),
]

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
const TARAMA_KOKLERI = [join(KOK, 'src')]

/** `sku`yu taşıyan alan adları (UI modeli, RPC satırı, sipariş snapshot'ı). */
const SKU_ALANLARI: ReadonlySet<string> = new Set(['sku', 'product_sku', 'product_sku_snapshot'])

/** Düz HTML öğesinde değeri ekranda GÖRÜNEN öznitelikler — kimlik değil, metin taşırlar. */
const GORUNUR_OZNITELIKLER: ReadonlySet<string> = new Set([
  'title',
  'alt',
  'aria-label',
  'aria-description',
  'aria-valuetext',
  'placeholder',
  'value',
  'defaultValue',
  'label',
  'content',
  'text',
  'description',
])

/**
 * ÖZEL BİLEŞENDE (`<Row …/>`, büyük harfle başlayan etiket) prop adı bu desene uymuyorsa değeri
 * ekrana gidebilir sayılır: bileşenin içinde metne dönüşüp dönüşmediği bu dosyadan görülmez, bu yüzden
 * varsayılan "basılır"dır. Kimlik/adres/olay/stil taşıyan adlar açıkça muaftır (`sku`, `selectedSku`,
 * `href`, `key`, `onSelect`, `className`, `data-*` …).
 */
const TEKNIK_PROP = /^(key|ref|href|to|id|as|name|type|src|srcSet|role|tabIndex|htmlFor|className|style)$|^on[A-Z]|^data-|^aria-(?!label$|description$|valuetext$)|[sS]ku$/

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

type Yolculuk = 'basilir' | 'basilmaz' | { takmaAd: string; fonksiyon: boolean }

/** Bir JSX özniteliğinin ifade değeri ekrana metin olarak gidebilir mi? */
function oznitelikBasilirMi(oznitelik: ts.JsxAttribute): boolean {
  const ad = oznitelik.name.getText()
  const oge: ts.Node | undefined = oznitelik.parent?.parent
  const etiket = oge && (ts.isJsxOpeningElement(oge) || ts.isJsxSelfClosingElement(oge)) ? oge.tagName.getText() : ''
  // Büyük harfle başlayan ya da noktalı etiket özel bileşendir; küçük harf düz HTML öğesidir.
  const ozelBilesen = /^[A-Z]/.test(etiket) || etiket.includes('.')
  return ozelBilesen ? !TEKNIK_PROP.test(ad) : GORUNUR_OZNITELIKLER.has(ad)
}

/**
 * Bir fonksiyonun DÖNÜŞ değeri nereye akıyor? Süzgeç/sıralama geri çağrısının dönüşü bir koşuldur;
 * adlı fonksiyon bildirimi çağrıldığı yerde değeri taşır (adı takma ad olarak izlenir).
 */
function donusAkisi(fn: ts.Node): 'devam' | 'basilmaz' | { takmaAd: string; fonksiyon: boolean } {
  if (ts.isFunctionDeclaration(fn)) return fn.name ? { takmaAd: fn.name.text, fonksiyon: true } : 'basilmaz'
  if (!ts.isArrowFunction(fn) && !ts.isFunctionExpression(fn)) return 'basilmaz'
  const cagri: ts.Node | undefined = fn.parent
  if (
    cagri &&
    ts.isCallExpression(cagri) &&
    cagri.arguments.some((a) => a === fn) &&
    ts.isPropertyAccessExpression(cagri.expression) &&
    KOSUL_GERI_CAGRILARI.has(cagri.expression.name.text)
  ) {
    return 'basilmaz'
  }
  return 'devam'
}

/**
 * Bir `sku` düğümünün değeri nereye akıyor?
 *  · `basilir`  — JSX çocuğu ya da görünür öznitelik: müşteri okur.
 *  · `basilmaz` — kimlik/koşul/karşılaştırma/handler: ekrana metin olarak gitmez.
 *  · `takmaAd`  — `const x = <değer>`: aynı dosyada `x` ayrıca izlenir.
 */
function yolculuk(dugum: ts.Node): Yolculuk {
  // Değer bir fonksiyon sınırından geçtiyse bağlanan ad bir DEĞER değil, ÇAĞRILINCA değer veren işlevdir.
  let fonksiyonGecti = false
  let cocuk: ts.Node = dugum
  let ust: ts.Node | undefined = dugum.parent
  while (ust) {
    if (ts.isJsxExpression(ust)) {
      const anne = ust.parent
      if (anne && (ts.isJsxElement(anne) || ts.isJsxFragment(anne))) return 'basilir'
      if (anne && ts.isJsxAttribute(anne)) return oznitelikBasilirMi(anne) ? 'basilir' : 'basilmaz'
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
    // Çağrı, fonksiyonu tüketir (`v.map(fn)`, `useMemo(fn)`, `fn()`): bağlanan ad artık değerdir.
    if (ts.isCallExpression(ust)) fonksiyonGecti = false
    // Değerden ÖLÇÜ/DOĞRULUK üreten çağrılar (`[v.sku, …].some(...)`, `v.sku.length`): sonuç
    // `sku` değildir, ekrana basılan şey de o değildir.
    if (ts.isPropertyAccessExpression(ust) && ust.expression === cocuk && DEGER_URETMEYEN.has(ust.name.text)) {
      return 'basilmaz'
    }
    // Değerin akışı: ifade gövdeli ok fonksiyonu değeri DIŞARI döndürür — ama süzgeç/sıralama
    // geri çağrısının dönüşü bir KOŞULDUR, değer değil.
    if (ts.isArrowFunction(ust)) {
      if (ust.body !== cocuk) return 'basilmaz'
      const akis = donusAkisi(ust)
      if (akis !== 'devam') return akis
      fonksiyonGecti = true
      cocuk = ust
      ust = ust.parent
      continue
    }
    if (ts.isVariableDeclaration(ust)) {
      if (ust.initializer === cocuk && ts.isIdentifier(ust.name)) {
        return { takmaAd: ust.name.text, fonksiyon: fonksiyonGecti }
      }
      return 'basilmaz'
    }
    if (ts.isReturnStatement(ust)) {
      // Blok gövdeli geri çağrı / fonksiyon: `return x.sku` değeri fonksiyonun ÇAĞRILDIĞI yere taşır.
      let fn: ts.Node | undefined = ust.parent
      while (fn && !ts.isFunctionLike(fn)) fn = fn.parent
      if (!fn) return 'basilmaz'
      const akis = donusAkisi(fn)
      if (akis !== 'devam') return akis
      fonksiyonGecti = true
      cocuk = fn
      ust = fn.parent
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
  // ad → 'deger' (`const s = v.sku`: `s` sku taşır) | 'fonksiyon' (`const f = (x) => x.sku`: `f` yalnız
  // ÇAĞRILINCA sku taşır; `modelAdresi={f}` gibi çıplak başvuru bir değer değil, bir işlev başvurusudur).
  const takmaAdlar = new Map<string, 'deger' | 'fonksiyon'>()
  const kaydet = (y: Yolculuk): void => {
    if (typeof y !== 'object') return
    if (takmaAdlar.get(y.takmaAd) !== 'deger') takmaAdlar.set(y.takmaAd, y.fonksiyon ? 'fonksiyon' : 'deger')
  }
  const kimlikKaynakMi = (n: ts.Node): boolean => {
    if (!ts.isIdentifier(n) || !degerBasvurusuMu(n)) return false
    if (SKU_ALANLARI.has(n.text)) return true
    const tur = takmaAdlar.get(n.text)
    if (tur === 'deger') return true
    const p = n.parent
    return tur === 'fonksiyon' && !!p && ts.isCallExpression(p) && p.expression === n
  }
  // Takma ad kümesi sabitlenene dek tara (alias'ın alias'ı).
  for (let tur = 0; tur < 4; tur += 1) {
    const onceki = takmaAdlar.size + [...takmaAdlar.values()].filter((v) => v === 'deger').length
    const gez = (n: ts.Node): void => {
      if (skuErisimiMi(n)) {
        kaydet(yolculuk(n))
      } else if (ts.isBindingElement(n) && ts.isIdentifier(n.name)) {
        // `const { sku } = v` ya da `const { sku: s } = v`
        const kaynakAd = n.propertyName && ts.isIdentifier(n.propertyName) ? n.propertyName.text : n.name.text
        if (SKU_ALANLARI.has(kaynakAd)) takmaAdlar.set(n.name.text, 'deger')
      } else if (kimlikKaynakMi(n)) {
        kaydet(yolculuk(n))
      }
      ts.forEachChild(n, gez)
    }
    gez(kaynak)
    if (takmaAdlar.size + [...takmaAdlar.values()].filter((v) => v === 'deger').length === onceki) break
  }

  const ihlaller: Ihlal[] = []
  const gez = (n: ts.Node): void => {
    const hedef = skuErisimiMi(n) || kimlikKaynakMi(n)
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

  it('K6: `src/**/*.tsx` altındaki ADMİN OLMAYAN hiçbir dosya `sku` basmıyor', () => {
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

  it.each(SKU_OKUMAYAN_DOSYALAR.map((yol) => [goreli(yol), yol] as const))(
    'K7: müşteri BELGESİ üreten %s — `sku` alanı HİÇ okunmuyor (kimlik kullanımı da yok)',
    (_ad, yol) => {
      const okumalar = skuOkumalari(ayristirDosya(yol))
      expect(
        okumalar,
        'Müşteri belgesi (PDF) üreten dosya `sku` okuyor — belgeye iç kod basılır (URN-33: föyde `Ref: product.sku`). ' +
          'JSX olmayan basımı (jsPDF `doc.text`, `autoTable` gövdesi) JSX dedektörü GÖRMEZ; bu yüzden ' +
          'bu dosyalarda `sku` okuması yasak, teknik kullanım dahil. Model kodu `getProductModelLabel` ile gelir.\n' +
          satirlar(okumalar),
      ).toEqual([])
    },
  )

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
      // URN-32 çürütücü turu: dosya İÇİNDEN atlatma yolları.
      [
        'blok gövdeli geri çağrı',
        "const A = () => { const l = v.map((x) => { return x.sku }); return <b>{l.join(', ')}</b> }",
      ],
      ['adlı fonksiyon dönüşü', 'function kod(x) { return x.sku }\nconst A = () => <b>{kod(v)}</b>'],
      ['fonksiyon ifadesi dönüşü', 'const kod = function (x) { return x.sku }\nconst A = () => <b>{kod(v)}</b>'],
      ['özel bileşen prop (kod=)', 'const A = () => <Row kod={v.sku} />'],
      ['özel bileşen prop (şablon)', 'const A = () => <Row etiket={`${v.sku}`} />'],
      ['noktalı özel bileşen', 'const A = () => <Tablo.Satir kod={v.sku} />'],
      ['value özniteliği', 'const A = () => <input value={v.sku} readOnly />'],
      ['label özniteliği', 'const A = () => <optgroup label={v.sku} />'],
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
      ['sözlük anahtarı etiketi', "const A = () => <b>{t('pdp.labels.modelCode')}</b>"],
      ['ifade deyimi', 'function f(v) { izle(v.sku) }'],
      [
        'arama süzgeci (VariantSelector deseni)',
        'const A = () => { const f = useMemo(() => l.filter((v) => [v.sku, v.model_code].filter(Boolean).some((x) => String(x).includes(q))), []); return <b>{f.length}{f.map((v) => v.ad)}</b> }',
      ],
      ['sıralama geri çağrısı', 'const A = () => <b>{l.sort((a, b) => a.sku.localeCompare(b.sku)).length}</b>'],
      ['kullanılmayan takma ad','const A = () => { const s = v.sku; return <b>{v.ad}</b> }'],
      ['başka alan', 'const A = () => <b>{v.model_code}</b>'],
      ['alan adı bildirimi', 'const A = ({ x }: { x: { sku: string } }) => <b>{x.ad}</b>'],
      [
        'özel bileşen teknik proplar',
        'const A = () => <Satir sku={v.sku} selectedSku={v.sku} href={adres(v.sku)} onSelect={() => sec(v.sku)} key={v.sku} data-kod={v.sku} />',
      ],
      ['blok gövdeli süzgeç geri çağrısı', 'const A = () => <b>{l.filter((x) => { return x.sku === q }).length}</b>'],
      [
        'blok gövdeli geri çağrı, yalnız sayı basılır',
        'const A = () => { const l = v.map((x) => { return x.sku }); return <b>{l.length}</b> }',
      ],
      ['fonksiyon dönüşü key olarak', 'function kod(x) { return x.sku }\nconst A = () => <li key={kod(v)} />'],
      ['düz HTML öğesinde teknik öznitelik', 'const A = () => <input data-kod={v.sku} id={v.sku} name={v.sku} />'],
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
