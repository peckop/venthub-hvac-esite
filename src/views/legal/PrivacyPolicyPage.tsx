import React from 'react'

import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'
import { getDictValue } from '../../i18n/getDictValue'
import { PrivacyPolicyContentEn } from './components/en/PrivacyPolicyContent'
import { PrivacyPolicyContentTr } from './components/tr/PrivacyPolicyContent'

const PrivacyPolicyPage: React.FC<{ lang: string }> = ({ lang }) => {
  const dict = lang === 'en' ? en : tr
  const t = (key: string) => getDictValue(dict, key)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-industrial-gray mb-6">
        {t('legal.privacyTitle')}
      </h1>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-6 text-sm">
        {t('legal.draftWarning')}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6 text-steel-gray space-y-6 prose dark:prose-invert max-w-prose">
        {lang === 'en' ? (
          <PrivacyPolicyContentEn lang={lang} />
        ) : (
          <PrivacyPolicyContentTr lang={lang} />
        )}
      </div>

      <p className="text-xs text-steel-gray mt-4">
        {t('legal.disclaimer')}
      </p>
    </div>
  )
}

export default PrivacyPolicyPage





