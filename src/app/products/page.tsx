import React, { Suspense } from 'react'
import ProductsPage from '../../views/ProductsPage'
import ProductsSkeleton from '../../components/products/ProductsSkeleton'
import { getCategories, getAllProducts } from '../../lib/supabase'

// This is now a Server Component
export default async function Page() {
  // Fetch initial data on the server (PostgreSQL speed is now direct!)
  const categoriesPromise = getCategories()
  const allProductsPromise = getAllProducts()

  // Pre-resolve brands to pass to the client component
  const [categories, allProducts] = await Promise.all([categoriesPromise, allProductsPromise])
  const initialBrands = Array.from(new Set(allProducts.map(p => p.brand).filter(Boolean))) as string[]

  return (
    <Suspense fallback={<ProductsSkeleton />}>
      {/* 
        We pass initial data from server to client component.
        LCP will be much faster because categories and brands are ready immediately.
      */}
      <ProductsPage 
        initialCategories={categories} 
        initialBrands={initialBrands.sort()} 
      />
    </Suspense>
  )
}
