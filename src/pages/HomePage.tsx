import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import { useI18n } from '../i18n/I18nProvider'
import BrandsShowcase from '../components/BrandsShowcase'
import { Star, TrendingUp, Clock } from 'lucide-react'
import { getActiveApplicationCards } from '../config/applications'
import { iconFor, accentOverlayClass, gridColsClass } from '../utils/applicationUi'
import TiltCard from '../components/TiltCard'
import BentoGrid from '../components/BentoGrid'
import ScrollLinkedProcess from '../components/ScrollLinkedProcess'
import MagneticCTA from '../components/MagneticCTA'
import { trackEvent } from '../utils/analytics'
import LeadModal from '../components/LeadModal'
import ResourcesSection from '../components/ResourcesSection'
import ProductFlow from '../components/ProductFlow'
import BeforeAfterSlider from '../components/BeforeAfterSlider'

export const HomePage: React.FC = () => {
  const [leadOpen, setLeadOpen] = useState(false)

  const { t } = useI18n()




  // Global lead modal trigger for HeroSection button
  ;((window as unknown) as { openLeadModal?: () => void }).openLeadModal = () => setLeadOpen(true)


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* JSON-LD: Organization & WebSite */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'VentHub',
            url: `${window.location.origin}/`,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'VentHub',
            url: `${window.location.origin}/`,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${window.location.origin}/products?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />

      {/* Bento Grid (hover video önizleme) */}
      <BentoGrid />

      {/* Premium HVAC Markaları (BentoGrid sonrası) */}
      <BrandsShowcase />


      {/* Uygulamaya Göre Çözümler */}
      <section id="by-application" className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-industrial-gray">{t('common.byApplication')}</h2>
            <a href="/products#by-application" className="text-primary-navy hover:underline text-sm font-medium">{t('common.viewAll')} →</a>
          </div>
          {(() => {
            const appCards = getActiveApplicationCards()
            return (
              <div className={`${gridColsClass(appCards.length)}`}>
                {appCards.map(card => (
                  <TiltCard key={card.key}>
                    <Link
                      to={card.href}
                      className="group relative overflow-hidden rounded-xl border border-light-gray bg-white hover:shadow-md transition transform hover:-translate-y-0.5 ring-1 ring-black/5"
                      onClick={() => {
                        trackEvent('application_click', { key: card.key, source: 'home' })
                      }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${accentOverlayClass(card.accent)} to-transparent`}></div>
                      <div className="p-5 relative z-10">
                        <div className="flex items-center gap-2 text-primary-navy">
                          {iconFor(card.icon, 18)}
                          <span className="text-sm font-semibold">{t(`applications.${card.key}.title`)}</span>
                        </div>
                        <p className="mt-1 text-sm text-steel-gray">{t(`applications.${card.key}.subtitle`)}</p>
                        <div className="mt-4 text-sm font-medium text-primary-navy">{t('common.discover')} →</div>
                      </div>
                    </Link>
                  </TiltCard>
                ))}
              </div>
            )
          })()}
        </div>
      </section>

      {/* Before/After Slider (Uygulamaya göre çözümler altı) */}
      <BeforeAfterSlider
        beforeSrc="/images/before_parking_jet_fan.jpg"
        afterSrc="/images/after_parking_jet_fan.jpg"
        alt="Otopark jet fan uygulaması öncesi/sonrası"
      />






      {/* Ürün Galerisi başlık + akış */}
      <section className="pt-8 pb-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-industrial-gray">Ürün Galerisi</h2>
          <p className="text-steel-gray mt-2">Portföyümüzden seçilmiş ürün görselleri</p>
        </div>
      </section>
      <ProductFlow />

      {/* Resources (Ürün görsel akışının altında) */}
      <ResourcesSection />

      {/* Scroll-Linked Process */}
      <ScrollLinkedProcess />

      {/* Magnetic CTA */}
      <MagneticCTA />




      {/* Neden VentHub (kurumsal blok) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-primary-navy/90 to-secondary-blue/90 text-white p-8 sm:p-10 shadow-lg ring-1 ring-black/5">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('common.whyUs')}
              </h2>
              <p className="text-xl text-blue-100/90 max-w-3xl mx-auto">
                {t('home.whyParagraph')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Star size={32} className="text-gold-accent" fill="currentColor" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('home.why.premiumTitle')}</h3>
                <p className="text-blue-100">
                  {t('home.why.premiumText')}
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp size={32} className="text-success-green" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('home.why.expertTitle')}</h3>
                <p className="text-blue-100">
                  {t('home.why.expertText')}
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Clock size={32} className="text-warning-orange" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('home.why.fastTitle')}</h3>
                <p className="text-blue-100">
                  {t('home.why.fastText')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alt CTA */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-light-gray bg-gradient-to-r from-gray-50 to-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-industrial-gray">{t('home.bottomCtaTitle')}</h3>
              <p className="text-steel-gray mt-1">{t('home.bottomCtaSubtitle')}</p>
            </div>
            <div className="flex gap-3">
              <a href="/products" className="inline-flex items-center justify-center rounded-lg bg-primary-navy text-white px-5 py-2.5 font-semibold shadow-sm hover:bg-secondary-blue transition">
                {t('common.exploreProducts')}
              </a>
              <button
                onClick={() => ((window as unknown) as { openLeadModal?: () => void }).openLeadModal?.()}
                className="inline-flex items-center justify-center rounded-lg border border-primary-navy text-primary-navy px-5 py-2.5 font-semibold hover:bg-primary-navy hover:text-white transition"
              >
                {t('common.getQuote')}
              </button>
            </div>
          </div>
        </div>
      </section>

      <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} />
    </div>
  )
}

export default HomePage
