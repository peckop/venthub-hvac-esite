import { Routes } from './utils/routes'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Edge Middleware — Sorumluluklar:
 * 1. i18n Alt Dizin Yönlendirmesi ve Dil Algılaması (tr/en)
 * 2. UUID tabanlı /products/[uuid] → slug canonical URL 308 SEO yönlendirmesi
 * 3. /admin/* yolları için JWT + Rol doğrulaması (Server-side RBAC Guard)
 */

export const config = {
  matcher: [
    // Statik varlıklar dışındaki tüm istekleri dinle
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|webp|ico)).*)',
  ],
}

// ── Sabit Tanımlar ──────────────────────────────────────────────────────────
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ADMIN_ROLES = new Set(['super_admin', 'admin', 'moderator', 'warehouse', 'sales', 'viewer'])

const LOCALES = ['tr', 'en'] as const
const DEFAULT_LOCALE = 'tr'

function detectLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale === 'tr' || cookieLocale === 'en') return cookieLocale
  
  const acceptLang = request.headers.get('accept-language') || ''
  if (acceptLang.toLowerCase().includes('en')) return 'en'
  
  return 'tr'
}

// ── Ana Middleware ───────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 1. Dil Alt Dizin Kontrolü ve Yönlendirme
  let locale: string = DEFAULT_LOCALE
  let effectiveSegments = [...segments]
  const isLocaleInPath = LOCALES.includes(firstSegment as typeof LOCALES[number])

  if (isLocaleInPath) {
    locale = firstSegment
    effectiveSegments = segments.slice(1) // Offset uygulandı
    
    // Eğer dil alt dizininde admin çağrıldıysa (/tr/admin/... veya /en/admin/...)
    // Admin paneli locale'siz kalacağı için kök /admin rotasına yönlendir
    if (effectiveSegments[0] === 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = `/admin${pathname.substring(3 + firstSegment.length)}`
      return NextResponse.redirect(url, 307)
    }
  } else {
    // Rota locale barındırmıyor
    // Admin, API veya statik sitemap/robots dosyaları değilse dil alt dizinine yönlendir
    const isSpecialRoute = firstSegment === 'admin' || firstSegment === 'api' || 
                           pathname.endsWith('sitemap.xml') || pathname.endsWith('robots.txt')
    
    if (!isSpecialRoute) {
      const detectedLocale = detectLocale(request)
      const url = request.nextUrl.clone()
      url.pathname = `/${detectedLocale}${pathname === '/' ? '' : pathname}`
      return NextResponse.redirect(url, 307)
    }
  }

  // Supabase yetkileri
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !anonKey) {
    return response
  }

  // ── Kol 1: UUID → Slug SEO Yönlendirmesi (effectiveSegments ile) ────────────────
  if (effectiveSegments.length === 2 && effectiveSegments[0] === 'products') {
    const identifier = effectiveSegments[1]

    if (UUID_REGEX.test(identifier)) {
      try {
        const supabase = createServerClient(supabaseUrl, anonKey, {
          cookies: {
            getAll() { return request.cookies.getAll() },
            setAll() { }
          }
        })

        const { data } = await supabase
          .from('products')
          .select('slug')
          .eq('id', identifier)
          .single()

        if (data?.slug) {
          const url = request.nextUrl.clone()
          url.pathname = `/${locale}${Routes.product(data.slug)}`
          return NextResponse.redirect(url, 308)
        }
      } catch (error) {
        console.error('[Middleware] UUID Slug Lookup Hatası:', error)
      }
    }

    return response
  }

  // ── Kol 2: Admin RBAC Guard (effectiveSegments ile) ────────────────────────────────
  if (effectiveSegments[0] === 'admin') {
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

    // Güvenli Auth Kontrolü
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/auth/login'
      loginUrl.searchParams.set('from', pathname)
      if (error) loginUrl.searchParams.set('reason', 'expired')
      return NextResponse.redirect(loginUrl, 302)
    }

    const jwtRole = user.user_metadata?.role

    if (!jwtRole || !ADMIN_ROLES.has(jwtRole.toLowerCase())) {
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = '/'
      homeUrl.searchParams.set('auth_error', 'unauthorized')
      return NextResponse.redirect(homeUrl, 302)
    }

    return response
  }

  return response
}
