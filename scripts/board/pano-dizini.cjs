'use strict'
/**
 * PANO DİZİNİ — kancaların ve pano betiklerinin ortak varsayılanı (ARC-252, 5 Kasım 2026).
 *
 * NİÇİN VAR: 16 yerde yedek yol `'C:/tmp/venthub-board'` sabitiydi. Linux'ta (bulut oturumları) `C:/...` mutlak yol DEĞİLDİR,
 * çalışma klasörüne göre göreli sayılır; kanca ilk yazışta depo içine "C:" adlı klasör açıyordu (en az 5 bulut oturumu raporladı).
 *
 * KARAR: Windows'ta davranış AYNEN kalır (`C:/tmp/venthub-board`); diğer platformlarda `os.tmpdir()` altı kullanılır (mutlak,
 * depo dışı). Ortam değişkeni (VENTHUB_BOARD_DIR, eski ad VENTHUB_PANO_DIR) her zaman önceliklidir.
 * Bu dosya kancalarca `require` edilir: yalnız `node:path` ve `node:os` kullanır, hata atmaz (fail-open).
 */
const os = require('node:os')
const path = require('node:path')

const WINDOWS_VARSAYILAN = 'C:/tmp/venthub-board'

/** Platforma göre varsayılan pano dizini (mutlak yol). `platform` ve `tmp` yalnız test içindir. */
function varsayilanPano(platform = process.platform, tmp = os.tmpdir()) {
  return platform === 'win32' ? WINDOWS_VARSAYILAN : path.join(tmp, 'venthub-board')
}

/** Pano dizini: ortam değişkeni, yoksa platform varsayılanı. */
function panoDizini(env = process.env, platform = process.platform, tmp = os.tmpdir()) {
  return env.VENTHUB_BOARD_DIR || env.VENTHUB_PANO_DIR || varsayilanPano(platform, tmp)
}

module.exports = { panoDizini, varsayilanPano, WINDOWS_VARSAYILAN, VARSAYILAN: varsayilanPano() }
