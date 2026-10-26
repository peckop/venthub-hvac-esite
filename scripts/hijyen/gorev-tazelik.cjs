#!/usr/bin/env node
'use strict'

/**
 * DÜZENLİ GÖREV TAZELİK SATIRI (ARC-216 A kolu, HRT-74 önerisi, OPS-181 madde 4).
 *
 * NİÇİN: scripts/belge/rol-gorevleri.json'da 20 düzenli görevin tetiği "istem-tazelik" ama bağlı değil
 * ("<ad>: N gün" satırı yok). Haftalık öz-değerlendirme 12 rolde, SEO haftalık, katalog baskı, filo raporu,
 * skill ölçümü: kimse hatırlatmadığı için kimse yapmıyordu. Satır adı ve eşik, görev verisinin kendisinden okunur
 * (tetikAyrinti: `istem satırında "<ad>: N gün" (E gün eşik)`); ikinci bir liste TUTULMAZ.
 *
 * SON YAPILMA (iki kaynak, yenisi kazanır):
 *   1. DAMGA: görevi bitiren rol `node scripts/hijyen/gorev-damga.cjs "<ad>" --rol <ROL>` koşar. Kullanıcıya özel dosya
 *      (~/.claude/mod-durum/gorev-damga.json), depo DIŞI.
 *   2. ARTEFAKT: çıktısı depoda tarihli dosya olan görevde (ARTEFAKTLAR) dosya adındaki tarih (git ls-tree, yerel).
 * Damga yoksa ilk görülme anı damga sayılır ve yazılır (sayaç o andan işler); satır bunu "başlangıç" diye belirtir.
 *
 * SATIR: yalnız eşiği aşan görev varsa, TEK satır; hiçbiri aşmadıysa sessiz (her mesajda token yemesin).
 * Rol, pencerenin agent anahtarından çözülür (pencere-kimligi.cjs); rolü çözülemeyen oturumda satır yok.
 * Saf çekirdek enjekte edilebilir (saat, dosya, artefakt); kaynak okunamazsa sessiz (fail-open).
 */

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const GUN_MS = 86400000
// tetikAyrinti: istem satırında "SEO haftalık: N gün" (7 gün eşik)
const SATIR_KALIBI = /istem satırında\s+"([^"]+?):\s*N gün"\s*\((\d+)\s*gün eşik\)/
// Çıktısı depoda tarihli dosya olan görevler: satır adı → dosya adı kalıbı (grup 1 = YYYY-AA-GG).
const ARTEFAKTLAR = {
  'SEO haftalık': /^docs\/audits\/seo-haftalik-(\d{4}-\d{2}-\d{2})\.md$/,
}

function damgaDosyasi() {
  return path.join(os.homedir(), '.claude', 'mod-durum', 'gorev-damga.json')
}

/** rol-gorevleri.json içeriğinden rol → [{ ad, esik }] (yalnız istem-tazelik ve "N gün" satırı olanlar). */
function gorevleriOku(veri) {
  const sonuc = {}
  for (const [rol, v] of Object.entries((veri && veri.roller) || {})) {
    for (const g of (v && v.gorevler) || []) {
      if (g.tetik !== 'istem-tazelik') continue
      const m = SATIR_KALIBI.exec(String(g.tetikAyrinti || ''))
      if (!m) continue
      ;(sonuc[rol] = sonuc[rol] || []).push({ ad: m[1].trim(), esik: Number(m[2]) })
    }
  }
  return sonuc
}

function anahtar(ad, rol) {
  return `${ad}|${rol}`
}

function damgaOku(dosya = damgaDosyasi()) {
  try {
    const j = JSON.parse(fs.readFileSync(dosya, 'utf8'))
    return j && typeof j === 'object' ? j : {}
  } catch {
    return {}
  }
}

function damgaYaz(ad, rol, simdi = Date.now(), dosya = damgaDosyasi(), ilk = false) {
  const d = damgaOku(dosya)
  d[anahtar(ad, rol)] = { ts: simdi, ilk }
  fs.mkdirSync(path.dirname(dosya), { recursive: true })
  fs.writeFileSync(dosya, JSON.stringify(d, null, 1))
}

