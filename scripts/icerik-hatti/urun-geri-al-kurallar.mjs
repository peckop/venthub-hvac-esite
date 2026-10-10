/**
 * URUN GERI ALMA KURALLARI — saf fonksiyonlar (ag yok, DB yok). `urun-geri-al.mjs` bunlari kullanir;
 * `__tests__/urun-geri-al.test.ts` kilitler. (KTL-17; yazici: `urun-aciklama-duzelt.mjs`, KTL-15)
 *
 * NE: `urun-aciklama-duzelt.mjs --yaz` yazimdan ONCE `--out` dizinine `aciklama-<damga>.json` yazar:
 *   { onay, plan,
 *     kayitlar: [{ id, sku, updated_at, onceki, sonraki }],   onceki = yazim ONCESI tum description_i18n (null olabilir)
 *     yarislar: [{ sku, id, onceki, sonraki }] }               yarista araya girilen satirin TAZE hali + yazilan hali
 * Bu modul o kaydi sinar ve her satir icin "geri alinir mi" kararini verir.
 *
 * GERI ALMA DEGERI (satir basina):
 *   - sku icin `yarislar` kaydi varsa ONUN onceki/sonraki'si (yazicinin yazmadan hemen once gordugu TAZE hal);
 *     `kayitlar[].onceki` yarisTAN ONCEKI haldir ve geri alma icin KULLANILMAZ (baska yazarin degisikligini ezerdi).
 *   - yoksa `kayitlar` kaydinin onceki/sonraki'si.
 *
 * SATIR DURUMU (canli description_i18n, anahtar sirasindan bagimsiz kanonik karsilastirma):
 *   yazilmamis          : onceki == sonraki (yazici bu satira yazmamis: yarista baskasi ayni degisikligi yapmis)  → atla
 *   geri-al             : canli == sonraki  (yazdigimiz hal hala duruyor)                                         → geri al
 *   zaten-geri-alinmis  : canli == onceki                                                                        → atla
 *   degismis            : canli ikisine de esit degil (sonradan baska yazar degistirmis)                         → DOKUNMA, raporla
 *   (bulunamadi         : satir canlida yok — bu modulde degil, CLI'da; satir silinmis ya da id yanlis)
 */
import { kanonikEsit } from './aile-blok-duzelt-kurallar.mjs'

/**
 * @typedef {Record<string, unknown> | null} Aciklama   description_i18n (null olabilir)
 * @typedef {{ id: string, sku: string, onceki: Aciklama, sonraki: Record<string, unknown> }} Hedef
 * @typedef {Hedef & { kaynak: 'kayit' | 'yaris' }} GeriAlmaHedefi
 * @typedef {'geri-al' | 'zaten-geri-alinmis' | 'degismis' | 'yazilmamis'} SatirDurumu
 */

const duzNesne = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
// PostgREST `id=in.(a,b)` sorgusuna girer: tirnak/virgul/parantez tasiyan kimlik enjeksiyon olur.
const KIMLIK_DESENI = /^[A-Za-z0-9][A-Za-z0-9-]*$/
const SKU_DESENI = /^[A-Za-z0-9][A-Za-z0-9._-]*$/

/**
 * Bir kayit girdisinin (kayitlar[] ya da yarislar[]) yapisini sinar.
 * @param {unknown} g @param {string} ad @returns {string[]}
 */
function girdiHatalari(g, ad) {
  if (!duzNesne(g)) return [`${ad}: nesne degil`]
  const o = /** @type {Record<string, unknown>} */ (g)
  /** @type {string[]} */
  const h = []
  if (typeof o.id !== 'string' || !KIMLIK_DESENI.test(o.id)) h.push(`${ad}: id [A-Za-z0-9-] metin olmali`)
  if (typeof o.sku !== 'string' || !SKU_DESENI.test(o.sku)) h.push(`${ad}: sku [A-Za-z0-9._-] metin olmali`)
  if (!('onceki' in o) || (o.onceki !== null && !duzNesne(o.onceki))) h.push(`${ad}: onceki nesne ya da null olmali`)
  if (!duzNesne(o.sonraki)) h.push(`${ad}: sonraki nesne olmali`)
  return h
}

