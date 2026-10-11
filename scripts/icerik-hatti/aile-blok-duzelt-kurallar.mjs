/**
 * AILE BLOK DUZELTICI KURALLARI — saf fonksiyonlar (ag yok, DB yok). `aile-blok-duzelt.mjs` bunlari
 * kullanir; `__tests__/aile-blok-duzelt.test.ts` kilitler. (KATALOG abarti duzeltmesi, ortak-brif-v2)
 *
 * NE: `aile-metni-yaz.mjs` description.tr/en'i YAZAR ve bloklar_tr/maddeler_tr'yi aynen tasir. Bu duzeltici
 * ise ailenin `description` JSON'unun TEK bir alanindaki bir parcayi/cumleyi degistirir (cerrahi duzeltme).
 *
 * PLAN: {"kalemler":[{"slug","yol","eski","yeni"}]}
 *   yol  : ["tr"] | ["en"] | ["bloklar_tr","<anahtar>"] | ["maddeler_tr",<indeks>]  (baska yol RED)
 *   eski : alanda TAM 1 kez gecen dizge
 *   yeni : yerine konan dizge ("" = parca kalkar; sonuc alan bos kalamaz)
 *          null = maddeler_tr OGESI SILME: yol ["maddeler_tr",i], eski ogenin TAM degeri, oge diziden cikar
 *          (yalniz maddeler_tr[i] yolunda; sonuc dizi bos kalamaz; oge zaten yoksa K5 ile atlanir).
 * Bir ailenin kalemleri uygulanir (her kalem bir oncekinin sonucunu gorur): once DEGISIKLIKLER plan sirasiyla
 * (indeksler sabitken), sonra SILMELER azalan indeksle; hepsi TEK PATCH'te gider.
 *
 * KURALLAR (her kalemde hepsi olculur ve raporlanir):
 *   K1 yol           : yalniz izinli yol bicimi; anahtar/indeks ailede VAR olmali, alan metin olmali.
 *   K2 tek eslesme   : `eski` alanda tam 1 kez (0 ya da 2+ → RED); sonuc alan bos kalamaz.
 *   K3 yeni metin    : ic kaynak referansi (REF_DESENI) yok; abarti kalibi yok (ABARTI_KALIPLARI).
 *   K4 bicim artigi  : `---`, `[MANIFEST]`, `TR kaynak`, satir basi `>` yok; `**` cift sayida.
 *   K5 idempotent    : `eski` yok ve `yeni` alanda tam 1 kez varsa "zaten uygulanmis" → ATLA (hata degil).
 * SILME ("yeni" bos): calisir, ama bos `yeni` alanda aranamaz, yani plan ikinci kez kosulursa "eski alanda
 * 0 eslesme" RED verir. Tekrar kosulabilir (K5) olsun diye silmeyi KOMSU METINLE yaz:
 * eski="fanlardir. Ustun verimle calisir." yeni="fanlardir."
 * Kapsam notu: K3/K4 yalniz `yeni` dizgesini sinar. Alanin DISINDA kalan metne bakmaz (bilgi icin
 * `kalanKaliplar` sayar, bloklamaz).
 */
import { REF_DESENI } from './aile-metni-kurallar.mjs'

/**
 * @typedef {Record<string, unknown>} Aciklama   ailenin description JSON'u
 * @typedef {(string | number)[]} Yol
 * @typedef {{ slug: string, yol: Yol, eski: string, yeni: string | null }} Kalem   yeni=null → maddeler_tr ogesi SILINIR
 * @typedef {{ kural: string, ad: string, ok: boolean | null, ayrinti: string }} KuralSonucu  ok=null → uygulanamaz/bakilmadi
 * @typedef {'uygula' | 'atla' | 'red'} Durum
 * @typedef {{ kalem: Kalem, durum: Durum, kurallar: KuralSonucu[], neden: string, aciklama: Aciklama }} KalemSonucu
 * @typedef {{ sonuclar: KalemSonucu[], aciklama: Aciklama, red: boolean, degisti: boolean }} AilePlani
 */

const sahip = (o, k) => Object.prototype.hasOwnProperty.call(o, k)
const duzNesne = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

