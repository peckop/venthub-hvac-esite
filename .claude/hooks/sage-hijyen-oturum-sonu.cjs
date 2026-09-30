#!/usr/bin/env node
'use strict'

/**
 * KANCA — oturum kapanırken sage hijyenini (`port.hygiene`) koşar — ama YALNIZ taze
 * doğrulanmış yedek varken.
 *
 * Olay: SessionEnd · stdin: { session_id?, reason? } · stdout: YOK · çıkış: DAİMA 0
 *
 * ⛔SIRA: `sage-yedek-oturum-sonu.cjs` ile AYNI olayda ve Claude Code aynı eşleştiricideki
 * kancaları PARALEL koşturur → sıra garantisi yoktur. Bu yüzden hijyen kendi içinde son
 * doğrulanmış SAGE yedeğinin <24 saat olduğunu ölçer; yoksa 20 sn'ye kadar saniyede bir
 * yeniden bakar (yedek ~1 sn sürer); hâlâ yoksa hijyeni ATLAR ve sebebini loga yazar.
 * ⛔`purgeDeletedAfterDays` verilmez (fiziksel silme yok). ⛔Daemon başlatmaz.
 * Sonuç özeti PANO dizinindeki `hafiza-kancalari.log` dosyasına yazılır. Bütçe 60 sn.
 *
 * Yöneten cetvel: docs/standards/hafiza-kancalari-standard.md §8.
 */
const fs = require('fs')
const path = require('path')

try {
  // stdin okunur ama kullanılmaz; okunmazsa üst süreç boru hatası görebilir.
  fs.readFileSync(0, 'utf8')
} catch {
  /* stdin yoksa sorun değil */
}

;(async () => {
  try {
    const modul = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'hafiza-enjeksiyonu.cjs'))
    await modul.hijyenKancasi()
  } catch {
    /* fail-open: oturum kapanışı bloklanmaz */
  }
  process.exit(0)
})()
