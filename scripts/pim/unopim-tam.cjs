#!/usr/bin/env node
'use strict'
/**
 * REC-357 §1 — TAM YÜKLEME (GÖLGE): canlının anlık kopyası (442 ürün / 47 aile) → yerel UnoPim. Canlıya YAZMAZ.
 *
 * Pilot (`unopim.cjs`) tek aile + elle yazılmış 22 öznitelikti. Burada öznitelik listesi VERİDEN türetilir:
 * `technical_specs` anahtarının soneki birimi taahhüt eder (product-schema-standard §11.6: `_mm`, `_w`, `_m3h`…),
 * JSON tipi öznitelik tipini verir (2026-09-23 ölçümü: 77 anahtar, karışık tipli anahtar 0). Pilotun elle
 * yazdığı 22 satır önceliklidir (etiket/doğrulama korunur); TURETILMIS (max_delivery_ls) PIM'e girmez.
 * ⚠`docs/.../alan-etiket-sozlugu.json` (PDF etiketi → anahtar) KULLANILMAZ: kaynak DB anahtarlarıdır, PDF değil.
 *
 * Adımlar (hepsi idempotent; sıra önemli):
 *   sema     <golge.json>            öznitelikler + her VentHub ailesi için bir UnoPim ailesi (yalnız o ailede görülen anahtarlar)
 *   csv      <golge.json> <dizin>    aile başına bir CSV (UnoPim ailesi kendi özniteliklerini ister)
 *   ice-al   <dizin>                 her CSV'yi konteynere kopyalar, `unopim-ice-al.php` ile kuyruğa verir, bitmesini bekler
 *   dogrula  <golge.json>            HER hücre API'den geri okunur; kabul: fark 0 (plan §1)
 * Ön koşul (karar 82): toplu PIM düzenlemesinden ÖNCE `unopim-yedek.cjs al`.
 *
 * Kod kuralı: UnoPim kodunda tire YASAK (422, ölçüldü) → aile kodu = VentHub aile slug'ı, `-` → `_`. SKU serbest.
 * Sır: UNOPIM_SIR_DOSYASI (yazma yetkili istemci), basılmaz. Konteyner: UNOPIM_KONTEYNER (varsayılan pim-unopim-unopim-1).
 */
const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { OZNITELIKLER, TURETILMIS, csvUret, urunFarklari, istemci } = require('./unopim.cjs')

const GRUP = 'technical_specs'
const KONTEYNER = process.env.UNOPIM_KONTEYNER || 'pim-unopim-unopim-1'

// Sonek → [ölçü ailesi, birim]. En uzun sonek önce denenir (`_db_a` > `_db`, `_l_24h` birimsiz kalır).
const SONEK = [
  ['_m3h', 'VolumeFlow', 'CUBIC_METER_PER_HOUR'],
  ['_db_a', 'Decibel', 'DECIBEL'],
  ['_db', 'Decibel', 'DECIBEL'],
  ['_mm', 'Length', 'MILLIMETER'],
  ['_kw', 'Power', 'KILOWATT'],
  ['_w', 'Power', 'WATT'],
  ['_kg', 'Weight', 'KILOGRAM'],
  ['_hz', 'Frequency', 'HERTZ'],
  ['_pa', 'Pressure', 'PASCAL'],
  ['_v', 'Voltage', 'VOLT'],
  ['_a', 'Intensity', 'AMPERE'],
  ['_c', 'Temperature', 'CELSIUS'],
  ['_ms', 'Speed', 'METER_PER_SECOND'],
  ['_l', 'Volume', 'LITER'],
]

const etiketYap = (kod) => kod.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
const aileKodu = (slug) => String(slug).replace(/-/g, '_')

/** Saf: bir anahtar + JSON tipi → pilot biçiminde öznitelik satırı. Uzun/eğri metin → textarea. */
function oznitelikTuret(kod, jsonTip, ornekUzunluk = 0) {
  const elle = OZNITELIKLER.find(([k]) => k === kod)
  if (elle) return elle
  if (jsonTip === 'boolean') return [kod, 'boolean', etiketYap(kod)]
  if (jsonTip === 'string') return [kod, /_curve$/.test(kod) || ornekUzunluk > 200 ? 'textarea' : 'text', etiketYap(kod)]
  if (jsonTip === 'number') {
    const s = SONEK.find(([son]) => kod.endsWith(son))
    if (s) return [kod, 'measurement', etiketYap(kod), s[1], s[2]]
    return [kod, 'text', etiketYap(kod), null, null, 'number']
  }
  throw new Error(`${kod}: desteklenmeyen JSON tipi ${jsonTip}`)
}

