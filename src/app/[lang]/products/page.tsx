import { unstable_cache } from 'next/cache'
import React from 'react'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getProductsEnriched } from '@/lib/services/product.service'
import { supabaseStaticClient } from '@/lib/supabase/static'

import { TenantProvider } from '../../../hooks/useTenant'
import type { DomainProduct } from '../../../lib/type-converters'
import { getTenantConfig } from '../../../utils/tenantServer'
import CategoryMasterView from '../../../views/CategoryMasterView'

const getCachedProducts = (lang: string, tenantId: string) => unstable_cache(
  async () => getProductsEnriched(supabaseStaticClient, { limit: 100 }),
  ['products-discovery', lang, tenantId],
  { tags: ['products-discovery', `products-discovery-${tenantId}`], revalidate: false }
)()

/**
 * /products — Global Discovery Giriş Noktası
 * Bu sayfa artık merkezi CategoryMasterView omurgasını kullanır.
 * Kategori seçilmediği için sistem otomatik olarak 'Discovery' moduna geçecektir.
 */
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const tenantConfig = await getTenantConfig()
  const tenantId = tenantConfig.id
  const products: DomainProduct[] = await getCachedProducts(lang, tenantId)
  const dict = lang === 'en' ? en : tr

  return (
    <React.Suspense fallback={<div className="container mx-auto py-12 px-4 text-center text-slate-500">{dict.common.loading}</div>}>
      {/* initialCategory null olduğu için MasterView bunu Discovery olarak işleyecektir */}
      <TenantProvider value={tenantConfig}>
        <CategoryMasterView
          initialCategory={null}
          initialProducts={products}
        />
      </TenantProvider>
    </React.Suspense>
  )
}
