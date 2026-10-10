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
 * Değişimin SONUCU da sınanır (P4): çift boşluk, noktalamadan önce boşluk… eski metinde olmayan bir bozukluk → çıkış 1.
 *
 * ── EŞZAMANLILIK, GERİ OKUMA, İKİNCİ KOŞUM (KTL-15 adım 2)
 * Aynı ürünün TR ve EN planları (ya da başka bir yazıcı) araya girerse bir plan ötekini EZMESİN diye PATCH
 * `updated_at=eq.<okunan>` koşulludur (`products_set_updated_at` tetiği her güncellemede yeniler). 0 satır dönerse
 * satır yeniden okunur: değişmişse plan TAZE metne yeniden uygulanır ve 1 kez denenir (yine 0 → çıkış 1); DEĞİŞMEMİŞSE
 * sebep yarış değildir (yetki/RLS) → çıkış 1. Yazdıktan sonra satır canlıdan geri okunur ve beklenen JSON ile anahtar
 * sırasından bağımsız karşılaştırılır; uyuşmazlık (PATCH'in sessizce yutulması dahil) → çıkış 1.
 * İkinci koşum zararsızdır: yeni metin alanda tam 1 kez ve eski yoksa satır "ZATEN UYGULANMIŞ" der, hiçbir şey yazılmaz.
 * Yarışta değişen satırın geri alma kaydı envanterin `yarislar` bölümüne yazılır.
 *
 * KOŞUM: node urun-aciklama-duzelt.mjs --plan <json> --url <URL> --key <KEY> [--yaz] [--out <dizin>]
 *        node urun-aciklama-duzelt.mjs --plan <json> --kapi-yalniz
 * Çıkış: 0 geçti · 1 kalıp kapısı kırmızı / sonuç biçimi / yazım-geri okuma hatası · 2 ÖLÇÜLEMEDİ (plan şeması, ağ; fail-closed).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

import { kanonikEsit } from './aile-blok-duzelt-kurallar.mjs'
import { planKapisi, urunPlani } from './urun-aciklama-duzelt-kurallar.mjs'

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
  let r
  try {
    r = await fetch(`${URL_}/rest/v1/${p}`, {
      method,
      headers: { apikey: KEY, authorization: `Bearer ${KEY}`, 'content-type': 'application/json',
        prefer: 'return=representation' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30000),
    })
  } catch (e) {
    // Ağ yok / zaman aşımı: yakalanmamış hata değil, fail-closed ÖLÇÜLEMEDİ. PATCH'te yazım durumu BELİRSİZDİR.
    console.error(`ÖLÇÜLEMEDİ — ağ hatası ${method} ${p.slice(0, 70)}: ${e?.cause?.code ?? e?.name ?? 'bilinmiyor'}` +
      (method === 'PATCH' ? ' — YAZIM DURUMU BELİRSİZ: canlıyı oku, envantere bak' : ''))
    process.exit(2)
  }
  const t = await r.text()
  if (!r.ok) { console.error(`DB HATA ${r.status} ${method} ${p}: ${t.slice(0, 300)}`); process.exit(1) }
  return t ? JSON.parse(t) : []
}
const SECIM = 'id,sku,name,updated_at,description_i18n'
/** Koşullu PATCH yolu: updated_at KODLANIR ("+" kodlanmazsa PostgREST'te boşluk okunur ve eşleşme olmaz). */
const patchYolu = (id, updatedAt) => `products?id=eq.${id}&updated_at=eq.${encodeURIComponent(updatedAt)}`

const liste = skus.map(s => `"${s}"`).join(',')
const urunler = await rest(`products?sku=in.(${liste})&deleted_at=is.null&select=${SECIM}&order=sku`)
if (urunler.length !== skus.length) {
  console.error(`ÖLÇÜLEMEDİ — istenen ${skus.length} ürün, dönen ${urunler.length}`); process.exit(2)
}

console.log(`PLAN: "${eski}" → "${yeni}"  ·  diller: ${diller.join(', ')}  ·  ${skus.length} ürün\n`)
const degisecek = []
let atlanan = 0
let zaten = 0
let bicimRed = 0
for (const u of urunler) {
  const p = urunPlani(u, plan)
  console.log(`  ${u.sku}  ${u.name}`)
  for (const s of p.satirlar) console.log(`      ${s}`)
  atlanan += p.atlanan; zaten += p.zaten; bicimRed += p.bicimRed
  if (p.degisti) degisecek.push({ id: u.id, sku: u.sku, updated_at: u.updated_at, onceki: u.description_i18n, sonraki: p.sonraki })
}

