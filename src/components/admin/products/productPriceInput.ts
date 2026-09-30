/**
 * Ürün fiyat panelinin GİRDİ yardımcıları (REC-412 Faz 2a) — saf, React'siz, testlenebilir.
 * Cetvel: docs/standards/pricing-standard.md §12.1 (tek ürün fiyat girişi sözleşmesi).
 */

/**
 * Kullanıcının yazdığı tutarı sayıya çevirir; anlaşılmayan girdide null.
 *
 * Kabul edilenler (TR-öncelikli yönetici paneli): `2400` · `2400.50` · `2400,50` · `2.400,50` · `2.400` (binlik) ·
 * `₺ 2 400,50`. Belirsiz olan TEK biçim `2.400`: Türkçede binlik ayracı, İngilizcede ondalık — burada binlik sayılır
 * (yalnız noktadan sonra TAM 3 hane varsa). `2.4` ve `2.45` ondalıktır. Sıfır/negatif/sonsuz ayrıca `isValidFixedPriceAmount`
 * ile reddedilir; bu işlev yalnız BİÇİMİ çözer.
 */
export function parseAmountInput(raw: string): number | null {
  const temiz = raw.replace(/[₺\s]|TL/gi, '')
  if (temiz === '') return null

  let normal: string
  if (temiz.includes(',')) {
    // Virgül ondalıktır; noktalar binliktir. İkinci bir virgül anlaşılmaz girdidir.
    if (temiz.split(',').length > 2) return null
    normal = temiz.replace(/\./g, '').replace(',', '.')
  } else if (/^\d{1,3}(\.\d{3})+$/.test(temiz)) {
    normal = temiz.replace(/\./g, '')
  } else {
    normal = temiz
  }

  if (!/^\d+(\.\d+)?$/.test(normal)) return null
  const sayi = Number(normal)
  return Number.isFinite(sayi) ? sayi : null
}

/** "Girilen tutar KDV dahil mi?" seçiminin tarayıcıda saklandığı anahtar (kullanıcının SON seçimi, plan §5.1). */
export const VAT_PREFERENCE_KEY = 'venthub.admin.productPrice.vatIncluded'

/**
 * Son seçimi okur; yoksa/okunamazsa (özel pencere, engelli site verisi, SSR) `true` (KDV dahil) döner: ürün tablosu
 * fiyatı KDV dahil gösterir. Yalnız TERCİH saklanır, hiçbir fiyat/gizli veri değil.
 */
export function readVatIncludedPreference(): boolean {
  try {
    const value = window.localStorage.getItem(VAT_PREFERENCE_KEY)
    return value === null ? true : value === 'true'
  } catch {
    return true
  }
}

export function writeVatIncludedPreference(vatIncluded: boolean): void {
  try {
    window.localStorage.setItem(VAT_PREFERENCE_KEY, String(vatIncluded))
  } catch {
    // Saklanamazsa panel yine çalışır; tercih yalnız bir kolaylıktır.
  }
}
