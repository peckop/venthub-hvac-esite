#!/usr/bin/env node
'use strict'

/**
 * scripts/board/gozcu.cjs — filo gözcüsü (pano izleyicisi)
 *
 * NİÇİN VAR: 2026-08-20'de DÖRT oturum aynı sabah panoya SAĞIR kaldı. Sağırlık sessizdir —
 * "yeni not yok" ile "izleyicim ölü" gözlemi birbirinden ayırt edilemez. Bu betik o iki durumu
 * ayırt edilebilir kılar: her taramada kalıcı imlece `sonTarama` damgası basar, böylece
 * canlılık DIŞARIDAN ölçülebilir (bkz. mechanism-setup.cjs dogrula/prob).
 *
 * STDOUT = OLAY AKIŞI. Basılan her satır ajanın sohbetine bildirim olarak düşer.
 *
 * ÖLÇÜLMÜŞ TUZAKLAR (üçü de gerçek vakadan):
 *  1) Konsol kodlaması: I18N'in Python gözcüsü U+2B50 (yıldız) basamayıp notu SESSİZCE düşürdü.
 *     Burada çıktı akışı KODDA zorlanır: Buffer.from(..., 'utf8') ile ham bayt yazılır,
 *     ortam değişkenine (PYTHONIOENCODING vb.) GÜVENİLMEZ.
 *  2) İlk kurulumda tüm geçmişi basmak = yüzlerce bildirim = izleyicinin otomatik durdurulması.
 *     İlk çalıştırma imleci DOSYA SONUNA kurar ve bunu tek satırla bildirir.
 *  3) Tek bir dosya okuma hatası (kilit, yarım yazım, silinme) süreci öldürmemeli — her okuma
 *     kendi try/catch'inde; hata YUTULMAZ, uyarı satırı olarak basılır (sessizlik = başarı DEĞİL).
 */

const fs = require('fs')
const path = require('path')

const PANO = process.env.VENTHUB_PANO_DIR || 'C:/tmp/venthub-board'

const arg = (ad) => {
  const i = process.argv.indexOf(ad)
  return i > -1 ? process.argv[i + 1] : undefined
}

/** Çıktı akışı KODDA UTF-8 — ortam değişkenine güvenilmez (tuzak 1). */
const yaz = (satir) => {
  try {
    process.stdout.write(Buffer.from(String(satir) + '\n', 'utf8'))
  } catch {
    /* akış kapandıysa süreci öldürme */
  }
}

const oldur = (mesaj) => {
  yaz('GOZCU-ONKOSUL-HATASI: ' + mesaj)
  process.exit(2)
}

// ---------------------------------------------------------------- önkoşul kapısı
// Bir bekçi, kendi önkoşullarını doğrulamadan çalışmaya başlarsa "hiçbir şey bulamadı" ile
// "hiçbir yere bakmadı" aynı görünür.
const sid = arg('--sid') || process.env.CLAUDE_SESSION_ID
if (!sid) oldur('--sid ZORUNLU (kendi notlarını elemek için gerekli).')
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sid)) {
  oldur('--sid tam uuid olmalı, alınan: ' + sid)
}
if (!fs.existsSync(PANO)) oldur('pano dizini yok: ' + PANO)

const araliksn = Number(arg('--aralik') || 60)
if (!Number.isFinite(araliksn) || araliksn < 5) oldur('--aralik en az 5 saniye olmalı.')

const kisaSid = sid.slice(0, 8)
const IMLEC_YOLU = path.join(PANO, '.gozcu-imlec.' + kisaSid + '.json')

// ---------------------------------------------------------------- kalıcı imleç
const bosImlec = () => ({
  sid,
  // aralikSn imlece YAZILIR: canlilik esigini disaridan olcen taraf (mechanism-setup dogrula)
  // gozcunun hangi tempoda tarandigini bilmeden 'bayat mi' diyemez.
  aralikSn: araliksn,
  olusturuldu: new Date().toISOString(),
  sonTarama: null,
  ofsetler: {},
})

