import { ADRES_SEMASI_K3B } from '@/config/features'
import type { FamilyDetail, SeriesLanding } from '@/lib/services/family.service'
import { adresUret, yonlendirmeNesnesi } from '@/utils/adresUret'
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
 *   4. Eski adres (`url_takma_adlari`, REC-300 Faz 1-A): yeniden adlandırılmış ürün ya da aile
 *      slug'ı → bugünkü aile URL'ine 308. Tabloyu DB tetiği doldurur; elle config satırı gerekmez.
 *   5. Hiçbiri → GERÇEK 404.
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
  /**
   * `to` = bugünkü şemadaki hedef (aile adresi, gerekirse `?sku=`). `hedef` = aynı hedefin KİMLİĞİ;
   * K3-b eski TR adresi (REC-300 Faz 3b-2) yeni adresi `adresUret`'le buradan kurar — `to`'yu ayrıştırmaz.
   */
  | { kind: 'redirect'; to: string; hedef: { aileSlug: string; sku: string | null } }
  | { kind: 'not-found' }
  | { kind: 'unavailable' }

export interface ProductRouteDeps {
  familyDetail: (slug: string, lang: string) => Promise<FamilyDetail | null>
  seriesLanding: (slug: string) => Promise<SeriesLanding | null>
  variantBySlug: (slug: string) => Promise<{ sku: string; family_id: string | null } | null>
  familySlugById: (familyId: string) => Promise<string | null>
  /** Eski slug → hedef kimliği (`url_takma_ad_coz`; kiracı sorgunun içinde süzülür). Hata FIRLATIR. */
  takmaAd: (tur: 'urun' | 'aile', lang: string, slug: string) => Promise<string | null>
  /** Ürün kimliği → SKU + aile. Hata FIRLATIR (rota kararı yutulmuş hatayı 404'e çevirmesin). */
  variantById: (productId: string) => Promise<{ sku: string; family_id: string | null } | null>
}

const UUID_DESENI = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Yönlendirme hedefinin ADRESİ (REC-300 Faz 3d). KAPALI (bugün): aile adresi + `?sku=` — ifade bugünkünün
 * aynısı. AÇIK (plan §2, "`?sku=` kalkar"): yayındaki listedeki SKU'nun kendi adresi `adresUret` ile (adres
 * metni listeden: istenen slug da UUID de adrese yazılmaz); liste dışı SKU → aile adresi, sorgusuz (URN-31).
 */
function hedefAdresi(
  familySlug: string,
  sku: string | null,
  lang: string,
  bayrak: boolean,
): string {
  if (!bayrak) {
    const base = localizedHref(Routes.product(familySlug), lang)
    return sku ? `${base}?sku=${encodeURIComponent(sku)}` : base
  }
  const dil = lang === 'en' ? 'en' : 'tr'
  // URN-31: liste içi SKU → modelin adresi (metin listeden; istenen slug ve UUID adrese yazılmaz); liste dışı SKU ya
  // da SKU yok → aile adresi, SORGUSUZ.
  return adresUret(sku ? yonlendirmeNesnesi(familySlug, sku) : { tur: 'aile', slug: familySlug }, dil, true)
}

export async function resolveProductRoute(
  slug: string,
  lang: string,
  deps: ProductRouteDeps,
  /** K3-b şeması — yalnız test verir (varsayılan `ADRES_SEMASI_K3B`). */
  bayrak: boolean = ADRES_SEMASI_K3B,
): Promise<ProductRouteResolution> {
  try {
    // 0) UUID adresi (REC-300 Faz 3 madde 6, REC-289) — YALNIZ bayrak açıkken. Bugün UUID'yi
    // middleware Edge'de DB'ye sorarak çözüyor (kural 12: Edge'de DB sorgusu yasak); bayrak açıkken
    // middleware o dalı atlar ve karar burada, sayfa katmanında verilir. Hata FIRLAR (catch →
    // `unavailable`), bulunamazsa 404 — UUID hiçbir aile/seri/varyant slug'ı olamaz.
    if (bayrak && UUID_DESENI.test(slug)) {
      const urun = await deps.variantById(slug)
      const familySlug = urun?.family_id ? await deps.familySlugById(urun.family_id) : null
      if (!urun || !familySlug) return { kind: 'not-found' }
      return {
        kind: 'redirect',
        to: hedefAdresi(familySlug, urun.sku, lang, bayrak),
        hedef: { aileSlug: familySlug, sku: urun.sku },
      }
    }

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
        return {
          kind: 'redirect',
          to: hedefAdresi(familySlug, variant.sku, lang, bayrak),
          hedef: { aileSlug: familySlug, sku: variant.sku },
        }
      }
    }

    // 4) Eski adres — yeniden adlandırılmış ürün ya da aile (REC-300 Faz 1-A). Hedef bugünkü
    // aile URL'i; hedef bu slug'ın kendisiyse yönlendirme üretilmez (döngü yok).
    const urunId = await deps.takmaAd('urun', lang, slug)
    if (urunId) {
      const hedef = await deps.variantById(urunId)
      if (hedef?.family_id) {
        const familySlug = await deps.familySlugById(hedef.family_id)
        if (familySlug && familySlug !== slug) {
          return {
            kind: 'redirect',
            to: hedefAdresi(familySlug, hedef.sku, lang, bayrak),
            hedef: { aileSlug: familySlug, sku: hedef.sku },
          }
        }
      }
    }
    const aileId = await deps.takmaAd('aile', lang, slug)
    if (aileId) {
      const familySlug = await deps.familySlugById(aileId)
      if (familySlug && familySlug !== slug) {
        return {
          kind: 'redirect',
          to: hedefAdresi(familySlug, null, lang, bayrak),
          hedef: { aileSlug: familySlug, sku: null },
        }
      }
    }

    // 5) Ne aile, ne seri, ne varyant, ne eski adres. Varyantsız ve seri OLMAYAN aile de buraya düşer —
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
