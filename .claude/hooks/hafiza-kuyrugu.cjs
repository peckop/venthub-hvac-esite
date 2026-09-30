#!/usr/bin/env node
'use strict'

/**
 * HAFIZA KUYRUĞU BEKÇİSİ (REC-422, Ops emri 2026-09-30) — "kuyruk şişiyor" satırı ve "makine
 * kapanıyor" kolu.
 *
 * ── NİÇİN VAR ──
 *
 * 2026-09-29 16:51: claude-mem'in bekleyen olay kuyruğu 5.469'a çıkmıştı; makine kapanınca hepsi
 * işlenmeden kayboldu. Kök sebep ölçüldü (claude-mem 13.28.0): kuyruk YALNIZ BELLEKTE
 * (`MessageBuffer` bir Map; `pending_messages` tablosu bu sürümde ölü, INSERT yok), yani worker
 * ölünce kuyruk da ölür. Ayrıca geliş hızı işleme hızından yüksekti (havuz 2/2). Bir gün sonra,
 * 2026-09-30 sabahı 08:50'de 0 olan kuyruk 09:45'te 659'a çıkmıştı ve KİMSE görmüyordu: hiçbir
 * yüzey bunu göstermiyor, günlükte yalnız `queueDepth=` satırı var.
 *
 * ── İKİ KOL ──
 *
 * 1. EŞİK SATIRI (her mesajda, defter-tazelik-satiri içinden): kuyruk ≥ eşik (varsayılan 300) ise
 *    konuşur, altında SUSAR (SAGE/BELLEK satırları gibi eşikli). Eşik ölçümle seçildi: normal gün
 *    tepesi 342 (09-28), sağlıklı sabah 0-5, birikim başladığında 195 (10 dk) → 585 (30 dk).
 * 2. KAPANIŞ KOLU (`--kapanis [--bekle SN]`): "makine kapanıyor" rutininin okuyacağı komut.
 *    Kuyruk boş (ve işlem yok) → çıkış 0; worker kapalı → çıkış 0 (kaybedilecek bir şey yok);
 *    kuyruk dolu → çıkış 2 ve KAÇ olay kaybolacağı yazılır; ölçülemedi → çıkış 3. `--bekle`
 *    verilirse kuyruğun boşalmasını o kadar saniye bekler.
 *
 * ── NASIL ──
 *
 * Kaynak: worker'ın kendi durum adresi `GET http://127.0.0.1:<port>/api/processing-status`
 * → {"isProcessing":true,"queueDepth":713,"parkedSessions":3} (13.28.0'da ölçüldü; günlük
 * ayrıştırmaktan hem daha hızlı hem yetkili). Port: VENTHUB_CLAUDE_MEM_PORT ya da
 * ~/.claude-mem/settings.json CLAUDE_MEM_WORKER_PORT, yoksa 37777.
 *
 * Eşik satırı için ölçüm KANCADA yapılmaz (bütçe 300 ms): önbellek 30 sn'den eskiyse bu dosya
 * kendini `--tazele` ile arka planda başlatır (scripts/board/kopuk-baslat.cjs, REC-415: pencere
 * açmasın) ve kanca önbelleği okur.
 *
 * ⭐FAIL-OPEN: ölçüm hatası hiçbir zaman mesajı engellemez; worker'a ulaşılamıyorsa satır SUSAR
 * (kaybedilecek kuyruk yok). Yalnız önbellek çok bayatsa (15 dk) "OLCULEMEDI" der.
 */

const fs = require('fs')
const http = require('http')
const os = require('os')
const path = require('path')

const ESIK = Number(process.env.VENTHUB_HAFIZA_KUYRUK_ESIK || 300)
const TAZELE_SN = 30
const BAYAT_DK = 15
const KILIT_SN = 20
const VARSAYILAN_PORT = 37777

function port() {
  const env = Number(process.env.VENTHUB_CLAUDE_MEM_PORT)
  if (Number.isInteger(env) && env > 0) return env
  try {
    const ayar = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.claude-mem', 'settings.json'), 'utf8'))
    const p = Number(ayar.CLAUDE_MEM_WORKER_PORT)
    if (Number.isInteger(p) && p > 0) return p
  } catch {
    /* ayar yok ya da okunamadı: varsayılan */
  }
  return VARSAYILAN_PORT
}

