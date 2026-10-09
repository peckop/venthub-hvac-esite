import { unstable_cache } from 'next/cache'

import { discoveryTag, PRODUCTS_DISCOVERY_TAG } from '@/lib/cache/tags'
import { getSiteSayaclari, type SiteSayaclari } from '@/lib/services/siteSayaclari.service'
import { supabaseStaticClient } from '@/lib/supabase/static'

/**
 * HAKKIMIZDA SAYAÇLARI — önbellek sarmalı (URN-75).
 *
 * TAZELEME: sayılar `products` (status/family_id/deleted_at), `product_families` ve `brands` satırlarından türer;
 * webhook bu üç tabloda zaten KEŞİF etiketini (`PRODUCTS_DISCOVERY_TAG` + kiracı etiketi) tazeler, yani yeni
 * tetik/handler dalı gerekmez (rendering-cache-standard §3). `revalidate: 3600` emniyet kemeri: sinyal kaçarsa
 * sayı en fazla 1 saat bayat kalır. Anahtar `lang` ve `tenantId` içerir (kural 12).
 *
 * Hata önbelleğe YAZILMAZ (sarmal fırlatır) ve çağıran `null` alır: sayfa sayaç kartlarını çizmez, uydurma ya da
 * eski sayı basmaz.
 */
const getCachedSiteSayaclari = (lang: string, tenantId: string) => unstable_cache(
  async () => getSiteSayaclari(supabaseStaticClient),
  ['site-sayaclari', lang, tenantId],
  { tags: [PRODUCTS_DISCOVERY_TAG, discoveryTag(tenantId)], revalidate: 3600 }
)()

export async function siteSayaclariOku(lang: string, tenantId: string): Promise<SiteSayaclari | null> {
  try {
    return await getCachedSiteSayaclari(lang, tenantId)
  } catch (hata) {
    console.error('[hakkimizda] sayaçlar okunamadı, kartlar çizilmeyecek', hata)
    return null
  }
}