/** Artefakt dosya listesinden en yeni tarih (ms); yok ya da kalıp tanımsızsa null. */
function artefaktZamani(ad, dosyalar) {
  const kalip = ARTEFAKTLAR[ad]
  if (!kalip) return null
  let en = null
  for (const f of dosyalar || []) {
    const m = kalip.exec(f)
    if (!m) continue
    const t = Date.parse(`${m[1]}T00:00:00Z`)
    if (Number.isFinite(t) && (en === null || t > en)) en = t
  }
  return en
}

/**
 * Saf değerlendirme: görev başına { ad, esik, gun, baslangic, bayat }.
 * `damgalar` kaydında olmayan görev İLK GÖRÜLME sayılır: ts = simdi, baslangic = true (çağıran yazar).
 */
function degerlendir({ gorevler, rol, damgalar, simdi, dosyalar }) {
  return (gorevler || []).map((g) => {
    const kayit = (damgalar || {})[anahtar(g.ad, rol)]
    const art = artefaktZamani(g.ad, dosyalar)
    const damgaTs = kayit && Number.isFinite(kayit.ts) ? kayit.ts : null
    const son = Math.max(damgaTs ?? -Infinity, art ?? -Infinity)
    const baslangic = !Number.isFinite(son)
    const ts = baslangic ? simdi : son
    const gun = Math.floor((simdi - ts) / GUN_MS)
    return { ad: g.ad, esik: g.esik, gun, baslangic: baslangic || (kayit?.ilk === true && art === null), bayat: gun >= g.esik }
  })
}

/** Tek satır; hiçbiri bayat değilse ''. */
function satir(rol, sonuclar) {
  const bayat = sonuclar.filter((s) => s.bayat)
  if (!bayat.length) return ''
  const parca = bayat.map((s) => `${s.ad}: ${s.gun} gün (eşik ${s.esik}${s.baslangic ? ', sayaç ilk görülmeden beri' : ''})`)
  return (
    `⚠GÖREV (${rol}): ${parca.join(' · ')} — yapınca damgala: ` +
    `node scripts/hijyen/gorev-damga.cjs "${bayat[0].ad}" --rol ${rol}`
  )
}

function artefaktDosyalari(kok) {
  const r = spawnSync('git', ['-C', kok, 'ls-tree', '-r', '--name-only', 'origin/master', 'docs/audits'], {
    encoding: 'utf8',
    timeout: 3000,
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
  })
  return r.status === 0 ? String(r.stdout || '').split(/\r?\n/).filter(Boolean) : []
}

/**
 * Kanca girişi: rol için satır (ya da ''). İlk görülen görevlerin başlangıç damgasını yazar.
 * `kaynak`: { veri, damgalar, simdi, dosyalar, yaz } testte verilir.
 */
function rolSatiri(rol, kok, kaynak = {}) {
  if (!rol) return ''
  const veri = kaynak.veri || JSON.parse(fs.readFileSync(path.join(kok, 'scripts', 'belge', 'rol-gorevleri.json'), 'utf8'))
  const gorevler = gorevleriOku(veri)[rol]
  if (!gorevler || !gorevler.length) return ''
  const simdi = kaynak.simdi ?? Date.now()
  const damgalar = kaynak.damgalar || damgaOku()
  const dosyalar = kaynak.dosyalar || (gorevler.some((g) => ARTEFAKTLAR[g.ad]) ? artefaktDosyalari(kok) : [])
  const yaz = kaynak.yaz || ((ad) => damgaYaz(ad, rol, simdi, undefined, true))
  const sonuclar = degerlendir({ gorevler, rol, damgalar, simdi, dosyalar })
  for (const g of gorevler) {
    if (!damgalar[anahtar(g.ad, rol)] && !sonuclar.find((s) => s.ad === g.ad)?.bayat) {
      try {
        yaz(g.ad)
      } catch {
        /* yazılamadı: sayaç başlamaz, satır yine sessiz */
      }
    }
  }
  return satir(rol, sonuclar)
}

module.exports = { gorevleriOku, degerlendir, satir, rolSatiri, damgaYaz, damgaOku, damgaDosyasi, artefaktZamani, ARTEFAKTLAR, SATIR_KALIBI }
