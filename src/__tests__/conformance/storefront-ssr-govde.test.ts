/**
 * INV-SSR-GOVDE-1 — hesaplayıcı sayfaları sunucuda render edilmeye devam eder.
 *
 * NİÇİN VAR (ölçülmüş canlı olay, REC-150 / 2026-09-05):
 * `venthub.com.tr` üzerinde ölçüldü — iki hesaplayıcı sayfası arama motoruna **boş**
 * görünüyordu:
 *
 *   | sayfa            | sunucudan `<h1>` | görünür kelime | `<meta description>`        |
 *   |------------------|------------------|----------------|-----------------------------|
 *   | `hrv`            | 0                | **0**          | sitenin JENERİK açıklaması  |
 *   | `hava-perdesi`   | 0                | —              | jenerik                      |
 *   | `kanal`          | 1                | 422            | sayfanın KENDİ açıklaması   |
 *   | `jet-fan`        | 1                | —              | kendi                        |
 *
 * SEBEP: `useSearchParams()` çağıran bileşen CSR bailout'una girer ve **onu saran Suspense
 * sınırının kapsadığı ağacın tamamı** sunucuda render edilmez. O iki rotada sınır
 * `page.tsx`'te **sayfanın tamamını** sarıyordu.
 *
 * ⚠KURAL 5 LAFZEN SAĞLANIYORDU: "useSearchParams kullanan bileşen Suspense ile sarılmalı"
 * — sarılmıştı. Ama sarılan şey bileşen değil SAYFAYDI. Kural ihlal edilmiyordu; yanlış
 * YERDE uygulanıyordu. Bu yüzden hiçbir kapı görmedi: `tsc`, `lint`, i18n ve mevcut
 * konformans kapılarının hepsi "Suspense var mı" sorusuna EVET cevabı alıyordu.
 *
 * ⭐BU KAPININ SINIRI, AÇIKÇA: burası STATİK bir kapıdır. "Sunucudan gövde geliyor mu"
 * sorusunu GERÇEKTEN ölçemez — o cevap yalnız çalışma zamanında (servis edilen HTML)
 * alınır. Burada ölçülen şey, bailout'u ÜRETEN YAPININ geri gelmemesidir. Çalışma-zamanı
 * kolu ayrı bir iştir (REC-150 Adım 3, `tests/smoke/` ağacı — başka şeridin alanı).
 * Bu sınırı yazmak zorunda hissediyorum çünkü "kapı var" demek "ölçülüyor" demek değildir.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const KOK = process.cwd()
const oku = (...p: string[]) => readFileSync(join(KOK, ...p), 'utf8')
/** Yorum ANLATIR, kural UYGULAR — ölçüt daima gövdede koşar. */
const govde = (k: string) => k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

/** Parametre okuyan iki görünüm ve rotaları. */
const ETKILENEN = [
  {
    ad: 'hrv',
    rota: ['src', 'app', '[lang]', 'destek', 'hesaplayicilar', 'hrv', 'page.tsx'],
    gorunum: ['src', 'views', 'calculators', 'HRVCalcPage.tsx'],
  },
  {
    ad: 'hava-perdesi',
    rota: ['src', 'app', '[lang]', 'destek', 'hesaplayicilar', 'hava-perdesi', 'page.tsx'],
    gorunum: ['src', 'views', 'calculators', 'AirCurtainCalcPage.tsx'],
  },
] as const

/** Bailout'u hiç yaşamayan kardeşler — karşılaştırma kümesi. */
const SAGLIKLI_ROTALAR = [
  ['src', 'app', '[lang]', 'destek', 'hesaplayicilar', 'kanal', 'page.tsx'],
  ['src', 'app', '[lang]', 'destek', 'hesaplayicilar', 'jet-fan', 'page.tsx'],
] as const

const OKUYUCU = ['src', 'components', 'calculators', 'UrlParametreOkuyucu.tsx'] as const

