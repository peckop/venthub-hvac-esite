import { beforeAll, describe, expect, it } from 'vitest'

import { ihlaller, kurallar, temsilcileriSec, type Kural, type Temsilciler } from './ssr-kurallari'

/**
 * SSR-HTML duman ALARMI — PROD (REC-134 · REC-138 ile tek kaynağa bağlandı).
 *
 * ⭐BU ALARM, KAPI DEĞİL. Ölçtüğü şey CANLI master'ın ürettiği HTML'dir; bir PR'ın kodu
 * hakkında hiçbir şey söylemez. PR kapısı ayrı yerde koşar: `e2e/ssr-html.e2e.ts`
 * (`admin-smoke` zorunlu kontrolü içinde, gerçek Supabase env'li build + ayakta sunucu).
 * İkisi de kuralları TEK KAYNAKTAN alır: `ssr-kurallari.ts` (§26).
 *
 * Niçin var: `dynamic(..., { ssr:false })` en yakın Suspense sınırını komple CSR'a
 * düşürür (BAILOUT_TO_CLIENT_SIDE_RENDERING) — kullanıcı JS'le her şeyi görür ama
 * bot/LCP boş `<main>` görür. tsc/lint/test/build sunucunun ÜRETTİĞİ HTML'e hiç bakmaz.
 *
 * Çalıştırma: `pnpm test:ssr-smoke` — `SMOKE_BASE_URL` ZORUNLU.
 *
 * ⭐NİÇİN `skipIf` KALKTI: eski hâlinde env yoksa `describe.skipIf(!BASE)` devreye girip
 * SIFIR test topluyordu ve hiçbir workflow bu env'i tanımlamıyordu. Yani bu kilit,
 * yazıldığı günden beri BİR KEZ BİLE koşmadı; kontrol listesinde "geçti" görünüyordu
 * çünkü hiçbir şey ölçmüyordu. ÖLÇEMEMEK GEÇMEK DEĞİLDİR.
 *
 * NOT — aşağıdaki `console.log` bilinçli ve kurala uygun: `eslint.config.cjs:124`
 * `tests/**` dizinini ignore ediyor, yani bu dosyada `no-console` hiç uygulanmıyor.
 * Inline bir lint-kapatma yorumu yazmayı denedim ve kendi kancam HAKLI OLARAK durdurdu
 * (kestirme yerine kuralı ölç). Ölçtüm: kurala takılmıyor, kapatmaya da gerek yok.
 */
const BASE = process.env.SMOKE_BASE_URL

async function getir(url: string): Promise<{ ok: boolean; status: number; text: () => Promise<string> }> {
  const r = await fetch(url, { headers: { accept: 'text/html' }, redirect: 'follow' })
  return { ok: r.ok, status: r.status, text: () => r.text() }
}

describe('SSR HTML duman alarmı (PROD) — içerik sunucudan gelmeli', () => {
  // FAIL-CLOSED KOL: adresi olmayan bir duman testi, sessizce geçen bir duman testidir.
  // Bu kol diğerlerinden ÖNCE gelir ki kırmızının SEBEBİ okunur olsun.
  it('SMOKE_BASE_URL tanımlı olmalı (fail-closed)', () => {
    expect(
      BASE,
      'SMOKE_BASE_URL yok — bu kilit ölçmeden geçemez (REC-134). Yerel: pnpm build && PORT=3111 pnpm start.'
    ).toBeTruthy()
  })

  let secilen: Kural[] = []

  beforeAll(async () => {
    if (!BASE) return
    // Sitemap erişilemez/boşsa `temsilcileriSec` HATA atar → beforeAll düşer → kollar
    // kırmızı. Sessizce sıfır rotayla yeşil dönmek bilerek imkânsız.
    const temsilciler: Temsilciler = await temsilcileriSec(BASE, getir)
    secilen = kurallar(temsilciler)
    // Hangi temsilci seçildi GÖRÜNSÜN: yarın "dün geçti bugün düştü" sorusunun cevabı
    // koşum günlüğünde dursun (katalog her gün değişiyor).
    console.log(
      '[ssr-duman] temsilciler: ' +
        secilen.map((k) => `${k.sinif}=${k.yol}${k.kapida ? '' : ' (yalniz ALARM)'}`).join(' · ') +
        ` | sitemap sayimlari: kok=${temsilciler.sayimlar.kokKategori}` +
        ` alt=${temsilciler.sayimlar.altKategori} pdp=${temsilciler.sayimlar.pdp}`
    )
  })

  // Sınıflar SABİT, temsilciler DİNAMİK: kol adı sınıfı taşır, yol koşumda öğrenilir.
  for (const sinif of ['anasayfa', 'liste', 'kok-kategori', 'alt-kategori', 'pdp'] as const) {
    it.skipIf(!BASE)(sinif, async () => {
      const kural = secilen.find((k) => k.sinif === sinif)
      // Kök kategori sitemap'te olmayabilir (hepsi pasifse) — o hâlde sınıf atlanır ama
      // SESSİZ kalmaz: sebep yazılır. Zorunlu sınıfların yokluğu `temsilcileriSec`te
      // zaten hata atar, yani buraya düşen tek şey gerçekten isteğe bağlı olandır.
      if (!kural) {
        expect(sinif, `${sinif} sınıfının temsilcisi yok — sitemap'te hiç üyesi bulunamadı`).toBe(
          'kok-kategori'
        )
        return
      }
      const res = await getir(`${BASE}${kural.yol}`)
      expect(res.status, `${kural.yol} (${sinif}) HTTP ${res.status}`).toBe(200)
      const html = await res.text()
      const sorunlar = ihlaller(kural, html)
      expect(sorunlar, sorunlar.join(' | ')).toEqual([])
    })
  }
})
