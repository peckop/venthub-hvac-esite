import React from 'react'
import PageComponent from '../../../views/CategoryPage'
import { supabase, getProductsEnriched } from '../../../lib/supabase'
import { mapDatabaseCategoryToDomain } from '../../../lib/type-converters'
import type { DomainProduct } from '../../../lib/type-converters'
import type { DbCategory, CategoryMetadata, AuthorityContent } from '../../../types/db-rows'
import { SITE_URL } from '../../../config/siteUrl'

export async function generateStaticParams() {
  try {
    const { data: categories } = await supabase
      .from('categories')
      .select('slug')
      .eq('is_active', true)

    const paths = (categories || []).map((c) => ({
      categorySlug: c.slug,
    }))

    if (paths.length === 0) {
      return []
    }
    return paths
  } catch (e) {
    console.error('generateStaticParams error for all categories:', e)
    return []
  }
}

async function getCategoryData(slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error || !data) return null
  return mapDatabaseCategoryToDomain({
    ...data,
    name: data.name || '',
    menu_label: data.menu_label as string | null,
    marketing_title: data.marketing_title as string | null,
    translation_key: data.translation_key as string | null,
    description: data.description as string | null,
    metadata: data.metadata as CategoryMetadata | null,
    authority_content: data.authority_content as AuthorityContent | null
  } as DbCategory)
}

export async function generateMetadata({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params
  const category = await getCategoryData(categorySlug)
  
  if (!category) {
    return {
      title: 'Kategori Bulunamadı | VentHub',
    }
  }

  return {
    title: `${category.name} | VentHub`,
    description: `${category.name} kategorisindeki en kaliteli ve ekonomik havalandırma ürünlerini keşfedin.`,
    alternates: {
      canonical: `${SITE_URL}/category/${categorySlug}`,
    },
    openGraph: {
      title: `${category.name} | VentHub`,
      description: `${category.name} kategorisindeki en kaliteli ve ekonomik havalandırma ürünlerini keşfedin.`,
      url: `${SITE_URL}/category/${categorySlug}`,
      siteName: 'VentHub',
      images: [
        {
          url: category.image_url || '/images/og-default.jpg',
          width: 1200,
          height: 630,
        },
      ],
      locale: 'tr_TR',
      type: 'website',
    },
  }
}

export default async function Page({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params
  const category = await getCategoryData(categorySlug)
  
  let products: DomainProduct[] = []
  if (category) {
    // Kategoriye ait varsa alt kategorilerin ID'lerini topla (SSR)
    const { data: subsData } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', category.id)
      .eq('is_active', true)
      
    const categoryIds = [category.id, ...(subsData?.map(s => s.id) || [])]
    
    products = await getProductsEnriched({
      categoryIds,
      limit: 100
    })
  }
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category?.name || categorySlug,
    "description": `${category?.name || categorySlug} kategorisindeki ürünler`,
    "url": `${SITE_URL}/category/${categorySlug}`,
    "numberOfItems": products.length,
    "itemListElement": products
      .filter((prod) => prod.slug)
      .map((prod, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${SITE_URL}/products/${prod.slug}`
      }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
      />
      <PageComponent initialCategory={category} initialProducts={products} />
    </>
  )
}
