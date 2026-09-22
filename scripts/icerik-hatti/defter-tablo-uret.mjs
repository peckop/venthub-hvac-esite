#!/usr/bin/env node
/**
 * DEFTER TABLO ÜRETİMİ — aile başına kaynak-kısıtlı data-table (OPS kararı 2026-09-10 07:05Z)
 *
 * ── NİÇİN VAR
 * Aile başına TEK defter çağrısı, o ailenin ürün kodlarını ve alan çatısını CSV olarak
 * getirir (pilotta 62 sn / 20-20 ürün / 21-21 kod). Kodlar kaynak diziniyle eşlenince
 * **deterministik kanıt** zinciri kurulur: defter kodu söyler, dizin satırı doğrular.
 *
 * ── ⛔`-s` KAYNAK KISITI ZORUNLU
 * Kısıtsız çağrıda defter yanlış aileye kayıyor (OPS ölçtü: "JET" sorusuna Vortice VORT
 * JET-A cevabı geldi). Kısıt DOĞRU EVRENİ seçer. Kaynak listesi uydurulmaz — paketteki
 * `belgeler.csv`'nin aile↔belge bağından gelir; bağı olmayan aileye çağrı YAPILMAZ.
 *
 * ── ⛔ARALIK HÜCRE ÜRÜN DEĞERİ SAYILMAZ
 * Defter, kaynakta tek sayı bulamadığında aralık üretir ("2,10 - 4,33"). Bu ürünün değeri
 * değil, AİLENİN aralığıdır. Sayılır ama `aile_araligi` olarak; kesin değer YALNIZ dizin
 * satırından okunur. Dolu görünen hücre, boş hücreden tehlikelidir — boş hücre kendini
 * bildirir, aralık kesin sayı gibi okunur.
 *
 * KOŞUM: node scripts/icerik-hatti/defter-tablo-uret.mjs --paket=<paket> [--tavan=5] [--aile=<ad>]
 * Çıkış: 0 geçti · 2 ÖLÇÜLEMEDİ (fail-closed). Canlı DB'ye DOKUNMAZ.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'

const arg = (ad, vars) => process.argv.find(a => a.startsWith(`--${ad}=`))?.slice(ad.length + 3) || vars
const PAKET = arg('paket', '')
const TAVAN = Number(arg('tavan', '0')) || 0
const TEK_AILE = arg('aile', '')
const DEFTER = arg('defter', '8bb600d9-4342-4a74-88f5-e4e47dbeebc9')
if (!PAKET) { console.error('ÖLÇÜLEMEDİ — --paket=<yol> zorunlu'); process.exit(2) }

const CIKTI = join(PAKET, 'defter-tablolari')
mkdirSync(CIKTI, { recursive: true })

const csvOku = (yol, ayirici) => {
  const ham = readFileSync(yol, 'utf8').replace(/^﻿/, '')
  const satirlar = []
  let hucre = '', satir = [], tirnak = false
  for (let i = 0; i < ham.length; i++) {
    const c = ham[i]
    if (tirnak) {
      if (c === '"' && ham[i + 1] === '"') { hucre += '"'; i++ }
      else if (c === '"') tirnak = false
      else hucre += c
    } else if (c === '"') tirnak = true
    else if (c === ayirici) { satir.push(hucre); hucre = '' }
    else if (c === '\n') { satir.push(hucre); satirlar.push(satir); satir = []; hucre = '' }
    else if (c !== '\r') hucre += c
  }
  if (hucre || satir.length) { satir.push(hucre); satirlar.push(satir) }
  const bas = satirlar.shift()
  return satirlar.filter(s => s.some(v => v !== ''))
    .map(s => Object.fromEntries(bas.map((b, i) => [b, s[i] ?? ''])))
}

// ── kaynak adı → defter kaynak id
let kaynakId = new Map()
try {
  const ham = execFileSync('notebooklm', ['source', 'list', '-n', DEFTER, '--json'],
    { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 })
  const d = JSON.parse(ham)
  // ⛔YALNIZ `ready` KAYNAK: defterde `error` durumundaki kaynağı `-s` ile vermek RPC'yi
  // reddettiriyor (ölçüldü 2026-09-10: rpc_code=3, "invalid argument"). Daha kötüsü, o
  // kaynak defter için OKUNMAMIŞ demektir — defter onun içeriğini "yok" sayar. Durumu
  // ölçmeden kaynak seçmek, defterin körlüğünü bizim hükmümüze taşır.
  let hatali = 0
  for (const s of (Array.isArray(d) ? d : d.sources || d.data || [])) {
    if (!s.id || !(s.title || s.name)) continue
    if (s.status && s.status !== 'ready') { hatali++; continue }
    kaynakId.set(String(s.title || s.name), s.id)
  }
  if (hatali) console.log(`⚠${hatali} kaynak defterde 'ready' DEĞİL — atlandı (defter onları OKUYAMADI)`)
} catch (e) {
  console.error(`ÖLÇÜLEMEDİ — defter kaynak listesi alınamadı: ${e.message}`)
  process.exit(2)
}
console.log(`defter kaynağı: ${kaynakId.size}`)

// ── aile → kaynak id'leri (belgeler.csv'nin aile↔belge bağından; UYDURULMAZ)
const belgeler = csvOku(join(PAKET, 'belgeler.csv'), ';')
const urunler = csvOku(join(PAKET, 'urunler.csv'), ';')
const aileKaynak = new Map()
for (const b of belgeler) {
  if (!b.aile) continue
  const id = kaynakId.get(b.dosya_adi)
  if (!id) continue
  if (!aileKaynak.has(b.aile)) aileKaynak.set(b.aile, new Set())
  aileKaynak.get(b.aile).add(id)
}
const aileUrun = new Map()
for (const u of urunler) {
  if (!u.aile) continue
  if (!aileUrun.has(u.aile)) aileUrun.set(u.aile, [])
  aileUrun.get(u.aile).push(u)
}

// ── dizin: kod doğrulaması için (kesin kanıt burada, defterde değil)
const INGESTOR = process.env.VENTHUB_INGESTOR
if (!INGESTOR) { console.error('ÖLÇÜLEMEDİ — VENTHUB_INGESTOR yok'); process.exit(2) }
const dizinMetin = []
for (const s of readFileSync(join(INGESTOR, 'kaynak-dizini', 'sayfalar.jsonl'), 'utf8').split('\n')) {
  if (!s.trim()) continue
  const k = JSON.parse(s)
  dizinMetin.push((k.metin || '') + JSON.stringify(k.tablo || []))
}
const kacis = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const dizindeVar = (kod) => {
  const re = new RegExp(`(?<![\\w-])${kacis(kod)}(?![\\w-])`)
  return dizinMetin.some(m => re.test(m))
}
const ARALIK = /\d\s*[-–/]\s*\d/
// ⛔"KAYNAKTA YOK" BİR DEĞER DEĞİLDİR — ölçüldü ve düzeltildi (2026-09-10).
// Defter, bulamadığı hücreye "Kaynağında yok" yazıyor (dürüst davranış). İlk ölçümüm o
// metni aralık deseni taşımadığı için KESİN DEĞER saydı: JET ailesinde "141 kesin değer"
// raporlandı, oysa hücrelerin neredeyse tamamı YOKLUK BEYANIYDI. Doluluğu sayarken
// "bulunamadı" cevabını veri saymak, en kötü türden sahte doluluktur.
const YOKLUK = /^(kayna[gğ]|source)|yok$|bulunamad|not (found|available)|^n\/?a$|^-+$/i
const doluMu = (v) => {
  const s = String(v || '').trim()
  return s !== '' && !YOKLUK.test(s)
}

const hedefler = [...aileKaynak.keys()]
  .filter(a => !TEK_AILE || a === TEK_AILE)
  .filter(a => (aileUrun.get(a) || []).length > 0)
  .sort((x, y) => (aileUrun.get(y).length) - (aileUrun.get(x).length))

console.log(`hedef aile: ${hedefler.length}${TAVAN ? ` (tavan ${TAVAN})` : ''}\n`)

const ozet = []
let sayac = 0
for (const aile of hedefler) {
  if (TAVAN && sayac >= TAVAN) break
  const dosyaAd = aile.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 60)
  const hedefCsv = join(CIKTI, `${dosyaAd}.csv`)
  // Zaten indirilmiş aile YENİDEN SORULMAZ (çağrı yavaş ve kotalı) ama ÖLÇÜLÜR:
  // ölçüt değişince eski dosyaları yeniden indirmek gerekmesin diye. İlk yazımda
  // burada `continue` vardı ve özet, düzeltilmiş ölçütle güncellenemiyordu.
  const zatenVar = existsSync(hedefCsv)

  const kaynaklar = zatenVar ? [] : [...aileKaynak.get(aile)]
  const soru = `"${aile}" ailesindeki TUM modeller: model adi, kod, hava debisi m3/h, ` +
    'statik basinc Pa, guc kW, gerilim V, faz, devir rpm, agirlik kg, IP sinifi. ' +
    'Her deger icin kaynak belge ve sayfa. Kaynakta olmayan degeri BOS birak, tahmin etme.'
  const bayraklar = ['generate', 'data-table', '-n', DEFTER]
  for (const k of kaynaklar) bayraklar.push('-s', k)
  bayraklar.push('--wait', '--timeout', '400', '--json', soru)

  const t0 = Date.now()
  try {
    if (!zatenVar) execFileSync('notebooklm', bayraklar, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, timeout: 450000 })
  } catch (e) {
    const m = String(e.message || e)
    // 429 = kota. Sessizce devam etmek, kalan aileleri de yakar; DURULUR ve sebep YAZILIR.
    // ⛔DESEN ÖLÇÜLDÜ, VARSAYILMADI: ilk yazımda `rate limit` (boşluklu) arıyordum; CLI'nin
    // gerçek metni `RateLimitError` (BOŞLUKSUZ). Kapı hiç tutmadı ve kota vurduktan sonra
    // 20 aile daha boşuna denendi — her biri "hata" olarak kaydedildi, yani kotaya takılan
    // aileler kalıcı başarısız gibi göründü. Boşluk opsiyonel: `rate.?limit`.
    if (/429|rate.?limit|quota|too many requests/i.test(m)) {
      console.error(`\n⛔KOTA (429) — ${aile} çağrısında durduruldu. ${sayac} aile tamamlandı.`)
      break
    }
    console.error(`  ⛔HATA ${aile}: ${m.slice(0, 160)}`)
    ozet.push({ aile, satir: 0, kod_eslesen: 0, kesin: 0, aralik: 0, not: 'cagri HATASI' })
    sayac++
    continue
  }

  // İndirme: son artefakt geçici dizine iner, tek dosya olarak yeniden adlandırılır.
  const gecici = join(CIKTI, '_indir')
  if (zatenVar) { /* dosya elde — indirme atlanır, ölçüme geçilir */ } else {
  rmSync(gecici, { recursive: true, force: true })
  mkdirSync(gecici, { recursive: true })
  try {
    execFileSync('notebooklm', ['download', 'data-table', '-n', DEFTER, gecici],
      { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, timeout: 120000 })
  } catch (e) {
    console.error(`  ⛔İNDİRME HATASI ${aile}: ${String(e.message).slice(0, 120)}`)
    ozet.push({ aile, satir: 0, kod_eslesen: 0, kesin: 0, aralik: 0, not: 'indirme HATASI' })
    sayac++
    continue
  }
  // İndirilen ad öngörülemez (CLI "<dizin> (2)" gibi adlar üretebiliyor): DOSYAYI BUL, VARSAYMA.
  const adaylar = [...readdirSync(CIKTI).filter(f => f.startsWith('_indir')).map(f => join(CIKTI, f))]
  let indirilen = null
  for (const a of adaylar) {
    try {
      const ic = readFileSync(a, 'utf8')
      if (ic.includes(',')) { indirilen = a; break }
    } catch { /* dizin ise atla */ }
  }
  if (!indirilen) {
    const ic = readdirSync(gecici).map(f => join(gecici, f)).filter(f => f.endsWith('.csv'))
    indirilen = ic[0] || null
  }
  if (!indirilen) {
    console.error(`  ⛔CSV BULUNAMADI ${aile}`)
    ozet.push({ aile, satir: 0, kod_eslesen: 0, kesin: 0, aralik: 0, not: 'CSV bulunamadi' })
    sayac++
    continue
  }
  renameSync(indirilen, hedefCsv)
  rmSync(gecici, { recursive: true, force: true })
  }

  // ── ÖLÇÜM: kod dizinde var mı · hücre kesin mi aralık mı
  const satirlar = csvOku(hedefCsv, ',')
  const kodKolon = Object.keys(satirlar[0] || {}).find(k => /kod|code/i.test(k)) || 'kod'
  const kodlar = satirlar.map(r => String(r[kodKolon] || '').trim()).filter(doluMu)
  const eslesen = kodlar.filter(k => dizindeVar(k)).length
  let kesin = 0, aralik = 0, yokluk = 0
  const olcuKolon = Object.keys(satirlar[0] || {})
    .filter(k => /debi|basinc|guc|gerilim|devir|agirlik|ip/i.test(k))
  for (const r of satirlar) {
    for (const k of olcuKolon) {
      const v = String(r[k] || '').trim()
      if (!v) continue
      if (!doluMu(v)) { yokluk++; continue }   // "Kaynağında yok" = veri DEĞİL
      if (ARALIK.test(v)) aralik++; else kesin++
    }
  }
  const sn = Math.round((Date.now() - t0) / 1000)
  ozet.push({ aile, satir: satirlar.length, kod_eslesen: `${eslesen}/${kodlar.length || satirlar.length}`,
    kesin, aralik, yokluk, not: `${sn} sn` })
  console.log(`✓ ${aile} — ${satirlar.length} satır · kod ${eslesen}/${kodlar.length || satirlar.length} dizinde · kesin ${kesin} / ARALIK ${aralik} / "yok" ${yokluk} · ${sn} sn`)
  sayac++
  if (sayac % 5 === 0) console.log(`   … ${sayac} aile tamamlandı`)
}

