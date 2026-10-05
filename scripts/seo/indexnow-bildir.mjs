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
 *   --yalniz-degismeyen   SÜZGEÇLİ KİP (karar 249 daraltması): sitemap'ten yayında DEĞİŞECEK türleri (ürün,
 *            kategori, marka ağaçları) atar, yalnız kalanları bildirir. Bayrak kapalıyken tek geçerli kip budur;
 *            süzgeçsiz kip kapıdan geçemez. Bu kipte gönderimden ÖNCE her kalan adres GET ile sınanır: 200 ve
 *            kanonik adres kendisi değilse DURUR. --kuru ile birlikte atılanları ve kalanların tamamını basar.
 *
 * ÖN KOŞUL: `https://<site>/<anahtar>.txt` yayında olmalı ve içeriği anahtarın KENDİSİ
 * olmalı. Yoksa IndexNow 403 döner. Middleware'de kök seviyedeki `.txt` dosyaları dil
 * önekinden muaftır (REC-127) — bu muafiyet olmadan dosya `/tr/<anahtar>.txt`ye
 * yönlendirilir ve doğrulama BAŞARISIZ olur.
 */

import { readFileSync } from 'node:fs'

import { degismeyenleriAyir, kanonikAdres, suzgecliKapi, yayinKapisi } from './yayin-kapisi.mjs'

const ENDPOINT = 'https://api.indexnow.org/indexnow'
const MAX_URL = 10_000

function arg(ad, varsayilan) {
  const i = process.argv.indexOf(ad)
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : varsayilan
}

const site = (arg('--site', 'https://venthub.com.tr')).replace(/\/+$/, '')
const kuru = process.argv.includes('--kuru')
const yalnizDegismeyen = process.argv.includes('--yalniz-degismeyen')

// YAYIN KAPISI (K4 / karar 164 A): adres şeması bayrağı KAPALIYKEN toplu bildirim REDDEDİLİR — canlı
// sitemap adreslerinin çoğu yayında değişecek. `--kuru` da reddedilir (kuru koşum "hazır" izlenimi verir,
// yanlış zamanda gerçek koşuma götürür). Ağ ve anahtar kontrolünden ÖNCE çalışır.
// Süzgeçli kipte (`--yalniz-degismeyen`) kapı sitemap okunup süzüldükten SONRA, kalan adresler üzerinde çalışır.
const featuresMetni = readFileSync(new URL('../../src/config/features.ts', import.meta.url), 'utf8')
if (!yalnizDegismeyen) {
  const kapi = yayinKapisi(featuresMetni)
  if (!kapi.izin) {
    console.error(`DURDU: ${kapi.sebep}`)
    process.exit(1)
  }
}

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

const sitemapAdresleri = [...new Set([...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]))]

console.log(`bulunan URL: ${sitemapAdresleri.length}`)
if (sitemapAdresleri.length === 0) {
  console.error('DURDU: sitemap bos okundu — bos kumeyi bildirmek olcum degildir.')
  process.exit(1)
}

let urlList = sitemapAdresleri
if (yalnizDegismeyen) {
  const { kalan, atilan } = degismeyenleriAyir(sitemapAdresleri)
  console.log(`suzgec: yayinda DEGISECEK tur (atildi): ${atilan.length} · kalan (degismeyen): ${kalan.length}`)
  const kapi = suzgecliKapi(featuresMetni, kalan)
  if (!kapi.izin) {
    console.error(`DURDU: ${kapi.sebep}`)
    process.exit(1)
  }
  // Adres başka bir host'a aitse IndexNow 422 verir; sessizce göndermek yerine DUR.
  const yabanci = kalan.filter((u) => new URL(u).host !== new URL(site).host)
  if (yabanci.length > 0) {
    console.error(`DURDU: ${yabanci.length} adres ${new URL(site).host} disinda: ${yabanci.slice(0, 3).join(', ')}`)
    process.exit(1)
  }
  // Gönderim geri alınamayan dış eylem: her adres canlıda 200 ve kanonik adresi KENDİSİ olmalı.
  const sorunlu = []
  for (const u of kalan) {
    // Yönlendirme TAKİP EDİLMEZ: 308 ile başka adrese giden adres, hedefin kanoniği tesadüfen eşleşse bile sorundur.
    let durum
    let kanonik = null
    try {
      const r = await fetch(u, {
        headers: { 'user-agent': 'venthub-indexnow-script' },
        redirect: 'manual',
        signal: AbortSignal.timeout(20_000),
      })
      durum = r.status
      if (r.status === 200) kanonik = kanonikAdres(await r.text())
    } catch (e) {
      durum = `ağ hatası: ${e instanceof Error ? e.message : String(e)}`
    }
    if (durum !== 200 || kanonik !== u) sorunlu.push(`${u} (${durum === 200 ? 'HTTP 200' : durum}, kanonik ${kanonik ?? 'yok'})`)
  }
  if (sorunlu.length > 0) {
    console.error(`DURDU: ${sorunlu.length} adres 200 degil ya da kanonik adresi kendisi degil:`)
    for (const s of sorunlu) console.error('  ' + s)
    process.exit(1)
  }
  console.log(`kalan ${kalan.length} adresin hepsi 200 ve kanonik = kendisi.`)
  urlList = kalan
  console.log('bildirilecek adresler (tamami):')
  for (const u of urlList) console.log('  ' + u)
} else {
  console.log('ilk 10:')
  for (const u of urlList.slice(0, 10)) console.log('  ' + u)
}

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
