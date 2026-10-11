#!/usr/bin/env node
/**
 * BING WEBMASTER OKUMA — Bing Webmaster API (JSON), SALT OKUMA (SEO-9, OPS-106). Cetvel:
 * docs/standards/dizin-sistemleri-standard.md (D3 ölçüm sınırları), yayin-gorunurluk-denetim-standard.md, geo-olcum-standard.md.
 *
 * NİÇİN: Supermetrics denemesi 14 Ekim'de bitiyor ve ücretli plan yok; Bing verisini (tık/gösterim, sorgu ve sayfa, tarama ve
 * dizin sayaçları, site haritası durumu) başka okuyan yok. SEO-28 D-1/D0/D+1/D+7 tablosu bu çıktıdan beslenir. `--url-bilgi`
 * Supermetrics'te OLMAYAN sayfa bazında Bing durumunu verir (GetUrlInfo: son tarama, keşif tarihi, HTTP kodu): SEO-12 kanıtı.
 *
 * ⛔ ANAHTAR yalnız dosyadan okunur (BING_WEBMASTER_ANAHTAR_DOSYASI, yoksa ~/.claude/bing-webmaster-anahtar.txt; 32 onaltılı
 * hane). Hiçbir çıktıya, hata mesajına, loga ve JSON'a yazılmaz: anahtar adres sorgusunda taşındığı için ağ hatası metni de
 * maskelenir (`maskele`). Çıktı depoya GİRMEZ (repo PUBLIC; pazar-olcum P6): --cikti depo içindeyse betik REDDEDER.
 * "KÖR KAPI YOK": boş yanıt OLCULEMEDI yazılır, sıfır sayılmaz. Her yöntemin en son veri tarihi çıktıda görünür (Bing
 * sayaçları günlerce gecikmeli; tarihi olmayan sayı tazelik kanıtı değildir).
 *
 * Kullanım: node scripts/seo/bing-webmaster-oku.mjs --cikti <depo-dışı klasör> [--site https://venthub.com.tr/]
 *           [--url-bilgi <adres,adres,... | dosya.txt>] [--gun 30]
 * Çıkış: 0 tüm yöntemler TAMAM ya da OLCULEMEDI · 1 en az bir HATA (anahtar geçersiz, yetki, ağ, bozuk yanıt) · 2 araç koşmadı.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const API = 'https://ssl.bing.com/webmaster/api.svc/json'
const ANAHTAR_DESENI = /^[0-9a-f]{32}$/i
export const VARSAYILAN_ANAHTAR_DOSYASI = join(homedir(), '.claude', 'bing-webmaster-anahtar.txt')
/** Site düzeyinde okunan yöntemler (belge: iwebmasterapi). GetUserSites anahtar ve site doğrulamasını ayrıca yapar. */
export const SITE_YONTEMLERI = ['GetRankAndTrafficStats', 'GetQueryStats', 'GetPageStats', 'GetCrawlStats', 'GetCrawlIssues', 'GetFeeds']
const HATA_DURUMLARI = new Set(['ANAHTAR-GECERSIZ', 'YETKI-YOK', 'API-HATASI', 'HTTP-HATASI', 'AG-HATASI', 'YANIT-BOZUK'])

export const anahtarDosyasiYolu = (env = process.env) => env.BING_WEBMASTER_ANAHTAR_DOSYASI || VARSAYILAN_ANAHTAR_DOSYASI

/**
 * Anahtarı dosyadan okur. Hata nedeni yalnız KOD olarak döner (yol ve içerik taşımaz).
 * @returns {{ anahtar: string } | { hata: 'ANAHTAR-DOSYASI-YOK' | 'ANAHTAR-BICIMI' }}
 */
export function anahtarOku(yol, oku = (y) => readFileSync(y, 'utf8')) {
  let ham
  try { ham = oku(yol) } catch { return { hata: 'ANAHTAR-DOSYASI-YOK' } }
  const anahtar = String(ham).trim()
  return ANAHTAR_DESENI.test(anahtar) ? { anahtar } : { hata: 'ANAHTAR-BICIMI' }
}

