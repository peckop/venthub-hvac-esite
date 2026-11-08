#!/usr/bin/env node
'use strict'
/**
 * DÖNÜM AÇILIŞ KANCASI (ARC-280, OPS-257): SessionStart. Günün İLK açılışında (hangi pencere olursa) scripts/arac/donum-tara.cjs
 * artımlı taramayı süre tavanıyla koşar ve sonucu depo dışı dosyaya yazar; aynı gün sonraki açılışlar taramaz.
 * OPS penceresinde (kayıtlı OPS oturum kimliği) tek satır basılır: departman başına önceki güne göre yeniden yazılan betik ve elle komut.
 * Zamanlayıcı/cron YOK (karar 53): yalnız açılış. Salt-okuma (dökümleri okur, yalnız ~/.claude/mod-durum altına yazar), fail-open,
 * tarama tavanı 8 sn. Vana: VENTHUB_DONUM_TARA_KAPAT=1. Mantık ve testler: scripts/arac/donum-tara.cjs, kanca-donum-tara.test.ts.
 */
const path = require('node:path')

const TARAMA_TAVAN_MS = 8 * 1000

function calis(stdin, ortam = process.env) {
  if (ortam.VENTHUB_DONUM_TARA_KAPAT === '1') return ''
  let girdi = {}
  try {
    girdi = JSON.parse(stdin || '{}') || {}
  } catch {
    girdi = {}
  }
  const tara = require(path.join(__dirname, '..', '..', 'scripts', 'arac', 'donum-tara.cjs'))
  const satir = tara.gunluk({ tavanMs: TARAMA_TAVAN_MS })
  let ops = false
  try {
    const o = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'ops-oturumu.cjs'))
    ops = Boolean(girdi.session_id && o.kimlikMi(String(girdi.session_id)))
  } catch {
    ops = false
  }
  return ops ? satir : ''
}

if (require.main === module) {
  let veri = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', (c) => {
    veri += c
  })
  process.stdin.on('end', () => {
    try {
      const o = calis(veri)
      if (o) process.stdout.write(o + '\n')
    } catch {
      // fail-open: kanca hatası oturum açılışını bozmaz
    }
    process.exit(0)
  })
}

module.exports = { calis, TARAMA_TAVAN_MS }
