/**
 * identity-fix.mjs — Ö4: manifest iç tutarlılığı (DB'ye hiç gitmeden). Ayrı modül, çünkü
 * betik açılışta ağa çıkıyor ve kuralları test edilemiyordu; 2026-09-22'de harfli model_code'lu
 * ilk ürün (VRT-253490106XN) büyük/küçük harf kusurunu ancak canlı kuru koşumda gösterdi.
 * Test: scripts/db/product-data/__tests__/identity-fix-kurallar.test.ts
 */
export function manifestIhlalleri(items) {
  const violations = []
  for (const it of items) {
    // Önek MEVCUT SKU'dan okunur (REC-186, 2026-09-22): betik ilk kez AVenS için yazılmıştı ve
    // 'AVE-' sabitti — NIC-11921 gibi başka markanın satırı Ö4'te haksız yere düşüyordu.
    // Kural gevşemedi: marka değişemez, yalnız aynı markanın öneki beklenir.
    const onek = String(it.current_sku).split('-')[0]
    const beklenen = `${onek}-${it.next_model_code}`
    if (it.next_sku !== beklenen) violations.push(`${it.current_sku}: next_sku "${it.next_sku}" != "${beklenen}" (degismez ihlali)`)
    if (it.katalog_kod !== it.next_model_code) violations.push(`${it.current_sku}: katalog_kod "${it.katalog_kod}" != next_model_code "${it.next_model_code}"`)
    // slug KÜÇÜK harf, model_code harf içerebilir ('253490106XN' → '-253490106xn'); büyük/küçük harf
    // duyarlı karşılaştırma harfli her kodu yanlış yere takardı.
    if (!it.next_slug.endsWith(`-${String(it.next_model_code).toLowerCase()}`)) violations.push(`${it.current_sku}: next_slug "${it.next_slug}" model_code ile bitmiyor (kurulu kalip)`)
  }
  return violations
}
