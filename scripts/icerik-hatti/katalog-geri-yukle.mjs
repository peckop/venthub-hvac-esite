#!/usr/bin/env node
/**
 * TAŞINABİLİR KATALOG — GERİ YÜKLEYİCİ (REC-212, ikinci yarı)
 *
 * NİÇİN VAR: dışa aktarıcı tek başına "taşınabilir katalog" değildir. Bir paket ancak
 * GERİ YÜKLENEBİLDİĞİ ölçüde taşınabilirdir; o yarısı ölçülmedikçe elimizde yalnız
 * "veriyi dosyaya yazabiliyoruz" iddiası olur — ki bu Recep'in sorduğu şey değildi.
 *
 * ⚠VARSAYILAN KURU KOŞUM. Canlıya yazım `--yaz` VE `CANLI_YAZIM_ONAYI` ister.
 *
 * ROUND-TRIP SINAVI (bu betiğin asıl değeri):
 *   Paket canlıdan çıktıysa, aynı canlıya karşı kuru koşum **0 fark** vermelidir.
 *   Fark çıkıyorsa suçlu geri yükleyici değil, DIŞA AKTARICIDIR — demek ki bir kolonu
 *   ya da tabloyu pakete koymamış. Yani bu betik, dışa aktarımın TAMLIĞINI ölçen kapıdır.
 *   "Dosya üretildi" ile "katalog taşındı" arasındaki farkı ancak bu ölçüm gösterir.
 *
 * SIRA: paket dosyaları bağımlılık yönünde yazılmıştı; aynı sırayla okunur
 * (brands -> categories -> product_families -> price_lists -> products -> prices -> images).
 */
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { homedir } from 'node:os'
import { join } from 'node:path'

const PAKET = process.argv.find(a => a.startsWith('--paket='))?.slice(8)
if (!PAKET) { console.error('⛔ --paket=<dizin> gerekli'); process.exit(1) }
if (!existsSync(join(PAKET, 'manifest.json'))) {
  console.error(`⛔ ${PAKET}/manifest.json YOK — bu bir katalog paketi değil (ya da yarım kalmış).`)
  console.error('   Manifest\'siz dizin yüklenmez: hangi tablodan kaç satır beklendiği bilinmeden')
  console.error('   eksik yükleme, tam yüklemeden ayırt edilemez.')
  process.exit(1)
}
const manifest = JSON.parse(readFileSync(join(PAKET, 'manifest.json'), 'utf8'))

