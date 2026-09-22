#!/usr/bin/env node
'use strict'
/**
 * REC-357 §3.2 — gölge DB ailesi → UnoPim (yerel pilot) kurulum + CSV + doğrulama.
 *
 * Alt komutlar (sırayla koşulur, hepsi idempotent):
 *   birim    VolumeFlow ailesine m³/h birimi ekler (UnoPim 3.1.1'de YOK — ölçüldü)
 *   aile     öznitelik grubu + öznitelikler + aile (ölçülü öznitelik → birime bağlanır)
 *   csv      <golge.json> → <cikti.csv>   (golge.json = [{sku,name,slug,specs}], arama_golge'den SELECT)
 *   dogrula  <golge.json>                 içe alım sonrası HER hücre API'den geri okunup karşılaştırılır
 * İçe alımın kendisi `unopim-ice-al.php` (konteyner içinde, www-data ile).
 *
 * Sır: UNOPIM_SIR_DOSYASI = {client_id, client_secret, username, password} JSON yolu. ASLA basılmaz.
 * Adres: UNOPIM_ADRES (varsayılan http://localhost:8000 — pilot yalnız 127.0.0.1'e bağlı).
 *
 * ⛔ÖLÇÜLEN UnoPim 3.1.1 TUZAKLARI (2026-09-22):
 *  1. Ölçülü öznitelik CSV'de `<kod>_value` + `<kod>_unit` ile GİREMEZ: Importer
 *     addMeasurementValidationRules "(unit)" sütununa da required_with:<kod>_value koyuyor → 12/12 satır
 *     reddedildi. Doğru biçim `<kod>` + `<kod>(unit)`.
 *  2. `parent` ve `variant_structure` sütunları boş olsa da ZORUNLU ("Required columns not found").
 *  3. Dönüşüm yönü: taban = değer / mul (MeasurementHelper) → m³/h için mul 3600.
 *  4. tr_TR yerel ayarı kurulumda etkin değil (etiket 422 verdi).
 *  5. CSV'de status=1 verilse de 12/12 ürün status=false girdi (bulgu, köprü etkilemez).
 */
const fs = require('node:fs')

// [kod, tip, etiket, ölçü ailesi, birim, doğrulama] — vortice-lineo-quiet'in 23 anahtarından 22'si (canlı SELECT 09-22).
// ⭐DEBİ TEK ALAN (URUN hükmü 2026-09-22, posta 3c512522): PIM'de yalnız `max_delivery_m3h`. `max_delivery_ls`
// bağımsız bilgi DEĞİL (canlı 375 üründe ls×3,6 ile m3h %2'den fazla ayrışan 0) → PIM'e girmez, dışa
// aktarımda TURETILMIS ile üretilir. Çift alan tutulsaydı iki kaynak birbirinden kayardı.
const OZNITELIKLER = [
  ['absorbed_current_a', 'measurement', 'Absorbed current', 'Intensity', 'AMPERE'],
  ['diameter_mm', 'measurement', 'Diameter', 'Length', 'MILLIMETER'],
  ['erp_compliant', 'boolean', 'ErP compliant'],
  ['frequency_hz', 'measurement', 'Frequency', 'Frequency', 'HERTZ'],
  ['has_humidistat', 'boolean', 'Humidistat'],
  ['has_timer', 'boolean', 'Timer'],
  ['insulation_class', 'text', 'Insulation class'],
  ['ip_rating', 'text', 'IP rating'],
  ['max_absorbed_power_w', 'measurement', 'Max absorbed power', 'Power', 'WATT'],
  ['max_delivery_m3h', 'measurement', 'Max delivery (m³/h)', 'VolumeFlow', 'CUBIC_METER_PER_HOUR'],
  ['max_static_pressure_pa', 'measurement', 'Max static pressure', 'Pressure', 'PASCAL'],
  ['motor_poles', 'text', 'Motor poles', null, null, 'number'],
  ['motor_type', 'text', 'Motor type'],
  ['noise_level_db_a', 'measurement', 'Noise level dB(A)', 'Decibel', 'DECIBEL'],
  ['phase', 'text', 'Phase', null, null, 'number'],
  ['pq_curve', 'textarea', 'P-Q curve (m³/h, Pa)'],
  ['rpm_max', 'text', 'Max RPM', null, null, 'number'],
  ['size_a_mm', 'measurement', 'Size A', 'Length', 'MILLIMETER'],
  ['size_b_mm', 'measurement', 'Size B', 'Length', 'MILLIMETER'],
  ['size_c_mm', 'measurement', 'Size C', 'Length', 'MILLIMETER'],
  ['voltage_v', 'measurement', 'Voltage', 'Voltage', 'VOLT'],
  ['weight_kg', 'measurement', 'Weight', 'Weight', 'KILOGRAM'],
]
/**
 * PIM'de tutulmayan, kaynaktan TÜRETİLEN alanlar. Yuvarlama ÖLÇÜLDÜ (2026-09-22): pilot 12 satırda
 * kaynak l/s = round(m3h/3.6, 2) → 12/12 birebir; tam sayıya yuvarlama 0/12.
 */
