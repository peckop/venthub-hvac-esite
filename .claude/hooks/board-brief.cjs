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

/** Loop hatırlatması bu yaştan sonra susar — sürekli nag etmesin (T085-VH). */
const LOOP_HATIRLATMA_PENCERESI_MS = 2 * 60 * 60 * 1000

let hepsi = []
let notes = []
let seritAldiMi = true
try {
  board.touch(sid) // kirayı yenile (aralık board.cjs'te kısılı)
  const events = board.readEvents()
  // BAYAT şeritler de gelsin: "listede yok" ile "sahipsiz kaldı" ayrı şeyler (T084-VH).
  hepsi = board.tumTalepler()
  const mine = hepsi.find(c => c.sid === sid)
  notes = board.notesFor(sid, mine && mine.lane, events)
  // Bu oturum HİÇ şerit talep etmiş mi? (TTL'e değil GEÇMİŞE bakıyoruz: bir kez claim
  // ettiyse loop'unu kurmuş sayılır, bayatlasa bile hatırlatma tekrar açılmasın.)
  const benim = events.filter(e => e.sid === sid)
  seritAldiMi = benim.some(e => e.type === 'claim')
  if (!seritAldiMi && benim.length > 0) {
    const ilk = Math.min(...benim.map(e => Date.parse(e.ts)).filter(Number.isFinite))
    if (Number.isFinite(ilk) && Date.now() - ilk > LOOP_HATIRLATMA_PENCERESI_MS) seritAldiMi = true
  }
} catch (e) {
  process.stderr.write(`[board-brief] pano okunamadı (fail-open): ${e && e.message}\n`)
  process.exit(0)
}

const others = hepsi.filter(c => c.sid !== sid)
// SESSİZLİK KURALINA EK (T085-VH): şerit almamış TAZE oturum, pano boş olsa bile loop
// hatırlatmasını almalı — Recep'in sabah "günaydın" yazıp başka hiçbir şey yazmaması için
// komutu İNSAN değil bu kanca taşıyor. Şerit alınınca hatırlatma kendiliğinden kapanır.
if (others.length === 0 && notes.length === 0 && seritAldiMi) process.exit(0)

const lines = []
if (others.length > 0) {
  lines.push('PANO: ' + others.map(c => {
    const bayat = c.bayat ? ` ⚠BAYAT ${c.yasDk}dk atış yok, bırakılmadı` : ''
    return `${c.lane}=${String(c.sid).slice(0, 8)} (${c.globs.join(' ')}, ${c.yasDk}dk)${bayat}`
  }).join(' · '))
}
if (!seritAldiMi) {
  lines.push(
    'LOOP: zincirin kurulu değilse docs/standards/session-loop-ritual.md KOMUT-B ile kur ' +
    '(OPS-AUDIT oturumuysan KOMUT-A) + yedek olarak CronCreate ile 30dk recurring tur kur ' +
    '(dakika 0/30 dışı). Şerit talep edince bu satır kendiliğinden susar.',
  )
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
