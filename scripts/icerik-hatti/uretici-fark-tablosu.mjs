#!/usr/bin/env node
/**
 * ÜRETİCİ ↔ BİZİM VERİ FARK TABLOSU (REC-172 eki, karar 71c, 2026-09-22)
 *
 * ── NİÇİN VAR
 * Recep kararı (71c): kaynak önceliği ÜRETİCİ; bizim verimiz üreticiyle her ürün × ölçülü alan
 * için yan yana konur ve AVenS'e gönderilebilecek bir fark tablosu çıkar. Bugüne kadar farklar
 * tek tek, konuşma içinde bulunuyordu (NIMAX 314 debi 5240/5500, CMS ATEX 35/14 4 kW/3 kW,
 * STORM güç) — tekrar üretilemez, genişletilemez ve kimse "hepsi bu mu" diyemezdi.
 *
 * ── NASIL ÇALIŞIR
 * Üretici değeri ELLE YAZILMAZ: her kaynak türü için bir OKUYUCU, kaynak dizinindeki sayfadan
 * satırı okur ve alıntıyı (kaynaktaki satırın kendisi) taşır. Yazmadan önce her alıntı dizindeki
 * sayfada YENİDEN aranır; bulunamayan satır tabloya GİRMEZ (kaynak yok → satır yok).
 * Bizim değer canlı veriden gelir (`--veri`, `urun-veri-cek.mjs` çıktısı) ya da AVenS fiyat
 * listesinden (bize verilen veri; dizinde).
 *
 * ── HÜKÜM
 *   aynı      — fark yok (%0,5 tolerans)
 *   üretici   — aynı büyüklük, üretici kaynağı var, değer farklı → üreticinin değeri alınır
 *   belirsiz  — büyüklükler farklı (ör. motor gücü ↔ çekilen güç) ya da kaynak üretici değil
 *
 * ── GENİŞLEME
 * Yeni kaynak dizine girince buraya bir okuyucu eklenir. Okuyucusu olmayan aile tabloda
 * görünmez ama özet "okuyucusu yok" sayısını basar — sessiz eksik yok.
 *
 * SALT OKUMA. Canlıya yazmaz.
 * ── RAPOR (karar 75 ile Recep şartı): `--rapor <md>` TÜM ürünleri marka → aile → ürün gruplar,
 * AVenS'e gönderilebilir biçimde; karşılaştırılamayan ürünün nedeni yazılır. Her çıkarımdan sonra
 * yeniden üretilir: docs/audits/urun-veri-fark-raporu-<tarih>.md + .csv
 *
 * KOŞUM: node uretici-fark-tablosu.mjs --veri <urunler.json> [--dizin <sayfalar.jsonl>] [--cikti <csv>]
 *          [--rapor <md>] [--tarih YYYY-AA-GG]
 * Çıkış: 0 üretildi · 1 alıntı doğrulanamadı · 2 ÖLÇÜLEMEDİ (girdi yok/boş).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d }
const DIZIN = arg('dizin', process.env.VENTHUB_KAYNAK_DIZINI ||
  join(homedir(), 'venthub-pdf-ingestor', 'kaynak-dizini', 'sayfalar.jsonl'))
const VERI = arg('veri'), CIKTI = arg('cikti'), RAPOR = arg('rapor')
// Tarih rapora girer; verilmezse bugün (UTC). Determinizm sınavı --tarih ile sabitler.
const TARIH = arg('tarih', new Date().toISOString().slice(0, 10))

if (!VERI || !existsSync(VERI) || !existsSync(DIZIN)) {
  console.error(`ÖLÇÜLEMEDİ — girdi yok: --veri ${VERI} · dizin ${DIZIN}`); process.exit(2)
}

// ── Dizin: her sayfa için aranabilir metin (düz metin + tablo satırları, hücreler ' | ' ile)
const sayfalar = readFileSync(DIZIN, 'utf8').split('\n').filter(Boolean).map(s => JSON.parse(s))
const satirMetni = r => r.map(h => (h ?? '').toString().replace(/\s+/g, ' ').trim()).join(' | ')
const aranabilir = k => [(k.metin || ''), ...(k.tablo || []).flatMap(t => (t.satirlar || []).map(satirMetni))].join('\n')
const sayfaMetni = new Map(sayfalar.map(k => [`${k.dosya}#${k.sayfa}`, aranabilir(k)]))
const tabloSatirlari = k => (k.tablo || []).flatMap(t => t.satirlar || [])

const sayi = (s, binlikNokta = false) => {
  if (s == null) return null
  let t = String(s).replace(/\s|m³\/h|m3\/h|kW|kg/gi, '')
  if (binlikNokta) t = t.replace(/\.(?=\d{3}(\D|$))/g, '')
  t = t.replace(',', '.')
  const n = Number(t); return Number.isFinite(n) ? n : null
}
const adKw = ad => { const m = /(\d+(?:,\d+)?)\s*kW/i.exec(ad || ''); return m ? sayi(m[1]) : null }

// ── OKUYUCULAR: her biri { anahtar, model, alanlar: {alan: deger}, kod, belge, sayfa, alinti, tur }
const okuyucular = {
  // Casals teknik katalog (web, flipbook): "NX314290 NIMAX 314 T2 1,5kW 2865 5,83 3,14 1,50 5.500 60 36,89 1"
  casalsNim(k) {
    if (!/Casals_catalogue__flipbook/.test(k.dosya)) return []
    const d = /(N[SX]\d{5,8})\s+(NIM(?:US|AX)\s+(\d+)\s+T(\d))\s+[\d,]+kW\s+(\d{3,4})\s+([\d,]+|-)\s+([\d,]+|-)\s+([\d,]+)\s+([\d.]+)\s+(\d+)\s+([\d,]+)\s+\d/g
    const out = []
    for (const m of (k.metin || '').matchAll(d)) {
      out.push({ anahtar: `${m[2].split(' ')[0]} ${m[3]} T${m[4]}`, model: m[0].split(/\s+/).slice(1, 5).join(' '),
        kod: m[1], alanlar: { motor_gucu_kw: sayi(m[8]), debi_m3h: sayi(m[9], true), devir_rpm: sayi(m[5]) },
        belge: k.dosya, sayfa: `flipbook ${/flipbook__(\d+)/.exec(k.dosya)[1]}`, alinti: m[0], tur: 'üretici' })
    }
    return out
  },
  // Casals plug-fan kataloğu (PDF tablosu): ['ENKEC155','ENKELFAN 155 EEC','3950','0,25','0,06','460',...]
  casalsEnkelfan(k) {
    if (!/plug-fans_casals\.pdf$/.test(k.dosya)) return []
    return tabloSatirlari(k).filter(r => /^ENKEC\d+$/.test(r[0] || '') && /^ENKELFAN \d+ EEC$/.test(r[1] || ''))
      .map(r => ({ anahtar: `ENKELFAN ${/\d+/.exec(r[1])[0]}`, model: r[1], kod: r[0],
        alanlar: { motor_gucu_kw: sayi(r[4]), debi_m3h: sayi(r[5], true), devir_rpm: sayi(r[2]) },
        belge: k.dosya, sayfa: k.sayfa, alinti: satirMetni(r), tur: 'üretici' }))
  },
  // Vorticent CMS ATEX föyü (PDF, s.2 tablo): 'Power | 3 kW' · 'Max. Flow | 5870 m³/h' · fan 'RPM | 1420'
  cmsAtex(k) {
    if (!/VORTICENT-CMS-ATEX-/.test(k.dosya) || k.sayfa !== 2) return []
    const bas = sayfalar.find(s => s.dosya === k.dosya && s.sayfa === 1)
    const ust = /VORTICENT CMS ATEX (\d+\/\d+) T(\d)[^\n]*/.exec(bas?.metin || '')
    if (!ust) return []
    const r = tabloSatirlari(k)
    const fan = r.find(x => x[0] === 'RPM' && x[4] === 'Max. Flow'), mot = r.find(x => x[0] === 'Power')
    if (!fan || !mot) return []
    return [{ anahtar: `CMS ATEX ${ust[1]} T${ust[2]}`, model: ust[0].split(':')[0].trim(), kod: null,
      alanlar: { motor_gucu_kw: sayi(mot[1]), debi_m3h: sayi(fan[5]), devir_rpm: sayi(fan[1]) },
      belge: k.dosya, sayfa: 2, alinti: `${satirMetni(fan)} // ${satirMetni(mot)}`, tur: 'üretici',
      alintiParcalari: [satirMetni(fan), satirMetni(mot)] }]
  },
}

