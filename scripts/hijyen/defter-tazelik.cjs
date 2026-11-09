#!/usr/bin/env node
'use strict'

/**
 * DEFTER TAZELİK (ARC-288, OPS-258 adım 4; tasarım: docs/plans/departman-defter-duzeni-2026-11-09.md §4.1, §6.1, §6.2;
 * görüş: docs/audits/departman-defter-kanca-gorusu-2026-11-09.md).
 *
 * Üç tüketici TEK okuyucudan beslenir (ikinci liste tutulmaz): (1) açılış satırı `⚠DEFTER (ROL): …`
 * (.claude/hooks/gorev-tazelik-satiri.cjs), (2) scripts/arac/onceki-calisma.cjs defter kaynağı,
 * (3) scripts/board/onceki-calisma-adaylari.cjs defter adayı.
 *
 * MANİFEST: docs/defter/manifest.json (HARİTA). Dosya YOKSA düzen henüz kurulmamıştır: satır SESSİZ (durum 'yok').
 * Dosya VAR ama bozuksa "ölçülemedi" denir; sessizlik "taze" demek değildir. Bozuk sayılanlar: okunamayan dosya,
 * JSON hatası, "defterler" dizisi yok, kaydın ad/dosya/sahip alanı eksik, dosya yolu mutlak ya da ".." içeriyor.
 *
 * TAZELİK (yenisi değil, ilk bulunan kazanır): (1) defterin kendi "Son doğrulama: YYYY-MM-DD" satırı, (2) dosya adındaki tarih,
 * (3) git'te dosyayı değiştiren son commit'in tarihi. mtime KULLANILMAZ (yeniden yazma/biçim commit'i bayat defteri taze gösterir).
 * Gelecek tarihli "Son doğrulama" (>1 gün) ölçülemedi sayılır: yazım hatası bayatlığı gizlemesin.
 *
 * SATIR: rolün defterlerinden EN KÖTÜSÜ tek satırda, hepsi tazeyse ''. Tavan 160 bayt (UTF-8): önce kaynak notu atılır,
 * en sonda başlık kısalır. Satır yalnız TARİH okur; "izlenen yolda N commit" PR kapısının işidir (denetçi U1). Her istemde koşar:
 * git çağrısı çalıştırma başına en çok 3 (gecikme tavanı). Çıkış hiçbir yerde fırlatmaz (kanca fail-open çağırır).
 */

const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const GUN_MS = 86400000
const MANIFEST_YOLU = 'docs/defter/manifest.json'
const VARSAYILAN_ESIK = 14
const SATIR_TAVAN_BAYT = 160
const EN_FAZLA_SATIR = 500
const OKUMA_TAVANI = 256 * 1024

/** Rol/sahip karşılaştırması: ARAÇ = ARAC, GEO-SEO = geo-seo. */
function rolKatla(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .trim()
}

const varsayilanOku = (yol) => fs.readFileSync(yol, 'utf8')

function bozuk(sebep) {
  return { durum: 'bozuk', sebep, defterler: [] }
}

function yolGuvenli(y) {
  return typeof y === 'string' && y !== '' && !path.isAbsolute(y) && !/^[a-z]:/i.test(y) && !y.split(/[\\/]/).includes('..')
}

/**
 * @returns {{durum:'yok'|'tamam'|'bozuk', sebep?:string, defterler:Array<{ad:string,dosya:string,sahip:string,izlenen?:string[],tazelikGun?:number,durum?:string}>}}
 */
function manifestOku(kok, { oku = varsayilanOku } = {}) {
  let ham
  try {
    ham = oku(path.join(kok, ...MANIFEST_YOLU.split('/')))
  } catch (hata) {
    if (hata && hata.code === 'ENOENT') return { durum: 'yok', defterler: [] }
    return bozuk(`okunamadı (${(hata && hata.code) || 'hata'})`)
  }
  let j
  try {
    j = JSON.parse(ham)
  } catch {
    return bozuk('JSON ayrıştırılamadı')
  }
  if (!j || !Array.isArray(j.defterler)) return bozuk('"defterler" dizisi yok')
  // HARİTA şeması (docs/defter/README.md, PR #2440): sema 1. Bilinmeyen sürüm tahmin edilmez; 'ölçülemedi' denir.
  if (j.sema !== undefined && j.sema !== 1) return bozuk(`bilinmeyen şema sürümü: ${String(j.sema).slice(0, 20)}`)
  for (let i = 0; i < j.defterler.length; i++) {
    const d = j.defterler[i]
    if (!d || typeof d.ad !== 'string' || !d.ad || typeof d.sahip !== 'string' || !d.sahip) return bozuk(`kayıt ${i}: ad/sahip eksik`)
    if (!yolGuvenli(d.dosya)) return bozuk(`kayıt ${i} (${d.ad}): dosya yolu geçersiz`)
  }
  return { durum: 'tamam', defterler: j.defterler }
}

