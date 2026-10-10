/**
 * KATEGORİ META DÜZELTİCİ KURALLARI — saf fonksiyonlar (ağ yok, disk yok, DB yok). KTL-11.
 * `kategori-meta-duzelt.mjs` bunları kullanır; `__tests__/kategori-meta-duzelt.test.ts` kilitler.
 *
 * NİÇİN AYRI: `kategori-metni-yaz.mjs` (yalnız TR, taslaktan) ve `kategori-en-yaz.mjs` (yalnız EN,
 * tr_md5 ister) kategori metadata'sındaki hero/marketing/features alanlarını düzeltemiyor. Bu çekirdek
 * `categories.metadata` içinde ALTI yoldan birinde alan düzeyinde değişiklik hesaplar; metadata'nın
 * geri kalanı (slug, hide_price, ...) AYNEN taşınır (JSONB birleştirme; ezme YOK).
 *
 * İZİNLİ YOLLAR (metadata altında) — başka her yol RED:
 *   ["description_i18n","tr"] · ["description_i18n","en"] · ["hero_description"] · ["marketing_title"]
 *   ["features",<i>,"title"] · ["features",<i>,"description"]   (i: mevcut features dizisiyle sınırlı)
 *   KTL-21: ["seo_title_en"] · ["seo_desc_en"] (metadata) ve ["@kolon","seo_title"] · ["@kolon","seo_desc"]
 *   (categories.seo_title / seo_desc ÜST DÜZEY KOLONLAR; yazıcı satırı "@kolon" kökünlü belgeye çevirir)
 *
 * KALEM: {slug, yol, eski: null|dizge, yeni: dizge, tam: boolean}
 *   tam=true  → alanın BÜTÜN değeri değişir; `eski` alanın şu anki tam değerine eşit olmalı
 *               (alan boş/yok ise `eski` null olmalı).
 *   tam=false → `eski` alanda TAM 1 kez geçen bir parçadır; yalnız o parça `yeni` ile değişir.
 */
import { REF_DESENI } from './aile-metni-kurallar.mjs'

/**
 * Anahtar sırasından bağımsız JSON: jsonb geri okumada anahtarları kendi sırasıyla döndürür.
 * @param {unknown} v
 * @returns {string}
 */
export function kanon(v) {
  if (Array.isArray(v)) return `[${v.map(kanon).join(',')}]`
  if (v && typeof v === 'object') return `{${Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + kanon(/** @type {Record<string, unknown>} */ (v)[k])).join(',')}}`
  return JSON.stringify(v) ?? 'undefined'
}

/** @typedef {Array<string | number>} Yol */
/** @typedef {{ slug: string, yol: Yol, eski: string | null, yeni: string | null, tam: boolean }} Kalem */
/** @typedef {Record<string, unknown>} Meta */
/** @typedef {{ kural: string, gecti: boolean, ayrinti?: string }} KuralSonucu */

/** İnsan okuyacağı yol adı: description_i18n.en · features[2].title */
export const yolEtiketi = (/** @type {Yol} */ yol) => (Array.isArray(yol) ? yol : [])
  .map((p, i) => typeof p === 'number' ? `[${p}]` : (i ? `.${p}` : String(p))).join('')

const dizi = (/** @type {unknown} */ v) => Array.isArray(v)
const nesne = (/** @type {unknown} */ v) => !!v && typeof v === 'object' && !Array.isArray(v)
const bosMu = (/** @type {unknown} */ v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '')

/** Üst anahtar adları (yol[0]) — beyaz liste; başka kök anahtar (slug, hide_price, name, parent...) yok. */
const TEK_ALAN_YOLLARI = new Set(['hero_description', 'marketing_title', 'seo_title_en', 'seo_desc_en'])

/**
 * KTL-21: üst düzey KOLON kalemleri (categories.seo_title / seo_desc) belgenin "@kolon" kökü altında durur:
 * yazıcı satırı {...metadata, "@kolon": {seo_title, seo_desc}} belgesine çevirir, çekirdek aynı alanOku/alanYaz ile
 * çalışır, yazıcı sonucu geri böler. "@" ile başlayan anahtar gerçek bir metadata anahtarı olamaz (çakışma yok).
 */
