#!/usr/bin/env node
/**
 * BİRİM-GÖMÜLÜ HÜCRE DÜZELTİCİSİ — REC-190
 *
 * KUSUR: alan adı bir birim taahhüt ediyorsa (`max_delivery_m3h`, `voltage_v`) değeri SAYI
 * olmalıdır. Canlıda bazı hücreler birimi metin olarak taşıyor ("1550 m³/h"). Sonucu:
 * sıralama/filtre/karşılaştırma sessizce yanlış çalışır — "10500 m³/h" < "2900 m³/h" (metin
 * karşılaştırması), ve föy/vitrin birimi İKİ KEZ yazar ("1550 m³/h m³/h").
 * Alan adı bir birime söz veriyorsa o söz tutulmalı (bkz. memory: alan-adi-birimi-taahhut-eder).
 *
 * ⚠ÜÇ SINIF VAR, ÜÇÜ AYNI ŞEY DEĞİL — betik bunu ayırır:
 *   1. SAYI+BİRİM   "1550 m³/h" -> 1550           ONARIR
 *   2. SADE BİRİM   "380 V"     -> 380            ONARIR
 *   3. ARALIK       "5 - 32"    -> ÇEVİRMEZ       DOKUNMAZ, listeler
 *
 * Üçüncü sınıf niçin dokunulmaz: `operating_temperature_c` tek sayıya söz veriyor ama veri
 * bir ARALIK. Birimi silip "5" yazmak veriyi bozar (32 kaybolur), "532" yazmak felakettir.
 * Doğru onarım şema kararıdır (`operating_temperature_min_c` / `_max_c`) ve bu betiğin işi
 * değildir — ÜRÜN/OPS cetvel kararı. Betik burada DURUR ve sebebini yazar.
 *
 * İKİ ANAHTARLI YAZMA: `--yaz` VE `CANLI_YAZIM_ONAYI` birlikte gerekir (FAZ 4 deseni).
 * Varsayılan KURU KOŞUM.
 */
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const env = Object.fromEntries(
  readFileSync(process.env.VENTHUB_ENV || join(homedir(), 'venthub-hvac', '.env'), 'utf8')
    .split(/\r?\n/).filter(s => s && !s.startsWith('#') && s.includes('='))
    .map(s => { const i = s.indexOf('='); return [s.slice(0, i).trim(), s.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const U = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const K = env.SUPABASE_SERVICE_ROLE_KEY
if (!U || !K) { console.error('⛔ SUPABASE_URL / SERVICE_ROLE_KEY yok'); process.exit(1) }
const H = { apikey: K, authorization: `Bearer ${K}`, 'content-type': 'application/json' }

// Alan adının SONU birim taahhüt ediyorsa değer sayı olmalı.
const BIRIMLI = /_(mm|kw|w|m3h|pa|db|a|v|hz|kg|ls|rpm|c)$/i

const r = await fetch(`${U}/rest/v1/products?select=id`, { headers: { ...H, Prefer: 'count=exact', Range: '0-0' } })
const kesin = Number((r.headers.get('content-range') || '').split('/')[1])
if (!Number.isInteger(kesin)) { console.error('⛔ kesin sayı alınamadı — fail-closed'); process.exit(1) }
let p = []
for (let off = 0; ; off += 1000) {
  const b = await (await fetch(`${U}/rest/v1/products?select=id,sku,name,technical_specs&order=sku&limit=1000&offset=${off}`, { headers: H })).json()
  if (!Array.isArray(b)) { console.error('⛔ dizi dönmedi'); process.exit(1) }
  p = p.concat(b); if (b.length < 1000) break
}
if (p.length !== kesin) { console.error(`⛔ çekilen ${p.length} ≠ sunucu ${kesin} — fail-closed`); process.exit(1) }

const onarilacak = [], dokunulmaz = []
for (const x of p) {
  const yeni = { ...(x.technical_specs || {}) }
  let degisti = false
  for (const [k, v] of Object.entries(x.technical_specs || {})) {
    if (!BIRIMLI.test(k) || typeof v !== 'string') continue
    const s = v.trim()
    if (/^-?\d+([.,]\d+)?$/.test(s)) continue // zaten sayı-metin: ayrı kusur, burada değil
    // ARALIK: iki sayı arasında ayırıcı. Artık DOKUNULMAZ değil — cetvel hükmü uygulanır.
    //
    // 2026-09-07: bu kol önce "şema kararı gerekir" deyip duruyordu. URUN şeridi ölçtü,
    // karar ZATEN YAZILIYMIŞ — `product-schema-standard.md`, "Ön ek → anlam":
    //   "Aralığı TEK ALANA sıkıştırmak yasak: min_/max_ çifti yazılır."
    //   "min_… Aynı aralığın alt sınırı. Kaynak aralık veriyorsa ÇİFT OLARAK yazılır."
    // Yani yeni karar üretilmedi; yazılı hüküm uygulandı.
    //
    // Üç ayrıntı bilerek: (1) ön ek, son ek değil (cetvelin örneği `min_delivery_m3h`)
    // (2) birim son eki korunur (`_c`) (3) değer SAYI.
    // ESKİ ALAN SİLİNİR: bırakılırsa aynı büyüklük iki yerde yaşar, biri bayatlar ve vitrin
    // hangisini okuyorsa onu gösterir — bugün üç kez yaşadığımız sınıfın aynısı.
    const aralik = s.match(/^(-?\d+(?:[.,]\d+)?)\s*[-–—]\s*(-?\d+(?:[.,]\d+)?)\s*[^\d]*$/)
    if (aralik) {
      const alt = Number(aralik[1].replace(',', '.'))
      const ust = Number(aralik[2].replace(',', '.'))
      if (!(alt < ust)) { dokunulmaz.push({ x, k, v: s, sebep: `ARALIK SINIRI TERS/EŞİT (${alt} ≥ ${ust}) — okunuş şüpheli, dokunulmadı` }); continue }
      yeni[`min_${k}`] = alt
      yeni[`max_${k}`] = ust
      delete yeni[k]
      degisti = true
      continue
    }
    if (/\d\s*[-–—]\s*\d/.test(s)) { dokunulmaz.push({ x, k, v: s, sebep: 'ARALIK ama biçim çözülemedi — UYDURULMADI' }); continue }
    const m = s.match(/^(-?\d+(?:[.,]\d+)?)\s*[^\d]*$/)
    if (!m) { dokunulmaz.push({ x, k, v: s, sebep: 'ÇÖZÜLEMEDİ — beklenmeyen biçim' }); continue }
    yeni[k] = Number(m[1].replace(',', '.'))
    degisti = true
  }
  if (degisti) onarilacak.push({ x, yeni })
}

// ---- DÖRDÜNCÜ SINIF: ÖLÇEK HATASI (değer sayı, tip doğru, BÜYÜKLÜK yanlış)
// `max_absorbed_power_w` = 0.18 gibi. Hiçbir tip kapısı bunu görmez: sayı, pozitif, geçerli.
// Yalnız FİZİK yanlış — 0,18 W'lık sanayi fanı yoktur; 0,18 kW yazılmış.
// UYDURMUYORUZ: yalnız ÜRÜN ADININ KENDİSİ "0,18 kW" diyorsa ve alan değeri tam o sayıysa
// onarılır (x1000). Ad kanıtı yoksa DOKUNULMAZ — küçük ev tipi fanlar gerçekten 4-9 W çeker
// ve ölçüldü: Vortice'de 10 böyle ürün var ve hepsi DOĞRU.
for (const x of p) {
  const t = x.technical_specs || {}
  const v = t.max_absorbed_power_w
  if (typeof v !== 'number' || v <= 0 || v >= 10) continue
  const adKw = (x.name || '').match(/(\d+(?:[.,]\d+)?)\s*kW/i)
  if (!adKw) continue
  const kw = Number(adKw[1].replace(',', '.'))
  if (Math.abs(kw - v) > 1e-9) continue // ad başka bir sayı diyorsa karışma
  const mevcut = onarilacak.find(o => o.x.id === x.id)
  const hedef = mevcut ? mevcut.yeni : { ...t }
  hedef.max_absorbed_power_w = Math.round(kw * 1000)
  if (!mevcut) onarilacak.push({ x, yeni: hedef })
  console.log(`  ÖLÇEK: ${x.sku} max_absorbed_power_w ${v} -> ${Math.round(kw * 1000)}  (ad kanıtı: "${adKw[0]}")`)
}

const hucre = onarilacak.reduce((n, o) => n + Object.keys(o.yeni).filter(k => o.yeni[k] !== o.x.technical_specs[k]).length, 0)
console.log(`ÜRÜN     : ${p.length} (kesin sayı ile doğrulandı)`)
console.log(`ONARILIR : ${hucre} hücre / ${onarilacak.length} ürün`)
console.log(`DOKUNULMAZ: ${dokunulmaz.length} hücre\n`)
// Rapor, aralık kolundan sonra ÜÇ hâli ayırmalı: değişen · YENİ eklenen (min_/max_) ·
// SİLİNEN (aralığın eski tek alanı). Tek satırlık "eski -> yeni" bunu anlatamaz.
for (const { x, yeni } of onarilacak) {
  const eski = x.technical_specs || {}
  for (const k of Object.keys(yeni))
    if (yeni[k] !== eski[k])
      console.log(`  ${x.sku.padEnd(16)} ${k.padEnd(30)} ${(k in eski ? JSON.stringify(eski[k]) : '(yok)').padEnd(16)} -> ${yeni[k]}`)
  for (const k of Object.keys(eski))
    if (!(k in yeni))
      console.log(`  ${x.sku.padEnd(16)} ${k.padEnd(30)} ${JSON.stringify(eski[k]).padEnd(16)} -> SİLİNDİ (aralık min_/max_ çiftine ayrıldı)`)
}
if (dokunulmaz.length) {
  console.log(`\n⚠ DOKUNULMAYANLAR — bu betik BİLEREK durdu:`)
  for (const d of dokunulmaz) console.log(`  ${d.x.sku.padEnd(16)} ${d.k.padEnd(24)} = ${JSON.stringify(d.v).padEnd(12)} ${d.sebep}`)
}

const yaz = process.argv.includes('--yaz')
const onay = process.env.CANLI_YAZIM_ONAYI
if (!yaz) { console.log('\nKURU KOŞUM — hiçbir şey yazılmadı. Canlıya: --yaz + CANLI_YAZIM_ONAYI'); process.exit(0) }
if (!onay) { console.error('\n⛔ CANLI YAZIM REDDEDİLDİ: CANLI_YAZIM_ONAYI yok (Recep\'in KENDİ sözü; akran aktarımı onay değildir).'); process.exit(1) }

console.log(`\nCANLIYA YAZILIYOR (onay damgası: ${onay}) — ${onarilacak.length} ürün`)
let n = 0
for (const { x, yeni } of onarilacak) {
  const res = await fetch(`${U}/rest/v1/products?id=eq.${x.id}`, {
    method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' },
    body: JSON.stringify({ technical_specs: yeni }),
  })
  if (!res.ok) { console.error(`⛔ ${x.sku} YAZILAMADI: ${res.status} ${await res.text()}`); process.exit(1) }
  n++
}
console.log(`✓ ${n} ürün güncellendi · ikinci koşum 0 onarım göstermeli (idempotent)`)
