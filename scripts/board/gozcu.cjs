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

/**
 * IKI AD, TEK KAVRAM — OLCULMUS KUSUR (2026-08-23): bu dosya VENTHUB_PANO_DIR okuyordu,
 * board.cjs ise VENTHUB_BOARD_DIR (board.cjs:28). Panoyu bir kopyaya yonlendirip kanarya
 * kosturdugumda yonlendirme YARIM uygulandi: OKUMA kopyadan yapildi, YAZMA gercek panoya
 * gitti ve canli bir seride kanarya notu dustu. Yonlendirme "calisti" gorunuyordu cunku
 * yarisi tasinmisti — sessiz sizinti, cunku hicbir hata olusmadi.
 * Bu yuzden ikisi de kabul edilir ve board.cjs in okudugu ad ONCELIKLIDIR: tek bir degisken
 * ayarlamak butun katmani birlikte tasir.
 */
const PANO = process.env.VENTHUB_BOARD_DIR || process.env.VENTHUB_PANO_DIR || 'C:/tmp/venthub-board'

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

/**
 * OLCULMUS KUSUR (2026-08-23): kirpma siniri 400 karakterdi ve KIRPILDIGI SOYLENMIYORDU.
 * Panodaki 2027 notun 1904'u (%93.9) bu siniri asiyor; medyan not 1130, en uzunu 6138 karakter.
 * Yani gozcu, notlarin yarisindan azini gosterip TAM gostermis gibi basiyordu. Sessiz kirpma
 * "yanlis veri yayinlama" sinifinin en sinsi hali, cunku cikti DOGRU GORUNUR. Bir emir
 * cumlesinin sonu kesilirse anlam TERSINE donebilir ("... merge ETME" -> "... merge").
 * Yeni sinir 3000: notlarin %96.4'u TAM gecer; gecmeyen, DUSEN KARAKTER SAYISIYLA soyler.
 */
const KIRPMA_SINIRI = 3000

const notSatiri = (o) => {
  const kim = o.lane || (o.sid ? String(o.sid).slice(0, 8) : '?')
  const kime = o.to ? String(o.to).slice(0, 8) : 'HERKESE'
  const ham = String(o.text || '').replace(/[\r\n]+/g, ' ')
  const metin =
    ham.length > KIRPMA_SINIRI
      ? ham.slice(0, KIRPMA_SINIRI) +
        ' ...[KIRPILDI: ' + (ham.length - KIRPMA_SINIRI) + ' karakter daha var; tamami panodaki jsonl dosyasinda]'
      : ham
  return kim + ' -> ' + kime + ' :: ' + metin
}

function tara() {
  // Esik taramanin BASINDA donduruluyor: asagida imlec.sonTarama guncelleniyor,
  // dongu icinde okunsaydi dosyadan dosyaya kayardi.
  const esik = imlec.sonTarama
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
    } catch (e) {
      // SESSIZ ATLAMA YOK: burada susmak, o seridi duymadigimi duymamak demekti.
      yaz('GOZCU-UYARI: ' + d + ' stat edilemedi (' + (e.code || e.message) + ') - BU TURDA BU SERIDI DUYMUYORUM; sessizlik degil KORLUK.')
      continue
    }

    // OLCULMUS TUZAK 4 (2026-08-23): imlecte OLMAYAN bir pano dosyasi (filoda yeni bir oturum
    // acilinca olusur) offset 0dan okunur ve o dosyanin TUM GECMISI "yeni not" diye yayinlanir.
    // URUN'un ayni gun yasadigi kirilmanin (on gunluk arsivi yeni sanip basmak) BASKA BIR
    // MEKANIZMADAN gelen esi. Olctum: onarim aninda panoda imlecte olmayan 1 dosya vardi
    // (events.probe-admin-6cc7f2d3.jsonl) - yani latent degil, SIRADAKI ates.
    // Care URUN'un caresiyle ayni: ZAMAN DAMGASI. Bilinmeyen dosyada yalniz esikten SONRAKI
    // olaylar yayinlanir; bastirilanlarin SAYISI basilir (sessizlik = basari DEGIL).
    const bilinenDosya = Object.prototype.hasOwnProperty.call(imlec.ofsetler, d)
    let bastirilan = 0
    let bozukSatir = 0
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
        bozukSatir++
        continue
      }
      if (!o || o.type !== 'note') continue
      if (o.sid && String(o.sid).startsWith(kisaSid)) continue
      if (!bilinenDosya && esik && o.ts && String(o.ts) <= esik) {
        bastirilan++
        continue
      }
      yaz(notSatiri(o))
    }

    if (bozukSatir) {
      yaz('GOZCU-UYARI: ' + d + ' icinde ' + bozukSatir + ' satir JSON olarak cozulemedi - sessizce dusurulmedi, bildiriliyor (o satirlardaki notlar KAYIP olabilir).')
    }

    if (!bilinenDosya) {
      yaz(
        'GOZCU-YENI-DOSYA: ' + d + ' imlecte yoktu; ' + bastirilan +
        ' eski olay BASTIRILDI (esik ' + (esik || 'yok') + '). Bastirilanlar arsivdir, kayip degil.',
      )
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
