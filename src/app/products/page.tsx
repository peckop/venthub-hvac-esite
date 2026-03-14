import React, { Suspense } from 'react'
import ProductsPage from '../../views/ProductsPage'
import ProductsSkeleton from '../../components/products/ProductsSkeleton'
import { getCategories, getAllProducts } from '../../lib/supabase'

export const dynamic = 'force-dynamic' // Ensure fresh data on each request

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Page({ searchParams }: PageProps) {
  // Fetch initial data on the server (PostgreSQL speed is now direct!)
  const categoriesPromise = getCategories()
  const allProductsPromise = getAllProducts()

  const [categories, allProducts] = await Promise.all([categoriesPromise, allProductsPromise])
  const initialBrands = Array.from(new Set(allProducts.map(p => p.brand).filter(Boolean))) as string[]

  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsPage 
        initialCategories={categories} 
        initialBrands={initialBrands.sort()}
        serverSearchParams={searchParams} // Pass params from server
      />
    </Suspense>
  )
}
