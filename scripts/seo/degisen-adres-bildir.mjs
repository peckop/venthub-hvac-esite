#!/usr/bin/env node
/**
 * DEĞİŞEN ADRES BİLDİRİCİ (Kanban SEO-55, Parça B; cetvel docs/standards/yayin-gorunurluk-denetim-standard.md Y2.1;
 * ölçüm ve tasarım: docs/audits/geo-dizin-tetigi-olcum-2026-10-16.md).
 *
 * NİÇİN VAR: sayfa metni, adresi ya da şablonu canlıda değişince arama motorlarına haber gitmesi bir insanın akıl etmesine
 * bağlıydı (FC 101 olayı). Webhook yalnız DB yazımını görür ve K4 süzgeci ürün/kategori/marka adreslerini düşürür; kod
 * deploy'u hiç görünmez. Bu betik DB tetiğinden BAĞIMSIZ çalışır: canlı site haritasını ve her adresin
 * `title / meta description / H1` özetini (SHA-256) önceki TABAN ile karşılaştırır, farkı bulur ve bildirir.
 *
 * NE YAPAR (sırayla): site haritasını oku → her adresi çek (200 ve kanonik = kendisi değilse "sorunlu", bildirilmez)
 * → tabanla karşılaştır → fark = yeni adres, metin değişimi (özet farkı), yalnız lastmod farkı; öncelik bu sırayladır
 * → `--uygula` ile: IndexNow'a gönder (K4 kapısından geçenler), Google kuyruğuna ekle, tabanı güncelle.
 *
 * KİPLER:
 *   (varsayılan, = --kuru)  Hiçbir şey yazmaz, göndermez; farkı basar.
 *   --taban-kur             Tabanı ilk kez kurar (hiçbir şey bildirmez). Taban yokken --uygula REDDEDİLİR: ilk koşuda
 *                           "bütün harita yeni" diye 90 adres bildirmek ölçüm değildir.
 *   --uygula                IndexNow + kuyruk + taban güncelle (aşağıdaki kurallarla).
 *   --kuyruk-sonraki [N]    Google kuyruğundan sıradaki N adresi basar (varsayılan 11 = günlük sınır, SEO-54 ölçümü).
 *   --kuyruk-tamam a,b      Verilen adresleri kuyruktan çıkarır (Search Console'da dizin isteği alınanlar).
 *
 * KURALLAR:
 *   - Taban ve kuyruk DEPO DIŞINDA durur (P6: arama/sayfa verisi depoya yazılmaz); depo içi yol exit 2.
 *   - K4 (2026-09-03; karar 164 A) karar 376 (2026-10-16) ile GEVŞEDİ: `K4_GEVSEK = true` iken bayrak kapalıyken de haritadaki
 *     (200 + kanonik=kendisi) her değişen adres IndexNow'a gider. `K4_GEVSEK = false` yapılırsa eski kural döner: yalnız
 *     yayında DEĞİŞMEYEN adresler gider (`degismeyenMi`); ürün/kategori/marka adresleri GİTMEZ ama Google kuyruğuna girer ve
 *     tabanları GÜNCELLENMEZ, böylece kapı açılınca bir sonraki koşu onları gönderir.
 *   - IndexNow reddederse (2xx dışı) gönderilen adreslerin tabanı güncellenmez: bir sonraki koşu yeniden dener.
 *   - Okunamayan adres (ağ hatası, 5xx) "kaldırıldı" sayılmaz; tabandaki eski kaydı KALIR. Okunamayan oranı
 *     `OKUNAMAYAN_AZAMI`'yı aşarsa koşu DURUR ve hiçbir şey yazmaz.
 *   - IndexNow anahtarı kamuya açıktır (`src/config/indexnow.ts`); `INDEXNOW_KEY` ortam değişkeni yalnız geçersiz kılar.
 *
 * KULLANIM:
 *   node scripts/seo/degisen-adres-bildir.mjs --taban C:/tmp/vh-arsiv/geo-seo/taban.json --kuyruk C:/tmp/vh-arsiv/geo-seo/google-kuyruk.jsonl --taban-kur
 *   node scripts/seo/degisen-adres-bildir.mjs --taban … --kuyruk …            (kuru: farkı gösterir)
 *   node scripts/seo/degisen-adres-bildir.mjs --taban … --kuyruk … --uygula
 *   node scripts/seo/degisen-adres-bildir.mjs --kuyruk … --kuyruk-sonraki 11
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { k3bOku } from '../../src/config/markaYonlendirmeleri.mjs'

import { degismeyenMi, kanonikAdres } from './yayin-kapisi.mjs'

const ENDPOINT = 'https://api.indexnow.org/indexnow'
const MAX_URL = 10_000
const DEPO_KOKU = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

/**
 * K4 gevşetme anahtarı. TRUE (karar 376, 2026-10-16): haritada olan ve 200 + kanonik=kendisi veren her değişen adres, adres
 * şeması bayrağı kapalıyken de IndexNow'a gider. FALSE yapılırsa eski K4 geçerli olur (yalnız yayında değişmeyen türler gider,
 * ürün/kategori/marka adresleri kuyruğa girer ve tabanı eski kalır); geri dönüş için tek satır.
 */