// AVenS fiyat listesi — BİZE VERİLEN veri (kaynak_turu=distribütör): ['NX313290','NIMAX 314 T2 1,5kW','5240 m³/h','1818']
const avensListe = new Map()
const avensStorm = []
for (const k of sayfalar.filter(s => /avens_fiyat_listesi_2026/.test(s.dosya))) {
  for (const r of tabloSatirlari(k)) {
    const m = /^(NIM(?:US|AX)) (\d+) T(\d) [\d,]+kW$/.exec(r[1] || '')
    const e = /^ENKELFAN (\d+) EEC$/.exec(r[1] || '')
    if ((m || e) && /m³\/h/.test(r[2] || '')) {
      avensListe.set(m ? `${m[1]} ${m[2]} T${m[3]}` : `ENKELFAN ${e[1]}`, { kod: r[0], model: r[1], debi_m3h: sayi(r[2]),
        belge: k.dosya, sayfa: k.sayfa, alinti: satirMetni(r.slice(0, 3)) })
    }
    // ⛔ALINTI FİYATTAN ÖNCE KESİLİR: ana depo PUBLIC, fiyat Recep'in alanı. Kesilen alıntı satırın
    // ön ekidir, dizindeki sayfada yine birebir geçer (kapı değişmez).
    // STORM: s.42 ['STORM 10','2.70','220 V','0,06','1400','628'] · s.45 ['61102003','STORM 10 ATEX','4.33','380 V',...]
    const kodlu = /^\d{8}$/.test(r[0] || '') && /^STORM /.test(r[1] || '')
    const kodsuz = /^STORM \d+/.test(r[0] || '') && /V$/.test(r[2] || '')
    if (kodlu || kodsuz) {
      const [model, , volt, kw, rpm] = kodlu ? r.slice(1) : r
      avensStorm.push({ kod: kodlu ? r[0] : null, model: model.replace(/\s*\(\*\)$/, ''), volt: sayi(volt.replace('V', '')),
        kw: sayi(kw), rpm: sayi(rpm), belge: k.dosya, sayfa: k.sayfa, alinti: satirMetni(r.slice(0, kodlu ? 6 : 5)) })
    }
  }
}

