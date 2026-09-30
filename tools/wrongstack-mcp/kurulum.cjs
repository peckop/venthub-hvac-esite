#!/usr/bin/env node
'use strict'
/**
 * WRONGSTACK KURULUM / YÜKSELTME — tek komut (REC-401 B0b, OPS emri 2026-09-27).
 *
 * ── NİÇİN VAR ──
 *
 * Arka plan süreçleri (`project-server.js`) pencere kapanınca da ayakta kalır ve paket dosyalarını
 * açık tutar; 09-27'de makinede 30 WrongStack süreci vardı. Pencereler açıkken yapılan `npm ci`
 * ya dosyaları değiştiremez ya da eski kod bellekte koşmaya devam eder. README'deki elle sıra
 * (kapat → durdur → kur → yamala → doğrula) bir kez atlanırsa hata sessiz kalır.
 *
 * ── SIRA (yarın sabah açılış) ──
 *
 * Bütün pencereler kapalı → YALNIZ ARAÇ penceresi açılır → bu betik koşar → "HAZIR" der →
 * ARAÇ penceresi `/mcp` ile WrongStack sunucularını yeniden bağlar → öteki pencereler açılır.
 * Betik kendi penceresinin MCP sunucularını (ata zincirindeki claude.exe'nin çocukları) ve
 * daemon'ları durdurur; BAŞKA bir pencerenin sunucusunu görürse hiçbir şeye dokunmadan DURUR.
 *
 *   node tools/wrongstack-mcp/kurulum.cjs            → kur + doğrula
 *   node tools/wrongstack-mcp/kurulum.cjs --denetle  → yalnız doğrula (hiçbir şey değiştirmez)
 *
 * Çıktının son satırı daima `HAZIR` ya da `HATA: <neden>`; çıkış kodu 0 / 1.
 *
 * ── YAMALAR (`yamalar/<paket>-<sürüm>-<konu>.patch`) ──
 * Her yama bir paketin TAM bir sürümü için yazılır. Sürüm kayarsa betik yüksek sesle düşer:
 * kurulumdan önce `package-lock.json`'a (hiçbir süreç durdurulmadan), kurulumdan sonra kurulu
 * pakete bakılır; `--denetle` de aynı farkı bildirir. `git apply` her zaman `core.autocrlf=false` + `core.eol=lf`
 * ile koşar (bkz. gitApply).
 */
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const ARAC = __dirname
const KOK = path.resolve(ARAC, '..', '..')
const YAMALAR = path.join(ARAC, 'yamalar')

/**
 * Süreçleri sınıflar.
 * - daemon: project-server; kurulumdan önce durdurulur.
 * - kendi: BU pencerenin (betiği koşturan claude.exe'nin) MCP sunucuları; durdurulur, kurulumdan
 *   sonra pencerede `/mcp` ile yeniden bağlanır.
 * - yabanci: BAŞKA bir pencerenin MCP sunucusu; varsa kurulum DURUR (o pencere eski kodla kalır ve
 *   açık tuttuğu dosyalar `npm ci`'ı bozabilir).
 * @param {Array<{ pid: number, ppid: number, komut: string }>} surecler
 * @param {number | null} kendiClaude betiği koşturan claude.exe süreci (yoksa null: terminalden)
 */
function siniflandir(surecler, kendiClaude, kendiPid = process.pid) {
  const kendi = []
  const yabanci = []
  const daemon = []
  for (const s of surecler) {
    const k = String(s.komut || '').replace(/\\/g, '/')
    if (s.pid === kendiPid || !/wrongstack/i.test(k)) continue
    if (/project-server\.js/.test(k)) daemon.push(s)
    else if (/@wrongstack\/[a-z-]+-mcp\/dist\/cli\.js|wrongstack-mcp\/posta-kutusu\.cjs/.test(k)) {
      ;(kendiClaude !== null && s.ppid === kendiClaude ? kendi : yabanci).push(s)
    }
  }
  return { kendi, yabanci, daemon }
}

/** Ata zincirinde ilk claude.exe (betiği koşturan pencere); bulunamazsa null. */
function kendiClaudeBul(surecler, baslangic = process.pid) {
  const ata = new Map(surecler.map((s) => [s.pid, s]))
  let p = ata.get(baslangic)
  for (let i = 0; p && i < 20; i++) {
    if (/^claude(\.exe)?$/i.test(String(p.ad || ''))) return p.pid
    p = ata.get(p.ppid)
  }
  return null
}

/** Kurulu paket sürümleri package.json'daki sabit sürümlerle aynı mı? Farkları döndürür. */
function surumFarki(deps, kuruluSurum) {
  const fark = []
  for (const [ad, surum] of Object.entries(deps)) {
    const kurulu = kuruluSurum(ad)
    if (kurulu !== surum) fark.push(ad + ' beklenen ' + surum + ' kurulu ' + (kurulu || 'YOK'))
  }
  return fark
}

