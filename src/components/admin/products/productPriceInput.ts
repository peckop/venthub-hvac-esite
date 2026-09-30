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
 *
 * Virgüllü girdi YALNIZ TR biçimidir: `^\d+,\d{1,2}$` ya da binlik noktalı `^\d{1,3}(\.\d{3})+,\d{1,2}$` (kuruş en çok 2 hane).
 * İngilizce biçim (`1,500.00`) ve virgülden sonra 3+ hane (`1,500`) BELİRSİZDİR (1,5 mi 1500 mü) ve reddedilir: yanlış
 * okumak fiyatı 1000 kat kaydırırdı (güvenlik incelemesi #1); yönetici net yazmaya yönlendirilir.
 */
export function parseAmountInput(raw: string): number | null {
  const temiz = raw.replace(/[₺\s]|TL/gi, '')
  if (temiz === '') return null

  let normal: string
  if (temiz.includes(',')) {
    if (!/^(\d+|\d{1,3}(\.\d{3})+),\d{1,2}$/.test(temiz)) return null
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

/** Panelin kabul ettiği en küçük tutar (1 kuruş); altı motorda net ≤ 0 → fiyat üretilmez. */
export const MIN_PANEL_AMOUNT = 0.01

/**
 * Kayıtlı tutarı alana yazılacak TR biçimine çevirir (ondalık ayracı VİRGÜL, binlik ayracı yok). `String(123.456)` ham
 * hâliyle geri okununca "123456" olurdu (binlik kalıbı, 1000 kat; güvenlik incelemesi #2). 3+ ondalıklı kayıt virgüllü
 * yazılınca ayrıştırıcıda reddedilir: sessizce yanlış okunmak yerine yönetici kuruşa yuvarlamaya zorlanır.
 */
export function formatAmountForInput(amount: number): string {
  return String(amount).replace('.', ',')
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
