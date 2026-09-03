import { describe, expect, it } from 'vitest'

/**
 * INV-CANONICAL-2 · kanonik adres DİL ÖNEKİ taşır ve sitemap ile ayrışamaz.
 * Cetvel: `docs/standards/canonical-url-standard.md` §1, §4.
 *
 * KORUDUĞU KUSUR (T083-VH, 2026-08-17 ölçüldü): ürün ve marka sayfaları kanoniği dil öneksiz
 * üretiyordu (`${SITE_URL}/products/<slug>`). `middleware.ts:86` dil öneksiz her kullanıcı
 * rotasını **307** ile `/${detectedLocale}${pathname}` adresine yönlendirir ve hedef dili
 * **`Accept-Language` başlığına göre** seçer. Üç sonucu vardı:
 *   1. kanonik bir YÖNLENDİRMEYİ gösteriyordu (zayıf sinyal),
 *   2. kanonik ZİYARETÇİYE GÖRE değişiyordu — #620 kusurunun dil üzerinden hâli,
 *   3. en pahalısı: `/tr/...` ve `/en/...` sayfalarının İKİSİ DE aynı kanoniği bildiriyordu →
 *      arama motoru kopya sayıp bir dili indeksten düşürebilirdi. `alternates.languages`
 *      (hreflang) da yoktu, yani ayırt edecek ikinci sinyal de yoktu.
 * `sitemap.ts` doğruyu bildiriyordu; sayfa onu çürütüyordu. Yani iki yüzey AYRIŞMIŞTI ve
 * hiçbir test bunu görmüyordu — tsc/lint göremez, çünkü ikisi de geçerli string.
 *
 * ⚠GÜNCELLEME (2026-09-03, REC-127): yukarıdaki "307 ile yönlendirir" tarifi artık YALNIZ
 * dil öneksiz DERİN yollar için geçerli. KÖK yol (`/`) deterministik **308** ile `/tr`ye
 * gider. Ayrım kasıtlı: 308 tarayıcıda kalıcı önbelleklenir, dolayısıyla ancak sonucu
 * istekten BAĞIMSIZ olan dalda kullanılabilir. Derin yollar `detectLocale`ye (çerez +
 * `Accept-Language`) bağlı olduğu için 307 kalmıştır; onları 308 yapmak ziyaretçiyi ilk
 * isteğinde düştüğü dile kilitler ve düzeltme sunucuda değil TARAYICIDA gerekir.
 *
 * KARDEŞ BEKÇİ: `INV-CANONICAL-1` (`canonical-url-ssot.test.ts`) kanonik adresin KAYNAĞINI
 * (SSOT `SITE_URL`, tarayıcı host'u yasak) korur. Bu dosya ŞEKLİNİ korur (dil öneki + hreflang
 * + sitemap ile aynı ifade). İkisi bilerek ayrıdır.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SOURCES: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/**
 * Yorumları sıyır. `(?<!:)` ZORUNLU — naif bir `//` sıyırıcısı `https://host` içindeki `//`'ı
 * yorum sanıp URL'i yok eder ve dedektörü kör bırakır (INV-CSP-1 yazılırken canlı yaşandı).
 * `[^\r\n]` ZORUNLU — repo CRLF, JS'te `.` satır sonlandırıcı `\r` ile eşleşmez.
 */
function kod(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(?<!:)\/\/[^\r\n]*/g, '')
}

/**
 * Dil parçası imzası: `${lang}`, açık `tr`/`en` segmenti, ya da **SSOT yardımcısı**.
 *
 * `localizedHref` neden kabul: dil önekini o ekler ve CLAUDE.md kural 7 elle `/${lang}`
 * birleştirmeyi zaten YASAKLAR (I18N şeridinin INV-2 bekçisi altyapı katmanında bunu
 * kırmızı yakıyor — bu bekçiyi yazarken benim kendi kodumda yakaladı). Yani yardımcıyı
 * dil imzası saymazsak, doğru yazılmış kodu yanlış-KIRMIZI yakarız.
 */