const uretici = new Map()
for (const k of sayfalar) for (const f of Object.values(okuyucular)) for (const u of f(k)) uretici.set(u.anahtar, u)

// ── Bizim veri
const urunler = JSON.parse(readFileSync(VERI, 'utf8')).filter(u => !u.deleted_at)
if (!urunler.length || !urunler[0].sku || !('name' in urunler[0])) {
  console.error('ÖLÇÜLEMEDİ — veri dosyasında sku/name yok (urun-veri-cek.mjs güncel mi?)'); process.exit(2)
}
const anahtarBul = ad => {
  let m = /^(NIM(?:US|AX)) (\d+) T(\d)/.exec(ad); if (m) return `${m[1]} ${m[2]} T${m[3]}`
  m = /CMS ATEX (\d+\/\d+) T(\d)/.exec(ad); if (m) return `CMS ATEX ${m[1]} T${m[2]}`
  m = /^ENKELFAN (\d+)/.exec(ad); if (m) return `ENKELFAN ${m[1]}`
  return null
}

const ALAN = {
  motor_gucu_kw: { ad: 'motor gücü', birim: 'kW' },
  debi_m3h: { ad: 'en yüksek debi', birim: 'm³/h' },
  devir_rpm: { ad: 'devir', birim: 'd/dk' },
  kod: { ad: 'üretici kodu', birim: '' },
  cekilen_guc_kw: { ad: 'güç (bizde çekilen güç, kaynakta motor gücü)', birim: 'kW' },
}
const satirlar = []
const hukum = (b, u, ayniBuyukluk, tur) => {
  if (typeof b === 'number' && typeof u === 'number' && Math.abs(b - u) <= Math.abs(u) * 0.005) return 'aynı'
  if (b === u) return 'aynı'
  return ayniBuyukluk && tur === 'üretici' ? 'üretici' : 'belirsiz'
}
const ekle = (u, alan, bizim, bizimKaynak, ur, ayniBuyukluk = true, not = '') => {
  if (bizim == null || ur.deger == null) return
  const fark = typeof bizim === 'number' ? +(ur.deger - bizim).toFixed(3) : ''
  const yuzde = typeof bizim === 'number' && bizim !== 0 ? +((ur.deger - bizim) / bizim * 100).toFixed(1) : ''
  satirlar.push({ sku: u.sku, urun: u.name, alan: ALAN[alan].ad, birim: ALAN[alan].birim, bizim_deger: bizim,
    bizim_kaynak: bizimKaynak, uretici_deger: ur.deger, fark, fark_yuzde: yuzde, kaynak_belge: ur.belge,
    kaynak_sayfa: ur.sayfa, kaynak_turu: ur.tur, alinti: ur.alinti, hukum: hukum(bizim, ur.deger, ayniBuyukluk, ur.tur),
    not, _parcalar: ur.alintiParcalari || [ur.alinti] })
}

