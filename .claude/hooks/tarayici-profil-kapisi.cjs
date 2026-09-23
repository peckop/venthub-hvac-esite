#!/usr/bin/env node
'use strict'
/**
 * PreToolUse kancası — browser-use yalnız AYRI profile bağlanır; Recep'in Chrome'una giden yol kapalı.
 *
 * NİÇİN (2026-09-23 ölçümü, browser-harness daemon.py): browser-use'a `BU_CDP_URL`/`BU_CDP_WS`/`BU_BROWSER_ID`
 * verilmezse "local" kipe düşer, Chrome'un VARSAYILAN kullanıcı dizinindeki DevToolsActivePort'u arar, sonra
 * 9222/9223'ü yoklar. Recep'in profilinde uzaktan hata ayıklama bugün kapalı → çağrı hata verir, AMA hata metni
 * "chrome://inspect'te kutuyu işaretle" der; bir ajan bunu Recep'e yaptırırsa oturum açılmış profil ajana açılır.
 * Doğru yol: `node scripts/tarayici/bu-profil.cjs` + `BU_CDP_URL=http://127.0.0.1:9333`.
 *
 * Kapsam:
 *   - `mcp__plugin_browser-use_*` araçları: süreç ortamında BU_CDP_URL/BU_CDP_WS/BU_BROWSER_ID yoksa → deny.
 *     (MCP sunucusu Claude Code'un ortamını miras alır; ortamda yoksa sunucuda da yoktur.)
 *   - Bash: `browser-use` CLI'ı çağıran komut, komut satırında ya da ortamda bu değişkenlerden biri yoksa → deny.
 *   - Adres 9222/9223 portunu gösteriyorsa → deny (varsayılan profilin olağan portu; ayrı profil 9333).
 * Fail-open YALNIZ bozuk girdi için (stdin boş/bozuk JSON → karışmaz, stderr'e yazar).
 */
const fs = require('node:fs')

const DEGISKENLER = ['BU_CDP_URL', 'BU_CDP_WS', 'BU_BROWSER_ID']
const YASAK_PORT = /(?:127\.0\.0\.1|localhost|\[::1\]):(9222|9223)\b/i
const DOGRU_YOL = 'Doğru yol: `node scripts/tarayici/bu-profil.cjs` (ayrı profil, port 9333), sonra `BU_NAME=vhprofil BU_CDP_URL=http://127.0.0.1:9333 uvx --python 3.12 browser-use@latest <<\'PY\' ... PY`.'

/** Saf: Bash komutu browser-use CLI'ını çağırıyor mu? (`browser-use` komutu ya da `uvx ... browser-use`). Salt metin geçişi sayılmaz. */
function browserUseCagrisiMi(komut) {
  if (!komut) return false
  return /(?:^|[;&|(\s])(?:uvx\s+(?:--?\S+\s+(?:\S+\s+)?)*)?browser-use(?:@\S+)?(?=\s|$|<)/.test(komut) &&
    !/^\s*(?:grep|rg|cat|echo|ls|git)\b/.test(komut)
}

/** Saf: komut satırı ya da ortam ayrı bir tarayıcı adresi veriyor mu? Döner: { var: bool, adres?: string }. */
function adresBul(komut, ortam) {
  for (const d of DEGISKENLER) {
    const m = komut && komut.match(new RegExp(`\\b${d}=("[^"]*"|'[^']*'|\\S+)`))
    if (m) return { var: true, adres: m[1].replace(/^["']|["']$/g, '') }
  }
  for (const d of DEGISKENLER) if (ortam[d]) return { var: true, adres: ortam[d] }
  return { var: false }
}

/** Saf: araç çağrısı için hüküm. null = geç; string = red sebebi. */
function hukum(girdi, ortam) {
  const arac = girdi && girdi.tool_name
  if (!arac) return null
  if (/^mcp__plugin_browser-use/.test(arac)) {
    const a = adresBul('', ortam)
    if (!a.var) return `[tarayici-profil-kapisi] ${arac} DURDURULDU: ortamda BU_CDP_URL yok → browser-use Recep'in varsayılan Chrome profiline bağlanmaya çalışır. ${DOGRU_YOL}`
    if (YASAK_PORT.test(a.adres)) return `[tarayici-profil-kapisi] ${arac} DURDURULDU: adres 9222/9223 (varsayılan profilin olağan portu). ${DOGRU_YOL}`
    return null
  }
  if (arac === 'Bash') {
    const komut = girdi.tool_input && girdi.tool_input.command
    if (!browserUseCagrisiMi(komut)) return null
    const a = adresBul(komut, ortam)
    if (!a.var) return `[tarayici-profil-kapisi] browser-use komutu DURDURULDU: BU_CDP_URL verilmemiş → Recep'in varsayılan Chrome profiline bağlanmaya çalışır. ${DOGRU_YOL}`
    if (YASAK_PORT.test(a.adres)) return `[tarayici-profil-kapisi] browser-use komutu DURDURULDU: adres 9222/9223 (varsayılan profilin olağan portu). ${DOGRU_YOL}`
  }
  return null
}

function main() {
  let raw = ''
  try { raw = fs.readFileSync(0, 'utf8') } catch { /* stdin yok */ }
  if (!raw.trim()) { process.stderr.write('[tarayici-profil-kapisi] stdin bos, karisilmadi\n'); return }
  let girdi
  try { girdi = JSON.parse(raw) } catch { process.stderr.write('[tarayici-profil-kapisi] stdin bozuk JSON, karisilmadi\n'); return }
  const sebep = hukum(girdi, process.env)
  if (sebep) {
    console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: sebep } }))
  }
}

if (require.main === module) main()

module.exports = { hukum, browserUseCagrisiMi, adresBul }
