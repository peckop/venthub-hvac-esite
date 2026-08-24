/**
 * POSTGREST `or()` FİLTRESİ — KULLANICI METNİNİ GRAMERDEN AYIRAN TEK YER (T078-VH).
 *
 * ÖLÇÜLEN KUSUR (2026-08-17): admin tablolarının arama kutuları, kullanıcının yazdığı
 * metni doğrudan PostgREST filtre **grameri** içine gömüyordu:
 *
 *     query.or(`url.ilike.%${params.query}%,message.ilike.%${params.query}%`)
 *
 * Bu gramerde `,` koşulları AYIRIR, `.` kolon/operatör/değeri ayırır, `(` `)` gruplar.
 * Yani aramaya virgül yazan bir admin, filtrenin YAPISINI değiştiriyordu: kendi
 * yazdığı metnin bir parçası "yeni bir koşul" olarak okunuyordu.
 *
 * ŞİDDET — ABARTILMIYOR: RLS ayakta ve tablo dışına çıkılamaz. Beklenen sonuç
 * **kırık sorgu** ya da amaçlanmayan bir kolon koşuludur, veri sızıntısı DEĞİL.
 * Yine de kapatılır: hem kırık arama gerçek bir arızadır, hem de "kullanıcı metni
 * gramere gömülmez" kuralı sonradan daha tehlikeli bir yüzeye taşınmasın diye
 * TEK yerde yaşamalıdır.
 *
 * ÇÖZÜM: değer ÇİFT TIRNAK içine alınır (PostgREST'in ayrılmış karakter kaçışı) ve
 * tırnak içindeki `\` ile `"` ters bölü ile kaçırılır. Böylece metin ne kadar
 * "gramer gibi" görünürse görünsün TEK bir değer olarak okunur.
 *
 * ÖLÇÜLMEDİ — dürüst sınır: bu form canlı PostgREST'e karşı KOŞULMADI (prod'a sorgu
 * atılmadı); doğruluğu PostgREST'in belgelenmiş tırnak davranışına ve buradaki birim
 * testlerine dayanıyor. Güvenlik ağı şu: dört çağrı yerinin dördü de hata dalını
 * FIRLATIR — form yanlış olsaydı admin sessiz-yanlış sonuç değil, görünür hata alır.
 * (Yanlış-ama-gürültülü, yanlış-ve-sessizden iyidir.)
 *
 * YAPISAL ALTERNATİF (kapsam dışı, migration ister): `OrdersTableBody` bu sorunu hiç
 * yaşamıyor çünkü tek bir `search_text` kolonuna `ilike(kolon, deger)` ile soruyor —
 * orada değer PARAMETRE olarak gider, gramere hiç girmez. Diğer tablolara da böyle bir
 * kolon eklenirse bu yardımcıya gerek kalmaz. Kolon eklemek migration'dır (Recep kapısı).
 *
 * KAPSAM DIŞI: bu kuralın konformans bekçisi ve `resourceSearchers`/`CommandPalette`
 * göçü BU DOSYANIN sahibinde değil (T078'in kalanı; tek-yazar ilkesi).
 */

/**
 * Bir filtre değerini PostgREST için güvenli hâle getirir.
 *
 * `%` ve `_` BİLEREK dokunulmadan bırakılır: onlar SQL `LIKE` joker karakterleridir,
 * filtre grameri değil. Kaçırmak aramanın anlamını sessizce değiştirirdi (bugüne kadar
 * `%` yazan bir admin geniş eşleşme alıyordu; bu davranışı bu düzeltmenin yan etkisi
 * olarak değiştirmek, ölçülmemiş bir kararı gizlice almak olurdu).
 */
export function quoteFilterValue(raw: string): string {
  const escaped = raw.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `"${escaped}"`
}

/** `kolon.ilike."%terim%"` — "içerir" araması. */
export function ilikeContains(column: string, term: string): string {
  return `${column}.ilike.${quoteFilterValue(`%${term}%`)}`
}

/** `kolon.eq."değer"` — tam eşleşme. */
export function eqValue(column: string, value: string): string {
  return `${column}.eq.${quoteFilterValue(value)}`
}

/**
 * Birden çok kolonda "içerir" araması: `or()`'a verilecek tek dize.
 * Kolon adları KOD tarafından verilir (kullanıcı girdisi değil) — bu yüzden kaçırılmaz.
 */
export function orIlikeContains(columns: readonly string[], term: string): string {
  return columns.map((column) => ilikeContains(column, term)).join(',')
}

/** Farklı operatörlerden oluşan koşulları `or()` için birleştirir. */
export function orConditions(conditions: readonly string[]): string {
  return conditions.join(',')
}
