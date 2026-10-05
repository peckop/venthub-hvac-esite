/**
 * INV-METADATA-TEK-YAZICI-1 — bir rotanın metadata'sını YALNIZ BİR katman yazar.
 *
 * NİÇİN VAR (ölçülmüş canlı olay, REC-150 / 2026-09-05): hesaplayıcı sayfaları **iki**
 * `<title>` ve **iki** `<meta name="description">` yayınlıyordu — biri istemci `Seo`
 * bileşeninden, diğeri App Router metadata katmanından. Hangisinin kazandığı ORTAMA göre
 * değişiyordu: canlıda `Seo`'nunki, önizlemede kabuğunki. Yani sekme ve arama sonucu
 * başlığı **deterministik değildi** — ve bunu hiçbir kapı görmüyordu, çünkü her iki yazıcı
 * da tek başına doğru çalışıyordu. Kusur, ikisinin AYNI ANDA etkin olmasıydı.
 *
 * ✅KAPSAM (REC-150 Adım 5, 2026-09-24 — bot karnesi 15 adreste çift title ölçtü): dört
 * hesaplayıcı rotası da metadata'sını RSC `generateMetadata` + ortak `sayfaUstVerisi`
 * yardımcısıyla yazar; `CalculatorLayout`'tan `<Seo>` ve pilotun geçici `metadataRotadanMi`
 * bayrağı SİLİNDİ. Pilot dönemin "yalnız kanal" kolları bu yüzden kalktı; yerine dördünü
 * birden ölçen kollar geldi. Vitrinde `Seo`'yu içe aktaran yerler aşağıdaki RATCHET listesine
 * bağlandı — liste yalnız KISALABİLİR (bilgi merkezinin iki görünümü karar 92 taşımasıyla gider).
 *
 * ⚠SINIR, GİZLENMİYOR: burası STATİK bir kapıdır. "Servis edilen HTML'de kaç `<title>`
 * var" sorusunu ÖLÇEMEZ; ölçtüğü şey İKİ YAZICININ AYNI ANDA ETKİN OLMAMASIDIR. Sayının
 * kendisi çalışma-zamanı kapısının işidir (REC-150 Adım 3, `tests/smoke/` ağacı — başka
 * şeridin alanı, dokunulmadı).
 *
 * Kardeş kapı: INV-SSR-GOVDE-1 (`storefront-ssr-govde.test.ts`) — o, sayfanın sunucuda
 * render edilmeye devam ettiğini ölçer. İkisi birlikte anlamlı: metadata'yı tek yazıcıya
 * indirmek, sayfa hiç render edilmiyorsa bir şey ifade etmez.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = process.cwd()
const oku = (...p: string[]) => readFileSync(join(KOK, ...p), 'utf8')
/** Yorum ANLATIR, kural UYGULAR — ölçüt daima gövdede koşar. */
const govde = (k: string) => k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

const LAYOUT = ['src', 'components', 'calculators', 'CalculatorLayout.tsx'] as const
const YARDIMCI = ['src', 'lib', 'seo', 'sayfaUstVerisi.ts'] as const

