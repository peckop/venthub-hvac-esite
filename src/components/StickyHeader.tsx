'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
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
import { NAVIGATION_PRIMARY_ITEMS, NAVIGATION_SECONDARY_ITEMS } from '../utils/navigationConfig'
import { UI_SYSTEM } from '../utils/uiSystem'
import { usePageContext } from '../contexts/PageContext'

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

import { 
  FileText, 
  Ruler, 
  Download, 
  Award, 
  Settings, 
  Info 
} from 'lucide-react'

// Icon mapping for contextual technical links
const SECTION_ICON_MAP: Record<string, any> = {
  'genel': FileText,
  'olcuiler': Ruler,
  'diyagramlar': FileText,
  'dokumanlar': FileText,
  'pdf': Download,
  'sertifikalar': Award,
  'modeller': Settings
}

interface StickyHeaderProps {
  isScrolled: boolean
}

export const StickyHeader: React.FC<StickyHeaderProps> = React.memo(function StickyHeader({ isScrolled }) {
  const { t, lang } = useI18n()
  const router = useRouter()
  const { getCartCount, syncing, getCartTotal } = useCart()
  const { user, signOut } = useAuth()
  const isAdmin = checkAdminAccess(user)
  const { productName, modelCode, technicalLinks, breadcrumb } = usePageContext()

  const {
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

  const [scrollProgress, _setScrollProgress] = useState(0)
  const { isScrollingDown, isAtTop } = useHideOnScroll({ threshold: 60 })
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false)
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
    } catch { }
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
      if (!user) {
        if (active) setUserRole('user')
        return
      }
      try {
        const role = await getUserRole(user.id)
        if (active) setUserRole(role)
      } catch (e) {
        console.error('getUserRole in StickyHeader failed', e)
      }
    }
    loadRole()
    return () => { active = false }
  }, [user])

  const cartCount = getCartCount()
  const cartTotal = getCartTotal()

  useEffect(() => {
    if (syncing) {
      setShowSyncPulse(true)
      const timeout = setTimeout(() => setShowSyncPulse(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [syncing])

  const ensureCategories = useCallback(async () => {
    if (categoriesLoaded || isCategoriesLoading) return categoriesRequestRef.current
    setIsCategoriesLoading(true)
    try {
      const { getCategories } = await import('../lib/supabase')
      const data = await getCategories()
      setAllCategories(data)
      setCategoriesLoaded(true)
      return data
    } catch (error) {
      console.error('Error fetching categories:', error)
      return null
    } finally {
      setIsCategoriesLoading(false)
    }
  }, [categoriesLoaded, isCategoriesLoading])

  const handleOpenMenu = useCallback(() => openMenu(), [openMenu])
  const handleOpenCategoryHub = useCallback(() => {
    void ensureCategories()
    openCategoryHub()
  }, [openCategoryHub, ensureCategories])

  const handleSignOut = async () => {
    closeUserMenu()
    await signOut()
    router.push('/')
  }

  const handleNavItemHover = useCallback((id: string) => {
    if (id === 'categories') void ensureCategories()
  }, [ensureCategories])

  // Resolve labels for navigation items
  const secondaryItems = NAVIGATION_SECONDARY_ITEMS.map(item => ({
    ...item,
    label: t(item.labelKey)
  }))
  const primaryItems = NAVIGATION_PRIMARY_ITEMS.map(item => ({
    ...item,
    label: t(item.labelKey)
  }))

  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const roleLabel = (role: string) => {
    if (role === 'admin') return 'Admin'
    if (role === 'b2b') return 'Corporate'
    return 'Standard'
  }

  const handleTechLinkClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const offset = 140
      const y = el.getBoundingClientRect().top + window.pageYOffset - offset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const renderUserMenu = () => {
    if (!user) {
      return (
        <div className="flex items-center gap-2">
          <Link href="/auth/login" className="text-[10px] font-semibold uppercase tracking-widest text-industrial-gray hover:text-primary-navy transition-colors px-3 py-2">
            {t('header.signIn')}
          </Link>
          <Link href="/auth/register" className="bg-primary-navy hover:bg-secondary-blue text-white text-[10px] font-semibold uppercase tracking-[0.2em] py-2 px-5 rounded-xl shadow-md transition-all active:scale-95">
            {t('header.signUp')}
          </Link>
        </div>
      )
    }

    return (
      <div className="relative" ref={userMenuRef}>
        <button onClick={toggleUserMenu} className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-white/50 px-3 py-1.5 transition-all hover:border-primary-navy/30 hover:bg-white">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-navy to-secondary-blue text-[10px] font-bold text-white shadow-sm">{userDisplayName.substring(0, 2).toUpperCase()}</div>
          <span className="hidden xl:block text-xs font-semibold text-industrial-gray">{userDisplayName}</span>
          <svg width={12} height={12} fill="none" stroke="currentColor" viewBox="0 0 24 24" className={`transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {isUserMenuOpen && (
          <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.32)] backdrop-blur-md">
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="truncate text-sm font-semibold text-slate-900">{userDisplayName}</div>
              <div className="truncate text-xs text-steel-gray">{user.email}</div>
              <div className="pt-1 text-xs text-steel-gray/85">{t('header.roleLabel')}: <span className="font-medium text-slate-900">{roleLabel(userRole)}</span></div>
            </div>
            <div className="p-2">
              <Link href="/account" onClick={closeUserMenu} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-steel-gray transition-all duration-200 hover:bg-air-blue/20 hover:text-primary-navy">
                <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" /></svg>
                <span>{t('header.account')}</span>
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={closeUserMenu} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-steel-gray transition-all duration-200 hover:bg-air-blue/20 hover:text-primary-navy">
                  <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l6 6 6-6M2 9l10 12L22 9" /></svg>
                  <span>{t('header.adminPanel')}</span>
                </Link>
              )}
              <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-steel-gray transition-all duration-200 hover:bg-red-50 hover:text-red-600">
                <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
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
      <a href="#main-content" className="skip-link">{t('common.skipToContent')}</a>
      <div className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${productName ? 'h-24 md:h-32' : 'h-16 md:h-24'}`} aria-hidden="true" />
      <NavShell
        fixed={true}
        showProgress={isScrolled}
        progress={scrollProgress}
        isScrollingDown={isScrollingDown}
        isAtTop={isAtTop}
        isAnyOverlayOpen={isMenuOpen || isCategoryHubOpen || isSearchOverlayOpen}
        topTierChildren={<NavSecondaryRail items={secondaryItems} />}
        bottomTierChildren={
          <>
            <NavBrand brandName={t('header.brandName')} />
            <NavPrimaryRail items={primaryItems} isCategoriesLoading={isCategoriesLoading} isCategoryHubOpen={isCategoryHubOpen} onCategoryClick={handleOpenCategoryHub} onCategoryHover={() => { void ensureCategories() }} onItemHover={handleNavItemHover} />
            <div className="flex-1 max-w-xl hidden sm:flex justify-center md:px-4">
              <NavSearchTrigger label={t('header.commandSearchCompact')} shortcutLabel="/" ariaLabel={t('common.search')} onClick={openSearchOverlay} />
            </div>
            <NavUtilityRail>
              <div className="hidden xl:flex items-center gap-1.5 w-auto opacity-100">
                <NavActionButton ariaLabel={t('header.quickOrder')} title={t('header.quickOrder')} onClick={() => router.push('/products?all=1&sort=bestsellers')} tone="warning" icon={<svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" /></svg>} label={t('header.quickOrder')} labelClassName="hidden 2xl:block font-semibold" />
                {recentProducts.length > 0 && <NavActionButton ariaLabel={t('header.recentlyViewed')} title={t('header.recentlyViewed')} onClick={() => { if (recentProducts.length > 0) router.push(`/products/${recentProducts[0]}`) }} icon={<svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="12,6 12,12 16,14" /></svg>} />}
                <NavActionButton ariaLabel={t('header.favorites')} title={t('header.favorites')} onClick={() => router.push('/account/favorites')} icon={<svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" /></svg>} />
              </div>
              <NavActionButton href="/cart" ariaLabel={t('header.cart')} tone="success" icon={<svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="transition-all duration-300"><path strokeWidth={2} d="M5 6h16l-1.68 8.39a2 2 0 0 1-1.97 1.61H8.66a2 2 0 0 1-1.97-1.61L5 6Z" /><path strokeWidth={2} d="M5 6L4 2H2" /><circle cx="16" cy="19" r="2" /><circle cx="8" cy="19" r="2" /></svg>} label={cartTotal > 0 ? formatCurrency(String(cartTotal), lang, { maximumFractionDigits: 0 }) : undefined} labelClassName="hidden 2xl:block font-semibold text-success-green transition-all" badge={<>{showSyncPulse && syncing && <span title={t('header.syncing')} aria-label={t('header.syncing')} className="absolute -left-1 -top-1 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-white animate-pulse" />}{cartCount > 0 && <span className="absolute flex items-center justify-center rounded-full bg-gradient-to-r from-primary-navy to-secondary-blue font-semibold text-white shadow-md transition-all duration-300 -right-2 -top-2 h-5 w-5 text-[11px]">{cartCount}</span>}</>} />
              <div className="hidden lg:block">{renderUserMenu()}</div>
              <div className="transition-all duration-300 overflow-hidden sm:hidden"><NavActionButton ariaLabel={t('common.search')} onClick={openSearchOverlay} icon={<svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="transition-all duration-300"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>} /></div>
              <NavActionButton ariaLabel={t('header.menu')} onClick={handleOpenMenu} icon={<svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="transition-all duration-300"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>} tone={activeSurface === 'menu' ? 'accent' : 'default'} className="lg:hidden" />
            </NavUtilityRail>
          </>
        }
        contextTierChildren={productName ? (
          <div className="flex w-full items-center justify-between h-full">
            <div className="flex items-center gap-3 overflow-hidden py-1">
              <span className="text-[11px] font-semibold text-industrial-gray tracking-tight truncate max-w-[200px] sm:max-w-xs uppercase">
                {productName}
              </span>
              {modelCode && (
                <span className="text-[9px] font-medium text-steel-gray/40 border border-slate-200/60 px-1.5 py-0.5 rounded tracking-widest hidden lg:block uppercase">
                  {modelCode}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar ml-4 py-1">
              {technicalLinks?.map(link => {
                const Icon = SECTION_ICON_MAP[link.id] || Info
                return (
                  <button
                    key={link.id}
                    onClick={() => handleTechLinkClick(link.id)}
                    className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-steel-gray/70 hover:text-primary-navy transition-all whitespace-nowrap group"
                  >
                    <Icon size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                    <span>{link.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      />
      {isSearchOverlayOpen && <React.Suspense fallback={null}><SearchOverlay open={isSearchOverlayOpen} onClose={closeSearchOverlay} /></React.Suspense>}
      {isMenuOpen && <React.Suspense fallback={null}><MegaMenu isOpen={isMenuOpen} onClose={closeMenu} /></React.Suspense>}
      {isCategoryHubOpen && <React.Suspense fallback={null}><CategoryHubOverlay isOpen={isCategoryHubOpen} onClose={closeCategoryHub} categories={allCategories} onCategorySelect={(category) => { closeCategoryHub(); router.push(`/category/${category.slug}`) }} /></React.Suspense>}
    </>
  )
})

export default StickyHeader
