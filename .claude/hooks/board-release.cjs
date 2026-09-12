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

// §9.7: bozuk/boş stdin → fail-OPEN ama SESSİZ DEĞİL. Bu kanca hiçbir şeyi durdurmaz;
// sessizliğin bedeli şerit 4 saat boyunca kilitli kalmasıdır — kimse kırmızı görmez.
let input = {}
const hamGirdi = readStdin()
if (!String(hamGirdi).trim()) {
  process.stderr.write('[board-release] stdin okunamadi (bos), serit birakilmadi\n')
  process.exit(0)
}
try { input = JSON.parse(hamGirdi) } catch {
  process.stderr.write('[board-release] stdin okunamadi (bozuk JSON), serit birakilmadi\n')
  process.exit(0)
}

const sid = input.session_id || ''
if (!sid) process.exit(0)

try {
  const board = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'board.cjs'))
  const mine = board.liveClaims().find(c => c.sid === sid)
  if (mine) board.append(sid, { type: 'release', reason: input.reason || 'session-end' })
} catch { /* fail-open: bırakılamadıysa TTL devreye girer */ }
process.exit(0)
