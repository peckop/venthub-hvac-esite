#!/usr/bin/env node
/**
 * ŞERİT → PENCERE ADI tablosu — TEK KAYNAK (REC-525, 2026-09-30).
 *
 * NİÇİN AYRI MODÜL: pencere adını SessionStart kancası (`.claude/hooks/session-board.cjs`, `sessionTitle`) verir;
 * ama aynı eşlemeye başka üreticiler de (rol-karti-uret vb.) ihtiyaç duyabilir. Tablo kancanın içine gömülürse
 * her tüketici kendi kopyasını yazar ve kopyalar ayrışır. Burası kaynak; tüketen `require` eder.
 *
 * NEDEN İNSAN ADI: Recep pencereleri elle "Ops", "Yetenek", "Harita", "Araç" diye adlandırdı (2026-09-30). Panodaki
 * yazım büyük harfli ve ASCII'dir (ARAC, URUN); pencereye çıplak yazılırsa Recep'in kullandığı adla eşleşmez.
 *
 * BİLİNEN SINIR: kanca pencerenin o an ELLE verilmiş adını göremez (adı okumak `claude agents` çağrısı ister, kanca
 * yavaşlar). Elle verilen ad tablodaki değerle aynıysa sonuç aynıdır; farklıysa (örn. "Araç-2") sonraki açılışta
 * (startup/resume/fork) kanca tablodaki adı yazar. clear/compact'ta alan hiç gönderilmez, ad korunur.
 *
 * Kullanım: `require('./pencere-adlari.cjs').ad('ARAC')` → 'Araç'. Bilinmeyen/bozuk girdi → '' (çağıran alanı EKLEMEZ).
 */

/** Pano şerit adı (büyük harf, ASCII) → pencere adı. Yeni şerit için satır BURAYA eklenir. */
const TABLO = Object.freeze([
  Object.freeze(['ARAC', 'Araç']),
  Object.freeze(['HARITA', 'Harita']),
  Object.freeze(['OPS', 'Ops']),
  Object.freeze(['YETENEK', 'Yetenek']),
  Object.freeze(['URUN', 'Ürün']),
  Object.freeze(['ALTYAPI', 'Altyapı']),
  Object.freeze(['ADMIN', 'Admin']),
  Object.freeze(['GEO-SEO', 'Geo-SEO']),
])

/** Aramalar Map üzerinden yapılır (nesne prototipi adlarına karşı ek güvence; anahtarlar zaten büyük harf). */
const PENCERE_ADLARI = new Map(TABLO)

const AD_TAVAN = 60
/** board.cjs'in adsız talep için yazdığı yer tutucu — gerçek bir şerit adı değildir. */
const YER_TUTUCU = 'lane'

/** Kontrol karakterlerini (C0 + DEL) boşluğa çevirir; regex yerine kod noktası taraması (lint kuralı: kontrol-regex yasak). */
function kontrolTemizle(metin) {
  let out = ''
  for (const ch of metin) {
    const k = ch.codePointAt(0)
    out += k < 0x20 || k === 0x7f ? ' ' : ch
  }
  return out
}

/**
 * Şerit adından pencere adı.
 *  · string değil / boş / yer tutucu → '' (alan eklenmez; bozuk kayıt pencereyi yanlış adlandırmaz);
 *  · kontrol karakterleri atılır, 60 karaktere kısaltılır;
 *  · tabloda varsa tablodaki ad (büyük/küçük harfe duyarsız);
 *  · yoksa ilk harf büyük, kalanı küçük — Türkçe karakter ÜRETİLMEZ, tahmin yok ("GORSEL" → "Gorsel", tabloya satır
 *    eklenene kadar). Hata → '' (fail-open).
 */
function ad(serit) {
  try {
    if (typeof serit !== 'string') return ''
    const ham = kontrolTemizle(serit).replace(/\s+/g, ' ').trim().slice(0, AD_TAVAN).trim()
    if (!ham || ham === YER_TUTUCU) return ''
    const tablo = PENCERE_ADLARI.get(ham.toUpperCase())
    if (tablo) return tablo
    return ham.charAt(0).toUpperCase() + ham.slice(1).toLowerCase()
  } catch {
    return ''
  }
}

module.exports = { ad, TABLO, PENCERE_ADLARI, AD_TAVAN }