export const K4_GEVSEK = true

/** Okunamayan adres oranı bunu aşarsa koşu durur (site kesintisinde "her şey değişti/kalktı" demesin). */
export const OKUNAMAYAN_AZAMI = 0.2

/** Günlük Google dizin isteği sınırı (Search Console arayüzü; SEO-54 ölçümü 16 Ekim 2026). */
export const GOOGLE_GUNLUK = 11

/** Değişim türleri, öncelik sırasıyla (küçük sayı = önce). */
export const ONCELIK = Object.freeze({ yeni: 0, metin: 1, lastmod: 2 })

// ─────────────────────────────── saf çekirdek (ağsız) ───────────────────────────────

const VARLIKLAR = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

/** Küçük HTML varlık çözücü: adlandırılmış beş varlık ve sayısal (onluk/onaltılı) varlıklar. */
function varlikCoz(metin) {
  return metin.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (tam, ad) => {
    if (ad[0] === '#') {
      const kod = ad[1] === 'x' || ad[1] === 'X' ? parseInt(ad.slice(2), 16) : parseInt(ad.slice(1), 10)
      return Number.isFinite(kod) && kod > 0 && kod < 0x110000 ? String.fromCodePoint(kod) : tam
    }
    return VARLIKLAR[ad.toLowerCase()] ?? tam
  })
}

function temizle(metin) {
  return varlikCoz(metin.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
}

/**
 * Sayfa HTML'inden `title`, `meta description` ve ilk `h1`'i çıkarır. Bulunamayan alan boş metindir (null değil): özet
 * karşılaştırması alan kaybolunca da fark üretsin.
 * @param {string} html
 * @returns {{ baslik: string, aciklama: string, h1: string }}
 */
export function sayfaOzeti(html) {
  const govde = html.replace(/<!--[\s\S]*?-->/g, '')
  const baslik = govde.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)
  const h1 = govde.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)
  let aciklama = ''
  for (const m of govde.matchAll(/<meta\b[^>]*>/gi)) {
    if (!/\bname\s*=\s*["']?description["']?(?=[\s>/"'])/i.test(m[0])) continue
    const c = m[0].match(/\bcontent\s*=\s*"([^"]*)"|\bcontent\s*=\s*'([^']*)'/i)
    aciklama = c ? (c[1] ?? c[2] ?? '') : ''
    break
  }
  return { baslik: baslik ? temizle(baslik[1]) : '', aciklama: varlikCoz(aciklama).replace(/\s+/g, ' ').trim(), h1: h1 ? temizle(h1[1]) : '' }
}

