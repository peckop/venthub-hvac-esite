#!/usr/bin/env node
'use strict'

/**
 * RECEP SÖZÜ DEFTERİ YEDEĞİ (ARC-15) — defter artık KARAR KAYDIDIR; tek kopya, git dışı, ek-yazımlı bir dosyadır.
 *
 * NİÇİN: Recep (10-01): "tarih ve saat var ise neleri yazdığım nelere onay verdiğim de kayıt altında olmuş olur." Kayıt
 * ancak kaybolmuyorsa kayıttır. `~/.claude/recep-sozu-defteri.jsonl` (ve döndürmede oluşan aylık arşivler) tek makinede
 * tek kopyadır; sage ve Kanban için kurulan yedek düzenine (`scripts/hijyen/sage-yedek.cjs`) BURADAN girer, ama onun
 * SQLite mantığını (VACUUM INTO) kullanmaz: defter düz JSONL'dir, doğrulama bayt eşitliğidir.
 *
 * DÜZEN (sage/Kanban ile AYNI):
 *   · hedef = `sage-yedek.cjs yedekDizini()` (git DIŞI; depo içine ASLA yazılmaz),
 *   · ad = `defter-YYYY-MM-DDTHHMMZ.jsonl`, aynı kademeli saklama (son 24 + 30 günün her günü için en yenisi),
 *   · doğrulanamayan kopya `.DOGRULANMADI` uzantısıyla kalır ve YEDEK SAYILMAZ (kaybı taze göstermez),
 *   · tazelik eşiği 1 saat (kanca bu eşikten yeniyse hiçbir şey açmadan çıkar).
 * Her yedek TEK dosyadır: arşivler (eskiden yeniye) + aktif defter. Böylece geri yükleme tek dosyadan TAM resmi getirir.
 *
 * GERİ YÜKLEME (varsayılan yalnız PLAN; `--evet` uygular):
 *   node scripts/board/recep-sozu-defteri-yedek.cjs --geri [defter-....jsonl] [--evet]
 *   Uygulanınca mevcut aktif defter ve arşivler `*.oncesi-<damga>` olarak YANINDA kalır (silinmez); yedek aktif defter olur.
 *   Not: geri yükleme sırasında başka bir pencerenin yazdığı söz, kopyalama anına denk gelirse `.oncesi` dosyasında durur.
 *
 * KULLANIM:
 *   node recep-sozu-defteri-yedek.cjs            yedek al (taze ise atlar; --zorla ile her zaman)
 *   node recep-sozu-defteri-yedek.cjs --liste    yedekleri yaz
 *   node recep-sozu-defteri-yedek.cjs --geri ... geri yükleme planı / uygulama
 * Çıkış: 0 = tamam · 1 = başarısız/reddedildi · 2 = kullanım hatası.
 */
const fs = require('node:fs')
const path = require('node:path')

const defter = require('./recep-sozu-defteri.cjs')
const sageYedek = require('../hijyen/sage-yedek.cjs')

const ONEK = 'defter-'
const UZANTI = '.jsonl'
/** Son yedek bundan yeniyse koşum atlanır. */
const TAZE_SAAT = 1
/** İstem satırı: son yedek bundan eskiyse konuşur. */
const UYARI_SAAT = 24
const SAKLAMA = { son: 24, gunluk: 30 }

const DESEN = /^defter-\d{4}-\d{2}-\d{2}T\d{4}Z\.jsonl$/

function dizin() {
  return sageYedek.yedekDizini()
}

/** Birleşik tam resim: arşivler (eskiden yeniye) + aktif defter, her parça son TAM satıra kadar. */
function birlesikIcerik() {
  const parcalar = []
  for (const yol of [...defter.arsivYollari(), defter.defterYolu()]) {
    try {
      parcalar.push(defter.tamSatirlar(fs.readFileSync(yol)))
    } catch {
      /* parça yok/okunamadı: o parça yedeğe girmez (kaynak-yok ayrımı aşağıda) */
    }
  }
  return Buffer.concat(parcalar)
}

function satirSay(tampon) {
  let n = 0
  for (const b of tampon) if (b === 0x0a) n++
  return n
}

