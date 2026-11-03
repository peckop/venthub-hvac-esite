#!/usr/bin/env node
// kaynaksiz-hukum-uyarisi — Stop kancası, UYARI (ARC-112, OPS-120 madde 1 "ölçmeden hüküm").
//
// OLAY (12 Ekim, 4 kez): Recep'e giden metinde ölçülmemiş olgu hükmü verildi ("iki kademe", "Lineo
// yanlış", "OCR işe yaramaz", "betik dakikalar sürer"); sonradan yanlış çıktı. Kural (filo-ortak.md):
// ölçmediysen "bilmiyorum, bakıyorum" de; olgu cümlesi kaynaksızsa "ölçülmedi" yazılır.
//
// NE YAPAR: turun son asistan metnini (kartsiz-beklenti-kapisi.turuOku) cümlelere böler. Bir cümle
// HÜKÜMdür ⇔ hüküm kelimesi (doğru/yanlış/yok/var/çalışmıyor/bozuk/değil...) + somut iz (sayı, yol,
// #PR, kart no) birlikte geçer. Aynı cümlede ya da bir önceki satırda kaynak işareti (dosya:satır,
// ters tırnaklı komut, "ölç*", "kanıt", "çıktı", tarih/saat, "bilmiyorum") yoksa KAYNAKSIZ sayılır.
//
// v1 BLOKLAMAZ: çıkış daima 0. Kaynaksız hüküm bulunursa oturum başına BİR KEZ systemMessage ile tek
// satır uyarı basar. Kod blokları ve tablo başlık/ayraç satırları taranmaz.
// Fail-open: stdin/transkript okunamazsa sessizce değil, stderr'e tek satır yazıp geçer.
// Vana: KAYNAKSIZ_HUKUM_KAPALI=1 kancayı susturur.
'use strict'
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const HARF = 'A-Za-zÇĞİÖŞÜçğıöşü'
const kelime = (k) => new RegExp('(?<![' + HARF + '])(?:' + k + ')(?![' + HARF + '])', 'iu')

// Hüküm kelimeleri (ekleriyle): "yok", "yanlış", "bozuk", "çalışmıyor", "değil" ...
const HUKUM = kelime(
  'doğru|yanlış(?:tı|tır)?|yok(?:tur|tu)?|var(?:dır|dı)?|çalışmıyor|çalışıyor|bozuk(?:tur)?|değil(?:dir)?|işe yaramaz|eksik|hatalı',
)
// Somut iz: sayı, yol, PR/kart numarası.
const SOMUT = /\d|[\w-]+\/[\w./-]+|#\d+|\b[A-Z]{2,4}-\d+\b/u
// Kaynak işareti: dosya:satır, ters tırnaklı komut/yol, ölçüm fiilleri, kanıt/çıktı, tarih-saat, bilinmezlik beyanı.
const KAYNAK = new RegExp(
  [
    '[\\w./-]+\\.[A-Za-z]{1,5}:\\d+', // dosya.ext:42
    '`[^`]+`', // `komut` ya da `yol`
    kelime('ölç[a-zçğıöşü]*|kanıt[a-zçğıöşü]*|çıktı[a-zçğıöşü]*|bilmiyorum|bakıyorum|doğrula[a-zçğıöşü]*|okudum|koştum|saydım').source,
    '\\b\\d{1,2}:\\d{2}\\b', // saat
    '\\b\\d{4}-\\d{2}-\\d{2}\\b', // tarih
    'https?://',
  ].join('|'),
  'iu',
)

/** Saf: metinden kaynaksız hüküm cümlelerini çıkarır. Dönen dizi kısaltılmış cümlelerdir. */
function kaynaksizHukumler(metin) {
  const satirlar = String(metin || '').split(/\r?\n/)
  const sonuc = []
  let kodda = false
  let onceki = ''
  for (const ham of satirlar) {
    const satir = ham.trim()
    if (/^```/.test(satir)) {
      kodda = !kodda
      onceki = ''
      continue
    }
    if (kodda || !satir) {
      onceki = kodda ? '' : onceki
      continue
    }
    if (/^\|?[\s:|-]+\|?$/.test(satir) || /^\|\s*No\s*\|/i.test(satir)) {
      onceki = satir
      continue
    }
    // Satırı cümlelere böl (nokta/ünlem/soru + boşluk). Tablo satırı tek cümle sayılır.
    const cumleler = satir.startsWith('|') ? [satir] : satir.split(/(?<=[.!?])\s+/)
    const satirKaynakli = KAYNAK.test(satir) || KAYNAK.test(onceki)
    for (const c of cumleler) {
      if (/\?\s*$/.test(c)) continue // soru hüküm değildir
      const govde = c.replace(/^(?:[-*>]\s*)*(?:\*\*)?\d+[.)](?:\*\*)?\s*/, '') // liste numarası somut iz değildir
      if (!HUKUM.test(govde) || !SOMUT.test(govde)) continue
      if (KAYNAK.test(c) || satirKaynakli) continue
      sonuc.push(c.length > 120 ? c.slice(0, 117) + '...' : c)
    }
    onceki = satir
  }
  return sonuc
}

function uyariMetni(hukumler) {
  return (
    '[kaynaksiz-hukum] Kaynaksız olgu hükmü (' + hukumler.length + '): "' + hukumler[0] + '". ' +
    'Ölçtüysen kaynağı yaz (dosya:satır, komut, saat); ölçmediysen "ölçülmedi" de (OPS-120 m.1, ARC-112).'
  )
}

function gorulenYolu(oturum) {
  return path.join(os.tmpdir(), 'kaynaksiz-hukum-' + String(oturum).replace(/[^A-Za-z0-9-]/g, '').slice(0, 40))
}

function main() {
  let raw = ''
  process.stdin.on('data', (c) => {
    raw += c
  })
  process.stdin.on('end', () => {
    if (process.env.KAYNAKSIZ_HUKUM_KAPALI === '1') process.exit(0)
    let input
    try {
      input = JSON.parse(raw)
    } catch {
      process.stderr.write('[kaynaksiz-hukum] stdin okunamadi, gecildi\n')
      process.exit(0)
    }
    const tp = input.transcript_path
    if (!tp || !fs.existsSync(tp)) process.exit(0)
    const isaret = gorulenYolu(input.session_id || 'x')
    if (fs.existsSync(isaret)) process.exit(0) // oturum başına bir kez
    let tur
    try {
      const { kuyrukSatirlari } = require('./transkript-kuyrugu.cjs')
      const { turuOku } = require('./kartsiz-beklenti-kapisi.cjs')
      const kayitlar = []
      for (const s of kuyrukSatirlari(tp)) {
        try {
          kayitlar.push(JSON.parse(s))
        } catch {
          /* yut */
        }
      }
      tur = turuOku(kayitlar)
    } catch (e) {
      process.stderr.write('[kaynaksiz-hukum] transkript okunamadi (' + ((e && e.code) || 'bilinmeyen') + '), gecildi\n')
      process.exit(0)
    }
    if (!tur || !tur.sonMetin) process.exit(0)
    const bulunan = kaynaksizHukumler(tur.sonMetin)
    if (bulunan.length === 0) process.exit(0)
    try {
      fs.writeFileSync(isaret, new Date().toISOString())
    } catch {
      /* işaret yazılamazsa uyarı tekrar edebilir; zararsız */
    }
    process.stdout.write(JSON.stringify({ systemMessage: uyariMetni(bulunan) }))
    process.exit(0)
  })
}

module.exports = { kaynaksizHukumler, uyariMetni }

if (require.main === module) main()
