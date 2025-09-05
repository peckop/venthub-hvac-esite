import React from 'react'
import { trackEvent } from '../utils/analytics'

const CaseStudySection: React.FC = () => {
  const items = [
    {
      title: 'Otopark Jet Fan Projesi',
      summary: 'CO sensörlü kontrol ile enerji tüketiminde belirgin azalma ve hava kalitesinde iyileşme.',
      metrics: [
        { label: 'Enerji Tasarrufu', value: '%35' },
        { label: 'Süre', value: '2 hafta' },
      ],
    },
    {
      title: 'Hava Perdesi Uygulaması',
      summary: 'Giriş konforunda artış, ısı kaybında azalma ve kapı çevresinde sıcaklık stabilitesi.',
      metrics: [
        { label: 'Konfor Artışı', value: '%+20' },
        { label: 'Geri Dönüş', value: '< 6 ay' },
      ],
    },
  ]

  const openLead = () => {
    ;((window as unknown) as { openLeadModal?: () => void }).openLeadModal?.()
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-industrial-gray">Başarı Hikayeleri</h2>
          <p className="mt-2 text-steel-gray">Gerçek projelerden elde edilen sonuçlar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((cs) => (
            <div key={cs.title} className="rounded-2xl border border-light-gray bg-gradient-to-br from-gray-50 to-white p-6 hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-industrial-gray">{cs.title}</h3>
              <p className="mt-2 text-steel-gray">{cs.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {cs.metrics.map((m) => (
                  <span key={m.label} className="inline-flex items-center rounded-full bg-light-gray px-3 py-1 text-sm text-industrial-gray">
                    <span className="font-medium mr-1">{m.label}:</span> {m.value}
                  </span>
                ))}
              </div>
              <div className="mt-6">
                <button
                  onClick={() => { trackEvent('case_study_click', { title: cs.title }); openLead() }}
                  className="inline-flex items-center justify-center rounded-lg bg-primary-navy text-white px-5 py-2.5 font-semibold shadow-sm hover:bg-secondary-blue transition"
                >
                  Detayları İncele
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CaseStudySection

