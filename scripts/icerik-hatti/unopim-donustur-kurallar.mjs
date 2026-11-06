/**
 * KTL-80 · UnoPIM dışa aktarma CSV'si → katalog_model satırı dönüştürücüsünün SAF kuralları.
 *
 * Plan: KTL-76 (PLAN-donusturucu-ve-eksik-alanlar.md §1). Bu dosya dosya/ağ/DB'ye dokunmaz; CLI
 * (unopim-donustur.mjs) okur ve yazar, buradaki işlevler yalnız dönüştürür ve denetler.
 *
 * Kurallar (plan §1 maddeleri):
 *  1. İki dil satırı `sku` ile birleşir; en_US adı ad_en, tr_TR adı ad_tr. Boş tr_TR HATA DEĞİL "eksik"
 *     kaydıdır; yayına alınmasını engelleyen sebep olarak listelenir.
 *  2. Birim etiketi → kod: her alanın TEK etiketi vardır ve alan soneki etiketle tutarlı olmalıdır
 *     (§11.6: alan adı birimi taahhüt eder). Uyuşmazlık satırı reddedilir. Değer SAYI olarak yazılır.
 *  3. Tür dönüşümleri: boolean metni → boolean; ölçülü değer → number; boş hücre yazılmaz;
 *     pq_curve KAYNAK ETİKETİ olmadan teknik'e GİRMEZ (eğri hattı KTL-7/9), eksik raporuna düşer.
 *  4. Görsel yolu burada üretilmez (arşiv eşlemesi CLI'da); UnoPIM yolu yeni şemada anlamsızdır.
 *  5. durum: status=false → 'taslak'.
 *  6. Slug: Adres Şeması v3 kararı gelene kadar url_key'den KOPYALANMAZ, boş bırakılır.
 */

/** Etiket → izin verilen alan sonekleri (birim-etiketi-esleme.csv ile aynı 13 etiket). */
export const ETIKET_SONEKLERI = {
  Ampere: ['_a'],
  'Meter per second': ['_ms'],
  Millimeter: ['_mm'],
  Hertz: ['_hz'],
  Kilowatt: ['_kw'],
  Watt: ['_w'],
  Celsius: ['_c'],
  'Cubic meter per hour': ['_m3h'],
  Pascal: ['_pa'],
  Volt: ['_v'],
  Decibel: ['_db_a', '_db'],
  Liter: ['_l'],
  Kilogram: ['_kg'],
}

/** Teknik olmayan (UnoPIM varsayılan/meta) sütunlar: bunlar teknik jsonb'a GİRMEZ. */
export const TEKNIK_OLMAYAN = new Set([
  'channel', 'locale', 'sku', 'status', 'type', 'parent', 'attribute_family', 'variant_structure',
  'configurable_attributes', 'categories', 'name', 'url_key', 'tax_category_id', 'image',
  'short_description', 'description', 'price (USD)', 'price (TRY)', 'cost (USD)', 'cost (TRY)',
  'meta_title', 'meta_keywords', 'meta_description', 'length', 'width', 'height', 'weight', 'color',
  'size', 'brand', 'product_number', 'manage_stock',
])

/** RFC 4180 CSV ayrıştırıcı (tırnaklı virgül, "" kaçışı, CRLF, BOM). Bağımlılıksız. */
export function csvAyristir(metin) {
  const s = metin.replace(/^﻿/, '')
  const satirlar = []
  let satir = []
  let alan = ''
  let tirnakta = false
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (tirnakta) {
      if (c === '"') {
        if (s[i + 1] === '"') { alan += '"'; i++ } else tirnakta = false
      } else alan += c
    } else if (c === '"') tirnakta = true
    else if (c === ',') { satir.push(alan); alan = '' }
    else if (c === '\n') { satir.push(alan.replace(/\r$/, '')); satirlar.push(satir); satir = []; alan = '' }
    else alan += c
  }
  if (alan !== '' || satir.length) { satir.push(alan.replace(/\r$/, '')); satirlar.push(satir) }
  return satirlar
}

