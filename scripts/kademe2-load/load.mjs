// Kademe-2 CSV → DB loader (deterministik; LLM YOK).
// Plan: docs/plans/kademe2-clean-rebuild-2026-08-11.md §F4
// Kullanım:
//   node scripts/kademe2-load/load.mjs                 # DRY-RUN (varsayılan): sadece rapor
//   node scripts/kademe2-load/load.mjs --apply         # DB'ye yazar (service-role, .env'den)
// Girdi: venthub-pdf-ingestor/venthub/markalar/**/03-output/*.csv (BOM'lu, ';' ayraçlı, RFC4180 tırnaklı)
// Kurallar:
//   - aile = CSV × (category/subcategory) çifti; adlar family-map.yaml'den (insan-onaylı, üretilmez)
//   - kategori: CSV 'accessories' → DB 'accessories-components'; çift DB'de doğrulanır
//   - sku = MARKA_ÖNEKİ + '-' + normalize(model_code); status: confidence ok→active, missing→draft
//   - satış fiyatı YAZILMAZ (fiyat motoru ayrı iş); purchase_price EUR as-is
//   - görseller Storage'a `<tenant>/<sku>/main.<ext>` + product_images satırı (+ geçiş için products.image_url)
import { createClient } from '@supabase/supabase-js'

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '../..')
const APPLY = process.argv.includes('--apply')
const CSV_ROOT = resolve(
  process.argv.find((a) => a.startsWith('--csv-root='))?.slice(11) ??
  'C:/Users/alize/venthub-pdf-ingestor/venthub/markalar'
)
const OUT_DIR = join(HERE, 'out')
mkdirSync(OUT_DIR, { recursive: true })

const TENANT_ID = 'd3b07384-d113-495f-a558-8c38634e0000'
const CATEGORY_ALIAS = { accessories: 'accessories-components' }
const BRAND_CANON = { AvenS: 'AVenS' } // harf-varyansı normalize
const BRAND_PREFIX = { AVenS: 'AVE', Danfoss: 'DAN', 'Nicotra Gebhardt': 'NIC', SEAT: 'SEA', Vortice: 'VRT' }
const SUBCAT_SUFFIX = {
  'circular-duct-fans': 'circular', 'rectangular-duct-fans': 'rectangular',
  'roof-fans': 'roof', 'smoke-exhaust-fans': 'smoke', 'axial-industrial-fans': 'axial',
}

