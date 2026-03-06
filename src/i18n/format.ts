export function formatCurrency(value: string | number, lang: 'tr' | 'en', options: Intl.NumberFormatOptions = {}) {
  try {
    const v = typeof value === 'string' ? Number(value) : value
    if (isNaN(v)) return '0 ₺'

    const locale = lang === 'tr' ? 'tr-TR' : 'en-US'
    const currency = 'TRY'
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2, ...options }).format(v)
  } catch {
    return '₺' + String(Math.round(Number(value) || 0))
  }
}