// Web'de üretici belgesi OLMADIĞI ölçülen aileler (ingestor kaynak-dizini/edinme-2026-09-22.json
// "disarida", 2026-09-22) — "henüz okunmadı" ile karışmasın: burada okunacak belge YOK, AVenS'ten istendi.
const BELGESIZ_AILE = {
  'avens-dikdortgen-kanal-radyal': 'web\'de föy yok — AVenS\'ten istendi',
  'avens-sulu-batarya': 'web\'de föy yok — AVenS\'ten istendi',
}
// bizdeDegerYok: üretici kaynağı var ama bizde karşılaştırılacak değer YOK — fark değil BOŞLUK;
// sessizce düşmesin diye ayrı sayılır (ilk koşumda Enkelfan 9 ürün böyle kayboluyordu).
let okuyucusuz = 0, eslesmeyen = [], bizdeDegerYok = []
// Rapor için her ürünün durumu: karşılaştırıldı · kaynakta yok · bizde değer yok · okuyucu yok
const durum = new Map()
for (const u of urunler) {
  const a = anahtarBul(u.name || '')
  if (a) {
    const ur = uretici.get(a)
    if (!ur) { eslesmeyen.push(`${u.sku} ${u.name}`); durum.set(u.sku, 'kaynakta yok'); continue }
    const kaynak = { belge: ur.belge, sayfa: ur.sayfa, tur: ur.tur, alinti: ur.alinti, alintiParcalari: ur.alintiParcalari }
    ekle(u, 'motor_gucu_kw', adKw(u.name), 'ürün adı (canlı)', { ...kaynak, deger: ur.alanlar.motor_gucu_kw })
    const av = avensListe.get(a)
    if (av) {
      ekle(u, 'debi_m3h', av.debi_m3h, `AVenS fiyat listesi 2026 s.${av.sayfa}: ${av.alinti}`, { ...kaynak, deger: ur.alanlar.debi_m3h })
      // PDF çıkarımı kodun içine boşluk sokabiliyor ("ENKEC 155") — biçim farkı, kod farkı değil
      if (ur.kod) ekle(u, 'kod', av.kod.replace(/\s+/g, ''),`AVenS fiyat listesi 2026 s.${av.sayfa}`, { ...kaynak, deger: ur.kod }, false,
        'kod farkı: sürüm farkı mı yazım hatası mı — AVenS\'e sorulur')
    }
    const ts = u.technical_specs || {}
    if (ts.max_delivery_m3h != null) ekle(u, 'debi_m3h', sayi(ts.max_delivery_m3h), 'canlı teknik veri', { ...kaynak, deger: ur.alanlar.debi_m3h })
    if (ts.rpm_max != null) ekle(u, 'devir_rpm', sayi(ts.rpm_max), 'canlı teknik veri', { ...kaynak, deger: ur.alanlar.devir_rpm })
    if (!satirlar.some(r => r.sku === u.sku)) { bizdeDegerYok.push(`${u.sku} ${u.name}`); durum.set(u.sku, 'bizde değer yok') }
    continue
  }
  // STORM: üretici (SEAT) sayfasında güç YOK (ölçüldü 2026-09-22) → tek karşı kaynak AVenS listesi (distribütör)
  const s = /^STORM (\d+)( ATEX| XRM)? · (\d+) d\/dk · [\d,]+ kW · (\d+)V/.exec(u.name || '')
  if (s && u.technical_specs?.max_absorbed_power_w != null) {
    const kod = u.sku.replace(/^SEA-/, '')
    const av = avensStorm.find(r => r.kod === kod) ||
      avensStorm.find(r => !r.kod && r.model === `STORM ${s[1]}${s[2] || ''}` && r.rpm === +s[3] && r.volt === +s[4])
    if (!av) { eslesmeyen.push(`${u.sku} ${u.name}`); durum.set(u.sku, 'kaynakta yok'); continue }
    ekle(u, 'cekilen_guc_kw', u.technical_specs.max_absorbed_power_w / 1000, 'canlı teknik veri (max_absorbed_power_w)',
      { belge: av.belge, sayfa: av.sayfa, tur: 'distribütör', alinti: av.alinti, deger: av.kw }, false,
      'farklı büyüklük: bizde çekilen güç, listede motor (plaka) gücü — üretici (SEAT) sayfasında güç yok')
    continue
  }
  okuyucusuz++
  durum.set(u.sku, BELGESIZ_AILE[u.family_slug] ? 'belge yok' : 'okuyucu yok')
}

