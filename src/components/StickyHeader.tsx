'use client'

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { checkAdminAccess, getUserRole } from '../config/admin'
import { useNavigationState } from '../hooks/useNavigationState'
import { useHideOnScroll } from '../hooks/useHideOnScroll'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCartHook'
import { formatCurrency } from '../i18n/format'
import { useI18n } from '../i18n/I18nProvider'
import type { Category } from '../lib/supabase'
// import { cn } from '../lib/utils'
import { trackEvent } from '../utils/analytics'
import { prefetchProductsPage } from '../utils/prefetch'
import { NAVIGATION_PRIMARY_ITEMS, NAVIGATION_SECONDARY_ITEMS } from '../utils/navigationConfig'

// Helper function to handle variable sizing without creating separate JSX blocks


import NavActionButton from './navigation/NavActionButton'
import NavBrand from './navigation/NavBrand'
import NavPrimaryRail from './navigation/NavPrimaryRail'
import NavSecondaryRail from './navigation/NavSecondaryRail'
import NavSearchTrigger from './navigation/NavSearchTrigger'
import NavShell from './navigation/NavShell'
import NavUtilityRail from './navigation/NavUtilityRail'

const SearchOverlay = React.lazy(() => import('./SearchOverlay'))
const MegaMenu = React.lazy(() => import('./MegaMenu'))
const CategoryHubOverlay = React.lazy(() => import('./navigation/CategoryHubOverlay'))

interface StickyHeaderProps {
  isScrolled: boolean
}

