/**
 * Dile duyarlı kasa (büyük/küçük harf) çevirimi ve arama katlama.
 *
 * NİÇİN VAR: JavaScript'in `toLowerCase()` / `toUpperCase()` metotları **locale'den
 * bağımsızdır**. Türkçe için ikisi de yanlış sonuç verir:
 *
 *   'İstanbul'.toLowerCase()  === 'i̇stanbul'   // i + AYRI birleşen nokta (U+0307)
 *   'SIĞINAK'.toLowerCase()   === 'siğinak'    // 'ı' değil 'i'
 *   'Sirkülasyon'.toUpperCase() === 'SIRKÜLASYON'  // 'İ' değil 'I'
 *
 * Sonuç sessizdir: kimse hata almaz, arama boş döner, ekranda yanlış harf basılır.
 *
 * NİÇİN `toLocaleLowerCase('tr')` DEĞİL: o çağrı ICU verisine bağlıdır ve ICU'suz
 * (small-icu) bir Node çalıştırmasında sessizce locale'siz davranışa düşer. Buradaki
 * eşleme ELLE yazılmıştır; hangi çalıştırmada olursa olsun aynı sonucu verir ve
 * kapı tarafından sınanabilir.
 *
 * Cetvel: docs/standards/i18n-localization-standard.md — eksen C
 */

/** Türkçe küçük harf: `İ → i`, `I → ı`. Kalan harfler locale-bağımsız kuralla iner. */
function trLower(value: string): string {
  return value.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase()
}

/** Türkçe büyük harf: `i → İ`, `ı → I`. Kalan harfler locale-bağımsız kuralla çıkar. */
function trUpper(value: string): string {
  return value.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase()
}

/**
 * Dile göre küçük harfe çevirir.
 * `lang` 'tr' ile başlıyorsa Türkçe kuralı, aksi halde locale-bağımsız kural uygulanır
 * (İngilizce için locale-bağımsız kural ZATEN doğrudur).
 */
export function localeLower(value: string, lang: string): string {
  return lang.startsWith('tr') ? trLower(value) : value.toLowerCase()
}

/** Dile göre büyük harfe çevirir. Bkz. {@link localeLower}. */
export function localeUpper(value: string, lang: string): string {
  return lang.startsWith('tr') ? trUpper(value) : value.toUpperCase()
}

/**
 * ARAMA/EŞLEŞTİRME için katlama — kasa **ve** aksan duyarsız.
 *
 * Yalnız kasayı düzeltmek müşterinin gerçek başarısızlığını yerinde bırakır: Türkçe
 * klavyesi olmayan (ya da açmayan) kullanıcı "siginak" yazar, ürün "Sığınak Fanı"dır
 * ve eşleşme yine olmaz. Bu yüzden arama yolunda aksanlar da düşürülür.
 *
 * YALNIZCA eşleştirme için kullanılır — EKRANA BASILMAZ (aksanı düşmüş metin yanlış
 * yazımdır). Ekran için `localeLower` / `localeUpper` kullan.
 *
 *   foldForSearch('Sığınak Fanı', 'tr')  === 'siginak fani'
 *   foldForSearch('İç Hava', 'tr')       === 'ic hava'
 */
export function foldForSearch(value: string, lang: string): string {
  return (
    localeLower(value, lang)
      // 'ı' ayrı bir harftir, NFD ile ayrışmaz — önce elle indirilir.
      .replace(/ı/g, 'i')
      // Kalan aksanlar (ç ğ ö ş ü ve yabancı aksanlar) birleşen işarete ayrılıp atılır.
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  )
}
