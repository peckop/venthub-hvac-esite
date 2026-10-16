#!/usr/bin/env node
'use strict'
/**
 * KANBAN KURAL UYUM ÖLÇÜMÜ — ARC-153 (OPS 16 Ekim, Recep isteği: "kural uyumu kokpitte yazılımla ölçülsün").
 *
 * NE ÖLÇER (pano başına, son 7 gün; hepsi SALT-OKUMA):
 *   · açılan kartların KAYNAK/CETVEL, YÖNTEM ve ÖNCEKİ ÇALIŞMA satırı oranı (.claude/rules/filo-ortak.md "İş ve kart");
 *   · açılan kartların kanıt komutu oranı (successCriteria içinde manual OLMAYAN en az bir kontrol);
 *   · Done'a giren kartların verify_completion `passed` raporu taşıma oranı (kanit-muaf / karar-verildi etiketli kart paydadan düşer);
 *   · In Progress / Review'da 5+ gündür hareketsiz kartlar.
 * KIRMIZI: oran eşiğin altındaysa VE örneklem en az EN_AZ_ORNEK ise (3 kartlık pano kırmızı üretmesin). Eşik departman başına:
 * ESIK_DEPARTMAN; satırı olmayan departman ESIK_VARSAYILAN kullanır (şimdilik hepsi aynı; ayrım gerekince buraya yazılır).
 *
 * KAYNAK: ana deponun `.wrongstack/kanbans/_kanban.sqlite` dosyası, node:sqlite `readOnly` (kanban-anlik.cjs ile AYNI okuma yolu).
 * ASLA YAZMAZ. Türkçe harf: dosya UTF-8 okunur, JSON çıktısı UTF-8 stdout'a yazılır (konsol kod sayfası sorunu ölçüm hatası DEĞİLDİR;
 * ARC-148: depoda U+FFFD yok, bozuk görünüm konsolun cp1254 yazdırmasındandı).
 *
 * KULLANIM: node scripts/board/kanban-uyum.cjs [--json | --metin] [--pano <ad parçası>] [--gun N] [--db <sqlite>]
 * Çıktı varsayılan JSON: { uretildi, gun, panolar: [{ ad, acilan, oranlar, done, hareketsiz, kirmizi }] }; hata: { hata: '<sebep>' } çıkış 1.
 */
const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const GUN_MS = 24 * 60 * 60 * 1000
const EN_AZ_ORNEK = 3
const HAREKETSIZ_GUN = 5
const MUAF_PANO = /^(Linear Bekleyenler|DENEME)/i
const MUAF_ETIKET = new Set(['kanit-muaf', 'karar-verildi'])
const IZLENEN_SUTUN = new Set(['in-progress', 'review'])

const ESIK_VARSAYILAN = { kaynakCetvel: 0.8, yontem: 0.6, oncekiCalisma: 0.6, kanitKomutu: 0.8, doneVerify: 0.8 }
/** Departman (pano adı) bazında ezme; satırı olmayan ESIK_VARSAYILAN kullanır. Anahtar: büyük harf, Türkçesiz (ARAC, OPS, URUN…). */
const ESIK_DEPARTMAN = {}

const DESEN = {
  kaynakCetvel: /KAYNAK\s*\/?\s*CETVEL|KAYNAK\s*:/,
  yontem: /Y[ÖO]NTEM\s*:/,
  oncekiCalisma: /[ÖO]NCEK[İI]\s+[ÇC]AL[İI][ŞS]MA\s*:/,
}

/** "VentHub ARAÇ" → "ARAC" (departman anahtarı). */
function departmanAnahtari(panoAdi) {
  const son = String(panoAdi || '').trim().split(/\s+/).pop() || ''
  return son.toLocaleUpperCase('tr').replace(/Ç/g, 'C').replace(/Ğ/g, 'G').replace(/İ/g, 'I').replace(/Ö/g, 'O').replace(/Ş/g, 'S').replace(/Ü/g, 'U')
}

