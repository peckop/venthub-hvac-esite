import { describe, expect, it } from 'vitest'

/**
 * SSR-HTML smoke — içerik SUNUCUDAN gelmeli (INV: SSR boş-kabuk regresyon kilidi).
 *
 * Neden var: tsc/lint/test/build, sunucunun ÜRETTİĞİ HTML'e hiç bakmaz. client
 * bileşende `dynamic(..., { ssr:false })` en yakın Suspense sınırını komple
 * CSR'a düşürür (BAILOUT_TO_CLIENT_SIDE_RENDERING) — kullanıcı JS'le her şeyi
 * görür ama bot/LCP boş <main> görür. Kategori//products sayfaları bu yüzden
 * Haziran-Ağustos arası sessizce boş kabuk sundu. Bu test o sınıfı kilitler.
 *
 * Çalıştırma: `pnpm test:smoke` — SMOKE_BASE_URL ZORUNLU (CI'da işi bu workflow'un
 * kendi ayağa kaldırdığı sunucu, yerelde `pnpm build && PORT=3111 pnpm start`).
 *
 * ⭐REC-134 — NİÇİN `skipIf` KALKTI: eski hâlinde env yoksa `describe.skipIf(!BASE)`
 * devreye girip SIFIR test topluyordu ve hiçbir workflow SMOKE_BASE_URL tanımlamıyordu.
 * Yani bu kilit, yazıldığı günden beri BİR KEZ BİLE koşmadı; kontrol listesinde
 * "geçti" görünüyordu çünkü hiçbir şey ölçmüyordu. Kanıtı bu dosyanın kendi
 * yorumunda duruyordu: `<h2` marker'ı #959'da bayatlamıştı, spec koşsaydı DÜŞERDİ.
 * ÖLÇEMEMEK GEÇMEK DEĞİLDİR — env yoksa artık kol DÜŞER.
 *
 * ⭐NİÇİN AYRI CONFIG (`vitest.smoke.config.ts`): bu dosya vitest'in VARSAYILAN
 * kapsamındaydı, yani `ci`'nin Test adımı onu topluyordu. Fail-closed'ı orada
 * bırakmak `ci`'yi ayakta bir sunucu olmadan kırmızı yapardı — yanlış kapı.
 * Kapı, sunucuyu ÜRETEN koşumun içinde durmalı.
 */
const BASE = process.env.SMOKE_BASE_URL

interface Rule {
  path: string
  /** <main> içinde bulunması ZORUNLU içerik işaretleri. */
  markers: RegExp[]
  /** İzin verilen bailout sayısı (bilinçli izole ssr:false adaları için ratchet). */
  maxBailouts: number
}

const RULES: Rule[] = [
  { path: '/tr', markers: [/<h1[\s>]/], maxBailouts: 0 },
  // REC-94: 3D orbital şerit müşteri yüzeyinden kaldırıldı → o ssr:false adası da yok,
  // bailout beklentisi 1'den 0'a İNDİ. Eşiği indirmek işin parçası: assertion
  // `toBeLessThanOrEqual` olduğu için 1'de bırakılsaydı kazanç kayda GEÇMEZDİ ve
  // yarın biri şeridi geri koysa kapı sessiz kalırdı (ratchet kurgusu).
  // ⭐Ayrıca marker `<h2` idi ve BAYATTI: #959 ile bu sayfanın başlığı h1 yapıldı ve
  // sayfada başka h2 kalmadı — spec koşsaydı DÜŞERDİ. Düşmedi çünkü hiç koşmuyor
  // (SMOKE_BASE_URL hiçbir workflow'da tanımlı değil; kapı boşluğu ALTYAPI'ya bildirildi).
  { path: '/tr/products', markers: [/<h1[\s>]/, /data-ssr="family-card"/], maxBailouts: 0 },
  // Üst kategori: alt-kategori kartları basar (aile kartı değil) — yalnız başlık marker'ı.
  { path: '/tr/category/konut-tipi-havalandirma', markers: [/<h1[\s>]|<h2[\s>]/], maxBailouts: 0 },
  // Yaprak alt-kategori: aile kartları SSR'da olmalı.
  { path: '/tr/category/konut-tipi-havalandirma/banyo-ve-tuvalet-fanlari', markers: [/data-ssr="family-card"/], maxBailouts: 0 },
  // 1 bailout bilinçli: PDP'deki izole ssr:false adası (galeri).
  // '>Model Seçimi<' DOM-only eşleşir (RSC payload'ında metin tırnak-escape'li geçer).
  // 2 bailout bilinçli: PDP'nin izole ssr:false adaları (galeri + 3D bloğu) — tam
  // gövde stream'iyle 2 template gelir; asıl guard yanındaki içerik marker'larıdır.
  // ⭐SLUG BAYATTI, ALARM İLK KOŞUMUNDA YAKALADI (2026-09-04): `seat-storm-jet`
  // canlıda 404 — spec hiç koşmadığı için kimse görmemişti (REC-134'ün tezi tam
  // buydu). Yerine canlıdan ÖLÇÜLMÜŞ bir slug kondu; seçim keyfi değil: üç ayrı
  // PDP ölçüldü (avens-bvu-ls, avens-hucreli-aspiratorler, avens-plug-fanlar) ve
  // ÜÇÜNDE DE aynı çıktı — h1=1, '>Model Seçimi<'=1, bailout=2. Yani beklentiler
  // bu sayfaya değil PDP SINIFINA ait; slug yalnız sınıfın temsilcisi.
  // Bu ürün bir gün katalogdan kalkarsa alarm 404 verir; bu YANLIŞ ALARM DEĞİL,
  // "vitrinin ölçülen yüzeyi değişti" haberidir ve temsilci yenilenir.
  { path: '/tr/products/avens-bvu-ls', markers: [/<h1[\s>]/, />Model Seçimi</], maxBailouts: 2 },
]

