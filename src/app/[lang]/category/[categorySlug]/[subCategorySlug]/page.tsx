import React from 'react'
import PageComponent from '../../../../../views/CategoryPage'
import { supabaseStaticClient as supabase } from '@/lib/supabase/static'
import { getProductsEnriched } from '@/lib/services/product.service'
import { mapDatabaseCategoryToDomain } from '../../../../../lib/type-converters'
import type { DbCategory, CategoryMetadata, AuthorityContent } from '../../../../../types/db-rows'
import type { DomainProduct } from '../../../../../lib/type-converters'



async function getCategoryData(slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, parent_id, slug, is_active, sort_order, level, image_url, seo_title, seo_desc, created_at, updated_at, description, display_mode, is_featured, marketing_title, menu_label, metadata, translation_key, authority_content')
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

export async function generateStaticParams() {
  const { data } = await supabase
    .from('categories')
    .select('slug, parent_id')
    .eq('is_active', true)
    .not('parent_id', 'is', null)

  // Fetch parent slugs to populate categorySlug parameter
  const { data: parents } = await supabase
    .from('categories')
    .select('id, slug')
    .eq('is_active', true)

  const parentsList = (parents || []) as { id: string, slug: string | null }[]
  const parentMap = new Map<string, string>(parentsList.map(p => [p.id, p.slug || '']))

  const subCategoriesList = (data || []) as { slug: string | null, parent_id: string | null }[]
  return subCategoriesList.flatMap((c) => {
    const parentSlug = parentMap.get(c.parent_id || '') || 'unknown'
    return [
      { lang: 'tr', categorySlug: parentSlug, subCategorySlug: c.slug || '' },
      { lang: 'en', categorySlug: parentSlug, subCategorySlug: c.slug || '' }
    ]
  })
}

export default async function Page({ params }: { params: Promise<{ categorySlug: string, subCategorySlug: string }> }) {
  const { subCategorySlug } = await params
  
  const category = await getCategoryData(subCategorySlug)
  
  let products: DomainProduct[] = []
  if (category) {
    products = await getProductsEnriched({
      categoryIds: [category.id],
      limit: 100
    })
  }

  return (
    <React.Suspense fallback={<div className="container mx-auto py-12 px-4 text-center text-slate-500">Yükleniyor...</div>}>
      <PageComponent initialCategory={category} initialProducts={products} />
    </React.Suspense>
  )
}
