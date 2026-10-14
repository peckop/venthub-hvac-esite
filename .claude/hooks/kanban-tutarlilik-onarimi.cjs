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

const ARAC = 'mcp__wrongstack-kanban__kanban_manage'
const IZLENEN = new Set(['move_task', 'transition_task', 'update_task'])
const TETIK = /\b(done|completed)\b|karar-verildi/i

/**
 * Araç cevabı başarısız (`ok:false`) mı? SAF. Cevap üç biçimde gelebilir: düz dizge (JSON metni), nesne (`{ok:false}`)
 * ve MCP içerik dizisi (`{content:[{type:'text', text:'{"ok":false,...}'}]}`). JSON.stringify içerik dizisindeki metnin
 * tırnaklarını kaçırır (`\"ok\":false`), düz regex onu kaçırırdı (OPS ölçümü, #1932); bu yüzden nesne çözülür.
 * Çözülemeyen cevap başarılı sayılır (kanca yalnız ek onarım tetikler; yanlışlıkla tetiklenmesi zararsızdır, betik
 * kartı kendisi okuyup ihlal yoksa dokunmaz).
 */
function cagriBasarisizMi(cevap, derinlik = 0) {
  if (cevap === null || cevap === undefined || derinlik > 8) return false
  if (typeof cevap === 'string') {
    const s = cevap.trim()
    if (s.startsWith('{') || s.startsWith('[')) {
      try {
        return cagriBasarisizMi(JSON.parse(s), derinlik + 1)
      } catch {
        /* JSON değil: aşağıdaki metin eşleşmesi */
      }
    }
    return /"ok"\s*:\s*false/.test(s)
  }
  if (Array.isArray(cevap)) return cevap.some((x) => cagriBasarisizMi(x, derinlik + 1))
  if (typeof cevap === 'object') {
    if (cevap.ok === false) return true
    return ['content', 'text', 'result'].some((k) => k in cevap && cagriBasarisizMi(cevap[k], derinlik + 1))
  }
  return false
}

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
  if (cagriBasarisizMi(girdi.tool_response)) return { gerekli: false, sebep: 'cagri-basarisiz' }
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
  const args = ['--onar', '--kart', k.kartKimligi]
  if (k.panoKimligi) args.push('--pano', k.panoKimligi)
  try {
    // `detached: true` yalnız ortak başlatıcıda (INV-KOPUK-1, REC-415): konsolsuz süreç gizli-konsol ön yüklemesini alır.
    require(path.join(__dirname, '..', '..', 'scripts', 'board', 'kopuk-baslat.cjs')).kopukBaslat(betik, args)
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

module.exports = { onarimGerekli, cagriBasarisizMi, IZLENEN, TETIK }
