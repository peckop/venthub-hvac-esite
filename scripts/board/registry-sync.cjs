#!/usr/bin/env node
/**
 * Orion registry senkronu — KALICI iş durumu, hatırlamaya gerek kalmadan.
 *
 * SORUN: registry'de 18 VentHub iş emri vardı ve 0'ı tamamlanmış görünüyordu — bir günde
 * 7 PR ve 4 prod migration'ı sevk edilmişken. Veritabanı bozuk değildi; ona YAZAN adım yoktu.
 * Elle atılan adım üç ayrı yerde çürüdü (pano, registry, companion doc'lar).
 *
 * ÇÖZÜM: yazma anını zaten ZORUNLU olan ritüele bağla — PR merge. Commit gövdesine tek satır
 * künye yazılır:
 *
 *     Work-Order: T001-VH progress=70
 *     Work-Order: T011-VH status=completed
 *
 * `post-merge` kancası (pull'da çalışır, doc üretimi için zaten var) bu betiği çağırır;
 * master'ı kim çekerse registry kendiliğinden güncellenir. Üç oturum da aynı makinede
 * olduğu için tek DB paylaşılır — biri çeker, hepsi doğru tabloyu görür.
 *
 * İDEMPOTENT: aynı commit iki kez işlense de sonuç aynı (mutlak değer yazılır, artırılmaz).
 * SESSİZ DEĞİL: ne yaptığını stdout'a yazar; kanca bunu loglar.
 *
 * Kullanım:
 *   node scripts/board/registry-sync.cjs                # ORIG_HEAD..HEAD aralığı
 *   node scripts/board/registry-sync.cjs <from> <to>    # açık aralık
 *   node scripts/board/registry-sync.cjs --dry          # yalnız rapor
 */
const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')

const DB_PATH = path.join(os.homedir(), '.orion', 'registry.db')
const PROJECT_ID = 'venthub-hvac'

/**
 * KABUK YOK: künye değerleri commit mesajından, yani dış girdiden gelir. Argüman dizisiyle
 * çağırmak kabuk meta-karakterlerini tamamen devre dışı bırakır (regex kısıtı ilk savunma,
 * bu ikincisi).
 */
function git(args) {
  try { return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }) } catch { return '' }
}

/** Commit gövdelerinden `Work-Order:` künyelerini topla. */
function parseTrailers(range) {
  const log = git(['log', range, '--format=%B%n---COMMIT---'])
  const updates = new Map() // shortId → { progress?, status? }
  const re = /^\s*Work-Order:\s*([A-Z]\d{3}-[A-Z]{2})((?:\s+\w+=\S+)*)\s*$/gim
  let m
  while ((m = re.exec(log)) !== null) {
    const shortId = m[1]
    const rest = m[2] || ''
    const entry = updates.get(shortId) || {}
    for (const kv of rest.trim().split(/\s+/).filter(Boolean)) {
      const [k, v] = kv.split('=')
      if (k === 'progress') {
        const n = Number(v)
        if (Number.isFinite(n) && n >= 0 && n <= 100) entry.progress = n
      } else if (k === 'status') {
        if (['backlog', 'open', 'active', 'blocked', 'completed'].includes(v)) entry.status = v
      }
    }
    updates.set(shortId, entry)
  }
  return updates
}

/**
 * sqlite'a yaz. `sqlite3` CLI'ı yoksa (Windows'ta çoğu zaman yok) python3 fallback'i
 * kullanılır — Orion zaten python tabanlı, o yüzden makinede mevcut.
 */
function applyUpdates(updates, dry) {
  if (updates.size === 0) return { applied: 0, skipped: 0, lines: ['künye yok — yapacak bir şey yok'] }
  if (!fs.existsSync(DB_PATH)) return { applied: 0, skipped: updates.size, lines: [`registry bulunamadı: ${DB_PATH}`] }

  const payload = JSON.stringify([...updates.entries()].map(([shortId, u]) => ({ shortId, ...u })))
  const py = `
import json, sqlite3, sys, datetime
db = r"${DB_PATH}"
items = json.loads(sys.argv[1])
dry = ${dry ? 'True' : 'False'}
now = datetime.datetime.now().isoformat(timespec='seconds')
con = sqlite3.connect(db, timeout=15)
applied, lines = 0, []
for it in items:
    sets, params = ["updated_at=?"], [now]
    if it.get("progress") is not None:
        sets.append("progress=?"); params.append(it["progress"])
    if it.get("status"):
        sets.append("status=?"); params.append(it["status"])
    params += ["${PROJECT_ID}", it["shortId"]]
    sql = "update tasks set " + ", ".join(sets) + " where project_id=? and short_id=?"
    if dry:
        lines.append("DRY " + it["shortId"] + " -> " + json.dumps({k: v for k, v in it.items() if k != 'shortId'}))
        continue
    cur = con.execute(sql, params)
    if cur.rowcount:
        applied += 1
        lines.append(it["shortId"] + " guncellendi: " + json.dumps({k: v for k, v in it.items() if k != 'shortId'}))
    else:
        lines.append(it["shortId"] + " BULUNAMADI (registry'de bu is emri yok)")
con.commit()
print(json.dumps({"applied": applied, "lines": lines}))
`
  try {
    const out = execFileSync('python', ['-c', py, payload], { encoding: 'utf8' })
    const parsed = JSON.parse(out.trim().split('\n').pop())
    return { applied: parsed.applied, skipped: updates.size - parsed.applied, lines: parsed.lines }
  } catch (e) {
    return { applied: 0, skipped: updates.size, lines: [`registry yazılamadı: ${e && e.message}`] }
  }
}

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const positional = args.filter(a => !a.startsWith('--'))
const range = positional.length >= 2
  ? `${positional[0]}..${positional[1]}`
  : (git(['rev-parse', '--verify', 'ORIG_HEAD']).trim() ? 'ORIG_HEAD..HEAD' : 'HEAD~20..HEAD')

const updates = parseTrailers(range)
const result = applyUpdates(updates, dry)
console.log(`[registry-sync] aralık=${range} künye=${updates.size} uygulanan=${result.applied}`)
for (const l of result.lines) console.log('  ' + l)
