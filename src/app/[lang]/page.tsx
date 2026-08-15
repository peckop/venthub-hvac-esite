import type { Metadata } from 'next'
import React from 'react'

import { getCategories } from '@/lib/services/category.service'
import { getProducts } from '@/lib/services/product.service'
import { supabaseStaticClient } from '@/lib/supabase/static'
import type { Product } from '@/types/ui-models'

import { CategoryViewModelLite } from '../../components/home/GuidedCategoryDiscovery'
import { SITE_URL } from '../../config/siteUrl'
import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'
import { getDictValue } from '../../i18n/getDictValue'
import { DomainCategory, toUICategoryList } from '../../lib/type-converters'
import { getCategoryDisplayName, getLocalizedCategorySlug } from '../../utils/categoryHelpers'
import HomePage from '../../views/HomePage'

/**
 * ISR YEDEĞİ (1 saat) — birincil tazeleme yolu webhook'tur (`rendering-cache-standard.md` §3);
 * bu yalnız EMNİYET AĞIDIR. Yedek olmadan kaçan tek bir webhook sayfayı SONSUZA DEK eski
 * bırakır ve bunu hiçbir şey söylemez — 2026-08-15'te fiyatlar yazıldı, vitrin değişmedi.
 */
export const revalidate = 3600

export async function generateStaticParams() {
  return [
    { lang: 'tr' },
    { lang: 'en' }
  ]
}

type Props = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const dict = lang === 'en' ? en : tr

  const siteUrl = SITE_URL
  const canonical = `${siteUrl}/${lang}`

  return {
    title: dict.home.seoTitle,
    description: dict.home.seoDesc,
    alternates: {
      canonical: canonical,
      languages: {
        'tr-TR': `${siteUrl}/tr`,
        'en-US': `${siteUrl}/en`,
      },
    },
    openGraph: {
      title: dict.home.seoTitle,
      description: dict.home.seoDesc,
      url: siteUrl,
      siteName: 'VentHub',
      images: [
        {
          url: `${siteUrl}/images/hvac_heat_recovery_7.png`,
          width: 1200,
          height: 630,
        },
      ],
      locale: lang === 'en' ? 'en_US' : 'tr_TR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.home.seoTitle,
      description: dict.home.seoDesc,
      images: [`${siteUrl}/images/hvac_heat_recovery_7.png`],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

import { unstable_cache } from 'next/cache'

import { TenantProvider } from '../../hooks/useTenant'
import { HOME_DATA_TAG, homeDataTag } from '../../lib/cache/tags'
import { getTenantConfig } from '../../utils/tenantServer'

const getCachedHomeData = (lang: string, tenantId: string) => unstable_cache(
  async () => {
    const [catData, prodData, countRes] = await Promise.all([
      getCategories(supabaseStaticClient),
      getProducts(supabaseStaticClient, 12),
      supabaseStaticClient.rpc('get_category_counts')
    ])
    // Boş-kategori gizleme navigasyonla AYNI kural (CategoryContext ile tutarlı):
    // ürünü olmayan iskele kategoriler ana sayfa ızgarasında da görünmez.
    const productCounts: Record<string, number> = {}
    for (const row of countRes.data ?? []) {
      productCounts[row.category_id] = row.product_count ?? 0
    }
    return { catData, prodData, productCounts }
  },
  ['home-page-data', lang, tenantId],
  // revalidate: 3600 = emniyet kemeri — webhook sinyali kaçarsa (ör. deploy-sonrası sessizlik)
  // ana sayfa en fazla 1 saat bayat kalabilir. Sinyalli tazeleme (revalidateTag) aynen çalışır.
  { tags: [HOME_DATA_TAG, homeDataTag(tenantId)], revalidate: 3600 }
)()

export default async function RootPage({ params }: Props) {
  const { lang } = await params
  const dict = lang === 'en' ? en : tr

  const tenantConfig = await getTenantConfig()
  const tenantId = tenantConfig.id

  let categories: DomainCategory[] = []
  let products: Product[] = []
  let productCounts: Record<string, number> = {}

  try {
    const data = await getCachedHomeData(lang, tenantId)
    categories = toUICategoryList(data.catData)
    products = (data.prodData as Product[]) || []
    productCounts = data.productCounts
  } catch (error) {
    console.warn('SSR Data Fetch Error:', error)
  }

  // SSOT: kategori adı DAİMA getCategoryDisplayName üzerinden çözülür
  // (translation_key → menu_label → name). Server Component olduğumuz için useI18n yok;
  // t'yi aktif dilin sözlüğünden kuruyoruz. Doğrudan categoryList[slug] indekslemek
  // translation_key'i atlar ve yanlış/karışık dil üretirdi (2026-06 anasayfa bug'ı).
  const t = (key: string) => getDictValue(dict, key)

  const displayCategories: CategoryViewModelLite[] = categories
    .filter((c) => !c.parent_id && (productCounts[c.id] ?? 0) > 0)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(c => ({
      id: c.id,
      // Görünen slug dile göre (kanonik EN kolon → TR sayfada TR slug)
      slug: getLocalizedCategorySlug(c, lang),
      displayName: getCategoryDisplayName(c, t),
      description: c.description || '',
      image_url: c.image_url
    }))

  const siteUrl = SITE_URL

  const jsonLds = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "VentHub",
      "url": siteUrl,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteUrl}/products?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "VentHub",
      "url": siteUrl,
      "logo": `${siteUrl}/favicon.svg`,
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+90-544-245-0205",
        "contactType": "customer service"
      }
    }
  ]

  return (
    <TenantProvider value={tenantConfig}>
      {jsonLds.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
        />
      ))}
      <HomePage
        initialCategories={displayCategories}
        rawCategories={categories}
        initialProducts={products}
        dictionary={dict.home}
        lang={lang}
      />
    </TenantProvider>
  )
}
