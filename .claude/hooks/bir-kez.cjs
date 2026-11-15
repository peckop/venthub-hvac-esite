'use strict'

/**
 * BİR KEZ — ARC-326 (OPS-292 SEYRELT 9 onayı: "aynı oturumda bir kez" yardımcısı).
 *
 * NİÇİN: ÖNCE ölçümü (ARC-320) ve yeniden ölçüm (ARC-326, son 7 gün, çıkış 0 stdout kayıtları) aynı metnin aynı oturumda her mesajda
 * bağlama girdiğini gösterdi: soz-bekcisi-hatirlatma 1611/1641, gorev-tazelik-satiri 1113/1156, hafiza-yedek 1802/2479,
 * kart-alani-kapisi 932/1183, sage-dosya-dersi 869/1629, patinaj-bekcisi 57/82 (tekrar/toplam). Sabit satırın ikinci basılışı bilgi
 * taşımaz; "mobilya" olur ve kapının gerçek uyarısını da gürültüye gömer.
 *
 * NE YAPAR: `basilsin(ad, sid, metin, secenek)` bu OTURUMDA bu kanca için bu metin son `yenilemeMs` içinde basıldıysa false,
 * değilse true döner ve kaydeder. Kayıt: pano dizininde `.bir-kez.<ad>.<sid>.json` ({ özet: zaman }, en çok 500 giriş).
 * `rakamsiz: true` ise sayılar özetten çıkar ("3 dk önce" ile "4 dk önce" aynı durumdur). `sifirla(sid)` compact dönüşünde bütün
 * kayıtları siler (session-board SessionStart/compact kolu çağırır): bağlam kırpıldı, satır yeniden görünür.
 *
 * ⛔KAPSAM SINIRI: yalnız BİLGİ ve HATIRLATMA satırları süzülür. Engelleyen kapı kararları (deny/ask), ⛔ ve ⚠ ile başlayan başarısızlık
 * satırları bu yoldan geçmez; çağıran onları doğrudan basar. Eşikler ve kapılar DEĞİŞMEZ.
 * ⛔FAIL-OPEN: oturum kimliği yoksa, kayıt okunamazsa ya da yazılamazsa metin BASILIR (sessiz kaybolmaktan iyi).
 * Vana: VENTHUB_BIR_KEZ_KAPAT=1 (her şey basılır). Test koşusunda (VITEST) pano verilmezse süzme yok.
 */
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

const YENILEME_MS = 3 * 3600 * 1000
const TAVAN_GIRIS = 500

function panoDizini() {
  return require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'sage-enjeksiyon-defteri.cjs')).panoDizini()
}

const temizAd = (s) => String(s || '').replace(/[^0-9a-z-]/gi, '').slice(0, 40)

/**
 * @param {string} ad kanca adı (kayıt dosyası kancaya özeldir; biri ötekinin kaydını silmez)
 * @param {string} sid oturum kimliği
 * @param {string} metin süzülecek çıktı
 * @param {{ rakamsiz?: boolean, yenilemeMs?: number, pano?: string, simdi?: number }} [secenek]
 * @returns {boolean} true = bas, false = bu oturumda zaten gösterildi
 */
function basilsin(ad, sid, metin, secenek = {}) {
  try {
    if (process.env.VENTHUB_BIR_KEZ_KAPAT === '1') return true
    if (!secenek.pano && process.env.VITEST) return true
    const kimlik = temizAd(sid)
    const kanca = temizAd(ad)
    if (!kimlik || !kanca || !metin) return true
    const simdi = secenek.simdi ?? Date.now()
    const yenileme = secenek.yenilemeMs ?? YENILEME_MS
    const pano = secenek.pano || panoDizini()
    const yol = path.join(pano, `.bir-kez.${kanca}.${kimlik}.json`)
    let kayit = {}
    try {
      const j = JSON.parse(fs.readFileSync(yol, 'utf8'))
      if (j && typeof j === 'object' && !Array.isArray(j)) kayit = j
    } catch {
      /* kayıt yok ya da bozuk: metin basılır */
    }
    const govde = secenek.rakamsiz ? String(metin).replace(/\d+/g, '#') : String(metin)
    const ozet = crypto.createHash('sha256').update(govde).digest('hex').slice(0, 16)
    const onceki = kayit[ozet]
    if (typeof onceki === 'number' && simdi - onceki < yenileme) return false
    kayit[ozet] = simdi
    const anahtarlar = Object.keys(kayit)
    if (anahtarlar.length > TAVAN_GIRIS) {
      for (const a of anahtarlar.sort((x, y) => kayit[x] - kayit[y]).slice(0, anahtarlar.length - TAVAN_GIRIS)) delete kayit[a]
    }
    try {
      fs.mkdirSync(pano, { recursive: true })
      fs.writeFileSync(yol, JSON.stringify(kayit))
    } catch {
      /* yazılamadı: bir sonraki çağrıda yeniden basılır */
    }
    return true
  } catch {
    return true
  }
}

/** Compact dönüşü: bu oturumun bütün kayıtlarını siler (bağlam kırpıldı, satırlar yeniden görünsün). Hata fırlatmaz. */
function sifirla(sid, pano) {
  try {
    const kimlik = temizAd(sid)
    if (!kimlik) return 0
    const dizin = pano || panoDizini()
    let silinen = 0
    for (const f of fs.readdirSync(dizin)) {
      if (f.startsWith('.bir-kez.') && f.endsWith('.' + kimlik + '.json')) {
        try {
          fs.unlinkSync(path.join(dizin, f))
          silinen++
        } catch {
          /* silinemedi: süre dolunca yenilenir */
        }
      }
    }
    return silinen
  } catch {
    return 0
  }
}

module.exports = { basilsin, sifirla, YENILEME_MS, TAVAN_GIRIS }
