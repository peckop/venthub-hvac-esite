#!/usr/bin/env node
// soz-bekcisi — Stop kapısı (ARC-58, Recep onayı 2026-10-04): sahibin "görmek istemiyorum" dediği şey cevapta
// geçiyorsa tur geri çevrilir; pencere cümleyi düzeltip yeniden yazar. Kural listesi: soz-bekcisi-kurallari.json
// (hafıza satırı tek başına kapı değildir; yeni şikâyet = listeye satır, aynı gün kapı olur).
//
// KAPSAM: yalnız turun SON asistan metni (sahibin ekranda gördüğü). Başka pencereye giden SendMessage metni taranmaz;
// iç yazışmada kimlik meşru olabilir. Kod blokları (```) ve adresler (http...) taranmaz.
// FAIL-OPEN ama sessiz değil: okunamayan girdi/kayıt/kural dosyası stderr'e yazar, tur geçer.
// Atlatma: son metinde "Sözbekçisi: <sebep>" satırı (sebep kayda düşer: ~/.claude/mod-durum/soz-bekcisi-atlatma.log).
// Döngü koruması: stop_hook_active ise ikinci kez bloklamaz. Vana: VENTHUB_SOZ_BEKCISI_KAPAT=1.
//
// settings.json'a bağlama OPS kapısıdır (Stop, kartsiz-beklenti-kapisi'nin yanına).
'use strict'
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { kuyrukSatirlari } = require('./transkript-kuyrugu.cjs')
const { turuOku } = require('./kartsiz-beklenti-kapisi.cjs')

const KURAL_DOSYASI = path.join(__dirname, 'soz-bekcisi-kurallari.json')
const ATLATMA = /^\s*S[öo]zbek[çc]isi:\s*(\S.{4,})$/im

function kurallariOku(yol = KURAL_DOSYASI) {
  const j = JSON.parse(fs.readFileSync(yol, 'utf8'))
  return (j.kurallar || []).map((k) => ({ ...k, re: new RegExp(k.desen, 'gi') }))
}

/** Kod blokları ve adresler taranmaz (örnek/komut çıktısı sahibin okuduğu cümle değildir). */
function taranacakMetin(metin) {
  return String(metin).replace(/```[\s\S]*?```/g, ' ').replace(/https?:\/\/\S+/g, ' ')
}

/** Dönüş: [{ kural, bulunan: [..] }] — boş dizi = temiz. */
function tara(metin, kurallar) {
  const t = taranacakMetin(metin)
  const sonuc = []
  for (const k of kurallar) {
    const bulunan = new Set()
    for (const m of t.matchAll(k.re)) {
      if (k.rakamVeHarf && !(/\d/.test(m[0]) && /[a-z]/i.test(m[0]))) continue
      bulunan.add(m[0])
    }
    if (bulunan.size > 0) sonuc.push({ kural: k, bulunan: [...bulunan] })
  }
  return sonuc
}

function durumDizini() {
  return process.env.KARTSIZ_KAPI_DURUM_DIZINI || path.join(os.homedir(), '.claude', 'mod-durum')
}

function atlatmaKaydet(sebep, oturum) {
  try {
    const dizin = durumDizini()
    fs.mkdirSync(dizin, { recursive: true })
    fs.appendFileSync(path.join(dizin, 'soz-bekcisi-atlatma.log'), new Date().toISOString() + ' ' + oturum + ' ' + sebep.replace(/\s+/g, ' ') + '\n')
  } catch {
    /* kayıt yazılamadı */
  }
}

function engelMetni(bulgular) {
  return (
    '[soz-bekcisi] KIRMIZI: sahibin görmek istemediği şey cevapta geçiyor. ' +
    bulgular.map((b) => b.kural.id + ': ' + b.bulunan.join(', ') + ' — ' + b.kural.duzeltme).join(' · ') +
    ' Cevabı bu ifadeler olmadan yeniden yaz. Gerçekten gerekliyse tek satır ekle: "Sözbekçisi: <sebep>" (sebep kayda düşer).'
  )
}

function main() {
  if (process.env.VENTHUB_SOZ_BEKCISI_KAPAT === '1') process.exit(0)
  let raw = ''
  process.stdin.on('data', (c) => {
    raw += c
  })
  process.stdin.on('end', () => {
    let input
    try {
      input = JSON.parse(raw)
    } catch {
      process.stderr.write('[soz-bekcisi] stdin okunamadi, karisilmadi\n')
      process.exit(0)
    }
    const tp = input.transcript_path
    if (!tp || !fs.existsSync(tp)) process.exit(0)
    let kurallar
    let kayitlar = []
    try {
      kurallar = kurallariOku()
      for (const s of kuyrukSatirlari(tp)) {
        try {
          kayitlar.push(JSON.parse(s))
        } catch {
          /* yut */
        }
      }
    } catch (e) {
      process.stderr.write('[soz-bekcisi] kural/kayit okunamadi (' + ((e && e.code) || (e && e.message) || 'bilinmeyen') + '), karisilmadi\n')
      process.exit(0)
    }
    const tur = turuOku(kayitlar)
    if (!tur || !tur.sonMetin) process.exit(0)
    const bulgular = tara(tur.sonMetin, kurallar)
    if (bulgular.length === 0) process.exit(0)
    const at = ATLATMA.exec(tur.sonMetin)
    if (at) {
      atlatmaKaydet(at[1], input.session_id || 'x')
      process.exit(0)
    }
    if (input.stop_hook_active) {
      process.stderr.write('[soz-bekcisi] stop_hook_active: ikinci kez bloklanmadi\n')
      process.exit(0)
    }
    process.stderr.write(engelMetni(bulgular) + '\n')
    process.exit(2)
  })
}

module.exports = { kurallariOku, tara, taranacakMetin, engelMetni, ATLATMA }

if (require.main === module) main()