/** Saf: gölge satırları → { oznitelikler (tüm), aileler: Map(aileKodu → {ad, kodlar[], urunler[]}) }. */
function semaCikar(urunler) {
  const tip = new Map()
  const uzunluk = new Map()
  for (const u of urunler) {
    for (const [k, v] of Object.entries(u.specs ?? {})) {
      if (TURETILMIS[k] || v === null) continue
      const t = typeof v === 'object' ? 'object' : typeof v
      if (tip.has(k) && tip.get(k) !== t) throw new Error(`${k}: karışık tip ${tip.get(k)} / ${t}`)
      tip.set(k, t)
      uzunluk.set(k, Math.max(uzunluk.get(k) ?? 0, String(v).length))
    }
  }
  const oznitelikler = [...tip.keys()].sort().map((k) => oznitelikTuret(k, tip.get(k), uzunluk.get(k)))
  const aileler = new Map()
  for (const u of urunler) {
    const kod = aileKodu(u.aile)
    if (!aileler.has(kod)) aileler.set(kod, { ad: u.aile_ad || u.aile, kodlar: new Set(), urunler: [] })
    const a = aileler.get(kod)
    a.urunler.push(u)
    for (const k of Object.keys(u.specs ?? {})) if (!TURETILMIS[k] && u.specs[k] !== null) a.kodlar.add(k)
  }
  return { oznitelikler, aileler }
}

const kisa = (r) => `${r.durum} ${JSON.stringify(r.json ?? r.metin).slice(0, 200)}`

async function sema(api, urunler) {
  const { oznitelikler, aileler } = semaCikar(urunler)
  let hata = 0
  if ((await api('GET', `attribute-groups/${GRUP}`)).durum === 404) {
    const r = await api('POST', 'attribute-groups', { code: GRUP, labels: { en_US: 'Technical specs' } })
    if (r.durum >= 300) { hata++; console.log('grup', kisa(r)) }
  }
  let yeni = 0
  for (const [code, type, etiket, olcuAilesi, birimKodu, dogrulama] of oznitelikler) {
    if ((await api('GET', `attributes/${code}`)).durum === 404) {
      const govde = { code, type, labels: { en_US: etiket }, is_required: false, is_unique: false, value_per_locale: false, value_per_channel: false }
      if (dogrulama) govde.validation = dogrulama
      const r = await api('POST', 'attributes', govde)
      if (r.durum >= 300) { hata++; console.log('oznitelik', code, kisa(r)); continue }
      yeni++
    }
    if (type === 'measurement') {
      const m = await api('GET', `attribute-measurement/config/${code}`)
      if (!(m.durum === 200 && JSON.stringify(m.json).includes(birimKodu))) {
        const r = await api('POST', `attribute-measurement/${code}`, { family_code: olcuAilesi, unit_code: birimKodu })
        if (r.durum >= 300) { hata++; console.log('olcu', code, kisa(r)) }
      }
    }
  }
  let aileHata = 0
  for (const [kod, a] of aileler) {
    const kodlar = oznitelikler.map(([k]) => k).filter((k) => a.kodlar.has(k))
    const govde = {
      code: kod, labels: { en_US: a.ad },
      attribute_groups: [
        { code: 'general', position: 1, custom_attributes: [{ code: 'sku', position: 1 }, { code: 'name', position: 2 }, { code: 'url_key', position: 3 }] },
        { code: GRUP, position: 2, custom_attributes: kodlar.map((code, i) => ({ code, position: i + 1 })) },
      ],
    }
    const var_ = await api('GET', `families/${kod}`)
    const r = var_.durum === 404 ? await api('POST', 'families', govde) : await api('PUT', `families/${kod}`, govde)
    if (r.durum >= 300) { aileHata++; console.log('aile', kod, kisa(r)) }
  }
  console.log(`sema: oznitelik ${oznitelikler.length} (yeni ${yeni}) · aile ${aileler.size} · hata ${hata + aileHata}`)
  if (hata + aileHata) process.exitCode = 1
}

function csvYaz(urunler, dizin) {
  const { oznitelikler, aileler } = semaCikar(urunler)
  fs.mkdirSync(dizin, { recursive: true })
  let satir = 0
  let bos = 0
  for (const [kod, a] of aileler) {
    const oz = oznitelikler.filter(([k]) => a.kodlar.has(k))
    const { csv, eksik } = csvUret(a.urunler, oz, kod)
    fs.writeFileSync(path.join(dizin, `${kod}.csv`), csv)
    satir += a.urunler.length
    bos += eksik.length
  }
  console.log(`csv: ${aileler.size} dosya, ${satir} urun satiri, bos hucre ${bos} (aile icinde o urunde olmayan anahtar — normal)`)
}

