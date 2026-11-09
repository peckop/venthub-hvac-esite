#!/usr/bin/env node
'use strict'
/**
 * DEFTER ENVANTER ÖLÇÜMÜ — yeni-site-gecis "2 Envanter" bölümü (ARC-291 PR 2, OPS emri + Recep düzeltmesi 9 Kasım).
 *
 * NİÇİN: Envanter sayıları (UnoPIM fark, görsel/fiyat doluluğu, adres kapsama, dizin) elle yazılıyordu ve bayatlıyordu. Ama her sabah
 * KÖR ölçüm de yanlış: kaynak değişmediyse ölçmek boşa iş. Bu betik önce ucuz KAYNAK İZİNE bakar (dosya/tablo parmak izi); iz
 * değişmediyse ölçüm koşmaz, bölüm "kaynak değişmedi, son ölçüm X" der ve BAYAT SAYILMAZ (tazelik takvime değil kaynağa bağlıdır).
 *
 * KURALLAR (sahte tazelik yasağı):
 *  - İz ÜRETİLEMEDİYSE durum `olculemedi`: asla "değişmedi" sayılmaz; son sonuç tarihiyle gösterilir, ⚠ işaretlenir.
 *  - İz değişti ama yeni sonuç henüz yoksa `degisti-bekliyor` (ölçüm koşulmalı); eski sonuç taze gösterilmez.
 *  - Yalnız yeni ölçüm sonucu görüldüğünde iz kaydı ilerler. Tarih yalnızca iz değiştiği için ilerletilmez.
 *  - Yeni ölçüm yazılmaz: sonuç okuyucular mevcut betik/belgelerin SON çıktısını okur (UnoPIM'e dokunmaz; Docker yoksa iz `olculemedi`).
 *
 * KULLANIM: node scripts/hijyen/defter-envanter.cjs yeni-site-gecis [--yaz | --iz | --kontrol]
 *   (varsayılan: bloğu yazdırır) · --yaz: docs/defter/yeni-site-gecis.md "2 Envanter" altına işaretli blok · --iz: manifest `kaynakIzi`
 *   (stdout tek satır; çıkış 0 en az bir iz üretildi, 2 hiçbiri) · çıkış hep 0 dışında yalnız --iz için 2.
 * DURUM dosyası depo dışı: ~/.claude/mod-durum/defter-envanter.json (VENTHUB_DEFTER_ENVANTER_DURUM ile değişir).
 */
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const crypto = require('node:crypto')
const { spawnSync } = require('node:child_process')

const KOK = path.resolve(__dirname, '..', '..')
const DEFTER = 'docs/defter/yeni-site-gecis.md'
const BASLIK = /^##\s+2[\s.]/
const BLOK_RE = /<!-- DEFTER-OLCUM:envanter BASLA[^\n]*-->\n([\s\S]*?)\n<!-- DEFTER-OLCUM:envanter BITIS -->/

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex').slice(0, 12)
const gorselKok = () => process.env.KATALOG_GORUNTU_KOKU || path.join(os.homedir(), 'VentHub-Gorsel-Arsiv', '_liste')
const durumYolu = () => process.env.VENTHUB_DEFTER_ENVANTER_DURUM || path.join(os.homedir(), '.claude', 'mod-durum', 'defter-envanter.json')

function oku(yol) {
  try {
    return fs.readFileSync(yol, 'utf8')
  } catch {
    return null
  }
}

/** Design anlık görüntü dosyalarının birleşik izi (tasarim-unopim-fark.mjs'in okuduğu liste); biri eksikse null. */
function designIzi(kok = gorselKok()) {
  const d = [
    'ktl80-faz-b-2026-11-04/seri-metin-ozet.json',
    'ktl80-faz-b-2026-11-04/ad-tr.csv',
    'ktl80-faz-b-2026-11-04/eksik60.json',
    'ktl82-faz-c-2026-11-04/kuru-harita.json',
    'ktl82-faz-c-2026-11-04/aileler.json',
    'ops-foto-urun-listesi-2026-11-02.csv',
  ]
  try {
    return sha(d.map((f) => sha(fs.readFileSync(path.join(kok, f)))).join(','))
  } catch {
    return null
  }
}

/** UnoPIM ürün tablosunun son güncelleme damgası (yerel Docker, salt okuma); erişilemezse null. */
function unopimIzi() {
  try {
    const r = spawnSync(
      'docker',
      ['exec', 'pim-unopim-unopim-pgsql-1', 'psql', '-U', 'unopim', '-d', 'unopim', '-At', '-c', 'select max(updated_at)::text || \'|\' || count(*) from products'],
      { encoding: 'utf8', timeout: 15000, windowsHide: true },
    )
    const s = String(r.stdout || '').trim()
    return r.status === 0 && s ? sha(s) : null
  } catch {
    return null
  }
}

