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
 * ELLE VERİLMİŞ AD: kanca SessionStart girdisindeki `session_title` alanını okur (belge: başlık zaten ayarlıysa —
 * --name ya da /rename — dolu gelir). Kural: alan BOŞSA ya da tablodaki adla AYNI ise (`ayniMi`: harf ve Türkçe harf
 * farksız, "Araç" = "arac" = "ARAÇ") kanca `sessionTitle`'ı KANONİK biçimle yazar — restart/resume'da harness
 * dökümdeki adı geri yüklemiyor ve pid kaydına türetilmiş ad yazıyor; aynı değeri yazmak sonucu değiştirmez, kaydı
 * düzeltir. FARKLI ve dolu bir ad (Recep'in verdiği başka ad) EZİLMEZ. Bu modül "şerit adından ad" hesabı ve
 * karşılaştırma katlamasıdır; ezme/çakışma kararları kancadadır (`pencereAdiKarari`).
 * clear/compact'ta alan hiç gönderilmez, ad korunur.
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
  Object.freeze(['BLOG', 'Blog']),
  // ARC-61 (HRT-29 ölçümü, 2026-10-05): rol kartı olup tabloda olmayan yedi departman `departman-ac` ile açılamıyordu ("rol taninmiyor").
  // Anahtar = docs/roller/<ROL>.md dosya adı (ASCII, büyük harf); görünen ad = Recep'in kullandığı insan adı. Tablo ile rol kartları
  // arasındaki farkı `src/__tests__/conformance/departman-ac-kapat.test.ts` (INV-DEPARTMAN-AC-9) kırmızıyla gösterir.
  Object.freeze(['TASARIM', 'Tasarım']),
  Object.freeze(['SATIS', 'Satış']),
  Object.freeze(['MARKA', 'Marka']),
  Object.freeze(['KATALOG', 'Katalog']),
  Object.freeze(['EDGE', 'Edge']),
  Object.freeze(['I18N', 'I18N']),
  Object.freeze(['MEVZUAT', 'Mevzuat']),
  // HRT-35 (karar 322, OPS-93, 2026-10-09): TAKİP departmanı etkin. MÜHENDİSLİK planlı ve kapalıdır (karar 315, ad kesinleşmedi): tabloya girmez.
  Object.freeze(['TAKIP', 'Takip']),
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
    // NFC: ayrık (birleştirici işaretli) yazım tek karaktere iner. Kesme KOD NOKTASINA göredir: UTF-16 ortasından
    // kesmek yetim vekil (surrogate) bırakırdı.
    const ham = Array.from(kontrolTemizle(serit.normalize('NFC')).replace(/\s+/g, ' ').trim())
      .slice(0, AD_TAVAN).join('').trim()
    if (!ham || ham === YER_TUTUCU) return ''
    const tablo = PENCERE_ADLARI.get(ham.toUpperCase())
    if (tablo) return tablo
    const [ilk, ...kalan] = Array.from(ham)
    // Kalan küçültülürken 'İ' önce 'i' yapılır: varsayılan toLowerCase 'İ' → 'i' + U+0307 (bozuk) üretir. ASCII 'I' → 'i'
    // kalır (tr kuralı 'ı' UYGULANMAZ: şerit adları ASCII'dir, ADMIN-CUSTOMER → Admin-customer; 'Admın' olmasın).
    return (ilk.toUpperCase() + kalan.join('').replace(/İ/g, 'i').toLowerCase()).normalize('NFC')
  } catch {
    return ''
  }
}

/** Birleştirici işaretler bloğu U+0300–U+036F (NFD sonrası aksanlar). Kod noktasından kurulur: kaynak ASCII kalır. */
const BIRLESTIRICI_ISARETLER = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g')

/**
 * Karşılaştırma katlaması: büyük/küçük harf ve Türkçe harf farkı yok sayılır ("Araç" = "arac" = "ARAÇ" = "ARAÇ ").
 * ı/İ → i; NFD ile aksanlar (ç ö ü ş ğ ...) atılır; küçük harf; baştaki/sondaki boşluk atılır. YALNIZ karşılaştırma içindir,
 * görünen ad üretmez (görünen ad `ad()` çıktısıdır).
 */
function katla(metin) {
  try {
    return String(metin)
      .replace(/ı/g, 'i')
      .normalize('NFD')
      .replace(BIRLESTIRICI_ISARETLER, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
  } catch {
    return ''
  }
}

/** İki ad katlanmış hâlde eşit mi (ikisi de boş DEĞİLSE). */
function ayniMi(a, b) {
  const x = katla(a)
  return x !== '' && x === katla(b)
}

module.exports = { ad, katla, ayniMi, TABLO, PENCERE_ADLARI, AD_TAVAN }
