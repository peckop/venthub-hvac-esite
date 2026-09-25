#!/usr/bin/env node
/**
 * ÜRÜN DURUMUNU CANLIYA YAZAR — REC-397, karar 130 (satıştan çekme; pasif, geri açılabilir).
 *
 * Kurallar ve RED koşulları saf çekirdekte: `urun-durum.mjs`. Yalnız `products.status` yazılır.
 * İKİ ANAHTAR: `--yaz` VE `CANLI_YAZIM_ONAYI`; `--yaz` ile `--yedek <json>` ZORUNLU. RED varsa HİÇ yazım yok.
 * Yedek dosyası TERS PLANDIR: `--plan <yedek>` ile aynı betik koşulunca her şey eski hâline döner.
 *
 * KOŞUM: node scripts/icerik-hatti/urun-durum-yaz.mjs --plan <json> [--yaz --yedek <json>]
 * Çıkış: 0 geçti · 1 red/yazım hatası · 2 ölçülemedi (fail-closed).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { durumPlani, tersPlan } from './urun-durum.mjs'

const arg = (ad) => { const i = process.argv.indexOf(ad); return i > 0 ? process.argv[i + 1] : undefined }
const YAZ = process.argv.includes('--yaz')
const YEDEK = arg('--yedek')
const PLAN = arg('--plan')
if (!PLAN) { console.error('⛔ --plan <json> zorunlu'); process.exit(2) }
const plan = JSON.parse(readFileSync(PLAN, 'utf8'))

const env = Object.fromEntries(
  readFileSync(process.env.VENTHUB_ENV || join(homedir(), 'venthub-hvac', '.env'), 'utf8')
    .split(/\r?\n/).filter(s => s && !s.startsWith('#') && s.includes('='))
    .map(s => { const i = s.indexOf('='); return [s.slice(0, i).trim(), s.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const U = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const K = env.SUPABASE_SERVICE_ROLE_KEY
if (!U || !K) { console.error('⛔ SUPABASE_URL / SERVICE_ROLE_KEY yok'); process.exit(2) }
const H = { apikey: K, authorization: `Bearer ${K}`, 'content-type': 'application/json' }

/** Yalnız plandaki SKU'lar okunur; dönen sayı plandakinden azsa eksik olanlar çekirdekte RED olur. */
async function urunler() {
  const liste = Object.keys(plan.skus || {}).map(s => `"${s}"`).join(',')
  const r = await fetch(`${U}/rest/v1/products?select=id,sku,status&sku=in.(${encodeURIComponent(liste)})&order=sku`, { headers: H })
  const b = await r.json()
  if (!r.ok || !Array.isArray(b)) { console.error(`⛔ products okunamadı: HTTP ${r.status}`); process.exit(2) }
  return b
}

const { yazilacak, ayni, red } = durumPlani(await urunler(), plan)
console.log(`PLAN (${plan.karar || 'karar yok'}): yazılacak ${yazilacak.length} · zaten istenen durumda ${ayni.length} · RED ${red.length}`)
for (const y of yazilacak) console.log(`  ${y.sku.padEnd(12)} ${y.onceki} → ${y.yeni}`)
for (const r of red) console.log(`  ⛔ ${r.sku}: ${r.sebep}`)

if (red.length) { console.error('\n⛔ RED var — hiçbir şey yazılmadı (kısmi yazım yok)'); process.exit(1) }
if (!YAZ) { console.log('\nKURU KOŞUM — hiçbir şey yazılmadı. Canlıya yazım: --yaz --yedek <json> + CANLI_YAZIM_ONAYI'); process.exit(0) }
if (!process.env.CANLI_YAZIM_ONAYI) { console.error('⛔ CANLI_YAZIM_ONAYI yok — Recep\'in KENDİ sözü; akran aktarımı onay değildir'); process.exit(1) }
if (!YEDEK) { console.error('⛔ --yedek <json> zorunlu'); process.exit(1) }

writeFileSync(YEDEK, JSON.stringify({ damga: new Date().toISOString(), onay: process.env.CANLI_YAZIM_ONAYI,
  ...tersPlan(plan, yazilacak) }, null, 2) + '\n', 'utf8')
console.log(`\nYEDEK (ters plan): ${YEDEK} (${yazilacak.length} satır) — geri almak için --plan olarak ver`)

for (const y of yazilacak) {
  const r = await fetch(`${U}/rest/v1/products?id=eq.${y.id}&status=eq.${y.onceki}`, { method: 'PATCH', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify({ status: y.yeni }) })
  const b = r.ok ? await r.json() : null
  if (!r.ok || !Array.isArray(b) || b.length !== 1) { console.error(`⛔ ${y.sku} YAZILAMADI (HTTP ${r.status}, satır ${b?.length ?? '?'}) — yedekten geri dön`); process.exit(1) }
}

const sonra = new Map((await urunler()).map(u => [u.sku, u.status]))
const bozuk = yazilacak.filter(y => sonra.get(y.sku) !== y.yeni)
console.log(`GERİ OKUMA: ${yazilacak.length - bozuk.length}/${yazilacak.length} birebir`)
if (bozuk.length) { console.error(`⛔ geri okuma farklı: ${bozuk.map(b => b.sku).join(', ')}`); process.exit(1) }
