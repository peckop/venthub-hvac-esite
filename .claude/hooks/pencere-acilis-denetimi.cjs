#!/usr/bin/env node
'use strict'
/**
 * PENCERE AÇILIŞ DENETİMİ KANCASI (ARC-245) — PostToolUse · mcp__ccd_session__start_session.
 *
 * Mantık scripts/board/pencere-acilis-denetimi.cjs'te (saf çekirdek + test). Bu dosya yalnız stdin → çekirdek →
 * additionalContext köprüsüdür. SALT-OKUMA varsayılan; agent anahtarını kendisi yazması yalnız
 * VENTHUB_PENCERE_ACILIS_YAZ=1 vanasıyla. Fail-open: her hata sessiz çıkış 0. Çıktı ≤ 1200 karakter.
 * VANA: VENTHUB_PENCERE_ACILIS_KAPAT=1 kancayı tamamen susturur.
 */
const path = require('node:path')

function calis(stdin, ortam = process.env) {
  if (ortam.VENTHUB_PENCERE_ACILIS_KAPAT === '1') return ''
  let girdi
  try { girdi = JSON.parse(stdin) } catch { return '' }
  if (!girdi || typeof girdi.tool_name !== 'string' || !girdi.tool_name.endsWith('start_session')) return ''
  const { denetle, blok, varsayilanHafizaDizini } = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'pencere-acilis-denetimi.cjs'))
  const depo = ortam.CLAUDE_PROJECT_DIR ? path.resolve(ortam.CLAUDE_PROJECT_DIR) : path.resolve(__dirname, '..', '..')
  return blok(denetle(girdi, { depo, yaz: ortam.VENTHUB_PENCERE_ACILIS_YAZ === '1', hafizaDizini: ortam.VENTHUB_ANA_PROJE_DIZINI ? path.join(ortam.VENTHUB_ANA_PROJE_DIZINI, 'memory') : varsayilanHafizaDizini(depo) }))
}

if (require.main === module) {
  let veri = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', (c) => { veri += c })
  process.stdin.on('end', () => {
    try {
      const m = calis(veri)
      if (m) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: m } }))
    } catch {
      // fail-open: kanca hatası start_session akışını bozmaz
    }
    process.exit(0)
  })
}

module.exports = { calis }
