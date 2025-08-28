import React, { useState, useRef, useEffect } from 'react'
import { Search, ShoppingCart, Menu, User, ChevronDown, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCartHook'
import { useAuth } from '../hooks/useAuth'
import { searchProducts, Product } from '../lib/supabase'
import MegaMenu from './MegaMenu'
import { useI18n } from '../i18n/I18nProvider'
import { BrandIcon } from './HVACIcons'

interface StickyHeaderProps {
  isScrolled: boolean
}

export const StickyHeader: React.FC<StickyHeaderProps> = ({ isScrolled }) => {
  const { t } = useI18n()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { getCartCount } = useCart()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const searchRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Handle search
  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        try {
          const results = await searchProducts(searchQuery.trim())
          setSearchResults(results)
          setIsSearchOpen(true)
        } catch (error) {
          console.error('Search error:', error)
          setSearchResults([])
        }
      } else {
        setSearchResults([])
        setIsSearchOpen(false)
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery])

  // Close search and user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`)
    setSearchQuery('')
    setIsSearchOpen(false)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsSearchOpen(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setIsUserMenuOpen(false)
    navigate('/')
  }

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

            {/* Desktop Navigation - Reordered per requirements */}
            <nav className="hidden xl:flex items-center space-x-1">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="nav-link group flex items-center space-x-2 px-4 py-3 text-steel-gray hover:text-primary-navy transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30"
              >
                <Menu size={18} className="group-hover:rotate-180 transition-transform duration-300" />
                <span className="font-medium">{t('common.categories')}</span>
              </button>
              <Link
                to="/products"
                className="nav-link px-4 py-3 text-steel-gray hover:text-primary-navy font-medium transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 relative"
              >
                {t('common.products')}
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-navy to-secondary-blue transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full"></div>
              </Link>
              <Link
                to="/brands"
                className="nav-link px-4 py-3 text-steel-gray hover:text-primary-navy font-medium transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 relative group"
              >
                {t('common.brands')}
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-navy to-secondary-blue transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full"></div>
              </Link>
              <Link
                to="/about"
                className="nav-link px-4 py-3 text-steel-gray hover:text-primary-navy font-medium transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 relative group"
              >
                {t('common.about')}
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-navy to-secondary-blue transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full"></div>
              </Link>
              <Link
                to="/contact"
                className="nav-link px-4 py-3 text-steel-gray hover:text-primary-navy font-medium transition-all duration-300 rounded-lg hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 relative group"
              >
                {t('common.contact')}
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-navy to-secondary-blue transition-all duration-300 group-hover:w-full group-hover:left-0 rounded-full"></div>
              </Link>
            </nav>

            {/* Search Bar - Enhanced Design */}
            <div className="flex-1 max-w-md mx-6 relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-steel-gray group-focus-within:text-primary-navy transition-colors duration-200" size={18} />
                  <input
                    type="text"
                    placeholder={t('common.searchHeaderPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm placeholder:text-steel-gray focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                </div>
              </form>

              {/* Enhanced Search Results Dropdown */}
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/98 backdrop-blur-lg border border-gray-200/50 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="w-full flex items-center space-x-3 p-3 hover:bg-gradient-to-r hover:from-air-blue/20 hover:to-light-gray/20 rounded-lg transition-all duration-200 text-left group"
                      >
                        <BrandIcon brand={product.brand} className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-industrial-gray truncate group-hover:text-primary-navy transition-colors">
                            {product.name}
                          </div>
                          <div className="text-sm text-steel-gray">
                            {product.brand} • {product.sku}
                          </div>
                        </div>
                        <div className="text-primary-navy font-bold">
                          ₺{parseFloat(product.price).toLocaleString('tr-TR')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Actions - Enhanced */}
            <div className="flex items-center space-x-2">
              <Link
                to="/cart"
                className="relative p-3 hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 rounded-xl transition-all duration-300 group"
              >
                <ShoppingCart size={22} className="text-steel-gray group-hover:text-primary-navy group-hover:scale-110 transition-all duration-300" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-navy to-secondary-blue text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse">
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
                        <User size={18} />
                      </div>
                      <span className="hidden lg:block text-sm font-medium text-industrial-gray group-hover:text-primary-navy transition-colors">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </span>
                      <ChevronDown size={16} className={`hidden lg:block text-steel-gray group-hover:text-primary-navy transition-all duration-300 ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      }`} />
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
                          </div>
                          <Link
                            to="/account"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-steel-gray hover:text-primary-navy hover:bg-gradient-to-r hover:from-air-blue/20 hover:to-light-gray/20 transition-all duration-200 rounded-lg m-1"
                          >
                            <User size={16} />
                            <span>Hesabım</span>
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-steel-gray hover:text-red-600 hover:bg-red-50/50 transition-all duration-200 rounded-lg m-1"
                          >
                            <LogOut size={16} />
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
                      className="lg:hidden p-3 hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 rounded-xl transition-all duration-300"
                    >
                      <User size={22} className="text-steel-gray" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-3 hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 rounded-xl transition-all duration-300 xl:hidden group"
              >
                <Menu size={22} className="text-steel-gray group-hover:text-primary-navy group-hover:rotate-180 transition-all duration-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Sticky Compact Header */}
      {isScrolled && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg transition-all duration-500 animate-slideDown">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="bg-gradient-to-r from-primary-navy to-secondary-blue p-2 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300">
                  <div className="text-white font-bold text-sm">VH</div>
                </div>
                <span className="font-bold text-industrial-gray group-hover:text-primary-navy transition-colors">
                  VentHub
                </span>
              </Link>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="p-2 hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 rounded-lg transition-all duration-300 group"
                >
                  <Menu size={18} className="text-steel-gray group-hover:text-primary-navy group-hover:rotate-180 transition-all duration-300" />
                </button>
                <Link
                  to="/cart"
                  className="relative p-2 hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 rounded-lg transition-all duration-300 group"
                >
                  <ShoppingCart size={18} className="text-steel-gray group-hover:text-primary-navy transition-all duration-300" />
                  {getCartCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-navy to-secondary-blue text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                      {getCartCount()}
                    </span>
                  )}
                </Link>
                {user && (
                  <>
                    <Link
                      to="/account"
                      className="p-2 hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 rounded-lg transition-all duration-300 group"
                    >
                      <User size={18} className="text-steel-gray group-hover:text-primary-navy transition-all duration-300" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mega Menu */}
      <MegaMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}

export default StickyHeader