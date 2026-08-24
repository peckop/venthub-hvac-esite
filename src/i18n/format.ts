import { Lang } from './I18nContext'

/**
 * T094 · PARA BİRİMİ DİLDEN TÜRETİLEMEZ.
 *
 * YAŞANMIŞ KUSUR (Recep'in ekranında, 2026-08-18): **6.240 TRY**'lik bir sipariş, EN
 * arayüzde **$6,240** göründü. Sebep bu fonksiyondu — dil `en` ise para birimini `USD`
 * varsayıyordu. Dil, kullanıcının OKUMA TERCİHİDİR; paranın birimi ise VERİNİN bir
 * OLGUSUDUR. İkisini birbirine bağlamak, müşteriye yanlış fiyat göstermenin en kısa
 * yoludur ve hiçbir test bunu yakalamıyordu.
 *
 * ÜÇ DAL BİRDEN DİLDEN TÜRETİYORDU (biri düzeltilip ötekiler bırakılsaydı kusur yaşardı):
 *   1. `isNaN` dalı        → `lang === 'tr' ? '0 ₺' : '$0'`
 *   2. fallback            → `options.currency || (lang === 'en' ? 'USD' : 'TRY')`
 *   3. `catch` dalı        → `symbol = lang === 'en' ? '$' : '₺'`
 * Üçü de kaldırıldı.
 *
 * ÇÖZÜM TİP SEVİYESİNDEDİR, VARSAYILAN DEĞİL: `currency` artık ZORUNLU. Fonksiyonun
 * içine "yoksa TRY kullan" koymak kusuru bugün gizler, çok para birimli güne kadar
 * sessizce bekletirdi — bu deponun tekrar tekrar öğrendiği "uyar-geç = fail-open"
 * dersinin aynısı. Zorunlu argüman, eksik her çağrıyı DERLEME HATASINA çevirir;
 * yani kusur gözden kaçamaz.
 *
 * `lang` PARAMETRESİ KALIYOR ve yalnız BİÇİMLENDİRME içindir (ayraç/ondalık/simge
 * yerleşimi: `tr-TR` → `6.240,00 ₺` · `en-US` → `₺6,240.00`). Aynı miktar, aynı birim,
 * farklı okunuş — doğru olan budur.
 *
 * Bekçi: `src/__tests__/conformance/currency-not-from-language.test.ts` (INV-CURRENCY-1).
 */
export function formatCurrency(
  value: string | number,
  lang: Lang,
  options: Intl.NumberFormatOptions & { currency: string },
) {
  const { currency } = options
  const locale = lang === 'tr' ? 'tr-TR' : 'en-US'
  // `style`/`currency` EN SONA yazılır: çağıran `maximumFractionDigits` gibi biçim
  // ayarlarını geçersiz kılabilir ama para BİRİMİNİ kazara ezemez.
  const intlOptions: Intl.NumberFormatOptions = {
    maximumFractionDigits: 2,
    ...options,
    style: 'currency',
    currency,
  }
  try {
    const v = typeof value === 'string' ? Number(value) : value
    // Sayı çözülemese bile BİRİM veriden gelir — sıfırı da doğru birimde göster.
    if (isNaN(v)) return new Intl.NumberFormat(locale, intlOptions).format(0)

    return new Intl.NumberFormat(locale, intlOptions).format(v)
  } catch {
    // Son çare: `Intl` geçersiz bir birim kodu için fırlatabilir. Dile göre simge
    // UYDURMAK yasak — birimi olduğu gibi yaz, yanlış para birimi göstermektense
    // biçimsiz göstermek yeğdir.
    return `${Math.round(Number(value) || 0)} ${currency}`
  }
}

/**
 * Para-dışı düz sayıları (adet, hacim m³, hesaplama sonucu) aktif dile göre gruplar:
 * tr → 1.234,5 · en → 1,234.5. `value.toLocaleString('tr-TR')` gibi sabit-locale çağrılar
 * EN'de Türkçe biçim sızdırır; bu SSOT dil ile birlikte değişir. (Para için formatCurrency.)
 */
export function formatNumber(value: string | number, lang: Lang, options: Intl.NumberFormatOptions = {}) {
  try {
    const v = typeof value === 'string' ? Number(value) : value
    if (isNaN(v)) return '0'

    const locale = lang === 'tr' ? 'tr-TR' : 'en-US'
    return new Intl.NumberFormat(locale, options).format(v)
  } catch {
    return String(value)
  }
}



