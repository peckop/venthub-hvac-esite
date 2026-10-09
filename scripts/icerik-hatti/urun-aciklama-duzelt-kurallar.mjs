/**
 * URUN ACIKLAMA DUZELTICI KURALLARI — saf fonksiyonlar (ag yok, DB yok). `urun-aciklama-duzelt.mjs` bunlari
 * AGDAN ONCE calistirir (RED = cikis 1; hicbir sey okunmaz, hicbir sey yazilmaz); `__tests__/urun-aciklama-duzelt.test.ts`
 * kilitler. (KTL-15; aile ve kategori yazicilarindaki kalip kapilarinin URUN muadili)
 *
 * NE: `urun-aciklama-duzelt.mjs` bir planla `products.description_i18n` icinde TEK dizgeyi degistirir:
 *   PLAN: {"eski","yeni","diller":["tr"|"en",...],"skus":["<sku>",...]}   (TAM bu dort anahtar)
 * Bu modul planin KENDISINI sinar. `eski`nin canlida tam 1 kez gecmesi (tam-1 eslesme) yazicinin ag kisminda olculur.
 *
 * KURALLAR (hepsi olculur ve raporlanir; biri kirmiziysa kapi KIRMIZI, cikis 1):
 *   P1  sema            : eski/yeni bos olmayan metin; diller ⊆ {tr,en}, bos degil, tekrarsiz; skus bos olmayan,
 *                         tekrarsiz, [A-Za-z0-9._-] dizisi; bilinmeyen anahtar yok. SEMA hatasi cikis 2 (plan hatasi).
 *   P2  degisiklik      : eski ≠ yeni; yeni NFC; yeni cift bosluksuz, gorunmez karaktersiz. (Kenar bosluk YASAK DEGIL:
 *                         silme komsu metinle yazilir, " ex-proof" gibi yeni bastan bosluk tasiyabilir; asil risk
 *                         SONUC metindeki bozukluktur → P4.)
 *   P3a ic referans     : REF_DESENI (sayfa/DB atfi, html yorumu).
 *   P3b abarti kalibi   : abartiBul (ortak-brif-v2 §4: ustun, maksimum, en iyi, garanti, tasarruf ...).
 *   P3c editor notu     : KALKTI/KALKAR/SILINIR ... , [[ ]], ok isareti, parantezli buyuk harfli not. 2026-10-09'da
 *                         plan ureticisi tablo hucresindeki "(... KALKTI ...)" notunu YENI metne tasidi ve hicbir
 *                         kapi gormedi; bu kural o acigi kapatir.
 *   P3d bicim artigi    : artikBul (`---`, `[MANIFEST]`, `TR kaynak`, satir basi `>`, dengesiz `**`).
 *   P3e EN dili         : diller 'en' iceriyorsa yeni Turkce harf (çğıöşüÇĞİÖŞÜ) tasimaz.
 *   P4  sonuc bicimi    : (AG ASAMASI, `sonucBicimBozuklugu`) degisimden SONRAKI metinde, ONCEKI metinde olmayan cift
 *                         bosluk / noktalamadan once bosluk / tekrarli noktalama / kenar bosluk → RED (cikis 1).
 * Kapsam: P2/P3 yalniz `yeni` dizgesini sinar; alanin DISINDA kalan metne bakmaz.
 */
import { abartiBul, artikBul } from './aile-blok-duzelt-kurallar.mjs'
import { REF_DESENI } from './aile-metni-kurallar.mjs'

/**
 * @typedef {{ eski: string, yeni: string, diller: string[], skus: string[] }} Plan
 * @typedef {{ kural: string, ad: string, ok: boolean | null, ayrinti: string }} KuralSonucu
 * @typedef {{ semaHatalari: string[], kurallar: KuralSonucu[], gecti: boolean }} PlanKapisi
 */

const duzNesne = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

export const IZINLI_DILLER = ['tr', 'en']
export const PLAN_ANAHTARLARI = ['eski', 'yeni', 'diller', 'skus']
const SKU_DESENI = /^[A-Za-z0-9][A-Za-z0-9._-]*$/
// BOM, sifir genislik bosluk/birlestirici, yumusak tire, kelime birlestirici: gozle gorunmez, aramayi bozar.
const GORUNMEZ = /[­​-‍⁠﻿]/

