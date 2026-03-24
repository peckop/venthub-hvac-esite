import React, { Suspense } from 'react'
import CategoryMasterView from '../../views/CategoryMasterView'
import ProductsSkeleton from '../../components/products/ProductsSkeleton'



export const dynamic = 'force-dynamic'

/**
 * /products — Global Discovery Giriş Noktası
 * Bu sayfa artık merkezi CategoryMasterView omurgasını kullanır.
 * Kategori seçilmediği için sistem otomatik olarak 'Discovery' moduna geçecektir.
 */
export default async function Page() {
  
  

  return (
    <Suspense fallback={<ProductsSkeleton />}>
      {/* initialCategory null olduğu için MasterView bunu Discovery olarak işleyecektir */}
      <CategoryMasterView
        initialCategory={null}
      />
    </Suspense>
  )
}
