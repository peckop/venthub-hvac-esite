'use client'

import React from 'react'
import ProductsDiscoveryView from './ProductsDiscoveryView'
import type { DbCategory } from '../types/db-rows'

interface ProductsPageProps {
  initialCategories?: DbCategory[]
}

/**
 * @page ProductsPage
 * @description "Ürünleri Keşfet" giriş noktası — ProductsDiscoveryView wrapper'ı.
 * SSR'dan gelen kategorileri iletir.
 */
const ProductsPage: React.FC<ProductsPageProps> = ({ initialCategories }) => {
  return <ProductsDiscoveryView initialCategories={initialCategories} />
}

export default ProductsPage