// ---- P3c: EDITOR NOTU / ISARET ---------------------------------------------------------------------
// BUYUK HARFLI sozcukler BUYUK/KUCUK DUYARLI sinanir: "dusme" ya da "kalkar" gibi normal sozcukler gecerli metindir
// ("basinc duser"), editor notu ise buyuk harfle yazilir ("KALKTI"). Sozcuk siniri `\b` DEGIL (ASCII'dir; ş ı ğ ü ö ç).
const ONCE = '(?<![\\p{L}\\p{N}])'
const SONRA = '(?![\\p{L}\\p{N}])'
export const EDITOR_ISARETLERI = [
  {
    ad: 'buyuk harfli editor sozcugu',
    desen: new RegExp(
      `${ONCE}(?:KALKTI|KALKAR|KALDIRILDI|DÜŞER|DUŞER|DUSER|SİLİNİR|SILINIR|SİLİNDİ|SILINDI|ÖNERİ|ONERI|TODO|RED|ESKİ|ESKI|YENİ|YENI)${SONRA}`,
      'u',
    ),
  },
  { ad: '[[ ]] isareti', desen: /\[\[|\]\]/ },
  { ad: 'ok isareti', desen: /→|⇒|=>/ },
  { ad: 'parantezli buyuk harfli not', desen: /\(\s*(?:NOT|NOTE|ÖLÇÜ|GÜÇ|TODO)/u },
]

/** @param {string} metin @returns {{ ad: string, eslesen: string }[]} bulunan editor isaretleri (bos = temiz) */
export function editorIsaretiBul(metin) {
  const bulunan = []
  for (const k of EDITOR_ISARETLERI) {
    const m = metin.match(k.desen)
    if (m) bulunan.push({ ad: k.ad, eslesen: m[0] })
  }
  return bulunan
}

// ---- P3e: EN'DE TURKCE HARF ------------------------------------------------------------------------
/** @param {string} metin @returns {string[]} metindeki Turkce'ye ozgu harfler (tekrarsiz, bos = temiz) */
export function trHarfBul(metin) {
  return [...new Set(metin.match(/[çğıöşüÇĞİÖŞÜ]/g) ?? [])]
}

// ---- P4: SONUC BICIMI ------------------------------------------------------------------------------
const SONUC_KONTROLLERI = [
  ['cift bosluk', / {2,}/],
  ['noktalamadan once bosluk', / [,.;:!?)]/],
  ['tekrarli noktalama', /[,;:!?]{2,}|(?<!\.)\.\.(?!\.)/],
  ['kenar bosluk', /^\s|\s$/],
]

/**
 * Degisimden SONRAKI metinde, ONCEKI metinde bulunmayan biçim bozukluklari. Eskiden beri var olan bozukluk
 * bu degisikligin sucu degildir (ikisinde de varsa sayilmaz). Bos dizi = temiz.
 * @param {string} onceki
 * @param {string} sonraki
 * @returns {string[]}
 */
export function sonucBicimBozuklugu(onceki, sonraki) {
  return SONUC_KONTROLLERI.filter(([, d]) => d.test(sonraki) && !d.test(onceki)).map(([ad]) => /** @type {string} */ (ad))
}

// ---- P1: SEMA --------------------------------------------------------------------------------------
/**
 * Planin YAPISI. Sema hatasi = plan hatasi (yazici cikis 2); icerik kurallari P2/P3'tedir (cikis 1).
 * @param {unknown} plan
 * @returns {{ hatalar: string[], plan: Plan | null }}
 */
