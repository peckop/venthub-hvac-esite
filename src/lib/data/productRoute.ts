import type { FamilyDetail, SeriesLanding } from '@/lib/services/family.service'
import { localizedHref, Routes } from '@/utils/routes'

/**
 * T138-VH K1 — `/[lang]/products/[slug]` çözüm zinciri (saf karar katmanı).
 *
 * Zincir sayfanın içinde inline yaşıyordu ve test edilemiyordu; model katmanıyla birlikte
 * dallanma sayısı ikiye katlandığı için karar buraya, veri erişiminden AYRIK bir yere alındı.
 * Sayfa yalnız sonucu uygular (`permanentRedirect` / `notFound` / render).
 *
 * Sıra KASITLI:
 *   1. Aile + AKTİF VARYANT → PDP. (Aile slug'ı asla redirect üretmez → döngü yok.)
 *   2. Varyantsız aile satırı → SERİ mi? Öyleyse landing (200).
 *   3. Varyant slug'ı → kanonik aile URL'ine 308.
 *   4. Hiçbiri → GERÇEK 404.
 *
 * `unavailable` ayrı bir sınıftır ve 404 DEĞİLDİR: "veri yok" ile "veriye ulaşamadım"
 * aynı şey değil. Ağ/RPC hatasında 404 basmak, önbelleğe alınabilen kalıcı bir yokluk
 * beyanı üretirdi — geçici bir arıza SEO'da kalıcı hasara dönüşürdü.
 *
 * Cetvel: docs/standards/product-schema-standard.md §11.5 · docs/standards/rendering-cache-standard.md
 */
export type ProductRouteResolution =
  | { kind: 'family'; detail: FamilyDetail }
  | { kind: 'series'; landing: SeriesLanding }
  | { kind: 'redirect'; to: string }
  | { kind: 'not-found' }
  | { kind: 'unavailable' }

export interface ProductRouteDeps {
  familyDetail: (slug: string, lang: string) => Promise<FamilyDetail | null>
  seriesLanding: (slug: string) => Promise<SeriesLanding | null>
  variantBySlug: (slug: string) => Promise<{ sku: string; family_id: string | null } | null>
  familySlugById: (familyId: string) => Promise<string | null>
}

export async function resolveProductRoute(
  slug: string,
  lang: string,
  deps: ProductRouteDeps
): Promise<ProductRouteResolution> {
  try {
    // 1) Aile — ama AKTİF VARYANTI varsa. `get_family_detail` varyant şartı koymaz:
    // seri satırı da `family` döndürür, `variants` boş gelir. Boş varyant listesiyle
    // PDP'ye girmek, ürün detay sayfasında "ürün bulunamadı" kutusu demekti (soft-404).
    const detail = await deps.familyDetail(slug, lang)
    if (detail && detail.variants.length > 0) {
      return { kind: 'family', detail }
    }

    // 2) Seri landing.
    const landing = await deps.seriesLanding(slug)
    if (landing) {
      return { kind: 'series', landing }
    }

    // 3) Varyant slug'ı → kanonik aile URL'i (308 penceresi; products.slug DB'de kalır).
    const variant = await deps.variantBySlug(slug)
    if (variant?.family_id) {
      const familySlug = await deps.familySlugById(variant.family_id)
      if (familySlug && familySlug !== slug) {
        // Dil öneki ELLE kurulmaz — SSOT `localizedHref` (INV-2 · localized-route-ssot).
        // Elle birleştirme, tr/en dallarından biri unutulduğunda linki sessizce kıran sınıf.
        const base = localizedHref(Routes.product(familySlug), lang)
        return { kind: 'redirect', to: `${base}?sku=${encodeURIComponent(variant.sku)}` }
      }
    }

    // 4) Ne aile, ne seri, ne varyant. Varyantsız ve seri OLMAYAN aile de buraya düşer —
    // içi boş bir ürün sayfası 200 dönmemeli.
    return { kind: 'not-found' }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('fetch failed')) {
      console.warn(`Network fetch failed for family ${slug} (expected if Supabase env is missing)`)
    } else {
      console.warn(`Error resolving product route for ${slug}:`, err)
    }
    return { kind: 'unavailable' }
  }
}
