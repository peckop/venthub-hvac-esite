'use client';

import React from 'react';
import CategoryMasterView from './CategoryMasterView';
import type { DbCategory } from '../types/db-rows';

export interface CategoryPageProps {
  initialCategory?: DbCategory | null;
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
