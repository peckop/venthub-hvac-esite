#!/usr/bin/env node
/**
 * SEAT / STORM / JET (SEA-*) NET AĞIRLIK DÜZELTMESİ (karar 384, OPS-173, KTL-55).
 * Radon / Air Door düzeltme betiklerinin aynı düzeni; kurallar ORTAK: `radon-ca-rm-fix-kurallar.mjs`.
 *
 * Karar 384: sitede ağırlık NET üretici ağırlığıdır (SEAT broşürü Kasım 2024, "Weight (kg)" sütunu).
 * `technical_specs.weight_kg` VE `products.weight_kg` kolonu aynı değere çekilir (kolon aynası).
 * Kalem kalem kaynak (belge + sayfa) ve beklenen önceki değerler `seat-net-agirlik-manifest.json`'da.
 * AVenS sevk/brüt ağırlığı ayrı alanda SAKLANMAZ (ayrı karar); envanter dosyası eski değerleri tutar.
 *
 * VARSAYILAN = DRY-RUN (hiçbir şey yazmaz). Yazım YALNIZ `--apply` + service_role anahtarı ile
 * ve Recep'in "yaz" sözü sonrası OPS tarafından koşulur (canlı yazım kapısı).
 *
 * ÖN KOŞULLAR (fail-closed — biri düşerse HİÇ yazmaz):
 *   Ö1. Manifest iç tutarlılığı (sayı/birim/aralık, kolon aynası, anahtar `SEA-<8 hane>`).
 *   Ö2. Her sku tam 1 aktif ürüne denk gelmeli ve ad SEAT/STORM/JET ile başlamalı; hariç tutulanlar
 *       (STORM 18: 61183000, 61183003) manifestte OLMAMALI.
 *   Ö3. BAYATLIK: canlı değer manifestteki `onceki` / `kolon_onceki` ile aynı olmalı.
 *
 * YAZIM SONRASI DOĞRULAMA (D1): her ürün yeniden okunur; hedef nesne ve kolon birebir değilse betik
 * KENDİ YAZDIĞINI GERİ ALIR, geri almayı da okuyup denetler ve hata koduyla çıkar.
 *
 * Kullanım:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ortam değişkenleri  (ya da --url / --key)
 *   node seat-net-agirlik-fix.mjs                                    # dry-run
 *   node seat-net-agirlik-fix.mjs --apply --out <dizin>              # yazım (envanter ÖNCE yazılır)
 *   node seat-net-agirlik-fix.mjs --rollback <envanter.json>         # geri alma
 */
import './_ops-onay.mjs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { manifestIhlalleri, hedefHesapla } from './radon-ca-rm-fix-kurallar.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const arg = (n, def = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : def }
const has = (n) => process.argv.includes(`--${n}`)
const dbUrl = arg('url', process.env.SUPABASE_URL)
const dbKey = arg('key', process.env.SUPABASE_SERVICE_ROLE_KEY)
const outDir = arg('out', '.')
const APPLY = has('apply')
const ROLLBACK = arg('rollback')
const manifestArg = arg('manifest', 'seat-net-agirlik-manifest.json')

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

const SELECT = 'id,sku,model_code,name,weight_kg,technical_specs'

