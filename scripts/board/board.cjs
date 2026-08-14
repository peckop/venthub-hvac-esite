#!/usr/bin/env node
/**
 * Çok-oturumlu controller panosu — ANLIK koordinasyon katmanı.
 *
 * NEDEN VAR: birden çok Claude Code oturumu aynı repoda paralel çalışıyor. Kimin neye
 * dokunduğunu öğrenmenin tek yolu `git status` çekmek ya da Recep'in mesaj taşımasıydı;
 * ikisi de tesadüfe bağlı. Elle tutulan kayıtlar (şerit panosu, registry) aynı gün üç kez
 * bayatladı — ortak kök: HATIRLAMAYA bağlı adım.
 *
 * NE DEĞİL: bu bir kilit değil, git'in yerine de geçmez. Son emniyet her zaman git'tir
 * (dal-başına-iş + PR). Bu katman, çakışmayı MERGE'DEN ÖNCE görünür kılar.
 *
 * NEDEN GIT'TE DEĞİL: git'e yazılan pano commit/push/pull'a bağlıdır — merge zamanlı bir
 * kanaldır, aynı saat içindeki çakışmayı yapısal olarak göremez. Oturumların hepsi aynı
 * makinede olduğu için dosya sistemi zaten paylaşımlı: pano anlık olabilir.
 *
 * NEDEN OTURUM BAŞINA AYRI DOSYA: tek bir jsonl'e üç süreç aynı anda append ederse
 * (Windows'ta atomiklik garanti değil) satırlar iç içe geçebilir. Her oturum YALNIZ kendi
 * dosyasına yazar, okuma hepsinin birleşimidir → yazma çekişmesi tanımı gereği yok.
 *
 * KALICI iş durumu (T00X-VH %70 gibi) buraya YAZILMAZ — o Orion registry'nin işi.
 * Pano TTL'li ve süpürülebilir; registry kalıcıdır. İkisini karıştırmak panoyu şişirir.
 */
const fs = require('fs')
const path = require('path')
const os = require('os')
const { execFileSync } = require('child_process')

const BOARD_DIR = process.env.VENTHUB_BOARD_DIR || path.join('C:', 'tmp', 'venthub-board')
/** Kira ömrü: bu süre atış almayan talep BAYAT sayılır ve engellemez (ölü oturum kilitlemesin). */
const DEFAULT_TTL_MS = 4 * 60 * 60 * 1000
/** Bu yaştan eski dosyalar hiç OKUNMAZ (sınırsız büyümeye karşı; pano anlık kanaldır). */
const PRUNE_MS = 24 * 60 * 60 * 1000
/** Kalp atışı bu sıklıktan daha sık yazılmaz (her tur satır eklemek dosyayı şişirir). */
const HEARTBEAT_MIN_INTERVAL_MS = 10 * 60 * 1000

function ensureDir() {
  try { fs.mkdirSync(BOARD_DIR, { recursive: true }) } catch { /* yoksay */ }
}

function sessionFile(sid) {
  const safe = String(sid || 'unknown').replace(/[^\w.-]/g, '_')
  return path.join(BOARD_DIR, `events.${safe}.jsonl`)
}

/** Tek satır append — oturum kendi dosyasına yazar, çekişme yok. */
function append(sid, event) {
  ensureDir()
  const line = JSON.stringify({ ts: new Date().toISOString(), sid, ...event }) + '\n'
  fs.appendFileSync(sessionFile(sid), line, 'utf8')
}

/**
 * Kalp atışı — ama YALNIZ gerekiyorsa. Kira modeli atış olmadan çalışmaz; atışı elle
 * yapmayı beklemek "hatırlamaya bağlı adım"ı katmanın merkezine geri koyar. Bu yüzden
 * `board-brief` her turda burayı çağırır, biz de aralığı burada kısarız.
 * @returns {boolean} atış yazıldı mı
 */
function touch(sid, minIntervalMs = HEARTBEAT_MIN_INTERVAL_MS) {
  let lastTs = 0
  try {
    const raw = fs.readFileSync(sessionFile(sid), 'utf8')
    const lines = raw.split('\n').filter(l => l.trim())
    for (let i = lines.length - 1; i >= 0; i--) {
      try { const e = JSON.parse(lines[i]); lastTs = Date.parse(e.ts) || 0; break } catch { /* bozuk satır */ }
    }
  } catch { return false } // dosya yok = bu oturum hiç talep etmemiş, atacak kalp yok
  if (Date.now() - lastTs < minIntervalMs) return false
  append(sid, { type: 'heartbeat' })
  return true
}

/**
 * Tüm oturum dosyalarını oku.
 * - PRUNE_MS'ten eski dosyalar hiç AÇILMAZ (maliyet sınırı).
 * - Bozuk satır atlanır ama SESSİZ DEĞİL: stderr'e uyarı düşer (fail-open'ın sessiz
 *   olmaması cetvelin yazılı kuralı; bozuk tek satır bir şeridin korumasını düşürebilir).
 */
