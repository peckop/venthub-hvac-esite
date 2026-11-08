#!/usr/bin/env node
/**
 * DİZİN TAKİP — hangi adrese hangi motorda ne zaman istek atıldı, ne bekleniyor, ne yapılacak (Kanban SEO dizin-takip kartı,
 * 6 Kasım 2026). Cetvel: docs/standards/dizin-sistemleri-standard.md (D7 takip), yayin-gorunurluk-denetim-standard.md Y2/Y2.1.
 *
 * NİÇİN: kayıtlar dağınıktı (Google elle istek defteri 4 Kasım'a kadar tek satır, Bing gönderim çıktıları ayrı klasörlerde,
 * Yandex yalnız durum dosyasında); her seferinde "hangi adres hangi motorda taranmamış" baştan ölçülüyor, 5 Kasım Google elle
 * istek sırası kimse görmediği için kaçtı. Burada TEK hareket defteri ve her adres×motor için tek karar vardır.
 * KURAL: istek atmadan önce bu betiğin kararına bakılır; karar YAP ya da TEKRAR değilse o adrese istek atılmaz.
 *
 * Karar (adres × motor): lastmod = sitemap lastmod (değişiklik tarihi).
 *   TAMAM  son tarama ≥ lastmod (lastmod yoksa: taranmış).
 *   BEKLE  son tarama lastmod'dan eski/yok AMA lastmod'dan sonra istek/gönderim var, eşik dolmadı (Google 7, Bing 5, Yandex 7 gün).
 *   TEKRAR aynı durum, eşik doldu: istek işe yaramadı, yeniden istek hakkı doğar.
 *   YAP    taranmamış/eski ve lastmod'dan sonra hiç istek yok.
 *   ATLA   sayfa noindex (istek kotayı boşa harcar).
 *   IndexNow: tarama bilgisi yoktur; bildirim lastmod'dan sonraysa TAMAM, değilse YAP.
 *   Yandex: tarama bilgisi API'de yok; "olcum aramada" hareketi son tarama sayılır.
 *
 * Kullanım:
 *   node scripts/seo/dizin-takip.mjs --durum [--gun 14] [--adres a,b] [--cikti <depo-dışı klasör>] [--hareket <dosya>]
 *   node scripts/seo/dizin-takip.mjs --kaydet <google|bing|yandex|indexnow> <istek|gonderim|olcum> <adres,adres> [--sonuc aramada]
 *   node scripts/seo/dizin-takip.mjs --ice-aktar [--klasor ~/VentHub-Olcum-Arsiv/geo-seo]   (eski kayıtların tek seferlik içe aktarımı)
 * Çıkış: 0 temiz · 1 ölçüm hatası (Google/Bing/harita okunamadı) · 2 araç koşmadı (bozuk girdi, depo içi çıktı, anahtar yok).
 * Defter ve çıktı depoya GİRMEZ (repo PUBLIC; pazar-olcum P6): depo içi yol REDDEDİLİR.
 */
import { execFileSync } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { anahtarDosyasiYolu, anahtarOku, depoIcindeMi, oku as bingOku } from './bing-webmaster-oku.mjs'
import { satirCikar } from './gsc-url-denetim.mjs'

export const SITE = 'https://venthub.com.tr'
export const GSC_MULK = 'sc-domain:venthub.com.tr'
export const MOTORLAR = ['google', 'bing', 'yandex', 'indexnow']
export const EYLEMLER = ['istek', 'gonderim', 'olcum']
export const VARSAYILAN_KLASOR = join(homedir(), 'VentHub-Olcum-Arsiv', 'geo-seo').replace(/\\/g, '/')
export const VARSAYILAN_DEFTER = `${VARSAYILAN_KLASOR}/dizin-takip/hareketler.jsonl`
/** Aynı adrese yeniden istek hakkının doğduğu gün sayısı. Google günlük kotası ~10-11 olduğu için en uzunu. */
export const TEKRAR_ESIGI_GUN = { google: 7, bing: 5, yandex: 7 }
/** Tarama bilgisi API'den gelmeyen motorlarda adres bazlı kayıt başlangıcı: bundan eski lastmod'un geçmişi bilinmez → ESKI (istek atılmaz). */
export const KAYIT_BASLANGICI = { indexnow: '2026-11-05T00:00:00Z', yandex: '2026-11-01T00:00:00Z' }
const GUN_MS = 24 * 3600 * 1000

