#!/usr/bin/env node
/**
 * SAHİPSİZ PR durum satırı (ARC-111, OPS-120 madde 3) — EŞİKLİ, bloklamaz, fail-open.
 *
 * Bir PR 7 günden eskiyse ve kartsızsa ya da kartı kapalıysa (muaf: `bekle: <tarih> <engel>`)
 * her mesajda "⛔SAHIPSIZ PR: N (#a · 14g, …)" satırı çıkar; sorun yoksa SUSAR.
 *
 * ÖLÇÜM ARKA PLANDA: hook yalnız önbelleği okur (ağ yok, süreç bekletmez). Önbellek yoksa ya da
 * 60 dakikadan eskiyse `scripts/hijyen/sahipsiz-pr.cjs` ayrı süreçte koşar (10 dakikalık kilit).
 * Önbellek dosyası depo DIŞINDADIR (pano dizini) ve kokpit için de veri dosyasıdır; kokpit
 * girdisi mod sahibi OPS'tadır, bu dosya yalnız veriyi sağlar.
 *
 * Hata yolu: ölçüm başarısızsa son bilinen sahipsiz listesi KORUNUR (çevrimdışı kalmak kırmızıyı
 * gizlemez), `hata` ve eski `olculdu` damgası yazılır; 6 saati aşınca satır "OLCULEMEDI" der.
 */
'use strict'

const fs = require('fs')
const path = require('path')

const ONBELLEK_ADI = '.sahipsiz-pr-onbellek.json'
const TAZELE_DK = 60
const KILIT_DK = 10
const BAYAT_SAAT = 6
const EN_COK_LISTE = 5

function onbellekYolu(pano) {
  return path.join(pano, ONBELLEK_ADI)
}

function oku(yol) {
  let metin
  try {
    metin = fs.readFileSync(yol, 'utf8')
  } catch {
    return { durum: 'yok' }
  }
  try {
    const v = JSON.parse(metin)
    if (!v || typeof v.olculdu !== 'string' || !Array.isArray(v.sahipsiz)) return { durum: 'bozuk' }
    return { durum: 'tamam', veri: v }
  } catch {
    return { durum: 'bozuk' }
  }
}

function yasMs(simdi, iso) {
  const fark = simdi - Date.parse(iso)
  return Number.isFinite(fark) && fark >= -5 * 60000 ? Math.max(fark, 0) : NaN
}

/** Metne yalnız sayı girer (önbellek dış veri sayılır): PR numarası ve gün tamsayı değilse atılır. */
function satir(sonuc, simdi = Date.now()) {
  if (sonuc.durum !== 'tamam') return null // önbellek henüz yok/bozuk: ölçüm başlatıldı, ilk turda susar
  const v = sonuc.veri
  const yas = yasMs(simdi, v.olculdu)
  const bayat = Number.isFinite(yas) ? yas >= BAYAT_SAAT * 3600000 : true
  const saat = Number.isFinite(yas) ? Math.floor(yas / 3600000) : null
  const liste = v.sahipsiz
    .filter((p) => p && Number.isInteger(p.no) && Number.isInteger(p.yas))
  const ek =
    (v.kartlarOlculemedi ? ' · kart durumu OLCULEMEDI (yalniz kartsizlar sayildi)' : '') +
    (v.hata && bayat ? ' · OLCULEMEDI, son basarili olcum ' + (saat === null ? 'yasi bilinmiyor' : saat + ' saat once') : '')
  if (liste.length > 0) {
    const gorunen = liste.slice(0, EN_COK_LISTE).map((p) => '#' + p.no + ' ' + p.yas + 'g')
    const fazla = liste.length > EN_COK_LISTE ? ', +' + (liste.length - EN_COK_LISTE) : ''
    return '⛔SAHIPSIZ PR: ' + liste.length + ' (' + gorunen.join(', ') + fazla + ') — 7 gunden eski, kartsiz/kart kapali; sahibi birlestirir ya da kapatir' + ek
  }
  if (v.hata && bayat) return '⚠SAHIPSIZ PR: OLCULEMEDI (son basarili olcum ' + (saat === null ? 'yasi bilinmiyor' : saat + ' saat once') + ')'
  return null
}

/** Önbellek yok / 60 dakikadan eski ise ölçümü arka planda başlatır. Başlatıldıysa true. */
function gerekirseTazele(pano, simdi = Date.now()) {
  const s = oku(onbellekYolu(pano))
  const yas = s.durum === 'tamam' ? yasMs(simdi, s.veri.denendi || s.veri.olculdu) : NaN
  if (Number.isFinite(yas) && yas < TAZELE_DK * 60000) return false
  const kilit = onbellekYolu(pano) + '.kilit'
  try {
    if (simdi - fs.statSync(kilit).mtimeMs < KILIT_DK * 60000) return false
  } catch {
    /* kilit yok */
  }
  try {
    fs.mkdirSync(pano, { recursive: true })
    fs.writeFileSync(kilit, String(simdi))
    require(path.join(__dirname, '..', '..', 'scripts', 'board', 'kopuk-baslat.cjs')).kopukBaslat(__filename, ['--yaz'], {
      env: { ...process.env, VENTHUB_BOARD_DIR: pano },
    })
    return true
  } catch {
    return false
  }
}

async function yaz(pano, simdi = Date.now()) {
  const motor = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'sahipsiz-pr.cjs'))
  const onceki = oku(onbellekYolu(pano))
  const eski = onceki.durum === 'tamam' ? onceki.veri : { sahipsiz: [] }
  try {
    const s = await motor.olc({ simdi })
    motor.onbellekYaz(pano, s)
  } catch (e) {
    // Ölçemedim: bilinen listeyi KORU, eski `olculdu` damgası kalır ki bayatlık görünsün.
    motor.onbellekYaz(pano, {
      ...eski,
      hata: String((e && e.message) || e).split('\n')[0].slice(0, 80),
      olculdu: eski.olculdu || new Date(simdi).toISOString(),
      denendi: new Date(simdi).toISOString(),
    })
  }
}

module.exports = {
  ONBELLEK_ADI, TAZELE_DK, KILIT_DK, BAYAT_SAAT, EN_COK_LISTE,
  onbellekYolu, oku, satir, gerekirseTazele, yaz,
}

if (require.main === module && process.argv.includes('--yaz')) {
  const pano = process.env.VENTHUB_BOARD_DIR || process.env.VENTHUB_PANO_DIR || 'C:/tmp/venthub-board'
  yaz(pano).then(
    () => process.exit(0),
    () => process.exit(0),
  )
}