/**
 * @returns {{durum: 'alindi'|'dogrulanmadi'|'kaynak-yok'|'atlandi'|'hata', yol?: string, satir?: number, bayt?: number, sebep?: string}}
 */
function yedekAl(simdi = new Date(), secenek = {}) {
  try {
    const hedefDizin = secenek.dizin || dizin()
    const son = durum(hedefDizin, simdi.getTime()).sonYedek
    if (!secenek.zorla && son && simdi.getTime() - Date.parse(son) < TAZE_SAAT * 3_600_000) {
      return { durum: 'atlandi', sebep: `son yedek ${son} (${TAZE_SAAT} saatten yeni)` }
    }
    const tam = birlesikIcerik()
    if (tam.length === 0) return { durum: 'kaynak-yok', sebep: 'defter bos ya da yok' }
    fs.mkdirSync(hedefDizin, { recursive: true })
    const ad = `${ONEK}${sageYedek.damga(simdi)}${UZANTI}`
    const yol = path.join(hedefDizin, ad)
    const gecici = `${yol}.yaziliyor-${process.pid}`
    // `yaz` yalnız testte bozuk yazımı taklit etmek içindir (doğrulama kolunu sabote edilebilir kılar).
    ;(secenek.yaz || fs.writeFileSync)(gecici, tam)
    const okunan = fs.readFileSync(gecici)
    if (!okunan.equals(tam)) {
      const kotu = `${yol}.DOGRULANMADI`
      fs.renameSync(gecici, kotu)
      return { durum: 'dogrulanmadi', yol: kotu, sebep: 'yazilan kopya kaynakla bayt-bayt esit degil' }
    }
    fs.renameSync(gecici, yol)
    budama(hedefDizin)
    return { durum: 'alindi', yol, satir: satirSay(tam), bayt: tam.length }
  } catch (e) {
    return { durum: 'hata', sebep: String((e && e.message) || e).slice(0, 160) }
  }
}

/** Kademeli saklama (sage-yedek ile AYNI hesap). `.DOGRULANMADI` dosyalarına DOKUNMAZ. */
function budama(hedefDizin = dizin()) {
  let dosyalar
  try {
    dosyalar = fs.readdirSync(hedefDizin).filter((f) => DESEN.test(f)).sort()
  } catch {
    return []
  }
  const silinecek = sageYedek.kademeliSilinecek(dosyalar, { onek: ONEK, saklama: SAKLAMA })
  for (const f of silinecek) {
    try {
      fs.unlinkSync(path.join(hedefDizin, f))
    } catch {
      /* silinemezse sonraki koşumda tekrar denenir */
    }
  }
  return silinecek
}

function liste(hedefDizin = dizin()) {
  try {
    return fs
      .readdirSync(hedefDizin)
      .filter((f) => f.startsWith(ONEK))
      .sort()
      .map((f) => {
        const s = fs.statSync(path.join(hedefDizin, f))
        return { ad: f, bayt: s.size, tarih: s.mtime.toISOString() }
      })
  } catch {
    return []
  }
}

/**
 * "Defter yedeğim ne kadar eski" sorusunun tek cevabı (istem satırı ve kanca okur).
 * @returns {{sonYedek: string|null, saat: number|null, gecikti: boolean, adet: number, dogrulanmadi: string[]}}
 */
function durum(hedefDizin = dizin(), simdi = Date.now()) {
  const hepsi = liste(hedefDizin)
  const saglam = hepsi.filter((y) => DESEN.test(y.ad))
  const dogrulanmadi = hepsi.filter((y) => y.ad.endsWith('.DOGRULANMADI')).map((y) => y.ad)
  const son = saglam.length ? saglam[saglam.length - 1] : null
  const saat = son ? Math.floor((simdi - Date.parse(son.tarih)) / 3_600_000) : null
  return {
    sonYedek: son ? son.tarih : null,
    saat,
    gecikti: saat !== null && saat >= UYARI_SAAT,
    adet: saglam.length,
    dogrulanmadi,
  }
}