// ---- ABARTI KALIPLARI -------------------------------------------------------------------------
// Turkce sozcuk siniri `\b` ile OLCULMEZ (\b ASCII'dir: ş ı ğ ü ö ç harfini sozcuk sanmaz).
// Bastan: onceki karakter harf/rakam OLAMAZ ("karışık", "kaşık", "bütünleşik" icindeki "şık" eslesmez).
// Sondan: sonraki karakter harf/rakam OLAMAZ; Turkce ek alan govdeler `\p{L}*` ile ek yer birakir,
// ama "üstünde" (= üst + ünde) gibi ortak sozcukler yakalanmasin diye "üstün" ve "şık" EK LISTELIDIR.
const ONCE = '(?<![\\p{L}\\p{N}])'
const SONRA = '(?![\\p{L}\\p{N}])'
const kalip = (dil, ad, govde, kaynak) => ({ dil, ad, kaynak, desen: new RegExp(`${ONCE}(?:${govde})${SONRA}`, 'u') })

/**
 * `dil` = hangi kucuk harf donusumuyle sinanir: 'tr' → toLocaleLowerCase('tr') (İ→i, I→ı),
 * 'en' → toLowerCase(). `kaynak` = 'liste' (muduru'nun verdigi kalip listesi) | 'brif' (ortak-brif-v2 §4/§7 ek).
 */
export const ABARTI_KALIPLARI = [
  kalip('tr', 'üstün', 'üstün(?:lü[kğ]\\p{L}*|d[uü]r)?', 'liste'),
  kalip('tr', 'maksimum', 'maksimum\\p{L}*', 'liste'),
  kalip('tr', 'en iyi', 'en\\s+iyi\\p{L}*', 'liste'),
  kalip('tr', 'en verimli', 'en\\s+verimli\\p{L}*', 'liste'),
  kalip('tr', 'yüksek performans', 'yüksek\\s+performans\\p{L}*', 'liste'),
  kalip('tr', 'yüksek verimli', 'yüksek\\s+verimli\\p{L}*', 'liste'),
  kalip('tr', 'gelişmiş', 'gelişmiş\\p{L}*', 'liste'),
  kalip('tr', 'estetik', 'estetik\\p{L}*|estetiğ\\p{L}*', 'liste'),
  kalip('tr', 'şık', 'şık(?:lı[kğ]\\p{L}*|tır|lar\\p{L}*|ça)?', 'liste'),
  kalip('tr', 'optimum', 'optimum\\p{L}*', 'liste'),
  kalip('tr', 'garanti', 'garanti\\p{L}*', 'liste'),
  kalip('tr', 'tasarruf', 'tasarruf\\p{L}*', 'liste'),
  kalip('en', 'superior', 'superior(?:ity)?', 'liste'),
  kalip('en', 'maximum', 'maximum', 'liste'),
  kalip('en', 'best', 'best', 'liste'),
  kalip('en', 'most efficient', 'most\\s+efficient(?:ly)?', 'liste'),
  kalip('en', 'high-performance', 'high[-\\s]performance', 'liste'),
  kalip('en', 'high-efficiency', 'high[-\\s]efficiency', 'liste'),
  kalip('en', 'advanced', 'advanced', 'liste'),
  // ortak-brif-v2 §4.2 ve §7'de adi gecen, listede olmayanlar
  kalip('tr', 'lider', 'lider\\p{L}*', 'brif'),
  kalip('tr', 'profesyonel', 'profesyonel\\p{L}*', 'brif'),
  kalip('tr', 'kaliteli', 'kaliteli\\p{L}*', 'brif'),
  kalip('tr', 'hızlı', 'hızlı\\p{L}*', 'brif'),
  kalip('tr', 'konforlu', 'konforlu\\p{L}*', 'brif'),
  kalip('tr', 'güvenilir', 'güvenilir\\p{L}*', 'brif'),
  kalip('tr', 'çözüm ortağı', 'çözüm\\s+ortağ\\p{L}*', 'brif'),
  kalip('tr', 'en geniş', 'en\\s+geniş\\p{L}*', 'brif'),
]

