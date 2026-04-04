import React from 'react'
import PageComponent from '../../../../views/CategoryPage'
import { supabase, getProductsEnriched } from '../../../../lib/supabase'
import { mapDatabaseCategoryToDomain } from '../../../../lib/type-converters'
import type { DbCategory } from '../../../../types/db-rows'
import type { DomainProduct } from '../../../../lib/type-converters'


export async function generateStaticParams() {
  try {
    // Veritabanından tüm kategorileri çek
    const { data: allCategories } = await supabase
      .from('categories')
      .select('id, slug, parent_id')
      .eq('is_active', true)

    if (!allCategories || allCategories.length === 0) {
      return []
    }

    // ID'leri slug'lara eşle
    const categoryMap = new Map(allCategories.map(c => [c.id, c.slug]))

    // Parent'ı olan her kategori için bir rota oluştur
    const paths = allCategories
      .filter(c => c.parent_id && categoryMap.has(c.parent_id))
      .map((c) => ({
        categorySlug: categoryMap.get(c.parent_id!) || 'generic',
        subCategorySlug: c.slug,
      }))

    if (paths.length === 0) {
      return []
    }
    return paths
  } catch (e) {
    console.error('generateStaticParams error for subcategories:', e)
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
  return mapDatabaseCategoryToDomain(data as unknown as DbCategory)
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
