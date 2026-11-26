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
 * Karar (adres × motor): değişim = sitemap lastmod ile --degisen listesindeki tarihten yeni olanı (SEO-115: kod yayınıyla değişen
 * sayfada lastmod değişmeyebilir; URN-164'te 101 adresin konum yolu değişti, lastmod aynı kaldı, tablo hepsini TAMAM saydı).
 *   TAMAM  son tarama ≥ lastmod (lastmod yoksa: taranmış).
 *   BEKLE  son tarama lastmod'dan eski/yok AMA lastmod'dan sonra istek/gönderim var, eşik dolmadı (Bing 5, Yandex 7 gün); Google'da istek varsa hep BEKLE; Bilgi Merkezi liste sayfası Google'da otomatik YAP olmaz, BEKLE kalır (SEO-134).
 *   TEKRAR aynı durum, eşik doldu: yeniden istek hakkı doğar. YALNIZ Bing ve Yandex. Google'da TEKRAR YOKTUR (SEO-112, 16 Kasım 2026):
 *          Google belgesi aynı adrese yinelenen isteğin taramayı hızlandırmadığını yazar; adres başına tek istek, karar BEKLE kalır.
 *   YAP    taranmamış/eski ve lastmod'dan sonra hiç istek yok.
 *   ATLA   sayfa noindex (istek kotayı boşa harcar).
 *   IndexNow: tarama bilgisi yoktur; bildirim lastmod'dan sonraysa TAMAM, değilse YAP.
 *   Yandex: tarama bilgisi API'de yok; "olcum aramada" hareketi son tarama sayılır.
 *
 * Kullanım:
 *   node scripts/seo/dizin-takip.mjs --durum [--gun N: yalnız son N günün adresleri; verilmezse TÜM site haritası] [--adres a,b] [--cikti <depo-dışı klasör>] [--hareket <dosya>]
 *        [--degisen <dosya>: satır başına "<adres> <ISO tarih>"; verilmezse defter klasöründeki degisen-adresler.txt varsa o okunur]
 *        [--kalan <motor> [--sinir N]: tablo yerine yalnız o motorun YAP/TEKRAR adreslerini satır satır basar; elle kalan listesi tutulmaz (SEO-118)]
 *   node scripts/seo/dizin-takip.mjs --kaydet <google|bing|yandex|indexnow> <istek|gonderim|olcum|gorunme|degisim> <https://adres,https://adres> [--sonuc aramada | gorundu|gorunmuyor|olculemedi]
 *        [--neden "<gerekçe>"] [--kart <ÖNEK-sayı>] [--tarih <ISO>] [--kanit <tur-çıktısı.json | JSON>]
 *        (SEO-141: google/istek tek çağrıda birden çok adres yalnız --kanit ile geçer; her adresin tur çıktısında ISTENDI satırı olmalı)
 *        (degisim: kod yayını sayfayı değiştirdi, motor google yazılır; değişen liste artık defterden türer. --tarih ile geçmiş tarih verilebilir)
 *        (SEO-127: adresler VİRGÜLLE TEK argümandır; boşlukla verilen ikinci adres eskiden sessizce düşüyordu, artık çıkış 2. Her adres https:// ile başlar,
 *         Git Bash'in /tr/x → C:/Program Files/Git/tr/x çevirisi de çıkış 2'dir. --neden/--kart satıra `neden`/`kart` alanı yazar; --kart biçimi ÖNEK-sayı)
 *   node scripts/seo/dizin-takip.mjs --bag   (SEO-132: her gorunme/olcum satırını kendinden önceki son isteğe bağlar, aradaki günü yazar; salt okur)
 *   node scripts/seo/dizin-takip.mjs --degisen-ice-aktar [--degisen <dosya>]   (eski degisen-adresler.txt satırlarını deftere tek seferlik taşır)
 *   node scripts/seo/dizin-takip.mjs --ice-aktar [--klasor ~/VentHub-Olcum-Arsiv/geo-seo]   (eski kayıtların tek seferlik içe aktarımı)
 *   ETKİ DEFTERİ (SEO-147, cetvel D8.1; yeni defter YOK: 'degisim' satırı etki satırı olur; AĞSIZ):
 *   node scripts/seo/dizin-takip.mjs --kaydet google degisim <https://adres> --kart SEO-147 --pr 2690 --hipotez "<neden değişti, ne bekleniyor>" [--neden ..]
 *   node scripts/seo/dizin-takip.mjs --etki-doldur [--baslangic 2026-08-28] [--kuru]   (tek seferlik/idempotent: mevcut degisim satırlarına kart+pr, git geçmişinden eksik değişiklikler; önce yedek)
 *   node scripts/seo/dizin-takip.mjs --etki [--cikti <depo-dışı klasör>] [--arsiv <geo-seo klasörü>] [--yeniden] [--kuru]   (vadeler, hüküm, sayfa-zaman/<slug>.json, ozet.json, son koşu saati)
 * Çıkış: 0 temiz · 1 ölçüm hatası (Google/Bing/harita okunamadı) · 2 araç koşmadı (bozuk girdi, depo içi çıktı, anahtar yok).
 * Defter ve çıktı depoya GİRMEZ (repo PUBLIC; pazar-olcum P6): depo içi yol REDDEDİLİR.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { anahtarDosyasiYolu, anahtarOku, depoIcindeMi, oku as bingOku } from './bing-webmaster-oku.mjs'
import { satirCikar } from './gsc-url-denetim.mjs'

export const SITE = 'https://venthub.com.tr'
export const GSC_MULK = 'sc-domain:venthub.com.tr'
export const MOTORLAR = ['google', 'bing', 'yandex', 'indexnow']
export const EYLEMLER = ['istek', 'gonderim', 'olcum', 'gorunme', 'degisim']
/** SEO-109: 'gorunme' eylemi canlı arama sonucudur (istek DEĞİL); sonuc: gorundu | gorunmuyor | olculemedi. Sıra aranmaz, yalnız yazının kendi adresi sonuçlarda var mı. */
export const GORUNME_SONUCLARI = ['gorundu', 'gorunmuyor', 'olculemedi']
export const VARSAYILAN_KLASOR = join(homedir(), 'VentHub-Olcum-Arsiv', 'geo-seo').replace(/\\/g, '/')
export const VARSAYILAN_DEFTER = `${VARSAYILAN_KLASOR}/dizin-takip/hareketler.jsonl`
/** Aynı adrese yeniden istek hakkının doğduğu gün sayısı (yalnız TEKRAR kararı olan motorlar). */
export const TEKRAR_ESIGI_GUN = { bing: 5, yandex: 7 }
/**
 * Adres başına TEK istek atılan motorlar: değişimden sonra istek varsa karar eşikten bağımsız BEKLE kalır, TEKRAR üretilmez.
 * Kaynak (okundu 2026-11-16): developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl (yinelenen istek taramayı hızlandırmaz).
 */
export const TEK_ISTEK_MOTORLARI = new Set(['google'])
/** SEO-134: her yeni yazıda değişen liste sayfası; değişim başına otomatik Google isteği kotayı yer (21 Kasım: 5 istek). */
export const OTOMATIK_GOOGLE_ISTEK_DISI = new Set([`${SITE}/tr/bilgi-merkezi`])

/**
 * SEO-118: bekleyen istek penceresi (Yandex). İstek kuyruktayken sayfa yeniden değişirse robot yeni hâli çeker; ikinci istek boşa gider.
 * Süre ölçümden gelir (OPS onayı 2026-11-17, kart SEO-118 notu): panel işlenme SAATİ vermez, yalnız durum; 16 Kasım 13:01 grubu 17 Kasım 10:55'te
 * "Request processed" (en çok 21,9 saat), 17 Kasım 10:55 grubu 17:15'te işlenmişti (en çok 6,3 saat). Ölçülen en büyük üst sınır 22 saate yuvarlandı.
 * Sonraki turlarda panelden "işlendi" gözlemi deftere yazılıp pencere küçültülür; uydurma sabit değil, kart notundaki ölçüm.
 */
export const YANDEX_ISTEK_PENCERESI_MS = 22 * 60 * 60 * 1000
/** --degisen verilmediğinde defter klasöründe aranan dosya adı. */
export const DEGISEN_DOSYA_ADI = 'degisen-adresler.txt'
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

/**
 * SEO-147 (etki defteri): 'degisim' satırı ETKİ SATIRI olur. Yeni defter açılmadı; aynı satıra isteğe bağlı alanlar eklendi, eski satırlar aynen geçerli.
 * Cetvel: dizin-sistemleri-standard.md D8.1. Alan anlamları:
 *   kart (SEO-nn/BLG-nn) · pr (sayı) · commit (git kısa sha) · hipotez (neden değişti, ne bekleniyor; kısa metin)
 *   once   değişiklik öncesi durum özeti (son tarama, görünme, sıra)           · null ya da nesne
 *   vadeler {"3","7","14","28"}: her biri null (vade gelmedi/ölçüm yok) ya da ölçüm özeti
 *   kontrol aynı dönemde değişmeyen karşılaştırma adresleri (varsa)
 *   cakisan aynı adreste ±7 günde başka değişiklik varsa TEK CÜMLE
 *   hukum   olumlu | olumsuz | notr | ayrilamiyor | bekliyor · hukumNotu: hükmün tek cümlelik gerekçesi
 * `kaynak: 'git-gecmisi'` satırı git geçmişinden sonradan eklenen değişikliktir (--etki-doldur); karar tablosunu (`degisenDefterden`) ETKİLEMEZ.
 */
export const VADE_GUNLERI = [3, 7, 14, 28]
export const HUKUMLER = ['olumlu', 'olumsuz', 'notr', 'ayrilamiyor', 'bekliyor']
/** Etki alanları; `satirYaz` bu sırayla yazar (kart/neden/kaynak taban alanlardır). */
export const ETKI_ALANLARI = ['pr', 'commit', 'hipotez', 'once', 'vadeler', 'kontrol', 'cakisan', 'hukum', 'hukumNotu']
export const GIT_GECMISI = 'git-gecmisi'
const duzNesneMi = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

/** Etki alanları biçimce geçerli mi? Alan yok ya da null geçerlidir (eski satır). Yalnız 'degisim' satırında denetlenir. */
export function etkiAlanlariGecerliMi(h) {
  if (!h || h.eylem !== 'degisim') return true
  const yok = (v) => v === undefined || v === null
  if (!yok(h.kart) && !(typeof h.kart === 'string' && KART_BICIMI.test(h.kart))) return false
  if (!yok(h.pr) && !(Number.isInteger(h.pr) && h.pr > 0)) return false
  if (!yok(h.commit) && !(typeof h.commit === 'string' && /^[0-9a-f]{7,40}$/.test(h.commit))) return false
  if (!yok(h.hipotez) && !(typeof h.hipotez === 'string' && h.hipotez.trim())) return false
  if (!yok(h.once) && !duzNesneMi(h.once)) return false
  if (!yok(h.vadeler)) {
    if (!duzNesneMi(h.vadeler)) return false
    for (const [k, v] of Object.entries(h.vadeler)) if (!VADE_GUNLERI.map(String).includes(k) || !(v === null || duzNesneMi(v))) return false
  }
  if (!yok(h.kontrol) && !(Array.isArray(h.kontrol) && h.kontrol.every((a) => typeof a === 'string'))) return false
  if (!yok(h.cakisan) && typeof h.cakisan !== 'string') return false
  if (!yok(h.hukum) && !HUKUMLER.includes(h.hukum)) return false
  if (!yok(h.hukumNotu) && typeof h.hukumNotu !== 'string') return false
  return true
}

/** Defter satırı geçerli mi: bilinen motor ve eylem, siteye ait adres, geçerli tarih; degisim satırında etki alanları biçimce doğru. */
export function hareketGecerliMi(h) {
  return !!h && MOTORLAR.includes(h.motor) && EYLEMLER.includes(h.eylem)
    && (h.eylem !== 'gorunme' || (h.motor === 'google' && GORUNME_SONUCLARI.includes(h.sonuc)))
    && (h.eylem !== 'degisim' || h.motor === 'google')
    && typeof h.adres === 'string' && h.adres.startsWith(`${SITE}/`) && tarihAl(h.tarih) !== null
    && etkiAlanlariGecerliMi(h)
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

/** SEO-147: yalnız 'degisim' satırı etki alanlarını taşır; undefined/null alan yazılmaz (yok = bilinmiyor). */
const etkiParcasi = (h) => (h.eylem === 'degisim' ? Object.fromEntries(ETKI_ALANLARI.filter((k) => h[k] !== undefined && h[k] !== null).map((k) => [k, h[k]])) : {})

/** Defter satırı biçimi: tek satır JSON. */
export const satirYaz = (h) => JSON.stringify({ tarih: new Date(h.tarih).toISOString(), motor: h.motor, eylem: h.eylem, adres: h.adres, ...(h.sonuc ? { sonuc: h.sonuc } : {}), ...(h.kaynak ? { kaynak: h.kaynak } : {}), ...(h.neden ? { neden: String(h.neden) } : {}), ...(h.kart ? { kart: String(h.kart) } : {}), ...(h.istekTarihi ? { istekTarihi: String(h.istekTarihi) } : {}), ...etkiParcasi(h) })

/** Bir adres×motor için son istek/gönderim zamanı (ms) ya da null. 'olcum' hareketi istek sayılmaz. `oncesi` (ms) verilirse yalnız ondan önceki (eşit dahil) eylemler. */
export function sonHareket(hareketler, motor, adres, oncesi = Infinity) {
  if (typeof oncesi !== 'number' || Number.isNaN(oncesi)) oncesi = Infinity
  let en = null
  for (const h of hareketler) {
    if (h.motor !== motor || h.adres !== adres || h.eylem === 'olcum' || h.eylem === 'gorunme' || h.eylem === 'degisim') continue
    const t = tarihAl(h.tarih)
    if (t !== null && t <= oncesi && (en === null || t > en)) en = t
  }
  return en
}

/** SEO-132: sonuç satırı mı (istek değil, isteğin etkisini ölçen satır)? */
export const sonucSatiriMi = (h) => h?.eylem === 'gorunme' || h?.eylem === 'olcum'

/**
 * SEO-132: bir sonuç satırını (gorunme/olcum) aynı adres × motor için KENDİSİNDEN ÖNCEKİ son istek/gönderime bağlar.
 * Görünme ölçümü Google satırıdır; bağlandığı istek de Google isteğidir. İstek yoksa null (istek atılmadan görünen adres de bir bulgudur).
 * @returns {string|null} ISO tarih
 */
export function istekTarihiBul(hareketler, h) {
  if (!sonucSatiriMi(h)) return null
  const t = tarihAl(h.tarih)
  if (t === null) return null
  const en = sonHareket(hareketler, h.motor, h.adres, t)
  return en === null ? null : new Date(en).toISOString()
}

/**
 * SEO-132: istek → sonuç bağı tablosu (salt okur; defter yeniden yazılmaz). Her sonuç satırı için bağlı istek tarihi ve aradaki gün.
 * Satırda kayıtlı istekTarihi varsa o esas alınır (kayıt anındaki bağ), yoksa defterden hesaplanır.
 * @returns {Array<{ tarih: string, motor: string, eylem: string, adres: string, sonuc: string|null, istekTarihi: string|null, gun: number|null }>}
 */
export function bagTablosu(hareketler) {
  return hareketler
    .filter(sonucSatiriMi)
    .map((h) => {
      // Kayıtlı alan yalnız geçerli ISO metniyse ve satır tarihinden sonra değilse esas alınır; elle bozulmuş değer yerine defterden hesaplanır.
      const kayitli = typeof h.istekTarihi === 'string' ? tarihAl(h.istekTarihi) : null
      const istek = kayitli !== null && kayitli <= tarihAl(h.tarih) ? new Date(kayitli).toISOString() : istekTarihiBul(hareketler, h)
      const gun = istek === null ? null : Math.floor((tarihAl(h.tarih) - tarihAl(istek)) / GUN_MS)
      return { tarih: new Date(h.tarih).toISOString(), motor: h.motor, eylem: h.eylem, adres: h.adres, sonuc: h.sonuc ?? null, istekTarihi: istek, gun }
    })
    .sort((a, b) => a.tarih.localeCompare(b.tarih) || a.adres.localeCompare(b.adres))
}

/**
 * SEO-118: değişen adres listesi DEFTERDEN türer. 'degisim' eylemi (motor google, yalnız defter satırı sözleşmesi gereği) "kod yayını bu sayfayı
 * değiştirdi" demektir; istek/gönderim sayılmaz. Aynı adreste en yeni tarih esas alınır. Eski degisen-adresler.txt dosyası aynı biçimde birleşir.
 * @returns {Map<string, number>}
 */
export function degisenDefterden(hareketler) {
  const kayitlar = new Map()
  for (const h of hareketler ?? []) {
    if (h?.eylem !== 'degisim') continue
    // SEO-147: git geçmişinden sonradan eklenen satır (--etki-doldur) etki analizi içindir; "kod yayını bugün değişti" sinyali DEĞİLDİR.
    // Yoksa geçmiş commit saati lastmod'dan yeni sayılıp TAMAM/BEKLE kararını YAP'a çevirebilir ve kota boşa gider.
    if (h.kaynak === GIT_GECMISI) continue
    const t = tarihAl(h.tarih)
    if (t !== null && (!kayitlar.has(h.adres) || kayitlar.get(h.adres) < t)) kayitlar.set(h.adres, t)
  }
  return kayitlar
}

/** İki değişen-adres haritasını birleştirir (adres başına en yeni tarih). */
export function degisenBirlestir(...haritalar) {
  const sonuc = new Map()
  for (const m of haritalar) for (const [a, t] of m) if (!sonuc.has(a) || sonuc.get(a) < t) sonuc.set(a, t)
  return sonuc
}

/**
 * SEO-118: bir motorun KALAN listesi = tablonun YAP/TEKRAR adresleri; elle tutulan liste yoktur. Sıra: Google'da önce hiç istek almamış adresler
 * (SEO-134), sonra her grupta bilgi merkezi yazıları, diğerleri (kategori/ürün), alfabetik. `sinir` verilirse ilk N (günlük kota).
 * @param {Array<{ adres: string }>} tablo
 * @param {string} motor
 * @param {number} [sinir]
 */
export function kalanListe(tablo, motor, sinir = Infinity) {
  const yazi = (a) => /\/bilgi-merkezi\/[^/]+$/.test(a)
  return tablo
    .filter((s) => s[motor] && (s[motor].durum === 'YAP' || s[motor].durum === 'TEKRAR'))
    .map((s) => ({ adres: s.adres, istekAlmis: TEK_ISTEK_MOTORLARI.has(motor) && !!s[motor].sonHareket }))
    // SEO-134 (D7 madde 15): tek istek motorunda kota önce hiç istek almamış adreslere, sonra istekten sonra değişmiş adreslere gider.
    .sort((a, b) => Number(a.istekAlmis) - Number(b.istekAlmis) || (yazi(b.adres) ? 1 : 0) - (yazi(a.adres) ? 1 : 0) || a.adres.localeCompare(b.adres))
    .map((s) => s.adres)
    .slice(0, sinir)
}

/** SEO-118: seçilen motorda OLCULEMEDI adres sayısı (kalan liste "boş" ile "ölçülemedi"yi ayırmak için). */
export function olculemediSayisi(tablo, motor) {
  return tablo.filter((s) => s[motor] && s[motor].durum === 'OLCULEMEDI').length
}

/**
 * SEO-109: bir adresin Google canlı arama görünme özeti (yalnız 'gorunme' hareketleri).
 * ilkGorundu: ilk 'gorundu' ölçümü; son: en yeni ölçüm (olculemedi dahil); lastmod verilirse ilk görünmeye kadar gün farkı.
 * @returns {{ ilkGorundu: string|null, son: string|null, sonSonuc: string|null, gunFarki: number|null }}
 */
export function gorunmeOzeti(hareketler, adres, lastmod = null) {
  let ilk = null
  let son = null
  let sonSonuc = null
  for (const h of hareketler) {
    if (h.motor !== 'google' || h.eylem !== 'gorunme' || h.adres !== adres || !GORUNME_SONUCLARI.includes(h.sonuc)) continue
    const t = tarihAl(h.tarih)
    if (t === null) continue
    if (h.sonuc === 'gorundu' && (ilk === null || t < ilk)) ilk = t
    if (son === null || t > son) { son = t; sonSonuc = h.sonuc }
  }
  const lm = tarihAl(lastmod)
  return {
    ilkGorundu: ilk === null ? null : new Date(ilk).toISOString(),
    son: son === null ? null : new Date(son).toISOString(),
    sonSonuc,
    gunFarki: ilk !== null && lm !== null ? Math.floor((ilk - lm) / GUN_MS) : null,
  }
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
 * degisen: lastmod'a yansımayan içerik değişiminin anı (SEO-115); lastmod'dan yeniyse karar onu esas alır.
 * @param {{ motor: string, lastmod?: string|null, degisen?: string|number|null, sonTarama?: string|number|null, sonHareket?: number|null, noindex?: boolean, simdi?: number, olculemedi?: boolean, hataMetni?: string, dizinde?: boolean|null, kapsam?: string, otomatikIstekDisi?: boolean }} p
 * @returns {{ durum: 'TAMAM'|'BEKLE'|'TEKRAR'|'YAP'|'ATLA'|'ESKI'|'OLCULEMEDI', neden: string }}
 */
export function karar({ motor, lastmod = null, degisen = null, sonTarama = null, sonHareket: hareket = null, noindex = false, simdi = Date.now(), olculemedi = false, hataMetni = '', dizinde = null, kapsam = '', otomatikIstekDisi = false }) {
  if (olculemedi) return { durum: 'OLCULEMEDI', neden: `durum okunamadı${hataMetni ? `: ${hataMetni}` : ''}; istek atmadan önce yeniden ölç` }
  if (noindex) return { durum: 'ATLA', neden: 'sayfa noindex; istek kotayı boşa harcar' }
  const lm = tarihAl(lastmod)
  const dg = typeof degisen === 'number' ? degisen : tarihAl(degisen)
  // SEO-115: listedeki değişim lastmod'dan yeniyse o esas alınır; saatlidir, gün başı düzeltmesi uygulanmaz.
  const degisenEsas = dg !== null && (lm === null || dg > lm)
  const degisim = degisenEsas ? dg : lm
  const ad = degisenEsas ? 'değişim (kod yayını)' : 'lastmod'
  // Yalnız-tarih lastmod gün başına (00:00Z) düşer; o günün TR saatiyle ilk 3 saati önceki günün 21:00Z-24:00Z'sine denk gelir.
  // Bu aralıkta atılmış istek lastmod gününün değişikliğinden önce sayılmaz (SEO-98: 7 Kasım 22:49Z isteği 8 Kasım lastmod'una YAP dedirtiyordu).
  const hareketDegisim = degisim !== null && !degisenEsas && yalnizTarihMi(lastmod) ? degisim - TR_SAAT_FARKI_MS : degisim
  const tarama = typeof sonTarama === 'number' ? sonTarama : tarihAl(sonTarama)
  const baslangic = tarihAl(KAYIT_BASLANGICI[motor])
  const kayitOncesi = baslangic !== null && degisim !== null && degisim < baslangic
  if (motor === 'indexnow') {
    if (degisim === null) return { durum: 'TAMAM', neden: 'lastmod yok; günlük görev bildirir' }
    if (hareket !== null && hareket >= hareketDegisim) return { durum: 'TAMAM', neden: `bildirim ${ad} sonrası` }
    if (kayitOncesi) return { durum: 'ESKI', neden: 'lastmod adres bazlı kayıt başlangıcından önce; günlük görev kapsar' }
    return { durum: 'YAP', neden: `${ad} sonrası IndexNow bildirimi yok` }
  }
  // SEO-100: Google'da taranmış ama dizinde değilse (verdict) tarama tarihi TAMAM saymaz.
  if (tarama !== null && dizinde !== false && (degisim === null || tarama >= degisim)) return { durum: 'TAMAM', neden: `son tarama ${ad} sonrası` }
  // SEO-134: liste sayfası her yeni yazıda değişir; Google'a otomatik istek çıkmaz. Gerekirse bilinçli yol --zorla + --neden.
  if (otomatikIstekDisi && TEK_ISTEK_MOTORLARI.has(motor)) return { durum: 'BEKLE', neden: 'liste sayfası her yeni yazıda değişir; otomatik Google isteği yok (gerekirse --zorla ve --neden)' }
  // SEO-118: Yandex isteği değişimden ÖNCE atılmış ama henüz işlenmemiş olabilir (pencere içinde): robot yeni hâli alır, ikinci istek atılmaz.
  if (motor === 'yandex' && hareket !== null && degisim !== null && hareket < hareketDegisim && simdi - hareket < YANDEX_ISTEK_PENCERESI_MS) {
    return { durum: 'BEKLE', neden: `istek ${Math.floor((simdi - hareket) / 3600000)} saat önce, ${ad} sonrası değişmiş; kuyruktaki istek yeni hâli alır (pencere 22 saat)` }
  }
  if (hareket !== null && (degisim === null || hareket >= hareketDegisim)) {
    const gun = (simdi - hareket) / GUN_MS
    // SEO-112: Google'da adres başına tek istek; yinelenen istek hızlandırmaz, kota harcar. Karar BEKLE kalır (3 gün sonra yeniden ÖLÇÜM sürer, D7 madde 13).
    if (TEK_ISTEK_MOTORLARI.has(motor)) return { durum: 'BEKLE', neden: `istek ${Math.floor(gun)} gün önce, tarama bekleniyor (tek istek: yinelenen istek hızlandırmaz)` }
    const esik = TEKRAR_ESIGI_GUN[motor] ?? 7
    return gun >= esik
      ? { durum: 'TEKRAR', neden: `istek ${Math.floor(gun)} gün önce, tarama yok (eşik ${esik})` }
      : { durum: 'BEKLE', neden: `istek ${Math.floor(gun)} gün önce, tarama bekleniyor (eşik ${esik})` }
  }
  if (motor === 'yandex' && kayitOncesi) return { durum: 'ESKI', neden: 'lastmod Yandex kaydı başlamadan önce; geçmiş bilinmiyor, istek atılmaz' }
  if (dizinde === false) return { durum: 'YAP', neden: `Google dizinde değil${kapsam ? ` (${kapsam})` : ''} ve ${ad} sonrası istek yok` }
  return { durum: 'YAP', neden: tarama === null ? `hiç taranmamış ve ${ad} sonrası istek yok` : `tarama ${ad} öncesi ve ${ad} sonrası istek yok` }
}

/**
 * Değişen adres listesi (SEO-115). Satır: "<adres> <ISO tarih>" (ayırıcı boşluk, sekme, virgül ya da noktalı virgül); "#" ile başlayan ve boş satır atlanır.
 * Aynı adres birden çok kez geçerse en yeni tarih kalır. Bozuk satır sessizce yutulmaz: `atlanan` sayılır.
 * @returns {{ kayitlar: Map<string, number>, atlanan: number }}
 */
export function degisenCoz(metin) {
  const kayitlar = new Map()
  let atlanan = 0
  for (const ham of String(metin ?? '').split(/\r?\n/)) {
    const satir = ham.trim()
    if (!satir || satir.startsWith('#')) continue
    const [a, t] = satir.split(/[\s,;]+/)
    const adres = a?.startsWith('http') ? a : a?.startsWith('/') ? `${SITE}${a}` : null
    const an = tarihAl(t)
    if (!adres || !(adres === SITE || adres.startsWith(`${SITE}/`)) || an === null) { atlanan++; continue }
    if (!kayitlar.has(adres) || kayitlar.get(adres) < an) kayitlar.set(adres, an)
  }
  return { kayitlar, atlanan }
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
export function kapsamSec({ harita, hareketler, gun = Infinity, simdi = Date.now(), ek = [] }) {
  const sinir = simdi - gun * GUN_MS
  const adresler = new Set(ek)
  // SEO-100: varsayılan kapsam TÜM site haritası; `gun` sonlu verilirse eski dar kapsam (son N gün).
  if (!Number.isFinite(gun)) for (const h of harita) adresler.add(h.adres)
  for (const h of harita) { const t = tarihAl(h.lastmod); if (t !== null && t >= sinir) adresler.add(h.adres) }
  for (const h of hareketler) { const t = tarihAl(h.tarih); if (t !== null && t >= sinir) adresler.add(h.adres) }
  const lm = new Map(harita.map((h) => [h.adres, h.lastmod]))
  return [...adresler].sort().map((adres) => ({ adres, lastmod: lm.get(adres) ?? null }))
}

/** Adres satırları + motor ölçümleri + defter → karar tablosu. `olcum[motor][adres]` = { sonTarama, noindex, hata }. */
export function tabloUret({ kapsam, hareketler, olcum, simdi = Date.now(), degisen = new Map() }) {
  return kapsam.map(({ adres, lastmod }) => {
    const dg = degisen.get(adres) ?? null
    const satir = { adres, lastmod, ...(dg === null ? {} : { degisen: new Date(dg).toISOString() }) }
    for (const motor of MOTORLAR) {
      const o = olcum?.[motor]?.[adres] ?? {}
      const hareket = sonHareket(hareketler, motor, adres)
      const sonTarama = motor === 'yandex' ? yandexSonTarama(hareketler, adres) : o.sonTarama ?? null
      const k = karar({ motor, lastmod, degisen: dg, sonTarama, sonHareket: hareket, noindex: !!o.noindex, simdi, olculemedi: !!o.hata, hataMetni: o.hata ? String(o.hata).slice(0, 80) : '', dizinde: o.dizinde ?? null, kapsam: o.kapsam ?? '', otomatikIstekDisi: OTOMATIK_GOOGLE_ISTEK_DISI.has(adres) })
      satir[motor] = { ...k, sonTarama: typeof sonTarama === 'number' ? new Date(sonTarama).toISOString() : sonTarama, sonHareket: hareket === null ? null : new Date(hareket).toISOString() }
    }
    satir.gorunme = gorunmeOzeti(hareketler, adres, lastmod)
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
  // SEO-109: görünme = canlı arama sonucu (sıra değil, çıkıp çıkmama). "ilk" = ilk görünme günü + lastmod'dan gün farkı.
  const gorunmeHucre = (g) => {
    if (!g || !g.son) return 'ölçülmedi'
    const ilk = g.ilkGorundu ? `ilk ${gunYaz(g.ilkGorundu)}${g.gunFarki !== null ? ` (+${g.gunFarki}g)` : ''}` : ''
    return g.sonSonuc === 'gorundu' ? `GÖRÜNDÜ ${ilk}`.trim() : `${g.sonSonuc === 'gorunmuyor' ? 'GÖRÜNMÜYOR' : 'ölçülemedi'} (${gunYaz(g.son)})${ilk ? ` ${ilk}` : ''}`
  }
  const satirlar = [`DİZİN TAKİP ${new Date(simdi).toISOString().slice(0, 16)}Z`, '| Adres | lastmod | Google | Bing | Yandex | IndexNow | Görünme |', '|---|---|---|---|---|---|---|']
  for (const s of tablo) satirlar.push(`| ${kisa(s.adres)} | ${gunYaz(s.lastmod)} | ${hucre(s.google)} | ${hucre(s.bing)} | ${hucre(s.yandex)} | ${hucre(s.indexnow)} | ${gorunmeHucre(s.gorunme)} |`)
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

/** SEO-127: `--kart` biçimi (Kanban numarası): ÖNEK-sayı, büyük harf. */
export const KART_BICIMI = /^[A-Z]+-\d+$/
/** `--kaydet` yolunun okuduğu DEĞERLİ seçenekler: fazla-argüman taramasında değerleri bağımsız argüman sanmamak için atlanır. Liste bilerek dardır:
 * `--kaydet` ile anlamsız bir değerli seçenek (`--adres B`, `--kalan B`) verilirse değeri fazla argüman sayılır ve HATA verir (B sessizce düşmez). */
const DEGERLI_SECENEKLER = ['--sonuc', '--tarih', '--hareket', '--neden', '--kart', '--kanit', '--pr', '--hipotez']

/**
 * SEO-127: `--kaydet <motor> <eylem> <adresler> [--neden t] [--kart K]` argümanlarını çözer ve doğrular (saf işlev; çıkış kararı çağırandadır).
 * Eskiden `arg.slice(i + 1, i + 4)` yalnız üç argüman alıyor, boşlukla verilen ikinci ve sonraki adres SESSİZCE düşüyordu (deftere tek adres yazılıyor,
 * kayıtsız adres bir sonraki tabloda yine YAP çıkıyordu). Artık adres argümanından sonra seçenek olmayan fazla argüman, https:// ile başlamayan adres
 * (Git Bash'in /tr/x → C:/Program Files/Git/tr/x çevirisi dahil) ve `--kart`/`--neden` biçim hatası HATA verir.
 * @param {string[]} arg process.argv.slice(2)
 * @returns {{ hata: string } | { motor: string, eylem: string, adresler: string[], neden: string|null, kart: string|null }}
 */
export function kaydetArgumanlariCoz(arg) {
  const i = arg.indexOf('--kaydet')
  const esittir = arg.find((a) => /^--[^=\s]+=/.test(a))
  if (esittir !== undefined) return { hata: `${JSON.stringify(esittir)}: --ad=değer biçimi okunmaz (değer sessizce düşerdi); --ad değer biçiminde ver` }
  const [motor, eylem, liste] = arg.slice(i + 1, i + 4)
  if (liste === undefined || liste.startsWith('--')) return { hata: '--kaydet <motor> <eylem> <adres,adres> eksik: üç konumsal argüman ister' }
  const fazla = []
  for (let j = i + 4; j < arg.length; j++) {
    if (arg[j].startsWith('--')) { if (DEGERLI_SECENEKLER.includes(arg[j])) j++; continue }
    fazla.push(arg[j])
  }
  if (fazla.length) return { hata: `--kaydet adres argümanından sonra fazladan argüman ${JSON.stringify(fazla[0])}: adresleri virgülle tek argüman ver (boşlukla ayrılan ikinci ve sonraki adres kaydedilmezdi); --neden metnini tırnakla ver` }
  const adresler = liste.split(',').map((s) => s.trim()).filter(Boolean)
  const httpsDegil = adresler.find((a) => !/^https:\/\/\S+$/.test(a))
  if (httpsDegil !== undefined) return { hata: `--kaydet adresi https:// ile başlamalı ve boşluk/yeni satır içermemeli: ${JSON.stringify(httpsDegil)} (satır satır listeyi virgülle birleştir; Git Bash /tr/... yolunu Windows yoluna çevirir; tam https adres ver)` }
  const secenek = (ad) => {
    const k = arg.indexOf(ad)
    if (k < 0) return { var_: false, deger: null }
    const d = arg[k + 1]
    return { var_: true, deger: d === undefined || d.startsWith('--') || !d.trim() ? null : d }
  }
  const n = secenek('--neden')
  if (n.var_ && n.deger === null) return { hata: '--neden metin ister (boşluklu gerekçeyi tırnakla ver)' }
  const k = secenek('--kart')
  if (k.var_ && (k.deger === null || !KART_BICIMI.test(k.deger))) return { hata: `--kart ÖNEK-sayı biçiminde olmalı (örn. SEO-127), verilen: ${JSON.stringify(k.deger)}` }
  const kn = secenek('--kanit')
  if (kn.var_ && kn.deger === null) return { hata: '--kanit tur çıktısı ister (JSON metni ya da .json dosya yolu)' }
  // SEO-147: --pr ve --hipotez yalnız degisim (etki satırı) içindir; başka eylemde sessizce düşmesin diye HATA.
  const pr = secenek('--pr')
  const hp = secenek('--hipotez')
  if ((pr.var_ || hp.var_) && eylem !== 'degisim') return { hata: '--pr ve --hipotez yalnız degisim eyleminde kullanılır (etki satırı, SEO-147)' }
  if (pr.var_ && (pr.deger === null || !/^[1-9]\d*$/.test(pr.deger))) return { hata: `--pr pozitif tam sayı olmalı (örn. 2690), verilen: ${JSON.stringify(pr.deger)}` }
  if (hp.var_ && hp.deger === null) return { hata: '--hipotez metin ister (boşluklu metni tırnakla ver)' }
  return { motor, eylem, adresler, neden: n.deger, kart: k.deger, kanit: kn.deger, pr: pr.deger === null ? null : Number(pr.deger), hipotez: hp.deger }
}

/**
 * SEO-141 (INV-DIZIN-KAYDET-2): Search Console her onayda tek adres alır; deftere yazılan her google/istek satırı ayrı bir onayın kaydı olmalıdır.
 * Olay (23 Kasım): tek --kaydet çağrısı atölye ve demir çelik adreslerini aynı milisaniyeyle "istek" yazdı; giden yalnız atölye isteğiydi,
 * demir çelik iki gün "istendi" sanıldı ve Google onu hiç taramadı. Kural: google/istek tek çağrıda birden çok adres alacaksa --kanit ile
 * tarayıcı turunun çıktısı verilir (window.__tur → {s:[{url,sonuc,saat}]} ya da __iste sonuç dizisi); her adresin o çıktıda ISTENDI
 * satırı olmalıdır ve satır kendi onay saatini taşır. Kanıtsız çoklu google/istek HATA. Tek adres __iste'nin hazır kaydet satırıdır, geçer.
 * @param {{ motor: string, eylem: string, adresler: string[], kanit: unknown }} g kanit: ayrıştırılmış JSON (null = yok)
 * @returns {{ hata: string } | { saatler: Map<string, string|null> }}
 */
export function googleIstekKapisi({ motor, eylem, adresler, kanit }) {
  const saatler = new Map()
  if (!TEK_ISTEK_MOTORLARI.has(motor) || eylem !== 'istek') return { saatler }
  if (kanit == null) {
    if (adresler.length > 1) return { hata: `google/istek tek çağrıda ${adresler.length} adres: Search Console her onayda tek adres alır, toplu kayıt gitmemiş isteği "istendi" yazar (SEO-141). Her adresi kendi kaydet satırıyla yaz ya da --kanit ile tur çıktısını ver` }
    return { saatler }
  }
  const dizi = Array.isArray(kanit) ? kanit : (kanit && typeof kanit === 'object' && Array.isArray(kanit.s) ? kanit.s : null)
  if (!dizi) return { hata: '--kanit dizi ya da {s:[...]} biçiminde tur çıktısı olmalı' }
  for (const a of adresler) {
    const r = dizi.find((x) => x && x.url === a)
    if (!r || r.sonuc !== 'ISTENDI') return { hata: `--kanit içinde ${a} için ISTENDI yok (${r ? JSON.stringify(r.sonuc ?? r.durum ?? null) : 'satır yok'}): bu adresin isteği gitmemiş, deftere yazılmaz` }
    saatler.set(a, typeof r.saat === 'string' && tarihAl(r.saat) !== null ? new Date(r.saat).toISOString() : null)
  }
  return { saatler }
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
        sonuc[a] = s.hata ? { hata: s.hata } : { sonTarama: s.sonTarama, noindex: /noindex/i.test(s.kapsam ?? '') || s.dizin === 'BLOCKED_BY_META_TAG', kapsam: s.kapsam, dizinde: s.karar ? s.karar === 'PASS' : null }
      } catch (e) { sonuc[a] = { hata: String(e.message).slice(0, 120) } }
    }
  }
  await Promise.all([isci(), isci(), isci(), isci()])
  return sonuc
}

/** Bing GetUrlInfo adresler arası bekleme (ms): ilk geçiş, sonra iki yavaşlayan yeniden deneme (SEO-102). */
export const BING_ARALIK_MS = [1000, 2000, 3500]

async function bingOlc(adresler) {
  const k = anahtarOku(anahtarDosyasiYolu())
  if (k.hata) return Object.fromEntries(adresler.map((a) => [a, { hata: k.hata }]))
  const cevir = (s) => Object.fromEntries((s.urlBilgi ?? []).map((u) => [u.adres, u.durum === 'TAMAM' ? { sonTarama: u.sonTarama } : { hata: u.neden ?? u.durum }]))
  // SEO-102: tam site haritası (101 adres) varsayılan 200 ms aralıkla 61 adreste ThrottleHost verdi; ilk geçiş yavaş okur.
  const ilk = cevir(await bingOku({ anahtar: k.anahtar, siteUrl: `${SITE}/`, urlBilgi: adresler, gun: 30, bekleMs: BING_ARALIK_MS[0] }))
  // Hız sınırına karşı yalnız başarısızlar, her turda daha yavaş, en çok iki kez daha denenir (sessiz geçmez: yine başarısızsa OLCULEMEDI kalır).
  for (const aralik of BING_ARALIK_MS.slice(1)) {
    const basarisiz = adresler.filter((a) => !ilk[a] || ilk[a].hata)
    if (!basarisiz.length) break
    await new Promise((r) => setTimeout(r, 3000))
    const sonraki = cevir(await bingOku({ anahtar: k.anahtar, siteUrl: `${SITE}/`, urlBilgi: basarisiz, gun: 30, bekleMs: aralik }))
    for (const a of basarisiz) ilk[a] = sonraki[a] ?? { hata: 'Bing yanıtı yok' }
  }
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
    const cozum = kaydetArgumanlariCoz(arg)
    if ('hata' in cozum) { console.error(`HATA: ${cozum.hata}`); process.exit(2) }
    const { motor, eylem, adresler, neden, kart, kanit: kanitHam, pr, hipotez } = cozum
    let kanit = null
    if (kanitHam != null) {
      try { kanit = JSON.parse(/^\s*[[{]/.test(kanitHam) ? kanitHam : readFileSync(resolve(kanitHam), 'utf8')) } catch (e) { console.error(`HATA: --kanit okunamadı: ${e.message}`); process.exit(2) }
    }
    const kapi = googleIstekKapisi({ motor, eylem, adresler, kanit })
    if ('hata' in kapi) { console.error(`HATA: ${kapi.hata}`); process.exit(2) }
    const sonuc = deger('--sonuc')
    const verilen = deger('--tarih')
    if (verilen !== undefined && tarihAl(verilen) === null) { console.error('HATA: --tarih geçerli bir ISO tarih olmalı (örn. 2026-11-04T07:11:00Z)'); process.exit(2) }
    const simdi = verilen ? new Date(verilen).toISOString() : new Date().toISOString()
    const hareketler = adresler.map((adres) => ({ tarih: kapi.saatler.get(adres) || simdi, motor, eylem, adres, ...(sonuc ? { sonuc } : {}), kaynak: kanit ? 'kaydet-kanit' : 'kaydet', ...(neden ? { neden } : {}), ...(kart ? { kart } : {}), ...(pr ? { pr } : {}), ...(hipotez ? { hipotez } : {}) }))
    if (!adresler.length || hareketler.some((h) => !hareketGecerliMi(h))) { console.error('HATA: --kaydet <motor> <eylem> <adres,adres> geçersiz (motor/eylem/adres siteye ait olmalı)'); process.exit(2) }
    // SEO-132: sonuç satırı (gorunme/olcum) kayıt anında bağlı olduğu son isteğin tarihini taşır.
    if (sonucSatiriMi({ eylem })) {
      const mevcut = defterOku(defter).hareketler
      for (const h of hareketler) { const t = istekTarihiBul(mevcut, h); if (t) h.istekTarihi = t }
    }
    mkdirSync(dirname(defter), { recursive: true })
    appendFileSync(defter, `${hareketler.map(satirYaz).join('\n')}\n`)
    console.log(`kaydedildi: ${hareketler.length} hareket → ${defter}`)
    yedekAl(defter)
    return
  }

  // SEO-132: istek → sonuç bağı raporu (salt okur; defter değişmez). Çıktı stdout'a TSV; arama/sorgu verisi içermez (yalnız site adresi ve tarih).
  if (arg.includes('--bag')) {
    const { hareketler, atlanan } = defterOku(defter)
    const satirlar = bagTablosu(hareketler)
    console.log(['tarih', 'motor', 'eylem', 'sonuc', 'istekTarihi', 'gun', 'adres'].join('\t'))
    const hucre = (v) => String(v).replace(/[\t\r\n]+/g, ' ')
    for (const s of satirlar) console.log([s.tarih, s.motor, s.eylem, s.sonuc ?? '-', s.istekTarihi ?? 'ISTEK YOK', s.gun ?? '-', s.adres].map(hucre).join('\t'))
    const bagsiz = satirlar.filter((s) => s.istekTarihi === null).length
    console.error(`bağ: ${satirlar.length} sonuç satırı · isteğe bağlı ${satirlar.length - bagsiz} · istek yok ${bagsiz}${atlanan ? ` · UYARI: ${atlanan} bozuk satır atlandı` : ''}`)
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

  // SEO-118: eski degisen-adresler.txt satırlarını deftere 'degisim' olarak taşır (idempotent: aynı adres+tarih ikinci kez yazılmaz). Sonra dosya silinebilir.
  if (arg.includes('--degisen-ice-aktar')) {
    const yol = resolve(deger('--degisen') || join(dirname(defter), DEGISEN_DOSYA_ADI))
    yolKontrol(yol, '--degisen')
    if (!existsSync(yol)) { console.error(`HATA: --degisen dosyası yok: ${yol}`); process.exit(2) }
    const { kayitlar, atlanan } = degisenCoz(readFileSync(yol, 'utf8'))
    const aday = [...kayitlar].map(([adres, t]) => ({ tarih: new Date(t).toISOString(), motor: 'google', eylem: 'degisim', adres, kaynak: 'degisen-dosyasi' }))
    const yeni = yeniOlanlar(defterOku(defter).hareketler, aday)
    mkdirSync(dirname(defter), { recursive: true })
    if (yeni.length) appendFileSync(defter, `${yeni.map(satirYaz).join('\n')}\n`)
    console.log(`değişen içe aktarım: adres ${kayitlar.size} · yeni ${yeni.length} · zaten vardı ${aday.length - yeni.length}${atlanan ? ` · UYARI: ${atlanan} bozuk satır atlandı` : ''} → ${defter}`)
    if (yeni.length) yedekAl(defter)
    return
  }

  // SEO-147: etki defteri, AĞSIZ. --etki-doldur = geçmiş doldurma (kart/pr + git geçmişi satırları; yedekli, idempotent). --etki = vadeler + hüküm +
  // sayfa-zaman/<slug>.json + ozet.json (depo dışı) + son koşu saati. Mantık dizin-etki*.mjs'tedir ve bu dosyayı İÇE AKTARIR; bu yüzden onlar
  // ayrı süreç olarak koşar (bu dosyanın üst düzey `await calistir()`'ı sürerken dinamik içe aktarım kilitlenirdi).
  if (arg.includes('--etki-doldur') || arg.includes('--etki')) {
    const betik = join(dirname(fileURLToPath(import.meta.url)), arg.includes('--etki-doldur') ? 'dizin-etki-doldur.mjs' : 'dizin-etki.mjs')
    const r = spawnSync(process.execPath, [betik, ...arg], { stdio: 'inherit', env: process.env })
    process.exit(r.status ?? 2)
  }

  // SEO-118: --kalan/--sinir bağımsız değişkenleri AĞA gitmeden doğrulanır (değersiz --kalan sessizce --durum akışına düşmesin).
  if (arg.includes('--kalan') && !MOTORLAR.includes(deger('--kalan'))) { console.error(`HATA: --kalan motoru ${MOTORLAR.join('|')} olmalı`); process.exit(2) }
  if (arg.includes('--sinir') && (!Number.isInteger(Number(deger('--sinir'))) || Number(deger('--sinir')) < 1)) { console.error('HATA: --sinir pozitif tam sayı olmalı'); process.exit(2) }

  // --durum (varsayılan)
  // --cikti verilmezse durum anlık görüntüsü defterin klasörüne yazılır: sonuç geçmişi (hangi gün dizine girdi) kaybolmaz.
  const cikti = deger('--cikti') || dirname(defter)
  yolKontrol(cikti, '--cikti')
  const gun = deger('--gun') ? Number(deger('--gun')) : Infinity
  if (deger('--gun') && (!Number.isFinite(gun) || gun < 1)) { console.error('HATA: --gun pozitif sayı olmalı'); process.exit(2) }
  const { hareketler, atlanan } = defterOku(defter)
  let xml
  try { xml = await (await fetch(`${SITE}/sitemap.xml`)).text() } catch (e) { console.error(`HATA: site haritası okunamadı: ${e.message}`); process.exit(1) }
  const harita = haritaCoz(xml)
  if (!harita.length) { console.error('HATA: site haritası boş ya da çözülemedi (sessiz sıfır yok)'); process.exit(1) }
  const ek = (deger('--adres') || '').split(',').map((s) => s.trim()).filter(Boolean).map((a) => (a.startsWith('http') ? a : `${SITE}${a}`))
  const simdi = Date.now()
  // SEO-147: git geçmişinden eklenen etki satırları (kaynak git-gecmisi) takip kapsamını GENİŞLETMEZ (yayından kalkmış adres tabloya girmesin).
  const kapsam = kapsamSec({ harita, hareketler: hareketler.filter((h) => h.kaynak !== GIT_GECMISI), gun, simdi, ek })
  // SEO-115: değişen adres listesi. --degisen açıkça verildiyse dosya ZORUNLU; verilmediyse defter klasöründeki varsayılan dosya varsa okunur.
  const degisenArg = deger('--degisen') || process.env.DIZIN_TAKIP_DEGISEN
  const degisenYol = resolve(degisenArg || join(dirname(defter), DEGISEN_DOSYA_ADI))
  if (degisenArg) {
    yolKontrol(degisenYol, '--degisen')
    if (!existsSync(degisenYol)) { console.error(`HATA: --degisen dosyası yok: ${degisenYol}`); process.exit(2) }
  }
  const degisenSonuc = existsSync(degisenYol) ? degisenCoz(readFileSync(degisenYol, 'utf8')) : { kayitlar: new Map(), atlanan: 0 }
  const adresler = kapsam.map((k) => k.adres)
  const olcum = { google: await googleOlc(adresler), bing: await bingOlc(adresler), yandex: {}, indexnow: {} }
  const tablo = tabloUret({ kapsam, hareketler, olcum, simdi, degisen: degisenBirlestir(degisenSonuc.kayitlar, degisenDefterden(hareketler)) })
  // SEO-118: --kalan <motor> [--sinir N] yalnız o motorun YAP/TEKRAR adreslerini satır satır basar (günlük tur listesi; elle liste yok).
  if (arg.includes('--kalan')) {
    const kalanMotor = deger('--kalan')
    if (!MOTORLAR.includes(kalanMotor)) { console.error(`HATA: --kalan motoru ${MOTORLAR.join('|')} olmalı`); process.exit(2) }
    const sinir = deger('--sinir') ? Number(deger('--sinir')) : Infinity
    if (deger('--sinir') && (!Number.isInteger(sinir) || sinir < 1)) { console.error('HATA: --sinir pozitif tam sayı olmalı'); process.exit(2) }
    const liste = kalanListe(tablo, kalanMotor, sinir)
    const olculemeyen = olculemediSayisi(tablo, kalanMotor)
    if (liste.length) console.log(liste.join('\n'))
    // Sessiz sıfır yok: ölçülemeyen adres "yapılacak yok" diye okunmaz.
    if (olculemeyen) { console.error(`UYARI: ${kalanMotor} için ${olculemeyen}/${tablo.length} adreste durum okunamadı (OLCULEMEDI); liste eksik olabilir${liste.length ? '' : ', "kalan yok" DEĞİL'}`); process.exit(1) }
    if (!liste.length) console.error(`kalan yok: ${kalanMotor} için YAP/TEKRAR adres yok (ölçüm temiz)`)
    return
  }
  const md = markdownYaz(tablo, simdi)
  console.log(md)
  if (atlanan) console.log(`\nUYARI: defterde ${atlanan} geçersiz satır atlandı`)
  if (degisenSonuc.kayitlar.size || degisenSonuc.atlanan) console.log(`\nDEĞİŞEN LİSTESİ: ${degisenSonuc.kayitlar.size} adres${degisenSonuc.atlanan ? ` · UYARI: ${degisenSonuc.atlanan} bozuk satır atlandı` : ''}`)
  const olculemedi = tablo.filter((s) => s.google.durum === 'OLCULEMEDI' || s.bing.durum === 'OLCULEMEDI').length
  if (cikti) {
    mkdirSync(resolve(cikti), { recursive: true })
    writeFileSync(join(resolve(cikti), `dizin-takip-${new Date(simdi).toISOString().slice(0, 10)}.json`), JSON.stringify({ alinma: new Date(simdi).toISOString(), gun, atlanan, tablo }, null, 1))
  }
  if (olculemedi) { console.error(`UYARI: ${olculemedi} adreste Google/Bing durumu okunamadı (OLCULEMEDI)`); process.exit(1) }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await calistir()