/** ISO tarih mi (geçerli ve 2020 sonrası)? Bing'in "0001-01-01" yokluk değeri GEÇERSİZDİR. */
export function tarihAl(deger) {
  if (!deger) return null
  const t = Date.parse(deger)
  if (!Number.isFinite(t) || t < Date.parse('2020-01-01T00:00:00Z')) return null
  return t
}

const TR_SAAT_FARKI_MS = 3 * 3600 * 1000

/** lastmod yalnız tarih mi (saat bilgisi yok ya da tam gece yarısı 00:00:00 UTC)? Gün içi sıra bilinmez. */
export function yalnizTarihMi(deger) {
  const s = String(deger ?? '').trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(s) || /^\d{4}-\d{2}-\d{2}T00:00:00(\.0+)?(Z|\+00:00)$/.test(s)
}

/** Defter satırı geçerli mi: bilinen motor ve eylem, siteye ait adres, geçerli tarih. */
export function hareketGecerliMi(h) {
  return !!h && MOTORLAR.includes(h.motor) && EYLEMLER.includes(h.eylem)
    && typeof h.adres === 'string' && h.adres.startsWith(`${SITE}/`) && tarihAl(h.tarih) !== null
}

/** JSONL metni → geçerli hareketler + atlanan satır sayısı (sessiz yutma yok: sayı raporlanır). */
export function defterAyristir(metin) {
  const hareketler = []
  let atlanan = 0
  for (const satir of String(metin ?? '').split(/\r?\n/)) {
    if (!satir.trim()) continue
    try {
      const h = JSON.parse(satir)
      if (hareketGecerliMi(h)) hareketler.push(h)
      else atlanan++
    } catch { atlanan++ }
  }
  return { hareketler, atlanan }
}

const anahtar = (h) => `${h.motor}|${h.eylem}|${h.adres}|${new Date(h.tarih).toISOString()}`

/** Defter satırı biçimi: tek satır JSON. */
export const satirYaz = (h) => JSON.stringify({ tarih: new Date(h.tarih).toISOString(), motor: h.motor, eylem: h.eylem, adres: h.adres, ...(h.sonuc ? { sonuc: h.sonuc } : {}), ...(h.kaynak ? { kaynak: h.kaynak } : {}) })

/** Bir adres×motor için son istek/gönderim zamanı (ms) ya da null. 'olcum' hareketi istek sayılmaz. */
export function sonHareket(hareketler, motor, adres) {
  let en = null
  for (const h of hareketler) {
    if (h.motor !== motor || h.adres !== adres || h.eylem === 'olcum') continue
    const t = tarihAl(h.tarih)
    if (t !== null && (en === null || t > en)) en = t
  }
  return en
}

/** Yandex için: "aramada" sonuçlu son ölçüm zamanı (API yok; elle okunan "Aramadaki sayfalar" listesi). */
export function yandexSonTarama(hareketler, adres) {
  let en = null
  for (const h of hareketler) {
    if (h.motor !== 'yandex' || h.eylem !== 'olcum' || h.adres !== adres || h.sonuc !== 'aramada') continue
    const t = tarihAl(h.tarih)
    if (t !== null && (en === null || t > en)) en = t
  }
  return en
}

