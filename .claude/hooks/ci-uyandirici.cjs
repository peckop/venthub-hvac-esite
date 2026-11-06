#!/usr/bin/env node
'use strict'
/**
 * PostToolUse hook (Bash) — CI UYANDIRICI, sahip kolu (ARC-263, OPS emri 6 Kasım).
 *
 * `gh pr create` ya da `git push origin <dal>` sonrası PR'ın CI'ını ARKA PLANDA bekler (kayıt `asyncRewake: true`, ARC-214'te
 * ölçülmüş kalıp): CI bitince çıkış kodu 2 + stderr tek satır pencereye sistem hatırlatması olarak ulaşır ve BOŞTA pencereyi
 * uyandırır. Zaman aşımı, okunamayan PR, yenilenen commit ve her hata SESSİZ çıkış 0 (fail-open).
 *
 * Mantık ve testler: scripts/board/ci-uyandirici.cjs, src/__tests__/conformance/kanca-ci-uyandirici.test.ts.
 * VANA: VENTHUB_CI_UYANDIRICI=0. Aynı PR+sha için tek bekleyici (kilit, pano dizini).
 *
 * stdin: { tool_name, tool_input: { command }, tool_response }
 */
const fs = require('node:fs')
const path = require('node:path')

function cikti(tr) {
  if (tr == null) return ''
  if (typeof tr === 'string') return tr
  try {
    return [tr.stdout, tr.stderr, tr.output].filter((x) => typeof x === 'string').join('\n') || JSON.stringify(tr)
  } catch {
    return ''
  }
}

async function calistir() {
  if (process.env.VENTHUB_CI_UYANDIRICI === '0') return 0
  let girdi
  try {
    girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    return 0
  }
  if (!girdi || girdi.tool_name !== 'Bash') return 0
  const modul = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'ci-uyandirici.cjs'))
  const { panoDizini } = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'pano-dizini.cjs'))
  const t = modul.tetik(girdi.tool_input && girdi.tool_input.command, cikti(girdi.tool_response))
  if (!t) return 0
  const pr = t.pr || modul.dalPr(t.dal)
  if (!pr) return 0
  const ilk = modul.prOku(pr)
  if (!ilk || ilk.state !== 'OPEN') return 0
  const sha = ilk.headRefOid || ''
  const dizin = panoDizini()
  if (!modul.kilitAl(dizin, pr, sha)) return 0
  try {
    const sonuc = await modul.bekle({ pr, ilkSha: sha })
    if (!['yesil', 'kirmizi', 'birlesti', 'kapandi'].includes(sonuc.sonuc)) return 0
    try {
      fs.writeSync(2, modul.mesaj(sonuc.pv, sonuc.s) + '\n')
    } catch {
      return 0
    }
    return 2
  } finally {
    modul.kilitBirak(dizin, pr, sha)
  }
}

calistir().then(
  (kod) => process.exit(kod),
  () => process.exit(0),
)
