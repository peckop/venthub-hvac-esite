#!/usr/bin/env node
'use strict'
/**
 * İŞ BAŞI "ÖNCEKİ ÇALIŞMA" TARAMASI (ARC-30 / OPS-30): "bu iş daha önce yapıldı mı" sorusu tek komutla, İLK SATIRDA.
 *
 * NİÇİN VAR (olay 2026-10-03): 09-23'te üretilen 442 model adres listesi (REC-300), 10-03'te iki pencerede sıfırdan
 * üretildi. Kart araması CSV'yi bulamıyordu (dosya kartın dışındaydı), ham `grep REC-300` commit'leri bulamıyordu
 * (kimlik `REC-300` / `rec300` / `REC 300` yazımlarında farklı), sage kör kaldı. Her kaynağın tek başına kör noktası var;
 * bu betik beşini PARALEL koşar ve sonucu tek satıra indirir.
 *
 * YENİ ARAMA MOTORU DEĞİLDİR: mevcut aramaları birleştirir.
 *   1. dosya  : `git ls-files` yol adı (docs/plans, docs/audits dahil tüm depo)
 *   2. git    : `git log --all` konu satırı (`--derin` ile silinmiş dosya yolları da; 3 sn, kancada YOK)
 *   3. kanban : `scripts/nlm/kanban_disa_aktar.py` alt süreci (başlık + etiket). İKİNCİ OKUYUCU YAZILMAZ
 *               (`pano-sayfasi.cjs` o yasağı koyar); description/notes aramasını HARİTA'dan ayrıca istenen `--tam` kapatacak.
 *   4. sage   : `hafiza-enjeksiyonu.cjs` yardımcıları (daemonCanliMi, gercekPortAc, searchSage). "Yok" KANITI DEĞİL, ipucu.
 *   5. linear : yalnız `LINEAR_API_KEY` varsa, 1,5 sn; donuk arşiv, ek ipucu (karar 219).
 *
 * İLK SATIR üç sonuçtan biridir ve BİRBİRİNE KARIŞMAZ:
 *   ÖNCEKİ ÇALIŞMA: BULUNDU n — <en iyi 2-3 bulgu>
 *   ÖNCEKİ ÇALIŞMA: YOK (k/5 yer arandı, ifade: ...)        ← yalnız ÇEKİRDEK üç kaynak (dosya, git, kanban) tamam ölçüldüyse
 *   ÖNCEKİ ÇALIŞMA: ÖLÇÜLEMEDİ (kaynak: sebep; ...)           ← çekirdekten biri ölçülemedi VE bulgu yok, ya da ifade çok kısa
 * Kaynak hatası FIRLATMAZ: "ölçülemedi (sebep)" döner. Sessizlik "yok" demek değildir.
 *
 * KİMLİK NORMALLEŞTİRME: `REC-300` = `rec300` = `rec 300` (tiresiz, küçük harf). `hafiza-enjeksiyonu.cjs/icerikTerimleri`
 * 4 karakterden kısa parçaları düşürür, yani `REC-300` ve `441` kaybolurdu; kimlik çıkarıcı bu kusuru kapatır. Önek
 * listesi ÖLÇÜLDÜ (Kanban numaraları: REC ARC HRT YTN URN ALT ADM KTL SEO EDG OPS VULN). "alt 2 adım" gibi sıradan
 * Türkçe cümle kimlik sayılmasın diye ayrımsız (her yazım) yalnız REC/VULN; diğerleri tire ile ya da BÜYÜK harfle.
 *
 * SAYAÇ (kullanıcıya özel, DEPO DIŞI, yalnız-ekleme): `~/.claude/ara-onceki-calisma.jsonl` (repo PUBLIC). Her tarama bir
 * satır. `--sayac` alt komutu o oturumda bulunan yollar ile oturumda yazılan dosyaların kesişimini `tekrar-uretim`
 * satırı olarak yazar (veri: `bash-write-audit` kancasının pano dizinindeki `.bash-audit-<sid8>.json`; okunamazsa
 * ölçülemedi, tahmin edilmez).
 *
 * KULLANIM: node scripts/arac/onceki-calisma.cjs "<emir metni>" [--haric ARC-30] [--derin] [--json] [--kanca] [--sid <id>]
 *           node scripts/arac/onceki-calisma.cjs --sayac [--sid <id>]
 * Cetvel: docs/standards/fleet-mechanism-standard.md §37.
 */
const { execFile } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { promisify } = require('node:util')

const hafiza = require('../hijyen/hafiza-enjeksiyonu.cjs')

const { katla, icerikTerimleri, ortakTerimSayisi, zamanAsimi, ZAMAN_ASIMI, daemonCanliMi, gercekPortAc } = hafiza
const execFileAsync = promisify(execFile)

const REPO = path.resolve(__dirname, '..', '..')

const CLI_BUTCE_MS = 6000
const KANCA_BUTCE_MS = 2500
const KANBAN_TAVAN_MS = 2000
const LINEAR_TAVAN_MS = 1500
const DERIN_TAVAN_MS = 3000
const SAGE_COCUK_TAVAN_MS = 8000
/** Çekirdek kaynaklar: bunlardan biri ölçülemediyse "YOK" denemez. sage ve linear ipucudur. */
const CEKIRDEK = ['dosya', 'git', 'kanban']
const KAYNAKLAR = ['dosya', 'git', 'kanban', 'sage', 'linear']
const EN_FAZLA_BULGU = 3
const TAMPON_BAYT = 64 * 1024 * 1024
const DEFTER_ADI = 'ara-onceki-calisma.jsonl'

