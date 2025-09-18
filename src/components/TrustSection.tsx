import React from 'react'
import { ShieldCheck, CreditCard, RotateCcw } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'

const TrustSection: React.FC = () => {
  const { t } = useI18n()
  const TRUST_ITEMS = [
    { icon: <ShieldCheck size={22} className="text-success-green" />, title: t('homeTrust.kvkk.title'), desc: t('homeTrust.kvkk.desc') },
    { icon: <CreditCard size={22} className="text-primary-navy" />, title: t('homeTrust.payment.title'), desc: t('homeTrust.payment.desc') },
    { icon: <RotateCcw size={22} className="text-warning-orange" />, title: t('homeTrust.returns.title'), desc: t('homeTrust.returns.desc') },
  ] as const
  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-industrial-gray">{t('homeTrust.title')}</h2>
          <p className="text-steel-gray mt-1">{t('homeTrust.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="rounded-2xl border border-light-gray bg-white p-5 hover:shadow-md transition">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <div className="font-semibold text-industrial-gray">{item.title}</div>
                  <div className="text-sm text-steel-gray mt-1">{item.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustSection

