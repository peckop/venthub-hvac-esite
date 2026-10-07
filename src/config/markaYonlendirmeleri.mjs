/**
 * YAYINDAN KALKAN MARKA ADRESLERİ — kalıcı (308) yönlendirme listesinin TEK üreticisi (REC-374).
 *
 * NİÇİN: marka listesi (`src/data/brands.ts`) DB'de aktif ürünü olan markalardır. REC-374'te üç eski
 * slug listeden çıktı; adresleri canlıda 200 veriyordu (2026-09-27 ölçüldü) ve site haritasında
 * ilan ediliyordu. Yönlendirmesiz bırakılırsa 404'e düşerler.
 *
 * OPS-51 (karar 264 + 265, 2026-10-04): iki slug LİSTEYE GERİ DÖNDÜ ve buradan SİLİNDİ (ikisi birlikte
 * olursa sayfa erişilmez olur — INV-MARKA-KAYNAK-1 bu çakışmada kırmızı yanar):
 *  · `casals` — AYRI MARKA oldu (AVenS distribütör); 4 ailesi / 53 modeli `brands.casals`'a bağlandı
 *    (supabase/migrations/20261004120000_casals_flexiva_markalari_siginak_kok.sql).
 *  · `flexiva` — marka kaydı açıldı, ÜRÜNÜ YOK; sayfa "ürünler yakında" durumuyla yayında (brands.ts `yakinda`).
 * Geriye tek satır kaldı:
 *  · `frekans-konvertoru` — marka DEĞİL, ürün türü → frekans konvertörleri KATEGORİSİNE.
 *
 * NİÇİN .mjs: `next.config.mjs` TypeScript içe aktaramaz (aynı gerekçe: bilgiMerkeziYonlendirmeleri.mjs).
 * Test bu fonksiyonu doğrudan çağırır ve hedefleri `adresUret(…, dil, bayrak)` ile İKİ bayrak
 * hâlinde karşılaştırır — yayındaki kural ile test edilen kural aynı koddur.
 *
 * TEK HOP: `next.config` yönlendirmeleri middleware'den (eski adres eşleyicisi) ve sayfa rotasından
 * ÖNCE koşar. Bu yüzden hedef bayrağa göre kurulur: K3-b açıkken kategori adresi iki seviyeli yeni
 * şemadır; bayrak kapalıyken bugünkü tek seviyeli adres. Hedefin kendisi yönlendirme değildir.
 *
 * KATEGORİ SLUG'LARI DB'DEN ÖLÇÜLDÜ (2026-09-27, canlı): `frequency-converters`
 * (metadata.slug.tr = `frekans-konvertorleri`, aktif, 35 aktif ürün — hepsi Danfoss), üstü
 * `control-systems` (metadata.slug.tr = `kontrol-sistemleri`, aktif).
 */

/**
 * Listeden çıkan marka slug'ı → hedef. `kategori` = dile göre kök/dal slug'ı; `liste` = marka listesi.
 * @type {Readonly<Record<string, { tur: 'kategori', kok: { tr: string, en: string }, dal: { tr: string, en: string } } | { tur: 'liste' }>>}
 */
export const KALDIRILAN_MARKALAR = Object.freeze({
  'frekans-konvertoru': {
    tur: 'kategori',
    kok: { tr: 'kontrol-sistemleri', en: 'control-systems' },
    dal: { tr: 'frekans-konvertorleri', en: 'frequency-converters' },
  },
})

/** Yeni şemada (K3-b) dile göre bölüm adları — `adresUret.ts` BOLUM tablosuyla aynı olmalı (test ölçer). */
const KATEGORI_BOLUMU = /** @type {const} */ ({ tr: 'kategori', en: 'category' })

/**
 * `src/config/features.ts` metninden `ADRES_SEMASI_K3B` değerini okur. Metin beklenen biçimde
 * değilse ATAR: bayrak okunamadığında "kapalı" varsaymak, açık bayrakla iki hop üretirdi.
 * @param {string} kaynak
 * @returns {boolean}
 */
export function k3bOku(kaynak) {
  const eslesmeler = [...kaynak.matchAll(/^export const ADRES_SEMASI_K3B = (true|false)\s*$/gm)]
  if (eslesmeler.length !== 1) {
    throw new Error(
      `markaYonlendirmeleri: features.ts içinde tek bir "export const ADRES_SEMASI_K3B = true|false" satırı bekleniyordu, ${eslesmeler.length} bulundu`,
    )
  }
  return eslesmeler[0][1] === 'true'
}

/**
 * Eski marka adresinin hedefi.
 * @param {string} slug
 * @param {'tr' | 'en'} dil
 * @param {boolean} k3b
 * @returns {string}
 */
export function markaHedefi(slug, dil, k3b) {
  const h = KALDIRILAN_MARKALAR[slug]
  if (!h) throw new Error(`markaYonlendirmeleri: bilinmeyen eski marka "${slug}"`)
  // Marka LİSTESİ yeni şemada da `/<dil>/brands` (adresUret'te liste nesnesi yok; Routes.brands()).
  if (h.tur === 'liste') return `/${dil}/brands`
  return k3b
    ? `/${dil}/${KATEGORI_BOLUMU[dil]}/${h.kok[dil]}/${h.dal[dil]}`
    : `/${dil}/category/${h.dal[dil]}`
}

/**
 * @typedef {{ source: string, destination: string, permanent: boolean }} Yonlendirme
 */

/**
 * REC-374 yönlendirmeleri: her eski slug × iki dil `/<dil>/brands/<slug>`; K3-b açıkken TR marka
 * adresi `/tr/markalar/<slug>` olduğu için o adres de aynı hedefe gider.
 * @param {boolean} k3b
 * @returns {Yonlendirme[]}
 */
export function markaYonlendirmeleri(k3b) {
  /** @type {Yonlendirme[]} */
  const liste = []
  for (const slug of Object.keys(KALDIRILAN_MARKALAR)) {
    for (const dil of /** @type {const} */ (['tr', 'en'])) {
      liste.push({ source: `/${dil}/brands/${slug}`, destination: markaHedefi(slug, dil, k3b), permanent: true })
    }
    if (k3b) {
      liste.push({ source: `/tr/markalar/${slug}`, destination: markaHedefi(slug, 'tr', k3b), permanent: true })
    }
  }
  return liste
}
