#!/usr/bin/env node
'use strict'
/**
 * KANCA — hafıza yedeği (ARC-92). İnce giriş: mantık scripts/hijyen/hafiza-yedek.cjs başlığındadır.
 *
 * Olaylar: PreCompact (yedek ELDE alınır; push dahil en çok ~40 sn, kayıtta timeout 45 ver) ·
 *          SessionStart / UserPromptSubmit (yaş satırı + gerekirse ARKA PLAN yedeği)
 * stdin: { hook_event_name } · stdout: yalnız SessionStart/UserPromptSubmit'ta additionalContext · çıkış: DAİMA 0
 * Yöneten cetvel: docs/standards/hafiza-kancalari-standard.md §9.
 */
const fs = require('fs')
const path = require('path')

let girdi = {}
try {
  girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
} catch {
  process.exit(0)
}
try {
  const modul = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'hafiza-yedek.cjs'))
  const r = modul.kancaKos(girdi)
  if (r.cikti) process.stdout.write(JSON.stringify(r.cikti))
} catch {
  // fail-open ve SESSİZ
}
process.exit(0)
