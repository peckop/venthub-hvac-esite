#!/usr/bin/env node
/**
 * KTL-50 — VORTICE LINEO QUIET (12 MODEL) CANLI SES DEĞERİ DÜZELTMESİ.
 *
 * İki yeri birlikte düzeltir (aynı sayı): `technical_specs.noise_level_db_a` ve
 * `description_i18n.tr/.en` içindeki ses cümlesi. Kaynak: Şubat/Mayıs 2026 katalog (193047 s.18 AC,
 * s.12 ES), "gövdeden yayılan" (BREAKOUT) Lp, en yüksek hız. Kalem kalem kaynak, eski baskı kanıtı ve
 * beklenen önceki değer `lineo-quiet-ses-manifest.json`'da. Kurallar (saf, testli):
 * `lineo-quiet-ses-fix-kurallar.mjs`.
 *
 * VARSAYILAN = DRY-RUN (hiçbir şey yazmaz). Yazım YALNIZ `--apply` + service_role anahtarı ile
 * ve Recep'in "yaz" sözü sonrası OPS tarafından koşulur (canlı yazım kapısı).
 *
 * ÖN KOŞULLAR (fail-closed — biri düşerse HİÇ yazmaz):
 *   Ö1. Manifest iç tutarlılığı (12 model, yeni = katalog gövde sütunu, önceki = eski baskı gövde sütunu).
 *   Ö2. Her model_code tam 1 aktif ürüne denk gelmeli, sku `VRT-<model_code>`, ad `Vortice Lineo ... Quiet ...`.
 *   Ö3. BAYATLIK: canlı değer manifestteki `onceki` ile (ya da zaten `yeni` ile) aynı olmalı; açıklama
 *       cümlesi tam 1 kez eşleşmeli ve içindeki sayı alanla tutmalı (ölçümden sonra biri değiştirdiyse durur).
 *
 * YAZIM SONRASI DOĞRULAMA (D1): her ürün yeniden okunur; hedef nesneler birebir değilse betik
 * KENDİ YAZDIĞINI GERİ ALIR ve hata koduyla çıkar.
 *
 * Kullanım (anahtar komut satırına yazılmasın diye ortam değişkeni de okunur):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ortam değişkenleri  (ya da --url / --key)
 *   node lineo-quiet-ses-fix.mjs                                         # dry-run
 *   node lineo-quiet-ses-fix.mjs --apply --out <dizin>                   # yazım (envanter ÖNCE yazılır)
 *   node lineo-quiet-ses-fix.mjs --rollback <envanter.json>              # geri alma
 */
import './_ops-onay.mjs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { manifestIhlalleri, hedefHesapla } from './lineo-quiet-ses-fix-kurallar.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const arg = (n, def = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : def }
const has = (n) => process.argv.includes(`--${n}`)
const dbUrl = arg('url', process.env.SUPABASE_URL)
const dbKey = arg('key', process.env.SUPABASE_SERVICE_ROLE_KEY)
const outDir = arg('out', '.')
const APPLY = has('apply')
const ROLLBACK = arg('rollback')
const manifestArg = arg('manifest', 'lineo-quiet-ses-manifest.json')

if (!dbUrl || !dbKey) {
  console.error('kullanim: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY ortam degiskenleri (ya da --url/--key) [--apply --out <dizin>] | --rollback <envanter.json>')
  process.exit(2)
}

