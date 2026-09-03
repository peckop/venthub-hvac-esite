#!/usr/bin/env node
/**
 * IndexNow TOPLU BİLDİRİM — tek seferlik (REC-127, Bing paketi).
 *
 * NE YAPAR: canlı `sitemap.xml`i okur, içindeki TÜM URL'leri IndexNow'a bildirir.
 * NİÇİN AYRI BİR BETİK: webhook yalnız BUNDAN SONRA değişen sayfaları bildirir; hâlihazırda
 * yayında olan yüzlerce sayfa hiçbir zaman bildirilmez. Bu betik o açığı bir kerede kapatır.
 * Sonrasında webhook devralır; bu betiği tekrar koşmak gerekmez (zararsızdır ama gereksizdir).
 *
 * KULLANIM:
 *   INDEXNOW_KEY=<anahtar> node scripts/seo/indexnow-bildir.mjs [--site https://venthub.com.tr] [--kuru]
 *
 *   --kuru   HİÇBİR ŞEY GÖNDERMEZ; kaç URL bulundu, ilk 10'u ne, onu basar.
 *            Gönderim geri alınamayan dış bir eylem olduğu için ÖNCE bununla ölç.
 *
 * ÖN KOŞUL: `https://<site>/<anahtar>.txt` yayında olmalı ve içeriği anahtarın KENDİSİ
 * olmalı. Yoksa IndexNow 403 döner. Middleware'de kök seviyedeki `.txt` dosyaları dil
 * önekinden muaftır (REC-127) — bu muafiyet olmadan dosya `/tr/<anahtar>.txt`ye
 * yönlendirilir ve doğrulama BAŞARISIZ olur.
 */

const ENDPOINT = 'https://api.indexnow.org/indexnow'
const MAX_URL = 10_000

function arg(ad, varsayilan) {
  const i = process.argv.indexOf(ad)
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : varsayilan
}

const site = (arg('--site', 'https://venthub.com.tr')).replace(/\/+$/, '')
const kuru = process.argv.includes('--kuru')
const key = process.env.INDEXNOW_KEY

if (!key) {
  console.error('DURDU: INDEXNOW_KEY ortam degiskeni yok.')
  console.error('  Anahtar Recep tarafindan Vercel ortamina girilir; yerel kosum icin:')
  console.error('  INDEXNOW_KEY=<anahtar> node scripts/seo/indexnow-bildir.mjs --kuru')
  process.exit(1)
}

const sitemapUrl = `${site}/sitemap.xml`
console.log(`sitemap okunuyor: ${sitemapUrl}`)

const res = await fetch(sitemapUrl, { headers: { 'user-agent': 'venthub-indexnow-script' } })
if (!res.ok) {
  console.error(`DURDU: sitemap okunamadi — HTTP ${res.status}`)
  process.exit(1)
}

const xml = await res.text()
// Tek seviye sitemap varsayimi; index sitemap ise <sitemap> etiketleri de <loc> tasir ve
// asagidaki uyari tetiklenir (sessizce yanlis kume bildirmektense DURMAK dogru).
if (/<sitemapindex/i.test(xml)) {
  console.error('DURDU: bu bir SITEMAP INDEX. Alt sitemapleri tek tek besle (--site ile).')
  process.exit(1)
}

const urlList = [...new Set([...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]))]

console.log(`bulunan URL: ${urlList.length}`)
if (urlList.length === 0) {
  console.error('DURDU: sitemap bos okundu — bos kumeyi bildirmek olcum degildir.')
  process.exit(1)
}
console.log('ilk 10:')
for (const u of urlList.slice(0, 10)) console.log('  ' + u)

if (kuru) {
  console.log('\nKURU KOSUM — hicbir sey gonderilmedi.')
  process.exit(0)
}

if (urlList.length > MAX_URL) {
  console.error(`DURDU: ${urlList.length} URL, tek istek siniri ${MAX_URL}. Parcalayarak gonder.`)
  process.exit(1)
}

const gonder = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: new URL(site).host,
    key,
    keyLocation: `${site}/${key}.txt`,
    urlList,
  }),
})

console.log(`\nIndexNow yanit: HTTP ${gonder.status}`)
// 200 = kabul edildi · 202 = kabul edildi, anahtar dogrulamasi bekliyor
// 403 = anahtar dosyasi bulunamadi/yanlis · 422 = URL'ler host ile uyusmuyor
if (gonder.status === 200 || gonder.status === 202) {
  console.log(`YESIL — ${urlList.length} URL bildirildi.`)
  console.log('Dogrulama: Bing Webmaster Tools > IndexNow sekmesinde sayi > 0 olmali (Recep bakar).')
  process.exit(0)
}
console.error('KIRMIZI — bildirim kabul edilmedi. 403 ise anahtar dosyasi yayinda degil:')
console.error(`  ${site}/${key}.txt icerigi tam olarak anahtar olmali.`)
process.exit(1)
