#!/usr/bin/env node
/**
 * SessionStart hook — OTURUM KİMLİĞİ + PANO DURUMU bağlama enjekte edilir.
 *
 * Neden: ajan "ben hangi oturumum" sorusunu tahmin etmemeli. Claude Code oturum kimliğini
 * hook'a stdin ile verir; buradan bağlama yazılınca ajan onu OKUR. Kimlik compact'ten de
 * sağ çıkar (bağlam sıfırlansa bile SessionStart yeniden koşar).
 *
 * Ayrıca panonun o anki hâli (kim hangi şeritte, okunmamış notlar) ilk turda görünür olur —
 * böylece kullanıcı mesaj taşıyıcısı olmaktan kurtulur.
 *
 * stdin: { session_id, cwd, ... }
 * stdout: { hookSpecificOutput: { hookEventName, additionalContext } }
 */
const fs = require('fs')
const path = require('path')

function readStdin() {
  try { return fs.readFileSync(0, 'utf8') } catch { return '' }
}

let input = {}
try { input = JSON.parse(readStdin() || '{}') } catch { input = {} }

const sid = input.session_id || ''
if (!sid) process.exit(0)

let context = `Oturum kimliğin: ${sid}\n`

try {
  const board = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'board.cjs'))
  const live = board.liveClaims()
  const mine = live.find(c => c.sid === sid)

  context += mine
    ? `Şeridin: ${mine.lane} — ${mine.globs.join(', ')}\n`
    : `Şeridin: TALEP EDİLMEMİŞ. Çok dosyalı bir işe başlamadan önce şeridi al:\n` +
      `  node scripts/board/board.cjs claim --sid ${sid} --lane <ad> --globs "src/**"\n`

  context += board.summary(sid) + '\n'

  const notes = board.notesFor(sid, mine && mine.lane)
  if (notes.length > 0) {
    context += 'OKUNMAMIŞ NOTLAR:\n' +
      notes.map(n => `  · ${String(n.sid).slice(0, 8)} → ${n.to || 'herkes'}: ${n.text}`).join('\n') + '\n'
  }
} catch (e) {
  // Pano okunamazsa oturum yine de açılır — koordinasyon katmanı fail-open (bkz. lane-guard).
  context += `(pano okunamadı: ${e && e.message})\n`
}

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: context,
  },
}))
