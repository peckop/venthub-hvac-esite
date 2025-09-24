import React from 'react'
import { useI18n } from '../i18n/I18nProvider'

const TrustSection: React.FC = () => {
  const { t } = useI18n()
  const TRUST_ITEMS = [
    { icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success-green" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M9 12l2 2 4-4"/></svg>), title: t('homeTrust.kvkk.title'), desc: t('homeTrust.kvkk.desc') },
    { icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-navy" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>), title: t('homeTrust.payment.title'), desc: t('homeTrust.payment.desc') },
    { icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning-orange" aria-hidden="true"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3v7h-7"/></svg>), title: t('homeTrust.returns.title'), desc: t('homeTrust.returns.desc') },
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

