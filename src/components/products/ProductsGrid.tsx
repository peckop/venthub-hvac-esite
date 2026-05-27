'use client';

import React from 'react';
import { Grid, List } from 'lucide-react';
import ProductCard from '../ProductCard';
import { useI18n } from '../../i18n/I18nProvider';
import type { Product } from '../../lib/supabase';

interface ProductsGridProps {
  products: Product[];
  viewMode: 'grid' | 'list';
  loading?: boolean;
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onSortChange?: (sortBy: string) => void;
  sortBy?: string;
}

/**
 * @component ProductsGrid
 * @description Ürün listesini ızgara veya liste modunda görüntüleyen atomik bileşen.
 */
const ProductsGrid: React.FC<ProductsGridProps> = ({ 
  products, 
  viewMode, 
  loading,
  onViewModeChange,
  onSortChange,
  sortBy = 'name'
}) => {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
        <p className="text-sm font-medium text-slate-500">
          <span className="text-slate-900 font-bold">{products.length}</span> {t('category.productsCount') || 'ürün bulundu'}
        </p>
        
        <div className="flex items-center gap-6">
          {onViewModeChange && (
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <button 
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-navy text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                title={t('category.view.grid') || 'Izgara Görünümü'}
              >
                <Grid size={18} />
              </button>
              <button 
                type="button"
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-navy text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                title={t('category.view.list') || 'Liste Görünümü'}
              >
                <List size={18} />
              </button>
            </div>
          )}

          {onSortChange && (
            <div className="relative">
              <select 
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="bg-white border-slate-200 rounded-xl text-sm font-bold text-slate-700 py-2.5 pl-4 pr-10 focus-visible:ring-primary-ocean/20 transition-colors shadow-sm appearance-none"
                aria-label={t('category.sort.title') || 'Sıralama'}
              >
                <option value="name">{t('category.sort.name') || 'İsim'}</option>
                <option value="price-low">{t('category.sort.priceLow') || 'Düşük Fiyat'}</option>
                <option value="price-high">{t('category.sort.priceHigh') || 'Yüksek Fiyat'}</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                {/* Custom arrow icon could go here if needed */}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid/List Content */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8" 
        : "flex flex-col gap-6"
      }>
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            layout={viewMode} 
          />
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="py-20 text-center bg-slate-50 rounded-hvac-xl border border-dashed border-slate-200">
          <p className="text-slate-400 font-medium">{t('category.noProductsFound') || 'Ürün bulunamadı.'}</p>
        </div>
      )}
    </div>
  );
};

export default ProductsGrid;
