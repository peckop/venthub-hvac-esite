import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

import { useI18n } from '../../i18n/I18nProvider'

const ReturnsPage: React.FC = () => {
  const router = useRouter()
  const { t } = useI18n()
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-4">
        <button onClick={() => router.back()} className="inline-flex items-center text-steel-gray hover:text-primary-navy transition-colors text-sm">
          <ArrowLeft size={18} className="mr-1" /> {t('auth.back')}
        </button>
      </div>
      <h1 className="text-3xl font-bold text-industrial-gray mb-6">{t('support.returns.title')}</h1>
      {/*
        REC-104 (Recep hükmü 2026-09-01): iade/cayma koşulları yasal metin olduğu için
        KALDIRILMADI, ama çevrimiçi satış kapalıyken koşulsuz okunması yanıltıcıydı.
        Sayfa başına tek satırlık durum notu eklendi.
      */}
      <div className="mb-4 rounded-xl border border-air-blue bg-air-blue/40 px-4 py-3 text-sm text-industrial-gray">
        {t('support.returns.onlineKapaliNotu')}
      </div>
      <div className="bg-white rounded-xl border border-light-gray p-6 space-y-4 text-steel-gray">
        <p>{t('support.returns.desc1')}</p>
        <p>{t('support.returns.desc2')}</p>
      </div>
    </div>
  )
}

export default ReturnsPage





