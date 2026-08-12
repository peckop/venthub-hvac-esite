import { unstable_cache } from 'next/cache'
import React from 'react'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getFamiliesEnriched } from '@/lib/services/family.service'
import { supabaseStaticClient } from '@/lib/supabase/static'

import { TenantProvider } from '../../../hooks/useTenant'
import { discoveryTag, PRODUCTS_DISCOVERY_TAG } from '../../../lib/cache/tags'
import { getTenantConfig } from '../../../utils/tenantServer'
import CategoryMasterView from '../../../views/CategoryMasterView'

/** F5-B W2.1 — sunucu sayfalaması: sayfa başına AİLE sayısı (kategori sayfalarıyla aynı). */
const PAGE_SIZE = 24

const getCachedFamilies = (lang: string, tenantId: string, page: number) => unstable_cache(
  async () => getFamiliesEnriched(supabaseStaticClient, {
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE
  }),
  ['products-discovery-families', lang, tenantId, String(page)],
  // revalidate: 3600 = emniyet kemeri — webhook sinyali kaçarsa (ör. deploy-sonrası sessizlik)
  // liste en fazla 1 saat bayat kalabilir. Sinyalli tazeleme (revalidateTag) aynen çalışır.
  // (Ana sayfadaki (src/app/[lang]/page.tsx) desenle aynı emniyet kemeri.)
  { tags: [PRODUCTS_DISCOVERY_TAG, discoveryTag(tenantId)], revalidate: 3600 }
)()

/** `?page=` değerini 1-tabanlı güvenli tam sayıya çevirir. */
function parsePageParam(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw
  const parsed = Number.parseInt(value ?? '1', 10)
  return Number.isFinite(parsed) && parsed > 1 ? parsed : 1
}

/**
 * /products — Global Discovery Giriş Noktası
 * Bu sayfa artık merkezi CategoryMasterView omurgasını kullanır.
 * Kategori seçilmediği için sistem otomatik olarak 'Discovery' moduna geçecektir.
 * F5-B W2.1: liste birimi varyant değil AİLE satırıdır (374 varyant → 32 aile).
 */
export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ page?: string | string[] }>
}) {
  const { lang } = await params
  const { page: pageParam } = await searchParams
  const page = parsePageParam(pageParam)
  const tenantConfig = await getTenantConfig()
  const tenantId = tenantConfig.id
  const { items: families, total } = await getCachedFamilies(lang, tenantId, page)
  const dict = lang === 'en' ? en : tr

  return (
    <React.Suspense fallback={<div className="container mx-auto py-12 px-4 text-center text-slate-500">{dict.common.loading}</div>}>
      {/* initialCategory null olduğu için MasterView bunu Discovery olarak işleyecektir */}
      <TenantProvider value={tenantConfig}>
        <CategoryMasterView
          initialCategory={null}
          families={families}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
        />
      </TenantProvider>
    </React.Suspense>
  )
}
