#!/usr/bin/env node
'use strict'

/**
 * KANCA — sabit davranış dersleri (ARC-201, HRT-68). Olay: SessionStart.
 * stdout: hookSpecificOutput.additionalContext ("SABİT DERSLER …", en çok 5 ders) — yoksa HİÇBİR ŞEY.
 * Karar ve gerekçe: scripts/hijyen/sabit-dersler.cjs başlığı. Salt okur, bloklamaz, çıkış DAİMA 0.
 */
const path = require('path')

try {
  const metin = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'sabit-dersler.cjs')).calistir()
  if (metin) {
    process.stdout.write(
      JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: metin } }),
    )
  }
} catch {
  /* fail-open ve SESSİZ */
}
process.exit(0)
