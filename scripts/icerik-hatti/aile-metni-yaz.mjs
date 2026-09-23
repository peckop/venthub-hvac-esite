#!/usr/bin/env node
/**
 * AILE METNI YAZICI — REC-146 karar 70 (EN aile metni + onaysiz TR'nin onayli hali).
 * Plan: docs/plans/rec146-karar70-aciklama-2026-09-22.md v3.1 adim 6. Kurallar:
 * `aile-metni-kurallar.mjs` (saf, testli).
 *
 * VARSAYILAN KURU KOSUM. Prod'a yalniz IKI ANAHTARLA dokunur: `--yaz` bayragi VE ortamda
 * `CANLI_YAZIM_ONAYI=evet` (Recep'in kendi penceresindeki sozuyle). Kapilarin HEPSI yesil
 * degilse `--yaz` bile reddedilir; hicbir aile yazilmaz (kismi yazim yok).
 *
 * NICIN AYRI YUK DOSYASI: yazilacak metin, insanin ONAYLADIGI sunumu ureten AYNI koddan
 * (toplu-sunum.py --yuk) cikar. Bu betik taslak .md'leri OKUMAZ.
 * NICIN AYRI BEKLENEN DOSYASI: yuk kendisiyle kiyaslanmaz. `--beklenen` = Recep'in onayladigi
 * aile listesi {"en":[slug…],"b":[slug…]}; yukun slug kumesi bununla KUME olarak karsilastirilir.
 *
 * ⚠ ANON ANAHTAR KULLANILMAZ: RLS yazmayi sessizce bosaltir, "0 satir" basari gibi gorunur.
 * ⚠ DENETIM IZI TETIKTE: `denetim_izi_product_families` UPDATE'te admin_audit_log'a yazar;
 *   bu betik ikinci audit satiri YAZMAZ (PATCH basina 1 satir).
 * ⚠ YARIS: PATCH `updated_at=eq.<okunan>` kosulludur; 0 satir donerse aile yeniden okunur,
 *   plan yeniden kurulur ve 1 kez denenir; yine 0 → KIRMIZI.
 *
 * KULLANIM:
 *   node scripts/icerik-hatti/aile-metni-yaz.mjs --yuk <yuk.json> --beklenen <onay.json> [--yedek <yol>] [--yaz]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { kumeKapisi, metinKapisi, yazimPlani, patchYolu, OKUMA_SECIMI } from './aile-metni-kurallar.mjs'

const argv = process.argv.slice(2)
const deger = (ad, vars) => {
  const i = argv.indexOf(ad)
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : vars
}
const YUK_YOL = deger('--yuk', null)
const BEKLENEN_YOL = deger('--beklenen', null)
const YEDEK_YOL = deger('--yedek', 'aile-metni-yedek.json')
const YAZ = argv.includes('--yaz')

if (!YUK_YOL || !BEKLENEN_YOL) {
  console.error('⛔ ONKOSUL: --yuk ve --beklenen zorunlu (beklenen = Recep\'in onayladigi aile listesi).')
  process.exit(2)
}

const ENV_YOL = process.env.VENTHUB_ENV || join(homedir(), 'venthub-hvac', '.env')
let ortam
try {
  ortam = Object.fromEntries(
    readFileSync(ENV_YOL, 'utf8')
      .split(/\r?\n/)
      .filter((s) => s && !s.startsWith('#') && s.includes('='))
      .map((s) => {
        const i = s.indexOf('=')
        return [s.slice(0, i).trim(), s.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
      }),
  )
} catch {
  console.error('⛔ ONKOSUL: ortam dosyasi okunamadi:', ENV_YOL)
  process.exit(2)
}
const URL_ = ortam.SUPABASE_URL || ortam.NEXT_PUBLIC_SUPABASE_URL
const ANAHTAR = ortam.SUPABASE_SERVICE_ROLE_KEY
if (!URL_ || !ANAHTAR) {
  console.error('⛔ ONKOSUL: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY yok:', ENV_YOL)
  process.exit(2)
}
const basliklar = { apikey: ANAHTAR, Authorization: `Bearer ${ANAHTAR}`, 'Content-Type': 'application/json' }

const yuk = JSON.parse(readFileSync(YUK_YOL, 'utf8'))
const beklenen = JSON.parse(readFileSync(BEKLENEN_YOL, 'utf8'))
console.log(`YUK: ${yuk.length} aile (en ${yuk.filter((y) => y.kip === 'en').length} · b ${yuk.filter((y) => y.kip === 'b').length})`)

const kirmizi = (baslik, satirlar) => {
  console.error(`⛔ ${baslik} KIRMIZI`)
  for (const s of satirlar) console.error('   ' + s)
  console.error('   Hicbir aile yazilmadi.')
  process.exit(1)
}

// ---- KAPI 1: yuk kumesi = Recep'in onayladigi kume
const k1 = kumeKapisi(yuk, beklenen)
if (k1.length) kirmizi('KAPI 1 (onaylanan kume)', k1)
console.log('  KAPI 1 YESIL — yuk kumesi onaylanan kumeyle ayni')

// ---- KAPI 2: her aile DB'de var mi
const oku = async (filtre) => {
  const r = await fetch(`${URL_}/rest/v1/product_families?select=${OKUMA_SECIMI}&${filtre}`, { headers: basliklar })
  if (!r.ok) {
    console.error('⛔ aile sorgusu basarisiz:', r.status, await r.text())
    process.exit(1)
  }
  return r.json()
}
const sluglar = yuk.map((y) => y.slug)
const mevcut = await oku(`slug=in.(${sluglar.join(',')})`)
const bulunan = new Map(mevcut.map((a) => [a.slug, a]))
const eksik = sluglar.filter((s) => !bulunan.has(s))
if (eksik.length) kirmizi('KAPI 2 (DB\'de aile)', [`bulunamayan: ${eksik.join(', ')}`])
if (mevcut.length !== new Set(mevcut.map((a) => a.slug)).size) kirmizi('KAPI 2 (DB\'de aile)', ['ayni slug birden cok kiracida — kiraci belirsiz'])
console.log(`  KAPI 2 YESIL — ${bulunan.size}/${sluglar.length} aile DB'de`)

// ---- KAPI 3/5: metin dolu, ic referans yok, kaynak/jeton kapilari yesil
const k3 = yuk.flatMap(metinKapisi)
if (k3.length) kirmizi('KAPI 3 (metin)', k3)
console.log('  KAPI 3 YESIL — metinler dolu, ic referans yok, kapi sonuclari yesil')

// ---- KAPI 4: yazim plani (dolu EN'i ezmez; onayli TR'nin ustune isaretsiz yazmaz)
const planlar = yuk.map((y) => ({ y, p: yazimPlani(bulunan.get(y.slug), y) }))
const k4 = planlar.filter(({ p }) => p.hata).map(({ y, p }) => `${y.slug}: ${p.hata}`)
if (k4.length) kirmizi('KAPI 4 (yazim plani)', k4)
const atlanan = planlar.filter(({ p }) => p.atla)
const yazilacak = planlar.filter(({ p }) => p.govde)
console.log(`  KAPI 4 YESIL — yazilacak ${yazilacak.length} · atlanan ${atlanan.length}`)
for (const { y, p } of atlanan) console.log(`     atla ${y.slug}: ${p.atla}`)

// ---- YEDEK
writeFileSync(YEDEK_YOL, JSON.stringify(mevcut, null, 2) + '\n', 'utf8')
console.log(`  YEDEK: ${YEDEK_YOL} (${mevcut.length} kayit, updated_at dahil)`)

if (!YAZ || process.env.CANLI_YAZIM_ONAYI !== 'evet') {
  console.log('')
  console.log('KURU KOSUM — hicbir sey yazilmadi. Yazim icin iki anahtar: --yaz VE CANLI_YAZIM_ONAYI=evet')
  process.exit(0)
}

// ---- YAZIM (atomik kosullu PATCH, 0 satirda 1 yeniden deneme)
const patch = async (a, govde) => {
  const r = await fetch(`${URL_}/rest/v1/${patchYolu(a)}`, {
    method: 'PATCH',
    headers: { ...basliklar, Prefer: 'return=representation' },
    body: JSON.stringify(govde),
  })
  if (!r.ok) return { hata: `${r.status} ${await r.text()}` }
  const d = await r.json()
  return { satir: Array.isArray(d) ? d.length : -1 }
}
let basarili = 0
const hatalar = []
for (const { y, p } of yazilacak) {
  let a = bulunan.get(y.slug)
  let s = await patch(a, p.govde)
  if (!s.hata && s.satir === 0) {
    // yaris: aile okunmasindan sonra degismis. Yeniden oku, plani yeniden kur, 1 kez dene.
    const [taze] = await oku(`id=eq.${a.id}&tenant_id=eq.${a.tenant_id}`)
    const p2 = taze ? yazimPlani(taze, y) : { hata: 'aile artik yok' }
    if (!p2.govde) {
      hatalar.push(`${y.slug}: yeniden okumada yazilamaz — ${p2.hata || p2.atla}`)
      continue
    }
    a = taze
    s = await patch(a, p2.govde)
  }
  if (s.hata) hatalar.push(`${y.slug}: ${s.hata}`)
  else if (s.satir === 1) basarili++
  else hatalar.push(`${y.slug}: donen satir ${s.satir} (yaris ikinci denemede de surdu)`)
}
console.log('')
console.log(`YAZILAN: ${basarili}/${yazilacak.length}`)

// ---- YAZIM SONRASI DOGRULAMA (beyan degil, olcum)
const son = new Map((await oku(`slug=in.(${sluglar.join(',')})`)).map((a) => [a.slug, a]))
const uymayan = yazilacak
  .map(({ y }) => y)
  .filter((y) => {
    const d = son.get(y.slug)?.description || {}
    return d.en !== y.kimlik_en || (y.kip === 'b' && (d.tr !== y.kimlik_tr || son.get(y.slug)?.is_description_manual !== true))
  })
  .map((y) => y.slug)
console.log(`DOGRULAMA (canlidan okundu): yuk ile birebir ${yazilacak.length - uymayan.length}/${yazilacak.length}`)
if (uymayan.length) hatalar.push(`canlida yukle uymayan: ${uymayan.join(', ')}`)
if (hatalar.length) {
  console.error(`⛔ HATA ${hatalar.length}:`)
  for (const h of hatalar) console.error('   ' + h)
  process.exit(1)
}
process.exit(0)
