'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { VentImage } from '../ui/VentImage'
import { getCategoryIcon } from '../../utils/getCategoryIcon'
import { getCategoryDisplayName } from '../../utils/categoryHelpers'
import { useI18n } from '../../i18n/I18nProvider'
import type { DomainCategory } from '../../lib/type-converters'

interface CategoryHeroProps {
  category: DomainCategory
  parentCategory?: DomainCategory | null
  productCount?: number
}

const CategoryHero: React.FC<CategoryHeroProps> = ({ category, parentCategory, productCount }) => {
  const { t } = useI18n()
  const navigate = useRouter()

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('vh_is_pop', 'true')
    }
    let stack: string[] = []
    try {
      stack = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('vh_nav_stack') || '[]') : []
    } catch { stack = [] }

    const prevPath = stack.length >= 2 ? stack[stack.length - 2] : '/'
    navigate.push(prevPath)
  }

  const categoryImageUrl = category.image_url
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${category.image_url}`
    : null

  return (
    <div className="bg-white border-b border-slate-100">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-steel-gray hover:text-primary-navy mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>{t('common.back')}</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="shrink-0">
            {categoryImageUrl ? (
              <div className="w-24 h-24 sm:w-32 sm:h-32 relative rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-50">
                <VentImage 
                  src={categoryImageUrl}
                  alt={getCategoryDisplayName(category)}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-primary-ocean">
                {getCategoryIcon(parentCategory?.slug || category.slug, { size: 48 })}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="vh-h1 mb-4">
              {getCategoryDisplayName(category)}
            </h1>
            {category.description && (
              <p className="vh-body-lg max-w-3xl mb-4">
                {category.description}
              </p>
            )}
            {productCount !== undefined && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 text-sm font-medium text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {productCount} {t('products.resultsFound')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryHero
