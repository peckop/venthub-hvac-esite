'use client';

import React, { useMemo } from 'react';
import { useCategoryGateway } from '../hooks/useCategoryGateway';
import { AuthorityRenderer } from '../components/authority/AuthorityRenderer';
// import CategoryShowcase from '../components/category/CategoryShowcase';
import CategoryHero from '../components/category/CategoryHero';
import Breadcrumb from '../components/navigation/Breadcrumb';
import { buildCategoryBreadcrumb } from '../utils/breadcrumbUtils';
import ProductsGrid from '../components/products/ProductsGrid';
import CategorySidebar from '../components/category/CategoryFilters';
import CategoryLanding from '../components/category/CategoryLanding';
import { useI18n } from '../i18n/I18nProvider';
// import { getCategoryDisplayName } from '../utils/categoryHelpers';
import { mapDomainCategoryToDatabase, mapDomainProductToDatabase } from '../lib/type-converters';
import type { DbCategory } from '../types/db-rows';
import { motion, AnimatePresence } from 'framer-motion';

interface CategoryMasterViewProps {
  initialCategory?: DbCategory | null;
}

/**
 * @view CategoryMasterView
 * @description VentHub Unified Category Shell (UCS). 
 * Tüm kategori seviyelerini (Ana, Alt, Seri) tek bir görsel çatı altında, 
 * kesintisiz bir UX ile yöneten merkezi bileşen.
 */
const CategoryMasterView: React.FC<CategoryMasterViewProps> = ({ initialCategory }) => {
  const { t } = useI18n();
  
  const {
    category,
    parentCategory,
    subCategories,
    products,
    filteredProducts,
    availableBrands,
    loading,
    filters,
    updateFilters,
    displayMode,
    groupedSeries
  } = useCategoryGateway(initialCategory);

  // --- STANDARD BREADCRUMB ---
  const breadcrumbItems = useMemo(() => {
    return buildCategoryBreadcrumb(category, parentCategory, t('category.breadcrumbHome'));
  }, [category, parentCategory, t]);

  // --- RENDER LOGIC: MORPHING CONTENT ---
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      );
    }

    if (!category) {
      return (
        <div className="flex-1 text-center py-20 px-4">
          <div className="max-w-md mx-auto bg-slate-50 rounded-[2rem] p-12 border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-4">{t('category.notFound')}</h2>
            <p className="text-slate-500 mb-8 font-medium">Aradığınız kategori bulunamadı veya taşınmış olabilir.</p>
            <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      );
    }

    // --- LEVEL 1: Visual Page Builder (Priority Authority) ---
    if (category.authority_content && Array.isArray(category.authority_content) && category.authority_content.length > 0) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AuthorityRenderer content={category.authority_content} />
        </motion.div>
      );
    }

    // --- LEVEL 2: Premium Landing / Showcase (Hava Perdeleri, Sessiz Fanlar vb.) ---
    const isSpecialCategory = ['hava-perdesi', 'sessiz-kanal-tipi-fanlar'].includes(category.slug);
    if (displayMode === 'showcase' || (displayMode === 'landing' && isSpecialCategory)) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full"
        >
          <CategoryLanding 
            category={mapDomainCategoryToDatabase(category)} 
            products={products.map(p => mapDomainProductToDatabase(p))}
            subCategories={subCategories.map(s => mapDomainCategoryToDatabase(s))}
            parentCategory={parentCategory ? mapDomainCategoryToDatabase(parentCategory) : null}
          />
        </motion.div>
      );
    }

    // --- LEVEL 3: Standard Product Grid or Series View ---
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-80 shrink-0">
          <CategorySidebar 
            category={category}
            parentCategory={parentCategory}
            subCategories={subCategories}
            filters={filters} 
            onUpdateFilters={updateFilters} 
            availableBrands={availableBrands}
          />
        </aside>
        
        <main className="flex-1">
          {displayMode === 'series' && groupedSeries.length > 0 ? (
            <div className="space-y-16">
              {groupedSeries.map((series, idx) => (
                <section key={series.name} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex items-baseline justify-between mb-8 border-b border-slate-100 pb-4">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                      {series.name} <span className="text-indigo-600">Serisi</span>
                    </h2>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{series.products.length} Versiyon</span>
                  </div>
                  <ProductsGrid 
                    products={series.products} 
                    viewMode={filters.viewMode} 
                    loading={loading}
                    onViewModeChange={(mode) => updateFilters({ viewMode: mode })}
                    onSortChange={(sort) => updateFilters({ sortBy: sort })}
                    sortBy={filters.sortBy}
                  />
                </section>
              ))}
            </div>
          ) : (
            <ProductsGrid 
              products={filteredProducts} 
              viewMode={filters.viewMode} 
              loading={loading}
              onViewModeChange={(mode) => updateFilters({ viewMode: mode })}
              onSortChange={(sort) => updateFilters({ sortBy: sort })}
              sortBy={filters.sortBy}
            />
          )}
        </main>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 1. SHARED HERO AREA (The Shell) */}
      <CategoryHero 
        category={category} 
        parentCategory={parentCategory}
        productCount={filteredProducts.length}
        loading={loading}
      />

      {/* 2. SHARED NAVIGATION (The Shell) */}
      <div className="sticky top-[64px] z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* 3. MORPHING BODY (Dönüşen İçerik) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={category?.id || 'loading'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CategoryMasterView;
