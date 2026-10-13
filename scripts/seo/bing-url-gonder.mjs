#!/usr/bin/env node
/**
 * BING URL GÖNDER — Bing Webmaster API `SubmitUrlBatch` + `GetUrlSubmissionQuota` (SEO-47; Y2.1 zincirinin 4. adımı).
 * Cetvel: docs/standards/yayin-gorunurluk-denetim-standard.md (Y2.1), docs/standards/dizin-sistemleri-standard.md.
 *
 * NİÇİN AYRI BETİK: `bing-webmaster-oku.mjs` SALT OKUMA sözleşmesindedir (başlık, araç envanteri, INV-BING-OKU testleri).
 * Gönderim dış dünyaya yazan bir eylemdir; ayrı dosya, ayrı kapı, ayrı test. Anahtar okuma, maskeleme ve yanıt çözme
 * oradan içe aktarılır (tek kaynak).
 *
 * Kullanım:
 *   node scripts/seo/bing-url-gonder.mjs --kota [--site https://venthub.com.tr/]
 *       Yalnız GetUrlSubmissionQuota okur ve yazar (gönderim YOK).
 *   node scripts/seo/bing-url-gonder.mjs --gonder <adres,adres,... | liste.txt> [--kuru] [--cikti <depo-dışı klasör>]
 *       Liste ÖNCELİK SIRASINDADIR: kota yetmezse sondakiler kalır. Önce kota okunur, sonra her adres GET ile sınanır
 *       (200 ve kanonik adres kendisi), sonra kota kadarı SubmitUrlBatch ile gönderilir. `--kuru`: kota + sınama yapılır,
 *       gönderim YAPILMAZ.
 *
 * Belge (2026-10-13 okundu, learn.microsoft.com/en-us/dotnet/api/microsoft.bing.webmaster.api.interfaces.iwebmasterapi):
 *   SubmitUrlBatch: POST /webmaster/api.svc/json/SubmitUrlBatch?apikey=…, gövde {"siteUrl","urlList":[…]}; "max number of
 *   urls that can be submitted in a batch is 500 unless it exceeds the available quota".
 *   GetUrlSubmissionQuota: GET …?siteUrl=…&apikey=…, yanıt {"d":{"DailyQuota":n,"MonthlyQuota":m}}.
 *
 * ⛔ ANAHTAR yalnız dosyadan okunur (bing-webmaster-oku.mjs ile aynı kural); hiçbir çıktıya, hataya, JSON'a yazılmaz.
 * "KÖR KAPI YOK": kota ölçülemezse HİÇBİR ŞEY gönderilmez (fail-closed); boş yanıt sıfır sayılmaz.
 * Çıkış: 0 hepsi gönderildi (ya da --kota okundu) · 1 hata / kota ölçülemedi / sınamayı geçmeyen adres / gönderim hatası ·
 *        2 araç koşmadı (bozuk girdi, anahtar yok) · 3 kota yetmedi, KALAN adresler var (ertesi gün ilk iş).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { adresKur, anahtarDosyasiYolu, anahtarOku, depoIcindeMi, maskele, yanitCoz } from './bing-webmaster-oku.mjs'
import { kanonikAdres } from './yayin-kapisi.mjs'

/** Belge: tek toplu istekte en çok 500 adres (kotayı aşmamak şartıyla). */
export const TOPLU_AZAMI = 500
const VARSAYILAN_SITE = 'https://venthub.com.tr/'

/** GetUrlSubmissionQuota çağrısının sonucunu sayıya çevirir. Eksik/yanlış tipli alan OLCULEMEDI'dir, sıfır DEĞİL. */
export function kotaCoz(sonuc) {
  if (!sonuc || sonuc.durum !== 'TAMAM') return { durum: sonuc?.durum ?? 'OLCULEMEDI', neden: sonuc?.neden ?? sonuc?.mesaj ?? null }
  const n = sonuc.nesne
  const g = n?.DailyQuota
  const a = n?.MonthlyQuota
  if (!Number.isInteger(g) || !Number.isInteger(a) || g < 0 || a < 0) {
    return { durum: 'OLCULEMEDI', neden: 'DailyQuota/MonthlyQuota tamsayı değil' }
  }
  return { durum: 'TAMAM', gunluk: g, aylik: a }
}

/**
 * Hangi adresler gider, hangisi kalır. Saf işlev. Liste sırası ÖNCELİKTİR. Ölçülemeyen kota hiçbir şey göndermez.
 * Sınır: min(günlük, aylık) — ikisi de "kalan" ise aşırı harcamaz; biri toplam tavansa da güvenli tarafta kalır.
 */
