import { unstable_cache } from 'next/cache'
import { permanentRedirect } from 'next/navigation'
import React, { cache } from 'react'

import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { getDictValue } from '@/i18n/getDictValue'
import { getFamiliesEnriched } from '@/lib/services/family.service'
import { supabaseStaticClient as supabase } from '@/lib/supabase/static'
import { getCategoryDisplayName, getLocalizedCategorySlug } from '@/utils/categoryHelpers'

import { SITE_URL } from '../../../../../config/siteUrl'
import { discoveryTag, PRODUCTS_DISCOVERY_TAG } from '../../../../../lib/cache/tags'
import { getCachedCategoryData } from '../../../../../lib/data/preload'
import type { FamilyListItem } from '../../../../../types/ui-models'
import { getTenantConfig } from '../../../../../utils/tenantServer'
import PageComponent from '../../../../../views/CategoryPage'

/** F5-B W2.1 — sunucu sayfalaması: sayfa başına AİLE sayısı (üst kategori sayfasıyla aynı). */
const PAGE_SIZE = 24

/**
 * Alt kategori aile listesi önbelleği. Anahtar: lang + tenantId + kategori + sayfa (kural 12),
 * etiketler KEŞİF (discovery) alanı — ana sayfa (home-data) tag'i KULLANILMAZ (PS-042).
 */
const getCachedFamilies = (
  lang: string,
  tenantId: string,
  categoryId: string,
  page: number
) => unstable_cache(
  async () => getFamiliesEnriched(supabase, {
    categoryIds: [categoryId],
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE
  }),
  ['subcategory-families', lang, tenantId, categoryId, String(page)],
  { tags: [PRODUCTS_DISCOVERY_TAG, discoveryTag(tenantId)], revalidate: 3600 }
)()

/** `?page=` değerini 1-tabanlı güvenli tam sayıya çevirir. */
function parsePageParam(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw
  const parsed = Number.parseInt(value ?? '1', 10)
  return Number.isFinite(parsed) && parsed > 1 ? parsed : 1
}

// Üst kategorinin slug/metadata'sı (yönlendirme + hreflang için) — RSC ağacında tekilleştirilir.
const getParentSlugSource = cache(async (parentId: string) => {
  const { data } = await supabase
    .from('categories')
    .select('slug, metadata')
    .eq('id', parentId)
    .maybeSingle()

  return data
})

export async function generateStaticParams() {
  const { data } = await supabase
    .from('categories')
    .select('slug, metadata, parent_id')
    .eq('is_active', true)
    .not('parent_id', 'is', null)

  // Fetch parent slugs to populate categorySlug parameter
  const { data: parents } = await supabase
    .from('categories')
    .select('id, slug, metadata')
    .eq('is_active', true)

  const parentsList = (parents || []) as { id: string, slug: string | null, metadata: unknown }[]
  const parentMap = new Map<string, { slug: string | null, metadata: unknown }>(
    parentsList.map(p => [p.id, { slug: p.slug, metadata: p.metadata }])
  )

  const subCategoriesList = (data || []) as { slug: string | null, metadata: unknown, parent_id: string | null }[]
  // Her dil için hem üst hem alt segment O DİLİN görünen slug'ıyla üretilir.
  return subCategoriesList.flatMap((c) => {
    const parent = parentMap.get(c.parent_id || '')
    return (['tr', 'en'] as const).map((lang) => ({
      lang,
      categorySlug: parent ? getLocalizedCategorySlug(parent, lang) : 'unknown',
      subCategorySlug: getLocalizedCategorySlug(c, lang)
    }))
  })
}

/**
 * Aktif dil için beklenen (üst, alt) slug çiftini çözer.
 */
async function resolveLocalizedSegments(
  category: NonNullable<Awaited<ReturnType<typeof getCachedCategoryData>>>,
  lang: string,
  fallbackParentSlug: string
) {
  const subSlug = getLocalizedCategorySlug(category, lang)
  let parentSlug = fallbackParentSlug

  if (category.parent_id) {
    const parent = await getParentSlugSource(category.parent_id)
    if (parent) {
      parentSlug = getLocalizedCategorySlug(parent, lang) || fallbackParentSlug
    }
  }

  return { parentSlug, subSlug }
}

export async function generateMetadata({ params }: { params: Promise<{ categorySlug: string, subCategorySlug: string, lang: string }> }) {
  const { categorySlug, subCategorySlug, lang } = await params
  const category = await getCachedCategoryData(subCategorySlug)

  if (!category) {
    return {
      title: lang === 'en' ? 'Category Not Found | VentHub' : 'Kategori Bulunamadı | VentHub',
    }
  }

  // SSOT: kategori adı DAİMA getCategoryDisplayName üzerinden çözülür (bkz. üst kategori sayfası).
  const dict = lang === 'en' ? en : tr
  const t = (key: string) => getDictValue(dict, key)
  const displayName = getCategoryDisplayName(category, t)

  const desc = lang === 'en'
    ? `Explore the highest quality and most economical ventilation products in the ${displayName} category.`
    : `${displayName} kategorisindeki en kaliteli ve ekonomik havalandırma ürünlerini keşfedin.`

  const trSegments = await resolveLocalizedSegments(category, 'tr', categorySlug)
  const enSegments = await resolveLocalizedSegments(category, 'en', categorySlug)
  const trUrl = `${SITE_URL}/tr/category/${trSegments.parentSlug}/${trSegments.subSlug}`
  const enUrl = `${SITE_URL}/en/category/${enSegments.parentSlug}/${enSegments.subSlug}`
  const canonicalUrl = lang === 'en' ? enUrl : trUrl

  return {
    title: `${displayName} | VentHub`,
    description: desc,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        tr: trUrl,
        en: enUrl,
        'x-default': trUrl,
      },
    },
  }
}

export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{ categorySlug: string, subCategorySlug: string, lang: string }>
  searchParams: Promise<{ page?: string | string[] }>
}) {
  const { categorySlug, subCategorySlug, lang } = await params
  const { page: pageParam } = await searchParams
  const page = parsePageParam(pageParam)

  const category = await getCachedCategoryData(subCategorySlug)
  const dict = lang === 'en' ? en : tr

  // Her iki segment de aktif dilin görünen slug'ı olmalı; değilse birlikte düzelt (308).
  if (category) {
    const { parentSlug, subSlug } = await resolveLocalizedSegments(category, lang, categorySlug)
    if (subSlug && (subSlug !== subCategorySlug || parentSlug !== categorySlug)) {
      permanentRedirect(`/${lang}/category/${parentSlug}/${subSlug}`)
    }
  }

  let families: FamilyListItem[] = []
  let total = 0
  if (category) {
    const tenantId = (await getTenantConfig()).id
    const familiesPage = await getCachedFamilies(lang, tenantId, category.id, page)
    families = familiesPage.items
    total = familiesPage.total
  }

  return (
    <React.Suspense fallback={<div className="container mx-auto py-12 px-4 text-center text-slate-500">{dict.common.loading}</div>}>
      <PageComponent
        initialCategory={category}
        families={families}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
      />
    </React.Suspense>
  )
}
