import React, { cache } from 'react'
import PageComponent from '../../../../views/CategoryPage'
import { supabase, getProductsEnriched } from '../../../../lib/supabase'
import { mapDatabaseCategoryToDomain } from '../../../../lib/type-converters'
import type { DomainCategory, DomainProduct } from '../../../../lib/type-converters'
import type { DbCategory, CategoryMetadata, AuthorityContent } from '../../../../types/db-rows'
import { SITE_URL } from '../../../../config/siteUrl'
import { getCachedCategoryData, preloadCategory } from '../../../../lib/data/preload'

// React.cache() ile bağımsız Supabase ORM sorgusu (L10_05 Kurumsal Disiplini)
const _getCachedSupabaseData = cache((id: string) => {
  return supabase.from('categories').select('*').eq('id', id).single()
})


export async function generateStaticParams() {
  const { data } = await supabase
    .from('categories')
    .select('slug')
    .eq('is_active', true)
    
  const categoriesList = (data || []) as { slug: string | null }[]
  return categoriesList.flatMap((c) => [
    { lang: 'tr', categorySlug: c.slug || '' },
    { lang: 'en', categorySlug: c.slug || '' }
  ])
}

export async function generateMetadata({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params
  preloadCategory(categorySlug)
  const category = await getCachedCategoryData(categorySlug)
  
  if (!category) {
    return {
      title: 'Kategori Bulunamadı | VentHub',
    }
  }

  return {
    title: `${category.name} | VentHub`,
    description: `${category.name} kategorisindeki en kaliteli ve ekonomik havalandırma ürünlerini keşfenin.`,
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
  preloadCategory(categorySlug)
  const category = await getCachedCategoryData(categorySlug)
  
  let products: DomainProduct[] = []
  let subCategories: DomainCategory[] = []

  if (category) {
    // SSR: Alt kategorilerin tam verisini çek — client-side hydration race'ını ortadan kaldır
    const { data: subsData } = await supabase
      .from('categories')
      .select('id, name, parent_id, slug, is_active, sort_order, level, image_url, seo_title, seo_desc, created_at, updated_at, description, display_mode, is_featured, marketing_title, menu_label, metadata, translation_key, authority_content')
      .eq('parent_id', category.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    const categoriesArray = (subsData || []) as DbCategory[]
    subCategories = categoriesArray.map(s => mapDatabaseCategoryToDomain({
      ...s,
      name: s.name || '',
      menu_label: s.menu_label as string | null,
      marketing_title: s.marketing_title as string | null,
      translation_key: s.translation_key as string | null,
      description: s.description as string | null,
      metadata: s.metadata as CategoryMetadata | null,
      authority_content: s.authority_content as AuthorityContent | null
    } as DbCategory))

    const categoryIds = [category.id, ...subCategories.map(s => s.id)]

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
      <React.Suspense fallback={<div className="container mx-auto py-12 px-4 text-center text-slate-500">Yükleniyor...</div>}>
        <PageComponent initialCategory={category} initialProducts={products} initialSubCategories={subCategories} />
      </React.Suspense>
    </>
  )
}
