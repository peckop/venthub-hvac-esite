import React, { Suspense } from 'react'
import PageComponent from '../../../views/CategoryPage'
import { supabase } from '../../../lib/supabase'
import { mapDatabaseCategoryToDomain } from '../../../lib/type-converters'
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
  // @ts-expect-error - REASON: Supabase generated Json types do not overlap perfectly with custom UI models
  return mapDatabaseCategoryToDomain(data)
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
      canonical: `https://venthub-hvac.com/category/${categorySlug}`,
    },
  }
}

export default async function Page({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params
  const category = await getCategoryData(categorySlug)
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category?.name || categorySlug,
    "description": `${category?.name || categorySlug} kategorisindeki ürünler`,
    "url": `https://venthub-hvac.com/category/${categorySlug}`
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy" />
        </div>
      }>
        <PageComponent initialCategory={category} />
      </Suspense>
    </>
  )
}