/** Başlıklı CSV → nesne dizisi. Boş son satırlar atılır. */
export function csvNesneler(metin) {
  const [baslik, ...govde] = csvAyristir(metin)
  return govde
    .filter((r) => r.some((h) => h !== ''))
    .map((r) => Object.fromEntries(baslik.map((b, i) => [b, r[i] ?? ''])))
}

/** birim-etiketi-esleme.csv → { alan: etiket } ve kendi içinde tutarlılık hatası listesi. */
export function birimHaritasi(satirlar) {
  const harita = {}
  const hatalar = []
  for (const { alan, unopim_birim_etiketi: etiket } of satirlar) {
    if (!alan) continue
    if (harita[alan] && harita[alan] !== etiket) hatalar.push(`${alan}: iki etiket (${harita[alan]}, ${etiket})`)
    harita[alan] = etiket
    const sonekler = ETIKET_SONEKLERI[etiket]
    if (!sonekler) hatalar.push(`${alan}: bilinmeyen etiket "${etiket}"`)
    else if (!sonekler.some((k) => alan.endsWith(k))) hatalar.push(`${alan}: soneki "${etiket}" ile uyuşmuyor`)
  }
  return { harita, hatalar }
}

const BOS = (v) => v === undefined || v === null || String(v).trim() === ''

/** "251.0000" → 251; sayı değilse null. */
export function sayiya(metin) {
  const t = String(metin).trim().replace(',', '.')
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null
  return Number(t)
}

