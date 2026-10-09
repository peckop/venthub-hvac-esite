import { notFound, permanentRedirect } from 'next/navigation'

import { modelAdresiVarMi, modelSlugu } from '@/config/yayindaModeller'
import { type AdresDili, adresUret, modelAdresiCoz, yonlendirmeNesnesi } from '@/utils/adresUret'

import {
  getCachedFamilySlugById,
  getCachedModelBySku,
  getCachedProductBySlug,
  getCachedSeriesLanding,
  getCachedTakmaAd,
  getCachedVariantById,
  getFamilyDetailForRoute,
} from './preload'
import { type ProductRouteDeps, resolveProductRoute } from './productRoute'

export interface UrunRotasiCozumu {
  /** Çizilecek ailenin slug'ı (AileSayfasi girdisi). */
  aileSlug: string
  /** Model adresiyse seçili SKU (DB biçimi); aile adresiyse null. */
  sunucuSku: string | null
}

/**
 * K3-b ürün segmentini çözer (REC-300 Faz 3b, plan §5 Faz 3 madde 3): son `-p-` varsa MODEL
 * (SKU → ürün → aile), yoksa AİLE. Adresteki SKU büyük harfliyse kanonik küçük harfli adrese 308.
 * SKU bulunamazsa ya da ailesi yoksa → notFound(). DB hatası FIRLATILIR (geçici arıza kalıcı
 * 404 olarak önbelleğe girmesin; rota hata sayfası çizer).
 *
 * ⚠Faz 2 öncesi sınır: modelin kanonik slug METNİ (`slug_i18n`) henüz yok → adresteki metin
 * doğrulanmaz, SKU tek başına çözer. Faz 2 ile "metin yanlışsa 308" (plan §2, O1) eklenir.
 */
export async function urunSegmentiniCoz(slug: string, dil: AdresDili): Promise<UrunRotasiCozumu> {
  const model = modelAdresiCoz(slug)
  if (!model) return { aileSlug: slug, sunucuSku: null }

  // URN-31 (INV-YAYINDA-MODEL-2): model sayfası YALNIZ yayındaki listedeki SKU için vardır. Liste dışı → 404,
  // DB'ye GİDİLMEDEN ve 308'den ÖNCE (404 verecek adrese 308 vermek ziyaretçiyi ölü adrese taşırdı). Boş liste
  // = hiçbir model sayfası (fail-closed).
  if (!modelAdresiVarMi(model.sku)) notFound()

  // Büyük harfli SKU ya da listedeki adres metninden farklı metin (O1) → kanonik adrese TEK 308. Aile slug'ı
  // yalnız `adresUret`'in zorunlu alanıdır; liste içi SKU için metin ve aile listeden gelir.
  const kanonik = adresUret({ tur: 'model', aileSlug: model.slugMetni, sku: model.sku }, dil, true)
  if (!model.skuKanonik || model.slugMetni !== modelSlugu(model.sku, dil)) {
    permanentRedirect(kanonik)
  }
  const urun = await getCachedModelBySku(model.sku)
  if (!urun?.family_id) notFound()
  const aileSlug = await getCachedFamilySlugById(urun.family_id)
  if (!aileSlug) notFound()
  return { aileSlug, sunucuSku: urun.sku }
}

/**
 * `resolveProductRoute`'un bağımlılıkları — aile sayfası ile eski TR ürün adresi AYNI zinciri
 * kullanır (tek kaynak). Fonksiyon: modül yüklenirken önbellek sarmalayıcılarına dokunmaz.
 */
export function urunRotasiBagimliliklari(): ProductRouteDeps {
  return {
    familyDetail: getFamilyDetailForRoute,
    seriesLanding: getCachedSeriesLanding,
    variantBySlug: getCachedProductBySlug,
    familySlugById: getCachedFamilySlugById,
    takmaAd: getCachedTakmaAd,
    variantById: getCachedVariantById,
  }
}

/**
 * ESKİ TR ÜRÜN ADRESİ (`/tr/products/<x>`, bayrak AÇIKKEN) → yeni adrese TEK 308 (plan §5 Faz 3
 * madde 5, v4 Y4). `/tr/products/<x>` hiçbir durumda 200 dönmez (REC-205):
 *  - `-p-` model adresi → SKU çözülür (büyük harf → 308, bilinmeyen → 404) → `/tr/urun/<metin>-p-<sku>`.
 *  - aile ya da seri slug'ı → `/tr/urun/<aile>`.
 *  - varyant slug'ı / takma ad (bugün `?sku=`'lu aile adresine giden dal) → modelin adresi
 *    `/tr/urun/<istenen-slug>-p-<sku>`. ⚠Faz 2 öncesi sınır: modelin kanonik metni (`slug_i18n`)
 *    yok; metin olarak istenen slug kullanılır (varyant dalında bu, ürünün BUGÜNKÜ `products.slug`'ı).
 *    Faz 2'nin "metin yanlışsa 308" kuralı takma ad dalını da kanonik metne taşır.
 *  - bulunamadı → 404.
 *  - `unavailable` (DB/ağ hatası) → FIRLATILIR: eski adreste "bulunamadı" görünümü 200 ile çizilmez,
 *    geçici arıza kalıcı 404 olarak da önbelleğe girmez.
 */
export async function eskiTrUrunAdresiniYonlendir(slug: string): Promise<never> {
  const model = modelAdresiCoz(slug)
  if (model) {
    const { aileSlug, sunucuSku } = await urunSegmentiniCoz(slug, 'tr')
    if (!sunucuSku) notFound()
    permanentRedirect(adresUret(yonlendirmeNesnesi(aileSlug, sunucuSku), 'tr'))
  }

  const cozum = await resolveProductRoute(slug, 'tr', urunRotasiBagimliliklari())
  if (cozum.kind === 'family' || cozum.kind === 'series') {
    permanentRedirect(adresUret({ tur: 'aile', slug }, 'tr'))
  }
  if (cozum.kind === 'redirect') {
    const { aileSlug, sku } = cozum.hedef
    // Hedef: liste içi SKU → modelin adresi (metin listeden; adrese UUID yazılmaz); liste dışı SKU ya da SKU yok →
    // aile adresi, sorgusuz (URN-31).
    permanentRedirect(adresUret(sku ? yonlendirmeNesnesi(aileSlug, sku) : { tur: 'aile', slug: aileSlug }, 'tr'))
  }
  if (cozum.kind === 'not-found') notFound()
  throw new Error(
    `eskiTrUrunAdresiniYonlendir: ürün rotası çözülemedi (slug=${slug}) — veri katmanına ulaşılamadı; ` +
      '404 değil, geçici arıza.',
  )
}