// ───────────────────────── kimlik ve sorgu ─────────────────────────

const HARF_RAKAM_DISI = '(?<![\\p{L}\\p{N}])'
const RAKAM_SONRASI = '(?![\\p{L}\\p{N}])'
/** Her yazımda (rec300, REC-300, rec 300) kimlik sayılan önekler. */
const SERBEST_ONEKLER = ['REC', 'VULN']
/** Tire ile ya da BÜYÜK harfle kimlik sayılan önekler (Kanban numaralarında ölçüldü). */
const BILINEN_ONEKLER = ['ARC', 'HRT', 'YTN', 'URN', 'ALT', 'ADM', 'KTL', 'SEO', 'EDG', 'OPS']
/** BÜYÜK harfli `XXX-12` kalıbı olup kimlik OLMAYAN kısaltmalar (UTF-8, ISO-9001, SHA-256 ...). */
const KIMLIK_DEGIL = new Set(['UTF', 'ISO', 'SHA', 'RFC', 'TLS', 'SSL', 'MD', 'WCAG', 'HTTP', 'IPV', 'AES', 'RSA', 'ASCII', 'IEEE', 'DIN', 'EN', 'TS'])

const KIMLIK_SERBEST = new RegExp(`${HARF_RAKAM_DISI}(${SERBEST_ONEKLER.join('|')})[-\\s]?(\\d{1,5})${RAKAM_SONRASI}`, 'giu')
const KIMLIK_TIRELI = new RegExp(`${HARF_RAKAM_DISI}(${BILINEN_ONEKLER.join('|')})-(\\d{1,5})${RAKAM_SONRASI}`, 'giu')
const KIMLIK_BUYUK = new RegExp(`${HARF_RAKAM_DISI}([A-Z]{2,5})-?(\\d{1,5})${RAKAM_SONRASI}`, 'gu')

/** Metindeki kimlikler, tiresiz küçük harf: REC-300 = rec300 = "rec 300". Tekrarsız, ilk görülme sırasıyla. */
function kimlikleriCikar(metin) {
  const bulunan = new Set()
  const ekle = (onek, sayi) => bulunan.add(onek.toLowerCase() + String(Number(sayi)))
  const m = String(metin || '')
  for (const x of m.matchAll(KIMLIK_SERBEST)) ekle(x[1], x[2])
  for (const x of m.matchAll(KIMLIK_TIRELI)) ekle(x[1], x[2])
  for (const x of m.matchAll(KIMLIK_BUYUK)) {
    if (!KIMLIK_DEGIL.has(x[1])) ekle(x[1], x[2])
  }
  return [...bulunan]
}

/** Katlanmış belirteçler (≥3 karakter, tekrarsız): yol, konu satırı, kart başlığı için. */
function belirteclereAyir(metin) {
  return [...new Set(katla(metin).split(/[^\p{L}\p{N}]+/u).filter((t) => t.length >= 3))]
}

/** Sorgu terimi bir belirteçle eşleşir mi? 6 karakterlik önek: "adres" ↔ "adresleri", "listesi" ↔ "listesi". */
function terimUyar(terim, belirtec) {
  const onek = terim.slice(0, Math.min(6, terim.length))
  return belirtec.startsWith(onek) || (belirtec.length >= 4 && terim.startsWith(belirtec))
}

/**
 * Emir metninden arama sorgusu. `haric` kimlikleri (kendi kartın) sorgudan ÇIKARILIR: kendi kartın başlığı her yerde
 * geçer ve her şeyi "bulunmuş" gösterirdi.
 * @returns {{ifade:string, ids:string[], terimler:{ham:string,kat:string}[], esik:number, yeterli:boolean, haric:string[]}}
 */
function sorguKur(metin, haric = []) {
  const haricKimlik = new Set(haric.flatMap((h) => kimlikleriCikar(h)))
  const ids = kimlikleriCikar(metin).filter((i) => !haricKimlik.has(i))
  const kimlikler = new Set([...ids, ...haricKimlik])
  const terimler = icerikTerimleri(metin).filter((t) => !kimlikler.has(t.kat) && !/^\d+$/.test(t.kat))
  return {
    ifade: [...ids, ...terimler.map((t) => t.kat)].join(' '),
    ids,
    terimler,
    esik: Math.min(3, terimler.length),
    // Ayırt edici dayanak yoksa "yok" demek yalan olur: tek sıradan sözcük her yerde çıkar ya da hiçbir yerde.
    yeterli: ids.length > 0 || terimler.length >= 2,
    haric: [...haricKimlik],
  }
}

/**
 * Bir metin (yol, konu, başlık) sorguya uyuyor mu? Kural: kimlik eşleşmesi VAR ve (terim yok ya da ≥1 terim) ya da
 * ≥ esik terim (en çok 3). Yaygın sözcük ("model", "adres") TEK BAŞINA bulgu sayılmaz.
 * @returns {null | {skor:number, ids:string[], terimler:string[]}}
 */
