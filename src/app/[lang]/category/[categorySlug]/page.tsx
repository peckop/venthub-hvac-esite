import React, { cache } from 'react'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getDictValue } from '@/i18n/getDictValue'
import { getProductsEnriched } from '@/lib/services/product.service'
import { supabaseStaticClient as supabase } from '@/lib/supabase/static'
import { getCategoryDisplayName } from '@/utils/categoryHelpers'

import { SITE_URL } from '../../../../config/siteUrl'
import { getCachedCategoryData, preloadCategory } from '../../../../lib/data/preload'
import type { DomainCategory, DomainProduct } from '../../../../lib/type-converters'
import { mapDatabaseCategoryToDomain } from '../../../../lib/type-converters'
import type { AuthorityContent,CategoryMetadata, DbCategory } from '../../../../types/db-rows'
import PageComponent from '../../../../views/CategoryPage'

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

export async function generateMetadata({ params }: { params: Promise<{ categorySlug: string, lang: string }> }) {
  const { categorySlug, lang } = await params
  preloadCategory(categorySlug)
  const category = await getCachedCategoryData(categorySlug)
  
  if (!category) {
    return {
      title: lang === 'en' ? 'Category Not Found | VentHub' : 'Kategori Bulunamadı | VentHub',
    }
  }

  // SSOT: kategori adı DAİMA getCategoryDisplayName üzerinden çözülür
  // (translation_key → menu_label → name). Server Component olduğumuz için useI18n yok;
  // t'yi aktif dilin sözlüğünden kuruyoruz — aksi halde TR sayfada ham İngilizce DB adı sızar.
  const dict = lang === 'en' ? en : tr
  const t = (key: string) => getDictValue(dict, key)
  const displayName = getCategoryDisplayName(category, t)

  const desc = lang === 'en'
    ? `Explore the highest quality and most economical ventilation products in the ${displayName} category.`
    : `${displayName} kategorisindeki en kaliteli ve ekonomik havalandırma ürünlerini keşfedin.`

  return {
    title: `${displayName} | VentHub`,
    description: desc,
    alternates: {
      canonical: `${SITE_URL}/category/${categorySlug}`,
    },
    openGraph: {
      title: `${displayName} | VentHub`,
      description: desc,
      url: `${SITE_URL}/category/${categorySlug}`,
      siteName: 'VentHub',
      images: [
        {
          url: category.image_url || '/images/og-default.jpg',
          width: 1200,
          height: 630,
        },
      ],
      locale: lang === 'en' ? 'en_US' : 'tr_TR',
      type: 'website',
    },
  }
}

export default async function Page({ params }: { params: Promise<{ categorySlug: string, lang: string }> }) {
  const { categorySlug, lang } = await params
  preloadCategory(categorySlug)
  const category = await getCachedCategoryData(categorySlug)
  const dict = lang === 'en' ? en : tr
  // SSOT: JSON-LD adı da sözlükten çözülür (bkz. generateMetadata yorumu)
  const t = (key: string) => getDictValue(dict, key)
  const displayName = getCategoryDisplayName(category, t) || categorySlug

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

    products = await getProductsEnriched(supabase, {
      categoryIds,
      limit: 100
    })
  }
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": displayName,
    "description": lang === 'en' ? `Products in category ${displayName}` : `${displayName} kategorisindeki ürünler`,
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
      <React.Suspense fallback={<div className="container mx-auto py-12 px-4 text-center text-slate-500">{dict.common.loading}</div>}>
        <PageComponent initialCategory={category} initialProducts={products} initialSubCategories={subCategories} />
      </React.Suspense>
    </>
  )
}
