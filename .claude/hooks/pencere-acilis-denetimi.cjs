#!/usr/bin/env node
'use strict'
/**
 * PENCERE AÇILIŞ KANCASI (ARC-244 + ARC-245) — mcp__ccd_session__start_session için iki olay, tek dosya.
 *
 *  · PreToolUse  (ARC-244): başlık/ad YALNIZ bir departman adıysa açmayı REDDEDER (permissionDecision deny):
 *    departmanın "(yeni düzen)" penceresi vardır, iş ona SendMessage ile gider. Kaçış: prompt'ta açık bayrak
 *    `YENI-DEPARTMAN-PENCERESI: Recep onayı <YYYY-AA-GG>`. Bu kapı SIKILAŞTIRIR, gevşetmez.
 *  · PostToolUse (ARC-245): açılan pencerenin HRT-101 açılış listesini SALT-OKUMA denetler (tanım, model, agent
 *    anahtarı, kilit, durum dosyası) ve eksikleri additionalContext olarak tek blokta yazar.
 *
 * Mantık scripts/board/pencere-acilis-denetimi.cjs'te (saf çekirdek + test). Bu dosya yalnız stdin → çekirdek köprüsü.
 * Agent anahtarını kendisi yazması yalnız VENTHUB_PENCERE_ACILIS_YAZ=1 vanasıyla. Fail-open: her hata sessiz çıkış 0.
 * VANALAR: VENTHUB_PENCERE_ACILIS_KAPAT=1 Post denetimini, VENTHUB_PENCERE_ACMA_KAPAT=1 Pre reddini susturur.
 */
const path = require('node:path')

const cekirdek = () => require(path.join(__dirname, '..', '..', 'scripts', 'board', 'pencere-acilis-denetimi.cjs'))

/** stdin metni → stdout'a yazılacak JSON metni ('' = sessiz). */
function calis(stdin, ortam = process.env) {
  let girdi
  try { girdi = JSON.parse(stdin) } catch { return '' }
  if (!girdi || typeof girdi.tool_name !== 'string' || !girdi.tool_name.endsWith('start_session')) return ''
  const c = cekirdek()
  if (girdi.hook_event_name === 'PreToolUse') {
    if (ortam.VENTHUB_PENCERE_ACMA_KAPAT === '1') return ''
    const neden = c.acmaKapisi(girdi)
    return neden
      ? JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: neden } })
      : ''
  }
  if (ortam.VENTHUB_PENCERE_ACILIS_KAPAT === '1') return ''
  const depo = ortam.CLAUDE_PROJECT_DIR ? path.resolve(ortam.CLAUDE_PROJECT_DIR) : path.resolve(__dirname, '..', '..')
  const hafiza = ortam.VENTHUB_ANA_PROJE_DIZINI ? path.join(ortam.VENTHUB_ANA_PROJE_DIZINI, 'memory') : c.varsayilanHafizaDizini(depo)
  const m = c.blok(c.denetle(girdi, { depo, yaz: ortam.VENTHUB_PENCERE_ACILIS_YAZ === '1', hafizaDizini: hafiza }))
  return m ? JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: m } }) : ''
}

if (require.main === module) {
  let veri = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', (c) => { veri += c })
  process.stdin.on('end', () => {
    try {
      const o = calis(veri)
      if (o) process.stdout.write(o)
    } catch {
      // fail-open: kanca hatası start_session akışını bozmaz
    }
    process.exit(0)
  })
}

module.exports = { calis }