function eslestir(sorgu, metin) {
  const metinKimlik = new Set(kimlikleriCikar(metin))
  if ([...sorgu.haric].some((h) => metinKimlik.has(h))) return null // kendi kartı ile ilgili satır
  const idUyan = sorgu.ids.filter((i) => metinKimlik.has(i))
  const belirtecler = belirteclereAyir(metin)
  const terimUyan = sorgu.terimler.filter((t) => belirtecler.some((b) => terimUyar(t.kat, b))).map((t) => t.kat)
  const kimlikluBulgu = idUyan.length > 0 && (sorgu.terimler.length === 0 || terimUyan.length >= 1)
  const terimliBulgu = sorgu.esik > 0 && terimUyan.length >= sorgu.esik
  if (!kimlikluBulgu && !terimliBulgu) return null
  return { skor: idUyan.length + terimUyan.length, ids: idUyan, terimler: terimUyan }
}

/** Skor azalan, eşitse `ikinci` (tarih/yol) azalan: yeni olan öne. */
function sirala(bulgular, ikinci) {
  return [...bulgular].sort((a, b) => b.skor - a.skor || String(ikinci(b)).localeCompare(String(ikinci(a))))
}

// ───────────────────────── kaynaklar ─────────────────────────

const tamam = (arandi, bulgular, ek = {}) => ({ durum: 'tamam', arandi, bulgular, ...ek })
const olculemedi = (sebep) => ({ durum: 'olculemedi', arandi: 0, bulgular: [], sebep })
const atlandi = (sebep) => ({ durum: 'atlandi', arandi: 0, bulgular: [], sebep })

async function dosyaKaynagi(sorgu, baglar, ms) {
  const dosyalar = await baglar.dosyalar(ms)
  const bulgular = []
  for (const yol of dosyalar) {
    const e = eslestir(sorgu, yol)
    if (e) bulgular.push({ tur: 'dosya', yol, ...e })
  }
  return tamam(dosyalar.length, sirala(bulgular, (b) => b.yol))
}

async function gitKaynagi(sorgu, baglar, ms, derin) {
  const commitler = await baglar.gitLog(ms)
  const bulgular = []
  for (const c of commitler) {
    const e = eslestir(sorgu, c.konu)
    if (e) bulgular.push({ tur: 'commit', hash: c.hash, tarih: c.tarih, konu: c.konu, ...e })
  }
  const sonuc = tamam(commitler.length, sirala(bulgular, (b) => b.tarih))
  if (derin) {
    const silinenler = await baglar.silinmisYollar(Math.min(ms, DERIN_TAVAN_MS))
    const silinmis = []
    for (const s of silinenler) {
      const e = eslestir(sorgu, s.yol)
      if (e) silinmis.push({ tur: 'silinmis-dosya', yol: s.yol, hash: s.hash, tarih: s.tarih, ...e })
    }
    sonuc.bulgular = [...sonuc.bulgular, ...sirala(silinmis, (b) => b.tarih)]
    sonuc.arandi += silinenler.length
  }
  return sonuc
}

async function kanbanKaynagi(sorgu, baglar, ms) {
  const kayitlar = await baglar.kanban(ms)
  const bulgular = []
  for (const k of kayitlar) {
    const metin = `${k.identifier || ''} ${k.title || ''} ${(k.labels || []).join(' ')}`
    const e = eslestir(sorgu, metin)
    if (e) bulgular.push({ tur: 'kart', kimlik: k.identifier, durum: k.status, serit: k.serit, baslik: k.title, ...e })
  }
  return tamam(kayitlar.length, sirala(bulgular, (b) => b.kimlik))
}

async function sageKaynagi(sorgu, baglar, ms) {
  if (!baglar.daemonCanli()) return olculemedi('sage daemon kapalı')
  const port = await baglar.portAc()
  if (!port) return olculemedi('sage portu açılamadı')
  const arama = [...sorgu.ids, ...sorgu.terimler.map((t) => t.ham)].join(' ')
  const sonuc = await port.searchSage(arama, { limit: 10 })
  const liste = Array.isArray(sonuc) ? sonuc : []
  const olcu = [...sorgu.ids.map((i) => ({ kat: i })), ...sorgu.terimler]
  const esik = Math.min(3, olcu.length)
  const bulgular = []
  for (const m of liste) {
    if (!m || typeof m.text !== 'string') continue
    const ortak = ortakTerimSayisi(olcu, m.text)
    if (ortak >= esik && esik > 0) bulgular.push({ tur: 'sage', id: String(m.id || ''), metin: m.text.replace(/\s+/g, ' ').trim().slice(0, 160), skor: ortak })
  }
  // sage "yok" kanıtı değildir; kancada derse ders yapısı dosya göstermediği için kör kalabilir (ipucu).
  return tamam(liste.length, sirala(bulgular, (b) => b.id), { ipucu: true })
}

