import { unstable_cache } from 'next/cache'
import React from 'react'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getDictValue } from '@/i18n/getDictValue'
import { getCategories } from '@/lib/services/category.service'
import { getFamiliesEnriched } from '@/lib/services/family.service'
import { supabaseStaticClient } from '@/lib/supabase/static'

import { type CategoryViewModelLite } from '../../../components/home/GuidedCategoryDiscovery'
import { TenantProvider } from '../../../hooks/useTenant'
import { compareText } from '../../../i18n/sort'
import { discoveryTag, PRODUCTS_DISCOVERY_TAG } from '../../../lib/cache/tags'
import { toUICategoryList } from '../../../lib/type-converters'
import { getCategoryDescription, getCategoryDisplayName, getLocalizedCategorySlug } from '../../../utils/categoryHelpers'
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

/**
 * REC-213-A — keşif sayfasının KATEGORİ verisi.
 *
 * NİÇİN ANA SAYFANIN ÖNBELLEĞİ KULLANILMIYOR: `home-page-data` anahtarı ve
 * `HOME_DATA_TAG` etiketi ana sayfaya aittir; keşif yüzeyini oraya bağlamak
 * PS-042'nin reddettiği şeydir (bir yüzeyin tazelenmesi ötekini sessizce
 * ısıtır/soğutur). Aynı sorgular, KENDİ keşif etiketiyle.
 *
 * Anahtar `lang` VE `tenantId` içerir (kural 12) — dil ya da kiracı düşerse
 * bir kiracının kategori listesi ötekine servis edilirdi.
 */
const getCachedKategoriler = (lang: string, tenantId: string) => unstable_cache(
  async () => {
    const [catData, countRes] = await Promise.all([
      getCategories(supabaseStaticClient),
      supabaseStaticClient.rpc('get_category_counts'),
    ])
    const sayimlar: Record<string, number> = {}
    for (const row of countRes.data ?? []) {
      sayimlar[row.category_id] = row.product_count ?? 0
    }
    return { catData, sayimlar }
  },
  ['products-discovery-categories', lang, tenantId],
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

  // Kategori kapısı — ana sayfayla AYNI kurallar, bilerek birebir:
  //  · yalnız KÖK kategoriler (parent_id yok) ve yalnız ÜRÜNÜ OLANLAR (nav ile tutarlı;
  //    boş iskele kategoriye giden kapı, müşteriyi boş sayfaya götürürdü),
  //  · ad DAİMA getCategoryDisplayName (kural 7 — ham `name` render YASAK),
  //  · görünen slug dile göre getLocalizedCategorySlug,
  //  · açıklama dil-farkındalı çözücüden (REC-161).
  // Sunucu bileşeniyiz, `useI18n` yok: `t` aktif dilin sözlüğünden kurulur.
  const t = (key: string) => getDictValue(dict, key)
  let kategoriler: CategoryViewModelLite[] = []
  try {
    const { catData, sayimlar } = await getCachedKategoriler(lang, tenantId)
    kategoriler = toUICategoryList(catData)
      .filter((c) => !c.parent_id && (sayimlar[c.id] ?? 0) > 0)
      .sort((a, b) => compareText(a.name, b.name, lang))
      .map((c) => ({
        id: c.id,
        slug: getLocalizedCategorySlug(c, lang),
        displayName: getCategoryDisplayName(c, t),
        description: getCategoryDescription(c, lang),
        image_url: c.image_url,
      }))
  } catch (error) {
    // Kategori bloğu sayfanın EKİdir, şartı değil: veri düşerse ürün listesi yine gelir.
    // Sessiz yutmuyoruz — düşerse görünsün diye loglanıyor (ana sayfadaki desenin aynısı).
    console.warn('Kategori kapisi verisi alinamadi (/products):', error)
  }

  return (
    <React.Suspense fallback={<div className="container mx-auto py-12 px-4 text-center text-slate-500">{dict.common.loading}</div>}>
      {/* initialCategory null olduğu için MasterView bunu Discovery olarak işleyecektir */}
      <TenantProvider value={tenantConfig}>
        <CategoryMasterView
          initialCategory={null}
          kategoriler={kategoriler}
          families={families}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
        />
      </TenantProvider>
    </React.Suspense>
  )
}
