#!/usr/bin/env node
/**
 * SessionEnd hook — şeridi BIRAK.
 *
 * NEDEN: kira modeli "ölü oturum kilitlemesin" diye TTL'li; ama TTL 4 saat. Oturum düzgün
 * kapandığında 4 saat beklemenin anlamı yok — şeridi hemen bırakırsak sıradaki oturum aynı
 * dosyalara engelsiz girer. TTL, bunun ÇALIŞMADIĞI hâller (çökme, pencere kapatma) için
 * emniyet ağı olarak kalır.
 *
 * stdin: { session_id, reason?, ... }
 */
const fs = require('fs')
const path = require('path')

function readStdin() {
  try { return fs.readFileSync(0, 'utf8') } catch { return '' }
}

let input = {}
try { input = JSON.parse(readStdin() || '{}') } catch { process.exit(0) }

const sid = input.session_id || ''
if (!sid) process.exit(0)

try {
  const board = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'board.cjs'))
  const mine = board.liveClaims().find(c => c.sid === sid)
  if (mine) board.append(sid, { type: 'release', reason: input.reason || 'session-end' })
} catch { /* fail-open: bırakılamadıysa TTL devreye girer */ }
process.exit(0)
