/**
 * COMPANION TAŞIYICI ANAHTARI — tek okuma noktası (REC-142).
 *
 * NİÇİN VAR: "companion üretici taşıyıcı KAPALI" bilgisi 2026-09-05'e kadar **beş ayrı
 * dosyada düz metin** olarak yaşıyordu (`companion-defter.cjs`, `session-board.cjs`,
 * `board.cjs`, `companion-sayim.cjs`, cetvel) ve hiçbiri makine-okur değildi. Kapılar
 * kendi davranışlarını **sabit kodluyordu**: C4 bloklamıyor, C5 blokluyor. Taşıyıcı
 * 2026-08-28'de kapanınca bu çelişki her hafta başka bir koldan filoyu kilitledi —
 * 09-03 C4, 09-04 INV-DOC-4b, 09-05 C5, sırada #640'ta C6 vardı. Yama değil kök çözüm
 * istendi: durum TEK yerde, davranış ondan TÜREsin.
 *
 * ⭐FAIL-CLOSED YÖNÜ — BİLEREK "AÇIK":
 * Anahtar dosyası yoksa, bozuksa ya da değer tanınmıyorsa bu okuyucu **AÇIK** döner,
 * yani kapılar BLOKLAMAYA devam eder. Ters yön (KAPALI varsaymak) daha "nazik" görünür
 * ama felakettir: anahtar bir gün silinse ya da adı değişse **bütün companion kapıları
 * sessizce susardı** ve kimse fark etmezdi. Bu depoda adı konmuş sınıf: *susan kapı ile
 * olmayan kapı aynı şeydir.* Gürültülü kırmızı görülür ve düzeltilir; sessiz yeşil
 * görülmez.
 *
 * SAF: dosya sistemi dışında yan etkisi yok, ağ yok, süreç başlatmaz. Hem `.githooks`
 * (CommonJS kancalar) hem vitest kolları `createRequire` ile aynı modülü çağırır —
 * ölçüt tek yerde yaşasın diye.
 */
'use strict'

const fs = require('fs')
const path = require('path')

/** Anahtarın kanonik adı; başka bir ad aranmaz (ikinci kayıt = ikinci gerçek). */
const ANAHTAR_ADI = '.companion-tasiyici.json'

/** Tanınan durumlar. Bunun dışındaki her değer "tanınmıyor" sayılır ve AÇIK'a düşer. */
const DURUMLAR = Object.freeze(['ACIK', 'KAPALI'])

/**
 * Anahtarı okur.
 *
 * @param {string} kok Depo kökü (mutlak yol). Çağıran verir — bu modül `git` çağırmaz,
 *   çünkü kancalar zaten kökü biliyor ve alt süreç açmak kancayı yavaşlatır.
 * @returns {{durum:'ACIK'|'KAPALI', yol:string, okundu:boolean, sebep:string}}
 *   `okundu:false` ise `durum` **ACIK**'tır ve `sebep` niçin okunamadığını söyler.
 */
function oku(kok) {
  const yol = path.join(kok, ANAHTAR_ADI)
  let ham
  try {
    ham = fs.readFileSync(yol, 'utf8')
  } catch (e) {
    return { durum: 'ACIK', yol, okundu: false, sebep: `anahtar dosyasi okunamadi (${e.code || 'hata'})` }
  }
  let veri
  try {
    veri = JSON.parse(ham)
  } catch (e) {
    return { durum: 'ACIK', yol, okundu: false, sebep: `anahtar JSON bozuk: ${e.message}` }
  }
  const d = veri && veri.durum
  if (!DURUMLAR.includes(d)) {
    return {
      durum: 'ACIK',
      yol,
      okundu: false,
      sebep: `durum taninmiyor: ${JSON.stringify(d)} (beklenen: ${DURUMLAR.join(' | ')})`,
    }
  }
  return { durum: d, yol, okundu: true, sebep: '' }
}

/**
 * Kapılar için kısa cevap: uyku kipinde miyiz?
 *
 * ⚠Bunu "borç yok" diye OKUMA. `true` yalnız *"bu borcu şu an kimse kapatamaz, o yüzden
 * bloklamak cezalandırmaktır"* demektir. Borç sayılmaya ve adlarıyla raporlanmaya devam
 * eder — kapı susmaz, yalnız durdurmaz.
 */
function uykudaMi(kok) {
  return oku(kok).durum === 'KAPALI'
}

/**
 * Rapor satırı — kapılar ve pano AYNI cümleyi buradan alır, kendileri yazmaz (§26).
 * İki metin ayrışırsa hangisinin hüküm olduğu belirsizleşir.
 */
function durumSatiri(kok) {
  const a = oku(kok)
  if (!a.okundu) {
    return `[tasiyici] ANAHTAR OKUNAMADI (${a.sebep}) — fail-closed: ACIK varsayildi, kapilar BLOKLUYOR. Duzelt: ${a.yol}`
  }
  return a.durum === 'KAPALI'
    ? '[tasiyici] UYKU KIPI (KAPALI) — companion URETILMEZ; kapilar SAYAR + RAPORLAR, BLOKLAMAZ. Borc silinmedi, ertelendi.'
    : '[tasiyici] ACIK — companion uretimi calisir; kapilar bloklar.'
}

module.exports = { oku, uykudaMi, durumSatiri, ANAHTAR_ADI, DURUMLAR }