/**
 * Envanter (kayit) dosyasinin YAPISI.
 * @param {unknown} kayit
 * @returns {{ hatalar: string[], kayit: { kayitlar: Hedef[], yarislar: Hedef[] } | null }}
 */
export function kayitSemasi(kayit) {
  if (!duzNesne(kayit)) return { hatalar: ['kayit {kayitlar:[…], yarislar?:[…]} bicimli bir nesne olmali'], kayit: null }
  const k = /** @type {Record<string, unknown>} */ (kayit)
  /** @type {string[]} */
  const hatalar = []
  if (!Array.isArray(k.kayitlar) || k.kayitlar.length === 0) hatalar.push('kayitlar bos olmayan dizi olmali')
  else {
    k.kayitlar.forEach((g, i) => hatalar.push(...girdiHatalari(g, `kayitlar[${i}]`)))
    const idler = k.kayitlar.map((g) => (duzNesne(g) ? /** @type {Record<string, unknown>} */ (g).id : undefined))
    if (new Set(idler).size !== idler.length) hatalar.push('kayitlar: ayni id birden cok kez (bir urun iki kez geri alinamaz)')
  }
  if (k.yarislar !== undefined) {
    if (!Array.isArray(k.yarislar)) hatalar.push('yarislar dizi olmali')
    else k.yarislar.forEach((g, i) => hatalar.push(...girdiHatalari(g, `yarislar[${i}]`)))
  }
  if (hatalar.length) return { hatalar, kayit: null }
  return {
    hatalar,
    kayit: { kayitlar: /** @type {Hedef[]} */ (k.kayitlar), yarislar: /** @type {Hedef[]} */ (k.yarislar ?? []) },
  }
}

/**
 * Satir basina geri alma degeri (yarislar kaydi varsa o, yoksa kayitlar).
 * @param {{ kayitlar: Hedef[], yarislar: Hedef[] }} kayit
 * @returns {GeriAlmaHedefi[]}
 */
export function geriAlmaHedefleri(kayit) {
  return kayit.kayitlar.map((k) => {
    // Ayni urun icin birden cok yaris kaydi olursa SONUNCUSU (yazicinin en son gordugu taze hal)
    const yaris = [...kayit.yarislar].reverse().find((y) => y.id === k.id)
    return yaris
      ? { id: k.id, sku: k.sku, onceki: yaris.onceki, sonraki: yaris.sonraki, kaynak: /** @type {const} */ ('yaris') }
      : { id: k.id, sku: k.sku, onceki: k.onceki, sonraki: k.sonraki, kaynak: /** @type {const} */ ('kayit') }
  })
}

/**
 * Canli description_i18n'nin kayittaki hallere gore durumu.
 * @param {unknown} canli
 * @param {Hedef} hedef
 * @returns {SatirDurumu}
 */
export function satirDurumu(canli, hedef) {
  if (kanonikEsit(hedef.onceki, hedef.sonraki)) return 'yazilmamis'
  if (kanonikEsit(canli, hedef.sonraki)) return 'geri-al'
  if (kanonikEsit(canli, hedef.onceki)) return 'zaten-geri-alinmis'
  return 'degismis'
}

/**
 * "Sonradan degismis" raporu icin: canli ile yazdigimiz (sonraki) hal arasinda farkli olan diller/anahtarlar.
 * @param {unknown} canli @param {Record<string, unknown>} sonraki @returns {string[]}
 */
export function degisenAnahtarlar(canli, sonraki) {
  const c = duzNesne(canli) ? /** @type {Record<string, unknown>} */ (canli) : {}
  return [...new Set([...Object.keys(c), ...Object.keys(sonraki)])].filter((a) => !kanonikEsit(c[a], sonraki[a])).sort()
}