/** JSON metnindeki ham kontrol karakterlerini (kod < 32) boşluğa çevirir. */
function temizle(metin) {
  let s = ''
  for (const h of metin) s += h.charCodeAt(0) < 32 ? ' ' : h
  return s
}

function surecleriOku() {
  // PowerShell 5.1 ConvertTo-Json komut satırındaki kontrol karakterlerini kaçışlamaz; JSON.parse
  // "Bad control character" ile düşüyordu (2026-09-27 ölçüldü) → önce temizlenir.
  const ps =
    "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,Name,@{n='CommandLine';e={if($_.CommandLine){$_.CommandLine -replace '[\\x00-\\x1F]',' '}else{''}}} | ConvertTo-Json -Compress"
  const cikti = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 30000,
    maxBuffer: 64 * 1024 * 1024,
  }).trim()
  if (!cikti) return []
  // PowerShell tarafındaki temizlik yetmedi (09-27 ikinci ölçüm: yine "Bad control character").
  // -Compress çıktısında yapısal boşluk yok; ham kontrol karakteri yalnız dize içinde olabilir → boşluğa.
  const v = JSON.parse(temizle(cikti))
  return (Array.isArray(v) ? v : [v]).map((x) => ({
    pid: x.ProcessId,
    ppid: x.ParentProcessId,
    ad: x.Name || '',
    komut: x.CommandLine || '',
  }))
}

function yamalar(dizin = YAMALAR) {
  return fs.readdirSync(dizin).filter((d) => d.endsWith('.patch'))
}

/**
 * Yama adı `<paket>-<sürüm>-<konu>.patch`; hedef paket `@wrongstack/<paket>`. Yamalar bir paketin
 * TAM bir sürümü için yazılır (satır numaraları + bağlam); sürüm kayınca uymaz.
 */
function yamaHedefi(ad) {
  const m = String(ad).match(/^([a-z0-9-]+?)-(\d+\.\d+\.\d+)-.+\.patch$/)
  return m ? { paket: '@wrongstack/' + m[1], surum: m[2] } : null
}

/**
 * Her yamanın yazıldığı sürüm, hedef paketin KURULU sürümüyle aynı mı? Farkları döndürür.
 * (Doğrudan bağımlılık olmayan paketler için de çalışır: sage, sage-mcp'nin geçişli bağımlılığı.)
 * Niçin ayrı kontrol: sürüm kayınca `git apply` yine düşerdi ama "patch does not apply" ile — hangi
 * yamanın hangi sürüm için yazıldığını söylemezdi.
 */
function yamaSurumFarki(adlar, kuruluSurum) {
  const fark = []
  for (const ad of adlar) {
    const h = yamaHedefi(ad)
    if (!h) {
      fark.push('yama adi <paket>-<surum>-<konu>.patch bicimine uymuyor: ' + ad)
      continue
    }
    const kurulu = kuruluSurum(h.paket)
    if (kurulu !== h.surum) {
      fark.push('yama ' + ad + ' surum ' + h.surum + ' icin yazildi, kurulu ' + h.paket + ' ' + (kurulu || 'YOK') + ' — yama yeni surumde yeniden olculup uretilmeli')
    }
  }
  return fark
}

function kuruluSurumOku(ad) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ARAC, 'node_modules', ad, 'package.json'), 'utf8')).version
  } catch {
    return null
  }
}

/**
 * `git apply` çağrısı. Satır sonu iki ayrı yoldan bozuluyordu (2026-09-30 ölçüldü, sage index.js):
 *  (1) DEPO İÇİNDE: `.gitattributes` `*.js text` der, `core.eol` Windows'ta `native`=CRLF → yama
 *      UYGULANAN DOSYANIN TAMAMINI CRLF'e çevirir (0 → 13.378 CR, 496.951 → 510.491 bayt) ve geri alınca
 *      bayt bayt eski hâle dönmez (510.329). `core.autocrlf=false` bunu ENGELLEMEZ; `core.eol=lf` engeller.
 *      (Canlı kanban-mcp/cli.js bu yüzden bugün CRLF: 545 CR.)
 *  (2) DEPO DIŞINDA / yeni klonda: sistem ayarı `core.autocrlf=true` aynı sonucu verir; depo yerelinde
 *      `false` olduğundan aynı yama `--reverse --check`te "does not apply" verebilir.
 * İki bayrak birlikte sabitlenince sonuç makine ayarından bağımsız: dosya LF kalır, CRLF'e dönmüş bir
 * dosyanın `--reverse --check`i de geçer (öncül LF'ye normalize edilir).
 */
function gitApply(kok, yamaDosyasi, ek = [], stdio = 'inherit') {
  execFileSync('git', ['-c', 'core.autocrlf=false', '-c', 'core.eol=lf', 'apply', ...ek, yamaDosyasi], { cwd: kok, stdio, windowsHide: true })
}