if (bicimRed) {
  console.error(`\n⛔ P4 SONUÇ BİÇİMİ KIRMIZI — ${bicimRed} alan; plan metni bozar, hiçbir şey yazılmadı.`); process.exit(1)
}
console.log(`\nÖZET: değişecek ${degisecek.length} ürün · atlanan alan ${atlanan} · zaten uygulanmış ${zaten}`)
if (!degisecek.length) {
  console.log(zaten > 0 && atlanan === 0 ? 'Değişecek bir şey yok — hepsi zaten uygulanmış.' : 'Değişecek bir şey yok — çıkılıyor.')
  process.exit(0)
}

if (!YAZ || !ONAY) {
  console.log('\nKURU KOŞUM — hiçbir şey yazılmadı.')
  console.log(`  --yaz bayrağı: ${YAZ ? 'VAR' : 'YOK'} · CANLI_YAZIM_ONAYI: ${ONAY ? 'VAR' : 'YOK'}`)
  console.log('  İkisi de gerekli. Bu metin MÜŞTERİYE GÖRÜNÜR.')
  process.exit(0)
}
if (degisecek.some(k => typeof k.updated_at !== 'string' || !k.updated_at)) {
  console.error('ÖLÇÜLEMEDİ — updated_at okunamadı: koşullu PATCH kurulamaz, hiçbir şey yazılmadı.'); process.exit(2)
}

// Geri alma envanteri ÖNCE yazılır — yazım yarıda kalırsa bile eski metinler elde kalsın.
mkdirSync(OUT, { recursive: true })
const damga = new Date().toISOString().replace(/[:.]/g, '-')
const envYol = join(OUT, `aciklama-${damga}.json`)
const yarislar = []
const envanteriYaz = () => writeFileSync(envYol, JSON.stringify({ onay: ONAY, plan, kayitlar: degisecek, yarislar }, null, 2), 'utf8')
envanteriYaz()
console.log(`\nENVANTER: ${envYol}`)

let yazilan = 0
let zatenYaris = 0
let yeniden = 0
for (const k of degisecek) {
  let hedef = { updated_at: k.updated_at, sonraki: k.sonraki }
  let donen = await rest(patchYolu(k.id, hedef.updated_at), 'PATCH', { description_i18n: hedef.sonraki })
  if (donen.length === 0) {
    // 0 satır: ya başkası satırı değiştirdi (yarış) ya da yazma yetkisi yok (RLS yazmayı sessizce boşaltır).
    const taze = await rest(`products?id=eq.${k.id}&deleted_at=is.null&select=${SECIM}`)
    if (taze.length !== 1) { console.error(`⛔ KIRMIZI: ${k.sku} PATCH 0 satır güncelledi ve satır yeniden okunamadı.`); process.exit(1) }
    if (taze[0].updated_at === k.updated_at) {
      console.error(`⛔ KIRMIZI: ${k.sku} PATCH 0 satır güncelledi ama satır DEĞİŞMEMİŞ — yarış değil, yetki/RLS şüphesi.`); process.exit(1)
    }
    const p = urunPlani(taze[0], plan)
    if (p.bicimRed) { console.error(`⛔ KIRMIZI: ${k.sku} yarıştan sonra taze metinde sonuç biçimi bozuk.`); process.exit(1) }
    yarislar.push({ sku: k.sku, id: k.id, onceki: taze[0].description_i18n, sonraki: p.sonraki })
    envanteriYaz()
    if (!p.degisti) {
      console.log(`  ${k.sku}: yarış sırasında satır değişti ve değişiklik zaten uygulanmış — yazılmadı`)
      zatenYaris++
      continue
    }
    console.log(`  ${k.sku}: yarış (satır araya girilmiş) — taze metne yeniden uygulanıyor`)
    hedef = { updated_at: taze[0].updated_at, sonraki: p.sonraki }
    donen = await rest(patchYolu(k.id, hedef.updated_at), 'PATCH', { description_i18n: hedef.sonraki })
    if (donen.length === 0) { console.error(`⛔ KIRMIZI: ${k.sku} yeniden denemede de 0 satır güncellendi.`); process.exit(1) }
    yeniden++
  }
  // Geri okuma: PATCH'in yanıtına DEĞİL, canlıdaki satıra bak (kanonik JSON eşitliği; jsonb anahtar sırasını bozabilir).
  const oku = await rest(`products?id=eq.${k.id}&select=sku,description_i18n`)
  if (oku.length !== 1 || !kanonikEsit(oku[0].description_i18n, hedef.sonraki)) {
    console.error(`⛔ KIRMIZI: ${k.sku} geri okuma beklenenden FARKLI — yazım kalıcı olmamış ya da başka yazar araya girmiş.`); process.exit(1)
  }
  yazilan++
}
console.log(`YAZIM TAMAM: ${yazilan}/${degisecek.length} ürün · geri okuma: hepsi beklenen` +
  (yeniden ? ` · yarış yeniden denemesi: ${yeniden}` : '') + (zatenYaris ? ` · yarışta zaten uygulanmış: ${zatenYaris}` : ''))
if (yazilan + zatenYaris !== degisecek.length) process.exit(1)
