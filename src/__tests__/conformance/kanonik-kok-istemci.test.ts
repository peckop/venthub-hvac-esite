/**
 * INV-KANONIK-KOK-1 — `'use client'` dosyalar `config/siteUrl`'i DOĞRUDAN kullanamaz.
 *
 * NİÇİN (REC-100, 2026-08-31): `src/config/siteUrl.ts`'nin kendi başlığı bu kuralı
 * kelimesi kelimesine yazıyordu — "istemci bileşenlerinde kullanılırsa `localhost`'a
 * düşülür, o yüzden istemcide kullanma" — ama kuralı zorlayan HİÇBİR kapı yoktu.
 * Sonucu canlıda ölçüldü: `Seo.tsx` (bir `'use client'` bileşeni) `SITE_URL` okuyordu ve
 * her ürün/marka sayfasında ikinci bir `canonical` + `og:url` + `og:image`
 * `http://localhost:3000` gösteriyordu; marka sayfasında ÜÇ canonical vardı.
 * `Breadcrumb.tsx` ise aynı değeri BreadcrumbList yapısal verisine yazıyordu.
 *
 * Kusuru hiçbir mevcut kapı göremezdi: `tsc` için `string` `string`'dir, `lint` bir
 * import'u yasaklamıyordu, testler SSR çıktısına bakıyordu — ve SSR çıktısı DOĞRUYDU.
 * Yanlış değer yalnız hidrasyondan sonra, tarayıcıda beliriyordu.
 *
 * ÖLÇÜT NEDEN AST DEĞİL, DÜZ ARAMA DEĞİL: import ifadesi yapısal olarak sabit bir
 * kalıp; ama yorum içinde de aynı yol geçiyor (bu dosyanın kendisi dahil). Bu yüzden
 * yalnız `import ... from '<yol>'` biçimi eşleniyor, yorum satırları elenmiyor —
 * yorumda `from` + tırnak dizilimi bulunmadığı için doğal olarak kapsam dışında kalır.
 */
import { readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { globSync } from 'glob'
import { describe, expect,it } from 'vitest'

const KOK = join(process.cwd(), 'src')

/** `config/siteUrl` import'u — göreli ya da alias, tek tırnak ya da çift. */
const SITEURL_IMPORT = /import\s+[^;]*?from\s+['"][^'"]*config\/siteUrl['"]/

/** Yardımcının kendisi MUAF: sunucu/istemci ayrımını yapan yer tam orasıdır. */
const MUAF = ['lib/seo/canonicalOrigin.ts']

const istemciDosyalari = (): string[] =>
  globSync('**/*.{ts,tsx}', { cwd: KOK, absolute: true, ignore: ['**/__tests__/**', '**/*.test.*', '**/*.d.ts'] })
    .filter(dosya => {
      const ilkSatirlar = readFileSync(dosya, 'utf8').slice(0, 200)
      return /^\s*['"]use client['"]/m.test(ilkSatirlar)
    })

describe('INV-KANONIK-KOK-1', () => {
  const istemciler = istemciDosyalari()

  it('taramanın kendisi çalışıyor: en az bir istemci dosyası bulundu', () => {
    // Vacuous-guard: glob deseni ya da `'use client'` sezimi bozulursa aşağıdaki
    // asıl iddia BOŞ küme üzerinde koşup sessizce yeşil kalırdı.
    expect(istemciler.length).toBeGreaterThan(10)
  })

  it("hiçbir 'use client' dosyası config/siteUrl'i doğrudan import etmiyor", () => {
    const ihlal = istemciler
      .filter(dosya => {
        const goreli = relative(KOK, dosya).replace(/\\/g, '/')
        if (MUAF.includes(goreli)) return false
        return SITEURL_IMPORT.test(readFileSync(dosya, 'utf8'))
      })
      .map(dosya => relative(KOK, dosya).replace(/\\/g, '/'))

    expect(ihlal).toEqual([])
  })

  it('ölçüt gerçekten ayırt ediyor: muaf yardımcı import ediyor OLMALI', () => {
    // Negatif kontrol. Kural "kimse import etmesin" değil; "istemci dosyaları
    // etmesin, ayrımı yapan TEK yer etsin". Yardımcı import'u bırakırsa kural
    // anlamını yitirir ve bu kapı da hiçbir şey ölçmez olur.
    const yardimci = readFileSync(join(KOK, 'lib', 'seo', 'canonicalOrigin.ts'), 'utf8')
    expect(SITEURL_IMPORT.test(yardimci)).toBe(true)
  })
})
