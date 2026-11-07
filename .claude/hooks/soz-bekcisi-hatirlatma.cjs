#!/usr/bin/env node
'use strict'

/**
 * UserPromptSubmit hook — SÖZ BEKÇİSİ HATIRLATMASI (ARC-58 yeniden tasarım, OPS 7 Kasım).
 *
 * Cevap yazılmadan ÖNCE, soz-bekcisi-kurallari.json'daki her kuralın `duzeltme` cümlesini TEK satırda hatırlatır.
 * Sabit metin (kurallar değişmedikçe aynı bayt: önbelleği oynatmaz), en çok 300 bayt. Geri çevirme yok; ölçüm Stop
 * tarafındadır (soz-bekcisi.cjs). Fail-open: okunamayan kural dosyasında sessiz. Vana: VENTHUB_SOZ_BEKCISI_KAPAT=1.
 */

const fs = require('node:fs')
const path = require('node:path')

const TAVAN_BAYT = 300
const KURAL_DOSYASI = path.join(__dirname, 'soz-bekcisi-kurallari.json')

/** Kurallardan tek satır; bayt tavanını aşarsa son kelimede keser. Kural yoksa ''. */
function hatirlatma(kurallar, tavan = TAVAN_BAYT) {
  const parcalar = (kurallar || []).map((k) => String(k.duzeltme || '').trim()).filter(Boolean)
  if (parcalar.length === 0) return ''
  let satir = 'SÖZ KURALI (sahibin şikâyeti, cevapta görünmesin): ' + parcalar.join(' · ')
  while (Buffer.byteLength(satir, 'utf8') > tavan) satir = satir.slice(0, -1)
  return satir
}

function calistir() {
  if (process.env.VENTHUB_SOZ_BEKCISI_KAPAT === '1') return
  const j = JSON.parse(fs.readFileSync(KURAL_DOSYASI, 'utf8'))
  const s = hatirlatma(j.kurallar)
  if (s) fs.writeSync(1, s + '\n')
}

module.exports = { hatirlatma, TAVAN_BAYT }

if (require.main === module) {
  try {
    calistir()
  } catch {
    // fail-open
  }
  process.exit(0)
}
