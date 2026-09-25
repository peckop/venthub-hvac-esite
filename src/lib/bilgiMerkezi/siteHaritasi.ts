import type { MetadataRoute } from 'next'

import { EN_YAYIN } from '../../config/features'
import { dildekiYazilar, type RehberYazisi, YAZILAR } from '../../data/bilgiMerkezi/yazilar'
import { bilgiMerkeziDilAcik } from '../../utils/bilgiMerkezi'
import { bilgiMerkeziRotalari } from '../../utils/bilgiMerkeziRotalari'
import { localizedHref } from '../../utils/routes'

/**
 * BİLGİ MERKEZİ site haritası satırları (karar 92; rehber-yazisi-standard.md R6): liste + her yazı,
 * yalnız YAYINDAKİ dilde (EN, `EN_YAYIN` kapalıyken yazılmaz). `lastModified` = yazının güncelleme
 * tarihi. `alternates` YALNIZ iki dil de yayındaysa — eşi olmayan sayfaya hreflang yazılmaz. Eski
 * `/destek/merkez` ve `/destek/konular/*` adresleri haritada YOK (308 verirler).
 */
export function bilgiMerkeziSiteHaritasi(
  baseUrl: string,
  enYayin: boolean = EN_YAYIN,
  yazilar: readonly RehberYazisi[] = YAZILAR,
): MetadataRoute.Sitemap {
  const acikDiller = (['tr', 'en'] as const).filter(
    (d) => bilgiMerkeziDilAcik(d, enYayin) && dildekiYazilar(d, yazilar).length > 0,
  )
  const tam = (yol: string, dil: string) => `${baseUrl}${localizedHref(yol, dil)}`
  const satirlar: MetadataRoute.Sitemap = []

  const enYeni = yazilar.reduce((a, y) => (y.guncellemeTarihi > a ? y.guncellemeTarihi : a), '')
  for (const dil of acikDiller) {
    satirlar.push({
      url: tam(bilgiMerkeziRotalari.liste(dil), dil),
      lastModified: enYeni ? new Date(`${enYeni}T00:00:00Z`) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
      ...(acikDiller.length === 2
        ? {
            alternates: {
              languages: { tr: tam(bilgiMerkeziRotalari.liste('tr'), 'tr'), en: tam(bilgiMerkeziRotalari.liste('en'), 'en') },
            },
          }
        : {}),
    })
  }

  for (const yazi of yazilar) {
    const diller = acikDiller.filter((d) => yazi.diller[d])
    const yolu = (d: 'tr' | 'en') => tam(bilgiMerkeziRotalari.yazi((yazi.diller[d] as { slug: string }).slug, d), d)
    for (const dil of diller) {
      satirlar.push({
        url: yolu(dil),
        lastModified: new Date(`${yazi.guncellemeTarihi}T00:00:00Z`),
        changeFrequency: 'monthly',
        priority: 0.6,
        ...(diller.length === 2 ? { alternates: { languages: { tr: yolu('tr'), en: yolu('en') } } } : {}),
      })
    }
  }
  return satirlar
}
