import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'

const FAQPage: React.FC = () => {
  const { t } = useI18n()
  const faqs = [
    { q: t('support.faq.q1'), a: t('support.faq.a1') },
    { q: t('support.faq.q2'), a: t('support.faq.a2') },
    { q: t('support.faq.q3'), a: t('support.faq.a3') },
  ]
  const navigate = useNavigate()
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-steel-gray hover:text-primary-navy transition-colors text-sm">
          <ArrowLeft size={18} className="mr-1" /> {t('auth.back')}
        </button>
      </div>
      <h1 className="text-3xl font-bold text-industrial-gray mb-6">{t('support.links.faq')}</h1>
      <div className="space-y-4">
        {faqs.map((item, idx) => (
          <details key={idx} className="bg-white rounded-xl border border-light-gray p-4">
            <summary className="cursor-pointer font-medium text-industrial-gray">{item.q}</summary>
            <p className="text-steel-gray mt-2">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}

export default FAQPage

