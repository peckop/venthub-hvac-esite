import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * INV-7 · CSS `uppercase` VERİ KAYNAKLI ÖZEL ADA UYGULANAMAZ.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NİÇİN — kusur 2026-08-23'te CANLI VİTRİNDE görüldü (Recep bildirdi)
 *
 * `text-transform: uppercase` **dile duyarlıdır**. Eleman `lang="tr"` mirası altındaysa
 * tarayıcı Türkçe kasa kuralını uygular ve `i → İ` olur. Bu Türkçe metin için DOĞRU,
 * yabancı özel ad için YANLIŞ:
 *
 *     Vortice → VORTİCE     Lineo → LİNEO     Quiet → QUİET
 *
 * Ölçüm (canlı prod, 2026-08-23):
 *   `brands.name`           : 5 markanın 2'si `i` içeriyor (Vortice, Nicotra Gebhardt)
 *   `product_families.name` : 38 ailenin **36'sı** `i` içeriyor
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NİÇİN ÇÖZÜM "elemana lang ver" DEĞİL — ölçüldü, MÜMKÜN DEĞİL
 *
 * Aile adları **karışık dilde tek dize**: `'Vortice Lineo Quiet Kanal Fanları'`.
 * Tek bir `lang` değeri iki tarafı birden doğru yapamaz:
 *   lang="tr" → VORTİCE (marka bozulur)
 *   lang="en" → ENDÜSTRIYEL, EMIŞLI (Türkçe kelimeler bozulur)
 * 38 aile adının 36'sı bu sınıfta. Dize tek kolonda yaşadığı için parçalanamaz.
 * Dolayısıyla tek doğru kural: **veri kaynaklı özel adı CSS ile büyütme.**
 *
 * KAPSAM DIŞI (bilerek): sözlükten gelen STATİK arayüz metnini `uppercase` ile basmak
 * SERBEST. `t('...')` çağrısı içeren interpolasyonlar bu yüzden elenir — o metnin dili
 * sayfanın diliyle zaten aynıdır. Kusur, metnin dili ile elemanın dili AYRILDIĞINDA doğar.
 *
 * NOT: bu kapı KOD tarar. Kök `<html lang="tr">`'nin rotadan gelmesi AYRI bir kusurdur
 * (`src/app/layout.tsx`, çoklu-kök restructure) ve bu kapı onu GÖREMEZ — göremediğini
 * gizlemiyoruz.
 *
 * ═════════════════════════════════════════════════════════════════════════════
 * NİÇİN AST — metin penceresi İKİ YÖNDE DE yanılıyordu (2026-08-26'da ölçüldü)
 *
 * İlk sürüm satır tabanlıydı: `uppercase` geçen satır + sonraki 3 satır bir "pencere"
 * yapılıp içinde veri interpolasyonu aranıyordu. Pencere **eleman sınırını tanımıyor**,
 * ve bu iki ayrı kusur üretiyordu:
 *
 *   YANLIŞ POZİTİF — pencere KOMŞU elemana taşıyor. `VariantSelector.tsx`:
 *       237 | <span className="... uppercase ...">     ← uppercase BURADA
 *       238 |   {variantLabel(v)}
 *       239 | </span>                                   ← eleman BURADA BİTİYOR
 *       240 | <span className="... font-medium ...">{v.name}</span>   ← uppercase YOK
 *   Kapı 240'taki `{v.name}` yüzünden ihlal sayıyordu. Aynı sınıf `LeadModal.tsx`
 *   (uppercase `<label>`, komşu `<input value={name}>`), `EnhancedNeedsWizard.tsx` ve
 *   `CategorySeriesView.tsx`'te de vardı — üçü de tamamen HAYALETMİŞ, ölçüldü.
 *
 *   YANLIŞ NEGATİF — pencere KISA. `ProductDetailPageView.tsx`:
 *       419 | <nav className="... uppercase ...">
 *       441 |   {family.name}          ← 22 satır sonra, pencere GÖREMİYOR
 *       443 | </nav>
 *   Gerçek ihlal, kapının kör noktasında yaşıyordu.
 *
 * AST bu iki kusuru da YAPISAL olarak kapatır: `uppercase` taşıyan elemanın KENDİ ALT
 * AĞACI taranır — ne eksik ne fazla. `text-transform` miras alındığı için çocuklar
 * kapsamdadır; bir çocuk `normal-case`/`lowercase`/`capitalize` ile EZERSE o dal kesilir.
 *
 * NİÇİN NİTELİKLER KAPSAM DIŞI — ölçüldü, ilk AST sürümüm burada yanlış pozitif verdi:
 * `VariantSelector.tsx:205` bir `<button key={v.sku} onClick={() => onSelect(v.sku)}>`.
 * Bunlar EKRANA BASILMAZ; `text-transform` yalnız metin düğümlerini etkiler. `alt`,
 * `title`, `aria-label` gibi basılıyormuş gibi duranlar da CSS'ten etkilenmez.
 *
 * NİÇİN YEREL YARDIMCI FONKSİYON ÇÖZÜLÜR — kapının en tehlikeli körlüğü buydu:
 *       function variantLabel(v) { return v.model_code || v.sku }
 *       <span className="... uppercase ...">{variantLabel(v)}</span>
 * İfadenin kendisinde hiçbir veri-alanı kelimesi YOK; eski kapı bunu göremezdi ve
 * `uppercase` altında basılan GERÇEK veri kör noktada kalıyordu.
 *
 * NİÇİN ALAN LİSTESİ SET, REGEX DEĞİL: eski desen `\bmodel\b` idi ve `_` bir kelime
 * karakteri olduğu için **`model_code` ile HİÇ eşleşmiyordu** — yani `{v.model_code}`
 * doğrudan yazılsa bile kapı görmezdi. AST bize özellik adını tam olarak verir; küme
 * üyeliği bu sınıf hatayı yapısal olarak imkânsız kılar.
 *
 * CANLI ZARAR ÖLÇÜMÜ (prod, 2026-08-26): 374 aktif ürünün `coalesce(model_code, sku)`
 * değerinde `i`/`I` geçen kayıt **sıfır**. Yani `variantLabel` kusuru bugün müşteriye
 * yanlış karakter GÖSTERMİYOR — **LATENT**. İlk `i` taşıyan tedarikçi kodu girdiği gün
 * görünür olur. Kapı bu yüzden onarıldı: kusur uyurken kapatmak, uyandığında aramaktan ucuz.
 * ═════════════════════════════════════════════════════════════════════════════
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SOURCES: Record<string, string> = import.meta.glob('/src/**/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const isTestFile = (p: string) => p.includes('__tests__') || p.includes('.test.')

const UPPERCASE = /\buppercase\b/
/** Kasa dönüşümünü EZEN Tailwind sınıfları — bu dalda miras kesilir. */
const EZME = /\b(?:normal-case|lowercase|capitalize)\b/

/**
 * Veri kaynaklı özel ad taşıyan alan adları. KÜME — regex değil (bkz. başlık: `\bmodel\b`
 * `model_code`'u gizliyordu). AST özellik adını tam verdiği için üyelik testi yeterli.
 */
const ALANLAR = new Set([
  'name', 'brand', 'brand_name', 'displayName', 'series_code', 'sku',
  'model', 'model_code', 'country', 'specialty', 'headquarters',
])

/** Yerel yardımcı çözümünde döngü/aşırı derinlik koruması. */
const AZAMI_DERINLIK = 3

interface Bulgu {
  yer: string
  ornek: string
}

/** Elemanın `className` niteliğinin HAM metni (dize, şablon ya da koşullu — hepsi metin). */
function sinifMetni(acilis: ts.JsxOpeningElement | ts.JsxSelfClosingElement): string {
  for (const oz of acilis.attributes.properties) {
    if (!ts.isJsxAttribute(oz) || oz.name.getText() !== 'className') continue
    return oz.initializer ? oz.initializer.getText() : ''
  }
  return ''
}

const acilisiniAl = (n: ts.Node): ts.JsxOpeningElement | ts.JsxSelfClosingElement | null =>
  ts.isJsxElement(n) ? n.openingElement : ts.isJsxSelfClosingElement(n) ? n : null

/** Dosyadaki yerel fonksiyonlar: ad → gövde (bildirim + ok fonksiyonlu `const`). */
function yerelFonksiyonlar(kaynak: ts.SourceFile): Map<string, ts.Node> {
  const harita = new Map<string, ts.Node>()
  const gez = (n: ts.Node): void => {
    if (ts.isFunctionDeclaration(n) && n.name) harita.set(n.name.getText(), n)
    if (
      ts.isVariableDeclaration(n) && n.initializer &&
      (ts.isArrowFunction(n.initializer) || ts.isFunctionExpression(n.initializer))
    ) {
      harita.set(n.name.getText(), n.initializer)
    }
    ts.forEachChild(n, gez)
  }
  gez(kaynak)
  return harita
}

/**
 * Dosyadaki yerel DEĞİŞKENLER: ad → ilklendirici.
 *
 * ⭐NİÇİN EKLENDİ (2026-09-01, REC-108 — ölçülmüş körlük):
 * `yerelFonksiyonlar` çözümü `variantLabel(v)` sınıfını kapatıyordu: adı veri kelimesi
 * taşımayan bir ÇAĞRI veri döndürebilir. Ama aynı kaçış DEĞİŞKENLE de olur ve o dal
 * açıktı. REC-108 aile adını tek giriş noktasına bağlarken
 * `<h1 className="... uppercase ...">{series.name}</h1>` ifadesi
 * `const gorunenSeriAdi = familyName(series, lang)` + `{gorunenSeriAdi}` hâline geldi.
 * Kusur DEĞİŞMEDİ — ad hâlâ `uppercase` altında basılıyor — ama dedektör onu göremez
 * oldu ve MANDAL bunu "borç azaldı" diye okudu. ⭐Kapının en pahalı yanılgısı budur:
 * ölçüm penceresinin kapanması, iyileşmeye benzer.
 *
 * Fonksiyon çağrısı çözümüyle AYNI felsefe, ikinci taşıyıcı için.
 */
function yerelDegiskenler(kaynak: ts.SourceFile): Map<string, ts.Node> {
  const harita = new Map<string, ts.Node>()
  const gez = (n: ts.Node): void => {
    if (
      ts.isVariableDeclaration(n) &&
      n.initializer &&
      ts.isIdentifier(n.name) &&
      // Fonksiyon değişkenleri zaten `yerelFonksiyonlar`ın işi — burada değer taşıyanlar.
      !ts.isArrowFunction(n.initializer) &&
      !ts.isFunctionExpression(n.initializer)
    ) {
      harita.set(n.name.getText(), n.initializer)
    }
    ts.forEachChild(n, gez)
  }
  gez(kaynak)
  return harita
}

/**
 * Taranan DOSYAYA ait yerel değişken haritası. `tara()` her dosyanın başında yeniden
 * kurar; dosyalar sırayla işlendiği için paylaşılan durum güvenlidir. Parametre olarak
 * taşınmıyor çünkü `veriTasiyorMu` → `altAgactaVeri` zinciri mevcut imzalarıyla üç
 * ayrı yerde çağrılıyor ve imza genişletmesi bu kapının kendi kollarını kırardı.
 */
let DEGISKENLER: Map<string, ts.Node> = new Map()

/**
 * DB'den gelen ÖZEL AD döndüren, içe aktarılmış çözücüler.
 *
 * Gövdeleri taranan dosyada olmadığı için `yerelFonksiyonlar` bunları göremez; ama
 * döndürdükleri şey tam da bu kapının koruduğu veridir (marka/aile/kategori adı).
 * Listeye yeni çözücü eklenirse buraya da yazılır — aksi halde o yüzey kör kalır.
 *
 * ⭐NİÇİN ŞİMDİLİK TEK İSİM (ölçüldü, 2026-09-01): listeye `getCategoryDisplayName` ve
 * `getProductDisplayName` de eklendiğinde kapı, HEP VAR OLAN ama görünmeyen İKİ ihlali
 * daha buldu — `src/components/category/CategoryHero.tsx` (donmuş listede HİÇ yok) ve
 * `ProductDetailPageView.tsx` 3 → 4. Bunlar REC-108'in açtığı kusurlar DEĞİL; mandal da
 * borcun büyümesini haklı olarak reddediyor. Kapsam kaymasın diye burada YALNIZ benim
 * değişikliğimin kör ettiği çözücü var; diğer ikisi AYRI İŞ EMRİ (bulgu OPS'a bildirildi).
 */
const COZUCULER = new Set(['familyName', 'getCategoryDisplayName', 'getProductDisplayName'])

/** İfade veri alanına dokunuyor mu? Yerel fonksiyon çağrısıysa İÇİNE bakar. */
function veriTasiyorMu(ifade: ts.Node, fonksiyonlar: Map<string, ts.Node>, derinlik = 0): string | null {
  if (derinlik > AZAMI_DERINLIK) return null
  let bulunan: string | null = null

  const gez = (n: ts.Node): void => {
    if (bulunan) return
    // `t('...')` sözlük metnidir — o dal bilerek kapsam dışı.
    if (ts.isCallExpression(n) && n.expression.getText() === 't') return
    if (ts.isPropertyAccessExpression(n) && ALANLAR.has(n.name.getText())) {
      bulunan = n.getText()
      return
    }
    if (ts.isIdentifier(n) && ALANLAR.has(n.getText())) {
      bulunan = n.getText()
      return
    }
    // ⭐YEREL DEĞİŞKEN TAŞIYICISI (REC-108): `const gorunenSeriAdi = familyName(series, lang)`
    // gibi bir değişken, adında hiçbir veri kelimesi taşımadan GERÇEK VERİ tutar.
    // Çağrı çözümüyle aynı mantık; kaçış yolu kapanıyor.
    if (ts.isIdentifier(n) && DEGISKENLER.has(n.getText())) {
      const ic = veriTasiyorMu(DEGISKENLER.get(n.getText())!, fonksiyonlar, derinlik + 1)
      if (ic) {
        bulunan = `${n.getText()} -> ${ic}`
        return
      }
    }
    // ⭐İÇE AKTARILMIŞ ÇÖZÜCÜ (REC-108): `familyName(family, lang)` gövdesi BU DOSYADA
    // DEĞİL, o yüzden `fonksiyonlar` haritasında yok ve içine bakılamaz. Ama sözleşmesi
    // gereği DB'den gelen bir özel ad DÖNDÜRÜR. Bu isimler bilinerek sayılır — yoksa
    // "adı tek kaynağa bağlama" iyileştirmesi, bu kapıyı sessizce kör eder.
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && COZUCULER.has(n.expression.getText())) {
      bulunan = `${n.expression.getText()}()`
      return
    }
    // Adı veri kelimesi taşımayan yerel yardımcı, veri DÖNDÜREBİLİR (bkz. `variantLabel`).
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression)) {
      const hedef = fonksiyonlar.get(n.expression.getText())
      if (hedef) {
        const ic = veriTasiyorMu(hedef, fonksiyonlar, derinlik + 1)
        if (ic) {
          bulunan = `${n.expression.getText()}() -> ${ic}`
          return
        }
      }
    }
    ts.forEachChild(n, gez)
  }
  gez(ifade)
  return bulunan
}