/**
 * DAR MUAFIYET: sayi sozcugunun HEMEN onunde duran "hizli/hizlidir/hizlilar" hiz KADEMESI SAYISI teknik
 * terimidir ("iki hizli motor" = two speed), olcusuz sifat degil. Kalip taramasindan once metinden cikarilir.
 * TEK HANELI RAKAM da ayni terimdir ("4 hizli kontrol secenegi" = 4 hiz kademesi; KTL-15, HR 450 AVEL D); "14 hizli"
 * ya da "4 cok hizli" degil. "hizli", "cok hizli", "hizli kurulum", "yuksek hizli", "iki cok hizli" HALA reddedilir.
 */
export const SAYI_HIZLI_MUAFIYETI = /(?<![\p{L}\p{N}])(?:tek|iki|üç|dört|çift|[1-9])\s+hızlı(?:dır|lar)?(?![\p{L}\p{N}])/giu

/** @returns {{ ad: string, eslesen: string }[]} metinde bulunan abarti kaliplari (bos = temiz) */
export function abartiBul(metin) {
  const tr = metin.toLocaleLowerCase('tr').replace(SAYI_HIZLI_MUAFIYETI, ' ')
  const en = metin.toLowerCase()
  const bulunan = []
  for (const k of ABARTI_KALIPLARI) {
    const m = (k.dil === 'tr' ? tr : en).match(k.desen)
    if (m) bulunan.push({ ad: k.ad, eslesen: m[0] })
  }
  return bulunan
}

// ---- BICIM ARTIKLARI --------------------------------------------------------------------------
export const ARTIK_DESENLERI = [
  { ad: '---', desen: /---/ },
  { ad: '[MANIFEST]', desen: /\[MANIFEST\]/i },
  { ad: 'TR kaynak', desen: /TR kaynak/i },
  { ad: 'satir basi >', desen: /^[ \t]*>/m },
]

/** @returns {string[]} bulunan artiklar (bos = temiz); `**` tek sayidaysa "** dengesiz" */
export function artikBul(metin) {
  const bulunan = ARTIK_DESENLERI.filter((a) => a.desen.test(metin)).map((a) => a.ad)
  const yildiz = (metin.match(/\*\*/g) || []).length
  if (yildiz % 2 !== 0) bulunan.push('** dengesiz')
  return bulunan
}

// ---- K1: YOL ----------------------------------------------------------------------------------
/** Yol etiketi: ["bloklar_tr","Motor"] → bloklar_tr/Motor ; ["maddeler_tr",1] → maddeler_tr[1] */
export function yolEtiketi(yol) {
  if (!Array.isArray(yol)) return JSON.stringify(yol)
  if (yol[0] === 'maddeler_tr' && yol.length === 2) return `maddeler_tr[${yol[1]}]`
  return yol.map(String).join('/')
}

/** Yolun BICIMI (aileden bagimsiz). @returns {string | null} hata sebebi; null = bicim gecerli */
export function yolBicimi(yol) {
  if (!Array.isArray(yol) || yol.length === 0) return 'yol bos ya da dizi degil'
  const kok = yol[0]
  if (kok === 'tr' || kok === 'en') return yol.length === 1 ? null : `${kok} alt yol almaz`
  if (kok === 'bloklar_tr') {
    if (yol.length !== 2 || typeof yol[1] !== 'string' || yol[1].length === 0) return 'bloklar_tr yolu ["bloklar_tr","<anahtar>"] olmali'
    return null
  }
  if (kok === 'maddeler_tr') {
    if (yol.length !== 2 || !Number.isInteger(yol[1]) || /** @type {number} */ (yol[1]) < 0) return 'maddeler_tr yolu ["maddeler_tr",<0 ya da buyuk tam sayi>] olmali'
    return null
  }
  return `yol koku izinli degil: ${JSON.stringify(kok)} (yalniz tr | en | bloklar_tr.<anahtar> | maddeler_tr[i])`
}

/**
 * Yolun gosterdigi alani okur. Bicim + ailede varlik (anahtar/indeks) + alanin metin olmasi.
 * `__proto__`/`constructor` gibi miras anahtarlar "yok" sayilir (yalniz OZ anahtarlar).
 * @param {unknown} aciklama
 * @param {Yol} yol
 * @returns {{ metin: string } | { hata: string }}
 */
