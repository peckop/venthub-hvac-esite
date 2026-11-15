#!/usr/bin/env node
'use strict'

/**
 * PreToolUse hook (kanban_manage add_task) — AYNI BAŞLIK ÖNEKİYLE İKİNCİ KART (ARC-102 kapı 3).
 *
 * NİÇİN: kart numarası pano sayacından gelir; elle yazılan numara ("ALT-75 ·") aynı panoda ikinci kez açılınca iki
 * kart tek numarayı paylaşır, atıflar (PR gövdesi, kokpit, durum dosyası) hangisini kastettiğini kaybeder. 12 Ekim'de
 * ALT-75 kopya kartı bu yoldan açıldı.
 *
 * NE YAPAR: başlığın ilk jetonu ("ALT-75") aynı panoda başka bir kartın başlığında zaten varsa kartı AÇTIRMAZ
 * (permissionDecision deny). Okuma: scripts/board/kanban-anlik.cjs --kisa (salt-okunur SQLite), 5 sn tavan.
 * Başlıkta numara yoksa dokunmaz (numarasız kartı başka kapı yakalar).
 *
 * FAIL-OPEN: betik yok / pano okunamadı / cevap çözülemedi → kart açılır. Vana: VENTHUB_ONEK_TEKRARI_KAPAT=1.
 *
 * Neden hook, neden kanban-toplu değil: add_task MCP'ye doğrudan da gider; sarmalayıcı atlanabilir, hook atlanamaz.
 *
 * stdin: { tool_name, tool_input: { action, boardId, title } }
 */

const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const ARAC_ADI = 'mcp__wrongstack-kanban__kanban_manage'
const VANA = 'VENTHUB_ONEK_TEKRARI_KAPAT'
const ANLIK = path.resolve(__dirname, '..', '..', 'scripts', 'board', 'kanban-anlik.cjs')

/** "ALT-75 · ..." → "ALT-75" (büyük harf); numara yoksa null. */
function onek(baslik) {
  const m = /^\s*([A-Za-z0-9]{2,6}-\d{1,5})(?!\d)/.exec(String(baslik || ''))
  return m ? m[1].toUpperCase() : null
}

/**
 * Saf çekirdek. @param {{action?: string, title?: string}} girdi @param {{title?: string}[]} kartlar aynı panonun kartları
 * @returns {string|null} ret gerekçesi ya da null
 */
function karar(girdi, kartlar) {
  if (!girdi || girdi.action !== 'add_task') return null
  const o = onek(girdi.title)
  if (!o) return null
  const var_ = (kartlar || []).find((k) => k && onek(k.title) === o)
  if (!var_) return null
  return (
    `KART AÇILMADI (ARC-102): "${o}" bu panoda zaten var ("${String(var_.title).slice(0, 60)}"). Kart numarası pano ` +
    `sayacından gelir, elle yazılmaz; iki kart tek numarayı paylaşırsa atıflar karışır. Var olan karta not düş ya da ` +
    `numarasız başlıkla aç (sayaç numarayı verir). Vana: ${VANA}=1.`
  )
}

function kartlariOku(boardId) {
  const r = spawnSync(process.execPath, [ANLIK, '--kisa', '--pano', String(boardId)], { encoding: 'utf8', timeout: 5000 })
  const j = JSON.parse(r.stdout || '{}')
  if (!j.ok || !Array.isArray(j.tasks)) throw new Error('okunamadı')
  return j.tasks.map((t) => t.task)
}

function calistir() {
  if (process.env[VANA] === '1') return
  const girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  if (girdi.tool_name !== ARAC_ADI) return
  const t = girdi.tool_input
  if (!t || t.action !== 'add_task' || !t.boardId || !onek(t.title)) return
  const gerekce = karar(t, kartlariOku(t.boardId))
  if (gerekce) {
    fs.writeSync(1, JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: gerekce } }) + '\n')
  }
}

module.exports = { onek, karar }

if (require.main === module) {
  try {
    calistir()
  } catch {
    // fail-open
  }
  process.exit(0)
}
