/**
 * CSV hücre kaçışı + formül enjeksiyonu nötrlemesi (VULN-006, REC-355).
 * Cetvel: docs/standards/csv-import-export-standard.md §1.1.
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

/** Tek CSV hücresi: gerekirse tek tırnak önekli, `"` → `""` kaçışlı, çift tırnaklı. */
export function csvHucre(deger: CsvDeger): string {
  const metin = metneCevir(deger)
  // Sayı tipi kesin sayıdır: `-5` formül değil; metne çevrilince önek almasın.
  const guvenli = typeof deger !== 'number' && formulMu(metin) ? `'${metin}` : metin
  return `"${guvenli.replace(/"/g, '""')}"`
}

/** Tek CSV satırı. Ayraç çağıranın seçimidir (`,` ya da `;`); davranış sayfalar arasında korunur. */
export function csvSatir(hucreler: readonly CsvDeger[], ayrac: ',' | ';' = ','): string {
  return hucreler.map(csvHucre).join(ayrac)
}
