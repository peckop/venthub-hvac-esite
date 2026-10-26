#!/usr/bin/env node
'use strict'

/**
 * PreToolUse hook (kanban_manage: kart BAŞLATMA) — ÖNCE ELİNDEKİ İŞ UYARISI (ARC-217, ARC-212 ek parçası).
 *
 * NİÇİN: Departman, In Progress'teki yarım işini bırakıp yeni karta geçiyor; işler yarım kalıyor (Recep, 26 Ekim:
 * tekrar eden hata aynı gün mekanizmaya çevrilir). Açılış bloğu (session-board.cjs) hatırlatır; bu kanca KARTI
 * BAŞLATTIĞI ANDA son uyarıyı verir.
 *
 * NE YAPAR (bloklamaz, UYARIR): start_task / claim_task / transition_task (running) / move_task (In Progress sütunu)
 * çağrısında hedef kartın departmanının BAŞKA In Progress kartı varsa (beklemede etiketi / blocked durumu yoksa)
 * additionalContext olarak "elinde X var; önce bitir ya da beklemede etiketi ve sebebiyle bırak" basar.
 *
 * NE YAPMAZ: reddetmez (çıkış hep 0), kartı değiştirmez. Kanban okunamazsa, kart bulunamazsa, departman
 * çözülemezse sessiz geçer (fail-open). Mantık: scripts/board/once-elindeki-is.cjs.
 *
 * stdin: { tool_name, tool_input: { action, taskId, lifecycleStage, targetColumnId } }
 */

const fs = require('node:fs')
const path = require('node:path')

const ARAC_ADI = 'mcp__wrongstack-kanban__kanban_manage'

/** Çağrı bir kartı "çalışıyor"a alıyor mu? Ucuz süzgeç: Kanban'a yalnız bu durumda gidilir. */
function baslatmaMi(girdi) {
  const a = String((girdi && girdi.action) || '')
  if (a === 'start_task' || a === 'claim_task') return true
  if (a === 'transition_task') return String(girdi.lifecycleStage || '').toLowerCase() === 'running'
  if (a === 'move_task') return /in[-_ ]?progress/i.test(String(girdi.targetColumnId || ''))
  return false
}

function calistir() {
  let girdi
  try {
    girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    return
  }
  if (girdi.tool_name !== ARAC_ADI) return
  const arac = girdi.tool_input || {}
  if (!baslatmaMi(arac) || !arac.taskId) return
  const modul = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'once-elindeki-is.cjs'))
  const metin = modul.baslatmaUyarisi(arac.taskId)
  if (!metin) return
  try {
    fs.writeSync(
      1,
      JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: metin } }) + '\n',
    )
  } catch {
    // stdout kapalı: uyarı verilemedi, kart yine başlar
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

module.exports = { baslatmaMi }
