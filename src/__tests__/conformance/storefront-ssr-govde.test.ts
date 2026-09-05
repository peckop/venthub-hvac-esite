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