async function linearKaynagi(sorgu, baglar, ms) {
  if (!baglar.linearAnahtar) return atlandi('LINEAR_API_KEY yok')
  const arama = [...sorgu.ids, ...sorgu.terimler.map((t) => t.ham)].join(' ')
  const kayitlar = await baglar.linearGetir(arama, ms)
  const bulgular = []
  for (const k of kayitlar) {
    const e = eslestir(sorgu, `${k.identifier || ''} ${k.title || ''}`)
    if (e) bulgular.push({ tur: 'linear', kimlik: k.identifier, baslik: k.title, durum: k.durum, ...e })
  }
  return tamam(kayitlar.length, sirala(bulgular, (b) => b.kimlik), { ipucu: true })
}

function sebepMetni(hata) {
  if (!hata) return 'bilinmeyen hata'
  if (hata.killed || hata.signal === 'SIGTERM') return 'süre aşıldı'
  if (hata.code === 'ENOENT') return 'komut bulunamadı'
  const ilk = String(hata.message || hata).split('\n')[0].trim()
  return ilk.slice(0, 120) || 'bilinmeyen hata'
}

/** Bir kaynağı koşar: hata ve süre aşımı FIRLATMAZ, `olculemedi` döner. */
async function kaynakKos(fn, tavanMs) {
  try {
    const sonuc = await zamanAsimi(Promise.resolve().then(fn), tavanMs)
    if (sonuc === ZAMAN_ASIMI) return olculemedi(`süre aşıldı (${tavanMs} ms)`)
    return sonuc
  } catch (hata) {
    return olculemedi(sebepMetni(hata))
  }
}

// ───────────────────────── sonuç ve ilk satır ─────────────────────────

function bulguEtiketi(b) {
  switch (b.tur) {
    case 'dosya':
      return `dosya ${b.yol}`
    case 'commit':
      return `commit ${b.hash} (${b.tarih})`
    case 'silinmis-dosya':
      return `silinmiş dosya ${b.yol} (commit ${b.hash})`
    case 'kart':
      return `kart ${b.kimlik} [${b.durum}]`
    case 'sage':
      return `sage ${b.id}`
    case 'linear':
      return `Linear ${b.kimlik}`
    default:
      return b.tur
  }
}

/** Kaynak başına en iyi bulgu, kaynak sırasıyla, en çok 3. */
function enIyiBulgular(kaynaklar) {
  const secilen = []
  for (const ad of KAYNAKLAR) {
    const ilk = kaynaklar[ad].bulgular[0]
    if (ilk && secilen.length < EN_FAZLA_BULGU) secilen.push(ilk)
  }
  return secilen
}

function sonucuHesapla(sorgu, kaynaklar) {
  const toplam = KAYNAKLAR.reduce((n, ad) => n + kaynaklar[ad].bulgular.length, 0)
  const sebepler = KAYNAKLAR.filter((ad) => kaynaklar[ad].durum === 'olculemedi').map((ad) => `${ad}: ${kaynaklar[ad].sebep}`)
  const arananlar = KAYNAKLAR.filter((ad) => kaynaklar[ad].durum === 'tamam').length
  if (!sorgu.yeterli) {
    return { sonuc: 'olculemedi', toplam, arananlar, sebepler: ['ifade: aranacak ayırt edici kimlik ya da terim yok (en az bir kimlik ya da iki terim)'] }
  }
  if (toplam > 0) return { sonuc: 'bulgu-var', toplam, arananlar, sebepler }
  const cekirdekEksik = CEKIRDEK.filter((ad) => kaynaklar[ad].durum !== 'tamam')
  if (cekirdekEksik.length) return { sonuc: 'olculemedi', toplam, arananlar, sebepler: sebepler.length ? sebepler : cekirdekEksik.map((ad) => `${ad}: ${kaynaklar[ad].sebep || 'atlandı'}`) }
  return { sonuc: 'bulgu-yok', toplam, arananlar, sebepler }
}

function ilkSatir(sorgu, kaynaklar, hesap) {
  const onek = 'ÖNCEKİ ÇALIŞMA: '
  if (hesap.sonuc === 'bulgu-var') {
    return `${onek}BULUNDU ${hesap.toplam} — ${enIyiBulgular(kaynaklar).map(bulguEtiketi).join('; ')}`
  }
  if (hesap.sonuc === 'bulgu-yok') {
    const eksik = KAYNAKLAR.filter((ad) => kaynaklar[ad].durum !== 'tamam').map((ad) => `${ad}: ${kaynaklar[ad].sebep}`)
    const ek = eksik.length ? `; bakılamayan ipucu kaynakları: ${eksik.join(', ')}` : ''
    return `${onek}YOK (${hesap.arananlar}/${KAYNAKLAR.length} yer arandı, ifade: ${sorgu.ifade}${ek})`
  }
  return `${onek}ÖLÇÜLEMEDİ (${hesap.sebepler.join('; ')})`
}

