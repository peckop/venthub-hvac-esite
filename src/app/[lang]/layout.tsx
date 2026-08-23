import type { Metadata } from 'next'
import React from 'react'

import { SITE_URL } from '@/config/siteUrl'

import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'
import type { AppDictionary, Lang } from '../../i18n/I18nContext'
import { I18nProvider } from '../../i18n/I18nProvider'

export type { Lang }

export async function generateStaticParams() {
  return [
    { lang: 'tr' },
    { lang: 'en' }
  ]
}

/**
 * SITE GENELI METADATA — dile gore.
 *
 * NICIN BURADA: kok layout (src/app/layout.tsx) [lang] segmentinin USTUNDE oldugu icin rota
 * parametresini goremez ve metadata'sini TURKCE sabitlerle basar. Next metadata'yi segment
 * agacinda birlestirir ve DERIN olan kazanir; bu layout kokten derin oldugu icin buradaki
 * degerler tum [lang] agacini kapsar.
 *
 * OLCULMUS KAPSAM (2026-08-23): [lang] altinda 47 page.tsx var, bunlarin 42'si kendi
 * generateMetadata'sini TANIMLAMIYOR — yani /en altindaki 42 sayfa Ingilizce icerik gosterip
 * TURKCE baslik ve tr_TR OG yereli basiyordu. Kendi metadata'sini tanimlayan 5 sayfa
 * (ana sayfa, brands/[slug], category x2, products/[slug]) DEGISMEZ: onlarinki daha derin.
 *
 * Desen YENI DEGIL: [lang]/page.tsx bunu zaten dogru yapiyordu; bir kademe yukari tasindi.
 * Kok layout'un Turkce sabitlerine DOKUNULMADI — onlar [lang] disindaki agac (admin) icin
 * varsayilan olmaya devam ediyor. Kok <html lang> niteligi AYRI is (coklu-kok restructure).
 */
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const dict = lang === 'en' ? en : tr

  return {
    title: dict.meta.siteTitle,
    description: dict.meta.siteDesc,
    alternates: {
      languages: {
        'tr-TR': `${SITE_URL}/tr`,
        'en-US': `${SITE_URL}/en`,
      },
    },
    openGraph: {
      title: dict.meta.siteTitle,
      description: dict.meta.siteDesc,
      siteName: 'VentHub',
      type: 'website',
      locale: lang === 'en' ? 'en_US' : 'tr_TR',
    },
  }
}

type Props = {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params
  const dictionary = lang === 'en' ? en : tr

  return (
    <I18nProvider lang={lang as Lang} dictionary={dictionary as AppDictionary}>
      {children}
    </I18nProvider>
  )
}
