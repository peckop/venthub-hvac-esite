#!/usr/bin/env node
'use strict'

/**
 * PostToolUse hook (kanban_manage add_task) — KART NUMARASI BİLDİRİMİ (ARC-325, OPS-292 DÜZELT).
 *
 * NİÇİN: WrongStack add_task yanıtı kart numarasını döndürmez; numarayı bulmak 5-6 çağrı tutuyordu (ARC-319/320/322 açılışında
 * ölçüldü). Kart açıldıktan sonra aynı ön ekin SIRADAKİ numarasını bağlama tek satır yazar; bir sonraki kart için arama gerekmez.
 *
 * NE YAPAR: başarılı add_task'tan ("Task added" yanıtı) sonra başlığın ön ekini okur, panoyu salt-okunur tarar
 * (scripts/board/siradaki-kart-no.cjs) ve additionalContext olarak şunu yazar:
 *   "KART NUMARASI: ARC-322 açıldı. ARC önekinde en büyük numara 322, sıradaki ARC-323 (arşivsiz)."
 * Başlıkta numara yoksa: "⚠ARC-?: başlık numarasız açıldı" demez (ön ek bilinmez); yalnız uyarı: numarasız kartı başka kapı yakalar.
 *
 * NE YAPMAZ: engellemez, kart açmaz, panoya YAZMAZ. Çıkış HEP 0 (fail-open); pano okunamazsa sessiz. Vana: VENTHUB_KART_NUMARA_KAPAT=1.
 * Yinelenen numarayı yakalamak PreToolUse kart-onek-tekrari kapısının işidir; bu kanca onu tekrarlamaz.
 *
 * stdin: { tool_name, tool_input: { action, boardId, title }, tool_response }
 */

const path = require('node:path')

const ARAC_ADI = 'mcp__wrongstack-kanban__kanban_manage'
const VANA = 'VENTHUB_KART_NUMARA_KAPAT'

/** SAF: bağlama yazılacak satırı üretir; null = sessiz. `basliklar` aynı anda panodaki tüm başlıklar (yeni kart dahil olabilir). */
function satir(girdi, basliklar, no) {
  if (!girdi || girdi.tool_name !== ARAC_ADI) return null
  const ti = girdi.tool_input || {}
  if (ti.action !== 'add_task') return null
  const yanit = typeof girdi.tool_response === 'string' ? girdi.tool_response : JSON.stringify(girdi.tool_response || '')
  if (!/Task added/.test(yanit)) return null
  const n = no.numaraCoz(ti.title)
  if (!n || !Array.isArray(basliklar)) return null
  const s = no.siradaki(basliklar, n.onek)
  return `KART NUMARASI: ${n.onek}-${n.sayi} açıldı. ${n.onek} önekinde en büyük numara ${s.enBuyuk}, sıradaki ${s.siradaki} (arşivsiz).`
}

function main() {
  if (process.env[VANA] === '1') return
  let ham = ''
  try {
    ham = require('node:fs').readFileSync(0, 'utf8')
  } catch {
    return
  }
  let girdi
  try {
    girdi = JSON.parse(ham || '{}')
  } catch {
    return
  }
  const no = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'siradaki-kart-no.cjs'))
  // Ucuz ön eleme: add_task değilse panoyu hiç okuma (her kanban çağrısında 0,2 sn harcanmaz).
  const ti = (girdi && girdi.tool_input) || {}
  if (!girdi || girdi.tool_name !== ARAC_ADI || ti.action !== 'add_task') return
  const basliklar = no.basliklariOku()
  const metin = satir(girdi, basliklar, no)
  try {
    require('./kanca-sayac.cjs').say('kart-numara-bildirimi', metin ? 'uyari' : 'kosu', girdi.session_id)
  } catch {
    /* sayaç kancayı bozmaz */
  }
  if (!metin) return
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: metin } }) + '\n')
}

if (require.main === module) {
  try {
    main()
  } catch {
    /* fail-open */
  }
  process.exit(0)
}

module.exports = { satir, ARAC_ADI, VANA }
