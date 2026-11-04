#!/usr/bin/env node
'use strict'

/**
 * ÖLÇÜM SATIRI UYARISI — PreToolUse(Agent | SendMessage), BLOKLAMAZ (ARC-121, OPS-120 madde 7).
 *
 * NİÇİN: ölçüm hangi departmanda yapılırsa yapılsın kayıt altında olsun, bayat değilse tekrar ölçülmesin. Emir ya da alt ajan görev
 * metni bir ölçüm istiyorsa ve "ÖNCEKİ ÖLÇÜM:" satırı yoksa, ölçüm defterlerinde (docs/audits, hafıza olcum/, katalog envanteri) önce
 * aranmamış demektir. Kanca tek bağlam satırı basar: komutu ve neden.
 *
 * NE ZAMAN: metin ölçüm ister (ölç…) VE emir kalıbı taşır (YÖNTEM:, KAYNAK/CETVEL:, GÖREV, "görev metni") VE "ÖNCEKİ ÖLÇÜM:" yok.
 * Kısa durum mesajları ("ölçtüm, yeşil") emir kalıbı taşımadığı için sessiz kalır.
 *
 * Güvenlik: reddetmez (çıkış hep 0), ağa gitmez, dosya yazmaz; fail-open; çıktı tek satır (≤ 400 karakter); vana VENTHUB_OLCUM_UYARISI_KAPAT=1.
 * settings.json PreToolUse kaydı (matcher Agent|SendMessage) OPS kapısıdır.
 */

const OLCUM = /ölç|olcum|olcu(?:p|m)/i
const EMIR = /(?:^|\n)\s*(?:YÖNTEM|YONTEM|KAYNAK\/CETVEL|KAYNAK|GÖREV|GOREV)\s*:|görev metni|salt-?okuma tarama/i
const VAR = /ÖNCEK[İIiı]\s+ÖLÇÜM\s*:|ONCEK[İIiı]\s+OLCUM\s*:/i
const ALT_SINIR = 160

/** Uyarı gerekiyorsa metin, yoksa null. */
function uyari(metin) {
  const t = String(metin || '')
  if (t.length < ALT_SINIR) return null
  if (!OLCUM.test(t) || !EMIR.test(t) || VAR.test(t)) return null
  return (
    'ÖLÇÜM SATIRI YOK: bu metin bir ölçüm istiyor ama "ÖNCEKİ ÖLÇÜM:" satırı taşımıyor. Önce ölçüm defterlerine bak ' +
    '(node scripts/arac/onceki-calisma.cjs "<konu>"); taze kayıt varsa yeniden ölçme, bayatsa tarihli ekle. Satırı metne yaz (engel yok).'
  )
}

function main() {
  if (process.env.VENTHUB_OLCUM_UYARISI_KAPAT === '1') process.exit(0)
  let raw = ''
  process.stdin.on('data', (c) => (raw += c))
  process.stdin.on('end', () => {
    try {
      const g = JSON.parse(raw)
      const girdi = g.tool_input || {}
      const metin = g.tool_name === 'Agent' ? girdi.prompt : g.tool_name === 'SendMessage' ? girdi.message : null
      const u = uyari(metin)
      if (u) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: u } }) + '\n')
    } catch {
      // fail-open
    }
    process.exit(0)
  })
}

module.exports = { uyari }

if (require.main === module) main()
