// Kademe-2 yükleyicisinin SAF planlama katmanı (REC-209: en büyük yazıcının sınavı).
// Ağa, DB'ye, diske çıkmaz — load.mjs okur/yazar, bu modül yalnız "ne yazılacak" planını üretir.
// NİÇİN AYRI: load.mjs modül düzeyinde DB'ye bağlanıyordu, bu yüzden kuralları sınanamıyordu;
// en çok satır yazan araç testi olmayan tek yazıcıydı. Kurallar burada, sınav __tests__/planla.test.ts'te.
//
// ⭐KIMLIK KURALI TEK KAYNAKTA (REC-275): sku/slug türetme kimlik-kurali.mjs'de yaşar.
import { kimlikTuret, slugifyTr } from '../icerik-hatti/kimlik-kurali.mjs'

export const CATEGORY_ALIAS = { accessories: 'accessories-components' }
export const BRAND_CANON = { AvenS: 'AVenS' } // harf-varyansı normalize
export const BRAND_PREFIX = { AVenS: 'AVE', Danfoss: 'DAN', 'Nicotra Gebhardt': 'NIC', SEAT: 'SEA', Vortice: 'VRT' }
export const SUBCAT_SUFFIX = {
  'circular-duct-fans': 'circular', 'rectangular-duct-fans': 'rectangular',
  'roof-fans': 'roof', 'smoke-exhaust-fans': 'smoke', 'axial-industrial-fans': 'axial',
}
// Birden çok (kategori, alt kategori) çiftini taşıyan CSV'ler: aile = CSV × alt kategori soneki.
export const COK_CIFTLI_CSV = ['vortice-vort-commercial-in-line', 'vortice-vort-heatmaster-slimroof', 'vortice-vort-industrial-ventilation', 'vortice-radon-range']

export function parseCsv(text, delim = ';') {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  const rows = []
  let row = []; let field = ''; let q = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else q = false }
      else field += ch
    } else if (ch === '"') q = true
    else if (ch === delim) { row.push(field); field = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.length > 1 || row[0] !== '') rows.push(row)
      row = []
    } else field += ch
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  const header = rows.shift()
  return rows.map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])))
}

export function parseYamlMap(text) {
  // family-map.yaml için yalın parser: `key: { name_tr: "...", name_en: "...", series_code: "..." }`
  const out = {}
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([a-z0-9-]+):\s*\{(.+)\}\s*$/)
    if (!m) continue
    const obj = {}
    for (const kv of m[2].matchAll(/(\w+):\s*"([^"]*)"/g)) obj[kv[1]] = kv[2]
    out[m[1]] = obj
  }
  return out
}

