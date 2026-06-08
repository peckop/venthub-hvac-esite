'use client';

import React from 'react';

import type { DomainCategory, DomainProduct } from '../lib/type-converters';
import CategoryMasterView from './CategoryMasterView';

export interface CategoryPageProps {
  initialCategory?: DomainCategory | null;
  initialProducts?: DomainProduct[];
  initialSubCategories?: DomainCategory[];
}

/**
 * @page CategoryPage
 * @description Dinamik Kategori Sayfası Giriş Noktası. 
 * Tüm mantık ve sunum merkezi Unified Category Shell (CategoryMasterView) bileşenine delege edilmiştir.
 */
const CategoryPage: React.FC<CategoryPageProps> = ({ initialCategory, initialProducts, initialSubCategories }) => {
  return <CategoryMasterView initialCategory={initialCategory} initialProducts={initialProducts} initialSubCategories={initialSubCategories} />;
};

export default CategoryPage;
