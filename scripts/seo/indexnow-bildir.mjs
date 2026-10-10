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
 *   --yalniz-yeni <eski-adresler.json>   YENİ ADRES KİPİ (karar 327, yayın günü runbook'u §5.0): bildirilecek küme =
 *            canlı site haritası − taban site haritası. Taban dosyası yayından ÖNCE
 *            `node scripts/seo/adres-yayin-denetim.mjs --taban <site> --cikti <klasör>` ile alınan `eski-adresler.json`dur.
 *            --yalniz-degismeyen'in TERSİ: orada yayında değişmeyen adresler gider (Bing'e zaten bildirildi), burada
 *            yalnız yeni/değişen TR adresler gider. Bayrak (ADRES_SEMASI_K3B) AÇIK olmalıdır (kapıyı aşmaz). Şu durumlarda DURUR:
 *            taban boş/bozuk · yeni harita tabanla hiç kesişmiyor · yeni adres yok (taban yayından sonra alınmış) · yeni
 *            kümede TR dışı adres var · küme YENI_AZAMI'yı aşıyor. Gönderimden ÖNCE her adres GET ile sınanır (200 ve
 *            kanonik adres kendisi). Karşılaştırılacak sayı: `bildirilecek URL (yeni/degisen TR): N` satırı.
 *            --yalniz-degismeyen ile BİRLİKTE kullanılamaz.
 *
 * ÖN KOŞUL: `https://<site>/<anahtar>.txt` yayında olmalı ve içeriği anahtarın KENDİSİ
 * olmalı. Yoksa IndexNow 403 döner. Middleware'de kök seviyedeki `.txt` dosyaları dil
 * önekinden muaftır (REC-127) — bu muafiyet olmadan dosya `/tr/<anahtar>.txt`ye
 * yönlendirilir ve doğrulama BAŞARISIZ olur.
 */

import { readFileSync } from 'node:fs'

import {
  degismeyenleriAyir,
  kanonikAdres,
  suzgecliKapi,
  tabanAdresleriniOku,
  yayinKapisi,
  yeniKipPlani,
} from './yayin-kapisi.mjs'

const ENDPOINT = 'https://api.indexnow.org/indexnow'
const MAX_URL = 10_000

function arg(ad, varsayilan) {
  const i = process.argv.indexOf(ad)
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : varsayilan
}

const site = (arg('--site', 'https://venthub.com.tr')).replace(/\/+$/, '')
const kuru = process.argv.includes('--kuru')
const yalnizDegismeyen = process.argv.includes('--yalniz-degismeyen')
const yalnizYeni = process.argv.includes('--yalniz-yeni')
const yeniDosya = yalnizYeni ? arg('--yalniz-yeni', '') : ''

// Kip bayrakları ağdan, anahtardan ve kapıdan ÖNCE doğrulanır: belirsiz kombinasyon sessizce bir kipe düşmesin.
if (yalnizYeni && yalnizDegismeyen) {
  console.error('DURDU: --yalniz-yeni ile --yalniz-degismeyen birlikte kullanilamaz (zit yonler: biri yeni/degisen, oteki degismeyen adresleri bildirir).')
  process.exit(1)
}
if (yalnizYeni && (yeniDosya === '' || yeniDosya.startsWith('--'))) {
  console.error('DURDU: --yalniz-yeni bir taban dosyasi ister: --yalniz-yeni <eski-adresler.json> (adres-yayin-denetim.mjs ciktisi, runbook §2.3).')
  process.exit(1)
}

// YAYIN KAPISI (K4 / karar 164 A): adres şeması bayrağı KAPALIYKEN toplu bildirim REDDEDİLİR — canlı
// sitemap adreslerinin çoğu yayında değişecek. `--kuru` da reddedilir (kuru koşum "hazır" izlenimi verir,
// yanlış zamanda gerçek koşuma götürür). Ağ ve anahtar kontrolünden ÖNCE çalışır.
// Süzgeçli kipte (`--yalniz-degismeyen`) kapı sitemap okunup süzüldükten SONRA, kalan adresler üzerinde çalışır.
// Yeni adres kipi (`--yalniz-yeni`) bu kapıdan GEÇER: yeni adresler yalnız bayrak açıkken vardır.
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

// Taban site haritası (yeni adres kipi): okunamayan/boş/bozuk taban "bütün harita yeni" demektir → DUR.
let eskiAdresler = []
if (yalnizYeni) {
  try {
    eskiAdresler = tabanAdresleriniOku(readFileSync(yeniDosya, 'utf8'))
  } catch (e) {
    console.error(`DURDU: taban okunamadi (${yeniDosya}): ${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  }
  console.log(`taban okundu: ${eskiAdresler.length} adres (${yeniDosya})`)
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

/**
 * Gönderim geri alınamayan dış eylem: bildirilecek her adres site host'una ait olmalı (aksi hâlde IndexNow 422 verir),
 * canlıda 200 ve kanonik adresi KENDİSİ olmalı. Yönlendirme TAKİP EDİLMEZ: 308 ile başka adrese giden adres, hedefin
 * kanoniği tesadüfen eşleşse bile sorundur. Sorun varsa listeler ve DURUR.
 * @param {string[]} liste
 * @param {string} etiket başarı satırındaki ad ("kalan", "yeni")
 */
async function gondermedenOnceDogrula(liste, etiket) {
  const yabanci = liste.filter((u) => new URL(u).host !== new URL(site).host)
  if (yabanci.length > 0) {
    console.error(`DURDU: ${yabanci.length} adres ${new URL(site).host} disinda: ${yabanci.slice(0, 3).join(', ')}`)
    process.exit(1)
  }
  const sorunlu = []
  for (const u of liste) {
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
  console.log(`${etiket} ${liste.length} adresin hepsi 200 ve kanonik = kendisi.`)
}

let urlList = sitemapAdresleri
if (yalnizYeni) {
  const plan = yeniKipPlani(featuresMetni, sitemapAdresleri, eskiAdresler)
  if (!plan.izin) {
    console.error(`DURDU: ${plan.sebep}`)
    process.exit(1)
  }
  console.log(`yeni kip: taban ${eskiAdresler.length} adres · yeni harita ${sitemapAdresleri.length} adres · ayni (atildi): ${plan.ayni.length}`)
  console.log(`bildirilecek URL (yeni/degisen TR): ${plan.yeni.length}`)
  await gondermedenOnceDogrula(plan.yeni, 'yeni')
  urlList = plan.yeni
  console.log('bildirilecek adresler (tamami):')
  for (const u of urlList) console.log('  ' + u)
} else if (yalnizDegismeyen) {
  const { kalan, atilan } = degismeyenleriAyir(sitemapAdresleri)
  console.log(`suzgec: yayinda DEGISECEK tur (atildi): ${atilan.length} · kalan (degismeyen): ${kalan.length}`)
  const kapi = suzgecliKapi(featuresMetni, kalan)
  if (!kapi.izin) {
    console.error(`DURDU: ${kapi.sebep}`)
    process.exit(1)
  }
  await gondermedenOnceDogrula(kalan, 'kalan')
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
