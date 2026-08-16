import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Locale'siz /auth/callback giriş noktası.
 *
 * Supabase redirectTo hedefleri ve Google OAuth dönüşü locale'siz /auth/callback'e iner;
 * middleware bu yolu bilerek locale enjeksiyonundan muaf tutar (isAuthApi). Sayfa ise yalnız
 * /[lang]/auth/callback'te yaşar — bu handler olmadan dönüş 404'tür. Query string (?code=,
 * ?next=, ?error=) AYNEN korunur; hash fragment'i tarayıcı yönlendirmede kendisi taşır
 * (Location'da fragment yoksa mevcut fragment korunur).
 */
export function GET(request: NextRequest) {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  const locale =
    cookieLocale === 'tr' || cookieLocale === 'en'
      ? cookieLocale
      : (request.headers.get('accept-language') || '').toLowerCase().includes('en')
        ? 'en'
        : 'tr'

  const url = request.nextUrl.clone()
  url.pathname = `/${locale}/auth/callback`
  return NextResponse.redirect(url, 307)
}