// ---------- yardımcılar ----------
function parseCsv(text, delim = ';') {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  const rows = []; let row = []; let field = ''; let q = false
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

function slugifyTr(s) {
  const map = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', Ç: 'c', Ğ: 'g', İ: 'i', I: 'i', Ö: 'o', Ş: 's', Ü: 'u' }
  return s.replace(/[çğıöşüÇĞİIÖŞÜ]/g, (c) => map[c]).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function parseYamlMap(text) {
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

function num(v) {
  if (v === undefined || v === null || v === '') return null
  const n = Number(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function specValue(raw) {
  const s = raw.trim()
  if (/^(true|false)$/i.test(s)) return s.toLowerCase() === 'true'
  const n = num(s)
  if (n !== null && /^[\d.,\s-]+$/.test(s)) return n
  return s
}

// ---------- ana akış ----------
// .env: önce repo kökü, yoksa ana çalışma dizini (worktree'lerde .env gitignore'lu/eksik olabilir)
const ENV_PATH = existsSync(join(REPO, '.env')) ? join(REPO, '.env') : 'C:/Users/alize/venthub-hvac/.env'
const env = Object.fromEntries(
  readFileSync(ENV_PATH, 'utf8').split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const sb = createClient(env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// glob: markalar/**/03-output/*.csv
async function findCsvs(dir) {
  const { readdirSync, statSync } = await import('node:fs')
  const out = []
  const walk = (d) => {
    for (const e of readdirSync(d)) {
      const p = join(d, e)
      if (statSync(p).isDirectory()) walk(p)
      else if (e.endsWith('.csv') && d.replace(/\\/g, '/').endsWith('/03-output')) out.push(p)
    }
  }
  walk(dir)
  return out.sort()
}

const errors = []; const warnings = []
const familyMap = parseYamlMap(readFileSync(join(HERE, 'family-map.yaml'), 'utf8'))

// 1) DB kategori sözlüğü
const { data: cats, error: catErr } = await sb.from('categories').select('id, slug, parent_id')
if (catErr) throw new Error('categories okunamadı: ' + catErr.message)
const catBySlug = new Map(cats.map((c) => [c.slug, c]))

// 2) CSV'leri oku ve satırları modele çevir
const csvFiles = await findCsvs(CSV_ROOT)
const rows = []
for (const f of csvFiles) {
  const base = basename(f, '.csv')
  for (const r of parseCsv(readFileSync(f, 'utf8'))) {
    if (!r.model_code) { errors.push(`${base}: model_code boş satır`); continue }
    rows.push({ ...r, __csv: base, __dir: dirname(f) })
  }
}

// 3) doğrulama + dönüşüm
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

  const sku = `${prefix}-${r.model_code.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
  if (skuSeen.has(sku)) { errors.push(`${r.__csv}/${r.model_code}: SKU çakışması ${sku} (ilk: ${skuSeen.get(sku)})`); continue }
  skuSeen.set(sku, `${r.__csv}/${r.model_code}`)

  // aile anahtarı: CSV × çift
  const multi = ['vortice-vort-commercial-in-line', 'vortice-vort-heatmaster-slimroof', 'vortice-vort-industrial-ventilation', 'vortice-radon-range']
  let famSlug = r.__csv
  if (multi.includes(r.__csv)) {
    const suffix = SUBCAT_SUFFIX[r.subcategory_slug]
    if (!suffix) { errors.push(`${r.__csv}/${r.model_code}: çok-çiftli CSV'de suffix'siz alt kategori '${r.subcategory_slug}'`); continue }
    famSlug = `${r.__csv}-${suffix}`
  }
  const famDef = familyMap[famSlug]
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

  // spec'ler
  const specs = {}
  for (const [k, v] of Object.entries(r)) {
    if (k.startsWith('spec_') && v !== '') specs[k.slice(5)] = specValue(v)
  }

  const price = num(r.purchase_price_eur)
  const imgRel = r.image_url ? r.image_url.replace(/^markalar\//, '') : null
  const imgAbs = imgRel ? join(CSV_ROOT, imgRel) : null
  if (imgAbs && !existsSync(imgAbs)) warnings.push(`${sku}: görsel dosyası yok: ${r.image_url}`)

  products.push({
    sku, model_code: r.model_code, name: r.name, brand,
    famSlug, category_id: cat.id, subcategory_id: sub?.id ?? null,
    status: r.confidence === 'ok' ? 'active' : 'draft',
    purchase_price: price ?? 0, purchase_currency: r.currency || 'EUR',
    description_i18n: { tr: r.description_tr || null, en: r.description_en || null },
    description: r.description_tr || null,           // geçiş: mevcut vitrin TR metni okur (F5'e dek)
    technical_specs: specs,
    weight_kg: num(r.spec_weight_kg),
    slug: `${slugifyTr(r.name)}-${slugifyTr(r.model_code)}`.slice(0, 120),
    imageFile: imgAbs && existsSync(imgAbs) ? imgAbs : null,
    price: null, stock_qty: 0,
  })
}

// aile açıklaması = en sık (mode) çeviri çifti
for (const fam of families.values()) {
  const top = [...fam.descCounts.entries()].sort((a, b) => b[1] - a[1])[0]
  const [tr, en] = top ? JSON.parse(top[0]) : [null, null]
  fam.description = { tr, en }
}

// 4) rapor
const report = {
  generated_at: new Date().toISOString(), mode: APPLY ? 'apply' : 'dry-run',
  csv_files: csvFiles.length, rows_read: rows.length,
  products_planned: products.length, families_planned: families.size, brands_planned: brandSet.size,
  by_status: { active: products.filter((p) => p.status === 'active').length, draft: products.filter((p) => p.status === 'draft').length },
  with_purchase_price: products.filter((p) => p.purchase_price > 0).length,
  with_image: products.filter((p) => p.imageFile).length,
  families: [...families.values()].map((f) => ({ slug: f.slug, rows: f.rowCount, brand: f.brand })),
  errors, warnings,
}
writeFileSync(join(OUT_DIR, `report-${APPLY ? 'apply' : 'dry'}.json`), JSON.stringify(report, null, 2))
console.log(`CSV: ${report.csv_files} dosya, ${report.rows_read} satır → plan: ${report.brands_planned} marka, ${report.families_planned} aile, ${report.products_planned} ürün (active=${report.by_status.active} draft=${report.by_status.draft}, fiyatlı=${report.with_purchase_price}, görselli=${report.with_image})`)
if (errors.length) { console.error(`❌ ${errors.length} hata — rapor: out/report-*.json`); errors.slice(0, 10).forEach((e) => console.error('  -', e)) }
if (warnings.length) console.warn(`⚠️ ${warnings.length} uyarı (rapora yazıldı)`)
if (!APPLY) { console.log('DRY-RUN bitti; DB\'ye yazılmadı.'); process.exit(errors.length ? 1 : 0) }
if (errors.length) { console.error('APPLY iptal: hatalar sıfırlanmadan yazım yok.'); process.exit(1) }

// ---------- APPLY ----------
async function must(q, label) {
  const { data, error } = await q
  if (error) throw new Error(`${label}: ${error.message}`)
  return data
}

// markalar
const brandIds = new Map()
for (const [name, slug] of brandSet) {
  const existing = await must(sb.from('brands').select('id').eq('slug', slug).maybeSingle(), 'brand select')
  if (existing) { brandIds.set(name, existing.id); continue }
  const ins = await must(sb.from('brands').insert({ name, slug, tenant_id: TENANT_ID }).select('id').single(), 'brand insert')
  brandIds.set(name, ins.id)
}

// aileler
const famIds = new Map()
for (const fam of families.values()) {
  const existing = await must(sb.from('product_families').select('id').eq('slug', fam.slug).maybeSingle(), 'family select')
  if (existing) { famIds.set(fam.slug, existing.id); continue }
  const ins = await must(sb.from('product_families').insert({
    tenant_id: TENANT_ID, name: fam.name, slug: fam.slug, brand_id: brandIds.get(fam.brand),
    description: fam.description, category_id: fam.category_id, subcategory_id: fam.subcategory_id,
    series_code: fam.series_code,
  }).select('id').single(), 'family insert')
  famIds.set(fam.slug, ins.id)
}

// ürünler + görseller
let inserted = 0
for (const p of products) {
  const { imageFile, famSlug, ...cols } = p
  const row = { ...cols, tenant_id: TENANT_ID, family_id: famIds.get(famSlug) }
  const existing = await must(sb.from('products').select('id').eq('sku', p.sku).maybeSingle(), 'product select')
  let pid
  if (existing) { pid = existing.id }
  else {
    const ins = await must(sb.from('products').insert(row).select('id').single(), `product insert ${p.sku}`)
    pid = ins.id; inserted++
  }
  if (imageFile) {
    const ext = imageFile.split('.').pop().toLowerCase()
    const path = `${TENANT_ID}/${p.sku}/main.${ext}`
    const bytes = readFileSync(imageFile)
    const { error: upErr } = await sb.storage.from('product-images').upload(path, bytes, {
      contentType: ext === 'png' ? 'image/png' : 'image/jpeg', upsert: true,
    })
    if (upErr) { warnings.push(`${p.sku}: görsel upload hatası: ${upErr.message}`); continue }
    const { data: pub } = sb.storage.from('product-images').getPublicUrl(path)
    const imgExisting = await must(sb.from('product_images').select('id').eq('product_id', pid).eq('path', path).maybeSingle(), 'image select')
    if (!imgExisting) await must(sb.from('product_images').insert({ product_id: pid, path, alt: p.name, sort_order: 0 }), 'image insert')
    await must(sb.from('products').update({ image_url: pub.publicUrl }).eq('id', pid), 'image_url update')
  }
}

// yükleme-sonrası doğrulama

console.log(`APPLY bitti: ${inserted} yeni ürün. Rapor: out/report-apply.json`)
writeFileSync(join(OUT_DIR, 'report-apply.json'), JSON.stringify({ ...report, inserted, warnings }, null, 2))
