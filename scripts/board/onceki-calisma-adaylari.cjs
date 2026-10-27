#!/usr/bin/env node
'use strict'

/**
 * ÖNCEKİ ÇALIŞMA ADAYLARI (ARC-215, OPS emri 26 Ekim 2026).
 *
 * NİÇİN: OPS, YETENEK'e YTN-19 emrini yazarken departmanın 5 Eylül-12 Ekim arası kendi ölçümlerini
 * (docs/audits/skill-* dokuz belge, YTN-7/8/9/11/12/18) aramadı ve "ÖNCEKİ ÇALIŞMA" satırını aramadan doldurdu.
 * Hafıza notu yetmiyor (tekrar eden hata aynı gün kancaya). Bu modül kart AÇILIRKEN adayları kendisi bulur.
 *
 * ÜÇ KAYNAK (hepsi yerel, ağ yok): (1) son 30 günün origin/master commit başlıkları, kartın departman önekiyle
 * (ARC-123 …) başlayanlar; (2) departmanın docs/audits dosya alanındaki dosya adları; (3) aynı departmanın Done
 * kartları. Hepsi kart başlığındaki anahtar sözcüklerle süzülür (≥2 ortak sözcük ya da 1 uzun ve ayırt edici sözcük).
 *
 * Saf çekirdek (`adaylariBul`) kaynakları ENJEKTE alır: test sahte kaynak verir. Kaynak okunamazsa o kol sessizce boş
 * kalır (fail-open). Kanca: .claude/hooks/onceki-calisma-kapisi.cjs.
 */

const path = require('node:path')
const { spawnSync } = require('node:child_process')

const SON_GUN = 30
const KAYNAK_TAVANI = 3
const TOPLAM_TAVANI = 8
const UZUN_SOZCUK = 8
// Başlıkta çok geçen ve ayırt etmeyen sözcükler (4 harften uzun olsa bile).
const GURULTU = new Set(
  [
    'kartı', 'kartlar', 'kancası', 'kanca', 'betik', 'uyarı', 'ölçüm', 'ölçüldü', 'sonra', 'önce', 'yalnız', 'olarak',
    'ile', 'için', 'başka', 'üzerinde', 'içinde', 'olan', 'olur', 'edilir', 'edilmesi', 'yapılır', 'açılışta',
    'sırasında', 'zaman', 'ayrı', 'tüm', 'her', 'bütün', 'gibi', 'kadar', 'ikinci', 'birinci', 'yeni', 'eski',
    'düzen', 'düzeni', 'kural', 'kuralı', 'dosya', 'dosyası', 'belge', 'satır', 'satırı', 'satırları',
  ].map((s) => s.toLocaleLowerCase('tr')),
)

/** Başlıktan ayırt edici sözcükler (küçük harf, ≥5 harf, gürültü ve numara dışı, tekrarsız). */
function anahtarSozcukler(baslik) {
  const govde = String(baslik || '').replace(/^\s*[A-Za-z0-9]{2,4}-\d+\s*[·:-]?\s*/, '')
  const sonuc = []
  for (const s of govde.toLocaleLowerCase('tr').split(/[^\p{L}\p{N}]+/u)) {
    if (s.length >= 5 && !GURULTU.has(s) && !/^\d+$/.test(s) && !sonuc.includes(s)) sonuc.push(s)
  }
  return sonuc
}

/** Metin, anahtar sözcüklerden kaçını içeriyor? Türkçe ek toleransı için sözcüğün ilk 5+ harfi (kök) aranır. */
function ortakSozcukler(metin, anahtarlar) {
  const t = String(metin || '').toLocaleLowerCase('tr')
  return anahtarlar.filter((a) => t.includes(a.length > 7 ? a.slice(0, a.length - 2) : a))
}

function yeterliMi(ortak) {
  return ortak.length >= 2 || (ortak.length === 1 && ortak[0].length >= UZUN_SOZCUK)
}

function sirala(liste) {
  return liste.sort((a, b) => b.puan - a.puan)
}

/**
 * Saf çekirdek.
 * @param {{ baslik: string, commitler?: Array<{ id: string, konu: string }>, dosyalar?: string[], doneKartlar?: Array<{ no: string, baslik: string }> }} girdi
 * @returns {{ commit: Array<{ id: string, ad: string, puan: number }>, belge: Array<...>, kart: Array<...>, hepsi: Array<{ tur: string, id: string, ad: string }> }}
 */