export function gonderimPlani({ adresler, siteUrl, kota, topluAzami = TOPLU_AZAMI }) {
  const host = new URL(siteUrl).host
  const goruldu = new Set()
  const gecerli = []
  const siteDisi = []
  let tekrar = 0
  for (const ham of adresler) {
    const a = String(ham).trim()
    if (!a) continue
    let u
    try { u = new URL(a) } catch { siteDisi.push(a); continue }
    if (u.protocol !== 'https:' || u.host !== host) { siteDisi.push(a); continue }
    if (goruldu.has(u.href)) { tekrar++; continue }
    goruldu.add(u.href)
    gecerli.push(a)
  }
  if (kota.durum !== 'TAMAM') {
    return { izin: false, neden: 'KOTA-OLCULEMEDI', gonderilecek: [], partiler: [], kalan: gecerli, siteDisi, tekrar, kalanKota: null }
  }
  const kalanKota = Math.min(kota.gunluk, kota.aylik)
  const n = Math.max(0, Math.min(gecerli.length, kalanKota))
  const gonderilecek = gecerli.slice(0, n)
  const kalan = gecerli.slice(n)
  const partiler = []
  for (let i = 0; i < gonderilecek.length; i += topluAzami) partiler.push(gonderilecek.slice(i, i + topluAzami))
  const neden = gonderilecek.length > 0 ? null : gecerli.length === 0 ? 'ADRES-YOK' : 'KOTA-DOLU'
  return { izin: gonderilecek.length > 0, neden, gonderilecek, partiler, kalan, siteDisi, tekrar, kalanKota }
}

/** SubmitUrlBatch yanıtı: 200 = kabul edildi (belge örneği `{"d":null}`); gövdesi JSON olmayan 200 YANIT-BOZUK'tur. */
export function gonderYanitiCoz(httpDurum, govdeMetni, anahtar) {
  if (httpDurum === 200) {
    const metin = String(govdeMetni ?? '').trim()
    if (metin === '') return { durum: 'GONDERILDI', http: 200 }
    try { JSON.parse(metin) } catch { return { durum: 'YANIT-BOZUK', http: 200 } }
    return { durum: 'GONDERILDI', http: 200 }
  }
  return yanitCoz(httpDurum, govdeMetni, anahtar)
}

/** Bir adres gönderilebilir mi: GET 200 ve kanonik kendisi. Ağ hatası da "gönderilemez"dir (sessiz geçmez). */
export async function adresDogrula(fetchFn, adres, zamanAsimiMs = 20_000) {
  try {
    const r = await fetchFn(adres, { redirect: 'manual', headers: { 'user-agent': 'venthub-bing-url-gonder' }, signal: AbortSignal.timeout(zamanAsimiMs) })
    if (r.status !== 200) return { adres, tamam: false, sebep: `HTTP ${r.status}` }
    const kanonik = kanonikAdres(await r.text())
    return kanonik === adres ? { adres, tamam: true } : { adres, tamam: false, sebep: `kanonik ${kanonik ?? 'yok'}` }
  } catch (e) {
    return { adres, tamam: false, sebep: `ağ hatası: ${e instanceof Error ? e.message : String(e)}`.slice(0, 160) }
  }
}

async function kotaOku(fetchFn, anahtar, siteUrl) {
  try {
    const r = await fetchFn(adresKur('GetUrlSubmissionQuota', { anahtar, siteUrl }), { headers: { accept: 'application/json' } })
    return kotaCoz(yanitCoz(r.status, await r.text(), anahtar))
  } catch (e) {
    return { durum: 'AG-HATASI', neden: maskele(e?.cause?.code || e?.message || e, anahtar).slice(0, 160) }
  }
}

async function partiGonder(fetchFn, anahtar, siteUrl, parti) {
  try {
    const r = await fetchFn(adresKur('SubmitUrlBatch', { anahtar }), {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8', accept: 'application/json' },
      body: JSON.stringify({ siteUrl, urlList: parti }),
    })
    return { adetAdres: parti.length, ...gonderYanitiCoz(r.status, await r.text(), anahtar) }
  } catch (e) {
    return { adetAdres: parti.length, durum: 'AG-HATASI', mesaj: maskele(e?.cause?.code || e?.message || e, anahtar).slice(0, 160) }
  }
}

/**
 * Tüm akış; ağ enjekte edilir. @returns {{ kotaOnce, kotaSonra, plan, reddedilen, partiler, kuru, kalan }}
 */
export async function gonder({ fetchFn = fetch, anahtar, siteUrl, adresler, kuru = false }) {
  const kotaOnce = await kotaOku(fetchFn, anahtar, siteUrl)
  const plan = gonderimPlani({ adresler, siteUrl, kota: kotaOnce })
  const sonuc = { kotaOnce, kotaSonra: null, plan, reddedilen: [], partiler: [], kuru, kalan: plan.kalan }
  if (!plan.izin) return sonuc
  const gecen = []
  for (const adres of plan.gonderilecek) {
    const d = await adresDogrula(fetchFn, adres)
    if (d.tamam) gecen.push(adres)
    else sonuc.reddedilen.push({ adres: d.adres, sebep: d.sebep })
  }
  if (kuru || gecen.length === 0) return sonuc
  for (let i = 0; i < gecen.length; i += TOPLU_AZAMI) {
    sonuc.partiler.push(await partiGonder(fetchFn, anahtar, siteUrl, gecen.slice(i, i + TOPLU_AZAMI)))
  }
  sonuc.kotaSonra = await kotaOku(fetchFn, anahtar, siteUrl)
  return sonuc
}