function ayrintiSatiri(ad, k) {
  const bas = `  ${ad.padEnd(6)}: `
  if (k.durum === 'atlandi') return `${bas}atlandı (${k.sebep})`
  if (k.durum === 'olculemedi') return `${bas}ÖLÇÜLEMEDİ (${k.sebep})`
  const ozet = k.bulgular.slice(0, EN_FAZLA_BULGU).map((b) => {
    if (b.tur === 'commit') return `${b.hash} ${b.tarih} "${b.konu.slice(0, 90)}"`
    if (b.tur === 'kart') return `${b.kimlik} [${b.durum}] ${b.serit || ''} "${String(b.baslik).slice(0, 80)}"`
    if (b.tur === 'sage') return `${b.id} "${b.metin.slice(0, 80)}"`
    if (b.tur === 'linear') return `${b.kimlik} "${String(b.baslik).slice(0, 80)}"`
    return b.yol
  })
  const ipucu = k.ipucu ? ' (ipucu; "yok" kanıtı sayılmaz)' : ''
  const sayi = k.bulgular.length ? `${k.bulgular.length} eşleşme` : 'eşleşme yok'
  return `${bas}${sayi} / ${k.arandi} bakıldı${ipucu}${ozet.length ? ' — ' + ozet.join(' · ') : ''}`
}

function metinCikti(sonuc) {
  const satirlar = [sonuc.ilk]
  for (const ad of KAYNAKLAR) satirlar.push(ayrintiSatiri(ad, sonuc.kaynaklar[ad]))
  if (sonuc.sonuc === 'bulgu-var') {
    satirlar.push('  ⚠ Bulgu varken sıfırdan üretme: önce yukarıdakileri aç, işin devamı mı tekrarı mı karar ver.')
  }
  satirlar.push(`  süre: ${sonuc.sure_ms} ms`)
  return satirlar.join('\n')
}

/**
 * Beş kaynağı paralel tarar. Kaynaklar `baglar` ile ENJEKTE edilir (test sahte verir; CLI `gercekBaglar`).
 * @param {string} metin emir metni
 * @param {object} secenek
 * @param {object} secenek.baglar
 * @param {string[]} [secenek.haric]
 * @param {boolean} [secenek.derin]
 * @param {number} [secenek.butceMs]
 * @param {() => number} [secenek.simdi]
 */
async function tara(metin, { baglar, haric = [], derin = false, butceMs = CLI_BUTCE_MS, simdi = Date.now }) {
  const t0 = simdi()
  const sorgu = sorguKur(metin, haric)
  const tavan = (ms) => Math.max(1, Math.min(ms, butceMs))
  let kaynaklar
  if (!sorgu.yeterli) {
    const bos = olculemedi('ifade çok kısa')
    kaynaklar = Object.fromEntries(KAYNAKLAR.map((ad) => [ad, bos]))
  } else {
    // Hepsi aynı anda başlar. Sage'in senkron `require` yükü ana süreci dondurmasın diye gerçek bağ onu AYRI SÜREÇTE
    // koşar (bkz. gercekBaglar/portAc); enjekte edilen sahte bağlarda bu bir fark yaratmaz.
    const dosyaVaadi = kaynakKos(() => dosyaKaynagi(sorgu, baglar, tavan(butceMs)), tavan(butceMs))
    const gitVaadi = kaynakKos(() => gitKaynagi(sorgu, baglar, tavan(butceMs), derin), tavan(butceMs))
    const kanbanVaadi = kaynakKos(() => kanbanKaynagi(sorgu, baglar, tavan(KANBAN_TAVAN_MS)), tavan(KANBAN_TAVAN_MS))
    const linearVaadi = kaynakKos(() => linearKaynagi(sorgu, baglar, tavan(LINEAR_TAVAN_MS)), tavan(LINEAR_TAVAN_MS))
    const sageVaadi = kaynakKos(() => sageKaynagi(sorgu, baglar, tavan(butceMs)), tavan(butceMs))
    const [dosya, git, kanban, linear, sage] = await Promise.all([dosyaVaadi, gitVaadi, kanbanVaadi, linearVaadi, sageVaadi])
    kaynaklar = { dosya, git, kanban, sage, linear }
  }
  const hesap = sonucuHesapla(sorgu, kaynaklar)
  const sonuc = {
    sonuc: hesap.sonuc,
    ilk: ilkSatir(sorgu, kaynaklar, hesap),
    sorgu: { ifade: sorgu.ifade, ids: sorgu.ids, terimler: sorgu.terimler.map((t) => t.kat), haric: sorgu.haric },
    kaynaklar,
    toplam: hesap.toplam,
    sure_ms: simdi() - t0,
  }
  return sonuc
}

// ───────────────────────── gerçek bağlar ─────────────────────────

function gitCiktisi(ms, args, repo) {
  return execFileAsync('git', args, { cwd: repo, timeout: ms, maxBuffer: TAMPON_BAYT, windowsHide: true, encoding: 'utf8' }).then((r) => r.stdout)
}

const PYTHON_ADAYLARI = ['python', 'python3', 'py']

async function pythonKos(betik, ms) {
  let sonHata
  for (const py of PYTHON_ADAYLARI) {
    try {
      const r = await execFileAsync(py, [betik], { timeout: ms, maxBuffer: TAMPON_BAYT, windowsHide: true, encoding: 'utf8' })
      return r.stdout
    } catch (hata) {
      if (hata && hata.code === 'ENOENT') {
        sonHata = hata
        continue
      }
      throw hata
    }
  }
  throw sonHata || new Error('python bulunamadı')
}

