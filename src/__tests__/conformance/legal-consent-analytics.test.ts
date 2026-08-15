import { describe, expect, it } from 'vitest'

/**
 * INV-LEGAL-2 · Analitik rıza kapısı (kalıcı bekçi) — T020-VH · denetim K/S6.
 *
 * CANLI AÇIK: `docs/standards/analytics-standard.md` "CookieConsent onayı verilmeden analytics
 * olayları ateşlenmez (consent-mode)" diyordu ama **kodda karşılığı yoktu**. `vh_cookie_consent`
 * bayrağını yalnız bandın kendisi okuyordu; `trackEvent()` rızaya hiç bakmadan ateşliyordu.
 * Sistemin sessiz olmasının tek sebebi GA kimliğinin yokluğuydu — güvenlik değil tesadüf.
 *
 * Bu bekçi iki katmanı birden kilitler:
 *   1. `trackEvent` rızayı SORMADAN gönderemez (olay katmanı),
 *   2. GA/GTM script'i rıza kapısından geçmeden yüklenemez (etiket katmanı) — olayı bastırmak
 *      yetmez, etiket yüklendiği an kendi çerezini yazar.
 * Ayrıca rıza metinlerinin sözlükten geldiğini doğrular (CLAUDE.md kural 7): bandın önceki hâli
 * `'Tümünü Kabul Et'` gibi metinleri koda gömmüştü.
 *
 * tsc/lint/build bu sınıfı GÖRMEZ — eksik bir `if` tip hatası değildir.
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

const ANALYTICS = '/src/utils/analytics.ts'
const BANNER = '/src/components/layout/CookieConsent.tsx'
const GATED_SCRIPT = '/src/components/analytics/ConsentGatedAnalytics.tsx'
const LAYOUT = '/src/components/layout/ClientLayout.tsx'

describe('INV-LEGAL-2 · analitik rıza kapısı', () => {
  it('bekçinin izlediği dosyalar duruyor (stale-guard)', () => {
    for (const p of [ANALYTICS, BANNER, GATED_SCRIPT, LAYOUT]) {
      expect(SOURCES[p], `${p} bulunamadı — taşındıysa bekçinin yolunu güncelle, silme.`).toBeTruthy()
    }
  })

  it('trackEvent, olay göndermeden ÖNCE analitik rızasını sorar', () => {
    const src = SOURCES[ANALYTICS]
    expect(src, 'analytics.ts okunamadı').toBeTruthy()

    const gateIndex = src.indexOf("hasConsent('analytics')")
    expect(
      gateIndex,
      'trackEvent analitik rızasını hiç sormuyor — rızasız olay gider (T020 nüksetti).',
    ).toBeGreaterThan(-1)

    // Kapı, ilk gönderim çağrısından ÖNCE gelmeli.
    const firstSend = Math.min(
      ...['window.gtag(', 'window.dataLayer.push(']
        .map((needle) => src.indexOf(needle))
        .filter((i) => i > -1),
    )
    expect(firstSend, 'gönderim çağrısı bulunamadı — akış değiştiyse bekçiyi güncelle.').toBeGreaterThan(-1)
    expect(
      gateIndex,
      'Rıza kontrolü gönderimden SONRA geliyor — kapı işlevsiz.',
    ).toBeLessThan(firstSend)
  })

  it('GA/GTM script yükleyicisi rıza kapısının arkasında', () => {
    const src = SOURCES[GATED_SCRIPT]
    expect(src).toMatch(/hasConsent\('analytics'\)/)
    // Rıza veya kimlik yoksa hiçbir şey render edilmemeli.
    expect(
      src,
      'Erken çıkış yok — rıza olmadan script render edilebilir.',
    ).toMatch(/if \(!gaId \|\| !allowed\) return null/)
  })

  it('rıza kapılı yükleyici uygulamaya gerçekten monte edilmiş', () => {
    // Bileşenin var olması yetmez; ağaca bağlı değilse ölü koddur ve GA'yı
    // ekleyen kişi kapıyı atlayarak kendi script etiketini koyar.
    expect(
      SOURCES[LAYOUT],
      'ConsentGatedAnalytics ClientLayout içinde monte edilmemiş.',
    ).toMatch(/<ConsentGatedAnalytics\s*\/>/)
  })

  it('GA script etiketi YALNIZ rıza kapılı bileşende geçebilir', () => {
    // Başka bir yere doğrudan googletagmanager script'i konursa kapı baypas edilir.
    const offenders = Object.entries(SOURCES)
      .filter(([p]) => p !== GATED_SCRIPT)
      .filter(([, src]) => src.includes('googletagmanager.com'))
      .map(([p]) => p)

    expect(
      offenders,
      `GA script'i rıza kapısı dışında referanslanmış: ${offenders.join(', ')}`,
    ).toEqual([])
  })

  it('rıza bandı metinleri sözlükten geliyor (kural 7)', () => {
    const src = SOURCES[BANNER]
    // Önceki hâlindeki gömülü metinler geri gelmemeli.
    for (const literal of ['Tümünü Kabul Et', 'Accept All', 'Çerez İzni', 'Cookie Consent']) {
      expect(
        src.includes(`'${literal}'`),
        `Banda gömülü metin döndü: "${literal}" — sözlükten gelmeli.`,
      ).toBe(false)
    }
    expect(src).toMatch(/t\('cookieConsent\./)
  })
})
