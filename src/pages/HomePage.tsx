import React, { useState, Suspense, useEffect } from 'react'
import LazyInView from '../components/LazyInView'
import { Link } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import { useI18n } from '../i18n/I18nProvider'
import { getActiveApplicationCards } from '../config/applications'
import { iconFor, accentOverlayClass, gridColsClass } from '../utils/applicationUi'
const TiltCard = React.lazy(() => import('../components/TiltCard'))
import { trackEvent } from '../utils/analytics'
const LeadModal = React.lazy(() => import('../components/LeadModal'))
import Seo from '../components/Seo'

// Hero görseli (public yolu)
const HERO_IMG = '/images/industrial_HVAC_air_handling_unit_warehouse.jpg'
// Responsive sources for Before/After slider
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import beforeSetAvif from '../../public/images/hvac_clean_air_8.jpg?w=456;684&format=avif&quality=52&srcset&imagetools'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import beforeSetWebp from '../../public/images/hvac_clean_air_8.jpg?w=456;684&format=webp&quality=68&srcset&imagetools'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import afterSetAvif from '../../public/images/hvac_technician_equipment_maintenance_professional.jpg?w=456;684&format=avif&quality=52&srcset&imagetools'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import afterSetWebp from '../../public/images/hvac_technician_equipment_maintenance_professional.jpg?w=456;684&format=webp&quality=68&srcset&imagetools'

// Kritik olmayan blokları tembel yükleme
import LazyBrandsShowcase from '../components/LazyBrandsShowcase'
import LazyProductFlow from '../components/LazyProductFlow'

export const HomePage: React.FC = () => {
  const [leadOpen, setLeadOpen] = useState(false)

  const { t } = useI18n()

// Hero görselini preload et (tek kaynak)
useEffect(() => {
  try {
    const head = document.head
    const l = document.createElement('link')
    l.rel = 'preload'
    l.as = 'image'
    l.href = HERO_IMG
    ;(l as unknown as HTMLLinkElement & { fetchpriority?: string }).fetchpriority = 'high'
    head.appendChild(l)
    return () => { head.removeChild(l) }
  } catch {}
}, [])




  // Global lead modal trigger for HeroSection button
  ;((window as unknown) as { openLeadModal?: () => void }).openLeadModal = () => setLeadOpen(true)


  return (
    <div className="min-h-screen">
      <Seo
        title={t('home.seoTitle')}
        description={t('home.seoDesc')}
        canonical={`${window.location.origin}/`}
      />
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
      <div className="cv-600">
        <LazyInView
          loader={() => import('../components/BentoGrid')}
          placeholder={<div className="min-h-[200px]" aria-hidden="true" />}
          rootMargin="0px 0px"
          once
        />
      </div>

      {/* Premium HVAC Markaları (BentoGrid sonrası) */}
      <div className="cv-320">
        <LazyBrandsShowcase />
      </div>


      {/* Uygulamaya Göre Çözümler */}
      <section id="by-application" className="py-16 bg-gradient-to-br from-gray-50 to-white" aria-labelledby="by-application-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 id="by-application-heading" className="text-2xl md:text-3xl font-bold text-industrial-gray">{t('common.byApplication')}</h2>
            <a href="/products#by-application" className="text-primary-navy hover:underline text-sm font-medium">{t('common.viewAll')} →</a>
          </div>
          {(() => {
            const appCards = getActiveApplicationCards()
            return (
              <div className={`${gridColsClass(appCards.length)}`}>
                {appCards.map(card => (
                  <Suspense key={card.key} fallback={<div className="rounded-xl border border-light-gray bg-white h-32 animate-pulse" />}>
                    <TiltCard>
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
                  </Suspense>
                ))}
              </div>
            )
          })()}
        </div>
      </section>

      {/* Before/After Slider (Uygulamaya göre çözümler altı) */}
      <div className="cv-400">
        {(() => {
          type BASProps = { beforeSrc: string; afterSrc: string; alt?: string }
          return (
            <LazyInView<BASProps & { beforeSrcSetAvif?: string; beforeSrcSetWebp?: string; afterSrcSetAvif?: string; afterSrcSetWebp?: string; sizes?: string }>
              loader={() => import('../components/BeforeAfterSlider')}
              placeholder={<div className="min-h-[160px]" aria-hidden="true" />}
              rootMargin="0px 0px"
              once
              componentProps={{
                // Responsive sources (build-time generated)
                beforeSrcSetAvif: beforeSetAvif as unknown as string,
                beforeSrcSetWebp: beforeSetWebp as unknown as string,
                afterSrcSetAvif: afterSetAvif as unknown as string,
                afterSrcSetWebp: afterSetWebp as unknown as string,
                // Base fallbacks
                beforeSrc: '/images/hvac_clean_air_8.jpg',
                afterSrc: '/images/hvac_technician_equipment_maintenance_professional.jpg',
                sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 456px',
                alt: t('home.beforeAfterAlt') as string,
              }}
            />
          )
        })()}
      </div>






      {/* Ürün Galerisi başlık + akış */}
      <section className="pt-8 pb-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-industrial-gray">{t('home.galleryTitle')}</h2>
          <p className="text-steel-gray mt-2">{t('home.gallerySubtitle')}</p>
        </div>
      </section>
      <div className="cv-600">
        <LazyProductFlow />
      </div>

      {/* Resources (Ürün görsel akışının altında) */}
      <div className="cv-320">
        <LazyInView
          loader={() => import('../components/ResourcesSection')}
          placeholder={<div className="min-h-[160px]" aria-hidden="true" />}
          rootMargin="0px 0px"
          once
        />
      </div>

      {/* Scroll-Linked Process */}
      <div className="cv-400">
        <LazyInView
          loader={() => import('../components/ScrollLinkedProcess')}
          placeholder={<div className="min-h-[160px]" aria-hidden="true" />}
          rootMargin="0px 0px"
          once
        />
      </div>

      {/* Magnetic CTA */}
      <div className="cv-320">
        <LazyInView
          loader={() => import('../components/MagneticCTA')}
          placeholder={<div className="min-h-[160px]" aria-hidden="true" />}
          rootMargin="0px 0px"
          once
        />
      </div>




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
                  <StarIcon className="text-gold-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('home.why.premiumTitle')}</h3>
                <p className="text-blue-100">
                  {t('home.why.premiumText')}
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUpIcon className="text-success-green" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('home.why.expertTitle')}</h3>
                <p className="text-blue-100">
                  {t('home.why.expertText')}
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="text-warning-orange" />
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

      {leadOpen && (
        <Suspense fallback={null}>
          <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} />
        </Suspense>
      )}
    </div>
  )
}

// Minimal inline icons to avoid lucide-react cost on initial load
function StarIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/>
    </svg>
  )
}
function TrendingUpIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  )
}
function ClockIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

export default HomePage