/** Özetin kısa parmak izi (SHA-256, ilk 16 hane). Ham metin tabana YAZILMAZ. */
export function ozetHash(ozet) {
  return createHash('sha256').update(`${ozet.baslik}\n${ozet.aciklama}\n${ozet.h1}`).digest('hex').slice(0, 16)
}

/**
 * Site haritasını okur. Boş harita ve harita dizini (sitemapindex) HATADIR: boş kümeyi karşılaştırmak ölçüm değildir.
 * @param {string} xml
 * @returns {{ adres: string, lastmod: string | null }[]}
 */
export function sitemapOku(xml) {
  if (/<sitemapindex/i.test(xml)) throw new Error('site haritası bir DİZİN (sitemapindex): alt haritaları tek tek besle')
  const sonuc = []
  const goruldu = new Set()
  for (const blok of xml.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)) {
    const loc = blok[1].match(/<loc>\s*([^<\s]+)\s*<\/loc>/i)
    if (!loc || goruldu.has(loc[1])) continue
    goruldu.add(loc[1])
    const lm = blok[1].match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/i)
    sonuc.push({ adres: loc[1], lastmod: lm ? lm[1] : null })
  }
  if (sonuc.length === 0) throw new Error('site haritası boş okundu')
  return sonuc
}

/**
 * Taban ile şimdiki durumu karşılaştırır.
 * @param {Record<string, { hash: string, lastmod: string | null }>} taban
 * @param {Record<string, { hash: string, lastmod: string | null }>} simdi yalnız BAŞARIYLA okunan adresler
 * @returns {{ degisimler: { adres: string, tur: 'yeni' | 'metin' | 'lastmod' }[], kalkan: string[], ayni: number }}
 */
export function farkHesapla(taban, simdi) {
  const degisimler = []
  let ayni = 0
  for (const [adres, k] of Object.entries(simdi)) {
    const eski = taban[adres]
    if (!eski) degisimler.push({ adres, tur: 'yeni' })
    else if (eski.hash !== k.hash) degisimler.push({ adres, tur: 'metin' })
    else if ((eski.lastmod ?? null) !== (k.lastmod ?? null)) degisimler.push({ adres, tur: 'lastmod' })
    else ayni += 1
  }
  degisimler.sort((a, b) => ONCELIK[a.tur] - ONCELIK[b.tur] || a.adres.localeCompare(b.adres))
  const kalkan = Object.keys(taban).filter((a) => !(a in simdi)).sort()
  return { degisimler, kalkan, ayni }
}

/**
 * IndexNow'a gidecek ve gitmeyecek değişimleri ayırır (K4 kapısı; dosya başı açıklama).
 * @param {{ adres: string, tur: string }[]} degisimler
 * @param {{ k3bAcik: boolean, k4Gevsek?: boolean }} secenek
 * @returns {{ gidecek: string[], bekleyen: string[] }}
 */
export function indexNowPlani(degisimler, { k3bAcik, k4Gevsek = K4_GEVSEK }) {
  const serbest = k3bAcik || k4Gevsek
  const gidecek = []
  const bekleyen = []
  for (const d of degisimler) (serbest || degismeyenMi(d.adres) ? gidecek : bekleyen).push(d.adres)
  return { gidecek, bekleyen }
}

/**
 * Yeni tabanı kurar. Şimdi başarıyla okunan her adres yeni kayıtla girer, ŞU İSTİSNALARLA:
 *  - `eskiKalacak`taki adres (IndexNow'a gitmeyen ya da reddedilen değişim) eski kaydıyla KALIR; eski kaydı yoksa (yeni adres)
 *    HİÇ girmez, böylece bir sonraki koşuda yeniden "değişti" görünür;
 *  - haritada olup şimdi okunamayan ya da sorunlu adresin eski kaydı korunur (geçici arıza "kaldırıldı" sayılmaz);
 *  - haritadan çıkmış adres tabandan düşer.
 * @param {Record<string, any>} taban
 * @param {Record<string, any>} simdi başarıyla okunanlar
 * @param {Set<string>} eskiKalacak
 * @param {Set<string>} haritada sitemap'teki tüm adresler
 */