// ── ÖZET
const BOM = '﻿'
const BAS = ['aile', 'satir', 'kod_eslesen', 'kesin', 'aralik', 'yokluk', 'not']
const hucre = (v) => {
  const s = String(v ?? '').replace(/\r?\n/g, ' ').trim()
  return (s.includes(';') || s.includes('"')) ? '"' + s.replace(/"/g, '""') + '"' : s
}
writeFileSync(join(CIKTI, '_ozet.csv'),
  BOM + [BAS.join(';'), ...ozet.map(r => BAS.map(b => hucre(r[b])).join(';'))].join('\r\n') + '\r\n', 'utf8')

const t = ozet.reduce((a, r) => ({ satir: a.satir + r.satir, kesin: a.kesin + (r.kesin || 0),
  aralik: a.aralik + (r.aralik || 0), yokluk: a.yokluk + (r.yokluk || 0) }),
  { satir: 0, kesin: 0, aralik: 0, yokluk: 0 })
console.log(`\nÖZET: ${ozet.length} aile · ${t.satir} satır · kesin ${t.kesin} / ARALIK ${t.aralik} / "kaynakta yok" ${t.yokluk}`)
console.log(`  → ${CIKTI}/_ozet.csv`)
console.log('⛔ARALIK hücre ürün değeri SAYILMAZ — aile aralığıdır; kesin değer yalnız dizin satırından.')