export function alanOku(aciklama, yol) {
  const b = yolBicimi(yol)
  if (b) return { hata: b }
  if (!duzNesne(aciklama)) return { hata: 'description JSON nesne degil' }
  const d = /** @type {Aciklama} */ (aciklama)
  const [kok, alt] = yol
  let v
  if (kok === 'tr' || kok === 'en') {
    if (!sahip(d, kok)) return { hata: `description.${kok} yok` }
    v = d[kok]
  } else if (kok === 'bloklar_tr') {
    if (!duzNesne(d.bloklar_tr)) return { hata: 'description.bloklar_tr yok ya da nesne degil' }
    const bl = /** @type {Aciklama} */ (d.bloklar_tr)
    if (!sahip(bl, String(alt))) return { hata: `bloklar_tr'de "${alt}" anahtari yok (var olanlar: ${Object.keys(bl).join(', ') || '-'})` }
    v = bl[String(alt)]
  } else {
    if (!Array.isArray(d.maddeler_tr)) return { hata: 'description.maddeler_tr yok ya da dizi degil' }
    const md = /** @type {unknown[]} */ (d.maddeler_tr)
    if (/** @type {number} */ (alt) >= md.length) return { hata: `maddeler_tr[${alt}] aralik disi (${md.length} madde var)` }
    v = md[/** @type {number} */ (alt)]
  }
  if (typeof v !== 'string') return { hata: `${yolEtiketi(yol)} metin degil (${v === null ? 'null' : typeof v})` }
  return { metin: v }
}

/**
 * Alani yeni metinle degistirilmis KOPYAYI doner (girdi degismez). Yol `alanOku`dan gecmis olmali.
 * @param {Aciklama} aciklama
 * @param {Yol} yol
 * @param {string} metin
 * @returns {Aciklama}
 */
export function alanYaz(aciklama, yol, metin) {
  const kopya = /** @type {Aciklama} */ (JSON.parse(JSON.stringify(aciklama)))
  const [kok, alt] = yol
  if (kok === 'tr' || kok === 'en') kopya[kok] = metin
  else if (kok === 'bloklar_tr') /** @type {Aciklama} */ (kopya.bloklar_tr)[String(alt)] = metin
  else /** @type {string[]} */ (kopya.maddeler_tr)[/** @type {number} */ (alt)] = metin
  return kopya
}

// ---- K2: ESLESME ------------------------------------------------------------------------------
/** `parca`nin `alan`daki eslesme sayisi — ust uste binenler dahil ("aa" ⊂ "aaa" = 2: belirsizlik de RED). */
export function say(alan, parca) {
  if (parca.length === 0) return 0
  let n = 0
  for (let i = alan.indexOf(parca); i !== -1; i = alan.indexOf(parca, i + 1)) n++
  return n
}

// ---- KALEM DEGERLENDIRME ----------------------------------------------------------------------
/**
 * Tek kalemi bir description uzerinde degerlendirir. K1..K5'in HEPSI olculur (rapor icin), durum:
 *  uygula (hepsi gecti, `aciklama` degismis kopya) | atla (K5: zaten uygulanmis) | red.
 * @param {unknown} aciklama
 * @param {Kalem} kalem
 * @returns {KalemSonucu}
 */
