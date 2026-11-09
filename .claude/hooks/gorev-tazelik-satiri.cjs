#!/usr/bin/env node
'use strict'

/**
 * UserPromptSubmit hook — GÖREV TAZELİK SATIRI (ARC-216 A kolu).
 *
 * Pencerenin rolünün düzenli görevlerinden (scripts/belge/rol-gorevleri.json, tetik "istem-tazelik") eşiği aşan
 * varsa TEK satır basar: `⚠GÖREV (ARAC): öz-değerlendirme: 9 gün (eşik 7) — yapınca damgala: node …gorev-damga.cjs …`.
 * Hiçbiri aşmadıysa sessiz. Rol, pencerenin agent anahtarından çözülür; çözülemezse sessiz.
 * Bloklamaz (çıkış hep 0), ağ yok. Mantık: scripts/hijyen/gorev-tazelik.cjs.
 *
 * stdin: { cwd, agent_type? } · stdout: satır (bağlama eklenir)
 */

const fs = require('node:fs')
const path = require('node:path')

const KOK = path.resolve(__dirname, '..', '..')

function calistir() {
  let girdi = {}
  try {
    girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    return
  }
  const kimlik = require(path.join(KOK, 'scripts', 'board', 'pencere-kimligi.cjs'))
  const rol = kimlik.rolAdi(kimlik.agentAdi({ cwd: girdi.cwd, agentType: girdi.agent_type }))
  if (!rol) return
  try {
    const satir = require(path.join(KOK, 'scripts', 'hijyen', 'gorev-tazelik.cjs')).rolSatiri(rol, KOK)
    if (satir) fs.writeSync(1, satir + '\n')
  } catch {
    // GÖREV satırı bozulsa DEFTER satırı yine çalışır (ve tersi)
  }
  defterSatiri(rol, girdi)
}

/**
 * ARC-288 (OPS-258): ⚠DEFTER (ROL) — rolün defterlerinden en kötüsü, yalnız bayat/ölçülemedi iken, tek satır.
 * Mantık scripts/hijyen/defter-tazelik.cjs; manifest docs/defter/manifest.json (yoksa sessiz). Pencere başına yalnız durum
 * değişince basılır (uyari-susturma, ARC-220). Vana: VENTHUB_DEFTER_SATIRI_KAPAT=1. Fail-open.
 */
function defterSatiri(rol, girdi) {
  if (process.env.VENTHUB_DEFTER_SATIRI_KAPAT === '1') return
  try {
    let satir = require(path.join(KOK, 'scripts', 'hijyen', 'defter-tazelik.cjs')).rolSatiri(rol, KOK)
    if (!satir) return
    satir += '\n'
    try {
      const pano = process.env.VENTHUB_BOARD_DIR || process.env.VENTHUB_PANO_DIR || require(path.join(KOK, 'scripts', 'board', 'pano-dizini.cjs')).VARSAYILAN
      satir = require(path.join(__dirname, 'uyari-susturma.cjs')).suz(satir, String(girdi.session_id || ''), pano, Date.now(), 'defter')
    } catch {
      // süzme bozulduysa satır basılır
    }
    if (satir) fs.writeSync(1, satir)
  } catch {
    // fail-open
  }
}

if (require.main === module) {
  try {
    calistir()
  } catch {
    // fail-open
  }
  process.exit(0)
}
