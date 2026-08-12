import type { Route } from 'next'
import { permanentRedirect } from 'next/navigation'

import { storagePathToUrl } from '@/lib/images/productImage'
import { getAllFamilySlugs } from '@/lib/services/family.service'
import { supabaseStaticClient as supabase } from '@/lib/supabase/static'

import { SITE_URL } from '../../../../config/siteUrl'
import {
  getCachedFamilyDetail,
  getCachedFamilySlugById,
  getCachedProductBySlug,
  preloadFamily,
} from '../../../../lib/data/preload'
import { ProductDetailPage as PageComponent } from '../../../_components/ProductDetailPageView'

/**
 * F5-B W2.2 — PDP artık AİLE (product_families) kanoniktir.
 * `/[lang]/products/[slug]` slug'ı bir AİLE slug'ıdır; belirli varyant `?sku=` ile
 * ön-seçilir (canonical/metadata URL'lerine GİRMEZ). Eski varyant slug'ları
 * 308 (permanentRedirect) ile aile URL'ine taşınır.
 */

type LocalizedText = { tr?: string | null; en?: string | null } | null

function pickLang(value: LocalizedText, lang: string): string | null {
  if (!value) return null
  const preferred = lang === 'en' ? value.en : value.tr
  return preferred || value.tr || value.en || null
}

export async function generateStaticParams() {
  try {
    // Yalnız AİLE slug'ları prerender edilir — varyant slug'ı statik yol üretmez.
    const families = await getAllFamilySlugs(supabase)

    return families
      .filter((f) => !!f.slug)
      .flatMap((f) => [
        { lang: 'tr', slug: f.slug },
        { lang: 'en', slug: f.slug },
      ])
  } catch (e) {
    console.warn('generateStaticParams error for product families:', e)
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string, slug: string }> }) {
  const { lang, slug } = await params
  preloadFamily(slug, lang)

  try {
    const detail = await getCachedFamilyDetail(slug, lang)

    if (detail) {
      const { family, variants } = detail
      // ?sku= canonical'a GİRMEZ — aile URL'i tek kanonik adrestir.
      const canonicalUrl = `${SITE_URL}/products/${family.slug}`
      const title = pickLang(family.meta_title, lang) || `${family.name} | VentHub`
      const description =
        pickLang(family.meta_description, lang) ||
        pickLang(family.description, lang)?.substring(0, 160) ||
        'VentHub Ürün Detayı'
      const coverPath = variants.find((v) => v.images.length > 0)?.images[0]?.path

      return {
        title,
        description,
        alternates: {
          canonical: canonicalUrl,
        },
        openGraph: {
          title,
          description,
          url: canonicalUrl,
          siteName: 'VentHub',
          images: [
            {
              url: coverPath ? storagePathToUrl(coverPath) : '/images/og-default.jpg',
              width: 1200,
              height: 630,
            },
          ],
          locale: lang === 'en' ? 'en_US' : 'tr_TR',
          type: 'website',
        },
      }
    }
  } catch (e) {
    console.warn('generateMetadata error for product family:', e)
  }

  return {
    title: 'Ürün Detayı | VentHub',
    description: 'VentHub Endüstriyel Havalandırma Sistemleri Ürün Detayı',
  }
}

export default async function Page({ params }: { params: Promise<{ lang: string, slug: string }> }) {
  const { lang, slug } = await params
  preloadFamily(slug, lang)

  let detail: Awaited<ReturnType<typeof getCachedFamilyDetail>> = null
  // Aile bulunamazsa: slug bir VARYANT slug'ı olabilir → 308 hedefi.
  let redirectTo: Route | null = null

  try {
    // 'generic' prerender tohumu veya Supabase env yoksa nazikçe geç.
    if (slug !== 'generic') {
      // 1) ÖNCE aile aranır → aile slug'ı asla redirect üretmez (döngü yok).
      detail = await getCachedFamilyDetail(slug, lang)

      if (!detail) {
        // 2) Varyant slug'ı mı? Ailesi varsa kanonik aile URL'ine 308.
        const variant = await getCachedProductBySlug(slug)
        if (variant?.family_id) {
          const familySlug = await getCachedFamilySlugById(variant.family_id)
          if (familySlug && familySlug !== slug) {
            redirectTo = `/${lang}/products/${familySlug}?sku=${encodeURIComponent(variant.sku)}` as Route
          }
        }
      }
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    if (errorMsg.includes('fetch failed')) {
      console.warn(`Network fetch failed for family ${slug} (expected if Supabase env is missing)`)
    } else {
      console.warn(`Error fetching family data for ${slug}:`, err)
    }
  }

  // permanentRedirect bir istisna fırlatır — try/catch DIŞINDA çağrılmalı.
  if (redirectTo) permanentRedirect(redirectTo)

  // 3) Ne aile ne varyant → mevcut "bulunamadı" davranışı (görünüm katmanında).
  const family = detail?.family ?? null
  const variants = detail?.variants ?? []
  const primaryVariant = variants[0] ?? null

  // W3.1 ProductGroup JSON-LD'sini yeniden yazacak — burada yalnız alan beslemesi
  // aile modeline uyarlandı, yapı KASITLI olarak korundu.
  const canonicalPath = family?.slug || 'generic'
  const coverPath = variants.find((v) => v.images.length > 0)?.images[0]?.path
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "productID": canonicalPath,
    "name": family?.name || "Product Details",
    "description": pickLang(family?.description ?? null, lang) || "VentHub Product Details",
    "url": `${SITE_URL}/products/${canonicalPath}`,
    ...(coverPath && { "image": storagePathToUrl(coverPath) }),
    ...(family?.brand_name && {
      "brand": {
        "@type": "Brand",
        "name": family.brand_name
      }
    }),
    "offers": {
      "@type": "Offer",
      "availability": (primaryVariant?.stock_qty ?? 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "price": primaryVariant?.price || "0.00",
      "priceCurrency": "TRY",
      "url": `${SITE_URL}/products/${canonicalPath}`
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
      />
      <PageComponent family={family} variants={variants} />
    </>
  )
}