/** Dört hesaplayıcının rota↔görünüm çiftleri. */
const CIFTLER = [
  {
    ad: 'kanal',
    rota: ['src', 'app', '[lang]', 'destek', 'hesaplayicilar', 'kanal', 'page.tsx'],
    gorunum: ['src', 'views', 'calculators', 'DuctCalcPage.tsx'],
  },
  {
    ad: 'jet-fan',
    rota: ['src', 'app', '[lang]', 'destek', 'hesaplayicilar', 'jet-fan', 'page.tsx'],
    gorunum: ['src', 'views', 'calculators', 'JetFanCalcPage.tsx'],
  },
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

/**
 * RATCHET — `components/Seo`'yu hâlâ içe aktaran vitrin dosyaları. Yalnız KISALIR:
 * yeni bir içe aktaran R1'i, listeden düşmüş ama hâlâ adı yazılı bir dosya R2'yi kırar.
 * Bugünkü iki dosya bilgi merkezi görünümüdür; karar 92 taşıması (PR-2) onları kaldırır.
 */
const SEO_TABANI = ['src/views/knowledge/HubPage.tsx', 'src/views/knowledge/TopicPage.tsx']

/** `'use client'` yönergesi — yorumda değil, GÖVDEDE, dosyanın başında. */
const istemciMi = (kaynak: string) => /^\s*['"]use client['"]/.test(govde(kaynak))

function tsDosyalari(dizin: string): string[] {
  const cikti: string[] = []
  for (const ad of readdirSync(dizin)) {
    const yol = join(dizin, ad)
    if (statSync(yol).isDirectory()) {
      if (ad === '__tests__' || ad === 'node_modules') continue
      cikti.push(...tsDosyalari(yol))
    } else if (/\.tsx?$/.test(ad) && !/\.test\.tsx?$/.test(ad)) {
      cikti.push(yol)
    }
  }
  return cikti
}

/** Gövdede `components/Seo` içe aktarımı (yorumdaki anılma sayılmaz). */
const SEO_ICE_AKTARIM = /import\s+\w+\s+from\s+['"][^'"]*components\/Seo['"]/

describe('INV-METADATA-TEK-YAZICI-1 · rotanın metadatasını tek katman yazar', () => {
  it('⭐DÖRT ROTA metadatasını KENDİ üretir, ortak yardımcıyla ve Server Component olarak', () => {
    for (const { ad, rota } of CIFTLER) {
      const g = govde(oku(...rota))
      expect(
        /export\s+async\s+function\s+generateMetadata/.test(g),
        `${ad} rotasi generateMetadata TANIMLAMIYOR — tek yazici RSC tarafi olmali.`,
      ).toBe(true)
      expect(
        /sayfaUstVerisi\s*\(/.test(g),
        `${ad} rotasi sayfaUstVerisi kullanmiyor — canonical/hreflang/robots elle yazilirsa ` +
          'her kopya kendi basina bayatlar (bot karnesi 28 adreste yanlis hreflang olctu).',
      ).toBe(true)
      expect(
        istemciMi(oku(...rota)),
        `${ad} rotasi 'use client' tasiyor. Next.js boyle bir dosyadan generateMetadata ` +
          'export edilmesine IZIN VERMEZ; ayrica CLAUDE.md kural 4 page.tsx in Server ' +
          'Component olmasini sart kosar.',
      ).toBe(false)
    }
  })

  it('⭐İKİNCİ YAZICI YAPISAL OLARAK YOK — layout ve görünümler Seo basmaz, bayrak geri gelmez', () => {
    const gLayout = govde(oku(...LAYOUT))
    expect(SEO_ICE_AKTARIM.test(gLayout), 'CalculatorLayout Seo yu yeniden iceri aktariyor.').toBe(false)
    expect(/<Seo\b/.test(gLayout), 'CalculatorLayout <Seo> basiyor — ikinci yazici geri geldi.').toBe(false)
    expect(
      /metadataRotadanMi/.test(gLayout),
      'metadataRotadanMi bayragi geri gelmis. Dort rota da goc etti; bayrak "bazen iki yazici" ' +
        'durumunu yeniden mumkun kilar.',
    ).toBe(false)
    for (const { ad, gorunum } of CIFTLER) {
      const g = govde(oku(...gorunum))
      expect(/<Seo\b/.test(g) || SEO_ICE_AKTARIM.test(g), `${ad} gorunumu Seo basiyor.`).toBe(false)
      expect(/metadataRotadanMi/.test(g), `${ad} gorunumu emekli bayragi tasiyor.`).toBe(false)
    }
  })

  it('⭐ADRESLER SSOTTAN — elle birleştirme yok (INV-CANONICAL-1 / kural 7)', () => {
    const g = govde(oku(...YARDIMCI))
    expect(g.includes('SITE_URL'), 'Kanonik taban SITE_URL den gelmiyor.').toBe(true)
    expect(g.includes('localizedHref'), 'Dil oneki localizedHref ile eklenmiyor.').toBe(true)
    expect(
      /languages\s*:/.test(g),
      'canonical yaziliyor ama hreflang languages YOK — INV-CANONICAL-2 bunu ister ve ' +
        'iki dil birbirine baglanmaz.',
    ).toBe(true)
    for (const { ad, rota } of [...CIFTLER.map(c => ({ ad: c.ad, rota: c.rota })), { ad: 'yardimci', rota: YARDIMCI }]) {
      expect(
        /\$\{SITE_URL\}\/(tr|en)/.test(govde(oku(...rota))),
        `${ad}: dil oneki ELLE birlestirilmis. Kural 7 bunu yasaklar; onek localizedHref ten gelir.`,
      ).toBe(false)
    }
  })

  it('⭐⭐GÖRÜNÜM SINIRI KENDİ taşır — rota sunucuda, görünüm istemcide', () => {
    // NICIN (CI de olculdu, 2026-09-05): istemci sinirini ROTALAR ilan ediyordu; gorunumler
    // rotadan MIRAS aliyordu. Rota metadata icin sunucuya cevrilince miras kesildi ve
    // `next build` "useState yalniz Client Component te calisir" diye patladi. tsc/lint/vitest
    // bunu GORMEZ. Dort rota da sunucuda oldugundan yuk dort gorunumdedir.
    for (const { ad, gorunum } of CIFTLER) {
      expect(
        istemciMi(oku(...gorunum)),
        `${ad}: gorunum 'use client' ILAN ETMIYOR — rota sunucuda, sinir yeniden ilan edilmedi.`,
      ).toBe(true)
    }
  })

  it('⭐RATCHET — vitrinde Seo yu içe aktaran dosya tabandan fazla olamaz, taban bayatlayamaz', () => {
    const kok = join(KOK, 'src')
    const iceAktaranlar = tsDosyalari(kok)
      .filter(yol => !yol.split(sep).includes('admin'))
      .filter(yol => SEO_ICE_AKTARIM.test(govde(readFileSync(yol, 'utf8'))))
      .map(yol => relative(KOK, yol).split(sep).join('/'))
      .sort()
    const yeni = iceAktaranlar.filter(y => !SEO_TABANI.includes(y))
    expect(yeni, 'R1: tabanda olmayan yeni bir Seo kullanicisi — metadata yi rotada sayfaUstVerisi ile yaz.').toEqual([])
    const bayat = SEO_TABANI.filter(y => !iceAktaranlar.includes(y))
    expect(bayat, 'R2: bu dosya artik Seo kullanmiyor — SEO_TABANI ndan cikar (liste yalniz kisalir).').toEqual([])
  })

  it('BOŞLUK MUHAFIZI — dosyalar gerçekten okunuyor', () => {
    expect(govde(oku(...LAYOUT)).length, 'layout bos okundu.').toBeGreaterThan(500)
    expect(govde(oku(...YARDIMCI)).length, 'yardimci bos okundu.').toBeGreaterThan(300)
    for (const { ad, rota, gorunum } of CIFTLER) {
      expect(govde(oku(...rota)).length, `${ad} rotasi bos okundu.`).toBeGreaterThan(200)
      expect(govde(oku(...gorunum)).length, `${ad} gorunumu bos okundu.`).toBeGreaterThan(2000)
    }
  })
})
