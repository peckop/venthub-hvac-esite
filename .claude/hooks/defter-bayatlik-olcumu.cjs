#!/usr/bin/env node
'use strict'

/**
 * Stop hook — PROJE TAKİP DEFTERİ BAYATLIK ÖLÇÜMÜ (yalnız ÖLÇER ve UYARIR).
 *
 * NİÇİN VAR — ölçülmüş vaka (2026-09-06): defter 8 saat bayat kaldı ve o süre boyunca
 * "konuşmuş muyduk" sorusuna YANLIŞ cevap verdi. *Bayat defter, yalan söyleyen defterdir.*
 * Kimse kasten atlamadı; eşitleme "hatırlanan" bir adımdı ve hatırlanmadı.
 *
 * ⛔BU KANCA EŞİTLEME YAPMAZ — OPS hükmü (2026-09-07), benim itirazım üzerine:
 * eşitleme betiği OPS'un claim'inde (`scripts/nlm/**`) ve DIŞ SERVİSE (NotebookLM) yazar.
 * İnsan araya girmeden dış yazma tetiklenmez. Kanca ölçer, uyarır; tetiği OPS/Recep çeker.
 *
 * ⭐YAŞ NEREDEN OKUNUR — ve niçin dosya damgası DEĞİL (ölçümle bulundu):
 * Eşitleme betiği BİLEREK zaman damgası yazmaz (deterministik olsun diye: "aynı girdi → aynı
 * çıktı, tarih damgası yok"). Elde kalan tek sinyal `state.json`. Ama o dosyanın DİSK damgası
 * yanıltıcıdır: eşitleme başka bir worktree'de koşar ve ana dizindeki kopya güncellenmez —
 * 2026-09-07'de ölçtüm, ana dizin damgası 21 saat eskiydi, oysa eşitleme 18 saat önce
 * BAŞKA ağaçta koşup master'a inmişti. Doğru ölçüt: `git log origin/master -- state.json`.
 * Yani "hangi dosya ne zaman değişti" değil, "hangi eşitleme PAYLAŞILAN gerçeğe indi".
 *
 * PAHALI ÖLÇÜM SEYREK KOŞAR: değişen demet sayısı, ancak yaş eşiği AŞILMIŞSA hesaplanır.
 * Her Stop'ta python koşturmak, uyarının kendisinden pahalı olurdu.
 *
 * SESSİZ DEĞİL AMA GÜRÜLTÜLÜ DE DEĞİL: aynı uyarı soğuma penceresi içinde tekrar basılmaz —
 * her turda öten bir uyarı üç günde görmezden gelinir.
 *
 * stdin: { session_id, cwd? }
 * Çıkış: DAİMA 0 (turu bloklamaz). Uyarı stderr'e yazılır.
 */

const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const PANO = process.env.VENTHUB_BOARD_DIR || process.env.VENTHUB_PANO_DIR || 'C:/tmp/venthub-board'
/**
 * ⛔DEPO YOLU SABİT YAZILMAZ (INV-MUTLAK-YOL-1 bunu CI'da yakaladı, 2026-09-07):
 * ilk yazımda buraya kimlik taşıyan mutlak bir yol koymuştum. İki zarar birden: depo PUBLIC
 * olduğu için **kimlik sızıntısı**, ve kod sessizce **tek makineye** bağlanır (CI'da kırıldı —
 * git komutu boşa düştü, kanca "OLCULEMEDI" bastı, üç kol kırmızı verdi).
 * Doğrusu: ortam değişkeni EZER, varsayılan bu dosyadan yukarı yürüyüp `.git` arar.
 * Kendi kapım kendi sızıntımı yakaladı — kapının işe yaradığının kanıtı, ama yazarken
 * ölçmediğimin de kanıtı.
 */
function depoKoku() {
  if (process.env.VENTHUB_REPO) return process.env.VENTHUB_REPO
  let d = __dirname
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(d, '.git'))) return d
    const ust = path.dirname(d)
    if (ust === d) break
    d = ust
  }
  return process.cwd()
}
const DEPO = depoKoku()
const DURUM_YOLU = 'docs/proje-takip/state.json'
/** Eşik: 6 saat (OPS emri). Gün içinde birden çok eşitleme beklenmez, ama gün atlaması affedilmez. */
const ESIK_SAAT = Number(process.env.VENTHUB_DEFTER_ESIK_SAAT || 6)
/** Soğuma: aynı oturumda 2 saatten sık uyarmaz. */
const SOGUMA_SAAT = 2

