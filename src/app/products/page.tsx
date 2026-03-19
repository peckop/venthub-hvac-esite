import React, { Suspense } from 'react'
import ProductsPage from '../../views/ProductsPage'
import ProductsSkeleton from '../../components/products/ProductsSkeleton'
import { getCategories, getProductsEnriched, type Product } from '../../lib/supabase'
import type { DbCategory } from '../../types/db-rows'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function getAllDescendantIds(categories: DbCategory[], rootId: string): string[] {
  let ids = [rootId]
  const children = categories.filter(c => c.parent_id === rootId)
  for (const child of children) {
    ids = ids.concat(getAllDescendantIds(categories, child.id))
  }
  return ids
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  const categories = await getCategories()

  const qParam = typeof params.q === 'string' ? params.q : ''
  const catParam = typeof params.category === 'string' ? params.category : null
  const brandsParam = typeof params.brands === 'string' ? [params.brands] : (Array.isArray(params.brands) ? params.brands : [])
  const minPriceParam = typeof params.min_price === 'string' ? params.min_price : null
  const maxPriceParam = typeof params.max_price === 'string' ? params.max_price : null

  const isAll = params.all === 'true'
  const hasFilters = catParam || brandsParam.length > 0 || minPriceParam || maxPriceParam || qParam

  let initialProducts: Product[] = []

  if (hasFilters) {
    const categoryIds = catParam ? getAllDescendantIds(categories as unknown as DbCategory[], catParam) : undefined
    initialProducts = await getProductsEnriched({
      searchQuery: qParam || undefined,
      categoryIds,
      brand: brandsParam[0],
      minPrice: minPriceParam ? Number(minPriceParam) : undefined,
      maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
      limit: 50
    })
  } else if (isAll) {
    initialProducts = await getProductsEnriched({ limit: 1000 })
  }

  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsPage 
        initialCategories={categories} 
        initialProducts={initialProducts}
      />
    </Suspense>
  )
}