/**
 * Tek karar. Saf işlev: ağ ve dosya yok.
 * @param {{ motor: string, lastmod?: string|null, sonTarama?: string|number|null, sonHareket?: number|null, noindex?: boolean, simdi?: number, olculemedi?: boolean, hataMetni?: string }} p
 * @returns {{ durum: 'TAMAM'|'BEKLE'|'TEKRAR'|'YAP'|'ATLA'|'ESKI'|'OLCULEMEDI', neden: string }}
 */
export function karar({ motor, lastmod = null, sonTarama = null, sonHareket: hareket = null, noindex = false, simdi = Date.now(), olculemedi = false, hataMetni = '' }) {
  if (olculemedi) return { durum: 'OLCULEMEDI', neden: `durum okunamadı${hataMetni ? `: ${hataMetni}` : ''}; istek atmadan önce yeniden ölç` }
  if (noindex) return { durum: 'ATLA', neden: 'sayfa noindex; istek kotayı boşa harcar' }
  const degisim = tarihAl(lastmod)
  // Yalnız-tarih lastmod gün başına (00:00Z) düşer; o günün TR saatiyle ilk 3 saati önceki günün 21:00Z-24:00Z'sine denk gelir.
  // Bu aralıkta atılmış istek lastmod gününün değişikliğinden önce sayılmaz (SEO-98: 7 Kasım 22:49Z isteği 8 Kasım lastmod'una YAP dedirtiyordu).
  const hareketDegisim = degisim !== null && yalnizTarihMi(lastmod) ? degisim - TR_SAAT_FARKI_MS : degisim
  const tarama = typeof sonTarama === 'number' ? sonTarama : tarihAl(sonTarama)
  const baslangic = tarihAl(KAYIT_BASLANGICI[motor])
  const kayitOncesi = baslangic !== null && degisim !== null && degisim < baslangic
  if (motor === 'indexnow') {
    if (degisim === null) return { durum: 'TAMAM', neden: 'lastmod yok; günlük görev bildirir' }
    if (hareket !== null && hareket >= hareketDegisim) return { durum: 'TAMAM', neden: 'bildirim lastmod sonrası' }
    if (kayitOncesi) return { durum: 'ESKI', neden: 'lastmod adres bazlı kayıt başlangıcından önce; günlük görev kapsar' }
    return { durum: 'YAP', neden: 'lastmod sonrası IndexNow bildirimi yok' }
  }
  if (tarama !== null && (degisim === null || tarama >= degisim)) return { durum: 'TAMAM', neden: 'son tarama lastmod sonrası' }
  if (hareket !== null && (degisim === null || hareket >= hareketDegisim)) {
    const gun = (simdi - hareket) / GUN_MS
    const esik = TEKRAR_ESIGI_GUN[motor] ?? 7
    return gun >= esik
      ? { durum: 'TEKRAR', neden: `istek ${Math.floor(gun)} gün önce, tarama yok (eşik ${esik})` }
      : { durum: 'BEKLE', neden: `istek ${Math.floor(gun)} gün önce, tarama bekleniyor (eşik ${esik})` }
  }
  if (motor === 'yandex' && kayitOncesi) return { durum: 'ESKI', neden: 'lastmod Yandex kaydı başlamadan önce; geçmiş bilinmiyor, istek atılmaz' }
  return { durum: 'YAP', neden: tarama === null ? 'hiç taranmamış ve lastmod sonrası istek yok' : 'tarama lastmod\'dan eski ve lastmod sonrası istek yok' }
}

/** Site haritası XML → [{ adres, lastmod }]. lastmod yoksa null. */
export function haritaCoz(xml) {
  return String(xml ?? '').split('<url>').slice(1).map((b) => ({
    adres: (/<loc>([^<]*)<\/loc>/.exec(b) || [])[1] ?? '',
    lastmod: (/<lastmod>([^<]*)<\/lastmod>/.exec(b) || [])[1] ?? null,
  })).filter((x) => x.adres)
}

