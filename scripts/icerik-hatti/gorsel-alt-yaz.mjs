#!/usr/bin/env node
/**
 * GÖRSEL ALT METNİNİ CANLIYA YAZAR — REC-146, Recep sözü 2026-09-25 ("düzeltmen gerekenleri düzelt").
 *
 * Kurallar ve RED koşulları saf çekirdekte: `gorsel-alt.mjs`. Yalnız `product_images.alt` yazılır.
 * İKİ ANAHTAR: `--yaz` VE `CANLI_YAZIM_ONAYI`; `--yaz` ile `--yedek <json>` ZORUNLU. RED varsa HİÇ yazım yok.
 * `--liste <csv>`: gözden geçirme için id;sku;eski;yeni (yazmaz).
 *
 * KOŞUM: node scripts/icerik-hatti/gorsel-alt-yaz.mjs [--liste <csv>] [--yaz --yedek <json>]
 * Çıkış: 0 geçti · 1 red/yazım hatası · 2 ölçülemedi (fail-closed).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { altPlani } from './gorsel-alt.mjs'

const arg = (ad) => { const i = process.argv.indexOf(ad); return i > 0 ? process.argv[i + 1] : undefined }
const YAZ = process.argv.includes('--yaz')
const YEDEK = arg('--yedek')
const LISTE = arg('--liste')

const env = Object.fromEntries(
  readFileSync(process.env.VENTHUB_ENV || join(homedir(), 'venthub-hvac', '.env'), 'utf8')
    .split(/\r?\n/).filter(s => s && !s.startsWith('#') && s.includes('='))
    .map(s => { const i = s.indexOf('='); return [s.slice(0, i).trim(), s.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const U = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const K = env.SUPABASE_SERVICE_ROLE_KEY
if (!U || !K) { console.error('⛔ SUPABASE_URL / SERVICE_ROLE_KEY yok'); process.exit(2) }
const H = { apikey: K, authorization: `Bearer ${K}`, 'content-type': 'application/json' }

/** Tablonun TAMAMI; sunucunun kesin sayısıyla karşılaştırılır (1000 satır tavanı, _veri.mjs dersi). */
async function hepsi(tablo, alanlar) {
  const say = await fetch(`${U}/rest/v1/${tablo}?select=id`, { headers: { ...H, Prefer: 'count=exact', Range: '0-0' } })
  const kesin = Number((say.headers.get('content-range') || '').split('/')[1])
  let out = []
  for (let o = 0; o < 100000; o += 1000) {
    const r = await fetch(`${U}/rest/v1/${tablo}?select=${alanlar}&order=id&limit=1000&offset=${o}`, { headers: H })
    const b = await r.json()
    if (!r.ok || !Array.isArray(b)) { console.error(`⛔ ${tablo} okunamadı: HTTP ${r.status}`); process.exit(2) }
    out = out.concat(b); if (b.length < 1000) break
  }
  if (!Number.isInteger(kesin) || out.length !== kesin) { console.error(`⛔ EKSİK VERİ ${tablo}: çekilen ${out.length}, sunucu ${kesin}`); process.exit(2) }
  return out
}

const gorseller = await hepsi('product_images', 'id,product_id,alt,sort_order')
const urunler = await hepsi('products', 'id,sku,name,model_code')
const { yazilacak, kodGerekir, red, dokunulmaz } = altPlani(gorseller, urunler)
console.log(`PLAN: görsel ${gorseller.length} · yazılacak ${yazilacak.length} · dilden bağımsız (dokunulmaz) ${dokunulmaz} · ad Türkçe → sayfa kodu gerekir (yazılmaz) ${kodGerekir.length} · RED ${red.length}`)
if (kodGerekir.length) console.log(`  sayfa kodu gerekenler: ${[...new Set(kodGerekir.map(k => k.sku))].join(', ')}`)
for (const y of yazilacak.slice(0, 8)) console.log(`  ${y.sku.padEnd(16)} ${y.eski}  →  ${y.yeni}`)
for (const r of red) console.log(`  ⛔ ${r.sku || r.id}: ${r.alt} (${r.sebep})`)

if (LISTE) {
  const h = (v) => /[;"]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
  writeFileSync(LISTE, '﻿' + ['id;sku;eski_alt;yeni_alt', ...yazilacak.map(y => [y.id, y.sku, y.eski, y.yeni].map(h).join(';'))].join('\r\n') + '\r\n', 'utf8')
  console.log(`LİSTE: ${LISTE} (${yazilacak.length} satır)`)
}
if (red.length) { console.error('\n⛔ RED var — hiçbir şey yazılmadı (kısmi yazım yok)'); process.exit(1) }
if (!YAZ) { console.log('\nKURU KOŞUM — hiçbir şey yazılmadı. Canlıya yazım: --yaz --yedek <json> + CANLI_YAZIM_ONAYI'); process.exit(0) }
if (!process.env.CANLI_YAZIM_ONAYI) { console.error('⛔ CANLI_YAZIM_ONAYI yok — Recep\'in KENDİ sözü; akran aktarımı onay değildir'); process.exit(1) }
if (!YEDEK) { console.error('⛔ --yedek <json> zorunlu'); process.exit(1) }

writeFileSync(YEDEK, JSON.stringify({ damga: new Date().toISOString(), onay: process.env.CANLI_YAZIM_ONAYI,
  satirlar: yazilacak.map(y => ({ id: y.id, sku: y.sku, alt: y.eski })) }, null, 2) + '\n', 'utf8')
console.log(`\nYEDEK: ${YEDEK} (${yazilacak.length} satır)`)

for (const y of yazilacak) {
  const r = await fetch(`${U}/rest/v1/product_images?id=eq.${y.id}`, { method: 'PATCH', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify({ alt: y.yeni }) })
  const b = r.ok ? await r.json() : null
  if (!r.ok || !Array.isArray(b) || b.length !== 1) { console.error(`⛔ ${y.sku} ${y.id} YAZILAMADI (HTTP ${r.status}) — yedekten geri dön`); process.exit(1) }
}

const sonra = new Map((await hepsi('product_images', 'id,alt')).map(g => [g.id, g.alt]))
const bozuk = yazilacak.filter(y => sonra.get(y.id) !== y.yeni)
console.log(`GERİ OKUMA: ${yazilacak.length - bozuk.length}/${yazilacak.length} birebir`)
if (bozuk.length) { console.error(`⛔ geri okuma farklı: ${bozuk.map(b => b.id).join(', ')}`); process.exit(1) }
