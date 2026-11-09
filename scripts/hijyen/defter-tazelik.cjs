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
 * SATIR: rolün defterlerinden EN KÖTÜSÜ tek satırda, hepsi tazeyse ''. Tavan 160 bayt (UTF-8): önce "izlenen yolda N commit",
 * sonra kaynak notu atılır, en sonda başlık kısalır. Çıkış hiçbir yerde fırlatmaz (kanca fail-open çağırır).
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

/** Rolün (sahip) defterleri, emekli olanlar hariç. */
function rolDefterleri(manifest, rol) {
  const r = rolKatla(rol)
  return (manifest.defterler || []).filter((d) => rolKatla(d.sahip) === r && d.durum !== 'emekli')
}

function sonrakiGun(tarih) {
  return new Date(Date.parse(`${tarih}T00:00:00Z`) + GUN_MS).toISOString().slice(0, 10)
}

/** İzlenen yollarda defter tarihinden SONRA kaç commit var; ölçülemezse null (satırdan çıkar). */
function izlenenCommitSayisiGercek(kok, izlenen, tarih) {
  if (!Array.isArray(izlenen) || !izlenen.length || !tarih) return null
  const r = spawnSync('git', ['-C', kok, 'log', `--since=${sonrakiGun(tarih)}T00:00:00`, '--format=%h', '-n', '200', '--', ...izlenen], {
    encoding: 'utf8',
    timeout: 3000,
    windowsHide: true,
  })
  if (r.status !== 0) return null
  return String(r.stdout || '').split(/\r?\n/).filter(Boolean).length
}

const bayt = (s) => Buffer.byteLength(s, 'utf8')

/** Bayt tavanına kısaltır (karakter ortasında kesmez). */
function kirp(s, tavan) {
  if (bayt(s) <= tavan) return s
  let k = s
  while (k.length > 1 && bayt(k + '…') > tavan) k = k.slice(0, -1)
  return k + '…'
}

/**
 * Saf satır kurucu. `sonuclar` tazelik() çıktıları; `yeni` en kötü defter için "izlenen yolda N commit" sayısı (ya da null).
 * Hiçbiri bayat/ölçülemedi değilse ''.
 */
function satir(rol, sonuclar, yeni = null) {
  const sorunlu = sonuclar.filter((s) => s.olculemedi || s.bayat)
  if (!sorunlu.length) return ''
  sorunlu.sort((a, b) => (a.olculemedi ? 0 : 1) - (b.olculemedi ? 0 : 1) || (b.gun ?? 0) - b.esik - ((a.gun ?? 0) - a.esik))
  const e = sorunlu[0]
  const ek = sorunlu.length > 1 ? ` (+${sorunlu.length - 1} defter)` : ''
  const on = `⚠DEFTER (${rol}): `
  if (e.olculemedi) return kirp(`${on}${e.ad} ölçülemedi (${e.olculemedi})${ek}`, SATIR_TAVAN_BAYT)
  const temel = `${e.ad} ${e.gun} gün doğrulanmadı (eşik ${e.esik})`
  const kaynakNotu = e.kaynak === 'git' ? ' [git tarihi]' : e.kaynak === 'dosya-adi' ? ' [ad tarihi]' : ''
  const yeniNotu = yeni ? `; izlenen yolda ${yeni} commit defterden yeni` : ''
  for (const aday of [`${temel}${kaynakNotu}${yeniNotu}${ek}`, `${temel}${kaynakNotu}${ek}`, `${temel}${ek}`]) {
    const s = on + aday
    if (bayt(s) <= SATIR_TAVAN_BAYT) return s
  }
  return kirp(`${on}${temel}${ek}`, SATIR_TAVAN_BAYT)
}

/**
 * Kanca girişi: rol için tek satır ('' = sessiz). Fırlatmaz. `k`: { manifest, simdi, oku, gitTarihi, izlenenSay } (testte verilir).
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
    const sonuclar = defterler.map((d) => ({ d, t: tazelik(d, { kok, simdi, oku: k.oku, gitTarihi: k.gitTarihi }) }))
    const sorunlu = sonuclar.filter((x) => x.t.olculemedi || x.t.bayat)
    if (!sorunlu.length) return ''
    const en = satirKurAdayi(sorunlu)
    let yeni = null
    if (en && en.t.bayat) {
      try {
        yeni = (k.izlenenSay || izlenenCommitSayisiGercek)(kok, en.d.izlenen, en.t.tarih)
      } catch {
        yeni = null
      }
    }
    return satir(rol, sonuclar.map((x) => x.t), yeni)
  } catch {
    return ''
  }
}

/** satir()'ın seçeceği en kötü kaydı (yeni commit sayısı için) aynı sıralamayla bulur. */
function satirKurAdayi(sorunlu) {
  const s = [...sorunlu].sort(
    (a, b) => (a.t.olculemedi ? 0 : 1) - (b.t.olculemedi ? 0 : 1) || (b.t.gun ?? 0) - b.t.esik - ((a.t.gun ?? 0) - a.t.esik),
  )
  return s[0]
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
    if (d.durum === 'emekli') continue
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