function adaylariBul(girdi) {
  const anahtar = anahtarSozcukler(girdi.baslik)
  const sonuc = { commit: [], belge: [], kart: [], hepsi: [] }
  if (anahtar.length === 0) return sonuc
  const puanla = (metin) => {
    const o = ortakSozcukler(metin, anahtar)
    return yeterliMi(o) ? o.length : 0
  }
  for (const c of girdi.commitler || []) {
    const p = puanla(c.konu)
    if (p) sonuc.commit.push({ id: c.id, ad: c.konu, puan: p })
  }
  for (const d of girdi.dosyalar || []) {
    const p = puanla(path.basename(d).replace(/[-_.]/g, ' '))
    if (p) sonuc.belge.push({ id: d, ad: d, puan: p })
  }
  for (const k of girdi.doneKartlar || []) {
    const p = puanla(k.baslik)
    if (p) sonuc.kart.push({ id: k.no, ad: k.baslik, puan: p })
  }
  sonuc.commit = sirala(sonuc.commit).slice(0, KAYNAK_TAVANI)
  sonuc.belge = sirala(sonuc.belge).slice(0, KAYNAK_TAVANI)
  sonuc.kart = sirala(sonuc.kart).slice(0, KAYNAK_TAVANI)
  sonuc.hepsi = [
    ...sonuc.commit.map((x) => ({ tur: 'commit', id: x.id, ad: x.ad })),
    ...sonuc.belge.map((x) => ({ tur: 'belge', id: x.id, ad: x.ad })),
    ...sonuc.kart.map((x) => ({ tur: 'kart', id: x.id, ad: x.ad })),
  ].slice(0, TOPLAM_TAVANI)
  return sonuc
}

/** Kart açıklamasındaki "ÖNCEKİ ÇALIŞMA:" paragrafı (sonraki ANAHTAR: satırına kadar); yoksa ''. */
function oncekiSatiri(aciklama) {
  const m = /[ÖO]NCEK[İI]\s+[ÇC]AL[İI][ŞS]MA\s*:([\s\S]*?)(?=\n\s*[A-ZÇĞİÖŞÜ/ ]{3,24}:|$)/i.exec(String(aciklama || ''))
  return m ? m[1] : ''
}

/** Satır aday kimliklerinden hangilerini anıyor? (commit kısa özet, kart numarası, dosya adı ya da yolu) */
function anilanlar(satir, adaylar) {
  const s = String(satir || '').toLowerCase()
  return adaylar.filter((a) => {
    const id = String(a.id).toLowerCase()
    return id.length >= 4 && (s.includes(id) || s.includes(path.basename(id)))
  })
}

/**
 * Basılacak metinler. `aciklama` verilmişse ÖNCEKİ ÇALIŞMA satırıyla karşılaştırılır:
 * satırda hiçbir aday anılmıyorsa ek olarak UYARI. Aday yoksa [] (sessiz).
 */
function metinler(adaylar, aciklama) {
  if (!adaylar.hepsi.length) return []
  const satirlar = adaylar.hepsi.map((a) => `  - ${a.tur}: ${a.id === a.ad || a.ad.startsWith(a.id) ? a.ad : `${a.id} ${a.ad}`}`.slice(0, 200))
  const cikti = [`ÖNCEKİ ÇALIŞMA adayları (kanca buldu, ${adaylar.hepsi.length} tane):\n${satirlar.join('\n')}`]
  const satir = oncekiSatiri(aciklama)
  if (satir && anilanlar(satir, adaylar.hepsi).length === 0) {
    cikti.push(
      `ÖNCEKİ ÇALIŞMA UYARI: aday ${adaylar.hepsi.length} tane var, kartın ÖNCEKİ ÇALIŞMA satırında hiçbiri anılmıyor. ` +
        'Hepsini oku; ilgisizse satıra neden ilgisiz olduğunu yaz.',
    )
  }
  return cikti
}

// ---- Kaynak okuyucular (yan etkili; testte sahteleri verilir) ----

function sonCommitler(kok, onek, calistir = git) {
  const r = calistir(kok, [
    'log', 'origin/master', `--since=${SON_GUN}.days`, '-i', '-E', `--grep=(^|[^A-Za-z0-9])${onek}-[0-9]+`,
    '--format=%h\t%s', '-n', '400',
  ])
  if (!r || r.status !== 0) return []
  return String(r.stdout || '')
    .split(/\r?\n/)
    .map((l) => l.split('\t'))
    .filter((p) => p.length >= 2 && p[0])
    .map((p) => ({ id: p[0], konu: p.slice(1).join(' ') }))
}

function git(kok, arg) {
  return spawnSync('git', ['-C', kok, ...arg], { encoding: 'utf8', timeout: 4000, windowsHide: true, maxBuffer: 8 * 1024 * 1024 })
}

/** Departmanın docs/audits dosya alanındaki gerçek dosyalar (harita desenleri: docs/audits/<önek>*). */
function departmanBelgeleri(kok, desenler, ls = (k) => git(k, ['ls-tree', '-r', '--name-only', 'origin/master', 'docs/audits'])) {
  const oneklar = (desenler || []).filter((d) => !d.tam && d.onek.startsWith('docs/audits/')).map((d) => d.onek)
  if (!oneklar.length) return []
  const r = ls(kok)
  if (!r || r.status !== 0) return []
  return String(r.stdout || '')
    .split(/\r?\n/)
    .filter((f) => f && oneklar.some((o) => f.startsWith(o)))
}

module.exports = {
  adaylariBul,
  anahtarSozcukler,
  ortakSozcukler,
  oncekiSatiri,
  anilanlar,
  metinler,
  sonCommitler,
  departmanBelgeleri,
  SON_GUN,
}
