#!/usr/bin/env node
'use strict'

/**
 * KANCA — oturum kapanırken sage hijyenini (`port.hygiene`) koşar — ama YALNIZ taze
 * doğrulanmış yedek varken.
 *
 * Olay: SessionEnd · stdin: { session_id?, reason? } · stdout: YOK · çıkış: DAİMA 0
 *
 * ⛔SIRA: `sage-yedek-oturum-sonu.cjs` ile AYNI olayda ve Claude Code aynı eşleştiricideki
 * kancaları PARALEL koşturur → sıra garantisi yoktur. Bu yüzden hijyen kendi içinde son
 * doğrulanmış SAGE yedeğinin <24 saat olduğunu ölçer; yoksa 20 sn'ye kadar saniyede bir
 * yeniden bakar (yedek ~1 sn sürer); hâlâ yoksa hijyeni ATLAR ve sebebini loga yazar.
 * ⛔`purgeDeletedAfterDays` verilmez (fiziksel silme yok). ⛔Daemon başlatmaz.
 * Sonuç özeti PANO dizinindeki `hafiza-kancalari.log` dosyasına yazılır. Bütçe 60 sn.
 *
 * Yöneten cetvel: docs/standards/hafiza-kancalari-standard.md §8.
 */
const fs = require('fs')
const path = require('path')

try {
  // stdin okunur ama kullanılmaz; okunmazsa üst süreç boru hatası görebilir.
  fs.readFileSync(0, 'utf8')
} catch {
  /* stdin yoksa sorun değil */
}

/**
 * KISMA (ARC-152, OPS 16 Ekim): hijyen oturum kapanışında HER SEFER tam doğrulama turu koşuyordu. Ölçüm (OPS araştırmacısı,
 * 38 koşu): 11'i 5 sn üstü, en uzun 60 sn (bütçe tavanı), koşarken öteki istemciler bekliyor; ARAÇ ölçümü: 384 kayıt
 * incelendi, 0 değişiklik, hep aynı sonuç. Çözüm: son koşudan beri en az 6 saat geçmediyse ATLA.
 * Damga: pano dizininde `hijyen-son-kosum.txt` (epoch ms). Yoksa/okunamazsa/gelecekteyse KOŞ (fail-open: hijyen kaybolmaz).
 */
const KISMA_ARALIK_MS = 6 * 60 * 60 * 1000
const DAMGA_ADI = 'hijyen-son-kosum.txt'

/** SAF: son koşum damgası ve şimdi → koşulsun mu. */
function kismaKarari(sonMs, simdiMs, aralikMs = KISMA_ARALIK_MS) {
  if (!Number.isFinite(sonMs)) return { kos: true, sebep: 'damga-yok' }
  const gecen = simdiMs - sonMs
  if (gecen < 0) return { kos: true, sebep: 'damga-gelecekte' }
  return gecen < aralikMs ? { kos: false, sebep: 'kisma' } : { kos: true, sebep: 'aralik-doldu' }
}

function damgaYolu() {
  const defter = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'sage-enjeksiyon-defteri.cjs'))
  return path.join(defter.panoDizini(), DAMGA_ADI)
}

function sonKosumuOku(yol) {
  try {
    return Number(fs.readFileSync(yol, 'utf8').trim())
  } catch {
    return NaN
  }
}

async function main() {
  let yol = null
  try {
    yol = damgaYolu()
    if (!kismaKarari(sonKosumuOku(yol), Date.now()).kos) return
  } catch {
    /* damga çözülemedi: kısmadan koş */
  }
  try {
    const modul = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'hafiza-enjeksiyonu.cjs'))
    // Damga KOŞMADAN önce yazılır: bütçe aşımı/çökme olsa da bir sonraki oturum kapanışı hemen yeniden başlamasın.
    if (yol) {
      try {
        fs.mkdirSync(path.dirname(yol), { recursive: true })
        fs.writeFileSync(yol, String(Date.now()), 'utf8')
      } catch {
        /* damga yazılamadı: hijyen yine koşar */
      }
    }
    await modul.hijyenKancasi()
  } catch {
    /* fail-open: oturum kapanışı bloklanmaz */
  }
}

if (require.main === module) {
  main().finally(() => process.exit(0))
} else {
  module.exports = { kismaKarari, KISMA_ARALIK_MS, DAMGA_ADI }
}
