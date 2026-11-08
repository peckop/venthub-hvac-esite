#!/usr/bin/env node
/**
 * MEVZUAT KANIT EKLE — ham-cekim.cjs çıktısını (kaynak girdisi) kalemin kanıt dosyasına ekler ve
 * kayıt kalemindeki türetilmiş alanları günceller; CRLF satır sonunu korur.
 *
 * NİÇİN VAR (OPS-256, MVZ-10, 2026-11-08, ölçüldü): "oku/yaz (CRLF koruyan) + kaynak girdisi ekle +
 * son_kontrol/resmi_kaynak_sayisi güncelle" kabuğu MEVZUAT penceresinde 9 kez yeniden yazıldı.
 *
 * NE YAPAR (her iş için):
 *   1. kalemi bulur (yoksa HATA), kanıt dosyasını açar (yoksa `kanitOlustur: true` ile iskelet kurar)
 *   2. kaynak girdisini ekler; AYNI adres + AYNI ham sha + AYNI tarih zaten varsa eklemez (idempotent)
 *   3. alinti_dogrulandi true değilse REDDEDER (M3: alıntı birebir olmadan kanıt sayılmaz);
 *      `izinDogrulanmamis: true` ile istisna, bu durum çıktıda "UYARI" olarak basılır
 *   4. resmi_kaynak_sayisi = kanıt dosyasındaki resmi:true kaynak sayısı
 *   5. son_kontrol = bugun (iş `son_kontrol: false` demedikçe), kayit.guncellendi = bugun
 *   6. iş içindeki iliski_notlari / acik_sorular dizilerini ekler (aynı metin iki kez eklenmez),
 *      `tarihler` nesnesini sığ birleştirir, `durum` verilirse yazar
 *
 * KULLANIM:
 *   node scripts/mevzuat/kanit-ekle.cjs <girdi.json> [--kuru] [--kok=<depo-kökü>]
 *
 * GİRDİ:
 *   { "bugun": "2026-11-08",
 *     "isler": [ { "kimlik": "AB-2025/2481",
 *                  "kaynak": { ...ham-cekim.cjs --kaynak çıktısı... },   // ya da "kaynakDosya": "yol.json"
 *                  "kanitOlustur": false, "son_kontrol": true, "izinDogrulanmamis": false,
 *                  "iliski_notlari": ["..."], "acik_sorular": ["..."], "tarihler": {"yayim": "..."}, "durum": "yururlukte" } ] }
 *
 * İTME YOK. Yazdığı dosyalar yalnız docs/mevzuat/kayit.json ve kalemin kanıt dosyası.
 */
const fs = require('fs')
const path = require('path')

function oku(dosya) {
  const ham = fs.readFileSync(dosya, 'utf8')
  return { j: JSON.parse(ham), crlf: ham.includes('\r\n'), nl: ham.endsWith('\n') }
}

function yaz(dosya, o) {
  let s = JSON.stringify(o.j, null, 2)
  if (o.crlf) s = s.replace(/\n/g, '\r\n')
  if (o.nl) s += o.crlf ? '\r\n' : '\n'
  fs.writeFileSync(dosya, s)
}

function ekleTekil(dizi, metin) {
  if (!Array.isArray(dizi)) return false
  if (dizi.includes(metin)) return false
  dizi.push(metin)
  return true
}

function kaynakAyniMi(a, b) {
  // Aynı sayfadan farklı alıntı ayrı kanıttır (aynı adres + sha + tarih + aynı alıntı = aynı kaynak)
  return a.url === b.url && a.sha256_ilk12 === b.sha256_ilk12 && a.erisim_tarihi === b.erisim_tarihi && a.alinti === b.alinti
}

/**
 * @param {{bugun?:string, isler:Array<Record<string, unknown>>}} girdi
 * @param {{kok?:string, kuru?:boolean}} secenek
 * @returns {{rapor:string[], uyari:string[]}}
 */
