'use client'

import React from 'react'

import type { DomainCategory } from '../lib/type-converters'
import ProductsDiscoveryView from './ProductsDiscoveryView'

interface ProductsPageProps {
  initialCategories?: DomainCategory[]
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
