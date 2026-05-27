import React from 'react'
import { I18nProvider } from '../../i18n/I18nProvider'
import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'
import type { AppDictionary, Lang } from '../../i18n/I18nContext'

export type { Lang }

export async function generateStaticParams() {
  return [
    { lang: 'tr' },
    { lang: 'en' }
  ]
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