/* ── GERİ ALMA: envanter her ürünün yazımdan ÖNCEKİ technical_specs nesnesini ve weight_kg kolonunu tutar. */
if (ROLLBACK) {
  const inv = JSON.parse(fs.readFileSync(ROLLBACK, 'utf8'))
  console.log(`GERI ALMA: ${path.basename(ROLLBACK)} (durum: ${inv.status}, ${inv.items?.length ?? 0} urun)`)
  let restored = 0
  for (const it of inv.items ?? []) {
    const r = await rest(`products?id=eq.${it.id}`, 'PATCH', { technical_specs: it.previous_specs, weight_kg: it.previous_weight_kg })
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
console.log(`MANIFEST: ${path.basename(manifestPath)} — ${kodlar.length} urun`)

const violations = manifestIhlalleri(manifest, {
  kodDeseni: /^SEA-\d{8}$/,
  kodAciklama: 'anahtar SEA-<8 haneli referans no> sku olmali',
  aralik: { weight_kg: [0.1, 300] }, // SEAT 50 yaklasik 138 kg
}) // Ö1
// Ö1b — alan izin listesi (kodda): yalniz agirlik yazilabilir; guc, devir, ses, gerilim ASLA.
const IZINLI_ALANLAR = new Set(['weight_kg'])
for (const [kod, it] of Object.entries(manifest.items ?? {})) {
  for (const k of Object.keys(it.yeni ?? {})) if (!IZINLI_ALANLAR.has(k)) violations.push(`${kod}: ${k} izin listesinde degil (yalniz ${[...IZINLI_ALANLAR].join(', ')})`)
  if ((it.kaldir ?? []).length) violations.push(`${kod}: bu betik alan KALDIRMAZ`)
}
// Ö1c — hariç tutulanlar (STORM 18: broşür kendi içinde şüpheli, üretici sorusu) manifestte olamaz.
const HARIC_SKU = ['SEA-61183000', 'SEA-61183003']
for (const h of HARIC_SKU) if (kodlar.includes(h)) violations.push(`${h}: hariç tutulan urun manifestte (STORM 18, uretici sorusu)`)

// Ö2 — kaynak satırlar
const rows = []
for (let i = 0; i < kodlar.length; i += 40) {
  const dilim = kodlar.slice(i, i + 40)
  rows.push(...await rest(`products?sku=in.(${dilim.join(',')})&deleted_at=is.null&select=${SELECT}`))
}
for (const kod of kodlar) {
  const eslesen = rows.filter(r => r.sku === kod)
  if (eslesen.length !== 1) { violations.push(`${kod}: DB'de ${eslesen.length} aktif satir (1 olmali)`); continue }
  const r = eslesen[0]
  if (!/^(SEAT|STORM|JET) \d/.test(r.name)) violations.push(`${kod}: ad "${r.name}" 'SEAT/STORM/JET <boyut>' ile baslamiyor`)
}

// Ö3 + fark hesabı
const writes = []
for (const kod of kodlar) {
  const row = rows.find(r => r.sku === kod)
  if (!row) continue
  const h = hedefHesapla(row, manifest.items[kod])
  violations.push(...h.ihlaller)
  console.log(`\n  ${row.sku}  ${row.name}`)
  if (!h.farklar.length) console.log('    (fark yok — hedef = mevcut)')
  for (const f of h.farklar) console.log(`    ${f.kind.padEnd(10)} ${f.alan.padEnd(24)} ${String(f.from).padEnd(12)} -> ${f.to}`)
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
const invPath = path.join(outDir, `seat-net-agirlik-${stamp}.json`)
const inventory = {
  applied_at: new Date().toISOString(), status: 'STARTED', manifest: path.basename(manifestPath),
  items: writes.map(w => ({ id: w.row.id, sku: w.row.sku, previous_specs: w.row.technical_specs, previous_weight_kg: w.row.weight_kg === null ? null : Number(w.row.weight_kg) })),
}
fs.writeFileSync(invPath, JSON.stringify(inventory, null, 2))
console.log(`\nAPPLY — envanter once yazildi: ${invPath}`)

const geriAl = async () => {
  for (const it of inventory.items) await rest(`products?id=eq.${it.id}`, 'PATCH', { technical_specs: it.previous_specs, weight_kg: it.previous_weight_kg })
}

let ok = 0
for (const w of writes) {
  const body = { technical_specs: w.yeniSpecs, ...w.yeniKolon }
  const r = await rest(`products?id=eq.${w.row.id}`, 'PATCH', body)
  ok += r.length
}
console.log(`YAZIM: ${ok}/${writes.length} urun guncellendi`)

// D1 — yeniden oku, hedefle birebir mi? Değilse KENDİ YAZDIĞINI GERİ AL.
const sonra = []
for (let i = 0; i < writes.length; i += 40) {
  const ids = writes.slice(i, i + 40).map(w => w.row.id)
  sonra.push(...await rest(`products?id=in.(${ids.join(',')})&select=${SELECT}`))
}
let bozuk = 0
for (const w of writes) {
  const s = sonra.find(x => x.id === w.row.id)
  const specTamam = s && JSON.stringify(sortKeys(s.technical_specs)) === JSON.stringify(sortKeys(w.yeniSpecs))
  const kolonTamam = s && (w.yeniKolon.weight_kg === undefined || Number(s.weight_kg) === w.yeniKolon.weight_kg)
  if (!specTamam || !kolonTamam) { bozuk += 1; console.error(`⛔ DOGRULAMA BOZUK: ${w.row.sku}`) }
}
if (bozuk || ok !== writes.length) {
  console.error(`⛔ ${bozuk} urunde dogrulama basarisiz (yazilan ${ok}/${writes.length}) — GERI ALINIYOR`)
  await geriAl()
  // geri alma sonucu da okunup denetlenir (statu yalniz tutarsa ROLLED_BACK)
  const geri = []
  for (let i = 0; i < inventory.items.length; i += 40) {
    const ids = inventory.items.slice(i, i + 40).map(x => x.id)
    geri.push(...await rest(`products?id=in.(${ids.join(',')})&select=id,technical_specs,weight_kg`))
  }
  const geriTamam = inventory.items.every(i => {
    const s = geri.find(x => x.id === i.id)
    return s && JSON.stringify(sortKeys(s.technical_specs)) === JSON.stringify(sortKeys(i.previous_specs))
      && Number(s.weight_kg) === i.previous_weight_kg
  })
  inventory.status = geriTamam ? 'ROLLED_BACK' : 'ROLLBACK_INCOMPLETE'
  if (!geriTamam) console.error('⛔ GERI ALMA DOGRULANAMADI — ELLE INCELE (envanter dosyasi: status ROLLBACK_INCOMPLETE)')
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