// ── KAPI: her alıntı dizindeki sayfada birebir geçmeli (kaynak yok → satır yok)
let dogrulanamayan = 0
for (const r of satirlar) {
  const metin = sayfaMetni.get(`${r.kaynak_belge}#${typeof r.kaynak_sayfa === 'number' ? r.kaynak_sayfa : 1}`) || ''
  if (!r._parcalar.every(p => metin.includes(p))) { dogrulanamayan++; console.error(`⛔ ALINTI DİZİNDE YOK: ${r.sku} ${r.alan}`) }
}
if (dogrulanamayan) { console.error(`⛔ ${dogrulanamayan} satırın alıntısı dizinde doğrulanamadı — tablo YAZILMADI`); process.exit(1) }

const KOLON = ['sku', 'urun', 'alan', 'birim', 'bizim_deger', 'bizim_kaynak', 'uretici_deger', 'fark', 'fark_yuzde',
  'kaynak_belge', 'kaynak_sayfa', 'kaynak_turu', 'alinti', 'hukum', 'not']
const hucre = v => { const t = String(v ?? '').replace(/\s+/g, ' ').trim(); return /[;"]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t }
satirlar.sort((a, b) => a.sku.localeCompare(b.sku) || a.alan.localeCompare(b.alan))
const csv = [KOLON.join(';'), ...satirlar.map(r => KOLON.map(k => hucre(r[k])).join(';'))].join('\n') + '\n'
if (CIKTI) writeFileSync(CIKTI, '﻿' + csv, 'utf8')

const say = h => satirlar.filter(r => r.hukum === h).length
console.log(`FARK TABLOSU · ${satirlar.length} satır (aynı ${say('aynı')} · üretici ${say('üretici')} · belirsiz ${say('belirsiz')})`)
console.log(`  karşılaştırılan ürün ${new Set(satirlar.map(r => r.sku)).size} · okuyucusu olan ama kaynakta bulunmayan ${eslesmeyen.length} · okuyucusu olmayan ${okuyucusuz}`)
for (const e of eslesmeyen) console.log(`    kaynakta yok: ${e}`)
console.log(`  kaynakta değer var, bizde karşılaştırılacak değer yok ${bizdeDegerYok.length}`)
for (const e of bizdeDegerYok) console.log(`    bizde yok: ${e}`)
for (const r of satirlar.filter(r => r.hukum !== 'aynı'))
  console.log(`  [${r.hukum}] ${r.sku} ${r.alan}: bizim ${r.bizim_deger} · kaynak ${r.uretici_deger} ${r.birim}`)
if (CIKTI) console.log(`CSV: ${CIKTI}`)

// ── RAPOR (Recep şartı, karar 75 ile): TÜM ürünler, marka → aile → ürün; AVenS'e gönderilebilir.
// Karşılaştırılamayan ürün de rapordadır ve NEDENİ yazılır — sessiz eksik yok.
if (RAPOR) {
  const md = t => String(t ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()
  // Dış okuyucu (AVenS) için belge adı: indirme önekleri atılır, tanınan belgeye ad verilir
  const kaynakAdi = (belge, sayfa) => {
    const ad = belge.split('/').pop()
    const fb = /flipbook__(\d+)/.exec(ad)
    if (fb) return `Casals teknik katalog, s.${fb[1]}`
    if (/avens_fiyat_listesi_2026/.test(ad)) return `AVenS fiyat listesi 2026, s.${sayfa}`
    if (/plug-fans_casals/.test(ad)) return `Casals plug-fan kataloğu, s.${sayfa}`
    return `${md(ad.replace(/^[0-9a-f]{20,}_/, '').replace(/\.pdf$/, ''))} föyü, s.${sayfa}`
  }
  const sayiYaz = v => typeof v === 'number' ? String(v).replace('.', ',') : md(v)
  const satirSku = new Map()
  for (const r of satirlar) { if (!satirSku.has(r.sku)) satirSku.set(r.sku, []); satirSku.get(r.sku).push(r) }
  const agac = new Map()
  for (const u of [...urunler].sort((a, b) => a.sku.localeCompare(b.sku))) {
    const marka = u.brand || '(marka yok)', aile = u.family_slug || '(aile yok)'
    if (!agac.has(marka)) agac.set(marka, new Map())
    if (!agac.get(marka).has(aile)) agac.get(marka).set(aile, [])
    agac.get(marka).get(aile).push(u)
  }
  const d = s => [...durum.values()].filter(x => x === s).length
  const o = []
  o.push(`# Ürün verisi fark raporu — ${TARIH}`, '')
  o.push('Bu rapor katalogdaki her ürünü üreticinin belgesiyle karşılaştırır. Her değer, üretici belgesinin',
    'ilgili sayfasından okunmuştur; sayfa ve kaynak satırı her karşılaştırmada yazılıdır. Karşılaştırılamayan',
    'ürünler de listelenir ve nedeni belirtilir.', '')
  o.push('## Özet', '', '| | Sayı |', '|---|---|')
  o.push(`| Katalogdaki ürün | ${urunler.length} |`, `| Karşılaştırılan ürün | ${satirSku.size} |`,
    `| Karşılaştırılan değer | ${satirlar.length} |`, `| — aynı | ${say('aynı')} |`,
    `| — üretici değeri alınmalı | ${say('üretici')} |`, `| — belirsiz (teyit gerekiyor) | ${say('belirsiz')} |`,
    `| Üretici belgesi bulunamayan ürün | ${d('kaynakta yok') + d('belge yok')} |`,
    `| Belge var, bizde karşılaştırılacak değer yok | ${d('bizde değer yok')} |`,
    `| Belgesi henüz okunmamış ürün | ${d('okuyucu yok')} |`, '')
  o.push('**Hüküm:** *aynı* — fark yok (%0,5 tolerans) · *üretici* — aynı büyüklük, üretici belgesi farklı diyor;',
    'üreticinin değeri esas alınır · *belirsiz* — iki taraf farklı büyüklük ölçüyor, kaynak üretici değil ya da',
    'ürün kodu farklı; teyit gerekir.', '')
  for (const [marka, aileler] of [...agac].sort((a, b) => a[0].localeCompare(b[0]))) {
    const n = [...aileler.values()].reduce((s, l) => s + l.length, 0)
    o.push(`## ${md(marka)} (${n} ürün)`, '')
    for (const [aile, liste] of [...aileler].sort((a, b) => a[0].localeCompare(b[0]))) {
      const kars = liste.filter(u => satirSku.has(u.sku))
      o.push(`### ${md(aile)} — ${liste.length} ürün`, '')
      if (kars.length) {
        o.push('| Ürün | Alan | Bizim değer | Üretici | Fark | Kaynak | Hüküm |', '|---|---|---|---|---|---|---|')
        for (const u of kars) for (const r of satirSku.get(u.sku)) {
          const fark = r.fark === '' ? '—' : `${sayiYaz(r.fark)}${r.fark_yuzde !== '' ? ` (%${sayiYaz(r.fark_yuzde)})` : ''}`
          const kaynak = kaynakAdi(r.kaynak_belge, r.kaynak_sayfa)
          o.push(`| ${md(u.sku)} ${md(u.name)} | ${md(r.alan)} | ${sayiYaz(r.bizim_deger)} ${md(r.birim)} | ${sayiYaz(r.uretici_deger)} ${md(r.birim)} | ${fark} | ${kaynak} | **${r.hukum}** |`)
        }
        o.push('')
      }
      const kalan = liste.filter(u => !satirSku.has(u.sku))
      if (kalan.length) {
        const gruplar = new Map()
        for (const u of kalan) { const s = durum.get(u.sku) || 'okuyucu yok'; if (!gruplar.has(s)) gruplar.set(s, []); gruplar.get(s).push(u) }
        const neden = { 'kaynakta yok': 'üretici belgesi bulunamadı', 'bizde değer yok': 'belge var, bizde karşılaştırılacak değer yok',
          'okuyucu yok': 'belgesi henüz okunmadı', 'belge yok': BELGESIZ_AILE[aile] || 'üretici belgesi yok' }
        for (const [s, us] of gruplar) o.push(`- ${neden[s] || s} (${us.length}): ${us.map(u => `${md(u.sku)} ${md(u.name)}`).join(' · ')}`)
        o.push('')
      }
    }
  }
  writeFileSync(RAPOR, o.join('\n'), 'utf8')
  console.log(`RAPOR: ${RAPOR}`)
}