describe('INV-SSR-GOVDE-1 · hesaplayıcı sayfaları sunucuda render edilir', () => {
  it('⭐ASIL İDDİA — rota dosyası sayfayı Suspense ile SARMAZ', () => {
    for (const { ad, rota } of ETKILENEN) {
      const g = govde(oku(...rota))
      expect(
        /<Suspense/.test(g),
        `${ad}: rota dosyasi sayfayi Suspense ile sariyor. Sinir SAYFAYI sarinca ` +
          'useSearchParams bailout u tum sayfayi kapsar ve sayfa SUNUCUDA HIC RENDER ' +
          'EDILMEZ — canlida olculdu: 0 kelime govde, jenerik meta description. ' +
          'Sinir gorunumun icinde, yalniz parametreyi okuyan uc bilesende olmali.',
      ).toBe(false)
    }
  })

  it('⭐GÖRÜNÜM useSearchParams ÇAĞIRMAZ — okuma uç bileşene taşındı', () => {
    for (const { ad, gorunum } of ETKILENEN) {
      const g = govde(oku(...gorunum))
      expect(
        /useSearchParams\s*\(/.test(g),
        `${ad}: gorunum useSearchParams i DOGRUDAN cagiriyor. O cagri bileseni bailout a ` +
          'sokar; okuma UrlParametreOkuyucu ya birakilmali.',
      ).toBe(false)
      expect(
        g.includes('UrlParametreOkuyucu'),
        `${ad}: UrlParametreOkuyucu kullanilmiyor — parametre okuma YETENEGI kaybolmus ` +
          'olabilir. Bu is bailout u kaldirmak icindi, "hesabimi paylas" ozelligini ' +
          'oldurmek icin DEGIL.',
      ).toBe(true)
      expect(
        /<Suspense/.test(g),
        `${ad}: gorunumde Suspense yok — okuyucu sinirsiz kalirsa Next hata verir.`,
      ).toBe(true)
    }
  })

  it('⭐⭐SESSİZ VERİ KAYBI KİLİDİ — geri-yazma, okuma bitmeden çalışamaz', () => {
    // NİÇİN EN KRİTİK KOL BU: URL sync effect i koruma olmadan calisirsa, bilesen
    // baglandigi anda VARSAYILANLARI URL e yazar ve gelen paylasim baglantisini
    // OKUMADAN siler. Kullanici linke tiklar, adres cubugu bosalir, hesap varsayilana
    // doner — ve hicbir test bunu gormez, cunku sayfa "calisiyor".
    for (const { ad, gorunum } of ETKILENEN) {
      const g = govde(oku(...gorunum))
      expect(
        /if\s*\(\s*!\s*parametrelerOkundu\s*\)\s*return/.test(g),
        `${ad}: URL geri-yazma effect i "parametreler okundu" kilidini TASIMIYOR. ` +
          'Koruma olmadan gelen paylasim baglantisi okunmadan silinir (sessiz kayip).',
      ).toBe(true)
      // Kilit bayrağı effect'in bağımlılıklarında da olmalı; yoksa React eski değeri
      // kapatır ve kilit ilk render'dan sonra hiç güncellenmez.
      expect(
        /\[\s*parametrelerOkundu\s*,/.test(g),
        `${ad}: kilit bayragi effect bagimliliklarinda YOK — kilit bayat deger uzerinde ` +
          'kalir ve gecersizlesir.',
      ).toBe(true)
    }
  })

  it('OKUYUCU HİÇBİR ŞEY ÇİZMEZ ve okumayı BİR KEZ yapar', () => {
    const g = govde(oku(...OKUYUCU))
    expect(/return\s+null/.test(g), 'Okuyucu bir sey ciziyor — bailout gorunur alana tasar.').toBe(true)
    expect(
      /okundu\.current/.test(g),
      'Okuyucu "bir kez" korumasi tasimiyor — geri-yazma sonrasi searchParams kimligi ' +
        'degisince kullanicinin girdigi degerler URL deki ilk degerlerle SUREKLI ezilir.',
    ).toBe(true)
  })

  it('AYIRT EDİCİ — sağlıklı kardeş rotalar da aynı kalıpta (ölçüt evrensel)', () => {
    // Kapi yalniz iki dosyayi kilitlemesin: ayni sinif yarin ucuncu bir rotada dogabilir.
    // Kardeslerin zaten dogru oldugunu olcmek, olcutun DOGRU sey oldugunu gosterir.
    for (const rota of SAGLIKLI_ROTALAR) {
      const g = govde(oku(...rota))
      expect(
        /<Suspense/.test(g),
        `${rota.join('/')}: saglikli kardes rotaya sayfa-boyu Suspense EKLENMIS — ` +
          'ayni kusur bu rotaya tasinir.',
      ).toBe(false)
    }
  })

  it('BOŞLUK MUHAFIZI — dosyalar gerçekten okunuyor (INV-SSR-GOVDE-1)', () => {
    // Yol listesi bozulsa ya da dosyalar tasinsa, ustteki "false" beklentileri SAHTE-YESIL
    // verirdi. Okunan govdelerin gercekten dolu oldugu OLCULUR.
    for (const { ad, rota, gorunum } of ETKILENEN) {
      expect(govde(oku(...rota)).length, `${ad}: rota dosyasi bos okundu.`).toBeGreaterThan(50)
      expect(govde(oku(...gorunum)).length, `${ad}: gorunum bos okundu.`).toBeGreaterThan(2000)
    }
    expect(govde(oku(...OKUYUCU)).length, 'Okuyucu bos okundu.').toBeGreaterThan(100)
  })
})

/**
 * INV-SSR-GOVDE-2 — kategori ve /products gövdesi ham HTML'de GÖRÜNÜR yerde kalır (URN-25).
 *
 * NİÇİN VAR (ölçülmüş, `next build` çıktısı `.next/server/app/<dil>/...html`, 2026-10-03):
 *
 *   | sayfa              | görünür / gizli blokta kelime | h1 yeri      |
 *   |--------------------|-------------------------------|--------------|
 *   | tr/category/fanlar | 94 / 719 (canlı: 99 / 724)    | `S:0` İÇİNDE |
 *   | tr/products        | 99 / 1015                     | `S:0` İÇİNDE |
 *   | en/products        | 93 / 1165                     | `S:0` İÇİNDE |
 *
 * MEKANİZMA İKİ KOLLU: bir Suspense sınırının sardığı içerik (a) askıya alınırsa (`next/dynamic`
 * görünümler sunucuda `React.lazy` gibi askıya alır) ya da (b) büyükse (Fizz, içerik
 * `progressiveChunkSize` ≈ 12800 bayt üstündeyse TAMAMLANMIŞ olsa bile) sınırın dışına,
 * `<div hidden id="S:n">` akış bloğuna yazılır; görünür yerde yalnız fallback iskeleti kalır.
 * JS çalıştırmayan okuyucu gövdeyi görmez. İkinci kol bu işte izole ölçülmedi (kaynak: çürütücü
 * ölçümü, dynamic'siz `brands/page.tsx` de S:0 üretiyor); sonuç aynı: BÜYÜK GÖVDEYİ SARAN HER
 * Suspense aynı arızayı verir. Sınır İKİ katmandaydı (rota çekirdeği + `CategoryMasterView`);
 * ÖLÇÜLDÜ: yalnız kökü kaldırmak YETMEDİ, ikisi birden kalkınca blok 0 oldu. Görünümleri statik
 * import etmek de bloğu sıfırladı ama ilk yük JS'ini 324 → 410 kB çıkardı; `dynamic()` KALDI.
 *
 * ⚠KURAL 5 LAFZEN SAĞLANIYORDU ("Suspense var"); yanlış YERDEYDİ (bkz. INV-SSR-GOVDE-1).
 *
 * ⭐AYRIŞTIRMA GERÇEK AST'TİR (ilk sürüm regex'ti ve çürütücü delik buldu): iç içe sınır, "Pagination
 * içeriyorsa geçer", `Suspense as X`, `const S = React.Suspense`, `createElement(React.Suspense…)`.
 * Aşağıdaki sabote örnekler hepsini KIRMIZI üretmek zorundadır.
 *
 * ⭐KAPININ SINIRI: kaynak okur, derleme çıktısını DEĞİL. "Gövde hidden dışında" iddiasının kendisi
 * ham HTML'de ölçülür: PR kapısı `e2e/ssr-html.e2e.ts` ve prod alarmı `tests/smoke/ssr-html.spec.ts`
 * (`govdeGorunur` ölçütü: S bloğu 0 + görünür h1; mantığı INV-DUMAN-8 sınar).
 */
describe('INV-SSR-GOVDE-2 · kategori ve /products Suspense sınırı içeriği sarmaz', () => {
  /** İçeriği ham HTML'de görünür kalması gereken çekirdekler (hiçbir Suspense kimliği YOK). */
  const SUSPENSESIZ = [
    ['src', 'app', '_components', 'kategoriSayfasi.tsx'],
    ['src', 'app', '_components', 'urunlerSayfasi.tsx'],
    ['src', 'views', 'CategoryPage.tsx'],
    ['src', 'app', '[lang]', 'category', '[categorySlug]', 'page.tsx'],
    ['src', 'app', '[lang]', 'products', 'page.tsx'],
    ['src', 'app', '[lang]', 'kategori', '[kok]', '[[...dal]]', 'page.tsx'],
    ['src', 'app', '[lang]', 'urunler', 'page.tsx'],
  ] as const
  const MASTER = ['src', 'views', 'CategoryMasterView.tsx'] as const
  /** Rota dizinleri: `loading.tsx` örtük bir Suspense sınırıdır; bu dizinlerde ya da üstlerinde OLMAZ. */
  const ROTA_DIZINLERI = [
    ['src', 'app', '[lang]', 'category', '[categorySlug]'],
    ['src', 'app', '[lang]', 'products'],
    ['src', 'app', '[lang]', 'kategori', '[kok]', '[[...dal]]'],
    ['src', 'app', '[lang]', 'urunler'],
  ] as const

  type Siniflandirma = 'jsx' | 'ithalat' | 'baska'
  interface SuspenseOgesi {
    ad: Siniflandirma
    dugum: ts.Node
  }

  const ayristir = (src: string) =>
    ts.createSourceFile('x.tsx', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

  const jsxEtiketi = (n: ts.Node | undefined): boolean =>
    !!n &&
    (ts.isJsxOpeningElement(n) || ts.isJsxClosingElement(n) || ts.isJsxSelfClosingElement(n))

  /**
   * Kaynaktaki HER `Suspense` anılışı (kimlik ya da `'Suspense'` dizgesi) ve sınıfı:
   *  · jsx     — `<Suspense>` / `<React.Suspense>` etiketi (açılış, kapanış ya da kendi kapanan)
   *  · ithalat — `import { Suspense } from 'react'` (takma adsız)
   *  · baska   — her şey: `Suspense as X`, `const S = React.Suspense`, `createElement(React.Suspense)`,
   *              `{ Suspense: S } = React`, `React['Suspense']`, dışa aktarım…
   * YORUM düğümü üretmez: açıklama metni kapıyı tetiklemez (AST, regex değil).
   */
  function suspenseOgeleri(src: string): SuspenseOgesi[] {
    const bulunan: SuspenseOgesi[] = []
    const gez = (n: ts.Node): void => {
      // Dizge yalnız ERİŞİM yerinde sayılır (`React['Suspense']`, `{ 'Suspense': S }`); sınıf adı ya da
      // metin içindeki "Suspense" kapıyı tetiklemez.
      const dizgeErisimi =
        ts.isStringLiteralLike(n) &&
        (ts.isElementAccessExpression(n.parent) ||
          ts.isBindingElement(n.parent) ||
          ts.isPropertyAssignment(n.parent) ||
          ts.isImportSpecifier(n.parent) ||
          ts.isExportSpecifier(n.parent))
      const metin = ts.isIdentifier(n) || ts.isStringLiteralLike(n) ? n.text : undefined
      const adMi = metin === 'Suspense' && (ts.isIdentifier(n) || dizgeErisimi)
      if (adMi) {
        const p = n.parent
        const pp = p?.parent
        if (jsxEtiketi(p) && (p as ts.JsxOpeningElement).tagName === n) {
          bulunan.push({ ad: 'jsx', dugum: n })
        } else if (
          ts.isPropertyAccessExpression(p) &&
          p.name === n &&
          jsxEtiketi(pp) &&
          (pp as ts.JsxOpeningElement).tagName === p
        ) {
          bulunan.push({ ad: 'jsx', dugum: n })
        } else if (ts.isImportSpecifier(p) && p.name === n && !p.propertyName) {
          bulunan.push({ ad: 'ithalat', dugum: n })
        } else {
          bulunan.push({ ad: 'baska', dugum: n })
        }
      }
      ts.forEachChild(n, gez)
    }
    gez(ayristir(src))
    return bulunan
  }

  /** Suspense etiketi taşıyan JSX elemanları (kendi kapanan dahil). */
  function suspenseElemanlari(src: string): Array<ts.JsxElement | ts.JsxSelfClosingElement> {
    const liste: Array<ts.JsxElement | ts.JsxSelfClosingElement> = []
    const adi = (e: ts.JsxTagNameExpression): string => e.getText()
    const gez = (n: ts.Node): void => {
      if (ts.isJsxElement(n) && /^(React\.)?Suspense$/.test(adi(n.openingElement.tagName))) liste.push(n)
      if (ts.isJsxSelfClosingElement(n) && /^(React\.)?Suspense$/.test(adi(n.tagName))) liste.push(n)
      ts.forEachChild(n, gez)
    }
    gez(ayristir(src))
    return liste
  }

  /** Bir elemanın "anlamlı" çocukları: boşluk metni ve boş `{/* yorum *\/}` ifadeleri atılır. */
  function anlamliCocuklar(e: ts.JsxElement): string[] {
    return e.children
      .filter((c) => !(ts.isJsxText(c) && c.containsOnlyTriviaWhiteSpaces))
      .filter((c) => !(ts.isJsxExpression(c) && !c.expression))
      .map((c) => {
        if (ts.isJsxElement(c)) return c.openingElement.tagName.getText()
        if (ts.isJsxSelfClosingElement(c)) return c.tagName.getText()
        if (ts.isJsxFragment(c)) return '<>'
        if (ts.isJsxExpression(c)) return `{${c.expression?.getText() ?? ''}}`
        return 'metin'
      })
  }

  /** Çekirdeklerde Suspense'e dair HİÇBİR iz olmamalı: ihlal listesi (boş = temiz). */
  function cekirdekIhlalleri(src: string): string[] {
    return suspenseOgeleri(src).map(
      (o) => `Suspense anılışı (${o.ad}): "${o.dugum.parent.getText().slice(0, 60)}"`,
    )
  }

  /** CategoryMasterView: Suspense TAM BİR tane, iç içe değil, çocuğu YALNIZ <Pagination …/>. */
  function masterIhlalleri(src: string): string[] {
    const ih: string[] = []
    const ogeler = suspenseOgeleri(src)
    const baska = ogeler.filter((o) => o.ad === 'baska')
    if (baska.length) ih.push(`takma ad / createElement / yapı bozma kullanımı: ${baska.length} adet`)
    const elemanlar = suspenseElemanlari(src)
    if (elemanlar.length !== 1) {
      ih.push(`Suspense elemanı ${elemanlar.length} adet (tam 1 olmalı: Pagination yaprağı)`)
    }
    for (const e of elemanlar) {
      if (ts.isJsxSelfClosingElement(e)) {
        ih.push('çocuksuz Suspense')
        continue
      }
      const c = anlamliCocuklar(e)
      if (c.length !== 1 || c[0] !== 'Pagination') {
        ih.push(`Suspense çocukları [${c.join(', ')}] — yalnız [Pagination] olmalı`)
      }
      // İç içe: bu elemanın altında başka bir Suspense etiketi var mı
      const ic = elemanlar.filter((x) => x !== e && x.pos >= e.pos && x.end <= e.end)
      if (ic.length) ih.push('iç içe Suspense')
    }
    return ih
  }

  /** `loading.*` bu rota dizininde ya da `src/app`'e kadar HERHANGİ bir üst dizinde var mı. */
  function loadingDosyalari(dizin: readonly string[], kok: string = KOK): string[] {
    const bulunan: string[] = []
    let akim = join(kok, ...dizin)
    const taban = join(kok, 'src', 'app')
    for (;;) {
      for (const ad of ['loading.tsx', 'loading.jsx', 'loading.ts', 'loading.js']) {
        if (existsSync(join(akim, ad))) bulunan.push(join(akim, ad))
      }
      if (akim === taban || dirname(akim) === akim) break
      akim = dirname(akim)
    }
    return bulunan
  }

  it('⭐ASIL İDDİA — çekirdeklerde ve rota dosyalarında Suspense kimliği SIFIR (alias dahil)', () => {
    for (const yol of SUSPENSESIZ) {
      expect(
        cekirdekIhlalleri(oku(...yol)),
        `${yol.join('/')}: Suspense eklenmis (takma ad / createElement dahil). Sardigi govde ham ` +
          'HTML de <div hidden id="S:0"> blogunda kalir (askiya alinirsa YA DA buyukse): JS siz ' +
          'okuyucu h1 i ve listeyi gormez. Sinir yalniz useSearchParams okuyan uc bilesende olmali.',
      ).toEqual([])
    }
  })

  it('⭐CategoryMasterView — Suspense TAM BİR tane ve YALNIZ <Pagination/> sarar', () => {
    expect(
      masterIhlalleri(oku(...MASTER)),
      'CategoryMasterView Suspense duzeni bozulmus: Pagination (useSearchParams) disinda bir seyi ' +
        'saran / ic ice / takma adli Suspense, govdeyi ham HTML de gizli akis blogu na iter (URN-25).',
    ).toEqual([])
  })

  it('⭐ÖRTÜK SINIR YOK — rota dizinlerinde ve üstlerinde loading.tsx bulunmaz', () => {
    for (const dizin of ROTA_DIZINLERI) {
      expect(
        loadingDosyalari(dizin),
        `${dizin.join('/')}: loading.* var. loading.tsx sayfayi ORTUK bir Suspense ile sarar; ` +
          'govde yine hidden akis blogu na gider (sinirin yazili olmasi gerekmez).',
      ).toEqual([])
    }
  })

  it('AYIRT EDİCİ — çürütücünün 5 sabote örneği + sağlam örnek (çözücü gerçekten ayırt eder)', () => {
    const iceIce =
      "import React from 'react'\nexport const A = () => (<React.Suspense fallback={null}>" +
      '<React.Suspense fallback={null}><Pagination /></React.Suspense>{view}</React.Suspense>)'
    const pagYaninda =
      "import React from 'react'\nexport const A = () => (<React.Suspense fallback={null}>" +
      '<Pagination /><Foo />{view}</React.Suspense>)'
    const takmaAd =
      "import { Suspense as X } from 'react'\nexport const A = () => (<X fallback={null}><Pagination /></X>)"
    const sabitAtama =
      "import React from 'react'\nconst S = React.Suspense\nexport const A = () => (<S><Pagination /></S>)"
    const createEl =
      "import React from 'react'\nexport const A = () => React.createElement(React.Suspense, null, view)"
    const saglam =
      "import React from 'react'\nexport const A = () => (<div>{/* <React.Suspense> yok */}\n" +
      '<React.Suspense fallback={<div />}>\n  <Pagination page={1} />\n</React.Suspense></div>)'

    // Master çözücüsü: 5 sabote de KIRMIZI, sağlam YEŞİL
    for (const [ad, src] of [
      ['iç içe', iceIce],
      ['Pagination + başka çocuk', pagYaninda],
      ['import { Suspense as X }', takmaAd],
      ['const S = React.Suspense', sabitAtama],
      ['React.createElement(React.Suspense…)', createEl],
    ] as const) {
      expect(masterIhlalleri(src).length, `master çözücü "${ad}" sabotajını KAÇIRDI`).toBeGreaterThan(0)
    }
    expect(masterIhlalleri(saglam), 'sağlam örnek kırmızı verdi (sahte kırmızı)').toEqual([])

    // Çekirdek çözücüsü: Pagination'lı sağlam örnek bile çekirdekte İHLALDİR; 5 sabote de kırmızı
    for (const [ad, src] of [
      ['kök sarmalı', "import React from 'react'\nexport const A = () => (<React.Suspense fallback={null}><P /></React.Suspense>)"],
      ['Suspense as X', takmaAd],
      ['const S = React.Suspense', sabitAtama],
      ['createElement', createEl],
      ['named import', "import { Suspense } from 'react'\nexport const A = () => <Suspense><P /></Suspense>"],
    ] as const) {
      expect(cekirdekIhlalleri(src).length, `çekirdek çözücü "${ad}" sabotajını KAÇIRDI`).toBeGreaterThan(0)
    }
    expect(
      cekirdekIhlalleri("export const A = () => <div>{/* <React.Suspense> bilincli yok */}</div>"),
      'yorumdaki Suspense kapıyı tetikledi',
    ).toEqual([])
    expect(
      cekirdekIhlalleri("// Suspense yok\nexport const A = () => <div className=\"Suspense\" />"),
      'sınıf adı / yorum kapıyı tetikledi',
    ).toEqual([])
  })

  it('AYIRT EDİCİ — loading.tsx denetçisi rota dizininde de, ÜST dizinde de bulur', () => {
    const gecici = mkdtempSync(join(tmpdir(), 'urn25-loading-'))
    try {
      const rota = join(gecici, 'src', 'app', '[lang]', 'products')
      mkdirSync(rota, { recursive: true })
      const dizin = ['src', 'app', '[lang]', 'products'] as const
      expect(loadingDosyalari(dizin, gecici), 'boş ağaçta yanlış pozitif').toEqual([])
      writeFileSync(join(rota, 'loading.tsx'), 'export default () => null')
      expect(loadingDosyalari(dizin, gecici).length, 'rota dizinindeki loading.tsx kaçtı').toBe(1)
      rmSync(join(rota, 'loading.tsx'))
      writeFileSync(join(gecici, 'src', 'app', 'loading.tsx'), 'export default () => null')
      expect(loadingDosyalari(dizin, gecici).length, 'üst dizindeki (src/app) loading.tsx kaçtı').toBe(1)
    } finally {
      rmSync(gecici, { recursive: true, force: true })
    }
  })

  it('BOŞLUK MUHAFIZI — dosyalar gerçekten okunuyor (INV-SSR-GOVDE-2)', () => {
    for (const yol of SUSPENSESIZ) {
      expect(govde(oku(...yol)).length, `${yol.join('/')} bos okundu.`).toBeGreaterThan(200)
    }
    const m = oku(...MASTER)
    expect(govde(m).length, 'CategoryMasterView bos okundu.').toBeGreaterThan(2000)
    expect(suspenseElemanlari(m).length, 'Pagination Suspense i kaybolmus — kapinin anlami kalmadi.').toBe(1)
    expect(govde(m).includes('<Pagination'), 'Pagination dusmus.').toBe(true)
  })
})