export function yeniTaban(taban, simdi, eskiKalacak, haritada) {
  const yeni = {}
  for (const [adres, kayit] of Object.entries(taban)) {
    if (!haritada.has(adres)) continue
    if (!(adres in simdi) || eskiKalacak.has(adres)) yeni[adres] = kayit
  }
  for (const [adres, kayit] of Object.entries(simdi)) {
    if (!eskiKalacak.has(adres)) yeni[adres] = kayit
  }
  return yeni
}

/**
 * Google kuyruğunu (JSONL satırları) yeni değişimlerle birleştirir. Aynı adres tek satırdır; tür öncelikli olana yükselir
 * (lastmod → metin → yeni), ilk görülme zamanı KORUNUR. Çıktı öncelik sonra ilk görülme sırasındadır.
 * @param {{ adres: string, tur: string, gorulme: string }[]} mevcut
 * @param {{ adres: string, tur: string }[]} degisimler
 * @param {string} simdiZaman ISO
 */
export function kuyrukBirlestir(mevcut, degisimler, simdiZaman) {
  const harita = new Map(mevcut.map((s) => [s.adres, s]))
  for (const d of degisimler) {
    const var_ = harita.get(d.adres)
    if (!var_) harita.set(d.adres, { adres: d.adres, tur: d.tur, gorulme: simdiZaman })
    else if (ONCELIK[d.tur] < ONCELIK[var_.tur]) harita.set(d.adres, { ...var_, tur: d.tur })
  }
  return [...harita.values()].sort((a, b) => ONCELIK[a.tur] - ONCELIK[b.tur] || a.gorulme.localeCompare(b.gorulme) || a.adres.localeCompare(b.adres))
}

export function jsonlMetni(satirlar) {
  return satirlar.map((s) => JSON.stringify(s)).join('\n') + (satirlar.length > 0 ? '\n' : '')
}

export function jsonlOku(metin) {
  return metin
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .map((s) => JSON.parse(s))
}

/** Yol depo kökünün İÇİNDE mi? (P6: taban ve kuyruk depo içine yazılamaz.) */
export function depoIciMi(yol, depoKoku = DEPO_KOKU) {
  const tam = resolve(yol)
  const kok = resolve(depoKoku)
  return tam === kok || tam.startsWith(kok.endsWith(sep) ? kok : kok + sep)
}

/** IndexNow gövdesi yanıtı: yalnız 200/202 kabul sayılır. */
export function indexNowKabulMu(httpDurum) {
  return httpDurum === 200 || httpDurum === 202
}

// ─────────────────────────────── ağ katmanı ───────────────────────────────

/**
 * Bir adresi çeker. Dönüş: `tamam` (200 + kanonik kendisi + özet), `sorunlu` (200 değil ya da kanonik başka)
 * ya da `okunamadi` (ağ hatası / 5xx: geçici sayılır, adres kaldırılmış SAYILMAZ).
 */
export async function adresOku(fetchFn, adres, zamanAsimiMs = 20_000) {
  try {
    const r = await fetchFn(adres, { headers: { 'user-agent': 'venthub-degisen-adres' }, redirect: 'manual', signal: AbortSignal.timeout(zamanAsimiMs) })
    if (r.status >= 500) return { durum: 'okunamadi', neden: `HTTP ${r.status}` }
    if (r.status !== 200) return { durum: 'sorunlu', neden: `HTTP ${r.status}` }
    const html = await r.text()
    const kanonik = kanonikAdres(html)
    if (kanonik !== adres) return { durum: 'sorunlu', neden: `kanonik ${kanonik ?? 'yok'}` }
    return { durum: 'tamam', ozet: sayfaOzeti(html) }
  } catch (e) {
    return { durum: 'okunamadi', neden: e instanceof Error ? e.message : String(e) }
  }
}

