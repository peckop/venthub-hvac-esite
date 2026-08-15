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
const { spawn } = require('child_process')

function readStdin() {
  try { return fs.readFileSync(0, 'utf8') } catch { return '' }
}

let input = {}
try { input = JSON.parse(readStdin() || '{}') } catch { input = {} }

const sid = input.session_id || ''
if (!sid) process.exit(0)

/**
 * Registry oto-senkronu — KOPARILMIŞ süreç olarak başlatılır.
 *
 * Neden burada: `post-merge` kancası yalnız yerel `git pull/merge`'de koşar, biz ise PR'ları
 * `gh pr merge` ile GitHub üzerinden kapatıyoruz → senkron hiç çalışmıyordu. CI'a taşımak
 * ÇÖZÜM DEĞİL: registry `~/.orion/registry.db`, yani bu makinedeki yerel bir dosya; runner'da
 * boş bir DB yaratılır ve silinir (yeşil yanar, hiçbir şey senkronlanmaz). Üç oturum da aynı
 * makinede olduğu için doğru yer oturum açılışıdır.
 *
 * Neden koparılmış: `git fetch` ağ işidir; oturum açılışını bekletmemeli. Çıktı
 * `~/.orion/registry-autosync.log`'a düşer.
 */
try {
  const child = spawn(process.execPath, [path.join(__dirname, '..', '..', 'scripts', 'board', 'registry-autosync.cjs')], {
    detached: true,
    stdio: 'ignore',
  })
  child.unref()
} catch { /* senkron başlatılamadıysa oturumu bloklama — bir sonraki açılışta tekrar denenir */ }

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