export const KOLON = '@kolon'
const KOLON_ALANLARI = new Set(['seo_title', 'seo_desc'])

/**
 * Arama sonucu alanı uzunluk aralıkları [en az, en çok] karakter. GEÇİCİ: Geo-SEO SEO-32 hedefi (cetvel yok;
 * Bing eşiği resmî kaynakta bulunamadı). Başlık EKSİZ yazılır (kategori sayfası " | VentHub" ekini kendisi ekler:
 * ekle 30-60), açıklama sayfanın kırpıcısından önceki değerdir.
 */
export const SEO_UZUNLUK = /** @type {Record<string, [number, number]>} */ ({
  seo_title: [20, 50], seo_title_en: [20, 50], seo_desc: [110, 155], seo_desc_en: [110, 155],
})

/** Yolun arama alanı adı (seo_title | seo_desc | seo_title_en | seo_desc_en) ya da null. */
export function seoAlani(/** @type {unknown} */ yol) {
  if (!dizi(yol)) return null
  const y = /** @type {Yol} */ (yol)
  if (y.length === 2 && y[0] === KOLON && typeof y[1] === 'string' && KOLON_ALANLARI.has(y[1])) return y[1]
  if (y.length === 1 && typeof y[0] === 'string' && Object.hasOwn(SEO_UZUNLUK, y[0])) return y[0]
  return null
}

/**
 * KURAL 1 — yol kapısı. `metadata` verilirse features indeksi mevcut diziyle sınırlanır.
 * @returns {string | null} hata sebebi (null = geçti)
 */
export function yolKapisi(/** @type {unknown} */ yol, /** @type {Meta | null | undefined} */ metadata) {
  if (!dizi(yol) || yol.length === 0) return 'yol boş ya da dizi değil'
  const y = /** @type {Yol} */ (yol)
  const [k0, k1, k2] = y
  if (y.length === 1 && typeof k0 === 'string' && TEK_ALAN_YOLLARI.has(k0)) return null
  if (y.length === 2 && k0 === 'description_i18n' && (k1 === 'tr' || k1 === 'en')) return null
  if (y.length === 2 && k0 === KOLON && typeof k1 === 'string' && KOLON_ALANLARI.has(k1)) return null
  if (y.length === 3 && k0 === 'features' && Number.isInteger(k1) && /** @type {number} */ (k1) >= 0 && (k2 === 'title' || k2 === 'description')) {
    if (metadata === undefined) return null
    const f = metadata?.features
    if (!dizi(f)) return 'features dizisi yok'
    if (/** @type {number} */ (k1) >= /** @type {unknown[]} */ (f).length) return `features[${k1}] yok (dizi ${/** @type {unknown[]} */ (f).length} elemanlı)`
    if (!nesne(/** @type {unknown[]} */ (f)[/** @type {number} */ (k1)])) return `features[${k1}] nesne değil`
    return null
  }
  return `yol izinli değil: ${JSON.stringify(y)} (izinli: description_i18n.tr|en, hero_description, marketing_title, seo_title_en, seo_desc_en, ${KOLON}.seo_title|seo_desc, features[i].title|description)`
}

/** Alanın şu anki değeri (yoksa undefined). Yol önceden yolKapisi'ndan geçmiş olmalı. */
export function alanOku(/** @type {Meta | null | undefined} */ metadata, /** @type {Yol} */ yol) {
  /** @type {unknown} */
  let v = metadata
  for (const p of yol) {
    if (v === null || v === undefined || typeof v !== 'object') return undefined
    v = /** @type {Record<string | number, unknown>} */ (v)[p]
  }
  return v
}

/**
 * KURAL 5 — ALAN DÜZEYİNDE yazım: yalnız yol boyunca kopyalar, metadata'nın geri kalanı AYNI nesne
 * referanslarıyla taşınır (hiçbir kök anahtar düşmez, hiçbiri yeniden kurulmaz). Girdiyi değiştirmez.
 */
