import { Routes } from './utils/routes'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Supabase yetkileri
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !anonKey) {
    return response
  }

  // ── Kol 1: UUID → Slug SEO Yönlendirmesi (/products/...) ────────────────
  if (segments.length === 2 && segments[0] === 'products') {
    const identifier = segments[1]

    if (UUID_REGEX.test(identifier)) {
      try {
        // CSR/Veri çekme işlemi: Read-only dummy cookie (SEO hızı için)
        const supabase = createServerClient(supabaseUrl, anonKey, {
          cookies: {
            getAll() { return request.cookies.getAll() },
            setAll() { /* Redirect için session kaydetmeye gerek yok */ }
          }
        })

        const { data } = await supabase
          .from('products')
          .select('slug')
          .eq('id', identifier)
          .single()

        if (data?.slug) {
          const url = request.nextUrl.clone()
          url.pathname = Routes.product(data.slug)
          return NextResponse.redirect(url, 308)
        }
      } catch (error) {
        console.error('[Middleware] UUID Slug Lookup Hatası:', error)
      }
    }

    return response
  }

  // ── Kol 2: Admin RBAC Guard (/admin/...) ────────────────────────────────
  if (segments[0] === 'admin') {
    // Development ortamında localhost'ta kilitlenmemek için bypass
    const host = request.headers.get('host') || ''
    const isDev = process.env.NODE_ENV === 'development'
    const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1')

    if (isDev && isLocalhost) {
      return response
    }

    // Auth ve Rol doğrulaması: Çerezleri senkronize eden tam Supabase Client
    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    })

    // Güvenli Auth Kontrolü (Token Refresh, Initplan)
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/auth/login'
      loginUrl.searchParams.set('from', pathname)
      if (error) loginUrl.searchParams.set('reason', 'expired')
      return NextResponse.redirect(loginUrl, 302)
    }

    // 3. Rol kontrolü: Basılı Kimlik Kartı (JWT Claim) Üzerinden Yapılır
    const jwtRole = user.user_metadata?.role

    if (!jwtRole || !ADMIN_ROLES.has(jwtRole.toLowerCase())) {
      // Yetkisiz — 403 benzeri: ana sayfaya yönlendir
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = '/'
      homeUrl.searchParams.set('auth_error', 'unauthorized')
      return NextResponse.redirect(homeUrl, 302)
    }

    // Yetkili geçiş — status quo koru
    return response
  }

  return response
}