/**
 * Takip kapsamı: lastmod son `gun` günde olan ya da defterde son `gun` günde hareketi olan adresler (+ elle verilenler).
 * @param {{ harita: Array<{ adres: string, lastmod: string|null }>, hareketler: Array<{ tarih: string, adres: string }>, gun?: number, simdi?: number, ek?: string[] }} p
 */
export function kapsamSec({ harita, hareketler, gun = 14, simdi = Date.now(), ek = [] }) {
  const sinir = simdi - gun * GUN_MS
  const adresler = new Set(ek)
  for (const h of harita) { const t = tarihAl(h.lastmod); if (t !== null && t >= sinir) adresler.add(h.adres) }
  for (const h of hareketler) { const t = tarihAl(h.tarih); if (t !== null && t >= sinir) adresler.add(h.adres) }
  const lm = new Map(harita.map((h) => [h.adres, h.lastmod]))
  return [...adresler].sort().map((adres) => ({ adres, lastmod: lm.get(adres) ?? null }))
}

/** Adres satırları + motor ölçümleri + defter → karar tablosu. `olcum[motor][adres]` = { sonTarama, noindex, hata }. */
export function tabloUret({ kapsam, hareketler, olcum, simdi = Date.now() }) {
  return kapsam.map(({ adres, lastmod }) => {
    const satir = { adres, lastmod }
    for (const motor of MOTORLAR) {
      const o = olcum?.[motor]?.[adres] ?? {}
      const hareket = sonHareket(hareketler, motor, adres)
      const sonTarama = motor === 'yandex' ? yandexSonTarama(hareketler, adres) : o.sonTarama ?? null
      const k = karar({ motor, lastmod, sonTarama, sonHareket: hareket, noindex: !!o.noindex, simdi, olculemedi: !!o.hata, hataMetni: o.hata ? String(o.hata).slice(0, 80) : '' })
      satir[motor] = { ...k, sonTarama: typeof sonTarama === 'number' ? new Date(sonTarama).toISOString() : sonTarama, sonHareket: hareket === null ? null : new Date(hareket).toISOString() }
    }
    return satir
  })
}

const kisa = (adres) => adres.replace(`${SITE}/tr/`, '/').replace(`${SITE}/`, '/')
const gunYaz = (iso) => (iso ? String(iso).slice(5, 10) : '-')

/** Tablo → markdown (Kanban notuna yapıştırılır). */
export function markdownYaz(tablo, simdi = Date.now()) {
  const hucre = (m) => {
    const t = m.durum === 'TAMAM' ? ` (${gunYaz(m.sonTarama ?? m.sonHareket)})` : m.durum === 'BEKLE' || m.durum === 'TEKRAR' ? ` (${gunYaz(m.sonHareket)})` : ''
    return `${m.durum}${t}`
  }
  const satirlar = [`DİZİN TAKİP ${new Date(simdi).toISOString().slice(0, 16)}Z`, '| Adres | lastmod | Google | Bing | Yandex | IndexNow |', '|---|---|---|---|---|---|']
  for (const s of tablo) satirlar.push(`| ${kisa(s.adres)} | ${gunYaz(s.lastmod)} | ${hucre(s.google)} | ${hucre(s.bing)} | ${hucre(s.yandex)} | ${hucre(s.indexnow)} |`)
  const yapilacak = []
  for (const motor of MOTORLAR) {
    const l = tablo.filter((s) => s[motor].durum === 'YAP' || s[motor].durum === 'TEKRAR').map((s) => kisa(s.adres))
    if (l.length) yapilacak.push(`${motor}: ${l.join(', ')}`)
  }
  satirlar.push('', yapilacak.length ? `YAPILACAK → ${yapilacak.join(' · ')}` : 'YAPILACAK → yok')
  return satirlar.join('\n')
}

