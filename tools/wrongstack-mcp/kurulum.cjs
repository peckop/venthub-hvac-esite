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
  const v = JSON.parse(cikti)
  return (Array.isArray(v) ? v : [v]).map((x) => ({
    pid: x.ProcessId,
    ppid: x.ParentProcessId,
    ad: x.Name || '',
    komut: x.CommandLine || '',
  }))
}

function yamalar() {
  return fs.readdirSync(YAMALAR).filter((d) => d.endsWith('.patch'))
}

function yamaUygulu(y) {
  try {
    execFileSync('git', ['apply', '--reverse', '--check', path.join('tools', 'wrongstack-mcp', 'yamalar', y)], {
      cwd: KOK,
      stdio: 'ignore',
      windowsHide: true,
    })
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

function kur() {
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
  for (const y of yamalar()) {
    execFileSync('git', ['apply', path.join('tools', 'wrongstack-mcp', 'yamalar', y)], { cwd: KOK, stdio: 'inherit', windowsHide: true })
    process.stdout.write('yama uygulandi: ' + y + '\n')
  }
}

module.exports = { siniflandir, kendiClaudeBul, surumFarki, surecleriOku }

if (require.main === module) {
  try {
    const denetim = process.argv.includes('--denetle')
    if (!denetim) kur()
    const hatalar = denetle()
    if (hatalar.length) throw new Error(hatalar.join(' · '))
    process.stdout.write(denetim ? 'HAZIR\n' : 'HAZIR — bu pencerede /mcp ile WrongStack sunucularini yeniden bagla, sonra oteki pencereleri ac\n')
  } catch (e) {
    process.stdout.write('HATA: ' + String(e.message).slice(0, 400) + '\n')
    process.exitCode = 1
  }
}
