'use strict'
/**
 * MERGE SONRASI ANA AĞACI İLERİ SAR (karar 165 W4, Ops 2026-09-28) — PostToolUse · Bash.
 *
 * ── NİÇİN VAR ──
 *
 * Güvenli ileri sarma zaten var: `scripts/hijyen/ana-agac-tazelik.cjs` → `ileriSar` (yalnız
 * `--ff-only`; izlenen dosyada kaydedilmemiş değişiklik varsa DURUR, stash/reset yapmaz) ve
 * `merge-ritueli.cjs --merge` her merge'ün sonunda onu çağırır. Ama pencereler (ARAÇ dahil)
 * merge'ü çoğunlukla doğrudan `gh pr merge` ile yapıyor → ritüel atlanıyor → ana ağaç geride
 * kalıyor; kancalar, CLAUDE.md ve .mcp.json ana ağaçtan yüklendiği için bütün pencereler eski
 * kuralla açılıyor. Ölçüm 09-27/28: 24 saatte 20 elle ileri sarma; 09-28 sabahı ana ağaç 1 commit
 * geride açıldı.
 *
 * ── NE YAPAR ──
 *
 * Komut `gh pr merge` içeriyorsa: `git fetch origin master` → `ileriSar(anaAgac)`. Sonuç satırı
 * pencereye döner (ilerlendi / güncel / ENGELLİ + sebep). Başka komutta hiçbir şey yapmaz.
 * Merge başarısız olduysa origin/master değişmemiştir → `ileriSar` "guncel" der; ayrıca başarı
 * ayrıştırılmaz. Kanca hiçbir durumda komutu engellemez (çıkış 0); ölçemezse bunu SÖYLER.
 */
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const MERGE = /\bgh\s+pr\s+merge\b/

/** Komut merge mi? Test bunu çağırır. */
function mergeMi(komut) {
  return typeof komut === 'string' && MERGE.test(komut)
}

/** ileriSar sonucunu tek satıra çevirir. */
function satir(s) {
  if (!s) return null
  if (s.durum === 'ilerlendi') return `ANA AGAC: merge sonrasi ${s.geride} commit ileri sarildi.`
  if (s.durum === 'guncel') return null
  if (s.durum === 'engelli') return `⚠ANA AGAC ${s.geride} COMMIT GERIDE, ileri sarilamadi: ${s.sebep}. Stash/reset YAPMA; sahibini bul.`
  return `⚠ANA AGAC: olculemedi (${s.sebep || s.durum})`
}

function calistir(girdi) {
  const komut = girdi && girdi.tool_input && girdi.tool_input.command
  if (!mergeMi(komut)) return null
  const tazelik = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'ana-agac-tazelik.cjs'))
  const cwd = girdi.cwd || process.cwd()
  let agac
  try {
    agac = tazelik.anaAgacYolu(cwd)
    execFileSync('git', ['-C', agac, 'fetch', '-q', 'origin', 'master'], { stdio: 'ignore', windowsHide: true, timeout: 30_000 })
  } catch (e) {
    return satir({ durum: 'olcemedi', sebep: String((e && e.message) || e).slice(0, 120) })
  }
  return satir(tazelik.ileriSar(agac))
}

if (require.main === module) {
  let veri = ''
  process.stdin.on('data', (d) => (veri += d))
  process.stdin.on('end', () => {
    let s = null
    try {
      s = calistir(JSON.parse(veri || '{}'))
    } catch (e) {
      s = `⚠ANA AGAC: kanca hatasi (${String((e && e.message) || e).slice(0, 100)})`
    }
    if (s) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: s } }))
    process.exit(0)
  })
}

module.exports = { mergeMi, satir, calistir }