/** Defterin kendi "Son doğrulama: 2026-11-09" satırı (ilk 6000 karakter). */
function sonDogrulama(metin) {
  const m = /Son do[ğg]rulama\s*[:：]\s*\**\s*(\d{4}-\d{2}-\d{2})/i.exec(String(metin || '').slice(0, 6000))
  return m ? m[1] : null
}

function adTarihi(dosya) {
  const m = /(\d{4}-\d{2}-\d{2})/.exec(path.basename(String(dosya || '')))
  return m ? m[1] : null
}

function gitTarihiGercek(kok, dosya) {
  const r = spawnSync('git', ['-C', kok, 'log', '-1', '--format=%cs', '--', dosya], { encoding: 'utf8', timeout: 3000, windowsHide: true })
  if (r.status !== 0) return null
  const t = String(r.stdout || '').trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : null
}

function gunFarki(tarih, simdi) {
  const t = Date.parse(`${tarih}T00:00:00Z`)
  return Number.isFinite(t) ? Math.floor((simdi - t) / GUN_MS) : null
}

/**
 * Tek defterin tazeliği: { ad, esik, gun, kaynak, tarih, bayat } ya da { ad, esik, olculemedi: sebep }.
 * `kaynak`: 'son-dogrulama' | 'dosya-adi' | 'git'.
 */
function tazelik(d, { kok, simdi, oku = varsayilanOku, gitTarihi = gitTarihiGercek }) {
  const esik = Number.isInteger(d.tazelikGun) && d.tazelikGun > 0 ? d.tazelikGun : VARSAYILAN_ESIK
  let metin
  try {
    metin = oku(path.join(kok, ...String(d.dosya).split('/')))
  } catch {
    return { ad: d.ad, esik, olculemedi: 'dosya okunamadı' }
  }
  let tarih = sonDogrulama(metin)
  let kaynak = 'son-dogrulama'
  if (!tarih) {
    tarih = adTarihi(d.dosya)
    kaynak = 'dosya-adi'
  }
  if (!tarih) {
    try {
      tarih = gitTarihi(kok, d.dosya)
    } catch {
      tarih = null
    }
    kaynak = 'git'
  }
  if (!tarih) return { ad: d.ad, esik, olculemedi: 'tarih bulunamadı' }
  const gun = gunFarki(tarih, simdi)
  if (gun === null) return { ad: d.ad, esik, olculemedi: 'tarih okunamadı' }
  if (gun < -1) return { ad: d.ad, esik, olculemedi: 'gelecek tarihli doğrulama' }
  const g = Math.max(0, gun)
  return { ad: d.ad, esik, gun: g, kaynak, tarih, bayat: g > esik }
}

/** Durumlar (HARİTA şeması): planli (dosya henüz yok) | pilot | aktif | kontrolsuz | emekli. İzlenmeyenler: planli, emekli. */
const IZLENMEZ = new Set(['planli', 'emekli'])

/** Rolün (sahip) defterleri; planlı (dosyası henüz yok) ve emekli olanlar hariç. */
function rolDefterleri(manifest, rol) {
  const r = rolKatla(rol)
  return (manifest.defterler || []).filter((d) => rolKatla(d.sahip) === r && !IZLENMEZ.has(d.durum))
}

const bayt = (s) => Buffer.byteLength(s, 'utf8')

/** Bayt tavanına kısaltır (karakter ortasında kesmez). */
function kirp(s, tavan) {
  if (bayt(s) <= tavan) return s
  const k = Array.from(s)
  while (k.length > 1 && bayt(k.join('') + '…') > tavan) k.pop()
  return k.join('') + '…'
}

/**
 * Saf satır kurucu. `sonuclar` tazelik() çıktıları; 
 * Hiçbiri bayat/ölçülemedi değilse ''.
 */
function satir(rol, sonuclar) {
  const sorunlu = sonuclar.filter((s) => s.olculemedi || s.bayat)
  if (!sorunlu.length) return ''
  sorunlu.sort((a, b) => (a.olculemedi ? 0 : 1) - (b.olculemedi ? 0 : 1) || (b.gun ?? 0) - b.esik - ((a.gun ?? 0) - a.esik))
  const e = sorunlu[0]
  const ek = sorunlu.length > 1 ? ` (+${sorunlu.length - 1} defter)` : ''
  const on = `⚠DEFTER (${rol}): `
  if (e.olculemedi) return kirp(`${on}${e.ad} ölçülemedi (${e.olculemedi})${ek}`, SATIR_TAVAN_BAYT)
  const temel = `${e.ad} ${e.gun} gün doğrulanmadı (eşik ${e.esik})`
  const kaynakNotu = e.kaynak === 'git' ? ' [git tarihi]' : e.kaynak === 'dosya-adi' ? ' [ad tarihi]' : ''
  for (const aday of [`${temel}${kaynakNotu}${ek}`, `${temel}${ek}`]) {
    const s = on + aday
    if (bayt(s) <= SATIR_TAVAN_BAYT) return s
  }
  return kirp(`${on}${temel}${ek}`, SATIR_TAVAN_BAYT)
}

