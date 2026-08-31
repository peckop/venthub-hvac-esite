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
 * Escapes and quotes a raw string value to be safely embedded within a PostgREST filter grammar.
 *
 * This function wraps the value in double quotes and escapes existing backslashes and double quotes,
 * ensuring that characters like commas (`,`) inside the value are not interpreted as PostgREST `or()`
 * condition separators. Note: SQL `LIKE` wildcards (`%` and `_`) are intentionally left unescaped
 * to preserve expected search behavior.
 *
 * @param raw - The raw user input string to be escaped
 * @returns The safely quoted string ready for PostgREST filter grammar
 *
 * @example
 * quoteFilterValue('hello,world') // returns '"hello,world"'
 * quoteFilterValue('test"value') // returns '"test\"value"'
 */
export function quoteFilterValue(raw: string): string {
  const escaped = raw.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `"${escaped}"`
}

/**
 * Generates a PostgREST `ilike` condition string for a given column and search term.
 *
 * The term is automatically wrapped in `%` wildcards and safely quoted to prevent grammar injection.
 *
 * @param column - The database column name to filter against
 * @param term - The search term provided by the user
 * @returns The formatted PostgREST condition string (e.g., `column.ilike."%term%"`)
 *
 * @example
 * ilikeContains('email', 'john.doe') // returns 'email.ilike."%john.doe%"'
 */
export function ilikeContains(column: string, term: string): string {
  return `${column}.ilike.${quoteFilterValue(`%${term}%`)}`
}

/**
 * Generates a PostgREST `eq` (equals) condition string for a given column and exact value.
 *
 * The value is safely quoted to prevent grammar injection.
 *
 * @param column - The database column name to filter against
 * @param value - The exact value to match
 * @returns The formatted PostgREST condition string (e.g., `column.eq."value"`)
 *
 * @example
 * eqValue('status', 'active') // returns 'status.eq."active"'
 */
export function eqValue(column: string, value: string): string {
  return `${column}.eq.${quoteFilterValue(value)}`
}

/**
 * Generates a combined PostgREST condition string for performing an `ilike` search across multiple columns.
 *
 * Combines multiple `ilikeContains` conditions with commas, creating a single string
 * suitable for use inside a PostgREST `or()` filter. Column names are expected to be
 * hardcoded or safely provided by the system, not user input.
 *
 * @param columns - An array of database column names to search within
 * @param term - The user search term to look for in any of the specified columns
 * @returns A comma-separated string of conditions ready for PostgREST's `.or()` method
 *
 * @example
 * orIlikeContains(['name', 'email'], 'john')
 * // returns 'name.ilike."%john%",email.ilike."%john%"'
 */
export function orIlikeContains(columns: readonly string[], term: string): string {
  return columns.map((column) => ilikeContains(column, term)).join(',')
}

/**
 * Joins an array of arbitrary PostgREST conditions into a single string for an `or()` filter.
 *
 * @param conditions - An array of pre-formatted PostgREST condition strings
 * @returns A comma-separated string of conditions ready for PostgREST's `.or()` method
 *
 * @example
 * orConditions(['status.eq."active"', 'role.eq."admin"'])
 * // returns 'status.eq."active",role.eq."admin"'
 */
export function orConditions(conditions: readonly string[]): string {
  return conditions.join(',')
}