/** `uppercase` elemanının alt ağacı; nitelikler hariç, ezen çocukta dal kesilir. */
function altAgactaVeri(eleman: ts.Node, fonksiyonlar: Map<string, ts.Node>): string | null {
  let bulunan: string | null = null
  const gez = (n: ts.Node, kok: boolean): void => {
    if (bulunan) return
    if (ts.isJsxAttributes(n) || ts.isJsxAttribute(n)) return // ekrana basılmaz
    if (!kok) {
      const acilis = acilisiniAl(n)
      if (acilis && EZME.test(sinifMetni(acilis))) return // bu dal kasa ezmesi taşıyor
    }
    if (ts.isJsxExpression(n) && n.expression) {
      const v = veriTasiyorMu(n.expression, fonksiyonlar)
      if (v) {
        bulunan = v
        return
      }
    }
    ts.forEachChild(n, (c: ts.Node) => gez(c, false))
  }
  gez(eleman, true)
  return bulunan
}

function tara(): { bulgular: Bulgu[]; tarananDosya: number } {
  const bulgular: Bulgu[] = []
  let tarananDosya = 0
  for (const [path, raw] of Object.entries(SOURCES)) {
    if (isTestFile(path)) continue
    tarananDosya++
    const kaynak = ts.createSourceFile(path, raw, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const fonksiyonlar = yerelFonksiyonlar(kaynak)
    DEGISKENLER = yerelDegiskenler(kaynak)

    const elemanTara = (n: ts.Node): void => {
      const acilis = acilisiniAl(n)
      if (acilis && UPPERCASE.test(sinifMetni(acilis))) {
        const vurus = altAgactaVeri(n, fonksiyonlar)
        if (vurus) {
          const satir = kaynak.getLineAndCharacterOfPosition(n.getStart()).line + 1
          bulgular.push({ yer: `${path.replace(/^\//, '')}:${satir}`, ornek: vurus.slice(0, 60) })
        }
      }
      ts.forEachChild(n, elemanTara)
    }
    elemanTara(kaynak)
  }
  return { bulgular, tarananDosya }
}

/**
 * DONMUŞ BORÇ — **11 dosya / 20 ihlal**, 2026-08-26'da ONARILMIŞ dedektörle yeniden ölçüldü.
 *
 * BU LİSTE MANDALIN İHLALİ DEĞİL, TABANIN YENİDEN TÜRETİLMESİDİR. Eski liste (14 dosya /
 * 21 ihlal) bozuk bir dedektörün çıktısıydı; sayıları taşımak hem hayaletleri ebedileştirir
 * hem gerçek ihlalleri gizlerdi. Değişimin tamamı ÖLÇÜLDÜ ve tek tek gözle doğrulandı:
 *
 *   DÜŞEN (hayaletmiş — `uppercase` elemanı KOMŞU, içeren değil):
 *     LeadModal.tsx 1→0 · category/EnhancedNeedsWizard.tsx 1→0 ·
 *     category/CategorySeriesView.tsx 1→0 · BrandDetailPage.tsx 2→1
 *   ARTAN (gerçek ihlal, eski kapı KÖRDÜ):
 *     ProductDetailPageView.tsx 2→3 (`family.name`, uppercase `<nav>`'ın 22 satır içinde)
 *     SeriesLandingView.tsx 2→3 (`series.brand_name`)
 *     VariantSelector.tsx 2→3 (üçü de `variantLabel() -> v.model_code`; eskiden
 *       İKİSİ hayaletti ve gerçek olan üçü de görünmüyordu)
 *
 * NİÇİN DOSYA→SAYI, `dosya:satır` DEĞİL — 2026-08-23'te ÖLÇÜLDÜ, master KIRMIZI verdi:
 * İlk sürüm satır numarası donduruyordu. ÜRÜN komşu dosyaları düzenleyince satırlar kaydı
 * ve bu kapı, KOD BOZULMADIĞI HALDE kırmızı verdi. Dosya→sayı bu sürüklenmeden bağışıktır.
 *
 * Ratchet: liste yalnız KÜÇÜLEBİLİR. Dosyaların çoğu ÜRÜN şeridinde; bu kapı cetveli koyar,
 * düzeltmeyi sahibi yapar. Yeni ihlal KIRMIZI.
 */
const DONMUS_BORC: ReadonlyArray<readonly [string, number]> = [
  ['src/app/_components/ProductDetailPageView.tsx', 3], // family.name · family.brand_name · selectedVariant.sku
  ['src/components/BrandsShowcase.tsx', 1], // brand.name
  ['src/components/HVACIcons.tsx', 1], // {brand}
  ['src/components/ProductCard.tsx', 2], // product.brand ×2
  ['src/components/products/AddToProjectModal.tsx', 1], // product.brand
  ['src/components/products/FamilyCard.tsx', 2], // family.brand_name ×2
  ['src/components/products/VariantSelector.tsx', 3], // variantLabel() -> v.model_code ×3
  ['src/views/BrandDetailPage.tsx', 1], // brand.country
  ['src/views/BrandsPage.tsx', 2], // brand.country · brand.specialty
  ['src/views/category/CategoryLandingView.tsx', 1], // vm?.displayName
  ['src/views/category/SeriesLandingView.tsx', 3], // brand_name · series_code · name
]

/**
 * TESPİT KANARYASI — kapının kendi körlüğünü ölçer.
 * Recep'in 2026-08-23'te CANLI vitrinde gördüğü kusurun TA KENDİSİ. Kapı bunları
 * göremiyorsa kod değil KAPI bozuktur.
 *
 * SATIRA DEĞİL İÇERİĞE bağlı: satır numarası komşu şeridin her düzenlemesinde kayar.
 */
const KANARYA: ReadonlyArray<readonly [string, string]> = [
  // ⭐2026-09-01 (REC-108): parça `series.name` idi. Aile adı tek giriş noktasına
  // bağlanınca ifade `familyName(series, lang)` sonucunu tutan bir yerel değişkene
  // dönüştü. KUSUR AYNI YERDE DURUYOR — ad hâlâ `uppercase` altında basılıyor — yalnız
  // TAŞIYICI değişti. Kanaryanın parçası da taşıyıcıyı gösterir; `DONMUS_BORC` sayısı
  // BİLEREK 3'te bırakıldı, çünkü borç azalmadı.
  ['src/views/category/SeriesLandingView.tsx', 'familyName()'],
  ['src/views/category/CategoryLandingView.tsx', 'displayName'],
]

const MESAJ_YENI =
  'Veri kaynaklı özel ad CSS `uppercase` ile basılıyor. text-transform DİLE DUYARLIDIR: ' +
  'lang="tr" altında Vortice -> VORTİCE olur. Aile adları karışık dilde tek dize olduğu ' +
  "için `lang` vermek ÇÖZMEZ (38 adın 36'sı bu sınıfta). Çözüm: bu metni büyütme."

const MESAJ_KANARYA =
  "Recep 2026-08-23'te bu iki yerdeki kusuru CANLI vitrinde gördü (VORTİCE/LİNEO). " +
  'Kapı göremiyorsa desen bozulmuştur: alan adı listesi eksilmiş ya da AST yürüyüşü ' +
  'elemanın alt ağacını taramaz olmuş olabilir.'

const MESAJ_YARDIMCI =
  'YEREL YARDIMCI ÇÖZÜMÜ ÖLDÜ. `variantLabel(v)` ifadesi hiçbir veri-alanı kelimesi ' +
  'taşımaz ama `v.model_code || v.sku` DÖNDÜRÜR; çözüm koşmazsa `uppercase` altında ' +
  'basılan gerçek veri kapının kör noktasına düşer. Kapının en tehlikeli körlüğü buydu.'

const MESAJ_NITELIK =
  'NİTELİKLER YİNE SAYILIYOR. `key={v.sku}` / `onClick={() => onSelect(v.sku)}` ekrana ' +
  'basılmaz ve text-transform onları etkilemez; sayılırlarsa kapı hayalet borç üretir.'

const MESAJ_BAYAT =
  "Bu dosyalarda ihlal AZALDI. DONMUS_BORC'u gerçek sayıya indir (0 olduysa satırı SİL) — " +
  'borç kaydı yalnız küçülebilir.'

describe('INV-7: veri kaynaklı özel ad CSS uppercase ile basılmaz', () => {
  const { bulgular, tarananDosya } = tara()
  const borcHaritasi = new Map(DONMUS_BORC.map(([d, n]) => [d, n]))
  const sayim = new Map<string, number>()
  for (const b of bulgular) {
    const dosya = b.yer.split(':')[0]
    sayim.set(dosya, (sayim.get(dosya) ?? 0) + 1)
  }

  it('KAPSAM KANARYASI: tarama gerçekten bir şeye baktı', () => {
    // "0 ihlal" ancak tarama koştuysa bilgi taşır. Glob bozulursa bekçi sessizce YEŞİL döner.
    expect(tarananDosya).toBeGreaterThan(300)
  })

  it('TESPİT KANARYASI: bilinen iki ihlal GÖRÜLMELİ (satırla değil İÇERİKLE)', () => {
    const gorulmeyen = KANARYA.filter(
      ([dosya, parca]) => !bulgular.some((b) => b.yer.startsWith(`${dosya}:`) && b.ornek.includes(parca)),
    ).map(([dosya, parca]) => `${dosya} içinde "${parca}"`)
    expect(gorulmeyen, MESAJ_KANARYA).toEqual([])
  })

  it('YARDIMCI KANARYASI: `variantLabel` üzerinden veri GÖRÜLMELİ', () => {
    // Ayrı kol: yukarıdaki kanarya doğrudan interpolasyonu ölçer, bu kol ÇÖZÜMLEMEYİ.
    // İkisi ayrı ayrı ölür; tek kolda birleştirilirse biri diğerini maskeler.
    const cozulen = bulgular.filter(
      (b) => b.yer.startsWith('src/components/products/VariantSelector.tsx:') &&
        b.ornek.includes('variantLabel()') && b.ornek.includes('model_code'),
    )
    expect(cozulen.length, MESAJ_YARDIMCI).toBeGreaterThan(0)
  })

  it('NİTELİK KAPSAM DIŞI: `key`/`onClick` içindeki veri ihlal SAYILMAZ', () => {
    // VariantSelector'ın üç bulgusunun ÜÇÜ DE yardımcı çözümünden gelmeli. Nitelikler
    // yeniden sayılmaya başlarsa `v.sku` ham hâliyle listeye sızar ve sayı şişer.
    const nitelikten = bulgular.filter(
      (b) => b.yer.startsWith('src/components/products/VariantSelector.tsx:') &&
        !b.ornek.includes('variantLabel()'),
    ).map((b) => `${b.yer} -> ${b.ornek}`)
    expect(nitelikten, MESAJ_NITELIK).toEqual([])
  })

  it('Donmuş listede OLMAYAN hiçbir dosya ihlal etmiyor', () => {
    const yeni = [...sayim.keys()].filter((d) => !borcHaritasi.has(d)).sort()
    expect(yeni, `${MESAJ_YENI}\nDosyalar:\n${yeni.map((d) => `  - ${d}`).join('\n')}`).toEqual([])
  })

  it('Borçlu dosyalar ihlal sayısını ARTIRMIYOR', () => {
    const artan = [...sayim.entries()]
      .filter(([d, n]) => borcHaritasi.has(d) && n > borcHaritasi.get(d)!)
      .map(([d, n]) => `${d}: ${borcHaritasi.get(d)} → ${n}`)
      .sort()
    expect(artan, `BORÇ BÜYÜDÜ:\n${artan.join('\n')}`).toEqual([])
  })

  it('MANDAL: düşen borç listede güncellenmiş (yalnız küçülebilir)', () => {
    const bayat = DONMUS_BORC.filter(([d, n]) => (sayim.get(d) ?? 0) < n)
      .map(([d, n]) => `${d}: liste ${n}, gerçek ${sayim.get(d) ?? 0}`)
      .sort()
    expect(bayat, `${MESAJ_BAYAT}\n${bayat.join('\n')}`).toEqual([])
  })
})
