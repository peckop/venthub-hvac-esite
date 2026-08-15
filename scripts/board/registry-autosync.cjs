#!/usr/bin/env node
/**
 * Registry oto-senkronu — oturum açılışında, arka planda.
 *
 * SORUN: `registry-sync.cjs`'i tetikleyen tek şey `.git/hooks/post-merge` idi ve o kanca
 * YALNIZ yerel `git pull/merge` sonrası koşar. Biz PR'ları `gh pr merge` ile GitHub üzerinden
 * kapatıyoruz; kimse yerelde pull etmiyor, dolayısıyla senkron HİÇ çalışmıyordu. 2026-08-15'te
 * altı künye (T001/T018/T019/T020/T022/T023) hiç işlenmemiş hâlde bulundu.
 *
 * NEDEN CI DEĞİL: ilk önerim "master'a push'ta bir GitHub Action koşsun" idi ve eş-controller
 * bunu haklı olarak çürüttü — registry `~/.orion/registry.db`, yani Recep'in MAKİNESİNDEKİ
 * yerel bir SQLite dosyası. CI runner'ında ev dizini boş bir konteynerdir: script orada boş bir
 * DB yaratır, yazar, iş bitince runner'la birlikte silinir. Kırmızı bile yanmaz — YEŞİL yanar
 * ve hiçbir şey senkronlanmaz. Yanlış tedavi, doğru teşhis.
 *
 * DOĞRU YER: oturum açılışı. Üç controller da AYNI makinede çalışıyor, DB yerel. Kim nasıl
 * merge ederse etsin (GitHub UI, `gh pr merge`, yerel merge), bir sonraki oturum açılışında
 * sistem kendini onarır. Hatırlamaya bağlı adım yok.
 *
 * ARALIK KAYBOLMASIN: en son senkronlanan commit `~/.orion/last-registry-sync` dosyasında
 * tutulur. Dosya yoksa son 40 commit taranır (idempotent olduğu için zararsız — künyeler
 * mutlak değer yazar, artırmaz).
 *
 * BLOKLAMAZ: `session-board.cjs` bunu koparılmış (detached) bir süreç olarak başlatır; oturum
 * açılışı ağ/git beklemez. Çıktı log dosyasına düşer.
 */
const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')

const STATE_FILE = path.join(os.homedir(), '.orion', 'last-registry-sync')
const LOG_FILE = path.join(os.homedir(), '.orion', 'registry-autosync.log')
const REPO = path.resolve(__dirname, '..', '..')
const FALLBACK_DEPTH = 40

function log(msg) {
  const line = `${new Date().toISOString()} ${msg}\n`
  try { fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true }) } catch { /* yoksay */ }
  try { fs.appendFileSync(LOG_FILE, line, 'utf8') } catch { /* yoksay */ }
  process.stdout.write(line)
}

/** Kabuk yok: künye değerleri commit mesajından, yani dış girdiden gelir. */
function git(args) {
  return execFileSync('git', ['-C', REPO, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

function main() {
  try { git(['fetch', '--quiet', 'origin', 'master']) } catch (e) {
    // Ağ yoksa yerelde bilinen origin/master ile devam et — hiç senkron etmemekten iyidir.
    log(`fetch başarısız (yerel origin/master ile devam): ${e && e.message}`)
  }

  let head = ''
  try { head = git(['rev-parse', 'origin/master']) } catch (e) {
    log(`origin/master çözülemedi, çıkılıyor: ${e && e.message}`)
    return
  }

  let from = ''
  try { from = fs.readFileSync(STATE_FILE, 'utf8').trim() } catch { /* ilk koşu */ }

  // Kayıtlı SHA artık ağaçta yoksa (force-push/rebase) geriye düş — sessizce hiçbir şey
  // yapmamaktansa geniş aralığı taramak doğru; senkron idempotenttir.
  if (from) {
    try { git(['cat-file', '-e', `${from}^{commit}`]) } catch { from = '' }
  }
  const range = from ? `${from}..${head}` : `${head}~${FALLBACK_DEPTH}..${head}`

  if (from === head) { log(`değişiklik yok (${head.slice(0, 8)})`); return }

  let out = ''
  try {
    out = execFileSync(process.execPath, [path.join(__dirname, 'registry-sync.cjs'), ...range.split('..')], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    })
  } catch (e) {
    log(`senkron başarısız: ${e && e.message}`)
    return // SHA'yı ilerletme: bir sonraki açılışta aynı aralık tekrar denenir
  }

  log(`aralık=${range}\n${out.trim()}`)
  try {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true })
    fs.writeFileSync(STATE_FILE, head, 'utf8')
  } catch (e) {
    log(`son-senkron SHA yazılamadı (aralık bir sonraki açılışta tekrarlanır): ${e && e.message}`)
  }
}

main()
