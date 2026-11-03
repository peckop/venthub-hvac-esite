/**
 * CSV hücre kaçışı + formül enjeksiyonu nötrlemesi (VULN-006, REC-355).
 * Cetvel: docs/standards/csv-import-export-standard.md §1.1.
 * Yer: `src/lib/csv/` — ADM-6'da `src/utils/csvHucre.ts`'ten taşındı; dışa/içe aktarmanın tek kapısı.
 *
 * NİÇİN: bir hücre `= + - @ TAB CR` ile başlarsa tablolama yazılımı onu FORMÜL sayar. Müşterinin
 * kayıtta yazdığı ad ya da istemciden gelen bir hata mesajı yönetici Excel'de CSV'yi açtığında
 * çalışabilir (veri sızdırma, yönlendirme). Nötrleme ÇIKIŞTA yapılır; veritabanındaki ham değer
 * bozulmaz.
 *
 * KARAR ÖLÇÜTÜ: ilk karakter NFKC ile normalize edilip bakılır (tam genişlikli `＝ ＋ － ＠` da
 * yakalanır); normalize edilmiş hâl ÇIKTIYA yazılmaz, yalnız karar içindir.
 * SAYI/TARİH DEĞİŞMEZ: `number` tipi olduğu gibi yazılır; yalnız rakamlardan oluşan metin
 * (`-12,50`, `+905551112233`, `-1.234,5`) formül olamayacağı için önek almaz.
 * Her hücre çift tırnaklıdır (mevcut dışa aktarımlarla bayt uyumu).
 */

export type CsvDeger = string | number | boolean | Date | null | undefined

/** Tablolama yazılımının formül saydığı başlangıç karakterleri (OWASP CSV Injection). */
const FORMUL_BASLANGICI: ReadonlySet<string> = new Set(['=', '+', '-', '@', '\t', '\r'])

/** Yalnız işaret + rakam + ayraçlardan oluşan metin: formül DEĞİL, sayıdır (örn. `-12,50`). */
const SAYI_GIBI = /^[+-]?\d[\d.,]*$/

function metneCevir(deger: CsvDeger): string {
  if (deger === null || deger === undefined) return ''
  if (typeof deger === 'number') return Number.isFinite(deger) ? String(deger) : ''
  if (deger instanceof Date) return Number.isNaN(deger.getTime()) ? '' : deger.toISOString()
  return String(deger)
}

/** Metin bir formül gibi yorumlanabilir mi? (Sayı gibi görünen metin formül değildir.) */
export function formulMu(metin: string): boolean {
  if (metin === '' || SAYI_GIBI.test(metin)) return false
  return FORMUL_BASLANGICI.has(metin.normalize('NFKC').charAt(0))
}

/**
 * Metin önek almalı mı? Formülse evet. Ayrıca `'` + (önek alacak metin) ise de evet (ADM-7):
 * yoksa özgün `'=x` ile nötrlenmiş `=x` çıktıda aynı (`'=x`) olur ve içe aktarma ikisini
 * ayıramaz. Bu ek kural yalnız ÖNEK EKLER; formül kararını gevşetmez.
 */
function onekGerekli(metin: string): boolean {
  if (formulMu(metin)) return true
  let i = 0
  while (metin.charAt(i) === "'") i++
  return i > 0 && formulMu(metin.slice(i))
}

/**
 * Hücrenin nötrlenmiş METNİ (tırnaksız). CSV ve XLS aynı kararı buradan alır.
 * Sayı tipi kesin sayıdır: `-5` formül değil; metne çevrilince önek almasın.
 */
export function notrMetin(deger: CsvDeger): string {
  const metin = metneCevir(deger)
  return typeof deger !== 'number' && onekGerekli(metin) ? `'${metin}` : metin
}

/**
 * `notrMetin`'in tersi — içe aktarma (ADM-7). Önek YALNIZ nötrlemenin koyacağı yerde düşer:
 * `'- Fan` → `- Fan`, ama elle yazılmış `'abc` ya da `'-12,50` olduğu gibi kalır.
 * Her metin için `notrlemeyiGeriAl(notrMetin(x)) === x`. Veritabanına giden ham değer budur;
 * yeniden dışa aktarılınca `notrMetin` öneki yine koyar (koruma çıkıştadır, §1.1).
 */
export function notrlemeyiGeriAl(metin: string): string {
  return metin.charAt(0) === "'" && onekGerekli(metin.slice(1)) ? metin.slice(1) : metin
}

/** Tek CSV hücresi: gerekirse tek tırnak önekli, `"` → `""` kaçışlı, çift tırnaklı. */
export function csvHucre(deger: CsvDeger): string {
  return `"${notrMetin(deger).replace(/"/g, '""')}"`
}

/** Tek CSV satırı. Ayraç çağıranın seçimidir (`,` ya da `;`); davranış sayfalar arasında korunur. */
export function csvSatir(hucreler: readonly CsvDeger[], ayrac: ',' | ';' = ','): string {
  return hucreler.map(csvHucre).join(ayrac)
}