function uygula(girdi, secenek = {}) {
  const kok = secenek.kok || process.cwd()
  const kuru = Boolean(secenek.kuru)
  const bugun = girdi.bugun || new Date().toISOString().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(bugun)) throw new Error(`bugun YYYY-AA-GG olmalı: ${bugun}`)
  if (!Array.isArray(girdi.isler) || girdi.isler.length === 0) throw new Error('isler boş')
  const kayitYolu = path.join(kok, 'docs/mevzuat/kayit.json')
  const K = oku(kayitYolu)
  const rapor = []
  const uyari = []
  const kanitYazilacak = []
  for (const is of girdi.isler) {
    const kalem = K.j.kalemler.find((x) => x.kimlik === is.kimlik)
    if (!kalem) throw new Error(`kalem yok: ${is.kimlik}`)
    const kaynak = is.kaynakDosya ? JSON.parse(fs.readFileSync(path.resolve(kok, is.kaynakDosya), 'utf8')) : is.kaynak
    const kanitYolu = path.join(kok, kalem.kaynaklar_kanit)
    // Aynı kalem için birden çok iş (aynı sayfadan farklı alıntılar) aynı kanıt nesnesine yazar
    let kanit = kanitYazilacak.find(([y]) => y === kanitYolu)?.[1]
    if (kanit) { /* aynı kanıt dosyası bu koşumda zaten açık */ }
    else if (fs.existsSync(kanitYolu)) kanit = oku(kanitYolu)
    else if (is.kanitOlustur) kanit = { j: { kimlik: kalem.kimlik, eksen: kalem.eksen, kaynaklar: [] }, crlf: K.crlf, nl: true }
    else throw new Error(`kanıt dosyası yok (kanitOlustur: true ver): ${kalem.kaynaklar_kanit}`)
    if (kaynak) {
      if (kaynak.alinti_dogrulandi !== true && !is.izinDogrulanmamis) {
        throw new Error(`${is.kimlik}: alinti_dogrulandi true değil; M3 gereği kanıt eklenmez (istisna: izinDogrulanmamis)`)
      }
      if (kaynak.alinti_dogrulandi !== true) uyari.push(`${is.kimlik}: alıntı doğrulanmamış kaynak izinle eklendi`)
      if (kanit.j.kaynaklar.some((x) => kaynakAyniMi(x, kaynak))) rapor.push(`${is.kimlik}: kaynak zaten var, eklenmedi`)
      else { kanit.j.kaynaklar.push(kaynak); rapor.push(`${is.kimlik}: kaynak eklendi (${kaynak.sha256_ilk12})`) }
    }
    kalem.resmi_kaynak_sayisi = kanit.j.kaynaklar.filter((x) => x.resmi).length
    if (is.son_kontrol !== false) kalem.son_kontrol = bugun
    for (const n of is.iliski_notlari || []) ekleTekil(kalem.iliski_notlari, n)
    for (const s of is.acik_sorular || []) ekleTekil(kalem.acik_sorular, s)
    if (is.tarihler) kalem.tarihler = { ...kalem.tarihler, ...is.tarihler }
    if (is.durum) kalem.durum = is.durum
    if (!kanitYazilacak.some(([y]) => y === kanitYolu)) kanitYazilacak.push([kanitYolu, kanit])
  }
  K.j.guncellendi = bugun
  if (!kuru) {
    for (const [yol, kanit] of kanitYazilacak) yaz(yol, kanit)
    yaz(kayitYolu, K)
  }
  rapor.push(kuru ? 'KURU KOŞUM: dosya yazılmadı' : `yazıldı: kayit.json + ${kanitYazilacak.length} kanıt dosyası`)
  return { rapor, uyari }
}

function main() {
  const argv = process.argv.slice(2)
  const dosya = argv.find((a) => !a.startsWith('--'))
  if (!dosya) {
    console.error('Kullanım: node scripts/mevzuat/kanit-ekle.cjs <girdi.json> [--kuru] [--kok=<depo-kökü>]')
    process.exit(2)
  }
  const kokArg = argv.find((a) => a.startsWith('--kok='))
  const girdi = JSON.parse(fs.readFileSync(dosya, 'utf8'))
  const { rapor, uyari } = uygula(girdi, { kok: kokArg ? kokArg.slice(6) : undefined, kuru: argv.includes('--kuru') })
  for (const r of rapor) console.log(r)
  for (const u of uyari) console.error('UYARI:', u)
}

if (require.main === module) {
  try { main() } catch (e) { console.error('HATA:', e.message); process.exit(1) }
}

module.exports = { oku, yaz, uygula }
