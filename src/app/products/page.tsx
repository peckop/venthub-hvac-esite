import React, { Suspense } from 'react'
import CategoryMasterView from '../../views/CategoryMasterView'
import ProductsSkeleton from '../../components/products/ProductsSkeleton'
import { getProductsEnriched } from '../../lib/supabase'
import type { DomainProduct } from '../../lib/type-converters'



export const dynamic = 'force-dynamic'

/**
 * /products — Global Discovery Giriş Noktası
 * Bu sayfa artık merkezi CategoryMasterView omurgasını kullanır.
 * Kategori seçilmediği için sistem otomatik olarak 'Discovery' moduna geçecektir.
 */
export default async function Page() {
  const products: DomainProduct[] = await getProductsEnriched({ limit: 100 })

  return (
    <Suspense fallback={<ProductsSkeleton />}>
      {/* initialCategory null olduğu için MasterView bunu Discovery olarak işleyecektir */}
      <CategoryMasterView
        initialCategory={null}
        initialProducts={products}
      />
    </Suspense>
  )
}
