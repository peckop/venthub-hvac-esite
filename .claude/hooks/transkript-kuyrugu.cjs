'use strict'
// transkript-kuyrugu — Stop kancalarının ortak "konuşma kaydının kuyruğunu oku" yardımcısı (ARC-83, 2026-10-10).
//
// OLAY: OPS penceresinde iki tur sonu kancası (son-soz-gate, kartsiz-beklenti-kapisi) konuşma kaydını
// `fs.readFileSync(tp, 'utf8')` ile BÜTÜN okuyordu. Kayıt 1,78 GB'a ulaşınca Node dizeye ~512 MB üstünü
// okuyamadığı için kanca çöktü: 9 Ekim'de 508 koşunun 504'ü çöktü, yani iki kapı o pencerede hiç çalışmadı.
// Kapılar yalnız turun içine bakar (son ~400 satır); bütün dosyayı okumanın hiçbir gerekçesi yoktu.
//
// KURAL: konuşma kaydı `readFileSync` ile bütün okunmaz; kuyruk bu yardımcıyla okunur. Pencere satır ortasından
// başlarsa ilk (yarım) satır atılır; pencere tek bir satırdan küçükse (dev araç çıktısı, görüntü) pencere
// büyütülür; üst sınırda da tam satır çıkmazsa [] döner ve çağıran fail-open ama SESSİZ DEĞİL davranır.
// Cetvel: docs/standards/execution-method-standard.md §9.7 (bozuk/okunamayan girdi: turu bloklama, ölçemediğini söyle).
const fs = require('node:fs')

/** İlk deneme penceresi: bir turun içi buna rahat sığar. */
const VARSAYILAN_BAYT = 16 * 1024 * 1024
/** Dönen en çok satır sayısı (eski davranışla aynı: son 400 satır). */
const VARSAYILAN_SATIR = 400
/** Pencere büyütmenin tavanı; Node dizge sınırının (~512 MB) çok altında kalır. */
const TAVAN_BAYT = 256 * 1024 * 1024

/**
 * `fd` dosyasının son `n` baytını okur, satırlara böler. Pencere dosyanın başından değilse ilk parça
 * satırın ortasında başlamış olabilir: atılır (UTF-8 çok baytlı harfin kesilmesi de yalnız o parçayı bozar).
 */
function pencereSatirlari(fd, boy, n) {
  const tampon = Buffer.allocUnsafe(n)
  let okunan = 0
  while (okunan < n) {
    const r = fs.readSync(fd, tampon, okunan, n - okunan, boy - n + okunan)
    if (r === 0) break
    okunan += r
  }
  let satirlar = tampon.toString('utf8', 0, okunan).split('\n')
  if (boy > n) satirlar = satirlar.slice(1)
  return satirlar.map((s) => s.trim()).filter((s) => s.length > 0)
}

/**
 * Konuşma kaydının son `maxSatir` TAM satırını döndürür. Dosya yoksa/okunamazsa fırlatır (çağıran yakalar).
 * @param {string} yol
 * @param {number} [maxBayt] ilk pencere (bayt)
 * @param {number} [maxSatir]
 * @returns {string[]}
 */
function kuyrukSatirlari(yol, maxBayt = VARSAYILAN_BAYT, maxSatir = VARSAYILAN_SATIR) {
  const fd = fs.openSync(yol, 'r')
  try {
    const boy = fs.fstatSync(fd).size
    if (boy === 0) return []
    let pencere = Math.max(1, Math.floor(maxBayt))
    for (;;) {
      const n = Math.min(boy, pencere)
      const satirlar = pencereSatirlari(fd, boy, n)
      if (satirlar.length > 0 || n >= boy || pencere >= TAVAN_BAYT) return satirlar.slice(-maxSatir)
      pencere = Math.min(pencere * 4, TAVAN_BAYT)
    }
  } finally {
    fs.closeSync(fd)
  }
}

module.exports = { kuyrukSatirlari, VARSAYILAN_BAYT, VARSAYILAN_SATIR, TAVAN_BAYT }