export function kalemDegerlendir(aciklama, kalem) {
  if (kalem.yeni === null) return silmeDegerlendir(aciklama, kalem)
  const yeni = kalem.yeni
  /** @type {KuralSonucu[]} */
  const kurallar = []
  const ekle = (kural, ad, ok, ayrinti = '') => kurallar.push({ kural, ad, ok, ayrinti })
  const eldeki = /** @type {Aciklama} */ (duzNesne(aciklama) ? aciklama : {})
  const bitir = (/** @type {Durum} */ durum, neden, yeniAciklama = eldeki) => ({ kalem, durum, kurallar, neden, aciklama: yeniAciklama })
  const bakilmadi = (/** @type {string} */ sebep) => {
    ekle('K2', 'tek eslesme', null, sebep)
    ekle('K3', 'ic referans', null, sebep)
    ekle('K3', 'abarti kalibi', null, sebep)
    ekle('K4', 'bicim artigi', null, sebep)
    ekle('K5', 'idempotent', null, sebep)
  }

  // maddeler_tr'de bir OGE SILINDIKTEN sonra plan yeniden kosulursa indeksler kayar: kalem artik baska
  // (ya da aralik disi) indekse bakar. Eski dizide hic yok + yeni dizide TOPLAM tam 1 kez → zaten uygulanmis.
  const kaymisAtla = () => {
    if (kalem.yol[0] !== 'maddeler_tr' || yolBicimi(kalem.yol) || !Array.isArray(eldeki.maddeler_tr) || yeni === '' || kalem.eski.length === 0) return null
    const md = /** @type {unknown[]} */ (eldeki.maddeler_tr).filter((m) => typeof m === 'string')
    const toplam = (/** @type {string} */ p) => md.reduce((n, m) => n + say(/** @type {string} */ (m), p), 0)
    if (toplam(kalem.eski) !== 0 || toplam(yeni) !== 1) return null
    ekle('K1', 'yol', true, `${yolEtiketi(kalem.yol)} (indeks kaymis olabilir: maddeler_tr genelinde bakildi)`)
    ekle('K2', 'tek eslesme', null, 'eski dizide yok; yeni dizide tam 1 kez')
    ekle('K3', 'ic referans', null, 'atlandi')
    ekle('K3', 'abarti kalibi', null, 'atlandi')
    ekle('K4', 'bicim artigi', null, 'atlandi')
    ekle('K5', 'idempotent', true, 'yeni maddeler_tr genelinde tam 1 kez → zaten uygulanmis')
    return bitir('atla', 'zaten uygulanmis')
  }

  // K1
  const okunan = alanOku(aciklama, kalem.yol)
  if ('hata' in okunan) {
    const kaymis = kaymisAtla()
    if (kaymis) return kaymis
    ekle('K1', 'yol', false, okunan.hata)
    bakilmadi('yol gecersiz, bakilmadi')
    return bitir('red', `K1 yol: ${okunan.hata}`)
  }
  ekle('K1', 'yol', true, yolEtiketi(kalem.yol))
  const alan = okunan.metin
  const { eski } = kalem

  // K5 (once: "eski yok / yeni zaten 1 kez var" durumunda K2 reddetmemeli)
  const nEski = say(alan, eski)
  const nYeni = yeni === '' ? 0 : say(alan, yeni)
  if (eski.length > 0 && eski !== yeni && nYeni === 1 && (nEski === 0 || yeni.includes(eski))) {
    ekle('K2', 'tek eslesme', null, `eski ${nEski} kez; yeni zaten alanda`)
    ekle('K3', 'ic referans', null, 'atlandi')
    ekle('K3', 'abarti kalibi', null, 'atlandi')
    ekle('K4', 'bicim artigi', null, 'atlandi')
    ekle('K5', 'idempotent', true, 'yeni alanda zaten tam 1 kez var → zaten uygulanmis')
    return bitir('atla', 'zaten uygulanmis')
  }
  if (nEski === 0) {
    kurallar.length = 0 // K1 satiri kaymisAtla'da yeniden yazilir
    const kaymis = kaymisAtla()
    if (kaymis) return kaymis
    ekle('K1', 'yol', true, yolEtiketi(kalem.yol))
  }

  // K2
  /** @type {string | null} */
  let k2 = null
  if (eski.length === 0) k2 = 'eski bos'
  else if (eski === yeni) k2 = 'eski ve yeni ayni — degisiklik yok'
  else if (nEski === 0) k2 = `eski alanda 0 eslesme${yeni === '' ? ' (yeni bos: zaten uygulanmis mi ayirt edilemez)' : ''}`
  else if (nEski >= 2) k2 = `eski alanda ${nEski} eslesme (tam 1 olmali)`
  let sonuc = alan
  if (k2 === null) {
    const i = alan.indexOf(eski)
    sonuc = alan.slice(0, i) + yeni + alan.slice(i + eski.length) // `replace` DEGIL: yeni'deki "$&" gibi dizgeler harfiyen kalsin
    if (sonuc.trim().length === 0) k2 = 'sonuc alan bos kalir'
  }
  ekle('K2', 'tek eslesme', k2 === null, k2 ?? '1 eslesme')

  // K3 / K4 — yalniz `yeni` dizgesi
  const ref = REF_DESENI.test(yeni)
  ekle('K3', 'ic referans', !ref, ref ? 'yeni ic kaynak referansi tasiyor' : '')
  const abarti = abartiBul(yeni)
  ekle('K3', 'abarti kalibi', abarti.length === 0, abarti.map((a) => `"${a.eslesen}"`).join(', '))
  const artik = artikBul(yeni)
  ekle('K4', 'bicim artigi', artik.length === 0, artik.join(', '))
  ekle('K5', 'idempotent', null, 'uygulanmamis')

  const kirmizi = kurallar.filter((k) => k.ok === false)
  if (kirmizi.length) return bitir('red', kirmizi.map((k) => `${k.kural} ${k.ad}: ${k.ayrinti}`).join(' · '))
  return bitir('uygula', '', alanYaz(eldeki, kalem.yol, sonuc))
}

