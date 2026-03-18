'use client'

import React from 'react'
import Link from 'next/link'
import { Filter } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { formatCurrency } from '../../i18n/format'
import { getCategoryDisplayName } from '../../utils/categoryHelpers'
import type { DomainCategory } from '../../lib/type-converters'
import type { CategoryFilters as FilterState } from '../../hooks/useCategoryGateway'

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
        {t('category.filters.title') || 'Filtreler'}
      </h3>

      {/* Local Search */}
      <div className="mb-8">
        <input
          type="text"
          value={filters.catSearch}
          onChange={(e) => onUpdateFilters({ catSearch: e.target.value })}
          placeholder={t('category.localSearchPlaceholder') as string || 'Bu kategoride ara...'}
          className="w-full pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-ocean/20 focus:border-primary-ocean transition-all placeholder:text-slate-400"
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
                href={`/category/${parentCategory?.slug || category.slug}/${sub.slug}`}
                className="block px-3 py-2 text-sm text-slate-600 hover:text-primary-navy hover:bg-slate-50 rounded-lg transition-colors font-medium"
              >
                {getCategoryDisplayName(sub)}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="mb-8">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          {t('category.priceRange') || 'Fiyat Aralığı'}
        </h4>
        <div className="space-y-4 px-2">
          <input
            type="range"
            min="0"
            max={Math.max(100000, filters.priceRange[1] || 100000)}
            value={filters.priceRange[1] || 0}
            onChange={(e) => onUpdateFilters({ priceRange: [filters.priceRange[0], parseInt(e.target.value)] })}
            className="w-full accent-primary-ocean"
          />
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>{formatCurrency(0, lang, { maximumFractionDigits: 0 })}</span>
            <span className="text-slate-900">{formatCurrency(filters.priceRange[1], lang, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

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
                    className="peer w-5 h-5 appearance-none border border-slate-300 rounded focus:ring-2 focus:ring-primary-ocean/20 checked:bg-primary-ocean checked:border-primary-ocean transition-all cursor-pointer"
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

      {/* Tech Filters */}
      <div className="space-y-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          {t('category.techFilters') || 'Teknik Özellikler'}
        </h4>
        
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">{t('category.airflow') || 'Hava Debisi (m³/h)'}</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder="Min" 
              value={filters.airflowMin} 
              onChange={e => onUpdateFilters({ airflowMin: e.target.value })} 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-ocean/20 placeholder:text-slate-300" 
            />
            <span className="text-slate-300">-</span>
            <input 
              type="number" 
              placeholder="Max" 
              value={filters.airflowMax} 
              onChange={e => onUpdateFilters({ airflowMax: e.target.value })} 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-ocean/20 placeholder:text-slate-300" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">{t('category.pressure') || 'Basınç (Pa)'}</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder="Min" 
              value={filters.pressureMin} 
              onChange={e => onUpdateFilters({ pressureMin: e.target.value })} 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-ocean/20 placeholder:text-slate-300" 
            />
            <span className="text-slate-300">-</span>
            <input 
              type="number" 
              placeholder="Max" 
              value={filters.pressureMax} 
              onChange={e => onUpdateFilters({ pressureMax: e.target.value })} 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-ocean/20 placeholder:text-slate-300" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">{t('category.noise') || 'Maks. Ses (dB)'}</label>
          <input 
            type="number" 
            placeholder="Max dB" 
            value={filters.noiseMax} 
            onChange={e => onUpdateFilters({ noiseMax: e.target.value })} 
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-ocean/20 placeholder:text-slate-300" 
          />
        </div>
      </div>
    </div>
  )
}

export default CategoryFilters
