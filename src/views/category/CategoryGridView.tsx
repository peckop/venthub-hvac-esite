'use client'

import { Grid, List } from 'lucide-react'
import React from 'react'

import type { FamilyListItem } from '@/types/ui-models'

import CategoryFiltersComponent from '../../components/category/CategoryFilters'
import PageShell from '../../components/layout/PageShell'
import FamilyCard from '../../components/products/FamilyCard'
import type { CategoryFilters } from '../../hooks/useCategoryGateway'
import { useI18n } from '../../i18n/I18nProvider'
import type { DomainCategory } from '../../lib/type-converters'

interface CategoryGridViewProps {
  category: DomainCategory
  parentCategory?: DomainCategory | null
  subCategories: DomainCategory[]
  availableBrands: string[]
  /** F5-B W2.1: liste birimi AİLE. */
  families: FamilyListItem[]
  filters: CategoryFilters
  onUpdateFilters: (updates: Partial<CategoryFilters>) => void
  loading?: boolean
}

const CategoryGridView: React.FC<CategoryGridViewProps> = ({
  category,
  parentCategory,
  subCategories,
  availableBrands,
  families,
  filters,
  onUpdateFilters,
  loading
}) => {
  const { t } = useI18n()

  return (
    <PageShell width="wide" spacing="md">
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Sidebar Filters */}
        <aside className="lg:w-80 flex-shrink-0">
          <div className="sticky top-32">
            <CategoryFiltersComponent 
              category={category}
              parentCategory={parentCategory}
              subCategories={subCategories}
              availableBrands={availableBrands}
              filters={filters}
              onUpdateFilters={onUpdateFilters}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-slate-100">
            <p className="text-sm font-medium text-slate-500">
              {t('category.family.count', { count: families.length })}
            </p>
            
            <div className="flex items-center gap-6">
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                <button 
                  onClick={() => onUpdateFilters({ viewMode: 'grid' })}
                  className={`p-2 rounded-lg transition-colors ${filters.viewMode === 'grid' ? 'bg-primary-navy text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                  title={t('category.view.grid') || 'Izgara Görünümü'}
                >
                  <Grid size={18} />
                </button>
                <button 
                  onClick={() => onUpdateFilters({ viewMode: 'list' })}
                  className={`p-2 rounded-lg transition-colors ${filters.viewMode === 'list' ? 'bg-primary-navy text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                  title={t('category.view.list') || 'Liste Görünümü'}
                >
                  <List size={18} />
                </button>
              </div>

              <select 
                value={filters.sortBy}
                onChange={(e) => onUpdateFilters({ sortBy: e.target.value })}
                className="bg-white border-slate-200 rounded-xl text-sm font-bold text-slate-700 py-2.5 pl-4 pr-10 focus-visible:ring-primary-ocean/20 transition-colors shadow-sm"
                aria-label={t('category.sort.title') || 'Sıralama'}
              >
                {/* Fiyat sıralaması gizli: min_price Fiyat Motoru açılana dek ~hep NULL (F5-B §5.3). */}
                <option value="name">{t('category.sort.name')}</option>
                <option value="variants">{t('category.sort.variantCount')}</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className={filters.viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8" 
            : "flex flex-col gap-6"
          }>
            {families.map(family => (
              <FamilyCard
                key={family.id}
                family={family}
                layout={filters.viewMode}
              />
            ))}
          </div>

          {families.length === 0 && !loading && (
            <div className="py-32 text-center bg-white rounded-hvac-3xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">{t('category.noProductsFound')}</p>
            </div>
          )}
        </main>
      </div>
    </PageShell>
  )
}

export default CategoryGridView
