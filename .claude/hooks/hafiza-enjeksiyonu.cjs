#!/usr/bin/env node
'use strict'

/**
 * KANCA — konu farkında sage hafızası: istemin konusuna çapalı/ilgili dersleri bağlama koyar.
 *
 * Olay: UserPromptSubmit
 * stdin: { session_id, prompt, cwd }
 * stdout: hookSpecificOutput.additionalContext ("HAFIZA (konu):" + en çok 3 ders) — yoksa HİÇBİR ŞEY
 *
 * ⛔NİÇİN İNCE KABLO: karar (alaka süzgeci, bütçe, defter, daemon kapısı) ve gerekçeleri
 * `scripts/hijyen/hafiza-enjeksiyonu.cjs` başlığında yazılıdır; port oradan ENJEKTE edilir.
 * ⛔DAEMON BAŞLATMAZ: daemon canlı değilse (server.json yok / pid ölü) sessizce çıkar.
 * ⛔SESSİZ VE BLOKLAMAZ: her hata → çıkış 0, çıktı yok. Duvar saati bütçesi 2500 ms.
 *
 * Yöneten cetvel: docs/standards/hafiza-kancalari-standard.md §8.
 */
const fs = require('fs')
const path = require('path')

let girdi = {}
try {
  girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
} catch {
  process.exit(0)
}

;(async () => {
  try {
    const modul = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'hafiza-enjeksiyonu.cjs'))
    const metin = await modul.konuKancasi(girdi)
    if (metin) {
      process.stdout.write(
        JSON.stringify({
          hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: metin },
        }),
      )
    }
  } catch {
    /* fail-open ve SESSİZ */
  }
  process.exit(0)
})()