/** Sınırlı eşzamanlılıkla sitemap adreslerini okur. */
export async function haritayiTara(fetchFn, kayitlar, siteHost, esZamanli = 4) {
  const simdi = {}
  const sorunlu = []
  const okunamayan = []
  const yabanci = kayitlar.filter((k) => new URL(k.adres).host !== siteHost)
  if (yabanci.length > 0) throw new Error(`${yabanci.length} adres ${siteHost} dışında: ${yabanci[0].adres}`)
  let sira = 0
  async function iscı() {
    while (sira < kayitlar.length) {
      const k = kayitlar[sira++]
      const s = await adresOku(fetchFn, k.adres)
      if (s.durum === 'tamam') simdi[k.adres] = { hash: ozetHash(s.ozet), lastmod: k.lastmod }
      else if (s.durum === 'sorunlu') sorunlu.push(`${k.adres} (${s.neden})`)
      else okunamayan.push(`${k.adres} (${s.neden})`)
    }
  }
  await Promise.all(Array.from({ length: Math.min(esZamanli, kayitlar.length) }, iscı))
  return { simdi, sorunlu, okunamayan }
}

export async function indexNowGonder(fetchFn, { host, anahtar, siteUrl, adresler }) {
  if (adresler.length === 0) return { durum: 'bos' }
  if (adresler.length > MAX_URL) throw new Error(`${adresler.length} adres, tek istek sınırı ${MAX_URL}`)
  const r = await fetchFn(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key: anahtar, keyLocation: `${siteUrl}/${anahtar}.txt`, urlList: adresler }),
  })
  return indexNowKabulMu(r.status) ? { durum: 'gonderildi', http: r.status, adet: adresler.length } : { durum: 'reddedildi', http: r.status, adet: adresler.length }
}

