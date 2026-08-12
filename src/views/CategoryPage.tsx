'use client';

import React from 'react';

import type { DomainCategory } from '../lib/type-converters';
import type { FamilyListItem } from '../types/ui-models';
import CategoryMasterView from './CategoryMasterView';

export interface CategoryPageProps {
  initialCategory?: DomainCategory | null;
  /** F5-B W2.1: sunucudan gelen AİLE sayfası (varyant değil). */
  families?: FamilyListItem[];
  total?: number;
  page?: number;
  pageSize?: number;
  initialSubCategories?: DomainCategory[];
}

/**
 * @page CategoryPage
 * @description Dinamik Kategori Sayfası Giriş Noktası.
 * Tüm mantık ve sunum merkezi Unified Category Shell (CategoryMasterView) bileşenine delege edilmiştir.
 */
const CategoryPage: React.FC<CategoryPageProps> = ({ initialCategory, families, total, page, pageSize, initialSubCategories }) => {
  return (
    <CategoryMasterView
      initialCategory={initialCategory}
      families={families}
      total={total}
      page={page}
      pageSize={pageSize}
      initialSubCategories={initialSubCategories}
    />
  );
};

export default CategoryPage;