const rest = async (p, method = 'GET', body) => {
  const r = await fetch(`${dbUrl}/rest/v1/${p}`, {
    method,
    headers: { apikey: dbKey, authorization: `Bearer ${dbKey}`, 'content-type': 'application/json', prefer: 'return=representation' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const t = await r.text()
  if (!r.ok) { console.error(`DB HATA ${r.status} ${method} ${p}: ${t}`); process.exit(1) }
  return t ? JSON.parse(t) : []
}

const SELECT = 'id,sku,model_code,name,technical_specs,description_i18n'

/* ── GERİ ALMA: envanter her ürünün yazımdan ÖNCEKİ technical_specs ve description_i18n nesnesini tutar. */
if (ROLLBACK) {
  const inv = JSON.parse(fs.readFileSync(ROLLBACK, 'utf8'))
  console.log(`GERI ALMA: ${path.basename(ROLLBACK)} (durum: ${inv.status}, ${inv.items?.length ?? 0} urun)`)
  let restored = 0
  for (const it of inv.items ?? []) {
    const r = await rest(`products?id=eq.${it.id}`, 'PATCH', { technical_specs: it.previous_specs, description_i18n: it.previous_description_i18n })
    restored += r.length
  }
  console.log(`  ${restored} urun eski degerine donduruldu`)
  if (restored !== (inv.items?.length ?? 0)) { console.error(`⚠ EKSIK GERI ALMA: ${restored}/${inv.items?.length} — ELLE INCELE.`); process.exit(1) }
  console.log('GERI ALMA TAMAM. (Sayfa tazelenmesi icin rendering-cache-standard: urun degisikligi tetigi kendiliginden calisir; canli sayfayi olc.)')
  process.exit(0)
}

const manifestPath = path.isAbsolute(manifestArg) ? manifestArg : path.join(__dirname, manifestArg)
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const kodlar = Object.keys(manifest.items ?? {})
console.log(`MANIFEST: ${path.basename(manifestPath)} — ${kodlar.length} model`)

const violations = manifestIhlalleri(manifest) // Ö1

// Ö2 — kaynak satırlar
const rows = await rest(`products?model_code=in.(${kodlar.join(',')})&deleted_at=is.null&select=${SELECT}`)
for (const kod of kodlar) {
  const eslesen = rows.filter(r => r.model_code === kod)
  if (eslesen.length !== 1) { violations.push(`${kod}: DB'de ${eslesen.length} aktif satir (1 olmali)`); continue }
  const r = eslesen[0]
  if (r.sku !== `VRT-${kod}`) violations.push(`${kod}: sku "${r.sku}" != VRT-${kod}`)
  if (!/^Vortice Lineo \d+ Quiet/.test(r.name)) violations.push(`${kod}: ad "${r.name}" 'Vortice Lineo <cap> Quiet ...' ile baslamiyor`)
}

// Ö3 + fark hesabı
const writes = []
for (const kod of kodlar) {
  const row = rows.find(r => r.model_code === kod)
  if (!row) continue
  const h = hedefHesapla(row, manifest.items[kod])
  violations.push(...h.ihlaller)
  console.log(`\n  ${row.sku}  ${row.name}`)
  if (!h.farklar.length) console.log('    (fark yok — hedef = mevcut)')
  for (const f of h.farklar) console.log(`    ${f.kind.padEnd(8)} ${f.alan.padEnd(34)} ${String(f.from).padEnd(8)} -> ${f.to}`)
  if (h.farklar.length) writes.push({ row, ...h })
}

const toplam = writes.reduce((a, w) => a + w.farklar.length, 0)
console.log(`\n== ${APPLY ? 'APPLY' : 'DRY-RUN'} OZET: ${writes.length} urun, ${toplam} alan degisikligi`)
if (violations.length) {
  console.error(`\n⛔ ON KOSUL IHLALI (${violations.length}) — HIC YAZILMADI:`)
  violations.forEach(v => console.error(`   ${v}`))
  process.exit(3)
}
console.log('  on kosullar (O1 manifest · O2 kaynak · O3 bayatlik): TEMIZ')

if (!APPLY) { console.log('\nDRY-RUN — hicbir sey yazilmadi. Yazim icin: --apply + service_role + Recep "yaz" sozu (OPS).'); process.exit(0) }

// ── APPLY: envanter ÖNCE (geri alma yolu garanti altına alınmadan yazım yok)
fs.mkdirSync(outDir, { recursive: true })
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const invPath = path.join(outDir, `lineo-quiet-ses-${stamp}.json`)
const inventory = {
  applied_at: new Date().toISOString(), status: 'STARTED', manifest: path.basename(manifestPath),
  items: writes.map(w => ({ id: w.row.id, sku: w.row.sku, previous_specs: w.row.technical_specs, previous_description_i18n: w.row.description_i18n })),
}
fs.writeFileSync(invPath, JSON.stringify(inventory, null, 2))
console.log(`\nAPPLY — envanter once yazildi: ${invPath}`)

const geriAl = async () => {
  for (const it of inventory.items) await rest(`products?id=eq.${it.id}`, 'PATCH', { technical_specs: it.previous_specs, description_i18n: it.previous_description_i18n })
}

let ok = 0
for (const w of writes) {
  const r = await rest(`products?id=eq.${w.row.id}`, 'PATCH', { technical_specs: w.yeniSpecs, description_i18n: w.yeniAciklama })
  ok += r.length
}
console.log(`YAZIM: ${ok}/${writes.length} urun guncellendi`)

// D1 — yeniden oku, hedefle birebir mi? Değilse KENDİ YAZDIĞINI GERİ AL.
const sonra = await rest(`products?id=in.(${writes.map(w => w.row.id).join(',')})&select=${SELECT}`)
let bozuk = 0
for (const w of writes) {
  const s = sonra.find(x => x.id === w.row.id)
  const specTamam = s && JSON.stringify(sortKeys(s.technical_specs)) === JSON.stringify(sortKeys(w.yeniSpecs))
  const aciklamaTamam = s && JSON.stringify(sortKeys(s.description_i18n)) === JSON.stringify(sortKeys(w.yeniAciklama))
  if (!specTamam || !aciklamaTamam) { bozuk += 1; console.error(`⛔ DOGRULAMA BOZUK: ${w.row.sku}`) }
}
if (bozuk || ok !== writes.length) {
  console.error(`⛔ ${bozuk} urunde dogrulama basarisiz (yazilan ${ok}/${writes.length}) — GERI ALINIYOR`)
  await geriAl()
  inventory.status = 'ROLLED_BACK'
  fs.writeFileSync(invPath, JSON.stringify(inventory, null, 2))
  process.exit(1)
}
inventory.status = 'DONE'; inventory.written = ok
fs.writeFileSync(invPath, JSON.stringify(inventory, null, 2))
console.log(`DOGRULAMA: ${writes.length}/${writes.length} urun hedefle birebir`)
console.log(`\nYAZIM TAMAM. GERI ALMA:\n  node ${path.basename(process.argv[1])} --rollback ${invPath}`)

function sortKeys(o) {
  if (Array.isArray(o)) return o.map(sortKeys)
  if (o && typeof o === 'object') return Object.fromEntries(Object.keys(o).sort().map(k => [k, sortKeys(o[k])]))
  return o
}
