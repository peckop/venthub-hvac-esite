import React from 'react'
import HomePage from '../views/HomePage'
import { getCategories, getProducts, type Product } from '../lib/supabase'
import { DomainCategory, toUICategoryList } from '../lib/type-converters'
import { tr } from '../i18n/dictionaries/tr'
import { en } from '../i18n/dictionaries/en'
import type { Metadata } from 'next'
import { SITE_URL } from '../config/siteUrl'
import { CategoryViewModelLite } from '../components/home/GuidedCategoryDiscovery'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const lang = (params.lang as string) === 'en' ? 'en' : 'tr'
  const dict = lang === 'en' ? en : tr

  const siteUrl = SITE_URL
  const canonical = `${siteUrl}${lang === 'en' ? '/?lang=en' : '/'}`

  return {
    title: dict.home.seoTitle,
    description: dict.home.seoDesc,
    alternates: {
      canonical: canonical,
      languages: {
        'tr-TR': `${siteUrl}/`,
        'en-US': `${siteUrl}/?lang=en`,
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

const getCachedHomeData = unstable_cache(
  async () => {
    const [catData, prodData] = await Promise.all([
      getCategories(),
      getProducts(12)
    ])
    return { catData, prodData }
  },
  ['home-page-data'],
  { revalidate: 3600 } // Cache for 1 hour to fix TTFB server response waterfall
)

export default async function RootPage({ searchParams }: Props) {
  const params = await searchParams
  const lang = (params.lang as string) === 'en' ? 'en' : 'tr'
  const dict = lang === 'en' ? en : tr

  let categories: DomainCategory[] = []
  let products: Product[] = []

  try {
    const { catData, prodData } = await getCachedHomeData()
    categories = toUICategoryList(catData)
    products = (prodData as Product[]) || []
  } catch (error) {
    console.error('SSR Data Fetch Error:', error)
  }

  const displayCategories: CategoryViewModelLite[] = categories
    .filter((c) => !c.parent_id)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(c => {
      type CategoryDict = Record<string, string | Record<string, string>>;
      const categoryListDict = dict.common?.categoryList as CategoryDict | undefined;
      const subListDict = categoryListDict?.sub as Record<string, string> | undefined;

      let translatedName = categoryListDict?.[c.slug] as string | undefined;
      if (!translatedName && typeof subListDict?.[c.slug] === 'string') {
        translatedName = subListDict[c.slug];
      }

      return {
        id: c.id,
        slug: c.slug,
        displayName: translatedName || c.menu_label || c.name,
        description: c.description || '',
        image_url: c.image_url
      }
    })

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
    <>
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
      />
    </>
  )
}
