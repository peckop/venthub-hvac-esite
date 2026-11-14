#!/usr/bin/env node
'use strict'
/**
 * KANCA — kod dizini tazeliği (ARC-311). İnce giriş: mantık scripts/hijyen/kod-dizini-tazelik.cjs başlığındadır.
 * SessionStart: son başarılı yenileme 3 günden eskiyse tek satır basar ve yenilemeyi ARKA PLANDA bir kez başlatır
 * (kilitli, bitince süreç kapanır; zamanlayıcı ve kalıcı süreç yok). stdout tek satır · çıkış DAİMA 0 (fail-open).
 * Vana: VENTHUB_KOD_DIZINI_TAZELIK_KAPAT=1.
 */
const path = require('node:path')

try {
  const satir = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'kod-dizini-tazelik.cjs')).kancaKos()
  if (satir) process.stdout.write(satir + '\n')
} catch {
  // fail-open ve SESSİZ: kanca hatası açılışı bozmaz
}
process.exit(0)
