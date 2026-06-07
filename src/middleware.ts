import { Routes } from './utils/routes'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { resolveTenant } from './lib/tenantResolver'
import { resolveUserClaims, createRedirectResponse } from '@/utils/router'

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|.*\\.(?:svg|png|jpg|webp|ico|ttf|woff|woff2|otf)).*)',
  ],
}

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

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const { tenantId } = resolveTenant(host)
  request.headers.set('x-tenant-id', tenantId)

  // 1. Prepare Base Response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const setTenantCookie = (res: NextResponse) => {
    res.cookies.set('tenant_id', tenantId, {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    return res
  }

  const redirectResponse = (url: URL | string, status: number) => {
    // Set tenant cookie in response first so it is copied by createRedirectResponse
    setTenantCookie(response)
    return createRedirectResponse(request, url, response, status)
  }

  const { pathname } = request.nextUrl
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]

  // 2. Language Subdirectory Verification and Redirects
  let locale: string = DEFAULT_LOCALE
  let effectiveSegments = [...segments]
  const isLocaleInPath = LOCALES.includes(firstSegment as typeof LOCALES[number])

  if (isLocaleInPath) {
    locale = firstSegment
    effectiveSegments = segments.slice(1)
    
    // Redirect locale-prefixed admin pages back to non-prefixed roots
    if (effectiveSegments[0] === 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = `/admin${pathname.substring(3 + firstSegment.length)}`
      return redirectResponse(url, 307)
    }
  } else {
    // Inject language prefix for user-facing routes missing a locale segments
    const isAuthApi = firstSegment === 'auth' && (segments[1] === 'callback' || segments[1] === 'signout')
    const isSpecialRoute = firstSegment === 'admin' || firstSegment === 'api' || isAuthApi || 
                           pathname.endsWith('sitemap.xml') || pathname.endsWith('robots.txt')
    
    if (!isSpecialRoute) {
      const detectedLocale = detectLocale(request)
      const url = request.nextUrl.clone()
      url.pathname = `/${detectedLocale}${pathname === '/' ? '' : pathname}`
      return redirectResponse(url, 307)
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !anonKey) {
    return setTenantCookie(response)
  }

  // ── Redirects Column 1: UUID → Slug SEO canonicalization ──
  if (effectiveSegments.length === 2 && effectiveSegments[0] === 'products') {
    const identifier = effectiveSegments[1]

    if (UUID_REGEX.test(identifier)) {
      try {
        const supabase = createServerClient(supabaseUrl, anonKey, {
          cookies: {
            getAll: () => request.cookies.getAll(),
            setAll(cookiesToSet, headers) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              response = NextResponse.next({ request })
              cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
              if (headers) {
                Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
              }
            },
          },
        })

        const { data } = await supabase
          .from('products')
          .select('slug')
          .eq('id', identifier)
          .single()

        if (data?.slug) {
          const url = request.nextUrl.clone()
          url.pathname = `/${locale}${Routes.product(data.slug)}`
          return redirectResponse(url, 308)
        }
      } catch (error) {
        console.error('[Middleware] UUID Slug lookup error:', error)
      }
    }

    return setTenantCookie(response)
  }

  // ── Redirects Column 2: Admin RBAC Auth Guard ──
  if (effectiveSegments[0] === 'admin') {
    const host = request.headers.get('host') || ''
    const isDev = process.env.NODE_ENV === 'development'
    const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1')

    // Bypass auth in local development env to avoid locking ourselves out
    if (isDev && isLocalhost) {
      return setTenantCookie(response)
    }

    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          if (headers) {
            Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
          }
        },
      },
    })

    // Resolve claims through our high performance caching layer (AES-GCM cryptographically secure cookies)
    const secret = process.env.JWT_CLAIMS_COOKIE_SECRET || anonKey
    const { claims, error } = await resolveUserClaims(request, response, supabase, secret)
    const jwtRole = claims?.user_role
    const roleString = typeof jwtRole === 'string' ? jwtRole : ''

    if (error || !claims) {
      const loginUrl = request.nextUrl.clone()
      const detectedLocale = detectLocale(request)
      loginUrl.pathname = `/${detectedLocale}/auth/login`
      loginUrl.searchParams.set('from', pathname)
      if (error) loginUrl.searchParams.set('reason', 'expired')
      return redirectResponse(loginUrl, 302)
    }

    if (!roleString || !ADMIN_ROLES.has(roleString.toLowerCase())) {
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = '/'
      homeUrl.searchParams.set('auth_error', 'unauthorized')
      return redirectResponse(homeUrl, 302)
    }

    return setTenantCookie(response)
  }

  return setTenantCookie(response)
}