/** Eşleştirme taslağı (2 Kasım, 2402 satır, SEO-76; depo dışı). URUN bildirdi, 9 Kasım. */
const ADRES_VARSAYILAN = 'C:/tmp/vh-arsiv/geo-seo/seo76/yonlendirme-2026-11-02-tam.csv'

/** Adres eşleştirme taslağı dosya izi (depo dışı; VENTHUB_ADRES_ESLESTIRME ile değişir); dosya yoksa null (ölçülemedi). */
function adresIzi() {
  const y = process.env.VENTHUB_ADRES_ESLESTIRME || ADRES_VARSAYILAN
  if (!y) return null
  try {
    return sha(fs.readFileSync(y))
  } catch {
    return null
  }
}

/** Son fark raporu: { ozet, tarih } ya da null. */
function farkSonucu(kok = gorselKok()) {
  try {
    const d = path.join(kok, 'fark-raporu')
    const son = fs.readdirSync(d).filter((f) => /^fark-.*\.json$/.test(f)).sort().pop()
    if (!son) return null
    const j = JSON.parse(fs.readFileSync(path.join(d, son), 'utf8'))
    const toplam = Object.values(j.ozet || {}).reduce((t, x) => t + (Number(x && x.fark) || 0), 0)
    const t = j.ozet && j.ozet.teknik
    return {
      ozet: `${j.urun} üründe fark ${toplam}${t ? `; teknik değer: ${t.kontrol} kontrol, ${t.fark} fark` : ''}`,
      tarih: String(j.tarih || ''),
    }
  } catch {
    return null
  }
}

