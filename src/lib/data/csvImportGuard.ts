/**
 * CSV içe aktarımı — bilinmeyen SKU ayrımı (saf).
 *
 * NİÇİN VAR (T148-VH çürütme turu, 2026-08-22):
 * Admin CSV içe aktarımı `upsert(..., { onConflict: 'sku' })` kullanıyor. `upsert` eşleşme
 * bulamazsa satırı **sessizce INSERT eder**. Yani bir kimlik düzeltmesinden ÖNCE alınmış
 * dışa aktarım dosyası sonradan yüklenirse, eski SKU'lar artık bulunamayacağı için **kopya
 * ürünler doğar** — ve ekranda "başarılı içe aktarım" yazar.
 *
 * Kusur bozuk görünmez; bugün ölçülen üç kusurun üçü de bu ailedendi (sözlükte sıfır giriş
 * "İngilizce ama düzgün" görünüyordu, yanlış birim "geçerli bir değer" görünüyordu, kopya
 * ürün "başarılı import" görünüyor). Bu yüzden karar kullanıcıya sorulur, tahmin edilmez:
 * iki meşru niyet vardır (yeni ürün eklemek / mevcutları güncellemek) ve hangisi olduğunu
 * yalnız kullanıcı bilir.
 */

export type SkuBearing = { sku?: string | null }

export type ImportSplit<T extends SkuBearing> = {
  /** DB'de karşılığı olan satırlar — güncelleme. */
  known: T[]
  /** DB'de karşılığı OLMAYAN satırlar — yazılırsa YENİ ürün olurlar. */
  unknown: T[]
  /** `unknown` satırların SKU'ları, sırayla ve tekilleştirilmiş (ekranda örnek göstermek için). */
  unknownSkus: string[]
}

/**
 * Payload'ları, DB'de var olan SKU kümesine göre ikiye ayırır.
 *
 * SKU'su boş/eksik olan satır **unknown** sayılır: "SKU'suz satır" bilinen bir ürüne
 * eşlenemez, dolayısıyla yazılırsa yeni kayıt üretir — sessizce known tarafına koymak
 * tam da kaçınmaya çalıştığımız hatayı üretirdi.
 */
export function splitByExistingSku<T extends SkuBearing>(
  payloads: readonly T[],
  existingSkus: ReadonlySet<string>
): ImportSplit<T> {
  const known: T[] = []
  const unknown: T[] = []
  const seen = new Set<string>()
  const unknownSkus: string[] = []

  for (const row of payloads) {
    const sku = typeof row.sku === 'string' ? row.sku.trim() : ''
    if (sku && existingSkus.has(sku)) {
      known.push(row)
      continue
    }
    unknown.push(row)
    if (sku && !seen.has(sku)) {
      seen.add(sku)
      unknownSkus.push(sku)
    }
  }

  return { known, unknown, unknownSkus }
}
