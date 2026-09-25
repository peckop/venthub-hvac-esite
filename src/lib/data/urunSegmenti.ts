import { notFound, permanentRedirect } from 'next/navigation'

import { type AdresDili, adresUret, modelAdresiCoz } from '@/utils/adresUret'

import { getCachedFamilySlugById, getCachedModelBySku } from './preload'

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

  if (!model.skuKanonik) {
    permanentRedirect(
      adresUret({ tur: 'model', aileSlug: model.slugMetni, sku: model.sku, slug: model.slugMetni }, dil, true),
    )
  }
  const urun = await getCachedModelBySku(model.sku)
  if (!urun?.family_id) notFound()
  const aileSlug = await getCachedFamilySlugById(urun.family_id)
  if (!aileSlug) notFound()
  return { aileSlug, sunucuSku: urun.sku }
}
