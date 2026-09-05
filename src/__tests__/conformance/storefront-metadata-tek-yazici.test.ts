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
 * ⏳KAPSAM BUGÜN TEK ROTA (`kanal`) — pilot. `CalculatorLayout` dört rotayı birden
 * çevirdiği için `<Seo>` oradan tümden kaldırılamadı; geçici `metadataRotadanMi` bayrağı
 * pilotun yarıçapını daraltıyor. Dördü de göç edince bayrak SİLİNİR ve bu kapı "hiçbir
 * hesaplayıcı `<Seo>` basmaz" hâline sıkılaştırılır (REC-150 Adım 5).
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
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = process.cwd()
const oku = (...p: string[]) => readFileSync(join(KOK, ...p), 'utf8')
/** Yorum ANLATIR, kural UYGULAR — ölçüt daima gövdede koşar. */
const govde = (k: string) => k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

const KANAL_ROTA = ['src', 'app', '[lang]', 'destek', 'hesaplayicilar', 'kanal', 'page.tsx'] as const
const KANAL_GORUNUM = ['src', 'views', 'calculators', 'DuctCalcPage.tsx'] as const
const LAYOUT = ['src', 'components', 'calculators', 'CalculatorLayout.tsx'] as const

/** Henüz göç ETMEYEN üç hesaplayıcı görünümü — bayrak buralara sızmamalı. */
const GOC_ETMEYENLER = [
  ['src', 'views', 'calculators', 'HRVCalcPage.tsx'],
  ['src', 'views', 'calculators', 'AirCurtainCalcPage.tsx'],
  ['src', 'views', 'calculators', 'JetFanCalcPage.tsx'],
] as const

describe('INV-METADATA-TEK-YAZICI-1 · rotanın metadatasını tek katman yazar', () => {
  it('⭐PİLOT ROTA metadatasını KENDİ üretir ve Server Component', () => {
    const g = govde(oku(...KANAL_ROTA))
    expect(
      /export\s+async\s+function\s+generateMetadata/.test(g),
      'kanal rotasi generateMetadata TANIMLAMIYOR — tek yazici RSC tarafi olmaliydi.',
    ).toBe(true)
    expect(
      /'use client'/.test(g),
      "kanal rotasi 'use client' tasiyor. Next.js boyle bir dosyadan generateMetadata " +
        'export edilmesine IZIN VERMEZ; ayrica CLAUDE.md kural 4 page.tsx in Server ' +
        'Component olmasini sart kosar.',
    ).toBe(false)
  })

  it('⭐İKİNCİ YAZICI SUSTURULDU — layout o rotada Seo basmaz', () => {
    const gGorunum = govde(oku(...KANAL_GORUNUM))
    expect(
      /metadataRotadanMi/.test(gGorunum),
      'kanal gorunumu layout a metadataRotadanMi GECMIYOR — layout ikinci yazici olarak ' +
        'kalir ve sayfa yine iki title basar.',
    ).toBe(true)
    const gLayout = govde(oku(...LAYOUT))
    expect(
      /metadataRotadanMi\s*\?\s*null/.test(gLayout),
      'CalculatorLayout bayragi DIKKATE ALMIYOR — prop var ama Seo yine basiliyor. ' +
        'Bayrak tasimak, bayraga UYMAK degildir.',
    ).toBe(true)
  })

  it('⭐ADRESLER SSOTTAN — elle birleştirme yok (INV-CANONICAL-1 / kural 7)', () => {
    const g = govde(oku(...KANAL_ROTA))
    expect(g.includes('SITE_URL'), 'Kanonik taban SITE_URL den gelmiyor.').toBe(true)
    expect(g.includes('localizedHref'), 'Dil oneki localizedHref ile eklenmiyor.').toBe(true)
    expect(
      /\$\{SITE_URL\}\/(tr|en)/.test(g),
      'Dil oneki ELLE birlestirilmis. Kural 7 bunu yasaklar; onek localizedHref ten gelir.',
    ).toBe(false)
    expect(
      /languages\s*:/.test(g),
      'canonical yaziliyor ama hreflang languages YOK — INV-CANONICAL-2 bunu ister ve ' +
        'iki dil birbirine baglanmaz.',
    ).toBe(true)
  })

  it('⭐AYIRT EDİCİ — göç etmeyen üç rota bayrağı AÇMAMIŞ olmalı', () => {
    // Pilotun YARIÇAPI olculur. Bayrak yanlislikla yayilirsa uc rota Seo suz kalir ve
    // kendi generateMetadata lari OLMADIGI icin BASLIKSIZ duserlerdi — sessiz kayip,
    // ve tam da bu kapinin engellemesi gereken sey.
    for (const gorunum of GOC_ETMEYENLER) {
      const g = govde(oku(...gorunum))
      expect(
        /metadataRotadanMi/.test(g),
        `${gorunum[3]}: bayrak ACILMIS ama bu rota HENUZ GOC ETMEDI — rota kendi ` +
          'metadatasini yazmiyorsa sayfa basliksiz kalir.',
      ).toBe(false)
    }
  })

  it('BOŞLUK MUHAFIZI — dosyalar gerçekten okunuyor', () => {
    expect(govde(oku(...KANAL_ROTA)).length, 'kanal rotasi bos okundu.').toBeGreaterThan(200)
    expect(govde(oku(...KANAL_GORUNUM)).length, 'kanal gorunumu bos okundu.').toBeGreaterThan(2000)
    expect(govde(oku(...LAYOUT)).length, 'layout bos okundu.').toBeGreaterThan(500)
    for (const gorunum of GOC_ETMEYENLER) {
      expect(govde(oku(...gorunum)).length, `${gorunum[3]} bos okundu.`).toBeGreaterThan(2000)
    }
  })
})
