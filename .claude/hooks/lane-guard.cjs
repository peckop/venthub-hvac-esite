#!/usr/bin/env node
/**
 * PreToolUse hook — ŞERİT KORUMASI (çok-oturumlu çakışma engeli).
 *
 * Başka bir Claude Code oturumunun canlı olarak talep ettiği yola yazmayı engeller.
 * Bugüne kadar çakışmayı ancak MERGE anında (ya da hiç) görüyorduk; bu kapı yazmadan
 * ÖNCE söyler.
 *
 * FAIL-OPEN — bilinçli sapma: VentHub kuralı "yeni kapıya geçiş modu koyma" der ama o kural
 * GÜVENLİK kapıları içindir. Bu bir KOORDİNASYON kapısı: pano okunamazsa fail-closed olmak
 * üç oturumu birden durdurur (kendi kendine kesinti). Pano bozulursa yazma serbest kalır ve
 * son emniyet git'tir. Sessiz de değil: hata stderr'e düşer.
 *
 * stdin: { session_id, tool_name, tool_input: { file_path, ... }, cwd? }
 * Çıkış: exit 2 = blokla (stderr Claude'a döner) · exit 0 = izin ver.
 */
const fs = require('fs')
const path = require('path')

function readStdin() {
  try { return fs.readFileSync(0, 'utf8') } catch { return '' }
}

let input = {}
try { input = JSON.parse(readStdin() || '{}') } catch { process.exit(0) }

const filePath = (input.tool_input && input.tool_input.file_path) || ''
const sid = input.session_id || ''
if (!filePath || !sid) process.exit(0)

let board
try {
  board = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'board.cjs'))
} catch (e) {
  process.stderr.write(`[lane-guard] pano yüklenemedi (fail-open): ${e && e.message}\n`)
  process.exit(0)
}

let conflict = null
try {
  conflict = board.findConflict(filePath, sid, input.cwd || process.cwd())
} catch (e) {
  process.stderr.write(`[lane-guard] pano okunamadı (fail-open): ${e && e.message}\n`)
  process.exit(0)
}

if (!conflict) process.exit(0)

const { claim, glob, rel } = conflict
process.stderr.write(
  `[lane-guard] "${rel}" BAŞKA bir oturumun şeridinde — yazma bloklandı.\n` +
  `  Şerit: ${claim.lane} · oturum ${String(claim.sid).slice(0, 8)} · kural: ${glob}\n` +
  `  Seçenekler: (a) o oturuma not bırak — ` +
  `node scripts/board/board.cjs note --sid <senin-sid> --to ${claim.lane} "…" ` +
  `(b) devretmesini iste (c) gerçekten senin işinse şeridi yeniden talep et.\n` +
  `  Not: bu bir kilit değil kalite ağıdır; kullanıcı dosyayı elle düzenleyebilir.\n`
)
process.exit(2)
