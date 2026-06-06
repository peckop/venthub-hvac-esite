import { Routes } from './utils/routes'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { resolveTenant } from './lib/tenantResolver'

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
  const host = request.headers.get('host') || ''
  const { tenantId } = resolveTenant(host)
  request.headers.set('x-tenant-id', tenantId)

  const setTenantCookie = (res: NextResponse) => {
    res.cookies.set('tenant_id', tenantId, {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return res;
  };

  const redirectResponse = (url: URL | string, status: number) => {
    const res = NextResponse.redirect(url, status)
    setTenantCookie(res)
    response.cookies.getAll().forEach(({ name, value, ...options }) => {
      res.cookies.set(name, value, options)
    })
    response.headers.forEach((value, key) => {
      res.headers.set(key, value)
    })
    return res
  }

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
      return redirectResponse(url, 307)
    }
  } else {
    // Rota locale barındırmıyor
    // Admin, API veya statik sitemap/robots dosyaları değilse dil alt dizinine yönlendir
    const isSpecialRoute = firstSegment === 'admin' || firstSegment === 'api' || firstSegment === 'auth' || 
                           pathname.endsWith('sitemap.xml') || pathname.endsWith('robots.txt')
    
    if (!isSpecialRoute) {
      const detectedLocale = detectLocale(request)
      const url = request.nextUrl.clone()
      url.pathname = `/${detectedLocale}${pathname === '/' ? '' : pathname}`
      return redirectResponse(url, 307)
    }
  }

  // Supabase yetkileri
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !anonKey) {
    return setTenantCookie(response)
  }

  // ── Kol 1: UUID → Slug SEO Yönlendirmesi (effectiveSegments ile) ────────────────
  if (effectiveSegments.length === 2 && effectiveSegments[0] === 'products') {
    const identifier = effectiveSegments[1]

    if (UUID_REGEX.test(identifier)) {
      try {
        const supabase = createServerClient(supabaseUrl, anonKey, {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet, headers) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              response = NextResponse.next({
                request,
              })
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              )
              if (headers) {
                Object.entries(headers).forEach(([key, value]) =>
                  response.headers.set(key, value)
                )
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
        console.error('[Middleware] UUID Slug Lookup Hatası:', error)
      }
    }

    return setTenantCookie(response)
  }

  // ── Kol 2: Admin RBAC Guard (effectiveSegments ile) ────────────────────────────────
  if (effectiveSegments[0] === 'admin') {
    // Development ortamında localhost'ta kilitlenmemek için bypass
    const host = request.headers.get('host') || ''
    const isDev = process.env.NODE_ENV === 'development'
    const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1')

    if (isDev && isLocalhost) {
      return setTenantCookie(response)
    }

    // Auth ve Rol doğrulaması: Çerezleri senkronize eden tam Supabase Client
    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
          if (headers) {
            Object.entries(headers).forEach(([key, value]) =>
              response.headers.set(key, value)
            )
          }
        },
      },
    })

    // Güvenli Auth Kontrolü
    const { data, error } = await supabase.auth.getClaims()
    const claims = data?.claims
    const jwtRole = claims?.user_role

    if (error || !claims) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/auth/login'
      loginUrl.searchParams.set('from', pathname)
      if (error) loginUrl.searchParams.set('reason', 'expired')
      return redirectResponse(loginUrl, 302)
    }

    if (!jwtRole || !ADMIN_ROLES.has(jwtRole.toLowerCase())) {
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = '/'
      homeUrl.searchParams.set('auth_error', 'unauthorized')
      return redirectResponse(homeUrl, 302)
    }

    return setTenantCookie(response)
  }

  return setTenantCookie(response)
}