function gercekBaglar({ repo = REPO, ortam = process.env } = {}) {
  const anaKok = () => require('../hijyen/ana-kok.cjs').anaKok()
  const cocuklar = []
  return {
    dosyalar: async (ms) => (await gitCiktisi(ms, ['ls-files', '-z'], repo)).split('\0').filter(Boolean),
    gitLog: async (ms) => {
      const cikti = await gitCiktisi(ms, ['log', '--all', '--format=%h%x09%ad%x09%s', '--date=short'], repo)
      return cikti
        .split('\n')
        .filter(Boolean)
        .map((s) => {
          const [hash, tarih, ...konu] = s.split('\t')
          return { hash, tarih, konu: konu.join('\t') }
        })
    },
    silinmisYollar: async (ms) => {
      const cikti = await gitCiktisi(ms, ['log', '--all', '--diff-filter=D', '--name-only', '--format=%x01%h%x09%ad', '--date=short'], repo)
      const sonuc = []
      let hash = ''
      let tarih = ''
      for (const s of cikti.split('\n')) {
        if (s.startsWith('\u0001')) {
          ;[hash, tarih] = s.slice(1).split('\t')
        } else if (s.trim()) {
          sonuc.push({ yol: s.trim(), hash, tarih })
        }
      }
      return sonuc
    },
    kanban: async (ms) => {
      const cikti = await pythonKos(path.join(repo, 'scripts', 'nlm', 'kanban_disa_aktar.py'), ms)
      const j = JSON.parse(cikti)
      if (!j || !Array.isArray(j.kayitlar)) throw new Error('kanban dışa aktarımı beklenen biçimde değil')
      return j.kayitlar
    },
    daemonCanli: () => daemonCanliMi(anaKok()),
    // ⚠sage paketi `require` ile SENKRON yüklenir (soğukta ~3 sn ölçüldü) ve bu sırada olay döngüsü durur: Kanban ve Linear
    // yanıtları gelmiş olsa bile zamanlayıcıları ÖNCE tetiklenir ("süre aşıldı", ilk gerçek koşumda ikisi de kaybedildi).
    // Bu yüzden sage AYRI SÜREÇTE aranır; ana süreçte hiçbir şey donmaz.
    portAc: async () => ({
      searchSage: async (arama) => {
        const vaat = execFileAsync(process.execPath, [__filename, '--sage-cocuk', arama], {
          timeout: SAGE_COCUK_TAVAN_MS,
          maxBuffer: TAMPON_BAYT,
          windowsHide: true,
          encoding: 'utf8',
        })
        cocuklar.push(vaat.child)
        return JSON.parse((await vaat).stdout)
      },
    }),
    kapat: () => {
      for (const c of cocuklar.splice(0)) {
        try {
          c.kill()
        } catch {
          /* çocuk zaten bitti */
        }
      }
    },
    linearAnahtar: ortam.LINEAR_API_KEY || '',
    linearGetir: async (terim, ms) => {
      const cevap = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: ortam.LINEAR_API_KEY },
        body: JSON.stringify({
          query: 'query($t:String!){searchIssues(term:$t,first:10){nodes{identifier title state{name}}}}',
          variables: { t: terim },
        }),
        signal: AbortSignal.timeout(ms),
      })
      if (!cevap.ok) throw new Error(`Linear HTTP ${cevap.status}`)
      const g = await cevap.json()
      if (g.errors || !g.data || !g.data.searchIssues) throw new Error('Linear sorgu hatası')
      return g.data.searchIssues.nodes.map((n) => ({ identifier: n.identifier, title: n.title, durum: n.state && n.state.name }))
    },
  }
}

// ───────────────────────── sayaç (depo DIŞI) ─────────────────────────

function varsayilanDefter() {
  return path.join(os.homedir(), '.claude', DEFTER_ADI)
}
function defterYolu(ortam = process.env) {
  return ortam.VENTHUB_ONCEKI_CALISMA_DEFTER || varsayilanDefter()
}
function testOrtamiMi(ortam = process.env) {
  return Boolean(ortam.VITEST || ortam.JEST_WORKER_ID || ortam.NODE_ENV === 'test')
}

function icindeMi(yol, kok) {
  const goreli = path.relative(path.resolve(kok).toLowerCase(), path.resolve(yol).toLowerCase())
  return goreli === '' || (!goreli.startsWith('..') && !path.isAbsolute(goreli))
}

/** Depo kökleri: bu ağaç + ana ağaç. Sayaç bunların İÇİNE yazılamaz (repo PUBLIC). */
function depoKokleri(repo = REPO) {
  const kokler = [repo]
  try {
    kokler.push(require('../hijyen/ana-kok.cjs').anaKok())
  } catch {
    /* ana kök çözülemezse yalnız bu ağaç korunur */
  }
  return kokler.filter(Boolean)
}

/**
 * Sayaç satırını ekler. Depo içi yola YAZMAYI REDDEDER; test ortamında açıkça verilmiş yol dışına yazmaz.
 * FIRLATMAZ: sayaç bir ölçüm yüzeyidir, taramayı bozmamalı.
 * @returns {{yazildi:boolean, yol?:string, sebep?:string}}
 */
