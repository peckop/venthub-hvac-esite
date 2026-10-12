#!/usr/bin/env node
/**
 * SAHİPSİZ PR KAPISI (ARC-111, OPS-120 madde 3) — salt okuma.
 *
 * NİÇİN VAR (12 Ekim 2026, ölçüldü): #1670 9 gün, #1446 15 gün, #1345 19 gün açık bekledi ve
 * kimse sahibi değildi. PR yaşını ölçen ya da PR'ı Kanban kartıyla eşleyen bileşen YOKTU:
 * ritüel (merge-ritueli.cjs) tek PR'a bakar, durum satırı PR'a hiç bakmaz.
 *
 * TANIM — bir açık PR "sahipsiz"dir, şu üçü birden doğruysa:
 *   1. yaşı ≥ ESIK_GUN (7 gün; oluşturulma anından, güncelleme anı yaşı tazelemez),
 *   2. kart durumu yok: gövdede/başlıkta `Kanban: <NO>` satırı YOK  ya da  o numaralı kartın
 *      HEPSİ kapalı (Done)  ya da  numara Kanban'da bulunamıyor,
 *   3. muaf değil: gövdede `bekle: <YYYY-MM-DD> <engel>` etiketi yok ya da tarihi geçmiş.
 *
 * FAIL-OPEN, ÖLÇMEDEN SUSMAZ: Kanban dışa aktarımı okunamazsa yalnız `Kanban:` satırı olmayan
 * PR'lar sahipsiz sayılır ve sonuç `kartlarOlculemedi: true` taşır (kart durumu varsayılmaz).
 *
 * Numara tekil DEĞİL (aynı numara birden fazla kartta geçer, 9 Ekim ölçümü): kapalı sayılması
 * için o numaralı TÜM kartlar Done olmalı; biri açıksa PR sahipli sayılır.
 *
 * KULLANIM
 *   node scripts/hijyen/sahipsiz-pr.cjs [--json] [--onbellek <pano-dizini>]
 *   --onbellek: sonucu `<pano>/.sahipsiz-pr-onbellek.json` olarak yazar (durum satırı ve kokpit
 *               bu dosyayı okur; veri dosyası depo DIŞINDADIR).
 * ÇIKIŞ: 0 = ölçüm tamam (sahipsiz olsa da), 2 = ölçüm yapılamadı.
 */
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { execFile } = require('node:child_process')
const { promisify } = require('node:util')

const execFileAsync = promisify(execFile)

const DEPO = 'peckop/venthub-hvac-esite'
const ESIK_GUN = 7
const GUN_MS = 86400000
const ONBELLEK_ADI = '.sahipsiz-pr-onbellek.json'
const BEKLE_KALIBI = /^[ \t>*_-]*bekle[ \t]*:[ \t]*(\d{4}-\d{2}-\d{2})[ \t]+(\S[^\n]*)$/im

/** PR gövdesi + başlığındaki Kanban numaraları (kapı ile AYNI ayrıştırıcı: ikinci okuyucu yok). */
function kartNumaralari(pr) {
  const kapi = require(path.join(__dirname, '..', 'board', 'pr-kayit-kapisi.cjs'))
  const metin = kapi.govdeyiTemizle(String((pr && pr.body) || ''))
  const hepsi = new Set(kapi.kanbanNumaralari(metin))
  // Başlıkta numara varsa "Kanban:" yazılmamış olsa da sahibi sayılır (kapı gövdeyi ister, burası yaşı ölçer).
  for (const n of String((pr && pr.title) || '').match(/\b[A-Z]{2,4}-\d+\b/g) || []) hepsi.add(n)
  return [...hepsi]
}

/** `bekle: 2026-10-20 engel metni` → muaf mı? Tarih geçmişse ya da engel metni yoksa muaf DEĞİL. */
function bekleMuaf(govde, simdi) {
  const m = BEKLE_KALIBI.exec(String(govde || ''))
  if (!m) return false
  const t = Date.parse(m[1] + 'T23:59:59Z')
  return Number.isFinite(t) && t >= simdi
}

/**
 * Saf karar. girdi: { prler: [{number,title,body,created_at,draft}], kartlar: Map<no, string[]>|null,
 * simdi, esikGun }. kartlar null ise kart durumu ÖLÇÜLEMEDİ (yalnız kartsız PR'lar sahipsiz sayılır).
 */
