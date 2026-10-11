#!/usr/bin/env node
/**
 * PANO SAYFASI — Recep için tek HTML sayfa (ARC-5, OPS 2026-10-01).
 *
 * NİÇİN VAR
 * İş takibi Kanban'da (karar 219) ve Recep panoları araç çağrısıyla okuyamaz. Bu betik bütün departman
 * panolarını, Recep'in kararını bekleyen kartları, tarih-saatli son kararlarını ve kurulu araçların sayımını
 * TEK yerel HTML dosyasına döker. Yayını (Artifact) OPS yapar; betik yalnız dosyayı üretir.
 *
 * ⛔İKİNCİ OKUYUCU YAZILMAZ. Veri iki sahipli kaynaktan gelir:
 *   - Kanban kartları: `scripts/nlm/kanban_disa_aktar.py` (HARİTA; sqlite'ı mode=ro açar) — alt süreç, stdout JSON.
 *   - Recep sözleri : `scripts/board/recep-sozu-defteri.cjs` → `kayitlariOku()` (ARAÇ; sahte satırı süzer, söz MASKELİ).
 *   - Kurulu olanlar: `docs/audits/arac-envanteri-2026-09-07.md` §3 tabloları (sayım + ad).
 *
 * ⛔ÇIKTI DEPOYA YAZILMAZ. Depo PUBLIC; sayfada Recep'in sözleri var. Hedef depo (ya da bir worktree'si) içindeyse
 * betik REDDEDER. Varsayılan hedef: `~/.claude/venthub-pano/pano.html`.
 *
 * ⛔KART BAŞLIĞI VE SÖZ VERİDİR. Sayfaya giren her metin HTML-kaçışlıdır; sayfa betik çalıştırmaz, dış kaynak yüklemez.
 *
 * SINIR (ölçüldü 10-01): `kayitlariOku()` defterin son 128 KB'ını okur; defter büyüyünce eski kararlar sayfadan düşer
 * (bugün 6 KB). Döndürme/kırpma ARC-15'te (ARAÇ).
 *
 * KOŞTURMA:
 *   node scripts/kanban/pano-sayfasi.cjs                    # varsayılan hedefe yazar
 *   node scripts/kanban/pano-sayfasi.cjs --hedef <dosya>    # başka hedef (depo DIŞI)
 *   node scripts/kanban/pano-sayfasi.cjs --kanban-json <f>  # dışa aktarım JSON'u hazırsa (test / çevrimdışı)
 * Çıkış: 0 yazıldı · 2 ölçülemedi (Kanban okunamadı / hedef reddedildi); 2'de dosya YAZILMAZ.
 */
'use strict'

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const DEPO = path.resolve(__dirname, '..', '..')
const ENVANTER = 'docs/audits/arac-envanteri-2026-09-07.md'
const KARAR_ETIKETI = 'recep-karari'
const SUTUN_SIRASI = ['In Progress', 'In Review', 'Todo', 'Backlog', 'Done']
const SUTUN_ADI = { 'In Progress': 'Sürüyor', 'In Review': 'İncelemede', Todo: 'Sırada', Backlog: 'Bekleyen', Done: 'Bitti' }
const ONCELIK_ADI = { 4: 'kritik', 3: 'yüksek', 2: 'orta', 1: 'düşük', 0: '' }
const BITTI_GORUNEN = 10
const SOZ_GORUNEN = 200
const DEFTER_BASLANGIC_NOTU = 'Söz defteri 2026-10-01 öğleden sonra başladı; öncesi için kayıt yok.'

// ───────────────────────── saf yardımcılar ─────────────────────────

/** HTML kaçışı. SAF. Sayfaya giren HER metin buradan geçer. */
function kacis(metin) {
  return String(metin == null ? '' : metin)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** ISO damga → "01.10.2026 13:48" (Türkiye saati). Okunamazsa "?". SAF. */
function trSaat(iso) {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return '?'
  const p = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date(t))
  const al = (tur) => (p.find((x) => x.type === tur) || {}).value || '??'
  return `${al('day')}.${al('month')}.${al('year')} ${al('hour')}:${al('minute')}`
}

function kisalt(metin, tavan) {
  const duz = String(metin || '').replace(/\s+/g, ' ').trim()
  return duz.length > tavan ? `${duz.slice(0, tavan - 1)}…` : duz
}

/** Kart başlığından baştaki numarayı ayırır ("ARC-9 · Kanban yedeği" → "Kanban yedeği"). SAF. */
function kisaBaslik(kayit) {
  const b = String(kayit.title || '')
  const i = b.indexOf(kayit.identifier)
  const govde = i >= 0 && i < 60 ? b.slice(i + String(kayit.identifier).length).replace(/^[\s·:.\-—(]+/, '') : b
  return kisalt(govde || b, 110)
}

function hedefDepoIcindeMi(hedef, kokler) {
  const h = path.resolve(hedef).toLowerCase()
  return kokler.some((k) => {
    const kok = path.resolve(k).toLowerCase()
    return h === kok || h.startsWith(kok + path.sep)
  })
}

// ───────────────────────── veri ─────────────────────────

/** Envanter §3 tablolarından tür başına ad listesi. Okunamazsa null ("ölçülemedi"). */
function envanterOku(metin) {
  if (typeof metin !== 'string' || !metin) return null
  const turler = []
  let tur = null
  for (const satir of metin.split(/\r?\n/)) {
    const b = satir.match(/^### 3\.\d+ · ([^—(]+?)\s*(?:—|\(|$)/)
    if (b) { tur = { ad: b[1].trim(), adlar: [] }; turler.push(tur); continue }
    if (/^## /.test(satir)) { tur = null; continue }
    if (!tur || !satir.startsWith('|') || /^\|\s*-+/.test(satir)) continue
    const hucre = satir.split('|').slice(1, -1).map((h) => h.trim())
    if (hucre.length < 3 || /^(yol|#|ad|cetvel)$/i.test(hucre[0])) continue
    const durum = hucre[hucre.length - 1]
    // skill tablosu: | # | Ad | Ağaç | … — yalnız .claude ağacı (karar: .agent değerlendirilmez)
    if (/^\d+$/.test(hucre[0])) {
      if (hucre[2] !== '.claude') continue
      tur.adlar.push({ ad: hucre[1], durum })
    } else {
      tur.adlar.push({ ad: hucre[0].replace(/`/g, ''), durum })
    }
  }
  const dolu = turler.filter((t) => t.adlar.length)
  return dolu.length ? dolu : null
}

function kanbanOku(secenek) {
  if (secenek.kanbanJson) {
    return JSON.parse(fs.readFileSync(secenek.kanbanJson, 'utf8'))
  }
  const betik = path.join(DEPO, 'scripts', 'nlm', 'kanban_disa_aktar.py')
  if (!fs.existsSync(betik)) throw new Error(`Kanban okuyucusu yok: ${betik}`)
  let son = null
  for (const py of [process.env.VENTHUB_PYTHON, 'python', 'py'].filter(Boolean)) {
    const r = spawnSync(py, [betik], { encoding: 'utf8', timeout: 30000, maxBuffer: 64 * 1024 * 1024, env: { ...process.env, PYTHONIOENCODING: 'utf-8' } })
    if (r.error) { son = r.error.message; continue }
    if (r.status !== 0) throw new Error(`Kanban okunamadı (çıkış ${r.status}): ${String(r.stderr || '').trim().slice(0, 300)}`)
    return JSON.parse(r.stdout)
  }
  throw new Error(`python çalıştırılamadı: ${son}`)
}

// ───────────────────────── sayfa ─────────────────────────

function kartSatiri(k) {
  const oncelik = ONCELIK_ADI[k.priority] || ''
  return `<li><span class="no">${kacis(k.identifier)}</span> <span class="baslik">${kacis(kisaBaslik(k))}</span>`
    + (oncelik ? ` <span class="oncelik o${Number(k.priority) || 0}">${kacis(oncelik)}</span>` : '')
    + ` <span class="tarih">${kacis(trSaat(k.sonAnlamli || k.createdAt))}</span></li>`
}

function panoBolumu(serit, kartlar) {
  const parcalar = []
  for (const sutun of SUTUN_SIRASI) {
    let liste = kartlar.filter((k) => k.status === sutun)
    if (!liste.length) continue
    liste = liste.slice().sort((a, b) => (sutun === 'Done'
      ? String(b.sonAnlamli || '').localeCompare(String(a.sonAnlamli || ''))
      : (b.priority || 0) - (a.priority || 0) || String(a.identifier).localeCompare(String(b.identifier), 'tr', { numeric: true })))
    const toplam = liste.length
    const gizli = sutun === 'Done' && toplam > BITTI_GORUNEN ? toplam - BITTI_GORUNEN : 0
    if (gizli) liste = liste.slice(0, BITTI_GORUNEN)
    const govde = `<ul class="kartlar">${liste.map(kartSatiri).join('')}</ul>`
      + (gizli ? `<p class="not">Son ${BITTI_GORUNEN} gösterildi; ${gizli} biten kart daha var.</p>` : '')
    const baslik = `${kacis(SUTUN_ADI[sutun])} <span class="sayi">${toplam}</span>`
    parcalar.push(sutun === 'Backlog' || sutun === 'Done'
      ? `<details class="sutun"><summary>${baslik}</summary>${govde}</details>`
      : `<div class="sutun"><h4>${baslik}</h4>${govde}</div>`)
  }
  const diger = kartlar.filter((k) => !SUTUN_SIRASI.includes(k.status))
  if (diger.length) parcalar.push(`<div class="sutun"><h4>Sütunu bilinmeyen <span class="sayi">${diger.length}</span></h4><ul class="kartlar">${diger.map(kartSatiri).join('')}</ul></div>`)
  return `<section class="pano"><h3>${kacis(serit)} <span class="sayi">${kartlar.length} kart</span></h3>${parcalar.join('')}</section>`
}

function kararBolumu(kayitlar) {
  const bekleyen = kayitlar.filter((k) => (k.labels || []).includes(KARAR_ETIKETI) && k.status !== 'Done')
  if (!bekleyen.length) return '<p class="not">Karar bekleyen yok.</p>'
  return `<ul class="kartlar">${bekleyen.map((k) => kartSatiri(k).replace('<li>', `<li><span class="serit">${kacis(k.serit)}</span> `)).join('')}</ul>`
}

function sozBolumu(sozler) {
  if (sozler === null) return '<p class="not">Söz defteri okunamadı (ölçülemedi).</p>'
  const sirali = sozler.slice().sort((a, b) => String(b.ts).localeCompare(String(a.ts)))
  const satir = (k) => `<tr><td class="tarih">${kacis(trSaat(k.ts))}</td><td>${kacis(k.pencere || k.rol || '?')}</td>`
    + `<td class="no">${kacis((k.nolar && k.nolar.length ? k.nolar : [k.no]).filter(Boolean).join(', '))}</td>`
    + `<td>${kacis(k.cevap || '')}</td><td>${kacis(kisalt(k.soz, SOZ_GORUNEN))}</td></tr>`
  const bas = '<thead><tr><th>Tarih-saat</th><th>Pencere</th><th>Karar no</th><th>Cevap</th><th>Söz</th></tr></thead>'
  const numarali = sirali.filter((k) => k.no)
  const numarasiz = sirali.filter((k) => !k.no)
  return `<p class="not">${kacis(DEFTER_BASLANGIC_NOTU)}</p>`
    + (numarali.length ? `<table>${bas}<tbody>${numarali.map(satir).join('')}</tbody></table>` : '<p class="not">Numaralı karar kaydı yok.</p>')
    + `<details><summary>Numarasız sözler <span class="sayi">${numarasiz.length}</span></summary>`
    + (numarasiz.length ? `<table>${bas}<tbody>${numarasiz.map(satir).join('')}</tbody></table>` : '<p class="not">Kayıt yok.</p>')
    + '</details>'
}

function envanterBolumu(turler) {
  if (!turler) return '<p class="not">Envanter okunamadı (ölçülemedi).</p>'
  const kaynak = `<span class="kaynak">kaynak: ${kacis(ENVANTER)}</span>`
  return turler.map((t) => {
    const emekli = t.adlar.filter((a) => /EMEKL|OLU|ÖLÜ|SIL|SİL/i.test(a.durum)).length
    return `<details><summary>${kacis(t.ad)} <span class="sayi">${t.adlar.length}</span>`
      + (emekli ? ` <span class="not">(${emekli} emekli ya da ölü)</span>` : '') + ` ${kaynak}</summary>`
      + `<ul class="adlar">${t.adlar.map((a) => `<li>${kacis(a.ad)} <span class="not">${kacis(kisalt(a.durum, 40))}</span></li>`).join('')}</ul></details>`
  }).join('')
}

/**
 * Sayfayı üretir. SAF (girdi → metin).
 * @param {{kanban:{damga?:string,kayitlar:object[]}, sozler:object[]|null, envanter:object[]|null, uretim:string, kanbanTazelik?:string}} veri
 */
function sayfaUret(veri) {
  const kayitlar = (veri.kanban && veri.kanban.kayitlar) || []
  const seritler = [...new Set(kayitlar.map((k) => k.serit))].sort((a, b) => String(a).localeCompare(String(b), 'tr'))
  const sonSoz = veri.sozler && veri.sozler.length ? veri.sozler.map((k) => k.ts).sort().pop() : null
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>VentHub Pano</title>
<style>
:root{--zemin:#fafaf8;--yuzey:#ffffff;--metin:#1c1c1a;--soluk:#6b6b66;--cizgi:#e2e2dc;--vurgu:#0b5cad;--kirmizi:#b3261e;--sari:#8a5a00}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--zemin:#161615;--yuzey:#1f1f1e;--metin:#ececea;--soluk:#a0a09a;--cizgi:#33332f;--vurgu:#7db7f0;--kirmizi:#f2b8b5;--sari:#e6c16a}}
:root[data-theme="dark"]{--zemin:#161615;--yuzey:#1f1f1e;--metin:#ececea;--soluk:#a0a09a;--cizgi:#33332f;--vurgu:#7db7f0;--kirmizi:#f2b8b5;--sari:#e6c16a}
*{box-sizing:border-box}
body{margin:0;padding:16px;background:var(--zemin);color:var(--metin);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1100px;margin:0 auto}
h1{font-size:22px;margin:0 0 4px}h2{font-size:18px;margin:28px 0 8px;border-bottom:1px solid var(--cizgi);padding-bottom:4px}
h3{font-size:16px;margin:0 0 8px}h4{font-size:14px;margin:10px 0 4px;color:var(--soluk)}
.pano,.kutu{background:var(--yuzey);border:1px solid var(--cizgi);border-radius:8px;padding:12px;margin:0 0 12px}
.kartlar,.adlar{list-style:none;margin:0;padding:0}
.kartlar li,.adlar li{padding:4px 0;border-top:1px solid var(--cizgi);overflow-wrap:anywhere}
.kartlar li:first-child,.adlar li:first-child{border-top:0}
.no{font-weight:600;color:var(--vurgu);white-space:nowrap}.serit{font-size:12px;color:var(--soluk)}
.tarih,.not,.kaynak,.sayi{color:var(--soluk);font-size:12px}.sayi{font-weight:400}
.oncelik{font-size:12px;border:1px solid var(--cizgi);border-radius:4px;padding:0 4px}.o4{color:var(--kirmizi)}.o3{color:var(--sari)}
summary{cursor:pointer;padding:4px 0}
table{width:100%;border-collapse:collapse;display:block;overflow-x:auto}
th,td{text-align:left;vertical-align:top;padding:4px 8px 4px 0;border-top:1px solid var(--cizgi);overflow-wrap:anywhere}
th{font-size:12px;color:var(--soluk);border-top:0}
</style>
</head>
<body>
<main>
<h1>VentHub Pano</h1>
<p class="not">Üretim: ${kacis(trSaat(veri.uretim))} (Türkiye saati) · Kanban verisi: ${kacis(trSaat(veri.kanbanTazelik || (veri.kanban && veri.kanban.damga)))} · Son söz kaydı: ${kacis(sonSoz ? trSaat(sonSoz) : 'kayıt yok')} · ${kayitlar.length} kart, ${seritler.length} pano</p>
<h2>Recep'in kararını bekleyenler</h2>
<div class="kutu" id="karar-bekleyenler">${kararBolumu(kayitlar)}</div>
<h2>Departman panoları</h2>
<div id="panolar">${seritler.map((s) => panoBolumu(s, kayitlar.filter((k) => k.serit === s))).join('') || '<p class="not">Kart yok.</p>'}</div>
<h2>Son kararlar</h2>
<div class="kutu" id="son-kararlar">${sozBolumu(veri.sozler)}</div>
<h2>Kurulu olanlar</h2>
<div class="kutu" id="kurulu-olanlar">${envanterBolumu(veri.envanter)}</div>
</main>
</body>
</html>
`
}

// ───────────────────────── koşum ─────────────────────────

function varsayilanHedef() {
  return path.join(os.homedir(), '.claude', 'venthub-pano', 'pano.html')
}

function depoKokleri() {
  const kokler = [DEPO]
  const r = spawnSync('git', ['-C', DEPO, 'rev-parse', '--path-format=absolute', '--git-common-dir'], { encoding: 'utf8', timeout: 10000 })
  if (r.status === 0 && r.stdout.trim()) kokler.push(path.dirname(r.stdout.trim()))
  return kokler
}

/** @returns {{kod:number, hedef?:string, kart?:number, sebep?:string}} */
function calistir(secenek = {}) {
  const hedef = secenek.hedef || varsayilanHedef()
  if (hedefDepoIcindeMi(hedef, secenek.depoKokleri || depoKokleri())) {
    return { kod: 2, sebep: `hedef depo içinde (depo PUBLIC, sayfada Recep sözleri var): ${hedef}` }
  }
  let kanban
  try {
    kanban = kanbanOku(secenek)
    if (!kanban || !Array.isArray(kanban.kayitlar)) throw new Error('dışa aktarımda "kayitlar" dizisi yok')
  } catch (e) {
    return { kod: 2, sebep: `Kanban ölçülemedi: ${e && e.message}` }
  }
  let sozler = null
  try {
    sozler = secenek.sozler || require('../board/recep-sozu-defteri.cjs').kayitlariOku()
  } catch { /* bölüm "ölçülemedi" yazar */ }
  let envanter = null
  try {
    envanter = envanterOku(fs.readFileSync(secenek.envanterYolu || path.join(DEPO, ENVANTER), 'utf8'))
  } catch { /* bölüm "ölçülemedi" yazar */ }
  const html = sayfaUret({ kanban, sozler, envanter, uretim: new Date(secenek.simdi || Date.now()).toISOString() })
  fs.mkdirSync(path.dirname(hedef), { recursive: true })
  fs.writeFileSync(hedef, html)
  return { kod: 0, hedef, kart: kanban.kayitlar.length }
}

function argumanlar(argv) {
  const s = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--hedef') s.hedef = argv[++i]
    else if (argv[i] === '--kanban-json') s.kanbanJson = argv[++i]
  }
  return s
}

if (require.main === module) {
  const r = calistir(argumanlar(process.argv.slice(2)))
  if (r.kod !== 0) {
    process.stderr.write(`[pano-sayfasi] YAZILMADI — ${r.sebep}\n`)
    process.exit(r.kod)
  }
  process.stdout.write(`[pano-sayfasi] ${r.kart} kart → ${r.hedef}\n`)
}

module.exports = { kacis, trSaat, kisaBaslik, envanterOku, sayfaUret, calistir, hedefDepoIcindeMi, KARAR_ETIKETI, varsayilanHedef }