function defteriYaz(kayit, { yol = defterYolu(), ortam = process.env, kokler = depoKokleri() } = {}) {
  try {
    if (testOrtamiMi(ortam) && !ortam.VENTHUB_ONCEKI_CALISMA_DEFTER) return { yazildi: false, sebep: 'test ortamında varsayılan deftere yazılmaz' }
    if (kokler.some((k) => icindeMi(yol, k))) return { yazildi: false, sebep: 'sayaç yolu depo içinde (repo PUBLIC)' }
    fs.mkdirSync(path.dirname(yol), { recursive: true })
    fs.appendFileSync(yol, JSON.stringify(kayit) + '\n', 'utf8')
    return { yazildi: true, yol }
  } catch (hata) {
    return { yazildi: false, sebep: sebepMetni(hata) }
  }
}

/** Taramanın defter satırı. `bulunan` = tekrar-üretim ölçümü için güçlü bulguların yolları. */
function taramaKaydi(sonuc, { sid, kart, anahtar, simdi = Date.now }) {
  const sayi = (ad) => (sonuc.kaynaklar[ad].durum === 'tamam' ? sonuc.kaynaklar[ad].bulgular.length : sonuc.kaynaklar[ad].durum)
  const yollar = KAYNAKLAR.flatMap((ad) => sonuc.kaynaklar[ad].bulgular.filter((b) => b.yol).map((b) => b.yol))
  return {
    ts: new Date(simdi()).toISOString(),
    sid: sid || 'sidsiz',
    kart: kart || null,
    anahtar,
    kaynaklar: Object.fromEntries(KAYNAKLAR.map((ad) => [ad, sayi(ad)])),
    sonuc: sonuc.sonuc,
    sure_ms: sonuc.sure_ms,
    bulunan: [...new Set(yollar)].slice(0, 20),
  }
}

/**
 * Yol "gövde anahtarı": dizin, uzantı ve tarih damgası atılır. 09-23'te üretilen
 * `rec300-model-adres-listesi-2026-09-23.csv` ile 10-03'te yeniden üretilen `...-2026-10-03.csv` AYNI iş sayılır.
 */
function govdeAnahtari(yol) {
  const ad = path.posix.basename(String(yol).replace(/\\/g, '/'))
  return katla(ad.replace(/\.[^.]+$/, ''))
    .replace(/-?\d{4}-\d{2}-\d{2}/g, '')
    .replace(/-?\d{8}/g, '')
    .replace(/^-+|-+$/g, '')
}

