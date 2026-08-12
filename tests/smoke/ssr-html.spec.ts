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
 * Çalıştırma: SMOKE_BASE_URL ister (CI'da Vercel preview URL'i ya da yerelde
 * `pnpm build && PORT=3111 pnpm start` sonrası http://localhost:3111).
 * Env yoksa atlanır — birim test koşusunu yavaşlatmaz/kirletmez.
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
  // 1 bailout bilinçli: CategoryOrbitCarousel (3D) kendi Suspense'inde ssr:false.
  { path: '/tr/products', markers: [/<h2[\s>]/, /data-ssr="family-card"/], maxBailouts: 1 },
  // Üst kategori: alt-kategori kartları basar (aile kartı değil) — yalnız başlık marker'ı.
  { path: '/tr/category/konut-tipi-havalandirma', markers: [/<h1[\s>]|<h2[\s>]/], maxBailouts: 0 },
  // Yaprak alt-kategori: aile kartları SSR'da olmalı.
  { path: '/tr/category/konut-tipi-havalandirma/banyo-ve-tuvalet-fanlari', markers: [/data-ssr="family-card"/], maxBailouts: 0 },
  // 1 bailout bilinçli: PDP'deki izole ssr:false adası (galeri).
  // '>Model Seçimi<' DOM-only eşleşir (RSC payload'ında metin tırnak-escape'li geçer).
  // 2 bailout bilinçli: PDP'nin izole ssr:false adaları (galeri + 3D bloğu) — tam
  // gövde stream'iyle 2 template gelir; asıl guard yanındaki içerik marker'larıdır.
  { path: '/tr/products/seat-storm-jet', markers: [/<h1[\s>]/, />Model Seçimi</], maxBailouts: 2 },
]

// NOT: <main>…</main> daraltması KULLANILMAZ — React, Suspense içeriğini yanıtın
// SONUNDAKİ stream chunk'larında (hidden template) gönderir; main-daraltması bu
// meşru içeriği kaçırıp yanlış-kırmızı üretir. Tam doküman doğrudur: RSC payload'ı
// escape'li olduğu için ham HTML marker'ları (<h1, data-ssr="...") yalnız gerçekten
// render edilmiş DOM'da eşleşir.
describe.skipIf(!BASE)('SSR HTML smoke — içerik sunucudan gelmeli', () => {
  for (const rule of RULES) {
    it(rule.path, async () => {
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