function onbellekYolu() {
  const pano = process.env.VENTHUB_BOARD_DIR || process.env.VENTHUB_PANO_DIR || 'C:/tmp/venthub-board'
  return process.env.VENTHUB_HAFIZA_KUYRUK_ONBELLEK || path.join(pano, '.hafiza-kuyrugu.json')
}

/**
 * Worker'ın durumunu sorar. Asla fırlatmaz.
 *   · ulaşılamadı / bağlantı reddedildi / zaman aşımı → { calisiyor: false }
 *   · yanıt geldi ama beklenen alan yok           → { calisiyor: true, derinlik: null }
 *   · normal                                       → { calisiyor: true, derinlik, isleniyor, parked }
 */
function httpDurum(portNo = port(), zamanAsimiMs = 1500) {
  return new Promise((coz) => {
    let bitti = false
    const bitir = (v) => {
      if (bitti) return
      bitti = true
      coz(v)
    }
    const istek = http.get({ host: '127.0.0.1', port: portNo, path: '/api/processing-status', timeout: zamanAsimiMs }, (yanit) => {
      let govde = ''
      yanit.setEncoding('utf8')
      yanit.on('data', (p) => {
        govde += p
        if (govde.length > 4096) yanit.destroy()
      })
      yanit.on('end', () => {
        try {
          const v = JSON.parse(govde)
          const d = Number(v.queueDepth)
          bitir({
            calisiyor: true,
            derinlik: Number.isFinite(d) && d >= 0 ? d : null,
            isleniyor: Boolean(v.isProcessing),
            parked: Number.isFinite(Number(v.parkedSessions)) ? Number(v.parkedSessions) : 0,
          })
        } catch {
          bitir({ calisiyor: true, derinlik: null })
        }
      })
      yanit.on('error', () => bitir({ calisiyor: true, derinlik: null }))
    })
    istek.on('timeout', () => {
      istek.destroy()
      bitir({ calisiyor: false })
    })
    istek.on('error', () => bitir({ calisiyor: false }))
  })
}

/**
 * Eşik satırı. `ob` = önbellek nesnesi ({ ts, calisiyor, derinlik, isleniyor, parked }).
 * Susma hâlleri: önbellek yok, worker kapalı, derinlik bilinmiyor (taze), derinlik eşiğin altında.
 */
function satir(ob, simdi, esik = ESIK) {
  if (!ob || typeof ob.ts !== 'number') return null
  const yasDk = Math.round((simdi - ob.ts) / 60000)
  if (yasDk > BAYAT_DK) return '⚠HAFIZA KUYRUK: OLCULEMEDI (onbellek ' + yasDk + ' dk bayat — arka plan olcumu dusuyor)'
  if (ob.calisiyor === false) return null
  if (typeof ob.derinlik !== 'number' || ob.derinlik < esik) return null
  return (
    '⚠HAFIZA KUYRUK: ' +
    ob.derinlik +
    ' olay islenmeyi bekliyor (esik ' +
    esik +
    ', ' +
    yasDk +
    ' dk once olculdu) — kuyruk YALNIZ BELLEKTE: makine kapanirsa hepsi kaybolur (09-29: 5.469 olay). ' +
    'Kapatmadan once: node .claude/hooks/hafiza-kuyrugu.cjs --kapanis --bekle 300'
  )
}

function oku() {
  try {
    return JSON.parse(fs.readFileSync(onbellekYolu(), 'utf8'))
  } catch {
    return null
  }
}

/**
 * Önbellek eskiyse ölçümü arka planda, pencere açmadan başlatır. Kilit: 20 sn. CI'da çalışmaz
 * (orada worker yok, süreç başlatmanın anlamı yok).
 */