function jsonlOku(yol) {
  return fs
    .readFileSync(yol, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((s) => {
      try {
        return JSON.parse(s)
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

function panoDizini(ortam = process.env) {
  return ortam.VENTHUB_BOARD_DIR || ortam.VENTHUB_PANO_DIR || 'C:/tmp/venthub-board'
}

/**
 * Tekrar-üretim ölçümü: bu oturumda taramada BULUNAN yollar ile oturumda YAZILAN dosyaların kesişimi.
 * Yazılan dosya verisi `bash-write-audit` kancasının `.bash-audit-<sid8>.json` dosyasındandır (`yollar` + `bildirilen`,
 * anahtar `ağaç::göreli-yol`). Dosya yoksa/bozuksa ÖLÇÜLEMEDİ yazılır; tahmin edilmez.
 * ⚠Sınır: `yollar` şu anki kirli (commit'lenmemiş) dosyalardır; commit'ten sonra düşer. Sayaç commit'ten ÖNCE koşmalı.
 * @returns {null | {kayit: object}} tarama kaydı hiç yoksa null (ölçülecek bir şey yok)
 */
function tekrarUretimOlc({ sid, defter, pano, simdi = Date.now }) {
  let satirlar
  try {
    satirlar = jsonlOku(defter)
  } catch {
    return { kayit: { ts: new Date(simdi()).toISOString(), sid, tip: 'tekrar-uretim', sonuc: 'olculemedi', sebep: 'sayaç defteri okunamadı' } }
  }
  const bulunan = [...new Set(satirlar.filter((s) => s.sid === sid && !s.tip).flatMap((s) => s.bulunan || []))]
  if (!bulunan.length) return null
  const temel = { ts: new Date(simdi()).toISOString(), sid, tip: 'tekrar-uretim' }
  let yazilanlar
  try {
    const j = JSON.parse(fs.readFileSync(path.join(pano, `.bash-audit-${String(sid).slice(0, 8)}.json`), 'utf8'))
    yazilanlar = [...(j.yollar || []), ...(j.bildirilen || [])].map((a) => String(a).split('::').pop())
  } catch {
    return { kayit: { ...temel, sonuc: 'olculemedi', sebep: 'bash-write-audit verisi okunamadı' } }
  }
  const yazilanAnahtar = new Map(yazilanlar.map((y) => [govdeAnahtari(y), y]))
  const kesisim = bulunan.filter((b) => yazilanAnahtar.has(govdeAnahtari(b))).map((b) => ({ bulunan: b, yazilan: yazilanAnahtar.get(govdeAnahtari(b)) }))
  return { kayit: { ...temel, sonuc: kesisim.length ? 'tekrar-var' : 'yok', kesisim } }
}

// ───────────────────────── CLI ─────────────────────────

function argumanlariAyir(argv) {
  const s = { metin: [], haric: [], derin: false, json: false, kanca: false, sayac: false, sid: '', sageCocuk: null }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--haric') s.haric.push(argv[++i] || '')
    else if (a.startsWith('--haric=')) s.haric.push(a.slice(8))
    else if (a === '--sid') s.sid = argv[++i] || ''
    else if (a.startsWith('--sid=')) s.sid = a.slice(6)
    else if (a === '--derin') s.derin = true
    else if (a === '--json') s.json = true
    else if (a === '--kanca') s.kanca = true
    else if (a === '--sayac') s.sayac = true
    else if (a === '--sage-cocuk') s.sageCocuk = argv[++i] || ''
    else s.metin.push(a)
  }
  s.metin = s.metin.join(' ').trim()
  return s
}

/**
 * @returns {Promise<{kod:number, cikti:string}>}
 */
async function calistir(argv, { baglar = gercekBaglar(), ortam = process.env, simdi = Date.now } = {}) {
  try {
    return await calistirIc(argv, { baglar, ortam, simdi })
  } finally {
    if (typeof baglar.kapat === 'function') baglar.kapat() // sage çocuk süreci takılı kaldıysa öldür
  }
}

/** Sage çocuk süreci (iç kullanım): ana süreci dondurmadan sage'i arar, sonucu JSON olarak basar. Çıkış 3 = port açılamadı. */
async function sageCocukKos(arama) {
  const port = await gercekPortAc(require('../hijyen/ana-kok.cjs').anaKok())
  if (!port) return { kod: 3, cikti: 'sage portu açılamadı' }
  const sonuc = await port.searchSage(arama, { limit: 10 })
  return { kod: 0, cikti: JSON.stringify(Array.isArray(sonuc) ? sonuc.map((m) => ({ id: m.id, text: m.text })) : []) }
}

async function calistirIc(argv, { baglar, ortam, simdi }) {
  const arg = argumanlariAyir(argv)
  if (arg.sageCocuk !== null) return sageCocukKos(arg.sageCocuk)
  const sid = arg.sid || ortam.CLAUDE_CODE_SESSION_ID || 'sidsiz'
  if (arg.sayac) {
    const olcum = tekrarUretimOlc({ sid, defter: defterYolu(ortam), pano: panoDizini(ortam), simdi })
    if (!olcum) return { kod: 0, cikti: 'TEKRAR ÜRETİM: bu oturumda bulgulu tarama kaydı yok, ölçülecek bir şey yok' }
    const yazim = defteriYaz(olcum.kayit, { yol: defterYolu(ortam), ortam })
    const k = olcum.kayit
    const ozet =
      k.sonuc === 'olculemedi'
        ? `TEKRAR ÜRETİM: ÖLÇÜLEMEDİ (${k.sebep})`
        : k.sonuc === 'tekrar-var'
          ? `TEKRAR ÜRETİM: VAR ${k.kesisim.length} — ${k.kesisim.map((x) => `${x.bulunan} ↔ ${x.yazilan}`).join('; ')}`
          : 'TEKRAR ÜRETİM: YOK (bulunan yollarla oturumda yazılan dosya adları kesişmedi)'
    return { kod: 0, cikti: ozet + (yazim.yazildi ? '' : `\n  sayaç yazılmadı: ${yazim.sebep}`) }
  }
  if (!arg.metin) {
    return { kod: 2, cikti: 'kullanım: node scripts/arac/onceki-calisma.cjs "<emir metni>" [--haric ARC-30] [--derin] [--json] [--kanca] [--sid <id>]\n       node scripts/arac/onceki-calisma.cjs --sayac [--sid <id>]' }
  }
  const sonuc = await tara(arg.metin, {
    baglar,
    haric: arg.haric,
    derin: arg.derin && !arg.kanca, // 3 sn'lik silinmiş-dosya taraması kancada YOK
    butceMs: arg.kanca ? KANCA_BUTCE_MS : CLI_BUTCE_MS,
    simdi,
  })
  const yazim = defteriYaz(taramaKaydi(sonuc, { sid, kart: arg.haric[0], anahtar: sonuc.sorgu.ifade, simdi }), { yol: defterYolu(ortam), ortam })
  const cikti = arg.json ? JSON.stringify({ ...sonuc, sayac: yazim }) : metinCikti(sonuc) + (yazim.yazildi ? '' : `\n  sayaç yazılmadı: ${yazim.sebep}`)
  return { kod: 0, cikti }
}

module.exports = {
  CLI_BUTCE_MS,
  KANCA_BUTCE_MS,
  CEKIRDEK,
  KAYNAKLAR,
  kimlikleriCikar,
  sorguKur,
  eslestir,
  tara,
  ilkSatir,
  metinCikti,
  gercekBaglar,
  defterYolu,
  defteriYaz,
  taramaKaydi,
  govdeAnahtari,
  tekrarUretimOlc,
  argumanlariAyir,
  calistir,
}

if (require.main === module) {
  calistir(process.argv.slice(2)).then(
    ({ kod, cikti }) => {
      // sage portu açık kalabilir, bu yüzden açıkça çıkılır; Windows'ta boru yazımı eşzamansız, yazım bitince çık.
      process.stdout.write(cikti + '\n', () => process.exit(kod))
    },
    (hata) => {
      process.stderr.write(`onceki-calisma: beklenmeyen hata: ${sebepMetni(hata)}\n`)
      process.exit(2)
    },
  )
}