/**
 * Eski kayıtlar → hareketler. Kaynak biçimleri: google-elle-istekler.jsonl, gunluk-dizin-istegi.jsonl (google_tamam_adresler), bing-url-gonder-*.json.
 * @param {{ elleIstek?: string, gunluk?: string, bingDosyalari?: Array<{ kuru?: boolean, alinma?: string, partiler?: Array<{ durum?: string }>, plan?: { gonderilecek?: string[] } }> }} p
 */
export function eskiKayitlariCoz({ elleIstek = '', gunluk = '', bingDosyalari = [] }) {
  const cikti = []
  for (const satir of String(elleIstek).split(/\r?\n/)) {
    if (!satir.trim()) continue
    try { const o = JSON.parse(satir); cikti.push({ tarih: o.tarih, motor: 'google', eylem: 'istek', adres: o.adres, kaynak: 'elle-istek-defteri' }) } catch { /* bozuk satır atlanır; geçerlilik süzgeci aşağıda */ }
  }
  for (const satir of String(gunluk).split(/\r?\n/)) {
    if (!satir.trim()) continue
    try {
      const o = JSON.parse(satir)
      for (const a of o.google_tamam_adresler ?? []) cikti.push({ tarih: o.tarih, motor: 'google', eylem: 'istek', adres: a.startsWith('http') ? a : `${SITE}${a}`, kaynak: 'gunluk-gorev' })
    } catch { /* bozuk satır atlanır */ }
  }
  for (const b of bingDosyalari) {
    if (!b || b.kuru) continue
    const gonderilen = (b.partiler ?? []).some((p) => p.durum === 'GONDERILDI')
    if (!gonderilen) continue
    for (const a of b.plan?.gonderilecek ?? []) cikti.push({ tarih: b.alinma, motor: 'bing', eylem: 'gonderim', adres: a, kaynak: 'bing-url-gonder' })
  }
  return cikti.filter(hareketGecerliMi)
}

/** Yeni hareketlerden deftere zaten olanları çıkarır (içe aktarım tekrar koşulursa çiftlemez). */
export function yeniOlanlar(mevcut, adaylar) {
  const var_ = new Set(mevcut.map(anahtar))
  const gorulen = new Set()
  return adaylar.filter((h) => { const k = anahtar(h); if (var_.has(k) || gorulen.has(k)) return false; gorulen.add(k); return true })
}

// ---------------------------------------------------------------- CLI (ağ ve dosya burada)

function defterOku(yol) {
  if (!existsSync(yol)) return { hareketler: [], atlanan: 0 }
  return defterAyristir(readFileSync(yol, 'utf8'))
}

function yolKontrol(yol, ad) {
  if (depoIcindeMi(join(resolve(yol), 'x'))) { console.error(`HATA: ${ad} bir git deposunun içinde (repo PUBLIC); depo dışı yol ver`); process.exit(2) }
}

async function googleOlc(adresler) {
  const kok = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
  const tok = execFileSync('node', [join(kok, 'scripts', 'gsc', 'gsc-token.cjs')], { env: process.env }).toString().trim()
  const sonuc = {}
  const kuyruk = [...adresler]
  const isci = async () => {
    for (;;) {
      const a = kuyruk.shift()
      if (!a) return
      try {
        const r = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
          method: 'POST', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ inspectionUrl: a, siteUrl: GSC_MULK }),
        })
        const s = satirCikar(a, await r.json())
        sonuc[a] = s.hata ? { hata: s.hata } : { sonTarama: s.sonTarama, noindex: /noindex/i.test(s.kapsam ?? '') || s.dizin === 'BLOCKED_BY_META_TAG', kapsam: s.kapsam }
      } catch (e) { sonuc[a] = { hata: String(e.message).slice(0, 120) } }
    }
  }
  await Promise.all([isci(), isci(), isci(), isci()])
  return sonuc
}

