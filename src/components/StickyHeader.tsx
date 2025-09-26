import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import type { Product, Category } from '../lib/supabase'
import { checkAdminAccess, getUserRole } from '../config/admin'
import { useI18n } from '../i18n/I18nProvider'
import { trackEvent } from '../utils/analytics'
import { prefetchProductsPage } from '../utils/prefetch'
import { getCategoryIcon } from '../utils/getCategoryIcon'
import { formatCurrency } from '../i18n/format'
const SearchOverlay = React.lazy(() => import('./SearchOverlay'))
const MegaMenu = React.lazy(() => import('./MegaMenu'))

interface StickyHeaderProps {
  isScrolled: boolean
}

const BrandIconLazy = React.lazy(() => import('./HVACIcons').then(m => ({ default: m.BrandIcon })))

export const StickyHeader: React.FC<StickyHeaderProps> = ({ isScrolled }) => {
  const { t, lang } = useI18n()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [stickySearchQuery, setStickySearchQuery] = useState('')
  const [stickySearchResults, setStickySearchResults] = useState<Product[]>([])
  const [isStickySearchOpen, setIsStickySearchOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false)
  const { getCartCount, syncing, getCartTotal } = useCart()
  const [showSyncPulse, setShowSyncPulse] = useState(false)
  const { user, signOut } = useAuth()
  const isAdmin = checkAdminAccess(user)
  const [userRole, setUserRole] = useState<string>('user')
  const navigate = useNavigate()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const stickySearchRef = useRef<HTMLDivElement>(null)
  const categoriesRef = useRef<HTMLDivElement>(null)
  

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (stickySearchRef.current && !stickySearchRef.current.contains(event.target as Node)) {
        setIsStickySearchOpen(false)
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Kullanıcı rolünü DB'den çek (giriş yaptığında veya user değiştiğinde)
  useEffect(() => {
    let active = true
    async function loadRole() {
      try {
        if (user?.id) {
          const role = await getUserRole(user.id)
          if (active) setUserRole(role)
        } else {
          if (active) setUserRole('user')
        }
      } catch {
        if (active) setUserRole('user')
      }
    }

    if (user?.id) {
      loadRole()
    } else {
      // previous state üzerinden set ederek dependency ihtiyacını kaldır
      setUserRole(prev => (prev === 'user' ? prev : 'user'))
    }

    return () => { active = false }
  }, [user?.id])

  const roleLabel = useCallback((r: string) => {
    switch(r) {
      case 'superadmin': return t('roles.superadmin')
      case 'admin': return t('roles.admin')
      case 'moderator': return t('roles.moderator')
      default: return t('roles.user')
    }
  }, [t])

  // Scroll progress tracker - throttled
  useEffect(() => {
    if (!isScrolled) return
    
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const winScroll = document.documentElement.scrollTop
          const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
          const scrolled = height > 0 ? (winScroll / height) * 100 : 0
          setScrollProgress(scrolled)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isScrolled])

  // Defer categories fetch until dropdown first open (reduce initial header churn)
  const ensureCategories = useCallback(async () => {
    if (categoriesLoaded) return
    try {
      const { getCategories } = await import('../lib/supabase')
      const data = await getCategories()
      setCategories(data.filter(cat => cat.level === 0).slice(0, 6)) // Top 6 main categories
      setCategoriesLoaded(true)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }, [categoriesLoaded])

  // Delay showing syncing pulse to avoid early flicker
  useEffect(() => {
    if (syncing) {
      const id = setTimeout(() => setShowSyncPulse(true), 500)
      return () => clearTimeout(id)
    } else {
      setShowSyncPulse(false)
    }
  }, [syncing])

  // Handle sticky search - optimized debounce
  useEffect(() => {
    if (stickySearchQuery.trim().length === 0) {
      // Avoid unnecessary re-renders when already empty/closed
      setStickySearchResults(prev => (prev.length ? [] : prev))
      setIsStickySearchOpen(prev => (prev ? false : prev))
      return
    }
    
    if (stickySearchQuery.trim().length < 3) {
      return // Don't search for less than 3 characters
    }

    const delayedSearch = setTimeout(async () => {
      try {
        const { searchProducts } = await import('../lib/supabase')
        const results = await searchProducts(stickySearchQuery.trim())
        setStickySearchResults(results.slice(0, 5)) // Max 5 results in sticky
        setIsStickySearchOpen(true)
      } catch (error) {
        console.error('Sticky search error:', error)
        setStickySearchResults(prev => (prev.length ? [] : prev))
        setIsStickySearchOpen(prev => (prev ? false : prev))
      }
    }, 400) // Slightly longer delay to reduce API calls

    return () => clearTimeout(delayedSearch)
  }, [stickySearchQuery])


  const handleSignOut = useCallback(async () => {
    await signOut()
    setIsUserMenuOpen(false)
    navigate('/')
  }, [signOut, navigate])

  // Logo click handler kaldırıldı - navigasyon sorunlarını önlemek için


  // Memoized static logo fragments to avoid re-renders (declared unconditionally per hooks rules)
  const MainLogo = useMemo(() => (
    <Link to="/" className="flex items-center space-x-3 group">
      <div className="bg-gradient-to-r from-primary-navy to-secondary-blue p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
        <div className="text-white font-bold text-xl">VH</div>
      </div>
      <div className="hidden sm:block">
        <div className="text-2xl font-bold text-industrial-gray group-hover:text-primary-navy transition-colors">
          VentHub
        </div>
        <div className="text-xs text-steel-gray font-medium tracking-wider">
          HVAC PREMIUM
        </div>
      </div>
    </Link>
  ), [])

  const StickyLogo = useMemo(() => (
    <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
      <div className="bg-gradient-to-r from-primary-navy to-secondary-blue p-2 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300">
        <div className="text-white font-bold text-sm">VH</div>
      </div>
      <span className="hidden sm:block font-bold text-industrial-gray group-hover:text-primary-navy transition-colors">
        VentHub
      </span>
    </Link>
  ), [])

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">
        {t('common.skipToContent')}
      </a>
      
      {/* Main Header */}
      <header className="bg-white/98 border-b border-light-gray/40 shadow-sm relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            {MainLogo}

            {/* Desktop Navigation - Reordered per requirements */}
            <nav className="hidden xl:flex items-center space-x-1">
              <button
                onClick={() => { trackEvent('nav_click', { target: 'categories' }); setIsMenuOpen(true) }}
                className="nav-link group flex items-center space-x-2 px-4 py-3 text-steel-gray hover:text-primary-navy transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 min-w-[110px] justify-center"
              >
                <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="group-hover:rotate-180 transition-transform duration-300">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
<span className="font-medium whitespace-nowrap">{t('common.categories')}</span>
              </button>
              <Link
                to="/products"
                onMouseEnter={() => prefetchProductsPage()}
className="nav-link px-4 py-3 text-steel-gray hover:text-primary-navy font-medium transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 relative min-w-[88px] text-center whitespace-nowrap"
              >
                {t('common.products')}
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-navy to-secondary-blue transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full"></div>
              </Link>
              <Link
                to="/destek/merkez"
className="nav-link px-4 py-3 text-steel-gray hover:text-primary-navy font-medium transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 relative group whitespace-nowrap"
              >
                {t('common.knowledgeHub')}
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-navy to-secondary-blue transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full"></div>
              </Link>
              <Link
                to="/brands"
className="nav-link px-4 py-3 text-steel-gray hover:text-primary-navy font-medium transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 relative group min-w-[84px] text-center whitespace-nowrap"
              >
                {t('common.brands')}
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-navy to-secondary-blue transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full"></div>
              </Link>
              <Link
                to="/about"
className="nav-link px-4 py-3 text-steel-gray hover:text-primary-navy font-medium transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 relative group whitespace-nowrap"
              >
                {t('common.about')}
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-navy to-secondary-blue transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full"></div>
              </Link>
              <Link
                to="/contact"
className="nav-link px-4 py-3 text-steel-gray hover:text-primary-navy font-medium transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 relative group whitespace-nowrap"
              >
                {t('common.contact')}
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-navy to-secondary-blue transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full"></div>
              </Link>
            </nav>

            {/* Search trigger (header input kaldırıldı) */}
            <div className="mx-2 hidden sm:flex">
              <button
                onClick={() => setIsSearchOverlayOpen(true)}
                aria-label={t('common.search')}
                className="p-3 hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 rounded-xl transition-all duration-300 group"
              >
                <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-steel-gray group-hover:text-primary-navy">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
            </div>

            {/* Right Actions - Enhanced */}
            <div className="flex items-center space-x-2">
                  <Link
                    to="/cart"
                    aria-label={t('header.cart')}
                    className="relative p-3 hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 rounded-xl transition-all duration-300 group"
                  >
                <svg width={22} height={22} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-steel-gray group-hover:text-primary-navy group-hover:scale-110 transition-all duration-300">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h11.5l3.5-8H5.4" />
                </svg>
                {showSyncPulse && syncing && (
                  <span title={t('header.syncing')} className="absolute -top-1 -left-1 h-3 w-3 rounded-full bg-amber-400 animate-pulse ring-2 ring-white" aria-label="syncing" />
                )}
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-navy to-secondary-blue text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg">
                    {getCartCount()}
                  </span>
                )}
              </Link>
              
              {/* Enhanced User Menu */}
              <div className="relative" ref={userMenuRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-3 p-3 hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 rounded-xl transition-all duration-300 group"
                    >
                      <div className="bg-gradient-to-r from-primary-navy to-secondary-blue text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />
                        </svg>
                      </div>
<span className="hidden lg:block text-sm font-medium text-industrial-gray group-hover:text-primary-navy transition-colors max-w-[160px] truncate whitespace-nowrap overflow-hidden">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </span>
                      <span className="hidden xl:inline-flex min-w-[96px] justify-center">
                        {(userRole === 'superadmin' || userRole === 'admin' || userRole === 'moderator') ? (
                          <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full border ${
                            userRole === 'superadmin' ? 'bg-amber-50 text-amber-700 border-amber-200' : userRole === 'admin' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-violet-50 text-violet-700 border-violet-200'
                          }`} title={`${t('header.roleLabel')}: ${roleLabel(userRole)}`}>
                            {roleLabel(userRole)}
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 text-[11px] rounded-full border border-transparent opacity-0">&nbsp;</span>
                        )}
                      </span>
                      <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" className={`hidden lg:block text-steel-gray group-hover:text-primary-navy transition-all duration-300 ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      }`}>
                        <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="6,9 12,15 18,9" />
                      </svg>
                    </button>

                    {/* Enhanced User Dropdown */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white/98 backdrop-blur-lg border border-gray-200/50 rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="p-1">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <div className="text-sm font-medium text-industrial-gray">
                              {user.user_metadata?.full_name || 'User'}
                            </div>
                            <div className="text-xs text-steel-gray">
                              {user.email}
                            </div>
                            <div className="pt-1 text-xs text-steel-gray/80">
                              {t('header.roleLabel')}: <span className="font-medium text-industrial-gray">{roleLabel(userRole)}</span>
                            </div>
                          </div>
                          <Link
                            to="/account"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-steel-gray hover:text-primary-navy hover:bg-gradient-to-r hover:from-air-blue/20 hover:to-light-gray/20 transition-all duration-200 rounded-lg m-1"
                          >
                            <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />
                            </svg>
                            <span>{t('header.account')}</span>
                          </Link>
                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-steel-gray hover:text-primary-navy hover:bg-gradient-to-r hover:from-air-blue/20 hover:to-light-gray/20 transition-all duration-200 rounded-lg m-1"
                            >
                              <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l6 6 6-6M2 9l10 12L22 9" />
                              </svg>
                              <span>{t('header.adminPanel')}</span>
                            </Link>
                          )}
                          <button
                            onClick={handleSignOut}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-steel-gray hover:text-red-600 hover:bg-red-50/50 transition-all duration-200 rounded-lg m-1"
                          >
                            <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                            </svg>
                            <span>{t('common.signOut')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      to="/auth/login"
                      className="hidden lg:block text-sm text-steel-gray hover:text-primary-navy font-medium transition-colors px-3 py-2"
                    >
                      {t('common.signIn')}
                    </Link>
                    <Link
                      to="/auth/register"
                      className="hidden lg:block bg-gradient-to-r from-primary-navy to-secondary-blue hover:from-secondary-blue hover:to-primary-navy text-white text-sm font-bold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {t('common.signUp')}
                    </Link>
                    <Link
                      to="/auth/login"
                      aria-label={t('common.signIn')}
                      className="lg:hidden p-3 hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 rounded-xl transition-all duration-300"
                    >
                      <svg width={22} height={22} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-steel-gray">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              {/* Mobile search trigger */}
              <button
                onClick={() => setIsSearchOverlayOpen(true)}
                aria-label={t('common.search')}
                className="p-3 hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 rounded-xl transition-all duration-300 xl:hidden group"
              >
                <svg width={22} height={22} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-steel-gray group-hover:text-primary-navy">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
              <button
                onClick={() => setIsMenuOpen(true)}
                aria-label={t('header.menu')}
                className="p-3 hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 rounded-xl transition-all duration-300 xl:hidden group"
              >
                <svg width={22} height={22} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-steel-gray group-hover:text-primary-navy group-hover:rotate-180 transition-all duration-300">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full-screen search overlay */}
      {isSearchOverlayOpen && (
        <React.Suspense fallback={null}>
          <SearchOverlay open={isSearchOverlayOpen} onClose={() => setIsSearchOverlayOpen(false)} />
        </React.Suspense>
      )}

      {/* Sticky Header block: yalnızca scroll sonrası mount edilir */}
      {isScrolled && (
        <>
          {/* Progress Bar (only when sticky visible) */}
          <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-gray-200/50 pointer-events-none">
            <div 
              className="h-full bg-gradient-to-r from-primary-navy to-secondary-blue transition-all duration-300"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
          
          <div className="fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  {/* Logo */}
                  {StickyLogo}
  
                  {/* Quick Navigation */}
                  <nav className="hidden lg:flex items-center space-x-1 mx-4">
                    <Link
                      to="/products"
                      className="px-3 py-2 text-sm font-medium text-steel-gray hover:text-primary-navy hover:bg-air-blue/20 rounded-lg transition-all duration-200 min-w-[88px] text-center whitespace-nowrap"
                    >
                      {t('common.products')}
                    </Link>
                    
                    {/* Categories Dropdown */}
                    <div className="relative" ref={categoriesRef}>
                      <button
                        onClick={async () => { await ensureCategories(); setIsCategoriesOpen(!isCategoriesOpen) }}
                        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-steel-gray hover:text-primary-navy hover:bg-air-blue/20 rounded-lg transition-all duration-200 min-w-[110px] justify-center whitespace-nowrap"
                      >
                        <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="6" height="6"/><rect x="15" y="3" width="6" height="6"/><rect x="3" y="15" width="6" height="6"/><rect x="15" y="15" width="6" height="6"/>
                        </svg>
                        <span>{t('common.categories')}</span>
                        <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24" className={`transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`}>
                          <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="6,9 12,15 18,9" />
                        </svg>
                      </button>
                      
                      {isCategoriesOpen && (
                        <div className="absolute top-full left-0 mt-1 w-64 bg-white/98 backdrop-blur-lg border border-gray-200/50 rounded-xl shadow-2xl overflow-hidden">
                          <div className="p-2 max-h-96 overflow-y-auto">
                            {categoriesLoaded && categories.length === 0 && (
                              <div className="px-3 py-2 text-sm text-steel-gray">{t('common.noData')}</div>
                            )}
                            {!categoriesLoaded && (
                              <div className="px-3 py-2 text-sm text-steel-gray">{t('common.loading')}</div>
                            )}
                            {categories.map((cat) => (
                              <Link
                                key={cat.id}
                                to={`/category/${cat.slug}`}
                                onClick={() => setIsCategoriesOpen(false)}
                                className="flex items-center space-x-3 px-3 py-2 hover:bg-air-blue/20 rounded-lg transition-all duration-200"
                              >
                                <div className="text-primary-navy">
                                  {getCategoryIcon(cat.slug, { size: 18 })}
                                </div>
                                <span className="text-sm font-medium text-industrial-gray hover:text-primary-navy">
                                  {cat.name}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Link
                      to="/brands"
                      className="px-3 py-2 text-sm font-medium text-steel-gray hover:text-primary-navy hover:bg-air-blue/20 rounded-lg transition-all duration-200 min-w-[84px] text-center whitespace-nowrap"
                    >
                      {t('common.brands')}
                    </Link>
                  </nav>
  
                  {/* Sticky Search Bar */}
                  <div className="flex-1 max-w-sm mx-2 relative" ref={stickySearchRef}>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      if (stickySearchQuery.trim()) {
                        navigate(`/products?q=${encodeURIComponent(stickySearchQuery.trim())}`)
                        setStickySearchQuery('')
                        setIsStickySearchOpen(false)
                      }
                    }}>
                      <div className="relative group">
                        <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-steel-gray group-focus-within:text-primary-navy transition-colors">
                          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                        </svg>
                        <input
                          type="text"
                          placeholder={t('common.quickSearch')}
                          value={stickySearchQuery}
                          onChange={(e) => setStickySearchQuery(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder:text-steel-gray focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy focus:bg-white transition-all duration-200"
                        />
                        {/* Quick search hint */}
                        <kbd className="hidden lg:block absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-steel-gray/50 font-mono">/</kbd>
                      </div>
                    </form>
  
                    {/* Sticky Search Results */}
                    {isStickySearchOpen && stickySearchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white/98 backdrop-blur-lg border border-gray-200/50 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto">
                        {stickySearchResults.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => {
                              navigate(`/product/${product.id}`)
                              setStickySearchQuery('')
                              setIsStickySearchOpen(false)
                            }}
                            className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-air-blue/20 text-left transition-all duration-200"
                          >
                            <React.Suspense fallback={<div className="w-5 h-5 rounded bg-gray-100" aria-hidden="true" />}>
                              <BrandIconLazy brand={product.brand} />
                            </React.Suspense>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-industrial-gray truncate">{product.name}</div>
                              <div className="text-xs text-steel-gray">{product.brand}</div>
                            </div>
                            <div className="text-sm font-bold text-primary-navy">
                              {formatCurrency(parseFloat(product.price), lang, { maximumFractionDigits: 0 })}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
  
                  {/* Smart Actions & Right Icons */}
                  <div className="flex items-center space-x-1">
                    {/* Quick Order Button */}
                    <button
                      onClick={() => navigate('/products?sort=bestsellers')}
                      className="hidden xl:flex items-center space-x-1 px-3 py-2 text-sm font-medium text-steel-gray hover:text-primary-navy hover:bg-warning-orange/10 rounded-lg transition-all duration-200 group"
                      title={t('header.quickOrder')}
                      aria-label={t('header.quickOrder')}
                    >
                      <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-warning-orange group-hover:animate-pulse">
                        <polygon strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
                      </svg>
                      <span className="hidden 2xl:block">{t('header.quickOrder')}</span>
                    </button>
  
                    {/* Recent Products */}
                    {typeof window !== 'undefined' && window.localStorage.getItem('recentProducts') && (
                      <button
                        onClick={() => {
                          const recent = JSON.parse(window.localStorage.getItem('recentProducts') || '[]')
                          if (recent.length > 0) navigate(`/product/${recent[0]}`)
                        }}
                        className="hidden xl:block p-2 hover:bg-air-blue/20 rounded-lg transition-all duration-200 group"
                        title={t('header.recentlyViewed')}
                        aria-label={t('header.recentlyViewed')}
                      >
                        <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-steel-gray group-hover:text-primary-navy">
                          <circle cx="12" cy="12" r="10"/><polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="12,6 12,12 16,14" />
                        </svg>
                      </button>
                    )}
  
                    {/* Favorites (placeholder for future) */}
                    <button
                      onClick={() => navigate('/account/favorites')}
                      className="hidden xl:block p-2 hover:bg-air-blue/20 rounded-lg transition-all duration-200 group"
                        title={t('header.favorites')}
                        aria-label={t('header.favorites')}
                    >
                      <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-steel-gray group-hover:text-gold-accent">
                        <polygon strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" />
                      </svg>
                    </button>
  
                    {/* Menu Button */}
                    <button
                      onClick={() => setIsMenuOpen(true)}
                      aria-label={t('header.menu')}
                      className="p-2 hover:bg-air-blue/20 rounded-lg transition-all duration-200 group"
                    >
                      <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-steel-gray group-hover:text-primary-navy group-hover:rotate-180 transition-all duration-300">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
  
                    {/* Cart with Total */}
                    <Link
                      to="/cart"
                      aria-label={t('header.cart')}
                      className="relative flex items-center space-x-2 p-2 hover:bg-success-green/10 rounded-lg transition-all duration-200 group"
                    >
                      <div className="relative">
                        <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-steel-gray group-hover:text-success-green transition-all duration-300">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h11.5l3.5-8H5.4" />
                        </svg>
                        {getCartCount() > 0 && (
                          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-primary-navy to-secondary-blue text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                            {getCartCount()}
                          </span>
                        )}
                      </div>
                      {getCartTotal && getCartTotal() > 0 && (
                        <span className="hidden xl:block text-sm font-bold text-success-green">
                          {formatCurrency(getCartTotal(), lang, { maximumFractionDigits: 0 })}
                        </span>
                      )}
                    </Link>
  
                    {/* User Menu */}
                    {user ? (
                      <Link
                        to="/account"
                        aria-label={t('header.account')}
                        className="p-2 hover:bg-air-blue/20 rounded-lg transition-all duration-200 group"
                      >
                        <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-steel-gray group-hover:text-primary-navy transition-all duration-300">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />
                        </svg>
                      </Link>
                    ) : (
                      <Link
                        to="/auth/login"
                        className="px-3 py-2 bg-gradient-to-r from-primary-navy to-secondary-blue text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-300"
                      >
                        {t('common.signIn')}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
        </>
      )}

      {/* Mega Menu (render only when open to avoid loading chunk on first paint) */}
      {isMenuOpen && (
        <React.Suspense fallback={null}>
          <MegaMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </React.Suspense>
      )}
    </>
  )
}

export default StickyHeader
