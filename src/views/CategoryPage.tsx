'use client';

import React from 'react';
import CategoryMasterView from './CategoryMasterView';
import type { DomainCategory } from '../lib/type-converters';

export interface CategoryPageProps {
  initialCategory?: DomainCategory | null;
}

/**
 * @page CategoryPage
 * @description Dinamik Kategori Sayfası Giriş Noktası. 
 * Tüm mantık ve sunum merkezi Unified Category Shell (CategoryMasterView) bileşenine delege edilmiştir.
 */
const CategoryPage: React.FC<CategoryPageProps> = ({ initialCategory }) => {
  return <CategoryMasterView initialCategory={initialCategory} />;
};

export default CategoryPage;