let imlec = bosImlec()
let ilkKurulum = true
try {
  if (fs.existsSync(IMLEC_YOLU)) {
    const okunan = JSON.parse(fs.readFileSync(IMLEC_YOLU, 'utf8'))
    if (okunan && typeof okunan === 'object' && okunan.ofsetler) {
      imlec = { ...bosImlec(), ...okunan, sid, aralikSn: araliksn }
      ilkKurulum = false
    }
  }
} catch (e) {
  yaz('GOZCU-UYARI: imleç dosyası okunamadı (' + (e.code || e.message) + '), sıfırdan kuruluyor.')
}

const imlecYaz = () => {
  const gecici = IMLEC_YOLU + '.tmp'
  try {
    fs.writeFileSync(gecici, JSON.stringify(imlec), 'utf8')
    fs.renameSync(gecici, IMLEC_YOLU)
  } catch (e) {
    yaz('GOZCU-UYARI: imleç yazılamadı (' + (e.code || e.message) + ') — canlılık ölçümü körleşir.')
  }
}

// ---------------------------------------------------------------- tarama
const panoDosyasiMi = (d) => d.startsWith('events.') && d.endsWith('.jsonl')

const notSatiri = (o) => {
  const kim = o.lane || (o.sid ? String(o.sid).slice(0, 8) : '?')
  const kime = o.to ? String(o.to).slice(0, 8) : 'HERKESE'
  const metin = String(o.text || '').replace(/[\r\n]+/g, ' ').slice(0, 400)
  return kim + ' -> ' + kime + ' :: ' + metin
}

function tara() {
  let dosyalar = []
  try {
    dosyalar = fs.readdirSync(PANO).filter(panoDosyasiMi)
  } catch (e) {
    yaz('GOZCU-UYARI: pano dizini okunamadı (' + (e.code || e.message) + ') — bir sonraki turda yeniden denenecek.')
    return
  }

  for (const d of dosyalar) {
    // Kendi dosyamı hiç okumam: kendi notlarımı kendime bildirmek gürültüdür.
    if (d.includes(kisaSid)) continue

    const tam = path.join(PANO, d)
    let st
    try {
      st = fs.statSync(tam)
    } catch {
      continue
    }

    let onceki = Number(imlec.ofsetler[d] || 0)
    if (st.size < onceki) onceki = 0 // dosya kısaldı/döndürüldü

    if (ilkKurulum) {
      imlec.ofsetler[d] = st.size
      continue
    }
    if (st.size <= onceki) continue

    let ham = ''
    try {
      const fd = fs.openSync(tam, 'r')
      const tampon = Buffer.alloc(st.size - onceki)
      fs.readSync(fd, tampon, 0, tampon.length, onceki)
      fs.closeSync(fd)
      ham = tampon.toString('utf8')
    } catch (e) {
      yaz('GOZCU-UYARI: ' + d + ' okunamadı (' + (e.code || e.message) + ').')
      continue
    }

    // Yarım yazılmış son satırı YUTMA: imleci yalnız tam satırların sonuna kadar ilerlet.
    const sonNl = ham.lastIndexOf('\n')
    if (sonNl < 0) continue
    const tamKisim = ham.slice(0, sonNl + 1)
    imlec.ofsetler[d] = onceki + Buffer.byteLength(tamKisim, 'utf8')

    for (const satir of tamKisim.split('\n')) {
      if (!satir.trim()) continue
      let o
      try {
        o = JSON.parse(satir)
      } catch {
        continue
      }
      if (!o || o.type !== 'note') continue
      if (o.sid && String(o.sid).startsWith(kisaSid)) continue
      yaz(notSatiri(o))
    }
  }

  imlec.sonTarama = new Date().toISOString()
  imlecYaz()
}

// ---------------------------------------------------------------- döngü
tara()
if (ilkKurulum) {
  yaz('GOZCU-KURULDU: imleç ' + Object.keys(imlec.ofsetler).length + ' pano dosyasının SONUNA kuruldu (geçmiş basılmaz). Bundan sonraki notlar bildirilecek.')
  ilkKurulum = false
}

setInterval(tara, araliksn * 1000)
