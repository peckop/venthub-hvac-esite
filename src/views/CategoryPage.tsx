'use client';

import React from 'react';
import CategoryMasterView from './CategoryMasterView';
import type { DomainCategory, DomainProduct } from '../lib/type-converters';

export interface CategoryPageProps {
  initialCategory?: DomainCategory | null;
  initialProducts?: DomainProduct[];
}

/**
 * @page CategoryPage
 * @description Dinamik Kategori Sayfası Giriş Noktası. 
 * Tüm mantık ve sunum merkezi Unified Category Shell (CategoryMasterView) bileşenine delege edilmiştir.
 */
const CategoryPage: React.FC<CategoryPageProps> = ({ initialCategory, initialProducts }) => {
  return <CategoryMasterView initialCategory={initialCategory} initialProducts={initialProducts} />;
};

export default CategoryPage;