export const StickyHeader: React.FC<StickyHeaderProps> = React.memo(function StickyHeader({ isScrolled }) {
  const { t, lang } = useI18n()
  const router = useRouter()
  const { getCartCount, syncing, getCartTotal } = useCart()
  const { user, signOut } = useAuth()
  const isAdmin = checkAdminAccess(user)

  const {
    mode,
    activeSurface,
    isMenuOpen,
    isUserMenuOpen,
    isCategoryHubOpen,
    isSearchOverlayOpen,
    openMenu,
    closeMenu,
    toggleUserMenu,
    closeUserMenu,
    openCategoryHub,
    closeCategoryHub,
    openSearchOverlay,
    closeSearchOverlay,
  } = useNavigationState({ isScrolled })

  const [scrollProgress, setScrollProgress] = useState(0)
  const { isScrollingDown, isAtTop } = useHideOnScroll({ threshold: 60 })
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [showSyncPulse, setShowSyncPulse] = useState(false)
  const [recentProducts, setRecentProducts] = useState<string[]>([])
  const [userRole, setUserRole] = useState<string>('user')

  const userMenuRef = useRef<HTMLDivElement>(null)
  const categoriesRequestRef = useRef<Promise<Category[] | null> | null>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('recentProducts')
      if (raw) setRecentProducts(JSON.parse(raw))
    } catch {
      // ignore storage parse failures
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        closeUserMenu()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [closeUserMenu])

  useEffect(() => {
    let active = true

    async function loadRole() {
      try {
        if (user?.id) {
          const role = await getUserRole(user.id)
          if (active) setUserRole(role)
        } else if (active) {
          setUserRole('user')
        }
      } catch {
        if (active) setUserRole('user')
      }
    }

    if (user?.id) {
      void loadRole()
    } else {
      setUserRole((previous) => (previous === 'user' ? previous : 'user'))
    }

    return () => {
      active = false
    }
  }, [user?.id])

  const roleLabel = useCallback((role: string) => {
    switch (role) {
      case 'superadmin':
      case 'super_admin':
        return t('roles.super_admin') || t('roles.superadmin')
      case 'admin':
        return t('roles.admin')
      case 'moderator':
        return t('roles.moderator')
      case 'warehouse':
        return t('roles.warehouse')
      case 'sales':
        return t('roles.sales')
      case 'viewer':
        return t('roles.viewer')
      default:
        return t('roles.user')
    }
  }, [t])

  useEffect(() => {
    if (!isScrolled) return

    let ticking = false

    const handleScroll = () => {
      if (ticking) return

      ticking = true
      requestAnimationFrame(() => {
        const winScroll = document.documentElement.scrollTop
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0
        setScrollProgress(scrolled)
        ticking = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isScrolled])

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return
      }

      if (event.key === '/' || (event.key === 'k' && (event.metaKey || event.ctrlKey))) {
        event.preventDefault()
        openSearchOverlay()
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [openSearchOverlay])

  const ensureCategories = useCallback(async (options?: { force?: boolean }) => {
    const force = options?.force ?? false

    if (categoriesLoaded && !force) return allCategories
    if (categoriesRequestRef.current) return categoriesRequestRef.current

    setIsCategoriesLoading(true)
    setCategoriesError(null)

    const request = (async () => {
      try {
        const { getCategories } = await import('../lib/supabase')
        const data = await getCategories()
        setAllCategories(data)
        setCategoriesLoaded(true)
        return data
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategoriesError(t('categoryHub.loadFailed') || 'Failed to load categories')
        return null
      } finally {
        setIsCategoriesLoading(false)
        categoriesRequestRef.current = null
      }
    })()

    categoriesRequestRef.current = request

    try {
      return await request
    } finally {
      if (categoriesRequestRef.current === request) {
        categoriesRequestRef.current = null
      }
    }
  }, [allCategories, categoriesLoaded, t])

  const handleOpenCategoryHub = useCallback(() => {
    trackEvent('nav_click', { target: 'categories', mode })
    openCategoryHub()
    if (!categoriesLoaded || categoriesError) {
      void ensureCategories({ force: Boolean(categoriesError) })
    }
  }, [categoriesError, categoriesLoaded, ensureCategories, mode, openCategoryHub])

  const handleOpenMenu = useCallback(() => {
    trackEvent('nav_click', { target: 'menu', mode })
    openMenu()
  }, [mode, openMenu])

  useEffect(() => {
    const retryVisibleCategoryLoad = () => {
      if (document.visibilityState !== 'visible') return
      if (!isCategoryHubOpen) return
      if (categoriesLoaded && !categoriesError) return

      void ensureCategories({ force: Boolean(categoriesError) })
    }

    document.addEventListener('visibilitychange', retryVisibleCategoryLoad)
    window.addEventListener('focus', retryVisibleCategoryLoad)

    return () => {
      document.removeEventListener('visibilitychange', retryVisibleCategoryLoad)
      window.removeEventListener('focus', retryVisibleCategoryLoad)
    }
  }, [categoriesError, categoriesLoaded, ensureCategories, isCategoryHubOpen])

  useEffect(() => {
    if (syncing) {
      const timeoutId = setTimeout(() => setShowSyncPulse(true), 500)
      return () => clearTimeout(timeoutId)
    }

    setShowSyncPulse(false)
  }, [syncing])

  const handleSignOut = useCallback(async () => {
    await signOut()
    closeUserMenu()
    router.push('/')
  }, [closeUserMenu, router, signOut])

  const primaryItems = useMemo(
    () => NAVIGATION_PRIMARY_ITEMS.map((item) => ({ ...item, label: t(item.labelKey) })),
    [t]
  )

  const secondaryItems = useMemo(
    () => NAVIGATION_SECONDARY_ITEMS.map((item) => ({ ...item, label: t(item.labelKey) })),
    [t]
  )

  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || t('roles.user')
  const cartCount = getCartCount()
  const cartTotal = getCartTotal ? getCartTotal() : 0
  const hasPrivilegedRole = ['superadmin', 'super_admin', 'admin', 'moderator', 'warehouse', 'sales', 'viewer'].includes(userRole)

  const handleNavItemHover = useCallback((itemId: string) => {
    if (itemId === 'products') {
      prefetchProductsPage()
    }
  }, [])

  const renderUserMenu = () => {
    if (!user) {
      return (
        <>
          <Link
            href="/auth/login"
            className="hidden rounded-2xl px-3.5 py-3 text-sm font-medium text-steel-gray transition-colors duration-300 hover:text-primary-navy lg:inline-flex"
          >
            {t('common.signIn')}
          </Link>
          <Link
            href="/auth/register"
            className="hidden rounded-2xl bg-gradient-to-r from-primary-navy to-secondary-blue px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_-20px_rgba(37,99,235,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_36px_-18px_rgba(37,99,235,0.8)] lg:inline-flex"
          >
            {t('common.signUp')}
          </Link>
          <NavActionButton

            href="/auth/login"
            ariaLabel={t('common.signIn')}
            icon={
              <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            }
            className="lg:hidden"
          />
        </>
      )
    }

    return (
      <div className="relative" ref={userMenuRef}>
        <button
          type="button"
          onClick={toggleUserMenu}
          aria-label={t('header.account')}
          aria-expanded={isUserMenuOpen}
          className="group flex items-center gap-2.5 rounded-2xl px-2 py-1 text-left transition-all duration-300 hover:bg-air-blue/25"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary-navy to-secondary-blue text-white shadow-[0_16px_28px_-18px_rgba(37,99,235,0.75)]">
            <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          </span>

          <span className="hidden min-w-0 xl:block">
            <span className="block truncate text-sm font-semibold text-slate-900">{userDisplayName}</span>
            <span className="block truncate text-xs text-steel-gray">
              {hasPrivilegedRole ? roleLabel(userRole) : t('header.account')}
            </span>
          </span>

          <svg
            width={16}
            height={16}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className={`hidden text-steel-gray transition-transform duration-300 xl:block ${isUserMenuOpen ? 'rotate-180' : ''}`}
          >
            <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="6,9 12,15 18,9" />
          </svg>
        </button>

        {isUserMenuOpen && (
          <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.32)] backdrop-blur-md">
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="truncate text-sm font-semibold text-slate-900">{userDisplayName}</div>
              <div className="truncate text-xs text-steel-gray">{user.email}</div>
              <div className="pt-1 text-xs text-steel-gray/85">
                {t('header.roleLabel')}: <span className="font-medium text-slate-900">{roleLabel(userRole)}</span>
              </div>
            </div>

            <div className="p-2">
              <Link
                href="/account"
                onClick={closeUserMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-steel-gray transition-all duration-200 hover:bg-air-blue/20 hover:text-primary-navy"
              >
                <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
                <span>{t('header.account')}</span>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={closeUserMenu}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-steel-gray transition-all duration-200 hover:bg-air-blue/20 hover:text-primary-navy"
                >
                  <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l6 6 6-6M2 9l10 12L22 9" />
                  </svg>
                  <span>{t('header.adminPanel')}</span>
                </Link>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-steel-gray transition-all duration-200 hover:bg-red-50 hover:text-red-600"
              >
                <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                <span>{t('common.signOut')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        {t('common.skipToContent')}
      </a>

      {/* DOM Jumps önleyici Spacer: Expanded header boyutu (h-20) */}
      <div className="h-20" aria-hidden="true" />

      {/* Tekil (Single Source of Truth) Navigasyon Ağacı */}

      {/* Tekil (Single Source of Truth) Navigasyon Ağacı */}
      <NavShell
        fixed={true}
        showProgress={isScrolled}
        progress={scrollProgress}
        isScrollingDown={isScrollingDown}
        isAtTop={isAtTop}
        isAnyOverlayOpen={isMenuOpen || isCategoryHubOpen || isSearchOverlayOpen}
        topTierChildren={
          <NavSecondaryRail items={secondaryItems} />
        }
        bottomTierChildren={
          <>
            <NavBrand brandName={t('header.brandName')} />

            <NavPrimaryRail
              items={primaryItems}
              isCategoriesLoading={isCategoriesLoading}
              isCategoryHubOpen={isCategoryHubOpen}
              onCategoryClick={handleOpenCategoryHub}
              onCategoryHover={() => {
                void ensureCategories()
              }}
              onItemHover={handleNavItemHover}
            />

            <div className="flex-1 max-w-xl hidden sm:flex justify-center md:px-4">
              <NavSearchTrigger
                label={t('header.commandSearchCompact')}
                shortcutLabel="/"
                ariaLabel={t('common.search')}
                onClick={openSearchOverlay}
              />
            </div>

            <NavUtilityRail>
              <div className="hidden xl:flex items-center gap-1.5 w-auto opacity-100">
                <NavActionButton
                  ariaLabel={t('header.quickOrder')}
                  title={t('header.quickOrder')}
                  onClick={() => router.push('/products?all=1&sort=bestsellers')}
                  tone="warning"
                  icon={
                    <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <polygon strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
                    </svg>
                  }
                  label={t('header.quickOrder')}
                />

                {recentProducts.length > 0 && (
                  <NavActionButton
                    ariaLabel={t('header.recentlyViewed')}
                    title={t('header.recentlyViewed')}
                    onClick={() => {
                      if (recentProducts.length > 0) router.push(`/products/${recentProducts[0]}`)
                    }}
                    icon={
                      <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="12,6 12,12 16,14" />
                      </svg>
                    }
                  />
                )}

                <NavActionButton
                  ariaLabel={t('header.favorites')}
                  title={t('header.favorites')}
                  onClick={() => router.push('/account/favorites')}
                  icon={
                    <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <polygon strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" />
                    </svg>
                  }
                />
              </div>

              {/* Sepet (Cart) */}
              <NavActionButton
                href="/cart"
                ariaLabel={t('header.cart')}
                tone="success"
                icon={
                  <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="transition-all duration-300">
                    <path strokeWidth={2} d="M5 6h16l-1.68 8.39a2 2 0 0 1-1.97 1.61H8.66a2 2 0 0 1-1.97-1.61L5 6Z" />
                    <path strokeWidth={2} d="M5 6L4 2H2" />
                    <circle cx="16" cy="19" r="2" />
                    <circle cx="8" cy="19" r="2" />
                  </svg>
                }
                label={cartTotal > 0 ? formatCurrency(cartTotal, lang, { maximumFractionDigits: 0 }) : undefined}
                labelClassName="hidden 2xl:block font-semibold text-success-green transition-all"
                badge={
                  <>
                    {showSyncPulse && syncing && (
                      <span
                        title={t('header.syncing')}
                        aria-label={t('header.syncing')}
                        className="absolute -left-1 -top-1 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-white animate-pulse"
                      />
                    )}
                    {cartCount > 0 && (
                      <span className="absolute flex items-center justify-center rounded-full bg-gradient-to-r from-primary-navy to-secondary-blue font-bold text-white shadow-md transition-all duration-300 -right-2 -top-2 h-5 w-5 text-[11px]">
                        {cartCount}
                      </span>
                    )}
                  </>
                }
              />

              {/* Kullanıcı Menüsü / Login */}
              <div className="hidden lg:block">
                {renderUserMenu()}
              </div>

              {/* Mobil Cihazlar için Arama İkonu */}
              <div className="transition-all duration-300 overflow-hidden sm:hidden">
                <NavActionButton
                  ariaLabel={t('common.search')}
                  onClick={openSearchOverlay}
                  icon={
                    <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="transition-all duration-300">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  }
                />
              </div>

              {/* Hamburger Menü İkonu */}
              <NavActionButton
                ariaLabel={t('header.menu')}
                onClick={handleOpenMenu}
                icon={
                  <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="transition-all duration-300">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                }
                tone={activeSurface === 'menu' ? 'accent' : 'default'}
                className="lg:hidden"
              />
            </NavUtilityRail>
          </>
        }
      />

      {isSearchOverlayOpen && (
        <React.Suspense fallback={null}>
          <SearchOverlay open={isSearchOverlayOpen} onClose={closeSearchOverlay} />
        </React.Suspense>
      )}

      {isMenuOpen && (
        <React.Suspense fallback={null}>
          <MegaMenu isOpen={isMenuOpen} onClose={closeMenu} />
        </React.Suspense>
      )}

      {isCategoryHubOpen && (
        <React.Suspense fallback={null}>
          <CategoryHubOverlay
            isOpen={isCategoryHubOpen}
            onClose={closeCategoryHub}
            categories={allCategories}
            onCategorySelect={(category) => {
              closeCategoryHub()
              router.push(`/category/${category.slug}`)
            }}
          />
        </React.Suspense>
      )}
    </>
  )
})

export default StickyHeader
