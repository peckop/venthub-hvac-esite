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

const BOARD_DIR = process.env.VENTHUB_BOARD_DIR || path.join('C:', 'tmp', 'venthub-board')
/** Kira ömrü: bu süre atış almayan talep BAYAT sayılır ve engellemez (ölü oturum kilitlemesin). */
const DEFAULT_TTL_MS = 4 * 60 * 60 * 1000

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

/** Tüm oturum dosyalarını oku (bozuk satır sessizce atlanır — pano hiçbir zaman patlamamalı). */
function readEvents() {
  ensureDir()
  let files = []
  try { files = fs.readdirSync(BOARD_DIR).filter(f => f.startsWith('events.') && f.endsWith('.jsonl')) } catch { return [] }
  const out = []
  for (const f of files) {
    let raw = ''
    try { raw = fs.readFileSync(path.join(BOARD_DIR, f), 'utf8') } catch { continue }
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue
      try { out.push(JSON.parse(line)) } catch { /* bozuk satır: atla */ }
    }
  }
  out.sort((a, b) => String(a.ts).localeCompare(String(b.ts)))
  return out
}

/**
 * Şu an CANLI olan talepler. Kurallar:
 *  - release edilmiş şerit düşer,
 *  - TTL dolmuş talep düşer (ölü oturum kilitlemez),
 *  - aynı yolu iki oturum talep ederse EN ERKEN timestamp kazanır (deterministik).
 */
function liveClaims(now = Date.now()) {
  const events = readEvents()
  const bySession = new Map()
  for (const e of events) {
    if (e.type === 'claim') {
      bySession.set(e.sid, {
        sid: e.sid,
        lane: e.lane || 'lane',
        globs: Array.isArray(e.globs) ? e.globs : [],
        ts: e.ts,
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
  // En erken talep kazanır (çakışan yol iddialarında deterministik sonuç).
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

/** Mutlak/göreli yolu repo-göreli hâle getir (pano yolları repo-göreli tutulur). */
function toRepoRelative(filePath, repoRoot) {
  const norm = String(filePath).replace(/\\/g, '/')
  const root = String(repoRoot || process.cwd()).replace(/\\/g, '/')
  if (norm.toLowerCase().startsWith(root.toLowerCase() + '/')) return norm.slice(root.length + 1)
  return norm.replace(/^\.\//, '')
}

/**
 * Bu yol BAŞKA bir oturumun canlı talebine giriyor mu?
 * Kendi oturumunun talebi engel değildir.
 */
function findConflict(filePath, sid, repoRoot) {
  const rel = toRepoRelative(filePath, repoRoot)
  for (const c of liveClaims()) {
    if (c.sid === sid) continue
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

/** Okunmamış notlar: bana yazılmış, benim oturumumdan sonra gelen `note` olayları. */
function notesFor(sid, lane) {
  const events = readEvents()
  return events.filter(e =>
    e.type === 'note' &&
    e.sid !== sid &&
    (!e.to || e.to === sid || (lane && e.to === lane))
  ).slice(-5)
}

module.exports = {
  BOARD_DIR, DEFAULT_TTL_MS,
  append, readEvents, liveClaims, findConflict, summary, notesFor,
  globToRegExp, toRepoRelative,
}

/* ---------------------------- CLI ---------------------------- */
if (require.main === module) {
  const [, , verb, ...rest] = process.argv
  const arg = (name, fallback) => {
    const i = rest.indexOf('--' + name)
    return i >= 0 && rest[i + 1] ? rest[i + 1] : fallback
  }
  const sid = arg('sid', process.env.CLAUDE_SESSION_ID || os.hostname() + '-manual')

  if (verb === 'claim') {
    const lane = arg('lane', 'lane')
    const globs = (arg('globs', '') || '').split(',').map(s => s.trim()).filter(Boolean)
    if (globs.length === 0) { console.error('--globs zorunlu (virgülle ayır)'); process.exit(1) }
    append(sid, { type: 'claim', lane, globs })
    console.log(`talep alındı: ${lane} → ${globs.join(', ')}`)
  } else if (verb === 'heartbeat') {
    append(sid, { type: 'heartbeat' })
    console.log('atış kaydedildi')
  } else if (verb === 'release') {
    append(sid, { type: 'release' })
    console.log('şerit bırakıldı')
  } else if (verb === 'note') {
    append(sid, { type: 'note', to: arg('to', ''), text: rest.filter(r => !r.startsWith('--')).join(' ') })
    console.log('not bırakıldı')
  } else if (verb === 'who') {
    console.log(summary(sid))
  } else {
    console.log('kullanım: board.cjs <claim|heartbeat|release|note|who> [--sid X] [--lane Y] [--globs "a/**,b/**"] [--to Z]')
  }
}