async function bingOlc(adresler) {
  const k = anahtarOku(anahtarDosyasiYolu())
  if (k.hata) return Object.fromEntries(adresler.map((a) => [a, { hata: k.hata }]))
  const cevir = (s) => Object.fromEntries((s.urlBilgi ?? []).map((u) => [u.adres, u.durum === 'TAMAM' ? { sonTarama: u.sonTarama } : { hata: u.neden ?? u.durum }]))
  const ilk = cevir(await bingOku({ anahtar: k.anahtar, siteUrl: `${SITE}/`, urlBilgi: adresler, gun: 30 }))
  const basarisiz = adresler.filter((a) => !ilk[a] || ilk[a].hata)
  if (!basarisiz.length) return ilk
  // Hız sınırı ihtimaline karşı yalnız başarısızlar yavaşça bir kez daha denenir (sessiz geçmez: yine başarısızsa OLCULEMEDI kalır).
  await new Promise((r) => setTimeout(r, 2000))
  const ikinci = cevir(await bingOku({ anahtar: k.anahtar, siteUrl: `${SITE}/`, urlBilgi: basarisiz, gun: 30, bekleMs: 1200 }))
  for (const a of basarisiz) ilk[a] = ikinci[a] ?? { hata: 'Bing yanıtı yok' }
  return ilk
}

/**
 * Defterin günlük yedeği: `<defter klasörü>/yedek/hareketler-YYYY-MM-DD.jsonl` (aynı gün üzerine yazılır).
 * DIZIN_TAKIP_YEDEK2 verilirse (depo dışı, başka disk/klasör) ikinci kopya oraya da gider.
 * Yedek hatası kaydı bozmaz ama sessiz de kalmaz: stderr'e yazılır.
 */
export function yedekAl(defter, simdi = new Date()) {
  const ad = `hareketler-${simdi.toISOString().slice(0, 10)}.jsonl`
  const hedefler = [join(dirname(defter), 'yedek'), process.env.DIZIN_TAKIP_YEDEK2].filter(Boolean)
  for (const klasor of hedefler) {
    try {
      mkdirSync(resolve(klasor), { recursive: true })
      writeFileSync(join(resolve(klasor), ad), readFileSync(defter))
    } catch (e) { console.error(`UYARI: yedek yazılamadı (${klasor}): ${e.message}`) }
  }
  return hedefler.length
}

