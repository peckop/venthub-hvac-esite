import React, { Suspense } from 'react'
import PageComponent from '../../../../views/CategoryPage'
import { supabase } from '../../../../lib/supabase'


export async function generateStaticParams() {
  try {
    // Veritabanından tüm kategorileri çek
    const { data: allCategories } = await supabase
      .from('categories')
      .select('id, slug, parent_id')
      .eq('is_active', true)

    if (!allCategories || allCategories.length === 0) {
      return [{ categorySlug: 'generic', subCategorySlug: 'generic' }]
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
      return [{ categorySlug: 'generic', subCategorySlug: 'generic' }]
    }
    return paths
  } catch (e) {
    console.error('generateStaticParams error for subcategories:', e)
    return [{ categorySlug: 'generic', subCategorySlug: 'generic' }]
  }
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy" />
      </div>
    }>
      <PageComponent />
    </Suspense>
  )
}