/** Bir çalıştırmada en çok kaç defter için git çağrılır (her istemde koşar: gecikme tavanı, ~170 ms/çağrı). Aşan defter "tarih bulunamadı". */
const GIT_CAGRI_TAVANI = 3

/**
 * Kanca girişi: rol için tek satır ('' = sessiz). Fırlatmaz. `k`: { manifest, simdi, oku, gitTarihi } (testte verilir).
 * Açılış satırı yalnız TARİH okur (HARİTA §6.1, denetçi U1); "izlenen yolda N commit" PR kapısının işidir.
 */
function rolSatiri(rol, kok, k = {}) {
  try {
    if (!rol) return ''
    const manifest = k.manifest || manifestOku(kok, { oku: k.oku })
    if (manifest.durum === 'yok') return ''
    if (manifest.durum === 'bozuk') return kirp(`⚠DEFTER (${rol}): ölçülemedi (manifest bozuk: ${manifest.sebep})`, SATIR_TAVAN_BAYT)
    const defterler = rolDefterleri(manifest, rol)
    if (!defterler.length) return ''
    const simdi = k.simdi ?? Date.now()
    const gitGercek = k.gitTarihi || gitTarihiGercek
    let gitSayac = 0
    const gitTarihi = (kk, dosya) => (++gitSayac > GIT_CAGRI_TAVANI ? null : gitGercek(kk, dosya))
    return satir(rol, defterler.map((d) => tazelik(d, { kok, simdi, oku: k.oku, gitTarihi })))
  } catch {
    return ''
  }
}

/** Ölçüm/aday taraması için aranacak satırlar: tüm başlıklar + "Sırada"/"Envanter" bölümlerinin liste/tablo satırları. */
function aranacakSatirlar(metin) {
  const cikti = []
  let bolum = '(başlıksız)'
  let ozel = false
  for (const s of String(metin || '').split(/\r?\n/)) {
    if (cikti.length >= EN_FAZLA_SATIR) break
    const h = /^#{1,4}\s+(.*)$/.exec(s)
    if (h) {
      bolum = h[1].trim()
      ozel = /s[ıi]rada|envanter/i.test(bolum)
      cikti.push({ bolum, satir: bolum })
    } else if (ozel && s.trim() && /^\s*([-*|]|\d+\.)/.test(s)) {
      cikti.push({ bolum, satir: s.trim().slice(0, 300) })
    }
  }
  return cikti
}

/**
 * Tarama kaynağı: manifestteki defterlerin metinleri. durum: 'yok' (manifest yok) | 'bozuk' | 'olculemedi' (bir defter dosyası okunamadı)
 * | 'tamam'. Tek dosya okunamazsa HEPSİ ölçülemedi: eksik okuma "bulunamadı" kanıtı sayılmaz.
 */
function defterIcerikleri(kok, { oku = varsayilanOku } = {}) {
  const m = manifestOku(kok, { oku })
  if (m.durum === 'yok') return { durum: 'yok', defterler: [] }
  if (m.durum === 'bozuk') return { durum: 'bozuk', sebep: m.sebep, defterler: [] }
  const defterler = []
  for (const d of m.defterler) {
    if (IZLENMEZ.has(d.durum)) continue
    let metin
    try {
      metin = String(oku(path.join(kok, ...String(d.dosya).split('/')))).slice(0, OKUMA_TAVANI)
    } catch {
      return { durum: 'olculemedi', sebep: `defter dosyası okunamadı: ${d.ad}`, defterler: [] }
    }
    defterler.push({ ad: d.ad, dosya: d.dosya, sahip: d.sahip, metin })
  }
  return { durum: 'tamam', defterler }
}

module.exports = {
  MANIFEST_YOLU,
  VARSAYILAN_ESIK,
  SATIR_TAVAN_BAYT,
  rolKatla,
  manifestOku,
  sonDogrulama,
  adTarihi,
  tazelik,
  rolDefterleri,
  satir,
  rolSatiri,
  aranacakSatirlar,
  defterIcerikleri,
}