/**
 * OGE SILME kalemi: yeni=null, yol=["maddeler_tr", i], eski=<ogenin TAM degeri> (parca eslesmesi DEGIL).
 *  K1 : yalniz maddeler_tr[i] yolunda gecerli (tr/en/bloklar_tr'de null RED); maddeler_tr dizi olmali.
 *  K2 : dizi[i] === eski → oge diziden cikar; silme sonrasi dizi bos kalirsa RED.
 *  K5 : dizi[i] eski degil VE dizide eski degerli oge hic yok → "zaten uygulanmis" ATLA. Dizide baska
 *       indekste varsa RED (indeks kaymis). Not: eski yanlis yazilmissa da ayni sebeple ATLA gorunur;
 *       raporda ATLANIR satiri bunu ayirt etmek icin "zaten uygulanmis ya da eski yazim hatali" der.
 * K3/K4: silmede yeni metin yok, bakilmaz.
 * @param {unknown} aciklama
 * @param {Kalem} kalem
 * @returns {KalemSonucu}
 */
function silmeDegerlendir(aciklama, kalem) {
  /** @type {KuralSonucu[]} */
  const kurallar = []
  const ekle = (kural, ad, ok, ayrinti = '') => kurallar.push({ kural, ad, ok, ayrinti })
  const eldeki = /** @type {Aciklama} */ (duzNesne(aciklama) ? aciklama : {})
  const bitir = (/** @type {Durum} */ durum, neden, yeniAciklama = eldeki) => ({ kalem, durum, kurallar, neden, aciklama: yeniAciklama })
  const digerleri = (/** @type {string} */ sebep) => {
    ekle('K2', 'tek eslesme', null, sebep)
    ekle('K3', 'ic referans', null, 'silme: yeni metin yok')
    ekle('K3', 'abarti kalibi', null, 'silme: yeni metin yok')
    ekle('K4', 'bicim artigi', null, 'silme: yeni metin yok')
    ekle('K5', 'idempotent', null, sebep)
  }
  const bicim = yolBicimi(kalem.yol)
  if (bicim) {
    ekle('K1', 'yol', false, bicim)
    digerleri('yol gecersiz, bakilmadi')
    return bitir('red', `K1 yol: ${bicim}`)
  }
  if (kalem.yol[0] !== 'maddeler_tr') {
    const h = `yeni:null (oge silme) yalniz maddeler_tr[i] yolunda gecerli, yol: ${yolEtiketi(kalem.yol)}`
    ekle('K1', 'yol', false, h)
    digerleri('yol gecersiz, bakilmadi')
    return bitir('red', `K1 yol: ${h}`)
  }
  if (!Array.isArray(eldeki.maddeler_tr)) {
    ekle('K1', 'yol', false, 'description.maddeler_tr yok ya da dizi degil')
    digerleri('yol gecersiz, bakilmadi')
    return bitir('red', 'K1 yol: description.maddeler_tr yok ya da dizi degil')
  }
  ekle('K1', 'yol', true, yolEtiketi(kalem.yol) + ' (oge silinir)')
  const dizi = /** @type {unknown[]} */ (eldeki.maddeler_tr)
  const i = /** @type {number} */ (kalem.yol[1])
  if (i < dizi.length && dizi[i] === kalem.eski) {
    if (dizi.length === 1) {
      ekle('K2', 'tek eslesme', false, 'silme sonrasi maddeler_tr bos kalir')
      ekle('K3', 'ic referans', null, 'silme: yeni metin yok')
      ekle('K3', 'abarti kalibi', null, 'silme: yeni metin yok')
      ekle('K4', 'bicim artigi', null, 'silme: yeni metin yok')
      ekle('K5', 'idempotent', null, 'uygulanmamis')
      return bitir('red', 'K2 tek eslesme: silme sonrasi maddeler_tr bos kalir')
    }
    ekle('K2', 'tek eslesme', true, `maddeler_tr[${i}] eski degere TAM esit`)
    ekle('K3', 'ic referans', null, 'silme: yeni metin yok')
    ekle('K3', 'abarti kalibi', null, 'silme: yeni metin yok')
    ekle('K4', 'bicim artigi', null, 'silme: yeni metin yok')
    ekle('K5', 'idempotent', null, 'uygulanmamis')
    const kopya = /** @type {Aciklama} */ (JSON.parse(JSON.stringify(eldeki)))
    const md = /** @type {unknown[]} */ (kopya.maddeler_tr)
    md.splice(i, 1)
    return bitir('uygula', '', kopya)
  }
  const baska = dizi.indexOf(kalem.eski)
  if (baska === -1) {
    ekle('K2', 'tek eslesme', null, `maddeler_tr[${i}] eski degere esit degil; dizide eski degerli oge yok`)
    ekle('K3', 'ic referans', null, 'atlandi')
    ekle('K3', 'abarti kalibi', null, 'atlandi')
    ekle('K4', 'bicim artigi', null, 'atlandi')
    ekle('K5', 'idempotent', true, 'oge dizide yok → zaten uygulanmis ya da eski yazim hatali')
    return bitir('atla', 'zaten uygulanmis')
  }
  const neden = `maddeler_tr[${i}] eski degere esit degil, ama oge dizide ${baska}. indekste var (indeks kaymis)`
  ekle('K2', 'tek eslesme', false, neden)
  ekle('K3', 'ic referans', null, 'silme: yeni metin yok')
  ekle('K3', 'abarti kalibi', null, 'silme: yeni metin yok')
  ekle('K4', 'bicim artigi', null, 'silme: yeni metin yok')
  ekle('K5', 'idempotent', null, 'uygulanmamis')
  return bitir('red', `K2 tek eslesme: ${neden}`)
}

