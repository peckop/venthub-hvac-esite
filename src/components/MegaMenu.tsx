import React, { useState, useEffect } from 'react'
import type { Category } from '../lib/supabase'
import { getCategoryIcon } from '../utils/getCategoryIcon'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'
import { trackEvent } from '../utils/analytics'
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'

interface MegaMenuProps {
  isOpen: boolean
  onClose: () => void
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)


  useEffect(() => {
    async function fetchCategories() {
      try {
        const { getCategories } = await import('../lib/supabase')
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const mainCategories = categories.filter(cat => cat.level === 0)
  const subCategories = categories.filter(cat => cat.level === 1)

  const getSubCategories = (parentId: string) => {
    return subCategories.filter(sub => sub.parent_id === parentId)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm motion-safe:transition-all motion-safe:duration-300"
      onClick={onClose}
    >
      <div
        className="absolute top-0 left-0 w-full glass-effect max-h-[85vh] overflow-y-auto animate-slideDown shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/30 bg-gradient-to-r from-primary-navy/5 to-secondary-blue/5">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-primary-navy to-secondary-blue p-2 rounded-lg shadow-md">
              <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-industrial-gray">
              {t('megamenu.navigation')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 hover:text-red-600 rounded-xl motion-safe:transition-all motion-safe:duration-300 group"
          >
            <svg width={22} height={22} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-steel-gray group-hover:text-red-600 motion-safe:group-hover:rotate-90 motion-safe:transition-all motion-safe:duration-300">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Enhanced Quick Navigation Links - Ordered per requirements */}
        <div className="p-6 border-b border-gray-200/30">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-steel-gray uppercase tracking-wider mb-3">
              {t('megamenu.quickAccess')}
            </h4>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Link
              to="/products"
              onClick={(_e) => {
                onClose()
              }}
              className="group flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-primary-navy to-secondary-blue text-white rounded-xl hover:from-secondary-blue hover:to-primary-navy motion-safe:transition-all motion-safe:duration-300 shadow-lg hover:shadow-xl motion-safe:transform motion-safe:hover:scale-105"
            >
              <span className="font-bold">{t('common.products')}</span>
              <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="motion-safe:group-hover:translate-x-1 motion-safe:transition-transform motion-safe:duration-300">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/brands"
              onClick={onClose}
              className="group flex items-center justify-center space-x-3 p-4 bg-white border-2 border-primary-navy/20 text-industrial-gray rounded-xl hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 hover:border-primary-navy motion-safe:transition-all motion-safe:duration-300 shadow-sm hover:shadow-md"
            >
              <span className="font-bold">{t('common.brands')}</span>
              <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="motion-safe:group-hover:translate-x-1 motion-safe:transition-transform motion-safe:duration-300">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/destek/merkez"
              onClick={onClose}
              className="group flex items-center justify-center space-x-3 p-4 bg-white border-2 border-gray-200 text-industrial-gray rounded-xl hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 hover:border-primary-navy motion-safe:transition-all motion-safe:duration-300 shadow-sm hover:shadow-md"
            >
              <span className="font-bold">{t('common.knowledgeHub')}</span>
              <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="motion-safe:group-hover:translate-x-1 motion-safe:transition-transform motion-safe:duration-300">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/about"
              onClick={onClose}
              className="group flex items-center justify-center space-x-3 p-4 bg-white border-2 border-gray-200 text-industrial-gray rounded-xl hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 hover:border-primary-navy motion-safe:transition-all motion-safe:duration-300 shadow-sm hover:shadow-md"
            >
              <span className="font-bold">{t('common.about')}</span>
              <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="motion-safe:group-hover:translate-x-1 motion-safe:transition-transform motion-safe:duration-300">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/contact"
              onClick={onClose}
              className="group flex items-center justify-center space-x-3 p-4 bg-white border-2 border-gray-200 text-industrial-gray rounded-xl hover:bg-gradient-to-r hover:from-air-blue/30 hover:to-light-gray/30 hover:border-primary-navy motion-safe:transition-all motion-safe:duration-300 shadow-sm hover:shadow-md"
            >
              <span className="font-bold">{t('common.contact')}</span>
              <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="motion-safe:group-hover:translate-x-1 motion-safe:transition-transform motion-safe:duration-300">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/cart"
              onClick={onClose}
              className="group flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 motion-safe:transition-all motion-safe:duration-300 shadow-lg hover:shadow-xl motion-safe:transform motion-safe:hover:scale-105"
            >
              <span className="font-bold">{t('megamenu.myCart')}</span>
              <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="motion-safe:group-hover:translate-x-1 motion-safe:transition-transform motion-safe:duration-300">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 border-4 border-primary-navy/20 border-t-primary-navy rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-steel-gray font-medium">{t('megamenu.loadingCategories')}</p>
          </div>
        ) : (
          <>
            {/* Categories Section Header */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-6 bg-gradient-to-b from-primary-navy to-secondary-blue rounded-full"></div>
                <h4 className="text-lg font-bold text-industrial-gray">
                  {t('megamenu.productCategories')}
                </h4>
              </div>
              <p className="text-sm text-steel-gray mt-1">
                {t('megamenu.pickCategory')}
              </p>
            </div>

            {/* Premium Accordion Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 pt-2">
              {mainCategories.map((category, index) => {
                const subs = getSubCategories(category.id)
                const isExpanded = expandedCategory === category.id

                return (
                  <div
                    key={category.id}
                    className={`
                      relative rounded-2xl border transition-all duration-500 overflow-hidden
                      ${isExpanded
                        ? 'bg-gradient-to-br from-primary-navy via-primary-navy/95 to-secondary-blue border-secondary-blue/50 shadow-2xl shadow-primary-navy/20 ring-2 ring-secondary-blue/30'
                        : 'bg-white border-gray-100 hover:border-primary-navy/30 hover:shadow-xl'
                      }
                    `}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Main Category Header - Clickable to Expand */}
                    <button
                      type="button"
                      onClick={() => {
                        if (subs.length > 0) {
                          setExpandedCategory(isExpanded ? null : category.id)
                          trackEvent('category_expand', { slug: category.slug, expanded: !isExpanded })
                        }
                      }}
                      className={`
                        w-full p-5 flex items-center space-x-4 text-left transition-all duration-300
                        ${subs.length > 0 ? 'cursor-pointer' : 'cursor-default'}
                      `}
                    >
                      {/* Icon */}
                      <div className={`
                        p-3 rounded-xl transition-all duration-300 shadow-sm
                        ${isExpanded
                          ? 'bg-white/20 backdrop-blur-sm'
                          : 'bg-gradient-to-br from-primary-navy/10 to-secondary-blue/10'
                        }
                      `}>
                        <div className={`transition-colors duration-300 ${isExpanded ? 'text-white' : 'text-primary-navy'}`}>
                          {getCategoryIcon(category.slug, { size: 28 })}
                        </div>
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <h5 className={`font-bold transition-colors duration-300 mb-0.5 ${isExpanded ? 'text-white' : 'text-industrial-gray'}`}>
                          {category.name}
                        </h5>
                        <p className={`text-sm transition-colors duration-300 ${isExpanded ? 'text-white/70' : 'text-steel-gray'}`}>
                          {subs.length > 0 ? `${subs.length} alt kategori` : 'Ürünleri gör'}
                        </p>
                      </div>

                      {/* Expand/Collapse Icon */}
                      {subs.length > 0 ? (
                        <div className={`transition-all duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                          <ChevronDown
                            size={20}
                            className={`transition-colors duration-300 ${isExpanded ? 'text-white' : 'text-steel-gray'}`}
                          />
                        </div>
                      ) : (
                        <Link
                          to={`/category/${category.slug}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            trackEvent('category_click', { level: 0, slug: category.slug, source: 'megamenu' })
                            onClose()
                          }}
                          className="p-2 rounded-lg hover:bg-primary-navy/10 transition-colors"
                        >
                          <ChevronRight size={20} className="text-primary-navy" />
                        </Link>
                      )}
                    </button>

                    {/* Expandable Subcategories Panel */}
                    <div
                      className={`
                        overflow-hidden transition-all duration-500 ease-in-out
                        ${isExpanded ? 'max-h-[320px] opacity-100' : 'max-h-0 opacity-0'}
                      `}
                    >
                      {/* Scrollable Subcategory List */}
                      <div className="px-5 pb-5">
                        <div className="max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent pr-2 space-y-1">
                          {subs.map((sub, subIndex) => (
                            <Link
                              key={sub.id}
                              to={`/category/${category.slug}/${sub.slug}`}
                              onClick={() => {
                                trackEvent('category_click', { level: 1, slug: sub.slug, parent: category.slug, source: 'megamenu' })
                                onClose()
                              }}
                              className="
                                group/sub flex items-center justify-between px-4 py-3 
                                bg-white/10 hover:bg-white/20 backdrop-blur-sm
                                rounded-xl transition-all duration-200
                                border border-white/10 hover:border-white/30
                              "
                              style={{ animationDelay: `${subIndex * 30}ms` }}
                            >
                              <span className="text-sm font-medium text-white/90 group-hover/sub:text-white">
                                {sub.name}
                              </span>
                              <ChevronRight
                                size={16}
                                className="text-white/50 group-hover/sub:text-white group-hover/sub:translate-x-1 transition-all duration-200"
                              />
                            </Link>
                          ))}
                        </div>

                        {/* View All Button */}
                        <Link
                          to={`/category/${category.slug}`}
                          onClick={() => {
                            trackEvent('category_click', { level: 0, slug: category.slug, source: 'megamenu_viewall' })
                            onClose()
                          }}
                          className="
                            mt-3 flex items-center justify-center gap-2 w-full py-3
                            bg-white text-primary-navy font-bold rounded-xl
                            hover:bg-gray-50 transition-all duration-200
                            shadow-lg shadow-black/10
                          "
                        >
                          <span>Tümünü Gör</span>
                          <ExternalLink size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MegaMenu