function yamaYolu(y) {
  return path.join('tools', 'wrongstack-mcp', 'yamalar', y)
}

function yamaUygulu(y, kok = KOK) {
  try {
    gitApply(kok, yamaYolu(y), ['--reverse', '--check'], 'ignore')
    return true
  } catch {
    return false
  }
}

/** Doğrulama: sürümler, yamalar, .mcp.json'ın çalıştırdığı giriş dosyalarının sözdizimi. */
function denetle() {
  const hatalar = []
  const deps = JSON.parse(fs.readFileSync(path.join(ARAC, 'package.json'), 'utf8')).dependencies || {}
  hatalar.push(
    ...surumFarki(deps, (ad) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(ARAC, 'node_modules', ad, 'package.json'), 'utf8')).version
      } catch {
        return null
      }
    }),
  )
  hatalar.push(...yamaSurumFarki(yamalar(), kuruluSurumOku))
  for (const y of yamalar()) if (!yamaUygulu(y)) hatalar.push('yama uygulanmamis: ' + y)
  const mcp = JSON.parse(fs.readFileSync(path.join(KOK, '.mcp.json'), 'utf8')).mcpServers || {}
  for (const [ad, s] of Object.entries(mcp)) {
    if (!/wrongstack/.test(ad)) continue
    const giris = (s.args || []).find((a) => a.endsWith('.js') || a.endsWith('.cjs'))
    try {
      execFileSync(process.execPath, ['--check', path.join(KOK, giris)], { stdio: 'ignore', windowsHide: true })
    } catch {
      hatalar.push(ad + ' giris dosyasi calismiyor: ' + giris)
    }
  }
  return hatalar
}

/** package-lock.json'daki kilitli sürüm (kurulumdan ÖNCE hangi sürümün geleceği); yoksa null. */
function kilitSurumOku(ad) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ARAC, 'package-lock.json'), 'utf8')).packages['node_modules/' + ad].version
  } catch {
    return null
  }
}

function kur() {
  // Yama kilitli sürüme uymuyorsa daha HİÇBİR ŞEY durdurulmadan yüksek sesle düş (npm ci sonrası
  // düşmek pencerelerin sunucusunu kapatıp yamasız paket bırakırdı).
  const kilitFarki = yamaSurumFarki(yamalar(), kilitSurumOku)
  if (kilitFarki.length) throw new Error(kilitFarki.join(' · '))
  const surecler = surecleriOku()
  const { kendi, yabanci, daemon } = siniflandir(surecler, kendiClaudeBul(surecler))
  if (yabanci.length) {
    const pencereler = [...new Set(yabanci.map((s) => s.ppid))]
    throw new Error(
      pencereler.length + ' baska pencere acik (' + yabanci.length + ' MCP sureci, ebeveyn ' + pencereler.join(',') + ') — once o pencereleri kapat',
    )
  }
  for (const s of [...kendi, ...daemon]) {
    process.stdout.write('durduruluyor: ' + s.pid + ' ' + (daemon.includes(s) ? 'daemon' : 'bu pencerenin MCP sunucusu') + '\n')
    try {
      process.kill(s.pid)
    } catch {
      /* zaten kapanmış */
    }
  }
  if (kendi.length || daemon.length) execFileSync(process.execPath, ['-e', 'setTimeout(()=>{},2000)'], { windowsHide: true })
  process.stdout.write('npm ci --ignore-scripts ...\n')
  // .cmd dosyası Windows'ta shell ister; argümanlar sabittir (dış girdi yok).
  execFileSync('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], {
    cwd: ARAC,
    stdio: 'inherit',
    shell: true,
    windowsHide: true,
  })
  const kurulumFarki = yamaSurumFarki(yamalar(), kuruluSurumOku)
  if (kurulumFarki.length) throw new Error(kurulumFarki.join(' · '))
  for (const y of yamalar()) {
    gitApply(KOK, yamaYolu(y))
    process.stdout.write('yama uygulandi: ' + y + '\n')
  }
}

module.exports = { siniflandir, kendiClaudeBul, surumFarki, surecleriOku, temizle, yamaHedefi, yamaSurumFarki, gitApply, yamaYolu, yamaUygulu }

if (require.main === module) {
  try {
    const denetim = process.argv.includes('--denetle')
    if (!denetim) kur()
    const hatalar = denetle()
    if (hatalar.length) throw new Error(hatalar.join(' · '))
    process.stdout.write(denetim ? 'HAZIR\n' : 'HAZIR — WrongStack sunuculari her pencerede ilk cagrida kendiliginden acilir; /mcp ile yeniden baglamaya gerek yok\n')
  } catch (e) {
    process.stdout.write('HATA: ' + String(e.message).slice(0, 400) + '\n')
    process.exitCode = 1
  }
}
