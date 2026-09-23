#!/usr/bin/env node
'use strict'
/**
 * browser-use için AYRI Chrome profili — Recep'in günlük profili ASLA açılmaz.
 *
 * NİÇİN: browser-use (CLI 3.0 / eklenti MCP'si) `BU_CDP_URL`/`BU_CDP_WS` verilmezse "local" kipe düşer ve
 * Chrome'un VARSAYILAN kullanıcı dizinindeki DevToolsActivePort'u arar (browser-harness daemon.py, ölçüldü
 * 2026-09-23). Yani çıplak çağrı Recep'in oturum açılmış profiline bağlanır. Bu betik ayrı bir
 * `--user-data-dir` + hata ayıklama portuyla Chrome başlatır; araç YALNIZ `BU_CDP_URL` ile ona bağlanır.
 *
 * Kullanım:
 *   node scripts/tarayici/bu-profil.cjs            → profili başlat (açıksa dokunmaz), CDP'yi doğrula
 *   node scripts/tarayici/bu-profil.cjs --durum    → yalnız CDP ayakta mı (çıkış 0/1)
 *   Sonra: BU_NAME=vhprofil BU_CDP_URL=http://127.0.0.1:9333 uvx --python 3.12 browser-use@latest <<'PY' ... PY
 * Ortam: BU_PROFIL_DIZIN (varsayılan C:/tmp/bu-profil), BU_PROFIL_PORT (varsayılan 9333), CHROME_YOLU.
 * ⛔Profil dizini Chrome'un varsayılan kullanıcı dizini (…/Google/Chrome/User Data) ya da onun altıysa REDDEDER.
 */
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const { spawn } = require('node:child_process')

const VARSAYILAN_DIZIN = 'C:/tmp/bu-profil'
const VARSAYILAN_PORT = 9333

/** Saf: Chrome'un bu makinedeki varsayılan kullanıcı dizinleri (Recep'in profili burada yaşar). */
function varsayilanChromeDizinleri(ortam = process.env, ev = os.homedir()) {
  const yerel = ortam.LOCALAPPDATA || path.join(ev, 'AppData', 'Local')
  return [
    path.join(yerel, 'Google', 'Chrome', 'User Data'),
    path.join(yerel, 'Google', 'Chrome Beta', 'User Data'),
    path.join(ev, 'Library', 'Application Support', 'Google', 'Chrome'),
    path.join(ev, '.config', 'google-chrome'),
  ]
}

const norm = (p) => path.resolve(p).replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase()

/** Saf: profil dizini güvenli mi? Varsayılan dizin ya da altı → { ok:false, sebep }. */
function profilGuvenliMi(dizin, varsayilanlar) {
  if (!dizin || !String(dizin).trim()) return { ok: false, sebep: 'profil dizini bos' }
  const d = norm(dizin)
  for (const v of varsayilanlar) {
    const n = norm(v)
    if (d === n || d.startsWith(n + '/')) return { ok: false, sebep: `profil dizini Chrome'un varsayilan kullanici dizini (${v}) — Recep'in profili, KULLANILMAZ` }
  }
  return { ok: true }
}

/** Saf: portu doğrula (1024-65535). */
function portGecerliMi(p) {
  const n = Number(p)
  return Number.isInteger(n) && n >= 1024 && n <= 65535
}

async function cdpSurum(port) {
  try {
    const r = await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(2000) })
    return r.ok ? await r.json() : null
  } catch {
    return null
  }
}

function chromeYolu() {
  if (process.env.CHROME_YOLU) return process.env.CHROME_YOLU
  const aday = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
  ]
  return aday.find((p) => fs.existsSync(p)) || null
}

async function main() {
  const dizin = process.env.BU_PROFIL_DIZIN || VARSAYILAN_DIZIN
  const port = process.env.BU_PROFIL_PORT || VARSAYILAN_PORT
  if (!portGecerliMi(port)) { console.error(`bu-profil: gecersiz port ${port}`); process.exit(2) }
  const g = profilGuvenliMi(dizin, varsayilanChromeDizinleri())
  if (!g.ok) { console.error(`bu-profil: REDDEDILDI — ${g.sebep}`); process.exit(2) }

  const acik = await cdpSurum(port)
  if (process.argv.includes('--durum')) {
    console.log(acik ? `ACIK ${acik.Browser} port ${port}` : `KAPALI port ${port}`)
    process.exit(acik ? 0 : 1)
  }
  if (acik) {
    console.log(`bu-profil: zaten acik (${acik.Browser}, port ${port}) — dokunulmadi`)
  } else {
    const chrome = chromeYolu()
    if (!chrome) { console.error('bu-profil: Chrome bulunamadi (CHROME_YOLU ver)'); process.exit(1) }
    fs.mkdirSync(dizin, { recursive: true })
    const c = spawn(chrome, [`--user-data-dir=${path.resolve(dizin)}`, `--remote-debugging-port=${port}`, '--no-first-run', '--no-default-browser-check', 'about:blank'], { detached: true, stdio: 'ignore' })
    c.unref()
    let s = null
    for (let i = 0; i < 30 && !s; i++) { await new Promise((r) => setTimeout(r, 500)); s = await cdpSurum(port) }
    if (!s) { console.error(`bu-profil: Chrome basladi ama CDP ${port} 15 sn icinde cevap vermedi`); process.exit(1) }
    console.log(`bu-profil: basladi (${s.Browser}, port ${port}, dizin ${path.resolve(dizin)})`)
  }
  console.log(`kullan: BU_NAME=vhprofil BU_CDP_URL=http://127.0.0.1:${port} uvx --python 3.12 browser-use@latest <<'PY' ... PY`)
}

if (require.main === module) main()

module.exports = { profilGuvenliMi, varsayilanChromeDizinleri, portGecerliMi }