function readEvents() {
  ensureDir()
  let files = []
  try { files = fs.readdirSync(BOARD_DIR).filter(f => f.startsWith('events.') && f.endsWith('.jsonl')) } catch (e) {
    warn(`pano dizini okunamadı: ${e && e.message}`)
    return []
  }
  const out = []
  const cutoff = Date.now() - PRUNE_MS
  for (const f of files) {
    const full = path.join(BOARD_DIR, f)
    try { if (fs.statSync(full).mtimeMs < cutoff) continue } catch { continue }
    let raw = ''
    try { raw = fs.readFileSync(full, 'utf8') } catch (e) { warn(`okunamadı ${f}: ${e && e.message}`); continue }
    let bad = 0
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue
      try { out.push(JSON.parse(line)) } catch { bad++ }
    }
    if (bad > 0) warn(`${f}: ${bad} bozuk satır atlandı — o şeridin koruması eksik olabilir`)
  }
  out.sort((a, b) => String(a.ts).localeCompare(String(b.ts)))
  return out
}

function warn(msg) {
  try { process.stderr.write(`[board] ${msg}\n`) } catch { /* yoksay */ }
}

/**
 * Şu an CANLI olan talepler. Kurallar:
 *  - release edilmiş şerit düşer,
 *  - TTL dolmuş talep düşer (ölü oturum kilitlemez),
 *  - aynı oturum tekrar claim ederse globlar BİRLEŞTİRİLİR ve KIDEM (ilk ts) korunur
 *    — "şeridimi genişleteyim" hareketi eskisini sessizce bırakmasın diye; daraltmak
 *    isteyen önce `release` eder.
 */
function liveClaims(now = Date.now()) {
  const events = readEvents()
  const bySession = new Map()
  for (const e of events) {
    if (e.type === 'claim') {
      const globs = Array.isArray(e.globs) ? e.globs : []
      const prev = bySession.get(e.sid)
      bySession.set(e.sid, {
        sid: e.sid,
        lane: e.lane || (prev && prev.lane) || 'lane',
        globs: prev ? [...new Set([...prev.globs, ...globs])] : globs,
        ts: prev ? prev.ts : e.ts, // kıdem korunur
        heartbeat: e.ts,
        ttlMs: typeof e.ttlMs === 'number' ? e.ttlMs : DEFAULT_TTL_MS,
      })
    } else if (e.type === 'heartbeat') {
      const c = bySession.get(e.sid)
      if (c) c.heartbeat = e.ts
    } else if (e.type === 'release') {
      bySession.delete(e.sid)
    }
  }
  const live = []
  for (const c of bySession.values()) {
    const age = now - Date.parse(c.heartbeat)
    if (Number.isFinite(age) && age <= c.ttlMs) live.push(c)
  }
  // En erken talep önce (çakışan yol iddialarında deterministik sonuç — bkz. findConflict).
  live.sort((a, b) => String(a.ts).localeCompare(String(b.ts)))
  return live
}

/** Glob → RegExp. `**` her şeyi, `*` tek segmenti karşılar. */
function globToRegExp(glob) {
  const norm = String(glob).replace(/\\/g, '/')
  let re = ''
  for (let i = 0; i < norm.length; i++) {
    const ch = norm[i]
    if (ch === '*') {
      if (norm[i + 1] === '*') { re += '.*'; i++; if (norm[i + 1] === '/') i++ }
      else re += '[^/]*'
    } else if ('\\^$+?.()|{}[]'.includes(ch)) {
      re += '\\' + ch
    } else {
      re += ch
    }
  }
  return new RegExp('^' + re + '$', 'i')
}

/**
 * Dosyanın ait olduğu repo kökü. `cwd`'ye GÜVENİLMEZ: bu oturumda birden çok çalışma
 * dizini kayıtlı ve `EnterWorktree` cwd'yi değiştiriyor; alt dizinden koşulduğunda da
 * cwd kök değildir. İkisinde de yol repo-göreli olmaz, hiçbir glob tutmaz ve koruma
 * SESSİZCE düşer (yanlış-negatif). Kökü git'ten sorarız.
 */
