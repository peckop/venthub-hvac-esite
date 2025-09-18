export function formatCurrency(value: number, lang: 'tr' | 'en', options: Intl.NumberFormatOptions = {}) {
  try {
    const locale = lang === 'tr' ? 'tr-TR' : 'en-US'
    const currency = 'TRY' // Sistem fiyatları TRY, dili sadece format için kullanıyoruz
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2, ...options }).format(value)
  } catch {
    // Fallback
    return '₺' + String(Math.round(value))
  }
}