// NOT: <main>…</main> daraltması KULLANILMAZ — React, Suspense içeriğini yanıtın
// SONUNDAKİ stream chunk'larında (hidden template) gönderir; main-daraltması bu
// meşru içeriği kaçırıp yanlış-kırmızı üretir. Tam doküman doğrudur: RSC payload'ı
// escape'li olduğu için ham HTML marker'ları (<h1, data-ssr="...") yalnız gerçekten
// render edilmiş DOM'da eşleşir.
describe('SSR HTML smoke — içerik sunucudan gelmeli', () => {
  // FAIL-CLOSED KOL: adresi olmayan bir duman testi, sessizce geçen bir duman
  // testidir. Bu kol diğerlerinden ÖNCE gelir ki kırmızının SEBEBİ okunur olsun —
  // yoksa beş kol birden `fetch(undefined...)` ile anlamsız hatalar üretir.
  it('SMOKE_BASE_URL tanımlı olmalı (fail-closed)', () => {
    expect(
      BASE,
      'SMOKE_BASE_URL yok — bu kilit ölçmeden geçemez (REC-134). CI: sunucuyu ayağa ' +
        'kaldıran adım env\'i beslemeli. Yerel: pnpm build && PORT=3111 pnpm start.'
    ).toBeTruthy()
  })

  // ⚠BURADAKİ `skipIf` FAIL-CLOSED'I DELMEZ — yukarıdaki kol env yoksa HER HÂLDE
  // düşer ve koşum kırmızıdır. Ölçüldü: skipIf olmadan bu beş kol da düşüyordu ama
  // hepsi `ERR_INVALID_URL: undefined/tr/...` diyordu; asıl sebep ("env yok") beş
  // anlamsız hatanın altında KAYBOLUYORDU. Kırmızının SEBEBİ okunmuyorsa kapı
  // yarısı kadar iş görür. Yani burada atlanan şey KİLİT değil, GÜRÜLTÜ.
  for (const rule of RULES) {
    it.skipIf(!BASE)(rule.path, async () => {
      const res = await fetch(`${BASE}${rule.path}`, {
        headers: { accept: 'text/html' },
        redirect: 'follow',
      })
      expect(res.status).toBe(200)
      const html = await res.text()
      for (const marker of rule.markers) {
        expect(html, `${rule.path} SSR HTML'inde beklenen içerik yok: ${marker}`).toMatch(marker)
      }
      const bailouts = (html.match(/BAILOUT_TO_CLIENT_SIDE_RENDERING/g) ?? []).length
      expect(
        bailouts,
        `${rule.path} beklenmeyen CSR bailout (SSR boş-kabuk riski): ${bailouts} > ${rule.maxBailouts}`
      ).toBeLessThanOrEqual(rule.maxBailouts)
    })
  }
})