export function alanYaz(/** @type {Meta | null | undefined} */ metadata, /** @type {Yol} */ yol, /** @type {string | null} */ deger) {
  const kok = nesne(metadata) ? /** @type {Meta} */ (metadata) : {}
  /** @param {unknown} dugum @param {number} i @returns {unknown} */
  const yaz = (dugum, i) => {
    const anahtar = yol[i]
    const kopya = dizi(dugum) ? [.../** @type {unknown[]} */ (dugum)] : { .../** @type {Record<string, unknown>} */ (nesne(dugum) ? dugum : {}) }
    const hedef = /** @type {Record<string | number, unknown>} */ (/** @type {unknown} */ (kopya))
    hedef[anahtar] = i === yol.length - 1 ? deger : yaz(hedef[anahtar], i + 1)
    return kopya
  }
  return /** @type {Meta} */ (yaz(kok, 0))
}

/**
 * KTL-21 GERİ ALMA — arama alanını BOŞALTIR (yazım planının tersi: alan yazımdan önce boştu). Yalnız seoAlani yolları:
 * "@kolon" altındaki kolon null olur (kolon belgede hep bulunur); metadata anahtarı (seo_title_en/seo_desc_en) SİLİNİR
 * ("yok" ile "boş dizge" aynı sayılmaz; yazımdan önce anahtar yoktu). Metadata'nın geri kalanı AYNI referanslarla taşınır.
 */
export function alanBosalt(/** @type {Meta | null | undefined} */ metadata, /** @type {Yol} */ yol) {
  if (seoAlani(yol) === null) throw new Error(`alanBosalt yalnız arama alanlarında: ${JSON.stringify(yol)}`)
  if (yol[0] === KOLON) return alanYaz(metadata, yol, null)
  const kok = nesne(metadata) ? /** @type {Meta} */ (metadata) : {}
  const kalan = { ...kok }
  delete kalan[/** @type {string} */ (yol[0])]
  return kalan
}

/** Örtüşmeli sayım: "aa" için "aaa" 2 kez geçer (belirsiz eşleşmeyi gizlemesin). */
export function say(/** @type {string} */ metin, /** @type {string} */ parca) {
  if (!parca) return 0
  let n = 0
  for (let i = metin.indexOf(parca); i >= 0; i = metin.indexOf(parca, i + 1)) n++
  return n
}

// ---- KURAL 3 (d) abartı kalıpları: Unicode \p{L} sözcük sınırı. "bütünleşiktir" içindeki "şik" yanlış pozitif OLMAZ.
// Eşleşme TAM SÖZCÜKTÜR (çekimli biçimler, örn. "garantisi", yakalanmaz): "üstün" ⊂ "üstünde/üstüne" yanlış pozitifi
// kuyruk eki bırakılsaydı kaçınılmaz olurdu. Kapsam bilinçli dar: liste müdürün KTL-11 şartnamesidir.
const ABARTI_KALIPLARI = [
  'üstün', 'maksimum', 'en iyi', 'en verimli', 'yüksek performans', 'yüksek verimli', 'gelişmiş', 'estetik', 'şık', 'optimum',
  'garanti', 'tasarruf', 'superior', 'maximum', 'best', 'most efficient', 'high-performance', 'high-efficiency', 'advanced',
]
const ayracli = (/** @type {string} */ k) => k.split(/[\s-]+/).join('[\\s-]+')
const ABARTI = new RegExp(`(?<![\\p{L}\\p{N}])(?:${ABARTI_KALIPLARI.map(ayracli).join('|')})(?![\\p{L}\\p{N}])`, 'u')
const TURKCE_HARF = /[çğıöşüÇĞİÖŞÜ]/

/** @param {string} m @returns {string | null} bulunan abartı kalıbı */
function abartiBul(m) {
  // Türkçe büyük harf (İ/I) ve İngilizce için iki küçültme; birinde yakalanan yeter.
  for (const k of [m.toLowerCase(), m.toLocaleLowerCase('tr-TR')]) {
    const e = ABARTI.exec(k)
    if (e) return e[0]
  }
  return null
}

/** İç not / biçim artığı: `---`, [MANIFEST], "TR kaynak", satır başı `>`, dengesiz `**`. */
function notArtigiBul(/** @type {string} */ m) {
  if (m.includes('---')) return '---'
  if (m.includes('[MANIFEST]')) return '[MANIFEST]'
  if (/TR kaynak/i.test(m)) return 'TR kaynak'
  if (/^[ \t]*>/m.test(m)) return 'satır başı >'
  if ((m.match(/\*\*/g) ?? []).length % 2 === 1) return 'dengesiz **'
  return null
}

