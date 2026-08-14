#!/usr/bin/env node
/**
 * UserPromptSubmit hook — SESSİZ pano brifingi + kira yenileme.
 *
 * Amaç: "eş controller ne yapıyor?" sorusunun cevabı, sormaya gerek kalmadan bağlamda olsun.
 * Bu, Recep'i mesaj taşıyıcısı olmaktan çıkaran katman.
 *
 * SESSİZLİK KURALI: söyleyecek bir şey yoksa HİÇBİR ŞEY yazmaz. Her tura birkaç satır
 * eklemek bağlamı kirletir ve zamanla okunmaz hâle gelir; bu yüzden yalnız (a) başka bir
 * oturumun canlı şeridi varsa ya da (b) OKUNMAMIŞ not varsa konuşur. Teslim edilen notlar
 * `seen` ile işaretlenir — aksi hâlde aynı not sonsuza dek basılır ve kural kendi kendini
 * bozar.
 *
 * KALP ATIŞI burada: kira modeli atış olmadan çalışmaz, atışı elle yapmayı beklemek
 * "hatırlamaya bağlı adım"ı katmanın merkezine geri koyar. Bu kanca zaten her turda
 * koşuyor ve oturum kendi dosyasına yazıyor (çekişme yok) → atışın doğal yeri.
 *
 * stdin: { session_id, ... } · stdout: hookSpecificOutput.additionalContext
 */
const fs = require('fs')
const path = require('path')

function readStdin() {
  try { return fs.readFileSync(0, 'utf8') } catch { return '' }
}

let input = {}
try { input = JSON.parse(readStdin() || '{}') } catch { process.exit(0) }

const sid = input.session_id || ''
if (!sid) process.exit(0)

let board
try {
  board = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'board.cjs'))
} catch { process.exit(0) } // pano yoksa sessizce geç (koordinasyon katmanı fail-open)

let live = []
let notes = []
try {
  board.touch(sid) // kirayı yenile (aralık board.cjs'te kısılı)
  const events = board.readEvents()
  live = board.liveClaims()
  const mine = live.find(c => c.sid === sid)
  notes = board.notesFor(sid, mine && mine.lane, events)
} catch (e) {
  process.stderr.write(`[board-brief] pano okunamadı (fail-open): ${e && e.message}\n`)
  process.exit(0)
}

const others = live.filter(c => c.sid !== sid)
if (others.length === 0 && notes.length === 0) process.exit(0) // söyleyecek bir şey yok

const lines = []
if (others.length > 0) {
  lines.push('PANO: ' + others.map(c => {
    const mins = Math.max(0, Math.round((Date.now() - Date.parse(c.heartbeat)) / 60000))
    return `${c.lane}=${String(c.sid).slice(0, 8)} (${c.globs.join(' ')}, ${mins}dk)`
  }).join(' · '))
}
if (notes.length > 0) {
  lines.push('NOT: ' + notes.map(n => `${String(n.sid).slice(0, 8)}→${n.to || 'herkes'} "${n.text}"`).join(' | '))
  try { board.markSeen(sid, notes) } catch { /* işaretlenemedi: not tekrar gelir, zararsız */ }
}

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'UserPromptSubmit',
    additionalContext: lines.join('\n'),
  },
}))
