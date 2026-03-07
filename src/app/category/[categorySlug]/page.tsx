import React, { Suspense } from 'react'
import PageComponent from '../../../views/CategoryPage'
import { supabase } from '../../../lib/supabase'

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
      return [{ categorySlug: 'generic' }]
    }
    return paths
  } catch (e) {
    console.error('generateStaticParams error for all categories:', e)
    return [{ categorySlug: 'generic' }]
  }
}

export async function generateMetadata({ params }: { params: { categorySlug: string } }) {
  // Option: Fetch category detail here for true dynamic metadata.
  return {
    title: `${params.categorySlug} | VentHub Kategoriler`,
    description: `${params.categorySlug} kategorisindeki en iyi ürünleri keşfedin.`,
  }
}

export default function Page({ params }: { params: { categorySlug: string } }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${params.categorySlug} Kategorisi`,
    "description": `${params.categorySlug} kategorisindeki ürünler`,
    "url": `https://venthub.com/category/${params.categorySlug}`
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
        <PageComponent />
      </Suspense>
    </>
  )
}