function anahtarOku() {
  const ortam = process.env.INDEXNOW_KEY?.trim()
  if (ortam) return ortam
  const m = readFileSync(resolve(DEPO_KOKU, 'src/config/indexnow.ts'), 'utf8').match(/INDEXNOW_ANAHTARI\s*(?::\s*string\s*)?=\s*['"]([a-f0-9]{8,128})['"]/i)
  if (!m) throw new Error('IndexNow anahtarı src/config/indexnow.ts içinde okunamadı')
  return m[1]
}

// ─────────────────────────────── dosya yardımcıları ───────────────────────────────

function atomikYaz(yol, metin) {
  mkdirSync(dirname(resolve(yol)), { recursive: true })
  const gecici = `${yol}.tmp-${process.pid}`
  writeFileSync(gecici, metin, 'utf8')
  renameSync(gecici, yol)
}

function tabanOku(yol) {
  if (!existsSync(yol)) return null
  const nesne = JSON.parse(readFileSync(yol, 'utf8'))
  if (typeof nesne !== 'object' || nesne === null || Array.isArray(nesne) || typeof nesne.adresler !== 'object') throw new Error(`taban biçimi bozuk: ${yol}`)
  return nesne.adresler
}

function tabanYaz(yol, adresler, zaman) {
  atomikYaz(yol, JSON.stringify({ surum: 1, guncelleme: zaman, adresler }, null, 1) + '\n')
}

function kuyrukOku(yol) {
  return existsSync(yol) ? jsonlOku(readFileSync(yol, 'utf8')) : []
}

// ─────────────────────────────── CLI ───────────────────────────────

function arg(ad, varsayilan = undefined) {
  const i = process.argv.indexOf(ad)
  if (i === -1) return varsayilan
  const sonraki = process.argv[i + 1]
  return sonraki && !sonraki.startsWith('--') ? sonraki : true
}

function dur(kod, mesaj) {
  console.error(mesaj)
  process.exit(kod)
}

/** Dışa açık çalıştırıcı: testler `fetchFn` ve zaman enjekte eder; CLI gerçek `fetch` verir. */
export async function calistir({ fetchFn = fetch, site, tabanYolu, kuyrukYolu, kip, k3bAcik, k4Gevsek = K4_GEVSEK, anahtar, zaman = new Date().toISOString(), cikti = console.log }) {
  const siteUrl = site.replace(/\/+$/, '')
  const host = new URL(siteUrl).host
  const harita = await fetchFn(`${siteUrl}/sitemap.xml`, { headers: { 'user-agent': 'venthub-degisen-adres' } })
  if (!harita.ok) return { cikis: 1, mesaj: `site haritası okunamadı: HTTP ${harita.status}` }
  let kayitlar
  try { kayitlar = sitemapOku(await harita.text()) } catch (e) { return { cikis: 1, mesaj: e.message } }

  const taban = tabanOku(tabanYolu)
  if (taban === null && kip === 'uygula') return { cikis: 2, mesaj: 'taban yok: önce --taban-kur ile ilk tabanı kur (ilk koşuda "bütün harita yeni" bildirilmez)' }

  const { simdi, sorunlu, okunamayan } = await haritayiTara(fetchFn, kayitlar, host)
  if (okunamayan.length / kayitlar.length > OKUNAMAYAN_AZAMI) {
    return { cikis: 1, mesaj: `${okunamayan.length}/${kayitlar.length} adres okunamadı (azami %${OKUNAMAYAN_AZAMI * 100}): site kesintisi olabilir, hiçbir şey yazılmadı` }
  }
  cikti(`harita ${kayitlar.length} adres · okunan ${Object.keys(simdi).length} · sorunlu ${sorunlu.length} · okunamayan ${okunamayan.length}`)
  for (const s of sorunlu) cikti(`  SORUNLU (bildirilmez): ${s}`)
  for (const s of okunamayan) cikti(`  OKUNAMADI (taban korunur): ${s}`)

  const haritada = new Set(kayitlar.map((k) => k.adres))
  if (kip === 'taban-kur') {
    tabanYaz(tabanYolu, yeniTaban({}, simdi, new Set(), haritada), zaman)
    cikti(`taban kuruldu: ${Object.keys(simdi).length} adres → ${tabanYolu}`)
    return { cikis: 0 }
  }
  if (taban === null) {
    cikti('taban yok: karşılaştırma yapılamaz. İlk tabanı --taban-kur ile kur.')
    return { cikis: 0 }
  }

  const { degisimler, kalkan, ayni } = farkHesapla(taban, simdi)
  const sayim = (t) => degisimler.filter((d) => d.tur === t).length
  cikti(`fark: yeni ${sayim('yeni')} · metin ${sayim('metin')} · lastmod ${sayim('lastmod')} · aynı ${ayni} · kalkan ${kalkan.length}`)
  for (const d of degisimler) cikti(`  ${d.tur.padEnd(7)} ${d.adres}`)
  for (const a of kalkan) cikti(`  KALKAN  ${a} (haritada yok; bildirilmez)`)
  const plan = indexNowPlani(degisimler, { k3bAcik, k4Gevsek })
  cikti(`IndexNow planı: gidecek ${plan.gidecek.length} · K4 bekleyen ${plan.bekleyen.length}`)
  if (kip !== 'uygula') {
    cikti('KURU KOŞUM — hiçbir şey gönderilmedi, yazılmadı.')
    return { cikis: 0 }
  }

  let indexnow = { durum: 'bos' }
  try {
    indexnow = await indexNowGonder(fetchFn, { host, anahtar, siteUrl, adresler: plan.gidecek })
  } catch (e) {
    indexnow = { durum: 'hata', mesaj: e.message }
  }
  cikti(`IndexNow: ${indexnow.durum}${indexnow.http ? ` HTTP ${indexnow.http}` : ''}${indexnow.mesaj ? ` ${indexnow.mesaj}` : ''}`)

  // Google kuyruğu K4'ten bağımsızdır: değişen her adres sıraya girer.
  if (degisimler.length > 0) atomikYaz(kuyrukYolu, jsonlMetni(kuyrukBirlestir(kuyrukOku(kuyrukYolu), degisimler, zaman)))

  const kabul = indexnow.durum === 'gonderildi' || indexnow.durum === 'bos'
  // Tabanı eski bırakılacaklar: K4 bekleyenler, ve IndexNow kabul etmediyse gönderilmeye çalışılan tüm değişimler.
  const eskiKalacak = new Set([...plan.bekleyen, ...(kabul ? [] : plan.gidecek)])
  const yeni = yeniTaban(taban, simdi, eskiKalacak, haritada)
  tabanYaz(tabanYolu, yeni, zaman)
  cikti(`kuyruk ${existsSync(kuyrukYolu) ? kuyrukOku(kuyrukYolu).length : 0} adres · taban ${Object.keys(yeni).length} adres (yeniden denenecek: ${eskiKalacak.size})`)
  return { cikis: kabul ? 0 : 1 }
}

async function cli() {
  const tabanYolu = arg('--taban')
  const kuyrukYolu = arg('--kuyruk')
  const site = arg('--site', 'https://venthub.com.tr')
  if (typeof kuyrukYolu !== 'string') dur(2, 'HATA: --kuyruk <dosya> gerekli (depo dışı bir JSONL yolu).')
  for (const [ad, yol] of [['--taban', tabanYolu], ['--kuyruk', kuyrukYolu]]) {
    if (typeof yol === 'string' && depoIciMi(yol)) dur(2, `HATA: ${ad} depo içinde olamaz (P6: arama/sayfa verisi depoya yazılmaz): ${yol}`)
  }

  const sonraki = arg('--kuyruk-sonraki')
  if (sonraki !== undefined) {
    const n = sonraki === true ? GOOGLE_GUNLUK : Number(sonraki)
    if (!Number.isInteger(n) || n < 1) dur(2, 'HATA: --kuyruk-sonraki sayısı pozitif tam sayı olmalı.')
    const kuyruk = kuyrukOku(kuyrukYolu)
    console.log(`kuyruk ${kuyruk.length} adres; sıradaki ${Math.min(n, kuyruk.length)}:`)
    for (const s of kuyruk.slice(0, n)) console.log(`${s.tur.padEnd(7)} ${s.adres}`)
    process.exit(0)
  }
  const tamam = arg('--kuyruk-tamam')
  if (tamam !== undefined) {
    if (typeof tamam !== 'string') dur(2, 'HATA: --kuyruk-tamam a,b biçiminde adres listesi ister.')
    const cikar = new Set(tamam.split(',').map((s) => s.trim()).filter(Boolean))
    const kuyruk = kuyrukOku(kuyrukYolu)
    const kalan = kuyruk.filter((s) => !cikar.has(s.adres))
    atomikYaz(kuyrukYolu, jsonlMetni(kalan))
    console.log(`kuyruktan çıkarıldı: ${kuyruk.length - kalan.length} · kalan ${kalan.length}`)
    process.exit(0)
  }

  if (typeof tabanYolu !== 'string') dur(2, 'HATA: --taban <dosya> gerekli.')
  const kip = process.argv.includes('--taban-kur') ? 'taban-kur' : process.argv.includes('--uygula') ? 'uygula' : 'kuru'
  if (process.argv.includes('--taban-kur') && process.argv.includes('--uygula')) dur(2, 'HATA: --taban-kur ile --uygula birlikte kullanılamaz.')
  let k3bAcik
  try { k3bAcik = k3bOku(readFileSync(resolve(DEPO_KOKU, 'src/config/features.ts'), 'utf8')) } catch (e) { dur(1, `DURDU: bayrak okunamadı (${e.message}); belirsizlikte K4 kapalı varsayılmaz, koşu durur.`) }
  const anahtar = kip === 'uygula' ? anahtarOku() : ''
  const s = await calistir({ site, tabanYolu, kuyrukYolu, kip, k3bAcik, anahtar })
  if (s.mesaj) console.error(`${s.cikis === 2 ? 'HATA' : 'DURDU'}: ${s.mesaj}`)
  process.exit(s.cikis)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await cli()