/** docs/olcum/pim-unopim.md: görsel ve fiyat doluluğu (metinden, tarihli); eşleşmezse null (uydurma yok). */
function pimSonucu(kok = KOK) {
  const m = oku(path.join(kok, 'docs', 'olcum', 'pim-unopim.md'))
  if (!m) return null
  // Sayılar bölümlerin KENDİ ölçüm tarihiyle okunur ("## Ölçüm YYYY-MM-DD"); "Son doğrulama" günü ölçüm tarihi değildir
  // (belge yalnız kayıttan doğrulanmış olabilir). Hiçbiri literal değil: metin değişirse eşleşme düşer, uydurma yok.
  const bolumler = m.split(/^## /m).map((b) => ({ gun: (/^Ölçüm (\d{4}-\d{2}-\d{2})/.exec(b) || [])[1], b })).filter((x) => x.gun)
  const bul = (re) => {
    for (const { gun, b } of bolumler) {
      const e = re.exec(b)
      if (e) return { e, gun }
    }
    return null
  }
  const gorsel = bul(/Ana görseli olan ürün (\d+)\/(\d+)/)
  const fiyat = bul(/EUR liste fiyatı[^:\n]*:\s*(\d+) ürün/)
  const csv = bul(/CSV'de tekil (\d+) SKU/)
  const kdv = bul(/vat_rate_percent` %(\d+),? (\d+)\/(\d+)/)
  if (!gorsel || !fiyat) return null
  const toplam = gorsel.e[2]
  const kisa = (g) => g.slice(5)
  const gunler = [gorsel.gun, fiyat.gun, kdv && kdv.gun].filter(Boolean).sort()
  return {
    ozet:
      `görsel ${gorsel.e[1]}/${toplam} (${kisa(gorsel.gun)}) · liste fiyatı ${fiyat.e[1]}/${toplam} yazıldı${csv ? `, kaynakta ${csv.e[1]}` : ''} (${kisa(fiyat.gun)})` +
      (kdv ? ` · KDV %${kdv.e[1]}: ${kdv.e[2]}/${kdv.e[3]} (${kisa(kdv.gun)})` : ''),
    tarih: gunler[gunler.length - 1],
  }
}

/** urun-adres defterindeki eşleştirme taslağı satırı (4 Kasım ölçümü); yoksa null. */
function adresSonucu(kok = KOK) {
  const m = oku(path.join(kok, 'docs', 'defter', 'urun-adres.md'))
  const s = m && /\|\s*Eşleştirme taslağı[^|]*\|([^|]+)\|/.exec(m)
  if (!s) return null
  const k = /kategori (\d+\/\d+), ürün (\d+\/\d+), marka (\d+\/\d+), bilgi merkezi yazısı (\d+\/\d+)/.exec(s[1])
  const n = /(\d+) satır/.exec(s[1])
  if (!k || !n) return null
  return { ozet: `taslak ${n[1]} satır; slug kapsamı kategori ${k[1]}, ürün ${k[2]}, marka ${k[3]}, bilgi merkezi ${k[4]}`, tarih: '2026-11-04' }
}

/** Dizin: günlük GSC kotası zaten ucuz kontrol; her koşuda arşivdeki son anlık görüntüyle karşılaştırır. */
function dizinSonucu(kok = KOK) {
  try {
    const r = spawnSync(process.execPath, [path.join(kok, 'scripts', 'seo', 'dizin-defter-kontrol.mjs')], { encoding: 'utf8', timeout: 30000, windowsHide: true, cwd: kok })
    const s = String(r.stdout || '').split('\n').find((x) => x.trim())
    // Çıkış 1 = sapma bulundu (ölçüm başarılı, sonuç "sapma"); başka çıkış ya da çıktı yok = ölçülemedi.
    if (!s || (r.status !== 0 && r.status !== 1)) return null
    return { ozet: (r.status === 1 ? 'SAPMA: ' : '') + s.trim().slice(0, 150), tarih: new Date().toISOString().slice(0, 10) }
  } catch {
    return null
  }
}

const KAYNAKLAR = [
  { ad: 'Design ↔ UnoPIM fark', iz: () => designIzi(), sonuc: () => farkSonucu(), komut: 'node scripts/icerik-hatti/tasarim-unopim-fark.mjs' },
  { ad: 'UnoPIM görsel / fiyat-KDV', iz: () => unopimIzi(), sonuc: () => pimSonucu(), komut: 'docs/olcum/pim-unopim.md (KATALOG ölçümü)' },
  { ad: 'Adres eşleştirme kapsama', iz: () => adresIzi(), sonuc: () => adresSonucu(), komut: 'docs/defter/urun-adres.md (SEO-76 ölçümü)' },
  { ad: 'Dizin', iz: null, sonuc: () => dizinSonucu(), komut: 'node scripts/seo/dizin-defter-kontrol.mjs' },
]

/**
 * Saf karar. durum: önceki kayıt ({iz, izZamani}) ya da undefined. Dönüş: { durum, ozet, tarih, yeniKayit }.
 * `simdi` ISO; test için verilir.
 */
function degerlendir(kaynak, onceki, simdi = new Date().toISOString()) {
  const iz = kaynak.iz ? kaynak.iz() : null
  const s = kaynak.sonuc()
  const gosterilen = s || { ozet: 'ölçülemedi (sonuç okunamadı)', tarih: '' }
  if (!kaynak.iz) {
    // İz kavramı yok (dizin: kota günlük); sonuç her koşuda okunur.
    return { durum: s ? 'olculdu' : 'olculemedi', ...gosterilen, yeniKayit: onceki }
  }
  if (iz === null) return { durum: 'olculemedi', ...gosterilen, yeniKayit: onceki }
  if (!onceki || !onceki.iz) return { durum: s ? 'olculdu' : 'olculemedi', ...gosterilen, yeniKayit: s ? { iz, izZamani: simdi } : onceki }
  if (onceki.iz === iz) return { durum: s ? 'degismedi' : 'olculemedi', ...gosterilen, yeniKayit: onceki }
  // İz değişti: yalnız DEĞİŞİMİN İLK GÖRÜLDÜĞÜ andan SONRA üretilmiş sonuç yeni ölçüm sayılır (denetçi E2: önceki ölçüm anı
  // değil, değişim anı referanstır). Değişim anı ilk görüldüğünde kaydedilir ve aynı iz sürdükçe sabit kalır.
  // Tam ISO tarih (fark raporu) kesin karşılaştırılır; yalnız gün olan (belge) için o günden SONRAKİ gün gerekir
  // (aynı günkü belge tarihi, ölçümün değişimden sonra yapıldığını kanıtlamaz: sahte tazelik olmasın).
  const degisim = onceki.gorulenIz === iz && onceki.degisimZamani ? onceki.degisimZamani : simdi
  const t = s && s.tarih ? String(s.tarih) : ''
  const yeni = t.length > 10 ? Date.parse(t) > Date.parse(degisim) : t !== '' && t > String(degisim).slice(0, 10)
  return yeni
    ? { durum: 'olculdu', ...gosterilen, yeniKayit: { iz, izZamani: simdi } }
    : { durum: 'degisti-bekliyor', ...gosterilen, yeniKayit: { ...onceki, gorulenIz: iz, degisimZamani: degisim } }
}

const ETIKET = {
  olculdu: 'ölçüldü',
  degismedi: 'kaynak değişmedi',
  'degisti-bekliyor': '⚠ kaynak DEĞİŞTİ, ölçüm bekliyor',
  olculemedi: '⚠ ölçülemedi (iz üretilemedi)',
}

function blok(satirlar, tarih) {
  const t = satirlar.map((x) => {
    const gun = x.tarih ? String(x.tarih).slice(0, 10) : '?'
    return `| ${x.ad} | ${x.ozet} | ${gun} | ${ETIKET[x.durum]}${x.durum === 'degismedi' ? ` — son ölçüm ${gun}` : ''} |`
  })
  return [
    `<!-- DEFTER-OLCUM:envanter BASLA — kaynak izi değişince ölçülür, değişmediyse bayat sayılmaz; node scripts/hijyen/defter-envanter.cjs yeni-site-gecis --yaz · Üretildi: ${tarih} -->`,
    '| Ölçüm | Son sonuç | Ölçüm tarihi | Kaynak izi |',
    '|---|---|---|---|',
    ...t,
    '<!-- DEFTER-OLCUM:envanter BITIS -->',
  ].join('\n')
}

/** Metne bloğu yazar (varsa yerinde, yoksa "## 2 …" başlığının altına); başlık yoksa null. CRLF korunur. */
function metniYaz(metin, yeni) {
  const eol = metin.includes('\r\n') ? '\r\n' : '\n'
  let c = metin.replace(/\r\n/g, '\n')
  if (BLOK_RE.test(c)) c = c.replace(BLOK_RE, () => yeni)
  else {
    const s = c.split('\n')
    const i = s.findIndex((x) => BASLIK.test(x))
    if (i === -1) return null
    s.splice(i + 1, 0, '', yeni)
    c = s.join('\n')
  }
  return c.replace(/\n/g, eol)
}

function durumOku(yol = durumYolu()) {
  try {
    return JSON.parse(fs.readFileSync(yol, 'utf8'))
  } catch {
    return {}
  }
}

function durumYaz(d, yol = durumYolu()) {
  try {
    fs.mkdirSync(path.dirname(yol), { recursive: true })
    fs.writeFileSync(yol, JSON.stringify(d, null, 2))
  } catch {
    // Durum yazılamadı: sonraki koşu yeniden ölçer (zararsız).
  }
}

function olc(kaynaklar = KAYNAKLAR, onceki = durumOku()) {
  const yeni = { ...onceki }
  const satirlar = kaynaklar.map((k) => {
    const r = degerlendir(k, onceki[k.ad])
    if (r.yeniKayit) yeni[k.ad] = r.yeniKayit
    return { ad: k.ad, ozet: r.ozet, tarih: r.tarih, durum: r.durum }
  })
  return { satirlar, yeni }
}

function main(argv) {
  const ad = argv.find((a) => !a.startsWith('--'))
  if (ad !== 'yeni-site-gecis') {
    process.stdout.write('Kullanım: defter-envanter.cjs yeni-site-gecis [--yaz|--iz]\n')
    return 0
  }
  if (argv.includes('--iz')) {
    const izler = KAYNAKLAR.filter((k) => k.iz).map((k) => `${k.ad}=${k.iz() || 'yok'}`)
    process.stdout.write(izler.join(';') + '\n')
    return izler.some((x) => !x.endsWith('=yok')) ? 0 : 2
  }
  const { satirlar, yeni } = olc()
  const bugun = new Date().toISOString().slice(0, 10)
  const b = blok(satirlar, bugun)
  if (!argv.includes('--yaz')) {
    process.stdout.write(b + '\n')
    return 0
  }
  const yol = path.join(KOK, DEFTER)
  const m = oku(yol)
  const yz = m === null ? null : metniYaz(m, b)
  if (yz === null) {
    process.stdout.write(`⚠DEFTER-ENVANTER: ${DEFTER} ya da "2 Envanter" başlığı bulunamadı; yazılmadı\n`)
    return 0
  }
  fs.writeFileSync(yol, yz)
  durumYaz(yeni)
  const sorunlu = satirlar.filter((x) => x.durum === 'degisti-bekliyor' || x.durum === 'olculemedi').length
  process.stdout.write(`DEFTER-ENVANTER: ${satirlar.length} ölçüm satırı yazıldı${sorunlu ? `, ${sorunlu} tanesi dikkat ister` : ''}\n`)
  return 0
}

module.exports = { degerlendir, blok, metniYaz, olc, designIzi, farkSonucu, pimSonucu, adresSonucu, KAYNAKLAR, ETIKET }
if (require.main === module) {
  try {
    process.exitCode = main(process.argv.slice(2))
  } catch (e) {
    process.stdout.write(`⚠DEFTER-ENVANTER: ${String((e && e.message) || e).slice(0, 160)}\n`)
  }
}