function damgaDosya(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`
}

/**
 * Yedekten geri yükler. `evet` YOKSA yalnız plan (hiçbir dosya değişmez).
 * @returns {{durum: 'plan'|'geri-yuklendi'|'hata', yedek?: string, satir?: number, mevcutSatir?: number, oncesi?: string[], sebep?: string}}
 */
function geriYukle(dosyaAdi = null, secenek = {}) {
  const hedefDizin = secenek.dizin || dizin()
  const saglam = liste(hedefDizin).filter((y) => DESEN.test(y.ad))
  if (saglam.length === 0) return { durum: 'hata', sebep: `${hedefDizin} altinda defter yedegi yok` }
  const secilen = dosyaAdi ? saglam.find((y) => y.ad === path.basename(dosyaAdi)) : saglam[saglam.length - 1]
  if (!secilen) return { durum: 'hata', sebep: `yedek bulunamadi: ${dosyaAdi}` }
  const yedekYol = path.join(hedefDizin, secilen.ad)
  let icerik
  try {
    icerik = fs.readFileSync(yedekYol)
  } catch (e) {
    return { durum: 'hata', sebep: 'yedek okunamadi: ' + String((e && e.message) || e).slice(0, 120) }
  }
  // Doğrulama: her satır JSON olmalı (bozuk yedek canlı defterin üstüne yazılmaz).
  const satirlar = icerik.toString('utf8').split('\n').filter((s) => s !== '')
  for (const s of satirlar) {
    try {
      JSON.parse(s)
    } catch {
      return { durum: 'hata', sebep: 'yedek bozuk (JSON olmayan satir var); geri yukleme REDDEDILDI' }
    }
  }
  const mevcut = (() => {
    try {
      return satirSay(birlesikIcerik())
    } catch {
      return 0
    }
  })()
  if (!secenek.evet) {
    return { durum: 'plan', yedek: secilen.ad, satir: satirlar.length, mevcutSatir: mevcut }
  }

  const yol = defter.defterYolu()
  const damga = damgaDosya(new Date(secenek.simdi || Date.now()))
  const oncesi = []
  try {
    for (const p of [...defter.arsivYollari(), yol]) {
      if (!fs.existsSync(p)) continue
      const hedef = `${p}.oncesi-${damga}`
      fs.renameSync(p, hedef)
      oncesi.push(path.basename(hedef))
    }
    fs.mkdirSync(path.dirname(yol), { recursive: true })
    fs.writeFileSync(yol, icerik)
  } catch (e) {
    return { durum: 'hata', sebep: 'geri yukleme yarida kaldi: ' + String((e && e.message) || e).slice(0, 120), oncesi }
  }
  return { durum: 'geri-yuklendi', yedek: secilen.ad, satir: satirlar.length, mevcutSatir: mevcut, oncesi }
}

module.exports = { ONEK, TAZE_SAAT, UYARI_SAAT, SAKLAMA, yedekAl, budama, liste, durum, geriYukle, birlesikIcerik }

if (require.main === module) {
  const arg = process.argv.slice(2)
  if (arg.includes('--liste')) {
    for (const y of liste()) process.stdout.write(`${y.ad}\t${y.bayt} bayt\t${y.tarih}\n`)
    process.exit(0)
  }
  const geriIdx = arg.indexOf('--geri')
  if (geriIdx !== -1) {
    const ad = arg.slice(geriIdx + 1).find((a) => !a.startsWith('--')) || null
    const r = geriYukle(ad, { evet: arg.includes('--evet') })
    process.stdout.write(JSON.stringify(r, null, 2) + '\n')
    if (r.durum === 'plan') process.stdout.write('PLAN: hicbir dosya degismedi. Uygulamak icin ayni komuta --evet ekle.\n')
    process.exit(r.durum === 'hata' ? 1 : 0)
  }
  if (arg.some((a) => a.startsWith('--') && !['--zorla'].includes(a))) {
    process.stderr.write('kullanim: recep-sozu-defteri-yedek.cjs [--zorla] | --liste | --geri [yedek] [--evet]\n')
    process.exit(2)
  }
  const r = yedekAl(new Date(), { zorla: arg.includes('--zorla') })
  process.stdout.write(JSON.stringify(r) + '\n')
  process.exit(r.durum === 'alindi' || r.durum === 'atlandi' || r.durum === 'kaynak-yok' ? 0 : 1)
}