/** Silme kaleminin indeksi (siralama icin); gecersiz yol -1. @param {Kalem} k */
const indeksi = (k) => (Array.isArray(k.yol) && Number.isInteger(k.yol[1]) ? /** @type {number} */ (k.yol[1]) : -1)

/**
 * Bir ailenin tum kalemlerini SIRAYLA uygular (her kalem bir oncekinin sonucunu gorur).
 * SIRA: once tum DEGISIKLIK kalemleri (plandaki sirayla, dizi indeksleri sabitken), sonra SILME kalemleri
 * AZALAN indeks sirasiyla (bir silme sonraki silmenin indeksini kaydirmasin).
 * @param {unknown} aciklama
 * @param {Kalem[]} kalemler
 * @returns {AilePlani}
 */
export function ailePlani(aciklama, kalemler) {
  let guncel = /** @type {Aciklama} */ (duzNesne(aciklama) ? aciklama : {})
  /** @type {KalemSonucu[]} */
  const sonuclar = []
  const degisim = kalemler.filter((k) => k.yeni !== null)
  const silme = kalemler.filter((k) => k.yeni === null).sort((a, b) => indeksi(b) - indeksi(a))
  for (const kalem of [...degisim, ...silme]) {
    const s = kalemDegerlendir(guncel, kalem)
    sonuclar.push(s)
    if (s.durum === 'uygula') guncel = s.aciklama
  }
  return {
    sonuclar,
    aciklama: guncel,
    red: sonuclar.some((s) => s.durum === 'red'),
    degisti: sonuclar.some((s) => s.durum === 'uygula'),
  }
}

// ---- PLAN DOSYASI -----------------------------------------------------------------------------
const SLUG_DESENI = /^[A-Za-z0-9][A-Za-z0-9._-]*$/
const KALEM_ANAHTARLARI = ['slug', 'yol', 'eski', 'yeni']

