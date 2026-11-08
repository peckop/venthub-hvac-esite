#!/usr/bin/env node
'use strict'
/**
 * DİZİN AÇILIŞ KANCASI (ARC-282, SEO-98 b; kalıp ARC-280 donum-tara-acilis): SessionStart. GEO-SEO penceresinde
 * `scripts/seo/dizin-acilis.mjs` çıktısı (tek satır: YAP/TEKRAR sayıları, Google/Bing/IndexNow) açılışta basılır.
 * İçerik ve arka plan başlatma (dizin-takip --durum, kopukBaslat, 30 dk kilit) GEO-SEO'nun betiğindedir; bu dosya yalnız ince sarmalayıcıdır:
 * pencereyi tanır, betiği süre tavanıyla koşar, ilk satırı basar. Başka pencerede SESSİZ (betik de koşmaz: arka plan ölçümü boşuna başlamasın).
 * Zamanlayıcı yok (karar 53). Salt-okuma sarmalayıcı, fail-open (her hata çıkış 0), çıktı tek satır ve 400 karakter tavanlı.
 * Vana: VENTHUB_DIZIN_ACILIS_KAPAT=1 (hem burada hem betikte). Testler: kanca-dizin-acilis.test.ts.
 */
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const BETIK = path.join(__dirname, '..', '..', 'scripts', 'seo', 'dizin-acilis.mjs')
const AJAN = 'geo-seo-pencere'
const ZAMAN_ASIMI_MS = 12 * 1000
const AZAMI = 400

function varsayilanKos() {
  return execFileSync(process.execPath, [BETIK], { encoding: 'utf8', timeout: ZAMAN_ASIMI_MS, windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] })
}

/** stdin metni → basılacak tek satır ('' = sessiz). `kos` testte enjekte edilir. */
function calis(stdin, ortam = process.env, kos = varsayilanKos, pencere) {
  if (ortam.VENTHUB_DIZIN_ACILIS_KAPAT === '1') return ''
  let girdi = {}
  try {
    girdi = JSON.parse(stdin || '{}') || {}
  } catch {
    girdi = {}
  }
  const kimlik = pencere || require(path.join(__dirname, '..', '..', 'scripts', 'board', 'pencere-kimligi.cjs'))
  const agent = kimlik.agentAdi({ cwd: typeof girdi.cwd === 'string' ? girdi.cwd : process.cwd(), agentType: typeof girdi.agent_type === 'string' ? girdi.agent_type : undefined })
  if (agent !== AJAN) return ''
  let cikti = ''
  try {
    cikti = kos()
  } catch {
    return '' // betik çöktü ya da zaman aşımı: sessiz (fail-open)
  }
  const satir = String(cikti || '').split(/\r?\n/).map((s) => s.trim()).find(Boolean) || ''
  return satir.length > AZAMI ? satir.slice(0, AZAMI - 1) + '…' : satir
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

module.exports = { calis, AJAN, ZAMAN_ASIMI_MS, AZAMI }