async function calistir() {
  const arg = process.argv.slice(2)
  const deger = (b) => { const i = arg.indexOf(b); return i >= 0 ? arg[i + 1] : undefined }
  const defter = resolve(deger('--hareket') || process.env.DIZIN_TAKIP_DEFTER || VARSAYILAN_DEFTER)
  yolKontrol(defter, '--hareket')

  if (arg.includes('--kaydet')) {
    const i = arg.indexOf('--kaydet')
    const [motor, eylem, liste] = arg.slice(i + 1, i + 4)
    const sonuc = deger('--sonuc')
    const adresler = String(liste ?? '').split(',').map((s) => s.trim()).filter(Boolean).map((a) => (a.startsWith('http') ? a : `${SITE}${a}`))
    const verilen = deger('--tarih')
    if (verilen !== undefined && tarihAl(verilen) === null) { console.error('HATA: --tarih geçerli bir ISO tarih olmalı (örn. 2026-11-04T07:11:00Z)'); process.exit(2) }
    const simdi = verilen ? new Date(verilen).toISOString() : new Date().toISOString()
    const hareketler = adresler.map((adres) => ({ tarih: simdi, motor, eylem, adres, ...(sonuc ? { sonuc } : {}), kaynak: 'kaydet' }))
    if (!adresler.length || hareketler.some((h) => !hareketGecerliMi(h))) { console.error('HATA: --kaydet <motor> <eylem> <adres,adres> geçersiz (motor/eylem/adres siteye ait olmalı)'); process.exit(2) }
    mkdirSync(dirname(defter), { recursive: true })
    appendFileSync(defter, `${hareketler.map(satirYaz).join('\n')}\n`)
    console.log(`kaydedildi: ${hareketler.length} hareket → ${defter}`)
    yedekAl(defter)
    return
  }

  if (arg.includes('--ice-aktar')) {
    const klasor = resolve(deger('--klasor') || VARSAYILAN_KLASOR)
    const oku_ = (y) => (existsSync(y) ? readFileSync(y, 'utf8') : '')
    const bing = []
    const tara = (d, derinlik) => {
      if (!existsSync(d) || derinlik > 2) return
      for (const ad of readdirSync(d)) {
        const y = join(d, ad)
        if (statSync(y).isDirectory()) tara(y, derinlik + 1)
        else if (/^bing-url-gonder-.*\.json$/.test(ad)) { try { bing.push(JSON.parse(readFileSync(y, 'utf8'))) } catch { /* bozuk dosya atlanır */ } }
      }
    }
    tara(klasor, 0)
    const aday = eskiKayitlariCoz({ elleIstek: oku_(join(klasor, 'google-elle-istekler.jsonl')), gunluk: oku_(join(klasor, 'gunluk-dizin-istegi.jsonl')), bingDosyalari: bing })
    const mevcut = defterOku(defter).hareketler
    const yeni = yeniOlanlar(mevcut, aday)
    mkdirSync(dirname(defter), { recursive: true })
    if (yeni.length) appendFileSync(defter, `${yeni.map(satirYaz).join('\n')}\n`)
    console.log(`içe aktarım: aday ${aday.length} · yeni ${yeni.length} · zaten vardı ${aday.length - yeni.length} → ${defter}`)
    if (yeni.length) yedekAl(defter)
    return
  }

  // --durum (varsayılan)
  // --cikti verilmezse durum anlık görüntüsü defterin klasörüne yazılır: sonuç geçmişi (hangi gün dizine girdi) kaybolmaz.
  const cikti = deger('--cikti') || dirname(defter)
  yolKontrol(cikti, '--cikti')
  const gun = Number(deger('--gun') || 14)
  if (!Number.isFinite(gun) || gun < 1) { console.error('HATA: --gun pozitif sayı olmalı'); process.exit(2) }
  const { hareketler, atlanan } = defterOku(defter)
  let xml
  try { xml = await (await fetch(`${SITE}/sitemap.xml`)).text() } catch (e) { console.error(`HATA: site haritası okunamadı: ${e.message}`); process.exit(1) }
  const harita = haritaCoz(xml)
  if (!harita.length) { console.error('HATA: site haritası boş ya da çözülemedi (sessiz sıfır yok)'); process.exit(1) }
  const ek = (deger('--adres') || '').split(',').map((s) => s.trim()).filter(Boolean).map((a) => (a.startsWith('http') ? a : `${SITE}${a}`))
  const simdi = Date.now()
  const kapsam = kapsamSec({ harita, hareketler, gun, simdi, ek })
  const adresler = kapsam.map((k) => k.adres)
  const olcum = { google: await googleOlc(adresler), bing: await bingOlc(adresler), yandex: {}, indexnow: {} }
  const tablo = tabloUret({ kapsam, hareketler, olcum, simdi })
  const md = markdownYaz(tablo, simdi)
  console.log(md)
  if (atlanan) console.log(`\nUYARI: defterde ${atlanan} geçersiz satır atlandı`)
  const olculemedi = tablo.filter((s) => s.google.durum === 'OLCULEMEDI' || s.bing.durum === 'OLCULEMEDI').length
  if (cikti) {
    mkdirSync(resolve(cikti), { recursive: true })
    writeFileSync(join(resolve(cikti), `dizin-takip-${new Date(simdi).toISOString().slice(0, 10)}.json`), JSON.stringify({ alinma: new Date(simdi).toISOString(), gun, atlanan, tablo }, null, 1))
  }
  if (olculemedi) { console.error(`UYARI: ${olculemedi} adreste Google/Bing durumu okunamadı (OLCULEMEDI)`); process.exit(1) }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await calistir()
