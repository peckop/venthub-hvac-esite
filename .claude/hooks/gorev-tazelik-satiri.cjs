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
  const satir = require(path.join(KOK, 'scripts', 'hijyen', 'gorev-tazelik.cjs')).rolSatiri(rol, KOK)
  if (satir) fs.writeSync(1, satir + '\n')
}

if (require.main === module) {
  try {
    calistir()
  } catch {
    // fail-open
  }
  process.exit(0)
}
