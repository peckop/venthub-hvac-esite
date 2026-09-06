/**
 * INV-HEADER-URUN-SECICI-1 — header "Ürün Seçici" öğesi bayrağın ARKASINDA duruyor,
 * etiketi sözlükten ve adresi `Routes`'tan geliyor.
 *
 * NİÇİN VAR (K24):
 * `/urun-secici` sayfası canlıda duruyor ama üst gezinmede girişi yoktu. Girişi
 * eklerken sessizce bozulabilecek dört şey var:
 *  1. Bayrak kontrolü düşerse ya da öğe kontrolün ÜSTÜNE kayarsa, yarım kabuk
 *     canlıya sızar — bu PR'ın tek vaadi "vitrinde hiçbir şey değişmiyor" idi.
 *  2. Etiket JSX'e gömülürse EN ziyaretçi Türkçe bir menü öğesi görür (kural 7).
 *  3. Adres elle `/tr/...` diye kurulursa dil değiştiğinde bağlantı yanlış dile
 *     gider ve kimse fark etmez (kural 7, `useLocalizedRoutes` SSOT'u).
 *  4. Bayrak kapalıyken rayın bugünkü iki öğesi bozulursa görünüm DEĞİŞİR.
 *
 * ⭐NİÇİN KAYNAK TESTİ: bayrak DERLEME-ZAMANI sabiti (`src/config/features.ts`).
 * jsdom'da "öğe çizilmedi" görmek AYIRT ETMEZ — bileşen başka sebeple de boş
 * çizebilir, ayrıca açık hâli hiç ölçülemez. Ölçülen şey, kaynaktaki KOŞUL SIRASI.
 * Kardeş kapı `header-teklif-paneli.test.ts` aynı gerekçeyle kaynak testidir.
 *
 * ⛔SINIR — NE ÖLÇMEZ (gizlenmiyor):
 *  · Bayrak AÇIKKEN öğenin okunabilir/erişilebilir çizildiğini (düzen, kontrast,
 *    dokunma hedefi) — jsdom düzen hesaplamaz; o bir GÖZ işidir.
 *  · Mobil kırılımda aynı işin iki yerde görünüp görünmediğinin SEMANTİK yanını;
 *    kapı yalnız `lg` sınıf kuralının yerinde durduğunu görür.
 *  · Sözlük metninin doğru/iyi Türkçe-İngilizce olduğunu; yalnız anahtarın iki
 *    sözlükte de var olduğunu.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { YENI_KABUK_GEZINMESI } from '@/config/features'
import { NAVIGATION_PRIMARY_ITEMS } from '@/utils/navigationConfig'

const KOK = process.cwd()
const oku = (...p: string[]) => readFileSync(join(KOK, ...p), 'utf8')

const BAYRAK = 'YENI_KABUK_GEZINMESI'
const ANAHTAR = 'urunSecici.ustBaslik'

const HEADER = oku('src', 'components', 'StickyHeader.tsx')
const RAY = oku('src', 'components', 'navigation', 'NavPrimaryRail.tsx')
const FEATURES = oku('src', 'config', 'features.ts')
const ROTALAR = oku('src', 'utils', 'routes.ts')
const TR = oku('src', 'i18n', 'dictionaries', 'tr.ts')
const EN = oku('src', 'i18n', 'dictionaries', 'en.ts')

/** Yorumları at — bir kuralın yalnız yorumda anılması onu UYGULAMAZ. */
const govde = (k: string) => k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

const HEADER_GOVDE = govde(HEADER)
const RAY_GOVDE = govde(RAY)

/**
 * Ölçüm penceresi: yalnız `primaryItems` memo'su. Dosyanın tamamında aramak
 * AYIRT ETMEZDİ — `Routes.urunSecici()` başka bir yerde de geçebilir ve kapı
 * yanlış yerde duran bir öğeyi yeşil sayardı.
 */
const memoBas = HEADER_GOVDE.indexOf('const primaryItems')
const memoSon = HEADER_GOVDE.indexOf('const secondaryItems')
const MEMO = memoBas > -1 && memoSon > memoBas ? HEADER_GOVDE.slice(memoBas, memoSon) : ''

