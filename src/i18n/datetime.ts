export function formatDateTime(input: string | number | Date, lang: 'tr' | 'en', options: Intl.DateTimeFormatOptions = {}) {
  try {
    const locale = lang === 'tr' ? 'tr-TR' : 'en-US'
    const date = input instanceof Date ? input : new Date(input)
    const opts: Intl.DateTimeFormatOptions = {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
      ...options
    }
    return new Intl.DateTimeFormat(locale, opts).format(date)
  } catch {
    try { return String(input) } catch { return '' }
  }
}

export function formatDate(input: string | number | Date, lang: 'tr' | 'en', options: Intl.DateTimeFormatOptions = {}) {
  return formatDateTime(input, lang, { hour: undefined, minute: undefined, second: undefined, ...options })
}

export function formatTime(input: string | number | Date, lang: 'tr' | 'en', options: Intl.DateTimeFormatOptions = {}) {
  try {
    const locale = lang === 'tr' ? 'tr-TR' : 'en-US'
    const date = input instanceof Date ? input : new Date(input)
    const opts: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      ...options
    }
    return new Intl.DateTimeFormat(locale, opts).format(date)
  } catch {
    try { return String(input) } catch { return '' }
  }
}