const TURETILMIS = {
  max_delivery_ls: (specs) => (typeof specs.max_delivery_m3h === 'number' ? Math.round((specs.max_delivery_m3h / 3.6) * 100) / 100 : undefined),
}
const GRUP = 'technical_specs'
const AILE = 'vortice_lineo_quiet'

function kacir(v) {
  const s = v === null || v === undefined ? '' : String(v)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Saf: gölge satırları → { csv, eksik[] }. Eksik anahtar boş hücre olur ve listelenir (sessiz değil). */
function csvUret(urunler, oznitelikler = OZNITELIKLER, aile = AILE) {
  const bas = ['sku', 'locale', 'channel', 'type', 'parent', 'variant_structure', 'attribute_family', 'status', 'name', 'url_key']
  for (const [kod, tip] of oznitelikler) {
    if (tip === 'measurement') bas.push(kod, `${kod}(unit)`)
    else bas.push(kod)
  }
  const eksik = []
  const satirlar = urunler.map((u) => {
    const s = { sku: u.sku, locale: 'en_US', channel: 'default', type: 'simple', parent: '', variant_structure: '', attribute_family: aile, status: 1, name: u.name, url_key: u.slug }
    for (const [kod, tip, , , birim] of oznitelikler) {
      const v = u.specs?.[kod]
      if (v === undefined || v === null) eksik.push(`${u.sku}:${kod}`)
      s[kod] = v
      if (tip === 'measurement') s[`${kod}(unit)`] = v === undefined || v === null ? '' : birim
    }
    return bas.map((b) => kacir(s[b])).join(',')
  })
  return { csv: [bas.join(','), ...satirlar].join('\n') + '\n', eksik, sutun: bas.length }
}

/** Saf: bir ürünün gölge değerleri ↔ UnoPim API cevabı → fark listesi. */
function urunFarklari(u, apiUrun) {
  const fark = []
  const c = apiUrun?.values?.common ?? {}
  const ad = apiUrun?.values?.channel_locale_specific?.default?.en_US?.name
  if (u.name !== ad) fark.push(`${u.sku}.name: ${u.name} ≠ ${ad}`)
  if (u.slug !== c.url_key) fark.push(`${u.sku}.url_key: ${u.slug} ≠ ${c.url_key}`)
  for (const [k, v] of Object.entries(u.specs ?? {})) {
    if (TURETILMIS[k]) {
      // PIM'de yok: kaynak değer, PIM'deki tabandan türetilenle karşılaştırılır.
      const kaynakSpecs = Object.fromEntries(Object.entries(c).map(([ak, av]) => [ak, typeof av === 'object' && av !== null ? Number(av.amount) : av]))
      const t = TURETILMIS[k](kaynakSpecs)
      if (!(typeof v === 'number' && Math.abs(t - v) <= 1e-9)) fark.push(`${u.sku}.${k} (türetilen): ${v} ≠ ${t}`)
      continue
    }
    const g = c[k]
    if (g === undefined) { fark.push(`${u.sku}.${k}: YOK`); continue }
    if (typeof v === 'number') {
      const sayi = typeof g === 'object' && g !== null ? Number(g.amount) : Number(g)
      if (!(Math.abs(sayi - v) <= 1e-9)) fark.push(`${u.sku}.${k}: ${v} ≠ ${sayi}`)
    } else if (String(v) !== String(g)) fark.push(`${u.sku}.${k}: ${v} ≠ ${g}`)
  }
  return fark
}

function istemci() {
  const adres = process.env.UNOPIM_ADRES || 'http://localhost:8000'
  const yol = process.env.UNOPIM_SIR_DOSYASI
  if (!yol) throw new Error('UNOPIM_SIR_DOSYASI tanimli degil')
  const sir = JSON.parse(fs.readFileSync(yol, 'utf8'))
  let jeton = null
  async function token() {
    if (jeton) return jeton
    const r = await fetch(`${adres}/oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ grant_type: 'password', ...sir }),
    })
    if (!r.ok) throw new Error(`oauth/token ${r.status}`)
    jeton = (await r.json()).access_token
    return jeton
  }
  return async function api(method, yol_, govde) {
    const r = await fetch(`${adres}/api/v1/rest/${yol_}`, {
      method,
      headers: { authorization: `Bearer ${await token()}`, 'content-type': 'application/json', accept: 'application/json' },
      body: govde === undefined ? undefined : JSON.stringify(govde),
    })
    const metin = await r.text()
    let json = null
    try { json = JSON.parse(metin) } catch { /* düz metin */ }
    return { durum: r.status, json, metin: json ? undefined : metin.slice(0, 300) }
  }
}

const kisa = (r) => `${r.durum} ${JSON.stringify(r.json ?? r.metin).slice(0, 220)}`

async function birim(api) {
  const once = await api('GET', 'units/VolumeFlow')
  if (once.durum !== 200) throw new Error(`units/VolumeFlow ${once.durum}`)
  if (JSON.stringify(once.json).includes('CUBIC_METER_PER_HOUR')) return console.log('birim ZATEN VAR')
  const r = await api('POST', 'units/VolumeFlow', {
    code: 'CUBIC_METER_PER_HOUR', labels: { en_US: 'Cubic meter per hour' }, symbol: 'm³/h',
    convert_from_standard: ['mul'], convert_value: ['3600'],
  })
  console.log('birim ekle', kisa(r))
  if (r.durum >= 300) process.exitCode = 1
}

async function aile(api) {
  let hata = 0
  if ((await api('GET', `attribute-groups/${GRUP}`)).durum === 404) {
    const r = await api('POST', 'attribute-groups', { code: GRUP, labels: { en_US: 'Technical specs' } })
    console.log('grup', kisa(r)); if (r.durum >= 300) hata++
  }
  for (const [code, type, etiket, olcuAilesi, birimKodu, dogrulama] of OZNITELIKLER) {
    if ((await api('GET', `attributes/${code}`)).durum === 404) {
      const govde = { code, type, labels: { en_US: etiket }, is_required: false, is_unique: false, value_per_locale: false, value_per_channel: false }
      if (dogrulama) govde.validation = dogrulama
      const r = await api('POST', 'attributes', govde)
      console.log('oznitelik', code, kisa(r)); if (r.durum >= 300) { hata++; continue }
    }
    if (type === 'measurement') {
      const m = await api('GET', `attribute-measurement/config/${code}`)
      if (!(m.durum === 200 && JSON.stringify(m.json).includes(birimKodu))) {
        const r = await api('POST', `attribute-measurement/${code}`, { family_code: olcuAilesi, unit_code: birimKodu })
        console.log('  olcu', code, kisa(r)); if (r.durum >= 300) hata++
      }
    }
  }
  const govde = {
    code: AILE, labels: { en_US: 'Vortice Lineo Quiet' },
    attribute_groups: [
      { code: 'general', position: 1, custom_attributes: [{ code: 'sku', position: 1 }, { code: 'name', position: 2 }, { code: 'url_key', position: 3 }] },
      { code: GRUP, position: 2, custom_attributes: OZNITELIKLER.map(([code], i) => ({ code, position: i + 1 })) },
    ],
  }
  const var_ = await api('GET', `families/${AILE}`)
  const r = var_.durum === 404 ? await api('POST', 'families', govde) : await api('PUT', `families/${AILE}`, govde)
  if (r.durum >= 300) { hata++; console.log('aile', kisa(r)) }
  // Türetilen alan PIM'de öznitelik olarak DURMAZ (önceki kurulumdan kaldıysa silinir — pilot).
  for (const kod of Object.keys(TURETILMIS)) {
    if ((await api('GET', `attributes/${kod}`)).durum === 200) {
      const s = await api('DELETE', `attributes/${kod}`)
      console.log('turetilen oznitelik silindi', kod, kisa(s)); if (s.durum >= 300) hata++
    }
  }
  const son = await api('GET', `families/${AILE}`)
  const sayi = (son.json?.attribute_groups ?? []).find((x) => x.code === GRUP)?.custom_attributes?.length ?? 0
  console.log(`aile: hata=${hata}, teknik oznitelik ${sayi}/${OZNITELIKLER.length}`)
  if (hata || sayi !== OZNITELIKLER.length) process.exitCode = 1
}

async function dogrula(api, urunler) {
  const fark = []
  const durum = {}
  let hucre = 0
  for (const u of urunler) {
    const r = await api('GET', `products/${encodeURIComponent(u.sku)}`)
    if (r.durum !== 200) { fark.push(`${u.sku}: GET ${r.durum}`); continue }
    durum[r.json.status] = (durum[r.json.status] ?? 0) + 1
    hucre += 2 + Object.keys(u.specs ?? {}).length
    fark.push(...urunFarklari(u, r.json))
  }
  console.log(`urun ${urunler.length}, hucre ${hucre}, fark ${fark.length} · UnoPim status ${JSON.stringify(durum)}`)
  for (const f of fark.slice(0, 20)) console.log('  FARK', f)
  if (fark.length) process.exitCode = 1
}

async function main([komut, a, b]) {
  if (komut === 'csv') {
    const { csv, eksik, sutun } = csvUret(JSON.parse(fs.readFileSync(a, 'utf8')))
    fs.writeFileSync(b, csv)
    console.log(`csv: ${csv.trim().split('\n').length - 1} satir, ${sutun} sutun, eksik hucre ${eksik.length}${eksik.length ? ' → ' + eksik.join(' ') : ''}`)
    return
  }
  const api = istemci()
  if (komut === 'birim') return birim(api)
  if (komut === 'aile') return aile(api)
  if (komut === 'dogrula') return dogrula(api, JSON.parse(fs.readFileSync(a, 'utf8')))
  console.error('kullanim: unopim.cjs birim | aile | csv <golge.json> <cikti.csv> | dogrula <golge.json>')
  process.exitCode = 2
}

if (require.main === module) {
  main(process.argv.slice(2)).catch((e) => { console.error(String(e)); process.exitCode = 1 })
}

module.exports = { OZNITELIKLER, TURETILMIS, csvUret, urunFarklari, kacir }