function esikler(panoAdi) {
  return { ...ESIK_VARSAYILAN, ...(ESIK_DEPARTMAN[departmanAnahtari(panoAdi)] || {}) }
}

function kartNo(baslik) {
  const m = /^\s*([A-Za-zÇĞİÖŞÜçğıöşü]{2,6}-\d{1,5})(?!\d)/.exec(String(baslik || ''))
  return m ? m[1].toUpperCase() : String(baslik || '').slice(0, 24)
}

const etiketler = (t) => (Array.isArray(t.labels) ? t.labels : []).map((e) => String(typeof e === 'string' ? e : (e && e.name) || '').toLowerCase())
const zaman = (v) => {
  const n = Date.parse(String(v || ''))
  return Number.isFinite(n) ? n : NaN
}
const oran = (pay, payda) => (payda > 0 ? Math.round((pay / payda) * 1000) / 1000 : null)
const yuzde = (o) => Math.round(o * 100) + '%'

/** Açıklama büyük harfe (tr) çevrilip desenlenir: küçük harf ve ASCII yazım tolere edilir. */
function satirVarMi(kart, ad) {
  return DESEN[ad].test(String(kart.description || '').toLocaleUpperCase('tr'))
}

function kanitKomutuVarMi(kart) {
  return (Array.isArray(kart.successCriteria) ? kart.successCriteria : []).some((c) => c && c.type && c.type !== 'manual')
}

/**
 * SAF çekirdek. @param panolar kanban_boards payload nesneleri. @returns panolar[] (muaf panolar atlanır).
 */
function uyumHesapla(panolar, simdiMs, secenek = {}) {
  const gun = Number.isFinite(secenek.gun) && secenek.gun > 0 ? secenek.gun : 7
  const bas = simdiMs - gun * GUN_MS
  const sonuc = []
  for (const pano of panolar) {
    if (!pano || MUAF_PANO.test(String(pano.title || ''))) continue
    const kartlar = (Array.isArray(pano.tasks) ? pano.tasks : []).filter((t) => t && t.status !== 'archived' && t.archived !== true)
    const esik = esikler(pano.title)

    const acilan = kartlar.filter((t) => zaman(t.createdAt) >= bas)
    const sayim = { kaynakCetvel: 0, yontem: 0, oncekiCalisma: 0, kanitKomutu: 0 }
    for (const t of acilan) {
      for (const ad of ['kaynakCetvel', 'yontem', 'oncekiCalisma']) if (satirVarMi(t, ad)) sayim[ad]++
      if (kanitKomutuVarMi(t)) sayim.kanitKomutu++
    }
    const oranlar = {}
    for (const ad of Object.keys(sayim)) oranlar[ad] = oran(sayim[ad], acilan.length)

    const done = kartlar.filter((t) => t.columnId === 'done' && zaman(t.completedAt || t.updatedAt) >= bas && !etiketler(t).some((e) => MUAF_ETIKET.has(e)))
    const verifyli = done.filter((t) => t.verificationReport && t.verificationReport.verdict === 'passed')
    const doneOran = oran(verifyli.length, done.length)

    const hareketsiz = kartlar.filter((t) => IZLENEN_SUTUN.has(t.columnId) && simdiMs - zaman(t.updatedAt) >= HAREKETSIZ_GUN * GUN_MS)

    const kirmizi = []
    for (const ad of Object.keys(sayim)) {
      if (acilan.length >= EN_AZ_ORNEK && oranlar[ad] < esik[ad]) kirmizi.push(`${ad} ${yuzde(oranlar[ad])} (eşik ${yuzde(esik[ad])}, ${acilan.length} kart)`)
    }
    if (done.length >= EN_AZ_ORNEK && doneOran < esik.doneVerify) kirmizi.push(`doneVerify ${yuzde(doneOran)} (eşik ${yuzde(esik.doneVerify)}, ${done.length} kart)`)
    if (hareketsiz.length > 0) kirmizi.push(`hareketsiz ${hareketsiz.length} kart (${HAREKETSIZ_GUN}+ gün)`)

    sonuc.push({
      ad: pano.title,
      departman: departmanAnahtari(pano.title),
      acilan: acilan.length,
      oranlar,
      done: { n: done.length, verifyli: verifyli.length, oran: doneOran },
      hareketsiz: { n: hareketsiz.length, kartlar: hareketsiz.slice(0, 10).map((t) => kartNo(t.title)) },
      kirmizi,
    })
  }
  return sonuc
}