const env = Object.fromEntries(
  readFileSync(process.env.VENTHUB_ENV || join(homedir(), 'venthub-hvac', '.env'), 'utf8')
    .split(/\r?\n/).filter(s => s && !s.startsWith('#') && s.includes('='))
    .map(s => { const i = s.indexOf('='); return [s.slice(0, i).trim(), s.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const U = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const K = env.SUPABASE_SERVICE_ROLE_KEY
if (!U || !K) { console.error('⛔ SUPABASE_URL / SERVICE_ROLE_KEY yok'); process.exit(1) }
const H = { apikey: K, authorization: `Bearer ${K}`, 'content-type': 'application/json' }

const SIRA = ['brands', 'categories', 'product_families', 'price_lists', 'products', 'product_prices', 'product_images']

// ---- 1) PAKET BÜTÜNLÜĞÜ: manifest hash'i tutmuyorsa yükleme YOK.
for (const t of SIRA) {
  const yol = join(PAKET, `${t}.jsonl`)
  if (!existsSync(yol)) { console.error(`⛔ ${t}.jsonl paketten EKSİK — yarım paket, yükleme yapılmadı`); process.exit(1) }
  const govde = readFileSync(yol, 'utf8')
  const hash = createHash('sha256').update(govde).digest('hex')
  const beklenen = manifest.tablolar?.[t]?.sha256
  if (hash !== beklenen) {
    console.error(`⛔ ${t}.jsonl BOZUK ya da DEĞİŞTİRİLMİŞ — manifest ${String(beklenen).slice(0, 12)}, dosya ${hash.slice(0, 12)}`)
    process.exit(1)
  }
}
console.log(`✓ paket bütünlüğü: ${SIRA.length} tablo, sha256 hepsi tuttu\n`)

// ---- 2) FARK: paketteki her satır canlıda var mı, aynı mı?
const oku = (t) => readFileSync(join(PAKET, `${t}.jsonl`), 'utf8').split('\n').filter(Boolean).map(s => JSON.parse(s))
const esitMi = (a, b) => JSON.stringify(a) === JSON.stringify(b)

let yeni = 0, degisik = 0, ayni = 0, fazlalik = 0
const detay = []
for (const t of SIRA) {
  const paketSatir = oku(t)
  let canli = []
  for (let off = 0; ; off += 1000) {
    const r = await fetch(`${U}/rest/v1/${t}?select=*&order=id&limit=1000&offset=${off}`, { headers: H })
    if (!r.ok) { console.error(`⛔ ${t} okunamadı: ${r.status}`); process.exit(1) }
    const b = await r.json()
    canli = canli.concat(b); if (b.length < 1000) break
  }
  const canliMap = new Map(canli.map(c => [c.id, c]))
  let tYeni = 0, tDeg = 0, tAyni = 0
  for (const s of paketSatir) {
    const c = canliMap.get(s.id)
    if (!c) { tYeni++; detay.push(`${t}: YENİ ${s.id}`); continue }
    // Karşılaştırma paketteki anahtar sırasına göre normalize edilir.
    const cNorm = {}; for (const k of Object.keys(s).sort()) cNorm[k] = c[k]
    if (esitMi(s, cNorm)) tAyni++
    else { tDeg++; if (detay.length < 40) detay.push(`${t}: DEĞİŞİK ${s.id}`) }
  }
  const paketId = new Set(paketSatir.map(s => s.id))
  const tFazla = canli.filter(c => !paketId.has(c.id)).length
  yeni += tYeni; degisik += tDeg; ayni += tAyni; fazlalik += tFazla
  console.log(`  ${t.padEnd(18)} paket ${String(paketSatir.length).padStart(5)} · aynı ${String(tAyni).padStart(5)} · değişik ${String(tDeg).padStart(4)} · yeni ${String(tYeni).padStart(4)} · canlıda fazla ${tFazla}`)
}

console.log(`\nTOPLAM  aynı ${ayni} · değişik ${degisik} · yeni ${yeni} · canlıda fazla ${fazlalik}`)
if (detay.length) { console.log('\nilk farklar:'); for (const d of detay.slice(0, 20)) console.log('  ' + d) }

const roundTrip = (degisik === 0 && yeni === 0 && fazlalik === 0)
console.log(`\nROUND-TRIP: ${roundTrip ? '✓ SIFIR FARK — dışa aktarım TAM (paket bu DB\'yi eksiksiz tarif ediyor)' : '⚠ FARK VAR — paket bu DB\'yi tam tarif etmiyor ya da DB paket üretildikten sonra değişti'}`)

const yaz = process.argv.includes('--yaz')
if (!yaz) { console.log('\nKURU KOŞUM — hiçbir şey yazılmadı. Canlıya: --yaz + CANLI_YAZIM_ONAYI'); process.exit(roundTrip ? 0 : 1) }
if (!process.env.CANLI_YAZIM_ONAYI) {
  console.error('\n⛔ CANLI YAZIM REDDEDİLDİ: CANLI_YAZIM_ONAYI yok (Recep\'in KENDİ sözü).')
  process.exit(1)
}
console.error('\n⛔ YAZMA KOLU HENÜZ AÇILMADI — bilerek.')
console.error('   Sebep: yükleme sırası, çakışma kuralı (upsert mi, sil-yaz mı) ve tenant_id')
console.error('   yeniden eşlemesi KARARA bağlı; kararsız bir yükleyici canlıyı bozar.')
console.error('   Bu betik bugün ÖLÇER; yazma kolu o kararlar verildikten sonra açılacak.')
process.exit(1)