/** Metindeki anahtarı (her yazımıyla) ve `apikey=` değerlerini siler. Ağ hatası ve API mesajı buradan geçer. */
export function maskele(metin, anahtar) {
  let s = String(metin ?? '')
  if (anahtar) for (const bicim of new Set([anahtar, encodeURIComponent(anahtar), anahtar.toLowerCase(), anahtar.toUpperCase()])) s = s.split(bicim).join('***')
  return s.replace(/(apikey=)[^&\s"']+/gi, '$1***')
}

/** Bing JSON tarihi "/Date(1315349995266-0700)/" → ISO (UTC); tanınmazsa null. */
export function msTarih(deger) {
  const m = /^\/Date\((-?\d+)(?:[+-]\d{4})?\)\/$/.exec(String(deger ?? ''))
  return m ? new Date(Number(m[1])).toISOString() : null
}

/** API yanıtını durum koduna çevirir. Boş yanıt OLCULEMEDI'dir; HİÇBİR koşulda sıfır sayılmaz. */
export function yanitCoz(httpDurum, govdeMetni, anahtar) {
  let govde
  try { govde = JSON.parse(govdeMetni) } catch { govde = undefined }
  if (httpDurum === 401 || httpDurum === 403) return { durum: 'YETKI-YOK', http: httpDurum }
  if (httpDurum === 400 && govde && typeof govde.ErrorCode === 'number') {
    return {
      durum: govde.ErrorCode === 3 ? 'ANAHTAR-GECERSIZ' : 'API-HATASI', http: 400, hataKodu: govde.ErrorCode,
      mesaj: maskele(govde.Message, anahtar).slice(0, 120),
    }
  }
  if (httpDurum !== 200) return { durum: 'HTTP-HATASI', http: httpDurum }
  if (govde === undefined) return { durum: 'YANIT-BOZUK', http: 200 }
  const d = govde.d
  if (d === undefined || d === null) return { durum: 'OLCULEMEDI', http: 200, neden: 'd alanı yok' }
  if (Array.isArray(d)) return d.length ? { durum: 'TAMAM', http: 200, satirlar: d } : { durum: 'OLCULEMEDI', http: 200, neden: 'boş liste' }
  return { durum: 'TAMAM', http: 200, nesne: d }
}

export function adresKur(yontem, { anahtar, siteUrl, url } = {}) {
  const q = []
  if (siteUrl !== undefined) q.push(`siteUrl=${encodeURIComponent(siteUrl)}`)
  if (url !== undefined) q.push(`url=${encodeURIComponent(url)}`)
  q.push(`apikey=${encodeURIComponent(anahtar)}`)
  return `${API}/${yontem}?${q.join('&')}`
}

async function cagir(fetchFn, adres, anahtar) {
  try {
    const r = await fetchFn(adres, { headers: { accept: 'application/json' } })
    return yanitCoz(r.status, await r.text(), anahtar)
  } catch (e) {
    return { durum: 'AG-HATASI', mesaj: maskele(e?.cause?.code || e?.message || e, anahtar).slice(0, 160) }
  }
}

const enBuyukTarih = (satirlar, alan) =>
  satirlar.map((s) => msTarih(s[alan])).filter(Boolean).sort().at(-1) ?? null

/** Yöntem yanıtından SEO-28 tablosuna girecek kısa özet. `bugun` ve `gun` pencereyi belirler (varsayılan son 30 gün). */
export function ozetle(yontem, sonuc, gun = 30, bugun = new Date()) {
  const s = sonuc.satirlar ?? []
  const esik = new Date(bugun.getTime() - gun * 86400000).toISOString()
  const pencere = (alan) => s.filter((x) => (msTarih(x[alan]) ?? '') >= esik)
  switch (yontem) {
    case 'GetRankAndTrafficStats': {
      const p = pencere('Date')
      return { satir: s.length, sonTarih: enBuyukTarih(s, 'Date'), pencereGun: gun, tik: p.reduce((t, x) => t + (x.Clicks || 0), 0), gosterim: p.reduce((t, x) => t + (x.Impressions || 0), 0) }
    }
    case 'GetQueryStats':
    case 'GetPageStats': {
      const p = pencere('Date')
      const toplam = new Map()
      for (const x of p) toplam.set(x.Query, (toplam.get(x.Query) || 0) + (x.Impressions || 0))
      return {
        satir: s.length, sonTarih: enBuyukTarih(s, 'Date'), pencereGun: gun, tekil: toplam.size,
        enCok: [...toplam].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([ad, gosterim]) => ({ ad, gosterim })),
      }
    }
    case 'GetCrawlStats': {
      const son = [...s].sort((a, b) => (msTarih(a.Date) ?? '').localeCompare(msTarih(b.Date) ?? '')).at(-1)
      return son && {
        satir: s.length, sonTarih: msTarih(son.Date), dizindeSayfa: son.InIndex, taranan: son.CrawledPages, hata: son.CrawlErrors,
        kod2xx: son.Code2xx, kod301: son.Code301, kod4xx: son.Code4xx, kod5xx: son.Code5xx, robotsEngel: son.BlockedByRobotsTxt,
      }
    }
    case 'GetCrawlIssues':
      return { satir: s.length, ilk: s.slice(0, 20).map((x) => ({ url: x.Url, http: x.HttpCode, sorun: x.Issues })) }
    case 'GetFeeds':
      return {
        satir: s.length,
        haritalar: s.map((x) => ({ url: x.Url, durum: x.Status, urlSayisi: x.UrlCount, sonTarama: msTarih(x.LastCrawled), gonderim: msTarih(x.Submitted) })),
      }
    default:
      return { satir: s.length }
  }
}

/** Tek adres için sayfa bazında Bing durumu (GetUrlInfo). */
export function urlBilgiOzet(adres, sonuc) {
  if (sonuc.durum !== 'TAMAM') return { adres, durum: sonuc.durum, neden: sonuc.neden ?? sonuc.mesaj ?? null }
  const n = sonuc.nesne
  return {
    adres, durum: 'TAMAM', httpDurum: n.HttpStatus, sayfaMi: n.IsPage, sonTarama: msTarih(n.LastCrawledDate), kesif: msTarih(n.DiscoveryDate),
    boyut: n.DocumentSize, baglantiSayisi: n.AnchorCount,
  }
}

/**
 * Tüm okumayı yapar; ağ ve dosya erişimi enjekte edilir (testlerde sahte `fetchFn`). GetUserSites anahtarı doğrular:
 * geçersizse kalan yöntemler çağrılmaz (boşuna istek ve sahte sıfır yok).
 * @param {{
 *   fetchFn?: (adres: string, init?: object) => Promise<{ status: number, text: () => Promise<string> }>,
 *   anahtar: string, siteUrl: string, urlBilgi?: string[], gun?: number, bugun?: Date, bekleMs?: number,
 * }} p
 */
export async function oku({ fetchFn = fetch, anahtar, siteUrl, urlBilgi = [], gun = 30, bugun = new Date(), bekleMs = 200 }) {
  const bekle = (ms) => new Promise((r) => setTimeout(r, ms))
  const yontemler = {}
  const ham = {}
  const kullanici = await cagir(fetchFn, adresKur('GetUserSites', { anahtar }), anahtar)
  const siteler = kullanici.satirlar ?? []
  yontemler.GetUserSites = {
    durum: kullanici.durum, ...(kullanici.neden && { neden: kullanici.neden }), ...(kullanici.mesaj && { mesaj: kullanici.mesaj }),
    siteler: siteler.map((x) => ({ url: x.Url, dogrulandi: x.IsVerified })),
  }
  if (kullanici.durum === 'ANAHTAR-GECERSIZ' || kullanici.durum === 'YETKI-YOK') return { yontemler, ham, urlBilgi: [], durdu: kullanici.durum }
  for (const y of SITE_YONTEMLERI) {
    await bekle(bekleMs)
    const s = await cagir(fetchFn, adresKur(y, { anahtar, siteUrl }), anahtar)
    yontemler[y] = { durum: s.durum, ...(s.http && { http: s.http }), ...(s.neden && { neden: s.neden }), ...(s.mesaj && { mesaj: s.mesaj }) }
    if (s.durum === 'TAMAM') { yontemler[y].ozet = ozetle(y, s, gun, bugun); ham[y] = s.satirlar ?? s.nesne }
  }
  const urlSonuclari = []
  for (const adres of urlBilgi) {
    await bekle(bekleMs)
    urlSonuclari.push(urlBilgiOzet(adres, await cagir(fetchFn, adresKur('GetUrlInfo', { anahtar, siteUrl, url: adres }), anahtar)))
  }
  return { yontemler, ham, urlBilgi: urlSonuclari, durdu: null }
}

export const cikisKodu = (sonuc) =>
  sonuc.durdu || Object.values(sonuc.yontemler).some((y) => HATA_DURUMLARI.has(y.durum)) || sonuc.urlBilgi.some((u) => HATA_DURUMLARI.has(u.durum)) ? 1 : 0

/**
 * Yol bir git deposunun içindeyse true (anahtar dosyası ve ham çıktı depoya girmesin; gsc-token.cjs ile aynı kural).
 * @param {string} yol
 * @param {(yol: string) => boolean} [varMi] testte sahte dosya sistemi
 */
export function depoIcindeMi(yol, varMi = existsSync) {
  let d = dirname(resolve(yol))
  for (;;) {
    if (varMi(join(d, '.git'))) return true
    const ust = dirname(d)
    if (ust === d) return false
    d = ust
  }
}

async function calistir() {
  const arg = process.argv.slice(2)
  const deger = (b) => { const i = arg.indexOf(b); return i >= 0 ? arg[i + 1] : undefined }
  const cikti = deger('--cikti')
  const siteUrl = deger('--site') || 'https://venthub.com.tr/'
  const gun = Number(deger('--gun') || 30)
  if (!cikti) { console.error('HATA: --cikti <depo-dışı klasör> zorunlu'); process.exit(2) }
  if (depoIcindeMi(join(resolve(cikti), 'x'))) { console.error('HATA: --cikti bir git deposunun içinde (repo PUBLIC); depo dışı klasör ver'); process.exit(2) }
  if (!Number.isFinite(gun) || gun < 1) { console.error('HATA: --gun pozitif sayı olmalı'); process.exit(2) }
  const k = anahtarOku(anahtarDosyasiYolu())
  if (k.hata) { console.error(`HATA: ${k.hata} (BING_WEBMASTER_ANAHTAR_DOSYASI ya da varsayılan dosya; 32 onaltılı hane beklenir)`); process.exit(2) }
  const ub = deger('--url-bilgi')
  const urlBilgi = !ub ? [] : /\.txt$/i.test(ub) ? readFileSync(ub, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean) : ub.split(',').map((s) => s.trim()).filter(Boolean)
  const sonuc = await oku({ anahtar: k.anahtar, siteUrl, urlBilgi, gun })
  const alinma = new Date().toISOString()
  mkdirSync(resolve(cikti), { recursive: true })
  const dosya = join(resolve(cikti), `bing-webmaster-${alinma.slice(0, 10)}.json`)
  writeFileSync(dosya, JSON.stringify({ alinma, site: siteUrl, gun, ...sonuc }, null, 1))
  for (const [y, v] of Object.entries(sonuc.yontemler)) {
    const o = v.ozet
    console.log(`${y.padEnd(24)} ${v.durum}${v.neden ? ` (${v.neden})` : ''}${o?.sonTarih ? ` · son veri ${o.sonTarih.slice(0, 10)}` : ''}${o?.satir !== undefined ? ` · ${o.satir} satır` : ''}`)
  }
  for (const u of sonuc.urlBilgi) console.log(`GetUrlInfo ${u.durum} ${u.adres}${u.sonTarama ? ` · son tarama ${u.sonTarama.slice(0, 10)}` : ''}${u.httpDurum !== undefined ? ` · http ${u.httpDurum}` : ''}`)
  console.log(`çıktı: ${dosya}`)
  process.exit(cikisKodu(sonuc))
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await calistir()