/** Kategori metninde iş numarası yasak: REC-nn / KTL-nn / OPS-nn ve tek başına büyük harfli OPS (REF_DESENI yalnız [s.41] / [DB] kalıbını yakalar). */
const IS_NUMARASI = /(?<![\p{L}\p{N}])(?:(?:REC|KTL|URN|ALT|SEO|BLG|HRT|ADM|SAT|EDG|TSR|OPS)-\d+|OPS)(?![\p{L}\p{N}])/u

// ---- KTL-21 arama alanı kapıları (bağımsız iddia okuması bulguları: R3 rakama, çekimli iddia köküne ve kaynakta olmayan özel ada KÖRDÜ).
/** Kök eşleşmesi (çekimli biçimler dahil): "tasarrufu", "garantili", "sertifikalı", "maliyeti" yakalanır. Yalnız arama alanlarında. */
const IDDIA_KOKU = /(?<![\p{L}\p{N}])(?:tasarruf|garanti|sertifika|belgeli|maliyet|ücretsiz|indirim|kazanç|saving|warrant|certif|cost|discount)/u
const RAKAM = /[\d%]|(?<![\p{L}\p{N}])(?:yüzde|percent)(?![\p{L}\p{N}])/iu
// ı→i katlaması: Türkçe küçültmede İngilizce "Installation" "ınstallation" olur ve kaynaktaki "installation" ile eşleşmezdi.
const kucuk = (/** @type {string} */ x) => x.toLocaleLowerCase('tr-TR').replace(/ı/g, 'i')

/**
 * Kategorinin KENDİ metin kaynağı: metadata'daki bütün dizgeler (açıklama, hero, başlık, özellikler, slug).
 * Arama alanlarının kendisi (seo_*_en, "@kolon") DIŞARIDA: plan kalemi kendi yazdığı metne dayanarak "kaynakta var" sayılamaz.
 * @param {Meta | null | undefined} metadata
 */
export function kaynakMetni(metadata) {
  /** @type {string[]} */
  const parca = []
  /** @param {unknown} v */
  const gez = (v) => {
    if (typeof v === 'string') parca.push(v)
    else if (dizi(v)) /** @type {unknown[]} */ (v).forEach(gez)
    else if (nesne(v)) for (const [k, x] of Object.entries(/** @type {Meta} */ (v))) { if (k !== KOLON && k !== 'seo_title_en' && k !== 'seo_desc_en') gez(x) }
  }
  gez(metadata)
  return parca.join('\n')
}

/**
 * Marka/model/özel ad kapısı: büyük harfli sözcük kategorinin KENDİ kaynağında geçmeli.
 * - AÇIKLAMA (baslikMi=false): büyük harfle başlayan HER sözcük (cümle başı dahil: "Vortice fanları…").
 * - BAŞLIK (baslikMi=true): başlıkta her sözcük büyük harfle başladığı için büyük harf bilgi taşımaz;
 *   yalnız TAMAMI BÜYÜK sözcükler (AIR DOOR, PTC, ATEX) denetlenir.
 * Eşleşme: sözcüğün ilk 5 harfi (kısa sözcükte tamamı) kaynakta bir sözcüğün başında aranır (Türkçe çekim eki toleransı).
 * @returns {string[]} kaynakta bulunamayan sözcükler
 */
export function kaynakDisiOzelAd(/** @type {string} */ metin, /** @type {string} */ kaynak, /** @type {boolean} */ baslikMi = false) {
  const sozcukler = kucuk(kaynak).match(/\p{L}+/gu) ?? []
  /** @type {Set<string>} */
  const yok = new Set()
  for (const m of metin.matchAll(/\p{Lu}\p{L}*/gu)) {
    const ham = m[0]
    if (baslikMi && !(ham.length >= 2 && ham === ham.toLocaleUpperCase('tr-TR'))) continue
    const t = kucuk(ham)
    const p = t.slice(0, 5)
    if (!sozcukler.some((w) => w.startsWith(p))) yok.add(ham)
  }
  return [...yok]
}

/**
 * KURAL 3 — `yeni` metin kapıları. Her kural ayrı satırda raporlanır (kuru koşumda ✓/✗).
 * `kaynak` verilirse (arama alanları) kaynak-sözcük kapısı da koşar; verilmezse atlanır.
 * @returns {KuralSonucu[]}
 */
