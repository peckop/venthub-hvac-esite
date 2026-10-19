#!/usr/bin/env node
'use strict'

/**
 * KANCA — düzeltme algılayıcı, işaret tarafı (ARC-202). Olay: UserPromptSubmit.
 * stdin: { session_id, prompt }. Recep'in KENDİ mesajı düzeltme/tekrar kalıbına uyuyorsa işaret yazar;
 * bekleyen DERS-BORCU ve yeni işaret varsa bağlama satır yazar. Karar ve gerekçe:
 * scripts/hijyen/duzeltme-borcu.cjs ve duzeltme-kalibi.cjs başlıkları. Çıkış DAİMA 0, sessiz hata.
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
  const hij = path.join(__dirname, '..', '..', 'scripts', 'hijyen')
  const borc = require(path.join(hij, 'duzeltme-borcu.cjs'))
  const { duzeltmeMi } = require(path.join(hij, 'duzeltme-kalibi.cjs'))
  if (borc.kip() !== 'kapali' && girdi.session_id) {
    const sonuc = duzeltmeMi(girdi.prompt)
    if (sonuc.eslesti) {
      borc.yaz(borc.isaretYolu(girdi.session_id), { ts: Date.now(), kaliplar: sonuc.kaliplar })
    }
    const satirlar = borc.satirlar(girdi.session_id)
    if (satirlar.length) process.stdout.write(satirlar.join('\n') + '\n')
  }
} catch {
  /* fail-open ve SESSİZ: kanca turu asla bloklamaz */
}
process.exit(0)
