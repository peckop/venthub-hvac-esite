#!/usr/bin/env node
'use strict'

/**
 * KANCA — sage kullanım sayacı: basılan derslerin enjeksiyonunu ve (transcript'te atıf
 * varsa) kullanımını sage'e yazar.
 *
 * Olay: Stop (async) · stdin: { session_id, transcript_path }
 * stdout: YOK · çıkış: DAİMA 0
 *
 * Sırayla: (1) oturum defterinde henüz sayılmamış enjeksiyonlar → `recordInjection`;
 * (2) transcript'in SON asistan metinleri derslere karşı taranır → YALNIZ eşleşenler için
 * `recordUse`; (3) sayılanlar deftere işaretlenir (çift sayma yok). Sayaç yazımı daemon'un
 * tek-yazar zincirinden geçer; doğrudan sqlite UPDATE yoktur.
 *
 * ⛔DAEMON BAŞLATMAZ. ⛔SESSİZ: hata → çıkış 0. Bütçe 20 sn. Karar ve eşleştirme kuralının
 * gerekçesi `scripts/hijyen/hafiza-enjeksiyonu.cjs` başlığındadır.
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
    await modul.sayacKancasi(girdi)
  } catch {
    /* fail-open ve SESSİZ */
  }
  process.exit(0)
})()
