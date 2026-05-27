import React from 'react'
import CategoryMasterView from '../../../views/CategoryMasterView'

import { getProductsEnriched } from '../../../lib/supabase'
import type { DomainProduct } from '../../../lib/type-converters'



import { unstable_cache } from 'next/cache'

const getCachedProducts = (lang: string) => unstable_cache(
  async () => getProductsEnriched({ limit: 100 }),
  ['products-discovery', lang],
  { tags: ['products-discovery', `products-discovery-${lang}`], revalidate: false }
)()

/**
 * /products — Global Discovery Giriş Noktası
 * Bu sayfa artık merkezi CategoryMasterView omurgasını kullanır.
 * Kategori seçilmediği için sistem otomatik olarak 'Discovery' moduna geçecektir.
 */
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const products: DomainProduct[] = await getCachedProducts(lang)

  return (
    <React.Suspense fallback={<div className="container mx-auto py-12 px-4 text-center text-slate-500">Yükleniyor...</div>}>
      {/* initialCategory null olduğu için MasterView bunu Discovery olarak işleyecektir */}
      <CategoryMasterView
        initialCategory={null}
        initialProducts={products}
      />
    </React.Suspense>
  )
}