export function metinKapilari(/** @type {string} */ yeni, /** @type {Yol} */ yol, /** @type {string | undefined} */ kaynak) {
  const seo = seoAlani(yol)
  const en = (dizi(yol) && yol[0] === 'description_i18n' && yol[1] === 'en') || seo === 'seo_title_en' || seo === 'seo_desc_en'
  const s = typeof yeni === 'string' ? yeni : ''
  const bos = s.trim() === ''
  const not = notArtigiBul(s)
  const abarti = abartiBul(s)
  /** @type {KuralSonucu[]} */
  const kurallar = [
    { kural: 'R3a boş-değil', gecti: !bos, ayrinti: bos ? 'yeni metin boş' : undefined },
    { kural: 'R3b EN-Türkçe-harf-yok', gecti: !(en && TURKCE_HARF.test(s)), ayrinti: en && TURKCE_HARF.test(s) ? 'EN alanında Türkçe harf' : undefined },
    { kural: 'R3c iç-not-yok', gecti: !not, ayrinti: not ? `iç not/biçim artığı: ${not}` : undefined },
    { kural: 'R3d abartı-yok', gecti: !abarti, ayrinti: abarti ? `abartı kalıbı: "${abarti}"` : undefined },
    { kural: 'R3e ref-yok', gecti: !(REF_DESENI.test(s) || IS_NUMARASI.test(s)), ayrinti: REF_DESENI.test(s) || IS_NUMARASI.test(s) ? 'iç kaynak referansı ya da iş numarası (REC-nn/KTL-nn/OPS)' : undefined },
  ]
  if (seo) {
    // KTL-21: arama sonucu alanları. Marka eki başlıkta YOK (kod ekler); uzunluk GEÇİCİ Geo-SEO aralığı.
    const [alt, ust] = SEO_UZUNLUK[seo]
    const n = s.trim().length
    kurallar.push({ kural: 'R7 seo-uzunluk', gecti: n >= alt && n <= ust, ayrinti: n >= alt && n <= ust ? undefined : `${n} karakter (izinli ${alt}-${ust})` })
    if (seo === 'seo_title' || seo === 'seo_title_en') {
      const ek = /\|\s*VentHub\s*$/i.test(s.trim())
      kurallar.push({ kural: 'R7 baslik-ek-yok', gecti: !ek, ayrinti: ek ? 'başlıkta " | VentHub" eki var (kod ekler; iki kez eklenmez ama uzunluk sınırı eksiz hesaplanır)' : undefined })
    }
    // KTL-21 bağımsız okuma bulguları: sayı/yüzde yok, iddia kökü yok, özel ad kaynakta olmalı.
    const rakam = RAKAM.test(s)
    kurallar.push({ kural: 'R7 seo-rakam-yok', gecti: !rakam, ayrinti: rakam ? 'rakam ya da yüzde var (arama alanında yeni sayı yazılmaz)' : undefined })
    const kok = IDDIA_KOKU.exec(kucuk(s))
    kurallar.push({ kural: 'R7 seo-iddia-koku-yok', gecti: !kok, ayrinti: kok ? `iddia kökü: "${kok[0]}" (tasarruf/garanti/sertifika/maliyet vb. arama alanında yazılmaz)` : undefined })
    if (kaynak !== undefined) {
      const yok = kaynakDisiOzelAd(s, kaynak, seo === 'seo_title' || seo === 'seo_title_en')
      kurallar.push({ kural: 'R7 seo-kaynak-sozcuk', gecti: yok.length === 0, ayrinti: yok.length ? `kaynakta geçmeyen büyük harfli sözcük: ${yok.join(', ')}` : undefined })
    }
  }
  return kurallar
}

/**
 * Kalem şekli (plan JSON'u) — yanlış şekil, kalem RED.
 * @returns {string | null}
 */