// ── Okuma (kanban-anlik.cjs ile aynı yol) ───────────────────────────────────

function panoDosyasi(db) {
  if (db) return db
  if (process.env.VENTHUB_KANBAN_DB) return process.env.VENTHUB_KANBAN_DB
  const depo = path.resolve(__dirname, '..', '..')
  let kok = depo
  try {
    const r = spawnSync('git', ['-C', depo, 'rev-parse', '--path-format=absolute', '--git-common-dir'], { encoding: 'utf8', timeout: 5000 })
    if (r.status === 0 && r.stdout.trim() !== '') kok = path.dirname(r.stdout.trim())
  } catch {
    /* git yok: betiğin deposu */
  }
  return path.join(kok, '.wrongstack', 'kanbans', '_kanban.sqlite')
}

function panolariOku(yol) {
  if (!fs.existsSync(yol)) throw new Error('pano dosyası yok')
  process.removeAllListeners('warning')
  const { DatabaseSync } = require('node:sqlite')
  const db = new DatabaseSync(yol, { readOnly: true })
  try {
    db.exec('PRAGMA busy_timeout = 3000')
    return db.prepare('select payload from kanban_boards').all().map((s) => JSON.parse(s.payload))
  } finally {
    db.close()
  }
}

function metinTablosu(panolar) {
  const sat = ['pano | açılan | KAYNAK | YÖNTEM | ÖNCEKİ | kanıt | Done verify | hareketsiz | kırmızı']
  const y = (o) => (o === null ? '-' : yuzde(o))
  for (const p of panolar) {
    sat.push([p.ad, p.acilan, y(p.oranlar.kaynakCetvel), y(p.oranlar.yontem), y(p.oranlar.oncekiCalisma), y(p.oranlar.kanitKomutu), `${p.done.verifyli}/${p.done.n}`, p.hareketsiz.n, p.kirmizi.length].join(' | '))
  }
  return sat.join('\n')
}

function argumanlar(argv) {
  const a = { metin: false, pano: null, gun: 7, db: null }
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i]
    if (k === '--metin') a.metin = true
    else if (k === '--json') a.metin = false
    else if (k === '--pano') a.pano = String(argv[++i] || '').toLowerCase()
    else if (k === '--gun') a.gun = Number(argv[++i])
    else if (k === '--db') a.db = argv[++i] || null
  }
  return a
}

function main() {
  const a = argumanlar(process.argv.slice(2))
  let panolar
  try {
    panolar = panolariOku(panoDosyasi(a.db))
  } catch (e) {
    process.stdout.write(JSON.stringify({ hata: e instanceof Error ? e.message : String(e) }) + '\n')
    process.exit(1)
  }
  let sonuc = uyumHesapla(panolar, Date.now(), { gun: a.gun })
  if (a.pano) sonuc = sonuc.filter((p) => p.ad.toLowerCase().includes(a.pano))
  if (a.metin) process.stdout.write(metinTablosu(sonuc) + '\n')
  else process.stdout.write(JSON.stringify({ uretildi: new Date().toISOString(), gun: a.gun, panolar: sonuc }) + '\n')
}

if (require.main === module) main()

module.exports = { uyumHesapla, esikler, departmanAnahtari, satirVarMi, kanitKomutuVarMi, metinTablosu, ESIK_VARSAYILAN, ESIK_DEPARTMAN, EN_AZ_ORNEK, HAREKETSIZ_GUN }
