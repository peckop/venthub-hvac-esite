#!/usr/bin/env node
/**
 * KATEGORİ REHBER PARAGRAFLARINI CANLIYA YAZAR — REC-146 madde 3 / REC-161 yolu.
 *
 * NİÇİN BÖYLE:
 * Paragraflar `docs/audits/icerik-hatti-taslak-kategori-rehber-2026-09-06.md` içinde
 * 2026-09-06'da yazıldı ama DB'ye GİRMEDİ: o gün kategori açıklamasının dile göre
 * çözülen bir yolu yoktu (`getCategoryDescription` dile bakmıyordu) — TR paragraf
 * yazılsa EN vitrinde de TR görünecekti, kural 7 ihlali. REC-161 (PR #1054, master'da)
 * yolu açtı: `metadata.description_i18n = {tr, en}` + `getCategoryDescription(cat, lang)`.
 *
 * NEREYE YAZAR: `categories.metadata.description_i18n.tr` — düz `description` kolonuna
 * DEĞİL. Sebep: `description` TEXT ve dile bakmıyor; resolver sırası
 * `metadata.description_i18n[lang]` → `metadata.hero_description` → `description`.
 *
 * ⚠METİN KAYNAĞI TASLAK DOSYASIDIR, BU BETİK DEĞİL. Betik metin üretmez, uydurmaz;
 * yalnız taslak dosyasındaki `> ` blok alıntılarını okur. Taslakta olmayan kategori
 * yazılmaz (K7: kaynak yoksa satır yok).
 *
 * İKİ ANAHTARLI YAZMA: `--yaz` VE `CANLI_YAZIM_ONAYI` birlikte gerekir. FAZ 4
 * yükleyicisiyle aynı desen — canlıya yazım Recep'in kendi sözüyle açılır.
 */
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const BURASI = dirname(fileURLToPath(import.meta.url))
const TASLAK = process.env.KATEGORI_TASLAK
  || join(BURASI, '..', '..', 'docs', 'audits', 'icerik-hatti-taslak-kategori-rehber-2026-09-06.md')

const env = Object.fromEntries(
  readFileSync(process.env.VENTHUB_ENV || join(homedir(), 'venthub-hvac', '.env'), 'utf8')
    .split(/\r?\n/).filter(s => s && !s.startsWith('#') && s.includes('='))
    .map(s => { const i = s.indexOf('='); return [s.slice(0, i).trim(), s.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const U = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const K = env.SUPABASE_SERVICE_ROLE_KEY
if (!U || !K) { console.error('⛔ SUPABASE_URL / SERVICE_ROLE_KEY yok — hiçbir şey yapılmadı'); process.exit(1) }
const H = { apikey: K, authorization: `Bearer ${K}`, 'content-type': 'application/json' }

// ---- 1) Taslakları oku: "## N · Ad (`slug`) — ..." başlığı + ardındaki "> " bloğu
const ham = readFileSync(TASLAK, 'utf8')
const taslak = new Map()
const bolumler = ham.split(/^## /m).slice(1)
for (const b of bolumler) {
  const bas = b.match(/^\d+\s*·\s*.+?\(`([a-z0-9-]+)`\)/)
  if (!bas) continue
  const slug = bas[1]
  const satirlar = b.split(/\r?\n/)
  const alinti = []
  for (const s of satirlar) {
    if (s.startsWith('> ')) alinti.push(s.slice(2).trim())
    else if (alinti.length && !s.startsWith('>')) break
  }
  if (!alinti.length) continue
  // Markdown vurgusu vitrine gitmez: **kalın** → düz metin
  const metin = alinti.join(' ').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\s+/g, ' ').trim()
  taslak.set(slug, metin)
}
if (taslak.size === 0) { console.error('⛔ TASLAK BOŞ — dosya biçimi değişmiş olabilir; yazım yapılmadı'); process.exit(1) }

// ---- 2) Canlı kategoriler (kesin sayı + fark kontrolü)
const say = await fetch(`${U}/rest/v1/categories?select=id`, { headers: { ...H, Prefer: 'count=exact', Range: '0-0' } })
const kesin = Number((say.headers.get('content-range') || '').split('/')[1])
if (!Number.isInteger(kesin)) { console.error('⛔ KESİN SAYI ALINAMADI — fail-closed'); process.exit(1) }
const kat = await (await fetch(`${U}/rest/v1/categories?select=id,name,slug,metadata&order=id`, { headers: H })).json()
if (!Array.isArray(kat) || kat.length !== kesin) {
  console.error(`⛔ EKSİK VERİ: çekilen ${kat?.length}, sunucu ${kesin} — yazım YAPILMADI`); process.exit(1)
}

// ---- 3) Eşle ve farkı çıkar
const bySlug = new Map(kat.map(c => [c.slug, c]))
const dokunulacak = [], eslesmeyen = [], zatenAyni = []
for (const [slug, metin] of taslak) {
  const c = bySlug.get(slug)
  if (!c) { eslesmeyen.push(slug); continue }
  const mevcut = c.metadata?.description_i18n?.tr
  if (mevcut === metin) { zatenAyni.push(slug); continue }
  dokunulacak.push({ c, metin, mevcut })
}

console.log(`TASLAK   : ${taslak.size} kategori paragrafı`)
console.log(`CANLI    : ${kat.length} kategori (kesin sayı ile doğrulandı)`)
console.log(`\nRAPOR`)
console.log(`  yazılacak     : ${dokunulacak.length}`)
console.log(`  zaten aynı    : ${zatenAyni.length}  (idempotent: ikinci koşumda hepsi buraya düşer)`)
console.log(`  eşleşmeyen    : ${eslesmeyen.length}${eslesmeyen.length ? '  -> ' + eslesmeyen.join(', ') : ''}`)
console.log()
for (const { c, metin, mevcut } of dokunulacak) {
  console.log(`  ${c.slug.padEnd(26)} ${mevcut ? '(ÜZERİNE YAZILIR)' : '(boş -> yeni)'}  ${metin.length} karakter`)
  console.log(`      ${metin.slice(0, 110)}…`)
}

const yaz = process.argv.includes('--yaz')
const onay = process.env.CANLI_YAZIM_ONAYI
if (!yaz) { console.log('\nKURU KOŞUM — hiçbir şey yazılmadı. Canlıya yazım için: --yaz + CANLI_YAZIM_ONAYI'); process.exit(0) }
if (!onay) {
  console.error('\n⛔ CANLI YAZIM REDDEDİLDİ: CANLI_YAZIM_ONAYI yok.')
  console.error('   Bu değer Recep\'in KENDİ sözünü taşır; akran aktarımı onay değildir.')
  process.exit(1)
}

console.log(`\nCANLIYA YAZILIYOR (onay damgası: ${onay}) — ${dokunulacak.length} kategori`)
let n = 0
for (const { c, metin } of dokunulacak) {
  const meta = { ...(c.metadata || {}) }
  meta.description_i18n = { ...(meta.description_i18n || {}), tr: metin }
  const r = await fetch(`${U}/rest/v1/categories?id=eq.${c.id}`, {
    method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' },
    body: JSON.stringify({ metadata: meta }),
  })
  if (!r.ok) { console.error(`⛔ ${c.slug} YAZILAMADI: ${r.status} ${await r.text()}`); process.exit(1) }
  n++
}
console.log(`✓ ${n} kategori güncellendi`)
