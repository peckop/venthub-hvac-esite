'use client'

import React from 'react'
import CategoryMasterView from './CategoryMasterView'
import type { DbProduct, DbCategory } from '../types/db-rows'

interface ProductsPageProps {
  initialProducts?: DbProduct[]
  initialCategories?: DbCategory[]
}

/**
 * @page ProductsPage
 * @description Tüm Ürünler (Global Katalog) giriş noktası.
 * UCS (Unified Category Shell) mimarisine bağlanarak merkezi hiyerarşi akışına dahil edilmiştir.
 */
const ProductsPage: React.FC<ProductsPageProps> = () => {
  return <CategoryMasterView initialCategory={null} />;
}

export default ProductsPage