function stdinOku() {
  try {
    return fs.readFileSync(0, 'utf8')
  } catch {
    return ''
  }
}

let girdi = {}
try {
  girdi = JSON.parse(stdinOku() || '{}')
} catch {
  process.exit(0)
}

const sid = String(girdi.session_id || '').slice(0, 8) || 'bilinmeyen'
const uyariYolu = path.join(PANO, '.defter-bayatlik.' + sid + '.json')

/** Soğuma penceresi: son uyarı yakınsa sus. */
try {
  const onceki = JSON.parse(fs.readFileSync(uyariYolu, 'utf8'))
  const gecenSaat = (Date.now() - Date.parse(onceki.ts)) / 3_600_000
  if (Number.isFinite(gecenSaat) && gecenSaat < SOGUMA_SAAT) process.exit(0)
} catch {
  /* ilk kez ya da okunamadı: ölçmeye devam */
}

/** ÖLÇÜM 1 — son eşitlemenin PAYLAŞILAN gerçeğe indiği an (git, dosya damgası değil). */
let sonEsitleISO = ''
try {
  sonEsitleISO = execFileSync(
    'git',
    ['-C', DEPO, 'log', 'origin/master', '-1', '--format=%aI', '--', DURUM_YOLU],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 15_000 },
  ).trim()
} catch {
  sonEsitleISO = ''
}

if (!sonEsitleISO) {
  // ÖLÇEMEDİM ≠ GEÇTİ. Sessiz kalmak, bayatlığı "yok" göstermek olur.
  process.stderr.write(
    '[defter-bayatlik] OLCULEMEDI — `git log origin/master -- ' + DURUM_YOLU + '` sonuc vermedi.\n' +
      '  Sebep olabilir: origin/master ref yok (fetch gerekir) ya da depo yolu yanlis (' + DEPO + ').\n' +
      '  "Olcemedim" ile "taze" AYNI SEY DEGIL; defter bayat olabilir.\n',
  )
  process.exit(0)
}

const yasSaat = (Date.now() - Date.parse(sonEsitleISO)) / 3_600_000
if (!Number.isFinite(yasSaat) || yasSaat < ESIK_SAAT) process.exit(0)

/** ÖLÇÜM 2 — yalnız eşik aşılınca: kaç demet değişmiş (OPS'un `olc` fiili, SALT OKUMA). */
let demetSatiri = 'degisen demet: OLCULMEDI'
for (const yorumlayici of ['python', 'python3', 'py']) {
  try {
    const cikti = execFileSync(yorumlayici, [path.join(DEPO, 'scripts', 'nlm', 'proje_takip_sync.py'), 'olc'], {
      encoding: 'utf8',
      cwd: DEPO,
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 60_000,
    })
    const son = cikti.trim().split('\n').filter(Boolean).slice(-3).join(' | ')
    demetSatiri = 'olc ciktisi (son satirlar): ' + son.slice(0, 300)
    break
  } catch {
    /* sıradaki yorumlayıcıyı dene */
  }
}

process.stderr.write(
  '[defter-bayatlik] ⚠DEFTER BAYAT: son esitleme ' + Math.round(yasSaat) + ' saat once (esik ' + ESIK_SAAT + ' saat).\n' +
    '  olcut: git log origin/master -- ' + DURUM_YOLU + ' -> ' + sonEsitleISO + '\n' +
    '  ' + demetSatiri + '\n' +
    '  NICIN ONEMLI: bayat defter "konusmus muyduk" sorusuna YANLIS cevap verir (2026-09-06: 8 saat bayat kaldi).\n' +
    '  ⛔ESITLEMEYI BU KANCA YAPMAZ (dis servise yazma insan onayi ister). Tetigi OPS ceker:\n' +
    '     python scripts/nlm/proje_takip_sync.py esitle\n',
)

try {
  fs.mkdirSync(PANO, { recursive: true })
  fs.writeFileSync(uyariYolu, JSON.stringify({ ts: new Date().toISOString(), yasSaat: Math.round(yasSaat), sonEsitleISO }), 'utf8')
} catch {
  /* soğuma yazılamadı: uyarı bir sonraki turda tekrar basar, zararsız */
}

process.exit(0)
