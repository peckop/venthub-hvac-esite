#!/usr/bin/env node
'use strict'
/**
 * SAGE DAEMON AÇ — ARC-209 (ARC-207 takibi; OPS UYGUN 27 Ekim, yöntem B). SessionStart.
 *
 * NİÇİN: sage-mcp stdio istemcisi daemon'a yalnız BAĞLANIR (`spawnIfMissing: false`); daemon ölünce ders enjeksiyonu sessizce susuyordu
 * (12-25 Ekim'de 25 yeniden doğma, hepsi başka yollardan). ARC-207 uyarısı yalnız haber verir; bu kanca oturum açılışında bir kez diriltir.
 *
 * NE YAPAR: `server.json` pid'i ÖLÜYSE (sage-yazim-sayaci.cjs `daemonUyarisi` ile AYNI ölçü) `scripts/board/sage-daemon-baslat.cjs` işçisini
 * `kopuk-baslat.cjs` ile arka planda başlatır; açılışı GECİKTİRMEZ (kancanın işi pid ölçümü + spawn). Daemon canlıysa HİÇBİR ŞEY yapmaz.
 * ÇİFT BAŞLATMA KORUMASI: aynı anda açılan pencereler için `<pano>/.sage-daemon-denendi` damgası 120 sn içinde ikinci denemeyi engeller
 * (asıl seçimi paketin connectWithElection'ı yapar; damga fazladan işçi sürecini önler).
 * ⛔HANGİ PAKET: işçi YALNIZ ana ağaç paketini kullanır, worktree paketini REDDEDER (ayrıntı işçinin başlığında, ARC-98 dersi).
 *
 * NE YAPMAZ: reddetmez, ağa gitmez, kapıyı gevşetmez. Her hatada sessiz (fail-open). Vana: VENTHUB_SAGE_DAEMON_AC_KAPALI=1.
 * Test için: VENTHUB_SAGE_DAEMON_AC_KURU=1 işçiyi BAŞLATMAZ, yalnız "başlatılırdı" satırını basar; VENTHUB_SAGE_DB_KOKU daemon kökünü ezer.
 * Günlük: `<pano>/sage-daemon-baslat.log` (işçi yazar); sonuç sonraki istemde ARC-207 uyarısıyla görünür/kaybolur.
 */
const fs = require('node:fs')
const path = require('node:path')

const VANA = 'VENTHUB_SAGE_DAEMON_AC_KAPALI'
const BEKLEME_MS = 120_000

/** Saf karar: 'canli' | 'yakin-zamanda-denendi' | 'baslat'. */
function karar({ uyari, sonDeneme, simdi }) {
  if (!uyari) return 'canli'
  if (Number.isFinite(sonDeneme) && simdi - sonDeneme < BEKLEME_MS) return 'yakin-zamanda-denendi'
  return 'baslat'
}

/**
 * @param {Record<string,string|undefined>} env
 * @param {number} simdi
 * @param {{uyari?: (dbKok: string) => string, baslat?: (dbKok: string) => void, anaKok?: () => string}} [dep] test için
 * @returns {string} basılacak satır ('' = sessiz)
 */
function calistir(env = process.env, simdi = Date.now(), dep = {}) {
  if (env[VANA] === '1') return ''
  const dbKok = env.VENTHUB_SAGE_DB_KOKU || (dep.anaKok || (() => require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'ana-kok.cjs')).anaKok()))()
  const uyari = (dep.uyari || ((k) => require(path.join(__dirname, 'sage-yazim-sayaci.cjs')).daemonUyarisi(k)))(dbKok)
  const pano = env.VENTHUB_BOARD_DIR || 'C:/tmp/venthub-board'
  const damga = path.join(pano, '.sage-daemon-denendi')
  let sonDeneme = NaN
  try {
    sonDeneme = Number(fs.readFileSync(damga, 'utf8'))
  } catch {
    /* damga yok: ilk deneme */
  }
  if (karar({ uyari, sonDeneme, simdi }) !== 'baslat') return ''
  try {
    fs.mkdirSync(pano, { recursive: true })
    fs.writeFileSync(damga, String(simdi))
  } catch {
    /* damga yazılamadı: yine de dene (en kötü ihtimal çift işçi, paket seçimi tek daemon bırakır) */
  }
  if (env.VENTHUB_SAGE_DAEMON_AC_KURU === '1') return `SAGE DAEMON: kapalıydı, başlatılırdı (kuru koşu) — ${uyari}`
  ;(dep.baslat || ((k) => {
    const { kopukBaslat } = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'kopuk-baslat.cjs'))
    kopukBaslat(path.join(__dirname, '..', '..', 'scripts', 'board', 'sage-daemon-baslat.cjs'), [k])
  }))(dbKok)
  return `SAGE DAEMON: kapalıydı, arka planda başlatıldı (günlük: ${path.join(pano, 'sage-daemon-baslat.log')}) — ${uyari}`
}

if (require.main === module) {
  try {
    const satir = calistir()
    if (satir) fs.writeSync(1, satir + '\n')
  } catch {
    /* kanca asla açılışı bozmaz */
  }
  process.exit(0)
}

module.exports = { karar, calistir, BEKLEME_MS }
