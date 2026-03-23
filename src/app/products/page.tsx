import React, { Suspense } from 'react'
import ProductsPage from '../../views/ProductsPage'
import ProductsSkeleton from '../../components/products/ProductsSkeleton'
import { getCategories } from '../../lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * /products — Sunucu Bileşeni (Server Component)
 * Girdi: Supabase'den kategoriler çekilir (SSR)
 * İşlem: ProductsPage'e initialCategories aktarılır
 * Çıktı: Client-side carousel + dinamik ürün listesi
 */
export default async function Page() {
  const categories = await getCategories()

  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsPage
        initialCategories={categories}
      />
    </Suspense>
  )
}
