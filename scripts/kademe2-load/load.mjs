// Kademe-2 CSV → DB loader (deterministik; LLM YOK).
// Plan: docs/plans/kademe2-clean-rebuild-2026-08-11.md §F4
// Kullanım:
//   node scripts/kademe2-load/load.mjs                 # DRY-RUN (varsayılan): sadece rapor
//   node scripts/kademe2-load/load.mjs --apply         # DB'ye yazar (service-role, .env'den)
// Girdi: venthub-pdf-ingestor/venthub/markalar/**/03-output/*.csv (BOM'lu, ';' ayraçlı, RFC4180 tırnaklı)
// Kurallar (planla.mjs'de, sınavı __tests__/planla.test.ts — REC-209):
//   - aile = CSV × (category/subcategory) çifti; adlar family-map.yaml'den (insan-onaylı, üretilmez)
//   - kategori: CSV 'accessories' → DB 'accessories-components'; çift DB'de doğrulanır
//   - sku = MARKA_ÖNEKİ + '-' + normalize(model_code); status: confidence ok→active, missing→draft
//   - satış fiyatı YAZILMAZ (fiyat motoru ayrı iş); purchase_price EUR as-is; boş hücre 0 + raporda `fiyatsiz`
//   - MEVCUT ÜRÜN GÜNCELLENMEZ: yeniden yükleme yalnız yeni SKU ekler (+ görsel/image_url)
//   - görseller Storage'a `<tenant>/<sku>/main.<ext>` + product_images satırı (+ geçiş için products.image_url)
import { createClient } from '@supabase/supabase-js'

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// ⭐Planlama kuralları TEK KAYNAKTA: planla.mjs (saf, sınanır). Kimlik kuralı onun içinden
// kimlik-kurali.mjs'e bağlanır (REC-275, "iki yerde iki kural yasak").
import { parseYamlMap, planla, satirlariTopla } from './planla.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '../..')
const APPLY = process.argv.includes('--apply')
// CSV deposu bu repoda DEĞİL, kardeş bir depoda (`venthub-pdf-ingestor`). Sıra:
// --csv-root= → VENTHUB_CSV_ROOT → ev dizini kardeşi.
// Kullanıcı ev dizinini SABİT yazan yol KALDIRILDI (REC-102): repo 2026-08-15'ten beri PUBLIC ve o yol
// kullanıcı adını yayıyordu; ayrıca kod sessizce tek makineye bağlıydı. `homedir()` bu
// makinede AYNI yolu veriyor (ölçüldü, `resolve()` sonrası birebir eşit) ve adı koddan çıkarıyor.
const CSV_ROOT = resolve(
  process.argv.find((a) => a.startsWith('--csv-root='))?.slice(11) ??
  process.env.VENTHUB_CSV_ROOT ??
  join(homedir(), 'venthub-pdf-ingestor', 'venthub', 'markalar')
)
const OUT_DIR = join(HERE, 'out')
mkdirSync(OUT_DIR, { recursive: true })

const TENANT_ID = 'd3b07384-d113-495f-a558-8c38634e0000'

// ---------- ana akış ----------
// .env: önce repo kökü, yoksa ana çalışma dizini (worktree'lerde .env gitignore'lu/eksik olabilir).
// Sıra: VENTHUB_ENV_PATH → repo kökü → ev dizinindeki ana çalışma ağacı.
// Sabit kullanıcı yolu KALDIRILDI (REC-102); `homedir()` aynı dosyayı çözüyor (ölçüldü).
const ENV_PATH =
  process.env.VENTHUB_ENV_PATH ??
  (existsSync(join(REPO, '.env')) ? join(REPO, '.env') : join(homedir(), 'venthub-hvac', '.env'))
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

// 1) DB kategori sözlüğü
const { data: cats, error: catErr } = await sb.from('categories').select('id, slug, parent_id')
if (catErr) throw new Error('categories okunamadı: ' + catErr.message)

// 2) CSV'leri oku → satırlar (kodsuz satır SESSİZ DÜŞMEZ, REC-275)
const csvFiles = await findCsvs(CSV_ROOT)
const toplanan = satirlariTopla(csvFiles.map((f) => ({ ad: basename(f, '.csv'), dizin: dirname(f), metin: readFileSync(f, 'utf8') })))
const { rows, kodsuzSatir } = toplanan

// 3) doğrulama + dönüşüm (saf; planla.mjs)
const plan = planla({
  rows,
  kategoriler: cats,
  aileHaritasi: parseYamlMap(readFileSync(join(HERE, 'family-map.yaml'), 'utf8')),
  gorselCoz: (_sku, rel) => { const abs = join(CSV_ROOT, rel); return existsSync(abs) ? abs : null },
})
const { brandSet, families, products, fiyatsiz } = plan
const errors = [...toplanan.errors, ...plan.errors]
const warnings = plan.warnings

// 4) rapor
const report = {
  generated_at: new Date().toISOString(), mode: APPLY ? 'apply' : 'dry-run',
  csv_files: csvFiles.length, rows_read: rows.length,
  products_planned: products.length, families_planned: families.size, brands_planned: brandSet.size,
  by_status: { active: products.filter((p) => p.status === 'active').length, draft: products.filter((p) => p.status === 'draft').length },
  with_purchase_price: products.filter((p) => p.purchase_price > 0).length,
  // Fiyatı boş/0 plan satırları SKU'suyla (REC-193): yeni ürün 0 fiyatla girerse adı burada görünür.
  fiyatsiz: fiyatsiz.length, fiyatsiz_sku: fiyatsiz,
  with_image: products.filter((p) => p.imageFile).length,
  families: [...families.values()].map((f) => ({ slug: f.slug, rows: f.rowCount, brand: f.brand })),
  // Kodsuz satirlar: DUSMEDILER, kimlikleri addan turedi ve draft olarak girdiler.
  // Sayiyi raporda tutuyoruz cunku "sessizce dusme" bu hattin en pahali kusuruydu.
  kodsuz_satir: kodsuzSatir.length, kodsuz_ornek: kodsuzSatir.slice(0, 20),
  errors, warnings,
}
writeFileSync(join(OUT_DIR, `report-${APPLY ? 'apply' : 'dry'}.json`), JSON.stringify(report, null, 2))
if (kodsuzSatir.length) {
  console.log(`
⚠KODSUZ SATIR: ${kodsuzSatir.length} — kaynakta model_code YOK, kimlik ADDAN turetildi, status=draft`)
  for (const k of kodsuzSatir.slice(0, 20)) console.log(`   ${k}`)
  if (kodsuzSatir.length > 20) console.log(`   ... +${kodsuzSatir.length - 20} satir (raporda tam liste)`)
}
console.log(`CSV: ${report.csv_files} dosya, ${report.rows_read} satır → plan: ${report.brands_planned} marka, ${report.families_planned} aile, ${report.products_planned} ürün (active=${report.by_status.active} draft=${report.by_status.draft}, fiyatlı=${report.with_purchase_price}, görselli=${report.with_image})`)
if (fiyatsiz.length) console.warn(`⚠FIYATSIZ: ${fiyatsiz.length} plan satırı 0 fiyatla girer: ${fiyatsiz.slice(0, 10).join(', ')}${fiyatsiz.length > 10 ? ' …' : ''}`)
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
