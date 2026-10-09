#!/usr/bin/env node
/**
 * ÜRÜN AÇIKLAMASINDA TEK KELİME DÜZELTMESİ — `description_i18n` (REC-212, 2026-09-10)
 *
 * ── NİÇİN VAR
 * Teknik veri düzeltildiğinde (ör. `ip_rating` IPX5 → IP45) aynı değeri ANLATAN açıklama
 * metni eski kalırsa, müşteri **aynı sayfada iki farklı değer** görür: tabloda IP45,
 * paragrafta IPX5. Bu bir vaat bütünlüğü ihlalidir.
 *
 * ── ⛔KAPSAM KASITLI OLARAK DAR: TEK KELİME, TAM EŞLEŞME
 * Betik metni YENİDEN YAZMAZ, **tek bir dizgeyi** değiştirir. Eski dizge metinde tam
 * olarak bulunmuyorsa ya da beklenenden farklı sayıda geçiyorsa **HİÇBİR ŞEY YAZMAZ**.
 * Sebep: müşteriye görünen metin, "iyileştirme" adına yeniden yazılacak yer değildir —
 * neyin değiştiği tek kelimeye kadar belli olmalı ve geri alınabilmelidir.
 *
 * ── İKİ ANAHTAR
 * `--yaz` bayrağı VE `CANLI_YAZIM_ONAYI` ortam değişkeni birlikte gerekir. Biri eksikse
 * kuru koşum. Onay dizgesi kayda geçer (kim, ne zaman, hangi karar).
 *
 * ── KALIP KAPISI (KTL-15, 2026-10-09)
 * `yeni` metin AĞA ÇIKMADAN ÖNCE `urun-aciklama-duzelt-kurallar.mjs` kapısından geçer: iç referans, abartı
 * kalıbı, editör notu (KALKTI/KALKAR/SİLİNİR…), biçim artığı, EN planda Türkçe harf (P1–P3e). Kapı kırmızıysa
 * HİÇBİR ŞEY okunmaz, HİÇBİR ŞEY yazılmaz, çıkış 1 — `--yaz` olsa bile. `--kapi-yalniz`: yalnız kapı, ağ/anahtar yok.
 *
 * KOŞUM: node urun-aciklama-duzelt.mjs --plan <json> --url <URL> --key <KEY> [--yaz] [--out <dizin>]
 *        node urun-aciklama-duzelt.mjs --plan <json> --kapi-yalniz
 * Çıkış: 0 geçti · 1 kalıp kapısı kırmızı / yazım hatası · 2 ÖLÇÜLEMEDİ (plan şeması, ağ; fail-closed).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

import { planKapisi, sonucBicimBozuklugu } from './urun-aciklama-duzelt-kurallar.mjs'

const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d }
const PLAN = arg('plan'), URL_ = arg('url'), KEY = arg('key'), OUT = arg('out', '.')
const YAZ = process.argv.includes('--yaz')
const KAPI_YALNIZ = process.argv.includes('--kapi-yalniz')
const ONAY = process.env.CANLI_YAZIM_ONAYI || ''

if (!PLAN || (!KAPI_YALNIZ && (!URL_ || !KEY))) {
  console.error('kullanım: --plan <json> --url <URL> --key <KEY> [--yaz] [--out <dizin>]  |  --plan <json> --kapi-yalniz')
  process.exit(2)
}
let plan
try { plan = JSON.parse(readFileSync(PLAN, 'utf8')) } catch (e) {
  console.error(`ÖLÇÜLEMEDİ — plan okunamadı ya da JSON değil: ${PLAN} (${e.message})`); process.exit(2)
}

const kapi = planKapisi(plan)
if (kapi.semaHatalari.length) {
  console.error('ÖLÇÜLEMEDİ — plan şeması geçersiz:')
  for (const h of kapi.semaHatalari) console.error(`   ${h}`)
  process.exit(2)
}
console.log('KALIP KAPISI (yeni metin, ağdan önce):')
for (const k of kapi.kurallar) {
  const e = k.ok === true ? 'GEÇTİ ' : k.ok === false ? 'GEÇMEDİ' : '  -   '
  console.log(`   ${k.kural.padEnd(3)} ${k.ad.padEnd(14)} ${e} ${k.ayrinti}`.trimEnd())
}
if (!kapi.gecti) {
  console.error('⛔ KALIP KAPISI KIRMIZI — hiçbir şey okunmadı, hiçbir şey yazılmadı.'); process.exit(1)
}
if (KAPI_YALNIZ) { console.log('KAPI TEMİZ — ağa çıkılmadı (--kapi-yalniz).'); process.exit(0) }
console.log('')
const { eski, yeni, diller, skus } = plan

const rest = async (p, method = 'GET', body) => {
  const r = await fetch(`${URL_}/rest/v1/${p}`, {
    method,
    headers: { apikey: KEY, authorization: `Bearer ${KEY}`, 'content-type': 'application/json',
      prefer: 'return=representation' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const t = await r.text()
  if (!r.ok) { console.error(`DB HATA ${r.status} ${method} ${p}: ${t.slice(0, 300)}`); process.exit(1) }
  return t ? JSON.parse(t) : []
}

const liste = skus.map(s => `"${s}"`).join(',')
const urunler = await rest(`products?sku=in.(${liste})&deleted_at=is.null&select=id,sku,name,description_i18n&order=sku`)
if (urunler.length !== skus.length) {
  console.error(`ÖLÇÜLEMEDİ — istenen ${skus.length} ürün, dönen ${urunler.length}`); process.exit(2)
}

console.log(`PLAN: "${eski}" → "${yeni}"  ·  diller: ${diller.join(', ')}  ·  ${skus.length} ürün\n`)
const degisecek = []
let atlanan = 0
let bicimRed = 0
for (const u of urunler) {
  const yeniNesne = { ...(u.description_i18n || {}) }
  const satir = []
  for (const d of diller) {
    const metin = yeniNesne[d]
    if (typeof metin !== 'string') { satir.push(`${d}: METİN YOK`); atlanan++; continue }
    const adet = metin.split(eski).length - 1
    if (adet !== 1) {
      // 0 = zaten düzeltilmiş ya da hiç yoktu · >1 = metin beklenenden farklı, ELLE bakılır
      satir.push(`${d}: ${adet} kez geçiyor — ATLANDI`)
      atlanan++
      continue
    }
    const sonuc = metin.split(eski).join(yeni)
    const bozuk = sonucBicimBozuklugu(metin, sonuc)   // P4: değişimin KENDİ yarattığı biçim bozukluğu
    if (bozuk.length) { satir.push(`${d}: SONUÇ BİÇİMİ BOZUK (${bozuk.join(', ')}) — RED`); bicimRed++; continue }
    yeniNesne[d] = sonuc
    satir.push(`${d}: 1 → değişecek`)
  }
  const fark = diller.some(d => (u.description_i18n || {})[d] !== yeniNesne[d])
  console.log(`  ${u.sku}  ${u.name}`)
  for (const s of satir) console.log(`      ${s}`)
  if (fark) degisecek.push({ id: u.id, sku: u.sku, onceki: u.description_i18n, sonraki: yeniNesne })
}

if (bicimRed) {
  console.error(`\n⛔ P4 SONUÇ BİÇİMİ KIRMIZI — ${bicimRed} alan; plan metni bozar, hiçbir şey yazılmadı.`); process.exit(1)
}
console.log(`\nÖZET: değişecek ${degisecek.length} ürün · atlanan alan ${atlanan}`)
if (!degisecek.length) { console.log('Değişecek bir şey yok — çıkılıyor.'); process.exit(0) }

if (!YAZ || !ONAY) {
  console.log('\nKURU KOŞUM — hiçbir şey yazılmadı.')
  console.log(`  --yaz bayrağı: ${YAZ ? 'VAR' : 'YOK'} · CANLI_YAZIM_ONAYI: ${ONAY ? 'VAR' : 'YOK'}`)
  console.log('  İkisi de gerekli. Bu metin MÜŞTERİYE GÖRÜNÜR.')
  process.exit(0)
}

// Geri alma envanteri ÖNCE yazılır — yazım yarıda kalırsa bile eski metinler elde kalsın.
mkdirSync(OUT, { recursive: true })
const damga = new Date().toISOString().replace(/[:.]/g, '-')
const envYol = join(OUT, `aciklama-${damga}.json`)
writeFileSync(envYol, JSON.stringify({ onay: ONAY, plan, kayitlar: degisecek }, null, 2), 'utf8')
console.log(`\nENVANTER: ${envYol}`)

let yazilan = 0
for (const k of degisecek) {
  await rest(`products?id=eq.${k.id}`, 'PATCH', { description_i18n: k.sonraki })
  yazilan++
}
console.log(`YAZIM TAMAM: ${yazilan}/${degisecek.length} ürün`)
if (yazilan !== degisecek.length) process.exit(1)
