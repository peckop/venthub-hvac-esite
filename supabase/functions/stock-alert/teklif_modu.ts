/**
 * TEKLİF MODU — stok uyarısının evren süzgeci (REC-376).
 *
 * Bu, `src/lib/pricing/quoteMode.ts` → `quoteModeHesapla`'nın edge tarafındaki AYNASIDIR; yeni bir kural değildir.
 * Edge (Deno) `src/` ağacını içe aktaramaz, bu yüzden hüküm burada aynı üç dalla yazılır ve
 * `src/__tests__/conformance/stok-uyari-teklif-paritesi.test.ts` iki fonksiyonu aynı doğruluk tablosunda
 * karşılaştırır: biri değişip diğeri değişmezse kapı KIRMIZI verir.
 *
 * NİÇİN: 2026-09-22 ölçümü — eşiğin altındaki 68 ürünün 68'i teklif modundaydı (müşteri "Teklif İste" görür,
 * stok takibi yapılmaz, stock_qty hep 0). Uyarı bunları ayırmadığı için Recep'e her gün 60 "KRİTİK: STOK
 * TÜKENDİ" e-postası gidiyor ve Resend günlük kotasının (100) %60'ını yiyordu.
 *
 * Girdi: ürünün AİLESİNİN ana kategorisi (`product_families.category_id` → `categories`, vitrinin `mainCategory`
 * çözümüyle aynı) ve vitrinin gösterdiği fiyat (`display_price(products)` — `get_family_detail`'in `price` alanı).
 * Bu dosya BİLEREK içe aktarım içermez (vitest de okuyabilsin diye).
 */
export interface TeklifModuGirdisi {
  /** Ana kategori; çözülemediyse null (vitrin bu durumda teklif moduna düşer). */
  kategori: { metadata: unknown } | null
  /** Vitrin fiyatı (`display_price`); yoksa null. */
  fiyat: number | string | null | undefined
}

export function teklifModundaMi({ kategori, fiyat }: TeklifModuGirdisi): boolean {
  // (1) Mod bilinmiyor → teklif modu.
  if (!kategori) return true
  // (2) Kategori açıkça fiyatı gizliyor.
  const metadata = kategori.metadata as { hide_price?: unknown } | null
  if (Boolean(metadata?.hide_price)) return true
  // (3) Gösterilecek geçerli bir fiyat yok.
  if (fiyat == null) return true
  return Number(fiyat) <= 0
}