export function kalemSekli(/** @type {unknown} */ k) {
  if (!nesne(k)) return 'kalem nesne değil'
  const o = /** @type {Record<string, unknown>} */ (k)
  if (typeof o.slug !== 'string' || !o.slug.trim()) return 'slug yok/boş'
  if (typeof o.tam !== 'boolean') return 'tam true/false olmalı'
  if (o.yeni === null) {
    // KTL-21 geri alma: alanı boşalt. Yalnız arama alanları; kör silme yok (eski = şu anki tam değer ZORUNLU).
    if (seoAlani(o.yol) === null) return 'yeni=null (alanı boşalt) yalnız arama alanlarında geçerli (seo_title, seo_desc, seo_title_en, seo_desc_en)'
    if (o.tam !== true) return 'yeni=null için tam=true gerekli'
    if (typeof o.eski !== 'string' || o.eski.trim() === '') return 'yeni=null için eski dolu metin olmalı (kör silme yok)'
    return null
  }
  if (typeof o.yeni !== 'string') return 'yeni metin değil'
  if (!(o.eski === null || typeof o.eski === 'string')) return 'eski null ya da metin olmalı'
  return null
}

/**
 * Tek kalemi mevcut metadata'ya uygular. SIRA: şekil → yol (R1) → metin (R3) → eşleşme (R2) → idempotent (R6).
 * @param {Meta | null | undefined} metadata
 * @param {Kalem} kalem
 * @param {string} [ekKaynak] satırın metin sütunları (name, menu_label, marketing_title, description); arama alanı kaynak kapısı için
 * @returns {{ durum: 'yaz' | 'ayni' | 'red', sebep?: string, once?: unknown, sonra?: string | null, yeni_metadata?: Meta, kurallar: KuralSonucu[] }}
 */
