'use strict'
/**
 * BELGE TAZELİK SATIRI (REC-400 D2, HARİTA tarifi 2026-09-27) — defter-tazelik-satiri.cjs'in
 * eşikli bloğu. Kurulum ARAÇ'ın, metin/eşik/kapı çiftleri HARİTA'nın (Ops iş bölümü 09-27).
 *
 * ── NİÇİN VAR ──
 *
 * Recep: "sürekli hatırlatmak zorunda kalıyorum". Çekirdek belgeler (CONTEXT.md, DURUM-TAKIP.md…)
 * bayatlıyor, belgelerdeki yollar kırılıyor ve bunu gösteren bir yüzey yoktu.
 *
 * ── NASIL ──
 *
 * Ölçüm `scripts/belge/belge-tazelik.cjs --yaz` (HARİTA, ~2,9 sn) → pano dizininde önbellek.
 * Bu blok YALNIZ önbelleği okur: tek dosya okuması, git yok, ağ yok, alt süreç yok.
 * Önbellek 6 saatten eskiyse (ya da yoksa) ölçüm arka planda, pencere açmadan başlatılır
 * (bellek-yoklama.cjs kalıbı); satır o turda eski önbellekle ya da OLCULMEDI ile çıkar.
 *
 * EŞİKLİDİR: hiçbir parça eşiği geçmezse SATIR YOK. Ölçemediğinde eşiksiz konuşur
 * (ölçülemedi ≠ geçti).
 */
const fs = require('fs')
const path = require('path')

const BAYAT_GUN = 14
const GRAF_GUN = 7
const ONBELLEK_BAYAT_SAAT = 24
const TAZELE_SAAT = 6
const KILIT_DK = 10
const BETIK = path.join('scripts', 'belge', 'belge-tazelik.cjs')

function onbellekYolu(pano) {
  return path.join(pano, '.belge-tazelik-onbellek.json')
}

/** @returns {{ durum: 'yok' } | { durum: 'bozuk', hata: string } | { durum: 'tamam', veri: object }} */
function oku(yol) {
  let metin
  try {
    metin = fs.readFileSync(yol, 'utf8')
  } catch {
    return { durum: 'yok' }
  }
  try {
    const v = JSON.parse(metin)
    if (!v || typeof v.olculdu !== 'string' || !Array.isArray(v.cekirdek) || !Array.isArray(v.kirikYeni)) {
      return { durum: 'bozuk', hata: 'alan eksik (olculdu/cekirdek/kirikYeni)' }
    }
    return { durum: 'tamam', veri: v }
  } catch (e) {
    return { durum: 'bozuk', hata: String(e.message) }
  }
}

/** Eşik altında null (satır basılmaz). */
function satir(sonuc, simdi = Date.now()) {
  if (sonuc.durum === 'yok') return '⚠BELGE: OLCULMEDI (onbellek yok)'
  if (sonuc.durum === 'bozuk') return '⚠BELGE: OLCULEMEDI (' + sonuc.hata.slice(0, 60) + ')'
  const v = sonuc.veri
  const parca = []
  for (const c of v.cekirdek) {
    if (typeof c.gun === 'number' && c.gun >= BAYAT_GUN) {
      parca.push(path.basename(String(c.belge)) + ' ' + c.gun + ' gun' + (c.kaynak === 'vekil' ? ' (vekil)' : ''))
    }
  }
  if (v.kirikYeni.length >= 1) {
    const ilk = v.kirikYeni[0]
    parca.push('kirik yol ' + v.kirikYeni.length + ' (' + path.basename(String(ilk.belge)) + ': ' + ilk.yol + ')')
  }
  if (typeof v.grafGun === 'number' && v.grafGun >= GRAF_GUN) parca.push('graphify ' + v.grafGun + ' gun')
  const saat = Math.floor((simdi - Date.parse(v.olculdu)) / 3600000)
  if (Number.isFinite(saat) && saat >= ONBELLEK_BAYAT_SAAT) parca.push('onbellek ' + saat + ' saat bayat')
  return parca.length ? '⚠BELGE: ' + parca.join(' · ') : null
}

/** Önbellek yok ya da 6 saatten eskiyse ölçümü arka planda başlatır; betik yoksa hiçbir şey yapmaz. */
function gerekirseTazele(pano, depo, simdi = Date.now()) {
  const betik = path.join(depo, BETIK)
  if (!fs.existsSync(betik)) return false
  const s = oku(onbellekYolu(pano))
  if (s.durum === 'tamam' && simdi - Date.parse(s.veri.olculdu) < TAZELE_SAAT * 3600000) return false
  const kilit = onbellekYolu(pano) + '.kilit'
  try {
    if (simdi - fs.statSync(kilit).mtimeMs < KILIT_DK * 60000) return false
  } catch {
    /* kilit yok */
  }
  try {
    fs.mkdirSync(pano, { recursive: true })
    fs.writeFileSync(kilit, String(simdi))
    // REC-415: kopuk süreç başlatmanın tek yolu (içindeki git/powershell pencere açmasın)
    require(path.join(__dirname, '..', '..', 'scripts', 'board', 'kopuk-baslat.cjs')).kopukBaslat(betik, ['--yaz'], { cwd: depo })
    return true
  } catch {
    return false // başlatılamadı: önbellek bayatladıkça satır bunu söyler
  }
}

module.exports = { onbellekYolu, oku, satir, gerekirseTazele, BAYAT_GUN, GRAF_GUN, ONBELLEK_BAYAT_SAAT, TAZELE_SAAT }