export function planSemasi(plan) {
  /** @type {string[]} */
  const hatalar = []
  if (!duzNesne(plan)) return { hatalar: ['plan {eski, yeni, diller[], skus[]} bicimli bir nesne olmali'], plan: null }
  const p = /** @type {Record<string, unknown>} */ (plan)
  for (const ad of Object.keys(p)) {
    if (!PLAN_ANAHTARLARI.includes(ad)) hatalar.push(`bilinmeyen anahtar "${ad}" (izinli: ${PLAN_ANAHTARLARI.join(', ')})`)
  }
  for (const ad of ['eski', 'yeni']) {
    if (typeof p[ad] !== 'string' || p[ad].length === 0) hatalar.push(`${ad} bos olmayan metin olmali (parca silme icin yeni = komsu kelimeli metin)`)
  }
  if (!Array.isArray(p.diller) || p.diller.length === 0) hatalar.push('diller bos olmayan dizi olmali')
  else {
    const gecersiz = p.diller.filter((d) => !IZINLI_DILLER.includes(/** @type {string} */ (d)))
    if (gecersiz.length) hatalar.push(`diller yalniz ${IZINLI_DILLER.join(' | ')} olabilir, gelen: ${JSON.stringify(gecersiz)}`)
    if (new Set(p.diller).size !== p.diller.length) hatalar.push('diller tekrar iceriyor')
  }
  if (!Array.isArray(p.skus) || p.skus.length === 0) hatalar.push('skus bos olmayan dizi olmali')
  else {
    const gecersiz = p.skus.filter((s) => typeof s !== 'string' || !SKU_DESENI.test(s))
    if (gecersiz.length) hatalar.push(`skus [A-Za-z0-9._-] metin olmali, gecersiz: ${JSON.stringify(gecersiz)}`)
    if (new Set(p.skus).size !== p.skus.length) hatalar.push('skus tekrar iceriyor')
  }
  return { hatalar, plan: hatalar.length ? null : /** @type {Plan} */ (plan) }
}

// ---- P2 / P3: YENI METIN KAPISI --------------------------------------------------------------------
/**
 * Sema gecmis bir planin `yeni` dizgesini sinar. Her kural olculur (rapor icin), biri kirmiziysa gecti=false.
 * @param {Plan} plan
 * @returns {KuralSonucu[]}
 */
export function yeniKapisi(plan) {
  const { eski, yeni, diller } = plan
  /** @type {KuralSonucu[]} */
  const kurallar = []
  const ekle = (kural, ad, ok, ayrinti = '') => kurallar.push({ kural, ad, ok, ayrinti })

  ekle('P1', 'sema', true, `${plan.skus.length} sku · diller: ${diller.join(', ')}`)

  /** @type {string[]} */
  const p2 = []
  if (eski === yeni) p2.push('eski ve yeni ayni — degisiklik yok')
  if (yeni !== yeni.normalize('NFC')) p2.push('yeni NFC degil')
  if (/ {2,}/.test(yeni)) p2.push('yeni cift bosluklu')
  if (GORUNMEZ.test(yeni)) p2.push('yeni gorunmez karakter (BOM/sifir genislik/yumusak tire) tasiyor')
  ekle('P2', 'degisiklik', p2.length === 0, p2.join(' · '))

  const ref = REF_DESENI.test(yeni)
  ekle('P3a', 'ic referans', !ref, ref ? 'yeni ic kaynak referansi tasiyor' : '')
  const abarti = abartiBul(yeni)
  ekle('P3b', 'abarti kalibi', abarti.length === 0, abarti.map((a) => `"${a.eslesen}"`).join(', '))
  const editor = editorIsaretiBul(yeni)
  ekle('P3c', 'editor notu', editor.length === 0, editor.map((e) => `${e.ad}: "${e.eslesen}"`).join(', '))
  const artik = artikBul(yeni)
  ekle('P3d', 'bicim artigi', artik.length === 0, artik.join(', '))
  if (diller.includes('en')) {
    const harf = trHarfBul(yeni)
    ekle('P3e', 'EN dili', harf.length === 0, harf.length ? `EN metinde Turkce harf: ${harf.join(' ')}` : '')
  } else {
    ekle('P3e', 'EN dili', null, 'diller en icermiyor')
  }
  return kurallar
}

/**
 * Plan dosyasinin tum kapisi: once sema (hata → `semaHatalari`, kural calismaz), sonra icerik kurallari.
 * @param {unknown} plan
 * @returns {PlanKapisi}
 */
export function planKapisi(plan) {
  const sema = planSemasi(plan)
  if (sema.hatalar.length || !sema.plan) return { semaHatalari: sema.hatalar, kurallar: [], gecti: false }
  const kurallar = yeniKapisi(sema.plan)
  return { semaHatalari: [], kurallar, gecti: kurallar.every((k) => k.ok !== false) }
}