export function kalemUygula(metadata, kalem, ekKaynak = '') {
  /** @type {KuralSonucu[]} */
  const kurallar = []
  const red = (/** @type {string} */ sebep) => ({ durum: /** @type {const} */ ('red'), sebep, kurallar })
  const sekil = kalemSekli(kalem)
  if (sekil) { kurallar.push({ kural: 'R0 kalem-şekli', gecti: false, ayrinti: sekil }); return red(sekil) }
  const yolHata = yolKapisi(kalem.yol, metadata)
  kurallar.push({ kural: 'R1 yol-kapısı', gecti: !yolHata, ayrinti: yolHata ?? undefined })
  if (yolHata) return red(yolHata)

  if (kalem.yeni === null) {
    // KTL-21 geri alma: metin kapıları uygulanmaz (yazılan metin yok); eşleşme kapısı AYNEN: eski = şu anki tam değer.
    const mevcut = alanOku(metadata, kalem.yol)
    if (bosMu(mevcut)) { kurallar.push({ kural: 'R6 idempotent', gecti: true, ayrinti: 'zaten boş' }); return { durum: 'ayni', once: mevcut, sonra: null, kurallar } }
    if (typeof mevcut !== 'string' || mevcut !== kalem.eski) {
      kurallar.push({ kural: 'R2 eşleşme', gecti: false, ayrinti: 'eski alanın şu anki değerine eşit değil' })
      return red('eski, alanın şu anki tam değerine eşit değil (başkası değiştirmiş olabilir; boşaltılmaz)')
    }
    kurallar.push({ kural: 'R2 eşleşme', gecti: true, ayrinti: 'eski = şu anki tam değer; alan boşaltılacak' })
    return { durum: 'yaz', once: mevcut, sonra: null, yeni_metadata: alanBosalt(metadata, kalem.yol), kurallar }
  }

  // KTL-21: kaynak = metadata dizgeleri + satırın kendi metin sütunları (name, menu_label, marketing_title, description) — sayfanın h1'i bunlardan gelir.
  for (const m of metinKapilari(kalem.yeni, kalem.yol, seoAlani(kalem.yol) ? `${kaynakMetni(metadata)}\n${ekKaynak}` : undefined)) kurallar.push(m)
  const metinHata = kurallar.find(x => !x.gecti)
  if (metinHata) return red(`${metinHata.kural}: ${metinHata.ayrinti}`)

  const simdi = alanOku(metadata, kalem.yol)
  const ay = (/** @type {string} */ sonra, /** @type {string} */ ad) => { kurallar.push({ kural: 'R6 idempotent', gecti: true, ayrinti: ad }); return { durum: /** @type {const} */ ('ayni'), once: simdi, sonra, kurallar } }

  if (kalem.tam) {
    if (typeof simdi === 'string' && simdi === kalem.yeni) return ay(kalem.yeni, 'zaten uygulanmış')
    if (!bosMu(simdi) && typeof simdi !== 'string') { kurallar.push({ kural: 'R2 eşleşme', gecti: false, ayrinti: 'alan metin değil' }); return red('alan metin değil') }
    if (kalem.eski === null) {
      if (!bosMu(simdi)) { kurallar.push({ kural: 'R2 eşleşme', gecti: false, ayrinti: 'alan dolu ama eski=null' }); return red('alan dolu ama eski=null verilmiş (ezilmez)') }
    } else if (simdi !== kalem.eski) {
      kurallar.push({ kural: 'R2 eşleşme', gecti: false, ayrinti: 'eski alanın şu anki değerine eşit değil' })
      return red('eski, alanın şu anki tam değerine eşit değil')
    }
    kurallar.push({ kural: 'R2 eşleşme', gecti: true, ayrinti: kalem.eski === null ? 'alan boş/yok, eski=null' : 'eski = şu anki tam değer' })
    return { durum: 'yaz', once: simdi, sonra: kalem.yeni, yeni_metadata: alanYaz(metadata, kalem.yol, kalem.yeni), kurallar }
  }

  // tam=false: parça değişimi
  if (typeof kalem.eski !== 'string' || kalem.eski === '') { kurallar.push({ kural: 'R2 eşleşme', gecti: false, ayrinti: 'tam=false için eski boş olamaz' }); return red('tam=false için eski (parça) gerekli') }
  if (typeof simdi !== 'string') { kurallar.push({ kural: 'R2 eşleşme', gecti: false, ayrinti: 'alan metin değil/yok' }); return red('alan metin değil ya da yok') }
  if (kalem.yeni.includes(kalem.eski)) {
    // yeni, eski'yi içeriyorsa ikinci koşumda eski yine 1 kez bulunur ve parça iki kez uygulanırdı
    const n = say(simdi, kalem.yeni)
    if (n === 1) return ay(simdi, 'yeni parça alanda zaten var')
    if (n > 1) { kurallar.push({ kural: 'R2 eşleşme', gecti: false, ayrinti: `yeni parça alanda ${n} kez` }); return red(`yeni parça alanda ${n} kez geçiyor (belirsiz)`) }
  }
  const n = say(simdi, kalem.eski)
  if (n === 0) {
    if (say(simdi, kalem.yeni) === 1) return ay(simdi, 'eski yok, yeni alanda tam 1 kez: zaten uygulanmış')
    kurallar.push({ kural: 'R2 eşleşme', gecti: false, ayrinti: '0 eşleşme' })
    return red('eski parça alanda 0 kez geçiyor')
  }
  if (n > 1) { kurallar.push({ kural: 'R2 eşleşme', gecti: false, ayrinti: `${n} eşleşme` }); return red(`eski parça alanda ${n} kez geçiyor (tam 1 olmalı)`) }
  const i = simdi.indexOf(kalem.eski)
  const sonra = simdi.slice(0, i) + kalem.yeni + simdi.slice(i + kalem.eski.length)
  kurallar.push({ kural: 'R2 eşleşme', gecti: true, ayrinti: 'eski alanda tam 1 kez' })
  if (sonra === simdi) return ay(sonra, 'değişiklik yok')
  return { durum: 'yaz', once: simdi, sonra, yeni_metadata: alanYaz(metadata, kalem.yol, sonra), kurallar }
}

/**
 * Bir kategorinin tüm kalemlerini SIRAYLA uygular (sonraki kalem öncekinin sonucunu görür).
 * @param {Meta | null | undefined} metadata
 * @param {Kalem[]} kalemler
 * @param {string} [ekKaynak]
 */
export function kategoriPlani(metadata, kalemler, ekKaynak = '') {
  let gecerli = metadata
  const sonuclar = []
  for (const k of kalemler) {
    const r = kalemUygula(gecerli, k, ekKaynak)
    sonuclar.push({ kalem: k, ...r })
    if (r.durum === 'yaz' && r.yeni_metadata) gecerli = r.yeni_metadata
  }
  return { sonuclar, yeni_metadata: gecerli, degisen: sonuclar.some(s => s.durum === 'yaz'), red: sonuclar.some(s => s.durum === 'red') }
}