/**
 * Plan JSON'unun YAPISI (yolun icerigi K1'e aittir, burada yalniz var mi diye bakilir).
 * @param {unknown} plan
 * @returns {{ hatalar: string[], kalemler: Kalem[] }}
 */
export function planDogrula(plan) {
  /** @type {string[]} */
  const hatalar = []
  if (!duzNesne(plan) || !Array.isArray(/** @type {Aciklama} */ (plan).kalemler)) {
    return { hatalar: ['plan {"kalemler":[…]} bicimli bir nesne olmali'], kalemler: [] }
  }
  const ham = /** @type {unknown[]} */ (/** @type {Aciklama} */ (plan).kalemler)
  if (ham.length === 0) hatalar.push('kalemler bos')
  ham.forEach((k, i) => {
    const n = `kalem ${i + 1}`
    if (!duzNesne(k)) return void hatalar.push(`${n}: nesne degil`)
    const o = /** @type {Aciklama} */ (k)
    for (const ad of Object.keys(o)) if (!KALEM_ANAHTARLARI.includes(ad)) hatalar.push(`${n}: bilinmeyen anahtar "${ad}" (izinli: ${KALEM_ANAHTARLARI.join(', ')})`)
    if (typeof o.slug !== 'string' || !SLUG_DESENI.test(o.slug)) hatalar.push(`${n}: slug metin ve [A-Za-z0-9._-] olmali`)
    if (!('yol' in o)) hatalar.push(`${n}: yol yok`)
    if (typeof o.eski !== 'string' || o.eski.length === 0) hatalar.push(`${n}: eski bos olmayan metin olmali`)
    if (typeof o.yeni !== 'string' && o.yeni !== null) hatalar.push(`${n}: yeni metin olmali ("" = parca kalkar) ya da null (yalniz maddeler_tr ogesi silme)`)
  })
  return { hatalar, kalemler: hatalar.length ? [] : /** @type {Kalem[]} */ (ham) }
}

/** Kalemleri slug'a gore gruplar (ilk gorunme sirasi ve kalem sirasi korunur). @param {Kalem[]} kalemler */
export function aileyeGore(kalemler) {
  /** @type {Map<string, Kalem[]>} */
  const m = new Map()
  for (const k of kalemler) m.set(k.slug, [...(m.get(k.slug) ?? []), k])
  return m
}

// ---- KANONIK ESITLIK --------------------------------------------------------------------------
/** Anahtar sirasindan bagimsiz kanonik dizge (diziler sirali kalir). @param {unknown} v @returns {string} */
export function kanonik(v) {
  if (Array.isArray(v)) return `[${v.map(kanonik).join(',')}]`
  if (duzNesne(v)) {
    const o = /** @type {Aciklama} */ (v)
    return `{${Object.keys(o).sort().map((k) => `${JSON.stringify(k)}:${kanonik(o[k])}`).join(',')}}`
  }
  return JSON.stringify(v) ?? 'undefined'
}
export const kanonikEsit = (a, b) => kanonik(a) === kanonik(b)

// ---- BILGI: KALAN KALIPLAR --------------------------------------------------------------------
/**
 * Description'in TUM metin alanlarinda kalan abarti kaliplari (bloklamaz; "hedef 0" sayimi icin).
 * @param {unknown} aciklama
 * @returns {{ yol: string, ad: string }[]}
 */
export function kalanKaliplar(aciklama) {
  if (!duzNesne(aciklama)) return []
  const d = /** @type {Aciklama} */ (aciklama)
  /** @type {{ yol: string, metin: unknown }[]} */
  const alanlar = [{ yol: 'tr', metin: d.tr }, { yol: 'en', metin: d.en }]
  if (duzNesne(d.bloklar_tr)) for (const [a, v] of Object.entries(/** @type {Aciklama} */ (d.bloklar_tr))) alanlar.push({ yol: `bloklar_tr/${a}`, metin: v })
  if (Array.isArray(d.maddeler_tr)) d.maddeler_tr.forEach((v, i) => alanlar.push({ yol: `maddeler_tr[${i}]`, metin: v }))
  return alanlar.flatMap(({ yol, metin }) => (typeof metin === 'string' ? abartiBul(metin).map((a) => ({ yol, ad: a.ad })) : []))
}
