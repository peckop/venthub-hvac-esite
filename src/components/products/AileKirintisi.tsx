import { ChevronRight } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import React from 'react'

import { type KirintiAdimi, kirintiHref } from '../../lib/seo/kirinti'

/**
 * Aile / model sayfasının GÖRÜNÜR kırıntısı (URN-21).
 *
 * Adımlar sunucuda bir kez kurulur (`aileKirintiAdimlari`) ve JSON-LD BreadcrumbList'e AYNI nesneyle
 * verilir; bu bileşen yalnız çizer. Bağlantısı olan her basamak gerçek `<a href>`'tir (JS koşmayan
 * tarayıcı ve arama motoru da görür); son basamak bulunulan sayfadır, bağlantı değildir.
 *
 * Dokunma alanı: mobilde bağlantı en az 44px yüksekliktedir (`min-h-11`); masaüstünde satır içi kalır.
 * Görünen metin değişmedi — yalnız bağlantı eklendi. TEK görsel fark: CSS `uppercase` kalktı, çünkü
 * aile/marka/model adı veri kaynaklı özel addır ve `text-transform` dile duyarlıdır (lang="tr" altında
 * Vortice -> VORTİCE); INV-7 (`i18n-uppercase-proper-noun`) yeni dosyada buna izin vermez.
 */
export interface AileKirintisiProps {
  adimlar: KirintiAdimi[]
  lang: string
  /** Sözlükten: `category.breadcrumbAria`. */
  etiket: string
}

const BAGLANTI_SINIFI =
  'inline-flex items-center min-h-11 sm:min-h-0 hover:text-primary-navy transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy rounded-sm'

export const AileKirintisi: React.FC<AileKirintisiProps> = ({ adimlar, lang, etiket }) => {
  if (adimlar.length === 0) return null

  return (
    <nav aria-label={etiket}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tracking-widest font-bold text-steel-gray/60">
        {adimlar.map((adim, i) => (
          <li key={`${i}-${adim.name}`} className="flex items-center gap-x-2">
            {i > 0 && <ChevronRight size={10} className="flex-shrink-0" aria-hidden="true" />}
            {adim.path ? (
              <Link href={kirintiHref(adim.path, lang) as Route} className={BAGLANTI_SINIFI}>
                {adim.name}
              </Link>
            ) : (
              <span className="text-industrial-gray truncate max-w-150px sm:max-w-none" aria-current="page">
                {adim.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default AileKirintisi
