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
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

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
 * NİÇİN VAR (ölçülmüş, 2026-10-03, `next build` çıktısı `.next/server/app/tr/...html`):
 *
 *   | sayfa              | görünür kelime | gizli blokta | h1 yeri        |
 *   |--------------------|----------------|--------------|----------------|
 *   | tr/category/fanlar | 94             | 719          | `S:0` İÇİNDE   |
 *   | tr/products        | 99             | 1015         | `S:0` İÇİNDE   |
 *   | en/products        | 93             | 1165         | `S:0` İÇİNDE   |
 *
 * SEBEP, adıyla: `CategoryMasterView` görünümleri `next/dynamic` ile yükler; o sunucuda
 * `React.lazy` gibi ASKIYA ALIR. Askıya alınan içeriği saran Suspense sınırı akışta önce
 * yalnız fallback (spinner) yazar, içerik sonradan `<div hidden id="S:0">` bloğuna gelir.
 * JS çalıştırmayan okuyucu gövdeyi görmez. Sınır İKİ yerdeydi: rota çekirdeğinde (kök) ve
 * `CategoryMasterView` içinde; ÖLÇÜLDÜ: yalnız kökü kaldırmak YETMEDİ (iç sınır aynı bloğu
 * üretti), ikisi birden kalkınca blok 0 oldu. Görünüm importunu statiğe çevirmek de bloğu
 * sıfırladı ama ilk yük JS'ini 324 → 410 kB çıkardı; o yüzden `dynamic()` KALDI, sınırlar gitti.
 *
 * ⚠KURAL 5 LAFZEN SAĞLANIYORDU ("Suspense var"); yanlış YERDEYDİ (bkz. INV-SSR-GOVDE-1).
 *
 * ⭐BU KAPININ SINIRI: kaynak okur, derleme çıktısını DEĞİL. "Gövde hidden dışında" iddiasının
 * kendisi yalnız `next build` sonrası ham HTML'de ölçülür (S bloğu sayısı 0, h1 hidden dışı).
 * Burada ölçülen, bloğu üreten YAPININ geri gelmemesidir.
 */
describe('INV-SSR-GOVDE-2 · kategori ve /products Suspense sınırı içeriği sarmaz', () => {
  const CEKIRDEKLER = [
    ['src', 'app', '_components', 'kategoriSayfasi.tsx'],
    ['src', 'app', '_components', 'urunlerSayfasi.tsx'],
  ] as const
  const MASTER = ['src', 'views', 'CategoryMasterView.tsx'] as const

  /** `<Suspense …>…</Suspense>` bloklarının GÖVDELERİ (iç içe sınır yok varsayımı, K4 ölçer). */
  const suspenseBloklari = (g: string): string[] =>
    g.match(/<(?:React\.)?Suspense\b[\s\S]*?<\/(?:React\.)?Suspense>/g) ?? []

  /** İhlal listesi: Pagination dışında bir şeyi saran Suspense ya da çekirdekte herhangi bir Suspense. */
  const masterIhlalleri = (g: string): string[] =>
    suspenseBloklari(g).filter((b) => !/<Pagination\b/.test(b) || /renderView|ProductsDiscoveryView|<Category\w+View/.test(b))

  it('⭐ASIL İDDİA — rota çekirdekleri (kategoriSayfasi, urunlerSayfasi) Suspense İÇERMEZ', () => {
    for (const yol of CEKIRDEKLER) {
      const g = govde(oku(...yol))
      expect(
        /<(?:React\.)?Suspense\b/.test(g),
        `${yol.join('/')}: sayfa cekirdegine Suspense eklenmis. Icerik askiya alinirsa (dynamic ` +
          'gorunumler) tum govde ham HTML de <div hidden id="S:0"> blogunda kalir; JS siz ' +
          'okuyucu h1 i ve listeyi gormez (olculdu: gorunur 94 kelime, gizli 719). Sinir ' +
          'yalniz useSearchParams okuyan uc bilesende olmali.',
      ).toBe(false)
    }
  })

  it('⭐CategoryMasterView — Suspense YALNIZ Pagination yaprağını sarar', () => {
    const g = govde(oku(...MASTER))
    expect(
      masterIhlalleri(g),
      'CategoryMasterView icinde Pagination disinda bir seyi saran Suspense var (gorunum ya ' +
        'da ProductsDiscoveryView). dynamic() gorunumleri askiya alir; saran sinir icerigi ham ' +
        'HTML de gizli akis blogu na iter (URN-25 olcumu).',
    ).toEqual([])
    expect(
      suspenseBloklari(g).length,
      'Pagination (useSearchParams) Suspense siz kalmis — Next build hatasi / CSR bailout.',
    ).toBeGreaterThanOrEqual(1)
  })

  it('AYIRT EDİCİ — çözücü kusurlu kalıbı GERÇEKTEN yakalıyor (sabote örnekler)', () => {
    const kokSinir = '<React.Suspense fallback={<Y/>}><PageComponent a={1}/></React.Suspense>'
    expect(/<(?:React\.)?Suspense\b/.test(govde(kokSinir))).toBe(true)

    const icSinir =
      '<React.Suspense fallback={null}>{renderView()}{etkinMod !== "showcase" && pagination}</React.Suspense>'
    expect(masterIhlalleri(icSinir).length).toBe(1)

    const discoverySinir =
      '<Suspense fallback={null}><ProductsDiscoveryView a={1}/>{pagination}</Suspense>'
    expect(masterIhlalleri(discoverySinir).length).toBe(1)

    const saglam = '<React.Suspense fallback={<div/>}><Pagination page={page} total={total}/></React.Suspense>'
    expect(masterIhlalleri(saglam)).toEqual([])

    // Yorum içindeki Suspense kapıyı tetiklemez (govde yorumu atar).
    expect(/<(?:React\.)?Suspense\b/.test(govde('{/* <React.Suspense> bilincli yok */}'))).toBe(false)
  })

  it('BOŞLUK MUHAFIZI — dosyalar gerçekten okunuyor (INV-SSR-GOVDE-2)', () => {
    for (const yol of CEKIRDEKLER) {
      expect(govde(oku(...yol)).length, `${yol.join('/')} bos okundu.`).toBeGreaterThan(2000)
    }
    expect(govde(oku(...MASTER)).length, 'CategoryMasterView bos okundu.').toBeGreaterThan(2000)
    expect(
      govde(oku(...MASTER)).includes('<Pagination'),
      'Pagination CategoryMasterView den dusmus — Suspense kolunun anlami kalmadi.',
    ).toBe(true)
  })
})
