#!/usr/bin/env node
/**
 * KATEGORİ EN METNİNİ CANLIYA YAZAR — karar 115, REC-146 (plan docs/audits/icerik-hatti-metin-boslugu-2026-09-25.md §3.1)
 *
 * NİÇİN VAR: EN kategori sayfası, `metadata.description_i18n.en` boşken paragraf göstermiyor
 * (`getCategoryDescription` EN'de TR'ye düşmez — INV-DIL-DUSUSU-1). 2026-09-25 ölçümü: 24 aktif
 * kategorinin 24'ünde TR var, 0'ında EN. `kategori-metni-yaz.mjs` yalnız TR yazar ve yedek/geri okuma
 * yapmaz; EN yazımı bu yüzden ayrı ve daha sıkı.
 *
 * GİRDİ: `--dizin <d>` → `<d>/plan.json` ([{slug, tr_md5}], çeviri anındaki TR'nin parmak izi) +
 * `<d>/<slug>.en.md` (yalnız paragraf). Metni bu betik ÜRETMEZ; çeviri + çürütme + jeton kapısı önce koşar.
 * Plan kuralları saf çekirdekte: `kategori-en.mjs` (bayat TR, Türkçe harf, boş metin → RED).
 *
 * YAZAR: yalnız `categories.metadata.description_i18n.en`. TR ve diğer anahtarlar aynen kalır.
 * İKİ ANAHTAR: `--yaz` VE `CANLI_YAZIM_ONAYI`. `--yaz` ile `--yedek <dosya>` ZORUNLU (yazım öncesi metadata).
 * Herhangi bir RED varsa HİÇBİR ŞEY yazılmaz (kısmi yazım yok). Yazımdan sonra geri okuma birebir değilse çıkış 1.
 *
 * KOŞUM: node scripts/icerik-hatti/kategori-en-yaz.mjs --dizin <d> [--yaz --yedek <json>]
 * Çıkış: 0 geçti · 1 red/yazım hatası · 2 ölçülemedi (fail-closed).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { enYazimPlani, kanon } from './kategori-en.mjs'

const arg = (ad) => { const i = process.argv.indexOf(ad); return i > 0 ? process.argv[i + 1] : undefined }
const DIZIN = arg('--dizin')
const YAZ = process.argv.includes('--yaz')
const YEDEK = arg('--yedek')
if (!DIZIN || !existsSync(join(DIZIN, 'plan.json'))) { console.error('⛔ --dizin <d> ve <d>/plan.json gerekli'); process.exit(2) }

const env = Object.fromEntries(
  readFileSync(process.env.VENTHUB_ENV || join(homedir(), 'venthub-hvac', '.env'), 'utf8')
    .split(/\r?\n/).filter(s => s && !s.startsWith('#') && s.includes('='))
    .map(s => { const i = s.indexOf('='); return [s.slice(0, i).trim(), s.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const U = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const K = env.SUPABASE_SERVICE_ROLE_KEY
if (!U || !K) { console.error('⛔ SUPABASE_URL / SERVICE_ROLE_KEY yok'); process.exit(2) }
const H = { apikey: K, authorization: `Bearer ${K}`, 'content-type': 'application/json' }

const plan = JSON.parse(readFileSync(join(DIZIN, 'plan.json'), 'utf8'))
const en = Object.fromEntries(plan.map(p => {
  const f = join(DIZIN, `${p.slug}.en.md`)
  return [p.slug, existsSync(f) ? readFileSync(f, 'utf8') : undefined]
}))

async function kategoriler() {
  const say = await fetch(`${U}/rest/v1/categories?select=id`, { headers: { ...H, Prefer: 'count=exact', Range: '0-0' } })
  const kesin = Number((say.headers.get('content-range') || '').split('/')[1])
  const k = await (await fetch(`${U}/rest/v1/categories?select=id,slug,metadata&order=id`, { headers: H })).json()
  if (!Number.isInteger(kesin) || !Array.isArray(k) || k.length !== kesin) {
    console.error(`⛔ EKSİK VERİ: çekilen ${k?.length}, sunucu ${kesin} — fail-closed`); process.exit(2)
  }
  return k
}

const { yazilacak, ayni, red } = enYazimPlani({ kategoriler: await kategoriler(), plan, en })
console.log(`PLAN: ${plan.length} kategori · yazılacak ${yazilacak.length} · zaten aynı ${ayni.length} · RED ${red.length}`)
for (const r of red) console.log(`  ⛔ ${r.slug}: ${r.sebep}`)
for (const y of yazilacak) console.log(`  ${y.slug.padEnd(26)} ${y.uzerine ? '(ÜZERİNE YAZILIR)' : '(boş → yeni)'}  ${y.yeni_metadata.description_i18n.en.slice(0, 90)}…`)
if (red.length) { console.error('\n⛔ RED var — hiçbir şey yazılmadı (kısmi yazım yok)'); process.exit(1) }

if (!YAZ) { console.log('\nKURU KOŞUM — hiçbir şey yazılmadı. Canlıya yazım: --yaz --yedek <json> + CANLI_YAZIM_ONAYI'); process.exit(0) }
if (!process.env.CANLI_YAZIM_ONAYI) { console.error('⛔ CANLI_YAZIM_ONAYI yok — Recep\'in KENDİ sözü; akran aktarımı onay değildir'); process.exit(1) }
if (!YEDEK) { console.error('⛔ --yedek <json> zorunlu'); process.exit(1) }

writeFileSync(YEDEK, JSON.stringify({ damga: new Date().toISOString(), onay: process.env.CANLI_YAZIM_ONAYI,
  satirlar: yazilacak.map(y => ({ id: y.id, slug: y.slug, metadata: y.onceki_metadata })) }, null, 2) + '\n', 'utf8')
console.log(`\nYEDEK: ${YEDEK} (${yazilacak.length} satır)`)

for (const y of yazilacak) {
  const r = await fetch(`${U}/rest/v1/categories?id=eq.${y.id}`, { method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify({ metadata: y.yeni_metadata }) })
  if (!r.ok) { console.error(`⛔ ${y.slug} YAZILAMADI: ${r.status} ${await r.text()} — yedekten geri dön`); process.exit(1) }
}

const sonra = new Map((await kategoriler()).map(c => [c.id, c]))
const bozuk = yazilacak.filter(y => kanon(sonra.get(y.id)?.metadata) !== kanon(y.yeni_metadata))
console.log(`GERİ OKUMA: ${yazilacak.length - bozuk.length}/${yazilacak.length} birebir`)
if (bozuk.length) { console.error(`⛔ geri okuma farklı: ${bozuk.map(b => b.slug).join(', ')}`); process.exit(1) }