function repoRootFor(filePath) {
  const norm = String(filePath).replace(/\\/g, '/')
  const dir = norm.endsWith('/') ? norm : path.posix.dirname(norm)
  try {
    return execFileSync('git', ['-C', dir, 'rev-parse', '--show-toplevel'], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim().replace(/\\/g, '/')
  } catch { return '' }
}

/** Mutlak/göreli yolu repo-göreli hâle getir (pano yolları repo-göreli tutulur). */
function toRepoRelative(filePath, repoRoot) {
  const norm = String(filePath).replace(/\\/g, '/')
  const roots = [repoRoot, repoRootFor(norm), process.cwd()]
    .filter(Boolean)
    .map(r => String(r).replace(/\\/g, '/').replace(/\/$/, ''))
  for (const root of roots) {
    if (norm.toLowerCase().startsWith(root.toLowerCase() + '/')) return norm.slice(root.length + 1)
  }
  return norm.replace(/^\.\//, '')
}

/**
 * Bu yol BAŞKA bir oturumun canlı talebine giriyor mu?
 *
 * "EN ERKEN KAZANIR" (cetvel §K2): benim talebimden SONRA gelen bir talep beni bloklamaz.
 * Aksi hâlde aynı yolu iki oturum talep ettiğinde İKİSİ de yazamaz — karşılıklı kilit,
 * yani katmanın kendisi kesinti kaynağı olur. Kıdemli olan çalışır, geç gelen engellenir.
 */
function findConflict(filePath, sid, repoRoot) {
  const rel = toRepoRelative(filePath, repoRoot)
  const live = liveClaims()
  const mine = live.find(c => c.sid === sid)
  for (const c of live) {
    if (c.sid === sid) continue
    if (mine && String(c.ts).localeCompare(String(mine.ts)) > 0) continue // ben daha kıdemliyim
    for (const g of c.globs) {
      if (globToRegExp(g).test(rel)) return { claim: c, glob: g, rel }
    }
  }
  return null
}

/** İnsan/ajan için kısa pano özeti (birkaç satır). */
function summary(sid) {
  const live = liveClaims()
  if (live.length === 0) return 'PANO: canlı talep yok.'
  const lines = live.map(c => {
    const mine = c.sid === sid ? ' (sen)' : ''
    const mins = Math.max(0, Math.round((Date.now() - Date.parse(c.heartbeat)) / 60000))
    return `  · ${c.lane}${mine} — ${c.globs.join(', ')} [${c.sid.slice(0, 8)}, ${mins}dk önce]`
  })
  return 'PANO — canlı şeritler:\n' + lines.join('\n')
}

/** Bu oturumun teslim aldığı son not zamanı (`seen` işareti). */
function lastSeen(sid, events) {
  let last = ''
  for (const e of events || []) {
    if (e.type === 'seen' && e.sid === sid && typeof e.upto === 'string' && e.upto > last) last = e.upto
  }
  return last
}

/**
 * OKUNMAMIŞ notlar. `seen` işaretiyle filtrelenir; yoksa aynı not her turda tekrar basılır
 * ve brifingin tek değeri olan "sessizlik kuralı" zamanla bozulur (gürültü → okunmaz katman).
 */
function notesFor(sid, lane, events) {
  const evs = events || readEvents()
  const since = lastSeen(sid, evs)
  return evs.filter(e =>
    e.type === 'note' &&
    e.sid !== sid &&
    String(e.ts) > since &&
    (!e.to || e.to === sid || (lane && e.to === lane))
  ).slice(-5)
}

/** Teslim edilen notları okundu işaretle (append-only modele sadık: kendi dosyana yazarsın). */
function markSeen(sid, notes) {
  if (!notes || notes.length === 0) return
  const upto = notes.map(n => String(n.ts)).sort().pop()
  append(sid, { type: 'seen', upto })
}

module.exports = {
  BOARD_DIR, DEFAULT_TTL_MS, PRUNE_MS,
  append, touch, readEvents, liveClaims, findConflict, summary,
  notesFor, markSeen, lastSeen,
  globToRegExp, toRepoRelative, repoRootFor,
}

/* ---------------------------- CLI ---------------------------- */
if (require.main === module) {
  /** Değer alan bayraklar — değerleri serbest metinden AYIKLANMALI, yoksa nota sızar. */
  const VALUE_FLAGS = new Set(['sid', 'lane', 'globs', 'to', 'text'])
  const [, , verb, ...rest] = process.argv
  const flags = {}
  const positional = []
  for (let i = 0; i < rest.length; i++) {
    const t = rest[i]
    if (t.startsWith('--')) {
      const name = t.slice(2)
      if (VALUE_FLAGS.has(name)) { flags[name] = rest[i + 1]; i++ } else flags[name] = true
    } else positional.push(t)
  }
  const sid = flags.sid || process.env.CLAUDE_SESSION_ID || os.hostname() + '-manual'

  if (verb === 'claim') {
    const globs = String(flags.globs || '').split(',').map(s => s.trim()).filter(Boolean)
    if (globs.length === 0) { console.error('--globs zorunlu (virgülle ayır)'); process.exit(1) }
    append(sid, { type: 'claim', lane: flags.lane || 'lane', globs })
    console.log(`talep alındı: ${flags.lane || 'lane'} → ${globs.join(', ')}`)
  } else if (verb === 'heartbeat') {
    append(sid, { type: 'heartbeat' })
    console.log('atış kaydedildi')
  } else if (verb === 'release') {
    append(sid, { type: 'release' })
    console.log('şerit bırakıldı')
  } else if (verb === 'note') {
    const text = (flags.text || positional.join(' ')).trim()
    if (!text) { console.error('not metni boş'); process.exit(1) }
    append(sid, { type: 'note', to: flags.to || '', text })
    console.log('not bırakıldı')
  } else if (verb === 'who') {
    console.log(summary(sid))
  } else {
    console.log('kullanım: board.cjs <claim|heartbeat|release|note|who> [--sid X] [--lane Y] [--globs "a/**,b/**"] [--to Z] [--text "..."]')
  }
}
