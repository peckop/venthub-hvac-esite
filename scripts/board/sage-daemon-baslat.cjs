#!/usr/bin/env node
'use strict'
/**
 * SAGE DAEMON İŞÇİSİ — ARC-209 (ARC-207 takibi). `sage-daemon-ac.cjs` SessionStart kancası, daemon ölüyse bunu KOPUK süreç olarak başlatır
 * (scripts/board/kopuk-baslat.cjs; kancada kendi spawn'ı yasak).
 *
 * NE YAPAR: sage paketinin `ProjectSageMemoryPort`unu `spawnIfMissing: true` ile açıp `initialize()` çağırır, bağlantıyı bırakır.
 * Daemon'u doğuran ve çift başlatmayı önleyen (connectWithElection) paketin kendi kodudur; bu betik yalnız tetikler.
 * (ÖLÇÜLDÜ 27 Ekim: sage-mcp stdio istemcisi `spawnIfMissing: false` açar, yani ölü daemon'u HİÇ diriltmez.)
 *
 * ⛔HANGİ PAKET (OPS şartı, ARC-98 dersi 12 Ekim): daemon YALNIZ ana ağacın kurulumundan başlar:
 * `<kanonik kök>/tools/wrongstack-mcp/node_modules/@wrongstack/sage`. Bir worktree'nin (farklı sürümlü) paketi canlı sage.db'ye bağlanıp
 * şema göçü yapmasın diye: kök bir `.claude/worktrees/` yoluysa ya da paketin gerçek yolu kökün dışına çıkıyorsa İSTİSNA (başlatılmaz).
 *
 * GÜNLÜK: `<pano>/sage-daemon-baslat.log` (depo dışı) — hangi yol, hangi sürüm, sonuç. Her durumda çıkış 0 (kopuk süreç, kimse beklemiyor).
 * kullanım: node scripts/board/sage-daemon-baslat.cjs [kök]
 */
const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

const ZAMAN_ASIMI_MS = 20_000

/** Paket girişi + sürümü; yalnız ana ağaç kurulumu, aksi halde istisna. SAF (dosya sistemi okur, yazmaz). */
function paketYolu(kok) {
  const k = path.resolve(String(kok || ''))
  if (/[\\/]\.claude[\\/]worktrees[\\/]/i.test(k + path.sep)) {
    throw new Error(`kök bir worktree (${k}): daemon yalnız ana ağaç paketinden başlatılır (ARC-98)`)
  }
  const dizin = path.join(k, 'tools', 'wrongstack-mcp', 'node_modules', '@wrongstack', 'sage')
  const giris = path.join(dizin, 'dist', 'index.js')
  if (!fs.existsSync(giris)) throw new Error(`ana ağaçta sage paketi yok: ${giris}`)
  const gercek = fs.realpathSync(giris)
  const gercekKok = fs.realpathSync(k)
  if (!gercek.toLowerCase().startsWith(gercekKok.toLowerCase() + path.sep)) {
    throw new Error(`paketin gerçek yolu kökün dışında (${gercek}): reddedildi`)
  }
  let surum = '?'
  try {
    surum = JSON.parse(fs.readFileSync(path.join(dizin, 'package.json'), 'utf8')).version || '?'
  } catch {
    /* sürüm okunamadı: günlükte '?' */
  }
  return { giris, surum }
}

/**
 * @param {{kok: string, ice?: (url: string) => Promise<any>, log?: (s: string) => void, zamanAsimiMs?: number}} g
 * @returns {Promise<{giris: string, surum: string}>}
 */
async function baslat({ kok, ice = (url) => import(url), log = () => {}, zamanAsimiMs = ZAMAN_ASIMI_MS }) {
  const { giris, surum } = paketYolu(kok) // worktree/dış yol burada istisna fırlatır: paket HİÇ yüklenmez
  log(`paket=${giris} surum=${surum}`)
  const modul = await ice(pathToFileURL(giris).href)
  const port = new modul.ProjectSageMemoryPort({ projectRoot: path.resolve(kok), spawnIfMissing: true, clientId: `arac-oturum-acilisi-${process.pid}` })
  let zamanlayici
  try {
    await Promise.race([
      port.initialize(),
      new Promise((_, red) => {
        zamanlayici = setTimeout(() => red(new Error(`initialize ${zamanAsimiMs} ms içinde bitmedi`)), zamanAsimiMs)
      }),
    ])
  } finally {
    clearTimeout(zamanlayici)
  }
  try {
    port.releaseConnection()
  } catch {
    /* bağlantı bırakılamadı: süreç zaten çıkacak */
  }
  return { giris, surum }
}

async function main() {
  const { kanonikKok } = require('../../tools/wrongstack-mcp/posta-kutusu.cjs')
  const panoDizini = process.env.VENTHUB_BOARD_DIR || 'C:/tmp/venthub-board'
  const gunluk = (s) => {
    try {
      fs.mkdirSync(panoDizini, { recursive: true })
      fs.appendFileSync(path.join(panoDizini, 'sage-daemon-baslat.log'), `${new Date().toISOString()} ${s}\n`)
    } catch {
      /* günlük yazılamadı: sessiz */
    }
  }
  try {
    const kok = kanonikKok(process.argv[2] || process.cwd())
    const s = await baslat({ kok, log: gunluk })
    gunluk(`TAMAM daemon hazir (paket ${s.surum})`)
  } catch (e) {
    gunluk(`HATA ${String((e && e.message) || e).split('\n')[0].slice(0, 200)}`)
  }
}

if (require.main === module) {
  main().finally(() => process.exit(0))
}

module.exports = { paketYolu, baslat, ZAMAN_ASIMI_MS }
