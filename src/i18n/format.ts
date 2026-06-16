import { Lang } from './I18nContext'

export function formatCurrency(value: string | number, lang: Lang, options: Intl.NumberFormatOptions = {}) {
  try {
    const v = typeof value === 'string' ? Number(value) : value
    if (isNaN(v)) return lang === 'tr' ? '0 ₺' : '$0'

    const locale = lang === 'tr' ? 'tr-TR' : 'en-US'
    // İkili Strateji: options.currency varsa kullan, yoksa dile göre fallback (en -> USD, tr -> TRY)
    const currency = options.currency || (lang === 'en' ? 'USD' : 'TRY')
    
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2, ...options }).format(v)
  } catch {
    const symbol = lang === 'en' ? '$' : '₺'
    return symbol + String(Math.round(Number(value) || 0))
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



