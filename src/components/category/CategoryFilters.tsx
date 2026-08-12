'use client'
import { Filter } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import type { CategoryFilters as FilterState } from '../../hooks/useCategoryGateway'
import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes'
import { useI18n } from '../../i18n/I18nProvider'
import type { DomainCategory } from '../../lib/type-converters'
import { getCategoryDisplayName, getLocalizedCategorySlug } from '../../utils/categoryHelpers'

interface CategoryFiltersProps {
  category: DomainCategory
  parentCategory?: DomainCategory | null
  subCategories: DomainCategory[]
  availableBrands: string[]
  filters: FilterState
  onUpdateFilters: (updates: Partial<FilterState>) => void
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  category,
  parentCategory,
  subCategories,
  availableBrands,
  filters,
  onUpdateFilters
}) => {
  const { t, lang } = useI18n()
  const Routes = useLocalizedRoutes()

  const toggleBrand = (brand: string) => {
    onUpdateFilters({
      selectedBrands: filters.selectedBrands.includes(brand)
        ? filters.selectedBrands.filter(b => b !== brand)
        : [...filters.selectedBrands, brand]
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
        <Filter size={16} className="text-primary-ocean" />
        {t('category.filters') || 'Filtreler'}
      </h3>

      {/* Local Search */}
      <div className="mb-8">
        <input
          type="text"
          value={filters.catSearch}
          onChange={(e) => onUpdateFilters({ catSearch: e.target.value })}
          placeholder={t('category.localSearchPlaceholder') as string || 'Bu kategoride ara...'}
          className="w-full pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-ocean/20 focus-visible:border-primary-ocean transition-colors placeholder:text-slate-400"
        />
      </div>

      {/* Sub-categories */}
      {subCategories.length > 0 && (
        <div className="mb-8">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            {t('category.subcategories') || 'Alt Kategoriler'}
          </h4>
          <div className="space-y-1">
            {subCategories.map((sub) => (
              <Link
                key={sub.id}
                href={Routes.category(getLocalizedCategorySlug(parentCategory || category, lang), getLocalizedCategorySlug(sub, lang))}
                className="block px-3 py-2 text-sm text-slate-600 hover:text-primary-navy hover:bg-slate-50 rounded-lg transition-colors font-medium"
              >
                {getCategoryDisplayName(sub)}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Fiyat aralığı ve teknik (debi/basınç/ses) filtreleri KALDIRILDI (F5-B W2.1):
          listeye hiç uygulanmıyordu (sahte filtre) ve aile satırında spec/fiyat yok.
          Gerçek faceted-search ayrı plandır. */}

      {/* Brands */}
      {availableBrands.length > 0 && (
        <div className="mb-8">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            {t('category.brands') || 'Markalar'}
          </h4>
          <div className="space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {availableBrands.map((brand) => (
              <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={filters.selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="peer w-5 h-5 appearance-none border border-slate-300 rounded focus-visible:ring-2 focus-visible:ring-primary-ocean/20 checked:bg-primary-ocean checked:border-primary-ocean transition-colors cursor-pointer"
                  />
                  <svg 
                    className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default CategoryFilters