function gerekirseTazele(simdi) {
  if (process.env.CI) return
  const ob = oku()
  if (ob && typeof ob.ts === 'number' && simdi - ob.ts < TAZELE_SN * 1000) return
  const kilit = onbellekYolu() + '.kilit'
  try {
    if (simdi - fs.statSync(kilit).mtimeMs < KILIT_SN * 1000) return
  } catch {
    /* kilit yok */
  }
  try {
    fs.mkdirSync(path.dirname(kilit), { recursive: true })
    fs.writeFileSync(kilit, String(simdi))
    // REC-415: kopuk süreç başlatmanın tek yolu
    require(path.join(__dirname, '..', '..', 'scripts', 'board', 'kopuk-baslat.cjs')).kopukBaslat(__filename, ['--tazele'])
  } catch {
    /* başlatılamadı: 15 dk sonra satır OLCULEMEDI der */
  }
}

/** Ölçer ve önbelleğe yazar. Yalnız `--tazele` ile, arka planda koşar. */
async function tazele(olc = httpDurum) {
  const d = await olc()
  const ob = { ts: Date.now(), ...d }
  fs.mkdirSync(path.dirname(onbellekYolu()), { recursive: true })
  const gecici = onbellekYolu() + '.tmp'
  fs.writeFileSync(gecici, JSON.stringify(ob))
  fs.renameSync(gecici, onbellekYolu())
  return ob
}

/**
 * "Makine kapanıyor" kolu. Dönen sayı çıkış kodudur:
 *   0 = kapatılabilir (kuyruk boş ve işlem yok, ya da worker zaten kapalı)
 *   2 = kuyruk dolu: kapatılırsa `derinlik` olay kaybolur
 *   3 = ölçülemedi (worker ayakta ama yanıt anlaşılamadı)
 * `bekleSn` > 0 ise kuyruğun boşalmasını o kadar saniye bekler (5 sn aralıkla, 30 sn'de bir ilerleme yazar).
 */
async function kapanis({ bekleSn = 0, olc = httpDurum, saat = () => Date.now(), uyku = (ms) => new Promise((r) => setTimeout(r, ms)), yaz = (s) => process.stdout.write(s + '\n') } = {}) {
  const basla = saat()
  let sonYazi = -Infinity
  for (;;) {
    const d = await olc()
    if (!d.calisiyor) {
      yaz('HAFIZA KUYRUK: worker kapali, bekleyen olay yok — kapatilabilir')
      return 0
    }
    if (d.derinlik === null || d.derinlik === undefined) {
      yaz('HAFIZA KUYRUK: OLCULEMEDI (worker acik ama kuyruk sayisi okunamadi) — kapatmadan once /api/processing-status elle bak')
      return 3
    }
    if (d.derinlik === 0 && !d.isleniyor) {
      yaz('HAFIZA KUYRUK: bos, islem yok — kapatilabilir')
      return 0
    }
    const gecen = Math.round((saat() - basla) / 1000)
    if (gecen >= bekleSn) {
      yaz(
        'HAFIZA KUYRUK: ' +
          d.derinlik +
          ' olay hala bekliyor' +
          (d.isleniyor ? ' (islem suruyor)' : '') +
          (bekleSn > 0 ? ' (' + gecen + ' sn beklendi)' : '') +
          ' — simdi KAPATIRSAN KAYBOLUR',
      )
      return 2
    }
    if (gecen - sonYazi >= 30) {
      yaz('HAFIZA KUYRUK: ' + d.derinlik + ' olay bekliyor, bosalmasi bekleniyor (' + gecen + '/' + bekleSn + ' sn)')
      sonYazi = gecen
    }
    await uyku(5000)
  }
}

if (require.main === module) {
  const arg = process.argv.slice(2)
  if (arg.includes('--tazele')) {
    tazele()
      .catch(() => {
        /* ölçülemedi: önbellek eskir, satır bunu söyler */
      })
      .finally(() => {
        try {
          fs.unlinkSync(onbellekYolu() + '.kilit')
        } catch {
          /* kilit yoksa sorun değil */
        }
      })
  } else if (arg.includes('--kapanis')) {
    const i = arg.indexOf('--bekle')
    const bekleSn = i >= 0 ? Math.max(0, Number(arg[i + 1]) || 0) : 0
    kapanis({ bekleSn }).then(
      (kod) => process.exit(kod),
      () => process.exit(3),
    )
  }
}

module.exports = { satir, oku, gerekirseTazele, tazele, kapanis, httpDurum, port, onbellekYolu, ESIK, TAZELE_SN, BAYAT_DK }