/** Çıkış kodu sözleşmesi (başlıkta). `kota` = yalnız --kota kipinde kota sonucu. */
export function cikisKodu(sonuc) {
  if (sonuc.kotaOnce.durum !== 'TAMAM') return 1
  if (sonuc.reddedilen.length > 0) return 1
  if (sonuc.partiler.some((p) => p.durum !== 'GONDERILDI')) return 1
  if (sonuc.kalan.length > 0) return 3
  return 0
}

function adresListesiOku(deger) {
  return /\.txt$/i.test(deger)
    ? readFileSync(deger, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
    : deger.split(',').map((s) => s.trim()).filter(Boolean)
}

async function calistir() {
  const arg = process.argv.slice(2)
  const deger = (b) => { const i = arg.indexOf(b); return i >= 0 ? arg[i + 1] : undefined }
  const siteUrl = deger('--site') || VARSAYILAN_SITE
  const kotaKipi = arg.includes('--kota')
  const gonderDegeri = deger('--gonder')
  const kuru = arg.includes('--kuru')
  const cikti = deger('--cikti')
  if (!kotaKipi && !gonderDegeri) {
    console.error('HATA: --kota ya da --gonder <adres,adres,... | liste.txt> verilmeli')
    process.exit(2)
  }
  if (cikti && depoIcindeMi(join(resolve(cikti), 'x'))) {
    console.error('HATA: --cikti bir git deposunun içinde (repo PUBLIC); depo dışı klasör ver')
    process.exit(2)
  }
  const k = anahtarOku(anahtarDosyasiYolu())
  if (k.hata) {
    console.error(`HATA: ${k.hata} (BING_WEBMASTER_ANAHTAR_DOSYASI ya da varsayılan dosya; 32 onaltılı hane beklenir)`)
    process.exit(2)
  }
  if (kotaKipi && !gonderDegeri) {
    const kota = await kotaOku(fetch, k.anahtar, siteUrl)
    if (kota.durum === 'TAMAM') console.log(`GetUrlSubmissionQuota: DailyQuota ${kota.gunluk} · MonthlyQuota ${kota.aylik}`)
    else console.log(`GetUrlSubmissionQuota: ${kota.durum}${kota.neden ? ` (${kota.neden})` : ''}`)
    process.exit(kota.durum === 'TAMAM' ? 0 : 1)
  }
  let adresler
  try { adresler = adresListesiOku(gonderDegeri) } catch { console.error(`HATA: liste okunamadı: ${gonderDegeri}`); process.exit(2) }
  if (adresler.length === 0) { console.error('HATA: adres listesi boş'); process.exit(2) }
  const alinma = new Date().toISOString()
  const s = await gonder({ anahtar: k.anahtar, siteUrl, adresler, kuru })
  const k1 = s.kotaOnce
  console.log(`kota önce: ${k1.durum === 'TAMAM' ? `DailyQuota ${k1.gunluk} · MonthlyQuota ${k1.aylik}` : `${k1.durum}${k1.neden ? ` (${k1.neden})` : ''}`}`)
  if (!s.plan.izin) console.log(`gönderim yok: ${s.plan.neden}`)
  console.log(`adres: ${adresler.length} · sitede geçerli: ${s.plan.gonderilecek.length + s.plan.kalan.length} · site dışı/bozuk: ${s.plan.siteDisi.length} · tekrar: ${s.plan.tekrar}`)
  for (const r of s.reddedilen) console.log(`SINAMA-KIRMIZI ${r.adres} (${r.sebep})`)
  s.partiler.forEach((p, i) => console.log(`parti ${i + 1}: ${p.adetAdres} adres · ${p.durum}${p.http ? ` · http ${p.http}` : ''}${p.mesaj ? ` · ${p.mesaj}` : ''}`))
  if (kuru) console.log(`KURU: ${s.plan.gonderilecek.length - s.reddedilen.length} adres gönderilirdi, gönderim yapılmadı`)
  if (s.kotaSonra) console.log(`kota sonra: ${s.kotaSonra.durum === 'TAMAM' ? `DailyQuota ${s.kotaSonra.gunluk} · MonthlyQuota ${s.kotaSonra.aylik}` : s.kotaSonra.durum}`)
  if (s.kalan.length > 0) console.log(`KALAN ${s.kalan.length} adres (kota yetmedi/ölçülemedi), ertesi gün ilk iş:\n${s.kalan.join('\n')}`)
  if (cikti) {
    mkdirSync(resolve(cikti), { recursive: true })
    const dosya = join(resolve(cikti), `bing-url-gonder-${alinma.slice(0, 10)}.json`)
    writeFileSync(dosya, JSON.stringify({ alinma, site: siteUrl, kuru, ...s }, null, 1))
    console.log(`çıktı: ${dosya}`)
  }
  process.exit(cikisKodu(s))
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await calistir()
