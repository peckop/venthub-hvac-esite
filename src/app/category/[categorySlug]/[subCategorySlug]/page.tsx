import React, { Suspense } from 'react'
import PageComponent from '../../../../views/CategoryPage'
import { supabase } from '../../../../lib/supabase'

export const dynamicParams = false

export async function generateStaticParams() {
  // Veritabanından hem parent hem child slug'larını çek
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, parent_id')
    .not('parent_id', 'is', null)

  if (!categories || categories.length === 0) return []

  // Parent ID'leri için slug'ları önbelleğe al
  const { data: parents } = await supabase
    .from('categories')
    .select('id, slug')
    .is('parent_id', null)

  const parentMap = new Map((parents || []).map(p => [p.id, p.slug]))

  return categories
    .filter(c => parentMap.has(c.parent_id))
    .map((c) => ({
      categorySlug: parentMap.get(c.parent_id),
      subCategorySlug: c.slug,
    }))
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