function degerlendir({ prler, kartlar, simdi = Date.now(), esikGun = ESIK_GUN }) {
  const sahipsiz = []
  for (const pr of Array.isArray(prler) ? prler : []) {
    const olusturma = Date.parse(pr.created_at)
    if (!Number.isFinite(olusturma)) continue // yaşı bilinmeyen PR'a sahipsiz damgası vurulmaz
    const yas = Math.floor((simdi - olusturma) / GUN_MS)
    if (yas < esikGun) continue
    if (bekleMuaf(pr.body, simdi)) continue
    const numaralar = kartNumaralari(pr)
    let sebep = null
    if (numaralar.length === 0) {
      sebep = 'kartsiz'
    } else if (kartlar) {
      const durumlar = numaralar.map((n) => kartlar.get(n) || null)
      const acikVar = durumlar.some((d) => d && d.some((s) => s !== 'Done'))
      if (!acikVar) sebep = durumlar.every((d) => d === null) ? 'kart-bulunamadi' : 'kart-kapali'
    }
    if (sebep) sahipsiz.push({ no: pr.number, yas, sebep, kart: numaralar })
  }
  sahipsiz.sort((a, b) => b.yas - a.yas || a.no - b.no)
  return { sahipsiz, esikGun, kartlarOlculemedi: kartlar === null }
}

/** Kanban dışa aktarımı (kayitlar[]) → Map<numara, durum[]>. */
function kartHaritasi(kayitlar) {
  const harita = new Map()
  for (const k of Array.isArray(kayitlar) ? kayitlar : []) {
    const no = String(k && k.identifier || '')
    if (!no) continue
    if (!harita.has(no)) harita.set(no, [])
    harita.get(no).push(String(k.status || ''))
  }
  return harita
}

const PYTHON_ADAYLARI = ['python', 'python3', 'py']

async function pythonKos(betik, ms) {
  let son
  for (const py of PYTHON_ADAYLARI) {
    try {
      const r = await execFileAsync(py, [betik], { timeout: ms, maxBuffer: 64 * 1024 * 1024, windowsHide: true, encoding: 'utf8' })
      return r.stdout
    } catch (e) {
      if (e && e.code === 'ENOENT') {
        son = e
        continue
      }
      throw e
    }
  }
  throw son || new Error('python bulunamadi')
}

async function acikPrler(ms = 20000) {
  const r = await execFileAsync('gh', ['api', `repos/${DEPO}/pulls?state=open&per_page=100`], {
    timeout: ms, maxBuffer: 64 * 1024 * 1024, windowsHide: true, encoding: 'utf8',
  })
  const v = JSON.parse(r.stdout)
  if (!Array.isArray(v)) throw new Error('beklenmeyen yanit')
  return v
}

async function olc({ simdi = Date.now(), kok = path.join(__dirname, '..', '..') } = {}) {
  const prler = await acikPrler()
  let kartlar = null
  try {
    const cikti = await pythonKos(path.join(kok, 'scripts', 'nlm', 'kanban_disa_aktar.py'), 20000)
    kartlar = kartHaritasi(JSON.parse(cikti).kayitlar)
  } catch {
    kartlar = null // kart durumu ölçülemedi: varsayılmaz, sonuç bunu taşır
  }
  const s = degerlendir({ prler, kartlar, simdi })
  return { ...s, acikPrSayisi: prler.length, olculdu: new Date(simdi).toISOString() }
}

function onbellekYaz(pano, sonuc) {
  fs.mkdirSync(pano, { recursive: true })
  const yol = path.join(pano, ONBELLEK_ADI)
  const gecici = yol + '.' + process.pid + '.tmp'
  fs.writeFileSync(gecici, JSON.stringify(sonuc))
  fs.renameSync(gecici, yol)
  return yol
}

module.exports = {
  degerlendir, kartNumaralari, bekleMuaf, kartHaritasi, olc, onbellekYaz,
  ESIK_GUN, ONBELLEK_ADI, DEPO,
}

if (require.main === module) {
  const argv = process.argv.slice(2)
  const i = argv.indexOf('--onbellek')
  const pano = i >= 0 ? argv[i + 1] : null
  olc().then((s) => {
    if (pano) onbellekYaz(pano, s)
    if (argv.includes('--json')) {
      process.stdout.write(JSON.stringify(s, null, 2) + '\n')
    } else {
      process.stdout.write(
        `SAHIPSIZ PR: ${s.sahipsiz.length} (esik ${s.esikGun} gun, ${s.acikPrSayisi} acik PR)` +
          (s.kartlarOlculemedi ? ' · kart durumu OLCULEMEDI (yalniz kartsizlar sayildi)' : '') + '\n',
      )
      for (const p of s.sahipsiz) {
        process.stdout.write(`  #${p.no} · ${p.yas} gun · ${p.sebep}${p.kart.length ? ' · ' + p.kart.join(',') : ''}\n`)
      }
    }
    process.exit(0)
  }).catch((e) => {
    process.stderr.write('sahipsiz-pr: OLCULEMEDI — ' + String((e && e.message) || e).split('\n')[0].slice(0, 160) + '\n')
    process.exit(2)
  })
}
