#!/usr/bin/env node
'use strict'

/**
 * PreToolUse hook (kanban_manage add_task) — ÖNCEKİ ÇALIŞMA ADAYLARI (ARC-215).
 *
 * NİÇİN: Kart açılırken "ÖNCEKİ ÇALIŞMA" satırı aramadan dolduruluyor (YTN-19 olayı: departmanın dokuz ölçüm belgesi
 * ve altı kartı vardı, aranmadı). Kanca üç yerel aramayı KENDİSİ yapar ve adayları kartı açana basar:
 * son 30 günün departman commit'leri, departmanın docs/audits dosyaları, aynı departmanın Done kartları.
 * Satırda hiçbir aday anılmıyorsa ek UYARI (engel yok).
 *
 * NE YAPMAZ: reddetmez (çıkış hep 0), ağa gitmez, kartı değiştirmez. Git ya da Kanban okunamazsa o kol boş kalır;
 * departman çözülemezse ya da aday yoksa sessiz. Hedef süre < 2 sn. Mantık: scripts/board/onceki-calisma-adaylari.cjs.
 *
 * stdin: { tool_name, tool_input: { action, title, description, assignee } }
 */

const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const KOK = path.resolve(__dirname, '..', '..')
const ARAC_ADI = 'mcp__wrongstack-kanban__kanban_manage'

/** Tüm kartlar (Done dahil, arşivsiz); okunamazsa null. */
function tumKartlar() {
  try {
    const r = spawnSync(process.execPath, [path.join(KOK, 'scripts', 'board', 'kanban-anlik.cjs'), '--kisa'], {
      encoding: 'utf8',
      timeout: 6000,
      maxBuffer: 64 * 1024 * 1024,
      windowsHide: true,
    })
    if (r.error || r.status !== 0) return null
    const govde = JSON.parse(r.stdout)
    return govde && govde.ok === true && Array.isArray(govde.tasks) ? govde.tasks.map((t) => t.task).filter(Boolean) : null
  } catch {
    return null
  }
}

function hesapla(girdi, kaynaklar = {}) {
  if (!girdi || girdi.action !== 'add_task') return []
  const alani = require(path.join(__dirname, 'kart-alani-kapisi.cjs'))
  const once = require(path.join(KOK, 'scripts', 'board', 'once-elindeki-is.cjs'))
  const adaylar = require(path.join(KOK, 'scripts', 'board', 'onceki-calisma-adaylari.cjs'))
  let harita
  try {
    harita = alani.haritayiOku(fs.readFileSync(alani.HARITA, 'utf8'))
  } catch {
    return []
  }
  const dept = alani.departman(girdi, harita)
  if (!dept) return []
  const onekler = Object.entries(alani.ONEK).filter(([, v]) => v === dept).map(([k]) => k)
  const commitler = (kaynaklar.commitler || ((k, o) => adaylar.sonCommitler(k, o)))
  const commitListe = onekler.flatMap((o) => commitler(KOK, o))
  const dosyalar = (kaynaklar.dosyalar || ((k, d) => adaylar.departmanBelgeleri(k, d)))(KOK, harita[dept].desenler)
  const kartlar = (kaynaklar.kartlar || tumKartlar)()
  const doneKartlar = (kartlar || [])
    .filter((k) => k.sutun === 'Done' && once.kartDepartmani(k, alani.ONEK) === dept)
    .map((k) => ({ no: once.kartNo(k.title) || k.id, baslik: k.title }))
  const bulunan = adaylar.adaylariBul({ baslik: girdi.title, commitler: commitListe, dosyalar, doneKartlar })
  return adaylar.metinler(bulunan, girdi.description)
}

function calistir() {
  let girdi
  try {
    girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    return
  }
  if (girdi.tool_name !== ARAC_ADI) return
  const satirlar = hesapla(girdi.tool_input)
  if (!satirlar.length) return
  try {
    fs.writeSync(
      1,
      JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: satirlar.join('\n') } }) + '\n',
    )
  } catch {
    // stdout kapalı: bilgi verilemedi, kart yine açılır
  }
}

if (require.main === module) {
  try {
    calistir()
  } catch {
    // fail-open
  }
  process.exit(0)
}

module.exports = { hesapla }
