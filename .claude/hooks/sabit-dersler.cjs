#!/usr/bin/env node
'use strict'

/**
 * KANCA — sabit davranış dersleri (ARC-201, HRT-68; rol süzgeci ARC-203). Olay: SessionStart.
 * stdout: hookSpecificOutput.additionalContext ("SABİT DERSLER …", en çok 5 ders) — yoksa HİÇBİR ŞEY.
 * Rol: SessionStart girdisindeki agent adı (`agent_type`, örn. `arac-pencere`); ders yalnız rolsüzse ya da
 * o rolü içeriyorsa görünür, rol bilinmiyorsa yalnız rolsüz dersler. Karar ve gerekçe:
 * scripts/hijyen/sabit-dersler.cjs başlığı. Salt okur, bloklamaz, çıkış DAİMA 0.
 */
const fs = require('fs')
const path = require('path')

/** stdin JSON'undan agent adı; stdin TTY ise ya da okunamazsa '' (rol bilinmiyor). */
function girdidenRol() {
  try {
    if (process.stdin.isTTY) return ''
    const j = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
    const r = j && (j.agent_type || j.agentType || j.agent)
    return typeof r === 'string' ? r : ''
  } catch {
    return ''
  }
}

try {
  const metin = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'sabit-dersler.cjs')).calistir(process.env, girdidenRol())
  if (metin) {
    process.stdout.write(
      JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: metin } }),
    )
  }
} catch {
  /* fail-open ve SESSİZ */
}
process.exit(0)
