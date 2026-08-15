import { describe, expect, it } from 'vitest'

/**
 * INV-REFLOW-1 · Ölçülmüş iki yatay-taşma onarımının nüksetme kapısı.
 *
 * WCAG 2.2 SC 1.4.10 (Reflow, AA): içerik 320 CSS px'te iki yönlü kaydırma gerektirmeden
 * sunulabilmeli (320px ≡ 1280px @ %400 zoom).
 *
 * 2026-08-15'te canlıda ölçülen iki ihlal onarıldı:
 *   · `/tr/about` @320px → belge 16px taşıyordu (istatistik ızgarası)
 *   · `/tr/brands` @1024px → 7px (marka kartı başlık satırı)
 *
 * ## Bu testin SINIRI — açıkça yazıyorum
 * Bu STATİK bir bekçidir; düzeni ölçmez, yalnız onarımın **sınıf düzeyinde** yerinde
 * durduğunu doğrular. Yeni bir taşmayı YAKALAYAMAZ. Gerçek kapı `scripts/a11y/reflow-scan.mjs`
 * betiğinin CI'da koşmasıdır (o araç ADMIN-UX şeridinde; panodan istendi). Yani burada yeşil
 * görmek "vitrin temiz" demek DEĞİL, "bu iki onarım sökülmemiş" demektir.
 *
 * Neden yine de değerli: her iki onarım da "gereksiz sınıf" gibi görünüyor
 * (`min-w-0`, `truncate`, responsive tracking). Gerekçesi kodda yazılı, burada kilitli.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const RAW: Record<string, string> = import.meta.glob('/src/views/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const SOURCES: Record<string, string> = Object.fromEntries(
  Object.entries(RAW).map(([p, src]) => [p.replace(/^\//, ''), src]),
)

const ABOUT = 'src/views/AboutPage.tsx'
const BRANDS = 'src/views/BrandsPage.tsx'

describe('INV-REFLOW-1 · vitrin yatay taşma onarımları', () => {
  it('bekçinin izlediği dosyalar duruyor (stale-guard)', () => {
    for (const p of [ABOUT, BRANDS]) {
      expect(SOURCES[p], `${p} bulunamadı — taşındıysa bekçinin yolunu güncelle, silme.`).toBeTruthy()
    }
  })

  it('AboutPage istatistik etiketi dar ekranda harf aralığını kısıyor', () => {
    const src = SOURCES[ABOUT]
    // 0.3em (`hvac-relaxed`) 320px'te 2 sütunlu ızgarada tek uzun kelimeyi sığdıramıyor.
    // Küçük tier dar aralık, `sm:` üstünde tasarım aynen.
    expect(
      src,
      'İstatistik etiketi yine koşulsuz `tracking-hvac-relaxed` kullanıyor. 320px\'te ' +
        '"GLOBAL DİSTRİBÜTÖRLÜK" 115px\'lik sütuna sığmaz ve belge yatay taşar (SC 1.4.10). ' +
        'Dar tier için `tracking-hvac-tight sm:tracking-hvac-relaxed` kullan.',
    ).toMatch(/tracking-hvac-tight\s+sm:tracking-hvac-relaxed/)
  })

  it('BrandsPage marka adı satırı taşamaz (min-w-0 + truncate + shrink-0)', () => {
    const src = SOURCES[BRANDS]

    // Başlık satırını izole et: `justify-between` ile başlayıp ülke etiketiyle biten blok.
    const rowStart = src.indexOf('flex items-center justify-between')
    expect(rowStart, 'Marka kartı başlık satırı bulunamadı — düzen değiştiyse bekçiyi güncelle.').toBeGreaterThan(-1)
    const row = src.slice(rowStart, rowStart + 700)

    expect(
      row,
      'Marka adı `min-w-0 truncate` taşımıyor. Flex öğesinin varsayılan `min-width:auto`\'su ' +
        'yüzünden uzun ad min-content altına inemez; esneyen ayraç sıfırlansa bile satır taşar.',
    ).toMatch(/min-w-0[^"]*truncate|truncate[^"]*min-w-0/)

    expect(
      row,
      'Ülke etiketi `shrink-0` taşımıyor — sıkışınca kendisi daralıp metni sarmalar, ' +
        'satır yüksekliği bozulur.',
    ).toMatch(/shrink-0/)
  })
})
