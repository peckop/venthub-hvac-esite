/**
 * İçe aktarma DOSYA KAPISI — ADM-6. Cetvel: csv-import-export-standard.md §1.2.
 *
 * NİÇİN: içe aktarıcılarda `<input accept=".csv">` dışında denetim yoktu. `accept` yalnız
 * tarayıcı ipucudur (dosya seçicide "tüm dosyalar" ile aşılır). Boyut ve satır sınırı yoktu:
 * çok büyük dosya sekmeyi kilitler, binlerce SKU sunucuya tek seferde gider.
 *
 * SINIR: bu kapı İSTEMCİDEDİR, yani güvenlik sınırı değil, hata ve kaza önleyicidir. Yazma
 * yetkisinin kararını veritabanı verir (RLS + `adjust_stock` içindeki rol denetimi).
 */
import { type AyristirmaHatasi, type AyristirmaSonucu,csvAyristir } from './ayristir'

/** Tek dosya üst boyutu. Sınır cetvelde (§1.2); değiştirilirse cetvel de değişir. */
export const CSV_MAKS_BAYT = 5 * 1024 * 1024
/** Tek dosyada en çok veri satırı (başlık hariç). Aşan dosya bölünerek yüklenir. */
export const CSV_MAKS_SATIR = 5000

export type DosyaHatasi = 'uzanti' | 'tur' | 'boyut' | 'bos'
export type CsvOkumaHatasi = DosyaHatasi | AyristirmaHatasi

/**
 * Tarayıcının CSV için bildirdiği türler. Boş tür (bazı işletim sistemleri bildirmez) ve
 * Windows'un `application/vnd.ms-excel`'i kabul edilir; ikili türler reddedilir.
 */
const IZINLI_TURLER: ReadonlySet<string> = new Set([
  '',
  'text/csv',
  'text/plain',
  'text/x-csv',
  'application/csv',
  'application/vnd.ms-excel',
])

export interface DosyaBilgisi {
  name: string
  size: number
  type: string
}

export function csvDosyasiDenetle(dosya: DosyaBilgisi): DosyaHatasi | null {
  if (!/\.csv$/i.test(dosya.name)) return 'uzanti'
  if (!IZINLI_TURLER.has(dosya.type.toLowerCase())) return 'tur'
  if (dosya.size === 0) return 'bos'
  if (dosya.size > CSV_MAKS_BAYT) return 'boyut'
  return null
}

export type CsvOkumaSonucu = Extract<AyristirmaSonucu, { ok: true }> | { ok: false; hata: CsvOkumaHatasi }

/** Kapı + okuma + ayrıştırma. Kapıdan geçmeyen dosya OKUNMAZ. */
export async function csvDosyasiOku(dosya: File, maksSatir: number = CSV_MAKS_SATIR): Promise<CsvOkumaSonucu> {
  const hata = csvDosyasiDenetle(dosya)
  if (hata) return { ok: false, hata }
  return csvAyristir(await dosya.text(), { maksSatir })
}

/** Hata kodu → sözlük anahtarı (`admin.dataTable.csvImport.*`, TR/EN). */
export const CSV_HATA_ANAHTARI: Readonly<Record<CsvOkumaHatasi, string>> = {
  uzanti: 'admin.dataTable.csvImport.wrongExtension',
  tur: 'admin.dataTable.csvImport.wrongType',
  boyut: 'admin.dataTable.csvImport.fileTooLarge',
  bos: 'admin.dataTable.csvImport.empty',
  cokSatir: 'admin.dataTable.csvImport.tooManyRows',
  kapanmamisTirnak: 'admin.dataTable.csvImport.unclosedQuote',
  tekrarBaslik: 'admin.dataTable.csvImport.duplicateHeader',
}
