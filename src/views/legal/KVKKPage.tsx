'use client'

import dynamic from 'next/dynamic'
import React from 'react'

import { useI18n } from '../../i18n/I18nProvider'

const KvkkContentTr = dynamic(() => import('./components/tr/KvkkContent').then(m => m.KvkkContentTr), {
  loading: () => <div className="animate-pulse h-96 bg-slate-100/50 rounded-lg" />,
  ssr: true
})

const KvkkContentEn = dynamic(() => import('./components/en/KvkkContent').then(m => m.KvkkContentEn), {
  loading: () => <div className="animate-pulse h-96 bg-slate-100/50 rounded-lg" />,
  ssr: true
})

const KVKKPage: React.FC = () => {
  const { lang, t } = useI18n()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-industrial-gray mb-6">
        {t('legal.kvkkTitle')}
      </h1>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-6 text-sm">
        {t('legal.draftWarning')}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6 space-y-6 text-steel-gray prose dark:prose-invert max-w-prose">
        {lang === 'en' ? <KvkkContentEn /> : <KvkkContentTr />}
      </div>

      <p className="text-xs text-steel-gray mt-4">
        {t('legal.disclaimer')}
      </p>
    </div>
  )
}

export default KVKKPage





