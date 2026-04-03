import { Routes } from './utils/routes'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME } from './config/admin'

/**
 * Edge Middleware — İki Sorumluluk:
 * 1. UUID tabanlı /products/[uuid] → slug canonical URL 308 SEO yönlendirmesi
 * 2. /admin/* yolları için JWT + Rol doğrulaması (Server-side RBAC Guard)
 */
export const config = {
  matcher: ['/products/:path*', '/admin/:path*']
}

// ── Sabit Tanımlar ──────────────────────────────────────────────────────────
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Admin paneline erişebilecek roller (JWT Claims tabanlı)
const ADMIN_ROLES = new Set(['super_admin', 'admin', 'moderator', 'warehouse', 'sales', 'viewer'])

// ── Ana Middleware ───────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const segments = pathname.split('/').filter(Boolean)

  // ── Kol 1: UUID → Slug SEO Yönlendirmesi (/products/...) ────────────────
  if (segments.length === 2 && segments[0] === 'products') {
    const identifier = segments[1]

    if (UUID_REGEX.test(identifier)) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (supabaseUrl && anonKey) {
        try {
          const res = await fetch(
            `${supabaseUrl}/rest/v1/products?id=eq.${identifier}&select=slug`,
            {
              method: 'GET',
              headers: {
                apikey: anonKey,
                Authorization: `Bearer ${anonKey}`,
                'Content-Type': 'application/json',
              },
            }
          )

          if (res.ok) {
            const data = await res.json() as Array<{ slug?: string }>
            if (data?.[0]?.slug) {
              const url = request.nextUrl.clone()
              url.pathname = Routes.product(data[0].slug)
              return NextResponse.redirect(url, 308)
            }
          }
        } catch (error) {
          console.error('[Middleware] UUID Slug Lookup Hatası:', error)
        }
      }
    }

    return NextResponse.next()
  }

  // ── Kol 2: Admin RBAC Guard (/admin/...) ────────────────────────────────
  if (segments[0] === 'admin') {
    // Development ortamında localhost'ta kilitlenmemek için bypass
    const host = request.headers.get('host') || ''
    const isDev = process.env.NODE_ENV === 'development'
    const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1')

    if (isDev && isLocalhost) {
      return NextResponse.next()
    }

    // 1. Cookie'den access token'ı oku
    const cookieHeader = request.cookies.get(AUTH_COOKIE_NAME)?.value

    if (!cookieHeader) {
      // Oturum yok — login sayfasına yönlendir
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/auth/login'
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl, 302)
    }

    // Cookie değeri JSON array olabilir: ["access_token"]
    let accessToken: string | null = null
    try {
      const parsed = JSON.parse(cookieHeader) as unknown
      if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
        accessToken = parsed[0] as string
      } else if (typeof parsed === 'string') {
        accessToken = parsed
      }
    } catch {
      // Parse başarısız → ham değeri kullan
      accessToken = cookieHeader
    }

    if (!accessToken) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/auth/login'
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl, 302)
    }

    // 2. Güvenli Auth Kontrolü (Supabase /auth/v1/user Fetch - JWT Kimlik Kartı Okuma)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !anonKey) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/auth/login'
      return NextResponse.redirect(loginUrl, 302)
    }

    let userId: string | undefined;
    let jwtRole: string | undefined;

    try {
      const authRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'GET',
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(3000),
      })

      if (!authRes.ok) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/auth/login'
        loginUrl.searchParams.set('from', pathname)
        loginUrl.searchParams.set('reason', 'expired')
        return NextResponse.redirect(loginUrl, 302)
      }

      const authData = await authRes.json()
      userId = authData?.id
      // JWT user_metadata içindeki role damgasını (Claim) okuyoruz
      jwtRole = authData?.user_metadata?.role
    } catch {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/auth/login'
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl, 302)
    }

    if (!userId) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/auth/login'
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl, 302)
    }

    // 3. Rol kontrolü: Basılı Kimlik Kartı (JWT Claim) Üzerinden Yapılır
    let hasAccess = false

    if (jwtRole && ADMIN_ROLES.has(jwtRole.toLowerCase())) {
      hasAccess = true
    }

    if (!hasAccess) {
      // Yetkisiz — 403 benzeri: ana sayfaya yönlendir
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = '/'
      homeUrl.searchParams.set('auth_error', 'unauthorized')
      return NextResponse.redirect(homeUrl, 302)
    }

    // Yetkili geçiş — isteği normal akışa bırak
    return NextResponse.next()
  }

  return NextResponse.next()
}
