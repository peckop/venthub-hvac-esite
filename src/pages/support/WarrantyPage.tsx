import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'

const WarrantyPage: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-steel-gray hover:text-primary-navy transition-colors text-sm">
          <ArrowLeft size={18} className="mr-1" /> {t('auth.back')}
        </button>
      </div>
      <h1 className="text-3xl font-bold text-industrial-gray mb-6">{t('support.links.warranty')}</h1>
      <div className="bg-white rounded-xl border border-light-gray p-6 space-y-4 text-steel-gray">
        <p>{t('support.warranty.desc1')}</p>
        <p>{t('support.warranty.desc2')}</p>
      </div>
    </div>
  )
}

export default WarrantyPage