/** Teknik sütun adları: başlıktaki meta olmayan ve "(unit)" olmayan sütunlar. */
export function teknikSutunlar(baslik) {
  return baslik.filter((b) => !TEKNIK_OLMAYAN.has(b) && !b.endsWith('(unit)') && !/^(price|cost) \(/.test(b))
}

/** pq_curve metni → [[x,y],...] ya da null. x artan olmalı. */
export function egriAyristir(metin) {
  try {
    const d = JSON.parse(metin)
    if (!Array.isArray(d) || d.length < 2) return null
    if (!d.every((n) => Array.isArray(n) && n.length === 2 && n.every((x) => typeof x === 'number'))) return null
    for (let i = 1; i < d.length; i++) if (!(d[i][0] > d[i - 1][0])) return null
    return d
  } catch {
    return null
  }
}

/**
 * Bir ürünün iki dil satırını (en_US, tr_TR) katalog_model satırına çevirir.
 * Döner: { satir, hatalar:[{kod,ayrinti}], eksikler:[kod], yayinEngelleri:[kod] }.
 * HATA satırı reddeder (satir yine döner ama `kabul=false`); EKSİK yalnız raporlanır.
 */
export function modelDonustur({ en, tr }, teknikAlanlar, birimler) {
  const hatalar = []
  const eksikler = []
  const sku = (en || tr).sku
  const aile = (en || tr).attribute_family
  if (!/^[A-Z0-9-]+$/.test(sku || '')) hatalar.push({ kod: 'SKU_DESEN', ayrinti: `sku "${sku}" ^[A-Z0-9-]+$ değil` })
  if (!en) hatalar.push({ kod: 'DIL_EKSIK', ayrinti: 'en_US satırı yok' })
  if (!tr) hatalar.push({ kod: 'DIL_EKSIK', ayrinti: 'tr_TR satırı yok' })

  const al = (alan) => {
    const a = en?.[alan]
    const b = tr?.[alan]
    if (!BOS(a) && !BOS(b) && a !== b) hatalar.push({ kod: 'DIL_CELISKI', ayrinti: `${alan}: en_US "${a}" ≠ tr_TR "${b}"` })
    return !BOS(a) ? a : !BOS(b) ? b : ''
  }

  const teknik = {}
  const egriKaynaksiz = []
  for (const alan of teknikAlanlar) {
    const ham = al(alan)
    if (BOS(ham)) continue
    if (alan === 'pq_curve') {
      // Kaynak etiketi (pq_curve_kaynak) UnoPIM'de yok: eğri kapıdan geçemez, teknik'e GİRMEZ.
      egriKaynaksiz.push(sku)
      continue
    }
    const etiket = al(`${alan}(unit)`)
    const beklenen = birimler[alan]
    if (!BOS(etiket)) {
      if (!beklenen) { hatalar.push({ kod: 'BIRIM_BILINMIYOR', ayrinti: `${alan}: etiket "${etiket}" eşleme tablosunda yok` }); continue }
      if (etiket !== beklenen) { hatalar.push({ kod: 'BIRIM_UYUSMAZ', ayrinti: `${alan}: "${etiket}" ≠ beklenen "${beklenen}"` }); continue }
      const sayi = sayiya(ham)
      if (sayi === null) { hatalar.push({ kod: 'DEGER_SAYI_DEGIL', ayrinti: `${alan}: "${ham}"` }); continue }
      teknik[alan] = sayi
    } else if (beklenen) {
      hatalar.push({ kod: 'BIRIM_BOS', ayrinti: `${alan}: değer var ama birim etiketi boş` })
    } else if (ham === 'true' || ham === 'false') teknik[alan] = ham === 'true'
    else {
      const sayi = /^\d+\.\d{4}$/.test(ham) ? sayiya(ham) : null
      teknik[alan] = sayi ?? ham
    }
  }

  const statusMetni = al('status')
  const durum = statusMetni === 'false' ? 'taslak' : statusMetni === 'true' ? 'yayinda' : null
  if (durum === null) hatalar.push({ kod: 'DURUM_BILINMIYOR', ayrinti: `status "${statusMetni}"` })

  const adEn = en?.name || ''
  const adTr = tr?.name || ''
  const kisaEn = en?.short_description || ''
  const kisaTr = tr?.short_description || ''
  const acEn = en?.description || ''
  const acTr = tr?.description || ''
  if (!adEn) eksikler.push('AD_EN')
  if (!adTr) eksikler.push('AD_TR')
  if (!kisaEn) eksikler.push('KISA_ACIKLAMA_EN')
  if (!kisaTr) eksikler.push('KISA_ACIKLAMA_TR')
  if (!acEn) eksikler.push('ACIKLAMA_EN')
  if (!acTr) eksikler.push('ACIKLAMA_TR')
  if (egriKaynaksiz.length) eksikler.push('EGRI_KAYNAK_ETIKETI')
  eksikler.push('SLUG_KARAR_BEKLIYOR')
  if (Object.keys(teknik).length === 0) eksikler.push('TEKNIK_BOS')

  return {
    kabul: hatalar.length === 0,
    satir: {
      sku,
      aile_kodu: aile || null,
      durum,
      ad_en: adEn || null,
      ad_tr: adTr || null,
      kisa_aciklama_en: kisaEn || null,
      kisa_aciklama_tr: kisaTr || null,
      aciklama_en: acEn || null,
      aciklama_tr: acTr || null,
      slug_tr: null,
      slug_en: null,
      unopim_url_key: al('url_key') || null,
      teknik,
      unopim_gorsel_yolu: al('image') || null,
    },
    hatalar,
    eksikler,
    egriKaynaksiz: egriKaynaksiz.length > 0,
  }
}

/** "Yayında olamaz" sebepleri: satırın yayına alınmasını engelleyen eksik kodları. */
export function yayinEngelleri(eksikler) {
  const engel = new Set(['AD_TR', 'ACIKLAMA_TR', 'KISA_ACIKLAMA_TR', 'SLUG_KARAR_BEKLIYOR', 'TEKNIK_BOS'])
  return eksikler.filter((e) => engel.has(e))
}

/** Satırları sku'ya göre gruplar: { sku: { en, tr } }. Aynı sku+dil iki kez geçerse hata listesine düşer. */
export function dilGrupla(nesneler) {
  const gruplar = new Map()
  const tekrar = []
  for (const n of nesneler) {
    const g = gruplar.get(n.sku) || {}
    const dil = n.locale === 'en_US' ? 'en' : n.locale === 'tr_TR' ? 'tr' : null
    if (!dil) { tekrar.push({ sku: n.sku, ayrinti: `bilinmeyen dil "${n.locale}"` }); continue }
    if (g[dil]) tekrar.push({ sku: n.sku, ayrinti: `${n.locale} satırı iki kez` })
    g[dil] = n
    gruplar.set(n.sku, g)
  }
  return { gruplar, tekrar }
}