describe('INV-HEADER-URUN-SECICI-1 — header Ürün Seçici öğesi', () => {
  it('ölçüm penceresi bulunabildi (kapı kendi zeminini doğrular)', () => {
    expect(
      MEMO.length,
      'StickyHeader icinde `const primaryItems` ... `const secondaryItems` penceresi ' +
        'bulunamadi. Kapi bos bir metinde arama yapiyor olurdu — SAHTE YESIL.',
    ).toBeGreaterThan(0)
  })

  it('bayrak features.ts içinde ve KAPALI doğuyor', () => {
    expect(
      new RegExp(`export const ${BAYRAK}\\s*=\\s*false`).test(FEATURES),
      `${BAYRAK} "false" olarak tanimli DEGIL — oge canliya sizar.`,
    ).toBe(true)
  })

  it('⭐öğe bayrağın erken dönüşünden SONRA ekleniyor — sıra ölçülüyor', () => {
    const kapi = MEMO.search(new RegExp(`if\\s*\\(\\s*!${BAYRAK}\\s*\\)\\s*return`))
    expect(
      kapi,
      `Memo icinde "if (!${BAYRAK}) return ..." erken donusu YOK. Bayrak kalkarsa ` +
        'oge kapali surumde de cizilir.',
    ).toBeGreaterThan(-1)

    const oge = MEMO.indexOf('Routes.urunSecici()')
    expect(oge, 'Memo icinde Routes.urunSecici() YOK — oge hic eklenmiyor.').toBeGreaterThan(-1)

    expect(
      oge > kapi,
      'Oge bayrak kontrolunun USTUNDE ekleniyor. Bu tam olarak sessiz sizinti bicimidir: ' +
        'kod "bayragi kullaniyor" gibi gorunur ama oge her halukarda cizilir.',
    ).toBe(true)
  })

  it('⭐bayrak kapalıyken ray BUGÜNKÜ hâlinde — erken dönüş temel listeyi verir', () => {
    // Erken donus, uzerine hicbir sey eklenmemis TEMEL listeyi dondurmeli.
    expect(
      new RegExp(`if\\s*\\(\\s*!${BAYRAK}\\s*\\)\\s*return\\s+temel`).test(MEMO),
      'Erken donus `temel` disinda bir sey donduruyor — bayrak kapaliyken vitrin degisir.',
    ).toBe(true)
    // CALISMA-ZAMANI olcumu: gercek moduller yuklendi. Bayrak false ve ray yapilandirmasi
    // iki ogeli oldugu surece, bayrak kapali surumun ciktisi bu iki ogedir — fazlasi degil.
    expect(YENI_KABUK_GEZINMESI, 'Bayrak calisma zamaninda false DEGIL.').toBe(false)
    expect(
      NAVIGATION_PRIMARY_ITEMS.map((i) => i.id),
      'Ana ray yapilandirmasi degismis — bu PR yapilandirmaya DOKUNMAMALIYDI.',
    ).toEqual(['categories', 'products'])
  })

  it('⭐etiket SÖZLÜKTEN geliyor — sabit metin yok', () => {
    expect(MEMO.includes(`t('${ANAHTAR}')`), `Etiket t('${ANAHTAR}') ile alinmiyor.`).toBe(true)
    // Ayirt edici TERS olcum: ham metin gomulu mu? Gomulu olsa yukaridaki arm yine
    // yesil kalabilirdi (ikisi bir arada da yazilabilir) — bu yuzden ayri sorulur.
    for (const ham of ['Ürün Seçici', 'Urun Secici', 'Product Selector']) {
      expect(
        HEADER_GOVDE.includes(ham),
        `Header govdesinde ham "${ham}" metni var — sozluk atlanmis (kural 7).`,
      ).toBe(false)
    }
  })

  it('⭐adres Routes ÜZERİNDEN — elle dil öneki yok', () => {
    expect(
      /const Routes = useLocalizedRoutes\(\)/.test(HEADER_GOVDE),
      'Header useLocalizedRoutes() kullanmiyor — adres dil onekini kaybeder.',
    ).toBe(true)
    // Elle kurulmus adresin her bicimi: ham dizge, '/tr/...', '/en/...', sablon.
    const elleBicimleri = [
      "'/urun-secici'",
      '"/urun-secici"',
      '/tr/urun-secici',
      '/en/urun-secici',
      '${lang}/urun-secici',
    ]
    for (const elle of elleBicimleri) {
      expect(
        MEMO.includes(elle),
        `Memo icinde elle kurulmus adres var: ${elle}. Adres SSOT'u Routes.urunSecici() ` +
          '(kural 7); elle birlestirilen yol dil degisince yanlis dile gider.',
      ).toBe(false)
    }
    expect(
      /urunSecici:\s*\(\)\s*=>\s*'\/urun-secici'/.test(ROTALAR),
      'Routes.urunSecici() tanimi kaybolmus — kapinin dayandigi SSOT yok.',
    ).toBe(true)
  })

  it('sözlük anahtarı TR ve EN dosyalarında birlikte var', () => {
    for (const [ad, sozluk] of [['tr', TR], ['en', EN]] as const) {
      const bolum = sozluk.indexOf('urunSecici: {')
      expect(bolum, `${ad}.ts icinde urunSecici bolumu YOK.`).toBeGreaterThan(-1)
      expect(
        /\n\s{4}ustBaslik:/.test(sozluk.slice(bolum, bolum + 400)),
        `${ad}.ts urunSecici altinda "ustBaslik" YOK — bir dilde etiket bos kalir.`,
      ).toBe(true)
    }
  })

  it('⚠KAPSAM yerinde: öğenin durduğu ray masaüstü kuralı (lg altında gizli)', () => {
    // Bu arm bir vaat degil bir SINIR kaydidir: raporda "mobilde gorunmuyor" derken
    // dayandigimiz sey burasi. Kural kayarsa (or. `lg:flex` -> `flex`) oge mobilde
    // de cikar ve alt sekme cubuguyla ayni isi iki yerde sunar.
    expect(
      /hidden[^"']*lg:flex/.test(RAY_GOVDE),
      'NavPrimaryRail artik `lg` altinda gizli DEGIL — Urun Secici ogesi mobilde de cikar.',
    ).toBe(true)
  })
})