const DIL_PARCASI = /\$\{lang\}|\/tr[/`'"]|\/en[/`'"]|['"]tr['"]|['"]en['"]|\blocalizedHref\s*\(/

/**
 * Dosyadaki `const X = ...` atamalarını (satır sonuna kadar) topla.
 *
 * Niçin gerek: kanonik neredeyse hiç yerinde yazılmaz — `canonical: canonicalUrl` denir ve
 * `canonicalUrl` başka bir satırda `lang === 'en' ? enUrl : trUrl` olarak kurulur. İsme bakan
 * bir kural burada hiçbir şey kanıtlamaz; DEĞERİ çözmek gerekir.
 */
function sabitler(src: string): Map<string, string> {
  const m = new Map<string, string>()
  const re = /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*([^\r\n]+)/g
  let x: RegExpExecArray | null
  while ((x = re.exec(src)) !== null) m.set(x[1], x[2])
  return m
}

/**
 * Bir ifadeyi, referans verdiği sabitleri yerine koyarak çöz (sınırlı derinlik).
 * Üç geçiş yeter: canonical → canonicalUrl → (trUrl|enUrl) → `${SITE_URL}/tr...`.
 */
function coz(ifade: string, harita: Map<string, string>, derinlik = 3): string {
  let sonuc = ifade
  for (let i = 0; i < derinlik; i++) {
    let degisti = false
    for (const [ad, deger] of harita) {
      const re = new RegExp(`\\b${ad}\\b`, 'g')
      if (re.test(sonuc) && !deger.includes(ad)) {
        sonuc = sonuc.replace(re, ` ${deger} `)
        degisti = true
      }
    }
    if (!degisti) break
  }
  return sonuc
}

/** `alternates: { ... }` bloklarını (dengeli süslü parantezle) çıkar. */
function alternatesBloklari(src: string): string[] {
  const out: string[] = []
  const re = /\balternates\s*:\s*\{/g
  let m: RegExpExecArray | null
  while ((m = re.exec(src)) !== null) {
    let derinlik = 1
    let i = m.index + m[0].length
    const bas = i
    while (i < src.length && derinlik > 0) {
      if (src[i] === '{') derinlik++
      else if (src[i] === '}') derinlik--
      i++
    }
    out.push(src.slice(bas, i - 1))
  }
  return out
}

/** Kanonik üreten üretim dosyaları (test/mock hariç). */
function uretimDosyalari(): [string, string][] {
  return Object.entries(SOURCES).filter(
    ([k]) => !/__tests__\/|__mocks__\/|\.test\.|\.spec\./.test(k),
  )
}

describe('INV-CANONICAL-2 · kanonik dil öneki + hreflang + sitemap paritesi', () => {
  it('dedektör gerçekten kanonik yüzeyi buluyor (sahte-yeşil kilidi)', () => {
    // Bu kilit olmasaydı, desenler bozulduğunda "ihlal yok" sonucu ölçümden değil
    // KÖRLÜKTEN gelirdi ve bekçi ömür boyu yeşil yanardı.
    const bulunan = uretimDosyalari().filter(([, s]) =>
      alternatesBloklari(kod(s)).some((b) => /\bcanonical\s*:/.test(b)),
    )
    expect(
      bulunan.length,
      'Hiç `alternates.canonical` bulunamadı — desen bozuldu (repoda en az ana sayfa, ' +
        'kategori, ürün ve marka sayfaları kanonik üretiyor).',
    ).toBeGreaterThan(2)
  })

  it('her `alternates.canonical` DİL ÖNEKİ taşıyor', () => {
    const ihlaller: string[] = []
    for (const [dosya, ham] of uretimDosyalari()) {
      const src = kod(ham)
      const harita = sabitler(src)
      for (const blok of alternatesBloklari(src)) {
        const m = blok.match(/\bcanonical\s*:\s*([^,\r\n]+)/)
        if (!m) continue
        const cozulmus = coz(m[1], harita)
        if (!DIL_PARCASI.test(cozulmus)) {
          ihlaller.push(
            `${dosya.replace(/^\//, '')} — canonical: ${m[1].trim()} → çözümünde dil parçası YOK. ` +
              `middleware 307 ile yönlendirir; iki dil aynı kanoniği bildirir (cetvel §4).`,
          )
        }
      }
    }
    expect(ihlaller, `\n${ihlaller.join('\n')}`).toEqual([])
  })

  it('kanonik bildiren her sayfa hreflang (`languages`) da bildiriyor', () => {
    const ihlaller: string[] = []
    for (const [dosya, ham] of uretimDosyalari()) {
      for (const blok of alternatesBloklari(kod(ham))) {
        if (!/\bcanonical\s*:/.test(blok)) continue
        if (!/\blanguages\s*:/.test(blok)) {
          ihlaller.push(
            `${dosya.replace(/^\//, '')} — canonical var ama languages (hreflang) YOK. ` +
              `Dil ayrımını yapacak ikinci sinyal yoksa kopya riski sürer.`,
          )
        }
      }
    }
    expect(ihlaller, `\n${ihlaller.join('\n')}`).toEqual([])
  })

  it('sitemap URL\'leri dil önekli üretiliyor (stale-guard — pariteyi sitemap tarafından bozma)', () => {
    const src = kod(SOURCES['/src/app/sitemap.ts'] ?? '')
    expect(src.length, 'sitemap.ts okunamadı — yol değişti mi?').toBeGreaterThan(0)
    const urlIfadeleri = [...src.matchAll(/\burl\s*:\s*([^,\r\n]+)/g)].map((m) => m[1])
    expect(urlIfadeleri.length, 'sitemap.ts içinde url ifadesi bulunamadı').toBeGreaterThan(2)
    const dilsiz = urlIfadeleri.filter((u) => u.includes('baseUrl') && !DIL_PARCASI.test(u))
    expect(
      dilsiz,
      `\nsitemap.ts dil öneksiz URL bildiriyor:\n${dilsiz.join('\n')}\n` +
        `Kanonik ile sitemap AYNI ifadeden üretilmeli (cetvel §1).`,
    ).toEqual([])
  })

  it('istemci kanonik yüzeyi (Seo.tsx) dil önekini yolun KENDİSİNDEN alır', () => {
    // NİÇİN AYRI KURAL: `alternates` taraması bu yüzeyi GÖREMEZ. Ölçüm (2026-08-18): sekiz
    // dosya `<Seo>` kullanıyor, yalnız biri (`ProductDetailPageView`) açık `canonical` geçiyor;
    // kalan yedisi (Hakkımızda, İletişim, Markalar, Bilgi Merkezi hub/topic, hesaplayıcılar,
    // marka detayı) VARSAYILANA güveniyor. Varsayılan bugün DOĞRU — `usePathname()` dil
    // segmentini taşır. Ama korumasızdı: biri varsayılanı `Routes.x(...)` gibi dilsiz bir
    // kaynağa çevirseydi YEDİ yüzey birden sessizce bozulur ve hiçbir test görmezdi.
    // Bu kural o "bugün doğru ama korumasız" hâlini kilitler.
    const seo = kod(SOURCES['/src/components/Seo.tsx'] ?? '')
    expect(seo.length, 'Seo.tsx okunamadı — yol değişti mi?').toBeGreaterThan(0)

    expect(
      /usePathname\s*\(/.test(seo),
      'Seo.tsx dil önekini yolun kendisinden almıyor. `usePathname()` kaldırılırsa kanonik ' +
        'dil segmentini kaybeder ve yedi yüzey birden bozulur.',
    ).toBe(true)

    // Kanonik SSOT host'tan + gerçek yoldan kurulmalı (INV-CANONICAL-1 ile bilerek örtüşür).
    expect(
      /canonical\s*\|\|\s*`\$\{siteUrl\}\$\{pathname\}`|canonical\s*\|\|\s*`\$\{SITE_URL\}\$\{pathname\}`/.test(
        seo,
      ),
      'Seo.tsx kanonik yedeği `SITE_URL + pathname` biçiminde değil — dil öneki garanti edilemez.',
    ).toBe(true)

    // `<Seo>`'ya AÇIK canonical geçen her yer dil parçası taşımalı.
    const ihlaller: string[] = []
    for (const [dosya, ham] of uretimDosyalari()) {
      const src = kod(ham)
      if (!/<Seo\b/.test(src)) continue
      const harita = sabitler(src)
      for (const m of src.matchAll(/<Seo\b[^>]*\scanonical=\{([^}]+)\}/g)) {
        if (!DIL_PARCASI.test(coz(m[1], harita))) {
          ihlaller.push(`${dosya.replace(/^\//, '')} — <Seo canonical={${m[1].trim()}}> dil parçası YOK`)
        }
      }
    }
    expect(ihlaller, `\n${ihlaller.join('\n')}`).toEqual([])
  })

  it('dedektör sağlığı: sentetik ihlali görür, sentetik doğruyu görmez', () => {
    const YANLIS = [
      'const canonicalUrl = `${SITE_URL}/products/${slug}`',
      'export const x = { alternates: { canonical: canonicalUrl, languages: {} } }',
    ].join('\n')
    const DOGRU = [
      'const trUrl = `${SITE_URL}/tr${Routes.product(slug)}`',
      'const enUrl = `${SITE_URL}/en${Routes.product(slug)}`',
      "const canonicalUrl = lang === 'en' ? enUrl : trUrl",
      'export const x = { alternates: { canonical: canonicalUrl, languages: {} } }',
    ].join('\n')

    const olc = (s: string) => {
      const harita = sabitler(s)
      const blok = alternatesBloklari(s)[0] ?? ''
      const m = blok.match(/\bcanonical\s*:\s*([^,\r\n]+)/)
      return m ? DIL_PARCASI.test(coz(m[1], harita)) : null
    }

    expect(olc(YANLIS), 'dil öneksiz kanonik YAKALANMALI').toBe(false)
    expect(olc(DOGRU), 'dil önekli kanonik yanlış-KIRMIZI vermemeli').toBe(true)

    // YORUM YANLIŞ-POZİTİF KİLİDİ: kaldırılmış kodu ANLATAN yorum ihlal sayılmamalı.
    //
    // SATIR SONU **CRLF** OLMAK ZORUNDA. İlk sürümde bu sentetik `\n` kullanıyordu ve sabotaj
    // turunda ortaya çıktı ki o hâliyle kilit KENDİSİ kör: `kod()`'un `[^\r\n]` koruması
    // kaldırıldığında test yine yeşil kalıyordu, çünkü `\n`'li metinde `.` zaten satır sonuna
    // kadar gidiyor. Repo dosyaları CRLF; kilit gerçeği taklit etmezse hiçbir şeyi kilitlemez.
    const yorumluCRLF =
      '// export const meta = { alternates: { canonical: `${SITE_URL}/products/x` } }\r\n' +
      'export const a = 1\r\n'
    expect(
      alternatesBloklari(kod(yorumluCRLF)),
      'CRLF satırdaki YORUM ihlal sayıldı — sıyırıcının `[^\\r\\n]` koruması çalışmıyor',
    ).toEqual([])
  })
})
