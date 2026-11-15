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
  if (r.cikti) {
    // ARC-326: yalnız BİLGİ satırı (⚠HAFIZA YEDEK: son commit N dk önce) 30 dk'da bir; dakika değişimi tek başına yeni durum değil. ⛔ başarısızlık satırı her mesajda görünür.
    let bas = true
    try {
      const ek = r.cikti.hookSpecificOutput && r.cikti.hookSpecificOutput.additionalContext
      if (girdi.hook_event_name === 'UserPromptSubmit' && typeof ek === 'string' && !/⛔/.test(ek)) {
        bas = require('./bir-kez.cjs').basilsin('hafiza-yedek', String(girdi.session_id || ''), ek, { rakamsiz: true, yenilemeMs: 1800000 })
      }
    } catch {
      bas = true
    }
    if (bas) process.stdout.write(JSON.stringify(r.cikti))
  }
} catch {
  // fail-open ve SESSİZ
}
process.exit(0)