export function num(v) {
  if (v === undefined || v === null || v === '') return null
  const n = Number(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

export function specValue(raw) {
  const s = raw.trim()
  if (/^(true|false)$/i.test(s)) return s.toLowerCase() === 'true'
  const n = num(s)
  if (n !== null && /^[\d.,\s-]+$/.test(s)) return n
  return s
}

/**
 * CSV dosyalarını satırlara çevirir. Kodsuz satır SESSİZ DÜŞMEZ (REC-275): kaynakta kodu olmayan
 * gerçek ürün var (avensair s.26, beş CA IL satırı); eskiden atılıyordu ve bu, boşluğu uydurmayla
 * doldurmaya itiyordu — `16076..16080` ardışık kodları böyle doğdu. Kod yoksa kimlik ADDAN türer;
 * ad da yoksa kimlik gerçekten üretilemez, satır hata olarak düşer.
 * @param {{ad: string, dizin: string, metin: string}[]} dosyalar
 */
export function satirlariTopla(dosyalar) {
  const errors = []; const kodsuzSatir = []; const rows = []
  for (const { ad, dizin, metin } of dosyalar) {
    for (const r of parseCsv(metin)) {
      if (!r.model_code && !r.name) { errors.push(`${ad}: model_code VE name bos — kimlik uretilemez`); continue }
      if (!r.model_code) kodsuzSatir.push(`${ad}: ${r.name}`)
      rows.push({ ...r, __csv: ad, __dir: dizin })
    }
  }
  return { rows, errors, kodsuzSatir }
}

/**
 * Satırları yazım planına çevirir. Hiçbir ret sessiz değildir: her düşen satır `errors`'a adıyla girer.
 * @param {object} p
 * @param {object[]} p.rows            satirlariTopla().rows
 * @param {{id: string, slug: string, parent_id: string|null}[]} p.kategoriler  canlı categories
 * @param {Record<string, {name_tr?: string, name_en?: string, series_code?: string}>} p.aileHaritasi
 * @param {(sku: string, rel: string) => string|null} p.gorselCoz  görselin mutlak yolu ya da null (dosya yok)
 */
export function planla({ rows, kategoriler, aileHaritasi, gorselCoz }) {
  const errors = []; const warnings = []
  const catBySlug = new Map(kategoriler.map((c) => [c.slug, c]))
  const brandSet = new Map()
  const families = new Map()
  const products = []
  const skuSeen = new Map()

  for (const r of rows) {
    const brand = BRAND_CANON[r.brand] ?? r.brand
    const prefix = BRAND_PREFIX[brand]
    if (!prefix) { errors.push(`${r.__csv}/${r.model_code}: bilinmeyen marka '${r.brand}'`); continue }
    brandSet.set(brand, slugifyTr(brand))

    const catSlug = CATEGORY_ALIAS[r.category_slug] ?? r.category_slug
    const cat = catBySlug.get(catSlug)
    if (!cat || cat.parent_id !== null) { errors.push(`${r.__csv}/${r.model_code}: üst kategori yok/geçersiz '${catSlug}'`); continue }
    let sub = null
    if (r.subcategory_slug) {
      sub = catBySlug.get(r.subcategory_slug)
      if (!sub) { errors.push(`${r.__csv}/${r.model_code}: alt kategori yok '${r.subcategory_slug}'`); continue }
      if (sub.parent_id !== cat.id) { errors.push(`${r.__csv}/${r.model_code}: '${r.subcategory_slug}' kategorisi '${catSlug}' altında değil`); continue }
    }

    // Kimlik TEK KURALDAN gelir: kod varsa koddan, yoksa addan (kimlik-kurali.mjs).
    const kimlik = kimlikTuret({ onek: prefix, ad: r.name, marka: brand, model_code: r.model_code })
    if (!kimlik) { errors.push(`${r.__csv}/${r.name || '(adsiz)'}: kimlik uretilemedi`); continue }
    const sku = kimlik.sku
    if (skuSeen.has(sku)) { errors.push(`${r.__csv}/${r.model_code}: SKU çakışması ${sku} (ilk: ${skuSeen.get(sku)})`); continue }
    skuSeen.set(sku, `${r.__csv}/${r.model_code}`)

    // aile anahtarı: CSV × çift
    let famSlug = r.__csv
    if (COK_CIFTLI_CSV.includes(r.__csv)) {
      const suffix = SUBCAT_SUFFIX[r.subcategory_slug]
      if (!suffix) { errors.push(`${r.__csv}/${r.model_code}: çok-çiftli CSV'de suffix'siz alt kategori '${r.subcategory_slug}'`); continue }
      famSlug = `${r.__csv}-${suffix}`
    }
    const famDef = aileHaritasi[famSlug]
    if (!famDef) { errors.push(`${famSlug}: family-map.yaml'de tanımsız`); continue }
    if (!families.has(famSlug)) {
      families.set(famSlug, {
        slug: famSlug, brand, category_id: cat.id, subcategory_id: sub?.id ?? null,
        name: famDef.name_tr, name_en: famDef.name_en, series_code: famDef.series_code ?? null,
        descCounts: new Map(), rowCount: 0,
      })
    }
    const fam = families.get(famSlug)
    if (fam.category_id !== cat.id || fam.subcategory_id !== (sub?.id ?? null)) {
      errors.push(`${famSlug}: aile içi kategori tutarsızlığı (${r.__csv}/${r.model_code})`); continue
    }
    fam.rowCount++
    const dk = JSON.stringify([r.description_tr, r.description_en])
    fam.descCounts.set(dk, (fam.descCounts.get(dk) ?? 0) + 1)

    const specs = {}
    for (const [k, v] of Object.entries(r)) {
      if (k.startsWith('spec_') && v !== '') specs[k.slice(5)] = specValue(v)
    }

    const price = num(r.purchase_price_eur)
    const imgRel = r.image_url ? r.image_url.replace(/^markalar\//, '') : null
    const imageFile = imgRel ? gorselCoz(sku, imgRel) : null
    if (imgRel && !imageFile) warnings.push(`${sku}: görsel dosyası yok: ${r.image_url}`)

    products.push({
      sku, model_code: kimlik.model_code, name: r.name, brand,
      famSlug, category_id: cat.id, subcategory_id: sub?.id ?? null,
      // kod yoksa kimlik guveni dusuktur -> draft (kimlik.confidence 'not-ok')
      status: r.confidence === 'ok' && kimlik.confidence === 'ok' ? 'active' : 'draft',
      // ⚠Boş fiyat hücresi 0 yazılır. Sessiz DEĞİL: 0 fiyatlı her plan satırı `fiyatsiz`'a SKU'suyla
      // girer ve raporda görünür (REC-193: AVE-20150 canlıda 0,00 kalmıştı, sebebi bu yoldu).
      // Mevcut ürün yeniden yüklemede GÜNCELLENMEZ (load.mjs APPLY) — bu yol yalnız YENİ üründe işler.
      purchase_price: price ?? 0, purchase_currency: r.currency || 'EUR',
      description_i18n: { tr: r.description_tr || null, en: r.description_en || null },
      description: r.description_tr || null,           // geçiş: mevcut vitrin TR metni okur (F5'e dek)
      technical_specs: specs,
      weight_kg: num(r.spec_weight_kg),
      slug: kimlik.slug,
      imageFile,
      price: null, stock_qty: 0,
    })
  }

  // aile açıklaması = en sık (mode) çeviri çifti
  for (const fam of families.values()) {
    const top = [...fam.descCounts.entries()].sort((a, b) => b[1] - a[1])[0]
    const [tr, en] = top ? JSON.parse(top[0]) : [null, null]
    fam.description = { tr, en }
  }

  const fiyatsiz = products.filter((p) => !(p.purchase_price > 0)).map((p) => p.sku)
  return { brandSet, families, products, errors, warnings, fiyatsiz }
}
