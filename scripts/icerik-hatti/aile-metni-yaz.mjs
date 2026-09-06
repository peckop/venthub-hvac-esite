#!/usr/bin/env node
/**
 * AILE METNI YAZICI — REC-146 Adim 3 (K7.8 onayindan SONRA).
 *
 * VARSAYILAN KURU KOSUM. Prod'a yalniz `--yaz` ile dokunur ve `--yaz` bile
 * asagidaki kapilarin HEPSI yesil degilse reddeder.
 *
 * NICIN AYRI YUK DOSYASI: yazilacak metin, insanin ONAYLADIGI sunumu ureten AYNI koddan
 * (toplu-sunum.py --yuk) cikar. Bu betik taslak .md'leri OKUMAZ. Iki ayri ayristirici
 * olsaydi "onaylanan metin" ile "yazilan metin" sessizce ayrisabilirdi.
 *
 * ⚠ ANON ANAHTAR KULLANILMAZ. Olculdu (Tier C temizligi, 2026-09-05): RLS yazmayi sessizce
 * bosaltir, betik "0 satir" doner ve bu BASARI gibi gorunur. Servis anahtari zorunlu.
 *
 * ⚠ NE YAZILIR:
 *   description.tr            <- kimlik cumlesi (GORUNUR; alan bugun vitrinde bu)
 *   description.bloklar_tr    <- dolu yapisal bloklar (DEPODA; render REC-164, URUN)
 *   description.maddeler_tr   <- maddeler (DEPODA)
 *   description.en            <- DOKUNULMAZ (EN turu ayri is; silmek vitrinde gerileme olur)
 *   is_description_manual     <- true
 * BOS BLOK ANAHTARI YAZILMAZ: "hic olmadi" ile "vardi silindi" ayirt edilebilir kalsin.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const BEKLENEN_AILE = 38 // 40 aile - K7.10 geregi yazilmayan 2 (BVU-LS, hiz anahtarlari)

const argv = process.argv.slice(2)
const bayrak = (ad) => argv.includes(ad)
const deger = (ad, vars) => {
  const i = argv.indexOf(ad)
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : vars
}

const YUK_YOL = deger('--yuk', 'aile-yuku.json')
const YEDEK_YOL = deger('--yedek', 'aile-metni-yedek.json')
const YAZ = bayrak('--yaz')

const ENV_YOL = process.env.VENTHUB_ENV || join(homedir(), 'venthub-hvac', '.env')
const ortam = Object.fromEntries(
  readFileSync(ENV_YOL, 'utf8')
    .split(/\r?\n/)
    .filter((s) => s && !s.startsWith('#') && s.includes('='))
    .map((s) => {
      const i = s.indexOf('=')
      return [s.slice(0, i).trim(), s.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    }),
)
const URL_ = ortam.SUPABASE_URL || ortam.NEXT_PUBLIC_SUPABASE_URL
const ANAHTAR = ortam.SUPABASE_SERVICE_ROLE_KEY
if (!URL_ || !ANAHTAR) {
  console.error('⛔ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY yok:', ENV_YOL)
  process.exit(2)
}
const basliklar = { apikey: ANAHTAR, Authorization: `Bearer ${ANAHTAR}`, 'Content-Type': 'application/json' }

const yuk = JSON.parse(readFileSync(YUK_YOL, 'utf8'))
console.log(`YUK: ${YUK_YOL} · ${yuk.length} aile`)

// ---- KAPI 1: beklenen aile sayisi
if (yuk.length !== BEKLENEN_AILE) {
  console.error(`⛔ KAPI 1 KIRMIZI — beklenen ${BEKLENEN_AILE} aile, yukte ${yuk.length}.`)
  console.error('   Sapma sebebi ANLASILMADAN yazilmaz. (K7.10 atlamalari beklenen sayiya dahildir.)')
  process.exit(1)
}
console.log(`  KAPI 1 YESIL — aile sayisi ${yuk.length}`)

// ---- KAPI 2: her aile DB'de var mi + mevcut deger yedegi
const sluglar = yuk.map((y) => y.slug)
const yanit = await fetch(
  `${URL_}/rest/v1/product_families?select=id,slug,description,is_description_manual&slug=in.(${sluglar.join(',')})`,
  { headers: basliklar },
)
if (!yanit.ok) {
  console.error('⛔ aile sorgusu basarisiz:', yanit.status)
  process.exit(1)
}
const mevcut = await yanit.json()
const bulunan = new Map(mevcut.map((a) => [a.slug, a]))
const eksik = sluglar.filter((s) => !bulunan.has(s))
if (eksik.length) {
  console.error(`⛔ KAPI 2 KIRMIZI — DB'de bulunamayan aile ${eksik.length}: ${eksik.join(', ')}`)
  process.exit(1)
}
console.log(`  KAPI 2 YESIL — ${bulunan.size}/${sluglar.length} aile DB'de bulundu`)

// ---- KAPI 3: kimlik cumlesi bos olan var mi
const bosKimlik = yuk.filter((y) => !y.kimlik_tr || y.kimlik_tr.trim().length < 20)
if (bosKimlik.length) {
  console.error(`⛔ KAPI 3 KIRMIZI — kimlik cumlesi bos/kisa: ${bosKimlik.map((x) => x.slug).join(', ')}`)
  process.exit(1)
}
console.log('  KAPI 3 YESIL — 38/38 kimlik cumlesi dolu')

// ---- KAPI 4: kapidan DUSEN iddia tasiyan aile var mi
const dusenli = yuk.filter((y) => (y.kapi?.dusen ?? 0) > 0)
if (dusenli.length) {
  console.error(`⛔ KAPI 4 KIRMIZI — kaynagiyla CELISEN iddia tasiyan aile: ${dusenli.map((x) => x.slug).join(', ')}`)
  process.exit(1)
}
console.log('  KAPI 4 YESIL — dusen iddia tasiyan aile yok')

// ---- YEDEK: yazmadan once mevcut degerler diske
writeFileSync(
  YEDEK_YOL,
  JSON.stringify(
    mevcut.map((a) => ({ slug: a.slug, description: a.description, is_description_manual: a.is_description_manual })),
    null,
    2,
  ) + '\n',
  'utf8',
)
console.log(`  YEDEK yazildi: ${YEDEK_YOL} (${mevcut.length} kayit)`)

// ---- OZET
let blokToplam = 0
let maddeToplam = 0
let enKorunan = 0
for (const y of yuk) {
  blokToplam += Object.keys(y.bloklar_tr || {}).length
  maddeToplam += (y.maddeler_tr || []).length
  if (bulunan.get(y.slug)?.description?.en) enKorunan++
}
console.log('')
console.log(`YAZILACAK: ${yuk.length} aile · kimlik cumlesi ${yuk.length} · blok anahtari ${blokToplam} · madde ${maddeToplam}`)
console.log(`EN metni DOKUNULMAYAN aile: ${enKorunan} (EN turu ayri is; silmek vitrinde gerileme olurdu)`)

if (!YAZ) {
  console.log('')
  console.log('KURU KOSUM — hicbir sey yazilmadi. Gercekten yazmak icin: --yaz')
  process.exit(0)
}

// ---- YAZIM
let basarili = 0
const hatalar = []
for (const y of yuk) {
  const a = bulunan.get(y.slug)
  const yeni = { ...(a.description || {}) }
  yeni.tr = y.kimlik_tr
  if (Object.keys(y.bloklar_tr || {}).length) yeni.bloklar_tr = y.bloklar_tr
  if ((y.maddeler_tr || []).length) yeni.maddeler_tr = y.maddeler_tr
  const r = await fetch(`${URL_}/rest/v1/product_families?id=eq.${a.id}`, {
    method: 'PATCH',
    headers: { ...basliklar, Prefer: 'return=representation' },
    body: JSON.stringify({ description: yeni, is_description_manual: true }),
  })
  if (!r.ok) {
    hatalar.push(`${y.slug}: ${r.status} ${await r.text()}`)
    continue
  }
  const donen = await r.json()
  if (Array.isArray(donen) && donen.length === 1) basarili++
  else hatalar.push(`${y.slug}: donen satir ${Array.isArray(donen) ? donen.length : '?'}`)
}

console.log('')
console.log(`YAZILAN: ${basarili}/${yuk.length}`)
if (hatalar.length) {
  console.error(`⛔ HATA ${hatalar.length}:`)
  for (const h of hatalar) console.error('   ' + h)
}

// ---- YAZIM SONRASI DOGRULAMA (beyan degil, olcum)
const kontrol = await fetch(
  `${URL_}/rest/v1/product_families?select=slug,description,is_description_manual&slug=in.(${sluglar.join(',')})`,
  { headers: basliklar },
)
const son = await kontrol.json()
const trDolu = son.filter((a) => a.description?.tr && a.description.tr.length >= 20).length
const elle = son.filter((a) => a.is_description_manual === true).length
const blokDolu = son.filter((a) => a.description?.bloklar_tr).length
console.log(`DOGRULAMA (canlidan okundu): tr dolu ${trDolu}/${sluglar.length} · is_description_manual=true ${elle}/${sluglar.length} · bloklar_tr ${blokDolu}`)
process.exit(hatalar.length ? 1 : 0)
