#!/usr/bin/env node
/**
 * ÜRÜN EN ADINI CANLIYA YAZAR — karar 116, REC-146 (plan docs/audits/icerik-hatti-metin-boslugu-2026-09-25.md §3.2)
 *
 * NİÇİN VAR: EN sayfada 166 ürün adı Türkçe biçim taşıyor (`1400 d/dk`, `0,55 kW`, `HIZ ANAHTARI`).
 * Dönüşüm çeviri değil sabit kuraldır; kurallar ve RED koşulları saf çekirdekte: `urun-ad-en.mjs`.
 * TR ad (`products.name`) DEĞİŞMEZ; yalnız `name_i18n.en` yazılır, diğer anahtarlar aynen kalır.
 * Elle yazılmış EN ad ezilmez; dile bağlı olmayan model adına EN ad yazılmaz (gerek yok).
 *
 * İKİ ANAHTAR: `--yaz` VE `CANLI_YAZIM_ONAYI`; `--yaz` ile `--yedek <json>` ZORUNLU. RED varsa HİÇ yazım yok.
 * `--liste <csv>`: Recep'in gözden geçirmesi için sku;tr;en;kurallar (yazmaz).
 *
 * KOŞUM: node scripts/icerik-hatti/urun-ad-en-yaz.mjs [--liste <csv>] [--yaz --yedek <json>]
 * Çıkış: 0 geçti · 1 red/yazım hatası · 2 ölçülemedi (fail-closed).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { adYazimPlani } from './urun-ad-en.mjs'
import { kanon } from './kategori-en.mjs'

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

async function urunler() {
  const say = await fetch(`${U}/rest/v1/products?select=id`, { headers: { ...H, Prefer: 'count=exact', Range: '0-0' } })
  const kesin = Number((say.headers.get('content-range') || '').split('/')[1])
  let out = []
  for (let o = 0; ; o += 1000) {
    const b = await (await fetch(`${U}/rest/v1/products?select=id,sku,name,status,name_i18n&order=id&limit=1000&offset=${o}`, { headers: H })).json()
    if (!Array.isArray(b)) { console.error('⛔ products okunamadı'); process.exit(2) }
    out = out.concat(b); if (b.length < 1000) break
  }
  if (!Number.isInteger(kesin) || out.length !== kesin) { console.error(`⛔ EKSİK VERİ: çekilen ${out.length}, sunucu ${kesin}`); process.exit(2) }
  return out
}

const { yazilacak, red, ayni, gereksiz, dolu } = adYazimPlani(await urunler())
const kural = {}; for (const y of yazilacak) for (const k of y.kurallar) kural[k] = (kural[k] || 0) + 1
console.log(`PLAN: yazılacak ${yazilacak.length} · zaten aynı ${ayni.length} · EN ad gerekmez ${gereksiz} · elle yazılmış EN (dokunulmaz) ${dolu} · RED ${red.length}`)
console.log(`  kurallar: ${Object.entries(kural).map(([k, n]) => `${k} ${n}`).join(' · ')}`)
for (const y of yazilacak.slice(0, 5)) console.log(`  ${y.sku.padEnd(16)} ${y.tr}  →  ${y.en}`)
for (const r of red) console.log(`  ⛔ ${r.sku}: ${r.ad} (${r.sebep})`)

if (LISTE) {
  const h = (v) => /[;"]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
  writeFileSync(LISTE, '﻿' + ['sku;tr_ad;en_ad;kurallar', ...yazilacak.map(y => [y.sku, y.tr, y.en, y.kurallar.join(' + ')].map(h).join(';'))].join('\r\n') + '\r\n', 'utf8')
  console.log(`LİSTE: ${LISTE} (${yazilacak.length} satır)`)
}
if (red.length) { console.error('\n⛔ RED var — hiçbir şey yazılmadı (kısmi yazım yok)'); process.exit(1) }
if (!YAZ) { console.log('\nKURU KOŞUM — hiçbir şey yazılmadı. Canlıya yazım: --yaz --yedek <json> + CANLI_YAZIM_ONAYI'); process.exit(0) }
if (!process.env.CANLI_YAZIM_ONAYI) { console.error('⛔ CANLI_YAZIM_ONAYI yok — Recep\'in KENDİ sözü; akran aktarımı onay değildir'); process.exit(1) }
if (!YEDEK) { console.error('⛔ --yedek <json> zorunlu'); process.exit(1) }

writeFileSync(YEDEK, JSON.stringify({ damga: new Date().toISOString(), onay: process.env.CANLI_YAZIM_ONAYI,
  satirlar: yazilacak.map(y => ({ id: y.id, sku: y.sku, name_i18n: y.onceki_name_i18n })) }, null, 2) + '\n', 'utf8')
console.log(`\nYEDEK: ${YEDEK} (${yazilacak.length} satır)`)

for (const y of yazilacak) {
  const r = await fetch(`${U}/rest/v1/products?id=eq.${y.id}`, { method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify({ name_i18n: y.yeni_name_i18n }) })
  if (!r.ok) { console.error(`⛔ ${y.sku} YAZILAMADI: ${r.status} ${await r.text()} — yedekten geri dön`); process.exit(1) }
}

const sonra = new Map((await urunler()).map(u => [u.id, u]))
const bozuk = yazilacak.filter(y => kanon(sonra.get(y.id)?.name_i18n) !== kanon(y.yeni_name_i18n))
console.log(`GERİ OKUMA: ${yazilacak.length - bozuk.length}/${yazilacak.length} birebir`)
if (bozuk.length) { console.error(`⛔ geri okuma farklı: ${bozuk.map(b => b.sku).join(', ')}`); process.exit(1) }
