#!/usr/bin/env node
/**
 * KARAR 70 HAZIRLIK — plan v3.1 adim 1 + 3'un deterministik kismi. SALT OKUMA (DB'ye yazmaz).
 *
 * Canlidan EN aile metni bos aileleri okur, kipe ayirir ve taslak dizinini kurar:
 *   plan.json                     [{slug, kip, urun, degisti, onay_md5, canli_md5, not}]
 *   <slug>.tr.md  (yalniz kip en) onayli CANLI TR — cevirmen ajanin girdisi, jeton kapisinin TR'si
 * Kip b aileleri icin .tr.md YAZILMAZ: yeni TR'yi yazar ajan kaynaktan uretir.
 *
 * KIP KURALI (plan §Kapsam):
 *   is_description_manual=true  ve onaylanan kimlik_tr (K7.8 yuku) == canli tr  → en
 *   is_description_manual=true  ve farkli                                          → b (degisti)
 *   is_description_manual=false ve tr dolu                                         → b
 *   tr bos ve karar-k710.json "KISA KIMLIK YAZILIR" (karar 85)                    → b
 *   tr bos, baska durum                                                             → PLANA GIRMEZ
 *   --yeniden-onay dosyasindaki aile (onayli TR'de curutucu olgu hatasi buldu)      → b (degisti, not=sebep)
 * Onay kaniti: K7.8 yuku (ingestor 66c296a, md5 80dafc1e18214299f5fd3bb0e59880f1). md5 tutmazsa
 * ONKOSUL — yanlis dosyayla "degisti" hukmu verilmez.
 *
 * KULLANIM: node scripts/icerik-hatti/karar70-hazirla.mjs --onay <k78-yuk.json> --cikti <dizin>
 *           [--yeniden-onay <json: {slug: sebep}>]
 * `--yeniden-onay` elle plan.json duzeltmenin yerine gecer: kip degisikligi kayitli girdiden gelir,
 * yeniden kosum ayni plani uretir. Listedeki slug canlida EN'i bos, TR'si dolu degilse ONKOSUL.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { homedir } from 'node:os'
import { join } from 'node:path'

const ONAY_MD5 = '80dafc1e18214299f5fd3bb0e59880f1'
const argv = process.argv.slice(2)
const deger = (ad) => (argv.indexOf(ad) >= 0 ? argv[argv.indexOf(ad) + 1] : null)
const ONAY_YOL = deger('--onay')
const CIKTI = deger('--cikti')
if (!ONAY_YOL || !CIKTI) {
  console.error('⛔ ONKOSUL: --onay <k78 yuku> ve --cikti <dizin> zorunlu')
  process.exit(2)
}
const md5 = (s) => createHash('md5').update(s).digest('hex')
const onayHam = readFileSync(ONAY_YOL)
if (md5(onayHam) !== ONAY_MD5) {
  console.error(`⛔ ONKOSUL: onay yuku md5 ${md5(onayHam)} ≠ ${ONAY_MD5} — onay kaniti bu dosya degil.`)
  process.exit(2)
}
const onay = new Map(JSON.parse(onayHam.toString('utf8')).map((y) => [y.slug, y.kimlik_tr]))
const k710 = JSON.parse(readFileSync(new URL('./karar-k710.json', import.meta.url), 'utf8')).kararlar || {}
const kisaKimlik = new Set(Object.entries(k710).filter(([, v]) => v.durum === 'KISA KIMLIK YAZILIR').map(([s]) => s))
const YENIDEN_YOL = deger('--yeniden-onay')
const yenidenOnay = new Map(Object.entries(YENIDEN_YOL ? JSON.parse(readFileSync(YENIDEN_YOL, 'utf8')) : {}))
for (const [s, sebep] of yenidenOnay) {
  if (typeof sebep !== 'string' || sebep.trim().length < 10) {
    console.error(`⛔ ONKOSUL: --yeniden-onay ${s} icin sebep yok/kisa — sebepsiz yeniden onay yok`)
    process.exit(2)
  }
}

const ENV_YOL = process.env.VENTHUB_ENV || join(homedir(), 'venthub-hvac', '.env')
const ortam = Object.fromEntries(readFileSync(ENV_YOL, 'utf8').split(/\r?\n/)
  .filter((s) => s && !s.startsWith('#') && s.includes('='))
  .map((s) => [s.slice(0, s.indexOf('=')).trim(), s.slice(s.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')]))
const URL_ = ortam.SUPABASE_URL || ortam.NEXT_PUBLIC_SUPABASE_URL
const ANAHTAR = ortam.SUPABASE_SERVICE_ROLE_KEY
if (!URL_ || !ANAHTAR) {
  console.error('⛔ ONKOSUL: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY yok')
  process.exit(2)
}
const al = async (yol) => {
  const r = await fetch(`${URL_}/rest/v1/${yol}`, { headers: { apikey: ANAHTAR, Authorization: `Bearer ${ANAHTAR}` } })
  if (!r.ok) {
    console.error('⛔ sorgu basarisiz:', r.status, await r.text())
    process.exit(1)
  }
  return r.json()
}

const aileler = await al('product_families?select=id,slug,description,is_description_manual&order=slug')
const urunler = await al('products?select=family_id,status&deleted_at=is.null')
const vitrin = new Map()
for (const u of urunler) if (u.status === 'active') vitrin.set(u.family_id, (vitrin.get(u.family_id) || 0) + 1)

const bos = (s) => !(typeof s === 'string' && s.trim())
const plan = []
const disarida = []
for (const a of aileler) {
  const d = a.description || {}
  if (!bos(d.en)) continue
  if (bos(d.tr)) {
    if (kisaKimlik.has(a.slug)) {
      plan.push({
        slug: a.slug, kip: 'b', urun: vitrin.get(a.id) || 0, degisti: false,
        onay_md5: null, canli_md5: null, not: 'karar 85 — Türkçesi boştu; fiyat listesindeki bilgilerden kısa tanım',
      })
    } else disarida.push(a.slug)
    continue
  }
  const onayli = onay.get(a.slug)
  let kip
  let degisti = false
  let not = onayli === undefined && a.is_description_manual === true ? 'onay yükünde yok — TR de onaya girer' : ''
  if (a.is_description_manual === true) {
    degisti = onayli !== undefined && onayli !== d.tr
    kip = degisti || onayli === undefined ? 'b' : 'en'
    if (degisti) not = 'onaydan sonra sitedeki Türkçe metin değişmiş'
  } else kip = 'b'
  if (yenidenOnay.has(a.slug)) {
    kip = 'b'
    degisti = true
    not = yenidenOnay.get(a.slug)
  }
  plan.push({
    slug: a.slug, kip, urun: vitrin.get(a.id) || 0, degisti,
    onay_md5: onayli === undefined ? null : md5(onayli), canli_md5: md5(d.tr), not,
  })
}
const planda = new Set(plan.map((p) => p.slug))
const yetim = [...yenidenOnay.keys()].filter((s) => !planda.has(s))
if (yetim.length) {
  console.error(`⛔ ONKOSUL: --yeniden-onay listesinde olup EN'i bos/TR'si dolu olmayan aile: ${yetim.join(', ')}`)
  process.exit(2)
}

mkdirSync(CIKTI, { recursive: true })
writeFileSync(join(CIKTI, 'plan.json'), JSON.stringify(plan, null, 2) + '\n')
for (const p of plan.filter((x) => x.kip === 'en')) {
  const tr = aileler.find((a) => a.slug === p.slug).description.tr
  writeFileSync(join(CIKTI, `${p.slug}.tr.md`), `<!-- onayli canli TR, md5 ${p.canli_md5} -->\n### Kimlik cümlesi\n> ${tr}\n`)
}
const say = (k) => plan.filter((x) => x.kip === k)
console.log(`EN metni bos aile: ${plan.length + disarida.length}`)
console.log(`  kip en ${say('en').length} (vitrin urun ${say('en').reduce((s, x) => s + x.urun, 0)})`)
console.log(`  kip b  ${say('b').length} (vitrin urun ${say('b').reduce((s, x) => s + x.urun, 0)}) — degisti: ${plan.filter((x) => x.degisti).map((x) => x.slug).join(', ') || 'yok'}`)
console.log(`  plana girmeyen (TR de bos, karar-k710.json kisa kimlik demiyor): ${disarida.join(', ') || 'yok'}`)
console.log(`YAZILDI: ${join(CIKTI, 'plan.json')} + ${say('en').length} .tr.md`)
