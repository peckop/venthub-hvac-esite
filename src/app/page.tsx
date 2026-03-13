import React from 'react'
import HomePage from '../views/HomePage'
import { getCategories, getProducts, type Category, type Product } from '../lib/supabase'
import { tr } from '../i18n/dictionaries/tr'
import { en } from '../i18n/dictionaries/en'
import type { Metadata } from 'next'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const lang = (params.lang as string) === 'en' ? 'en' : 'tr'
  const dict = lang === 'en' ? en : tr

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://venthub-hvac.com'
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

export default async function RootPage({ searchParams }: Props) {
  const params = await searchParams

  // Değişkenleri doğru tiplerle tanımlayarak 'never[]' hatasını engelliyoruz
  let categories: Category[] = []
  let products: Product[] = []

  try {
    const [catData, prodData] = await Promise.all([
      getCategories(),
      getProducts(12)
    ])
    categories = (catData as Category[]) || []
    products = (prodData as Product[]) || []
  } catch (error) {
    console.error('SSR Data Fetch Error:', error)
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://venthub-hvac.com'

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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}
      <HomePage initialCategories={categories} initialProducts={products} />
    </>
  )
}
