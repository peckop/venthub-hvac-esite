import React from 'react'
import PageComponent from '../../../../views/CategoryPage'
import { supabase, getProductsEnriched } from '../../../../lib/supabase'
import { mapDatabaseCategoryToDomain } from '../../../../lib/type-converters'
import type { DbCategory, CategoryMetadata, AuthorityContent } from '../../../../types/db-rows'
import type { DomainProduct } from '../../../../lib/type-converters'



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
    <PageComponent initialCategory={category} initialProducts={products} />
  )
}
