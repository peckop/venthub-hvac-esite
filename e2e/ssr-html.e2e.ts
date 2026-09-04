import { expect, test } from '@playwright/test'

import { ihlaller, type Kural,kurallar, temsilcileriSec } from '../tests/smoke/ssr-kurallari'

/**
 * SSR-HTML PR KAPISI — REC-138.
 *
 * ⭐BU BİR KAPIDIR, alarm değil. `admin-smoke` zorunlu kontrolünün içinde koşar ve
 * ölçtüğü şey **bu PR'ın kendi kodudur**: `e2e-smoke.yml` gerçek Supabase env'i ile
 * `build:ci` koşar, Playwright `webServer` (playwright.config.ts) `pnpm start` ile
 * sunucuyu ayağa kaldırır, biz o sunucudan HTML çekeriz.
 *
 * NİÇİN BURASI, `ci` DEĞİL (ölçüldü 2026-09-04):
 *  · zorunlu kontroller `[ci, admin-smoke, Vercel]` — `admin-smoke` ZATEN kapı, yeni
 *    kapı adı doğmuyor (yeni ad, açık PR'ları "beklenen kontrol gelmedi"de kilitlerdi);
 *  · gerçek-env build burada ZATEN var (`e2e-smoke.yml`) — `ci`'ye eklemek PR başına
 *    ikinci bir gerçek-env build demekti: prod DB isteği ~339 → ~678;
 *  · sunucu kaldırma da ZATEN çözülmüş (`webServer`, süreç TEK adımın içinde yaşar).
 *    Kendi "arka planda `next start`" tasarımımın depoda emsali YOKTU ve klasik tuzağı
 *    (stdout kapanmayınca adımın hiç bitmemesi) taşıyordu.
 *
 * KAPSAM SINIRI: burada YALNIZ `kapida: true` kuralları koşar. Kırılgan ölçütlü sınıf
 * (kök kategori — ayırt edici tek işareti i18n sözlüğünden gelen bir başlık) bilerek
 * DIŞARIDA; o sınıf prod alarmında ölçülür. Sebep deponun kendi yazılı kararı:
 * `playwright.config.ts` `checkout-smoke`'u aynı gerekçeyle zorunlu kapının dışında
 * tutuyor — doğrulanamayan bir ölçüt kırmızı çıktığında HERKESİN merge'ini bloklar.
 */
test.describe('SSR HTML PR kapısı — içerik sunucudan gelmeli', () => {
  let secilen: Kural[] = []

  test.beforeAll(async ({ playwright }) => {
    const ctx = await playwright.request.newContext()
    try {
      // Taban adres yok sayılmaz: `webServer` ayağa kalkmadıysa ya da sitemap boşsa
      // `temsilcileriSec` HATA atar ve kapı KIRMIZI olur. Sıfır rotayla yeşil YOK.
      const temsilciler = await temsilcileriSec('', async (url) => {
        const r = await ctx.get(url)
        return { ok: r.ok(), status: r.status(), text: () => r.text() }
      })
      secilen = kurallar(temsilciler, true)
    } finally {
      await ctx.dispose()
    }
  })

  for (const sinif of ['anasayfa', 'liste', 'alt-kategori', 'pdp'] as const) {
    test(sinif, async ({ request }, testInfo) => {
      const kural = secilen.find((k) => k.sinif === sinif)
      expect(kural, `${sinif} sınıfının kuralı üretilmedi — temsilci seçimi başarısız`).toBeTruthy()
      const k = kural as Kural
      // Hangi temsilci seçildiği koşum çıktısında GÖRÜNSÜN (katalog her gün değişiyor;
      // "dün geçti bugün düştü" sorusunun cevabı kayıtta dursun).
      testInfo.annotations.push({ type: 'temsilci', description: `${sinif} = ${k.yol}` })

      const res = await request.get(k.yol, { headers: { accept: 'text/html' } })
      expect(res.status(), `${k.yol} (${sinif}) HTTP ${res.status()}`).toBe(200)
      const html = await res.text()
      const sorunlar = ihlaller(k, html)
      expect(sorunlar, sorunlar.join(' | ')).toEqual([])
    })
  }
})
