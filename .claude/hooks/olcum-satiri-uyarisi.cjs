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
 * Güvenlik: reddetmez (çıkış hep 0), ağa gitmez, dosya yazmaz; fail-open; uyarı tek satır (≤ 400), adaylar ≤ 1200 karakter (ARC-275: emir kalıbında onceki-calisma --kanca, 2 sn zaman aşımı); vana VENTHUB_OLCUM_UYARISI_KAPAT=1.
 * settings.json PreToolUse kaydı (matcher Agent|SendMessage) OPS kapısıdır.
 */

const OLCUM = /ölç|olcum|olcu(?:p|m)/i
const EMIR = /(?:^|\n)\s*(?:YÖNTEM|YONTEM|KAYNAK\/CETVEL|KAYNAK|GÖREV|GOREV)\s*:|görev metni|salt-?okuma tarama/i
const VAR = /ÖNCEK[İIiı]\s+ÖLÇÜM\s*:|ONCEK[İIiı]\s+OLCUM\s*:/i
const ALT_SINIR = 160
const ADAY_TAVAN = 1200
const ADAY_ZAMAN_ASIMI_MS = 2000

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

/** ARC-275: emir gibi okunan metin için eski çalışma/ölçüm adayları (onceki-calisma --kanca, <2 sn, fail-open). null = aday yok. */
function adaylar(metin, calistir) {
  const t = String(metin || '')
  if (t.length < ALT_SINIR || !EMIR.test(t)) return null
  try {
    const cikti = (calistir || adayCalistir)(t)
    const satirlar = String(cikti || '')
      .split(/\r?\n/)
      .filter((l) => /^ÖNCEK[İI] (?:ÇALIŞMA|ÖLÇÜM): BULUNDU/.test(l))
    if (!satirlar.length) return null
    return ('ADAYLAR (mükerrer iş olabilir, açmadan oku): ' + satirlar.join(' | ')).slice(0, ADAY_TAVAN)
  } catch {
    return null
  }
}

function adayCalistir(metin) {
  const r = require('node:child_process').spawnSync(
    process.execPath,
    [require('node:path').join(__dirname, '..', '..', 'scripts', 'arac', 'onceki-calisma.cjs'), metin.slice(0, 2000), '--kanca'],
    { encoding: 'utf8', timeout: Number(process.env.VENTHUB_ADAY_ZAMAN_ASIMI_MS) || ADAY_ZAMAN_ASIMI_MS, windowsHide: true },
  )
  return r.status === 0 ? r.stdout : ''
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
      const parca = [uyari(metin), adaylar(metin)].filter(Boolean)
      if (parca.length) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: parca.join('\n') } }) + '\n')
    } catch {
      // fail-open
    }
    process.exit(0)
  })
}

module.exports = { uyari, adaylar }

if (require.main === module) main()
