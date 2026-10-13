#!/usr/bin/env node
'use strict'
/**
 * KANBAN TUTARSIZLIK ONARIMI KANCASI — ARC-125 (PostToolUse, matcher `mcp__wrongstack-kanban__kanban_manage`).
 *
 * NE YAPAR: bir kart Done'a gittiğinde ya da `karar-verildi` etiketi aldığında, o KARTI düzeltmek için
 * `scripts/board/kanban-tutarlilik.cjs --onar --kart <id> --pano <pano>` betiğini KOPARILMIŞ süreç olarak başlatır
 * (hafta-NN etiketi eksikse ekler; `karar-verildi` Backlog kartını To Do'ya taşır). Kural ve SINIR betiktedir; bu kanca
 * yalnız tetikler. Çıktı vermez, hiçbir zaman engellemez (exit 0), hata açılışı/aracı bozmaz.
 *
 * ÖZYİNELEME YOK: betik Kanban'a doğrudan MCP sunucusuyla yazar (Claude aracı değil), yani bu kanca onun yazımlarında
 * tetiklenmez.
 *
 * VANA: `VENTHUB_KANBAN_ONARIM_KAPALI=1` kancayı tamamen susturur (test ve acil durum).
 */
const path = require('node:path')
const { spawn } = require('node:child_process')

const ARAC = 'mcp__wrongstack-kanban__kanban_manage'
const IZLENEN = new Set(['move_task', 'transition_task', 'update_task'])
const TETIK = /\b(done|completed)\b|karar-verildi/i

/**
 * Bu araç çağrısı için onarım gerekli mi? SAF.
 * @returns {{gerekli: boolean, kartKimligi?: string, panoKimligi?: string, sebep: string}}
 */
function onarimGerekli(girdi) {
  if (!girdi || girdi.tool_name !== ARAC) return { gerekli: false, sebep: 'baska-arac' }
  const ti = girdi.tool_input || {}
  if (!IZLENEN.has(ti.action)) return { gerekli: false, sebep: 'izlenmeyen-islem' }
  if (typeof ti.taskId !== 'string' || ti.taskId === '') return { gerekli: false, sebep: 'kart-yok' }
  // Başarısız çağrı (ok:false) kartı değiştirmemiştir.
  const cevap = typeof girdi.tool_response === 'string' ? girdi.tool_response : JSON.stringify(girdi.tool_response || '')
  if (/"ok"\s*:\s*false/.test(cevap)) return { gerekli: false, sebep: 'cagri-basarisiz' }
  if (!TETIK.test(JSON.stringify(ti))) return { gerekli: false, sebep: 'tetik-yok' }
  return { gerekli: true, kartKimligi: ti.taskId, panoKimligi: typeof ti.boardId === 'string' ? ti.boardId : undefined, sebep: 'tetik' }
}

function main() {
  if (process.env.VENTHUB_KANBAN_ONARIM_KAPALI === '1') return
  let girdi = {}
  try {
    girdi = JSON.parse(require('node:fs').readFileSync(0, 'utf8') || '{}')
  } catch {
    return
  }
  const k = onarimGerekli(girdi)
  if (!k.gerekli) return
  const betik = path.join(__dirname, '..', '..', 'scripts', 'board', 'kanban-tutarlilik.cjs')
  const args = [betik, '--onar', '--kart', k.kartKimligi]
  if (k.panoKimligi) args.push('--pano', k.panoKimligi)
  try {
    const s = spawn(process.execPath, args, { detached: true, stdio: 'ignore', windowsHide: true })
    s.unref()
  } catch {
    /* tetiklenemedi: onarım bir sonraki taramada yapılır, çağrı bozulmaz */
  }
}

if (require.main === module) {
  try {
    main()
  } catch {
    /* kanca asla engellemez */
  }
  process.exit(0)
}

module.exports = { onarimGerekli, IZLENEN, TETIK }