function kos(argv, girdi) {
  const r = spawnSync('docker', argv, { encoding: 'utf8', input: girdi, env: { ...process.env, MSYS_NO_PATHCONV: '1' } })
  if (r.status !== 0) throw new Error(`docker ${argv.slice(0, 3).join(' ')} → ${r.status}: ${(r.stderr || r.stdout).slice(0, 300)}`)
  return r.stdout.trim()
}

async function iceAl(dizin) {
  const php = fs.readFileSync(path.join(__dirname, 'unopim-ice-al.php'), 'utf8')
  const dosyalar = fs.readdirSync(dizin).filter((f) => f.endsWith('.csv')).sort()
  let bitti = 0
  for (const f of dosyalar) {
    const kod = f.replace(/\.csv$/, '')
    kos(['cp', path.join(dizin, f), `${KONTEYNER}:/tmp/ice-al.csv`])
    kos(['exec', '-u', 'root', KONTEYNER, 'chmod', '644', '/tmp/ice-al.csv'])
    const cikti = kos(['exec', '-i', '-u', 'www-data', '-e', 'HOME=/tmp', '-e', `ICE_AL_KOD=${kod}`, '-e', 'ICE_AL_CSV=/tmp/ice-al.csv', KONTEYNER, 'php', 'artisan', 'tinker'], php.replace(/^<\?php\s*/, ''))
    const takip = (cikti.match(/takip_id=(\d+)/) || [])[1]
    if (!takip) throw new Error(`${kod}: kuyruk kaydi yok → ${cikti.slice(0, 200)}`)
    // Kuyruk işçisi sırayla işler; aynı CSV yolu yeniden kullanıldığı için bir sonraki dosyadan ÖNCE bitmesi beklenir.
    const durum = await isBekle(takip)
    console.log(`ice-al ${kod}: takip ${takip} → ${durum}`)
    if (durum === 'completed') bitti++
  }
  console.log(`ice-al: ${bitti}/${dosyalar.length} tamam`)
  if (bitti !== dosyalar.length) process.exitCode = 1
}

async function isBekle(takip, sinirSn = 300) {
  for (let i = 0; i < sinirSn / 3; i++) {
    const s = kos(['exec', '-u', 'www-data', '-e', 'HOME=/tmp', KONTEYNER, 'php', 'artisan', 'tinker', '--execute', `echo \\DB::table('job_track')->where('id', ${Number(takip)})->value('state');`])
    const durum = s.split('\n').pop().trim()
    if (['completed', 'failed'].includes(durum)) return durum
    await new Promise((r) => setTimeout(r, 3000))
  }
  return 'zaman-asimi'
}

async function dogrula(api, urunler) {
  const { oznitelikler } = semaCikar(urunler)
  const fark = []
  let hucre = 0
  for (const u of urunler) {
    const r = await api('GET', `products/${encodeURIComponent(u.sku)}`)
    if (r.durum !== 200) { fark.push(`${u.sku}: GET ${r.durum}`); continue }
    hucre += 2 + Object.keys(u.specs ?? {}).length
    fark.push(...urunFarklari(u, r.json))
    const aile = r.json.attribute_family ?? r.json.family
    if (aile && aile !== aileKodu(u.aile)) fark.push(`${u.sku}: aile ${aile} ≠ ${aileKodu(u.aile)}`)
  }
  console.log(`dogrula: urun ${urunler.length}, hucre ${hucre}, oznitelik ${oznitelikler.length}, fark ${fark.length}`)
  for (const f of fark.slice(0, 30)) console.log('  FARK', f)
  if (fark.length) process.exitCode = 1
}

async function main([komut, a, b]) {
  const oku = (f) => JSON.parse(fs.readFileSync(f, 'utf8'))
  if (komut === 'csv') return csvYaz(oku(a), b)
  if (komut === 'ice-al') return iceAl(a)
  const api = istemci()
  if (komut === 'sema') return sema(api, oku(a))
  if (komut === 'dogrula') return dogrula(api, oku(a))
  console.error('kullanim: unopim-tam.cjs sema <golge.json> | csv <golge.json> <dizin> | ice-al <dizin> | dogrula <golge.json>')
  process.exitCode = 2
}

if (require.main === module) {
  main(process.argv.slice(2)).catch((e) => { console.error(String(e)); process.exitCode = 1 })
}

module.exports = { oznitelikTuret, semaCikar, aileKodu, SONEK }
