'use client'

import React from 'react'
import { HVAC_BRANDS } from '../lib/brands'
import { BrandIcon } from '../components/HVACIcons'
import Link from 'next/link'
import Image from 'next/image'
import Seo from '../components/Seo'
import { useI18n } from '../i18n/I18nProvider'
import useScrollAnimation, { scrollAnimationClasses } from '../hooks/useScrollAnimation'

/**
 * BrandsPage - Premium "Markalar" sayfası
 * Modernized with i18n, A11y and Performance optimizations.
 */
const BrandsPage: React.FC = () => {
  const { t } = useI18n()
  const brands = HVAC_BRANDS
  const [heroBadgeRef, heroBadgeVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 })
  const [brandsGridRef, brandsGridVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.05 })

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={`${t('brands.pageTitle')} | VentHub`}
        description={t('brands.seoDesc')}
      />

      {/* Hero: Ultra Minimalist Apple Style */}
      <section className="pt-32 pb-20 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div ref={heroBadgeRef} className={scrollAnimationClasses.fadeUp(heroBadgeVisible) + " inline-flex items-center gap-3 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-8"}>
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-600">
              {t('brands.sectionTitle')}
            </span>
          </div>
          <h1 className="text-5xl lg:text-8xl font-extralight tracking-tighter text-slate-900 leading-[1.1] mb-10">
            {t('brands.eyebrow').split(' ').map((word, i) => (
              <React.Fragment key={i}>
                {i === 2 ? <span className="font-medium text-slate-950 italic">{word} </span> : word + ' '}
              </React.Fragment>
            ))}
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-slate-500 font-light leading-relaxed">
            {t('brands.pageSubtitle')}
          </p>
        </div>
      </section>

      {/* Brands Gr_id: Premium Showroom */}
      <section className="py-24 sm:py-32">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={brandsGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {brands.map((brand, index) => (
              <div
                key={brand.slug}
                className={scrollAnimationClasses.fadeUp(brandsGridVisible)}
                style={scrollAnimationClasses.staggerChild(index)}
              >
                <Link
                  href={`/brands/${brand.slug}`}
                  aria-label={`${t('brands.aboutBrand')} ${brand.name}`}
                  className="group block relative h-full rounded-[2.5rem] border border-slate-100 bg-white p-10 transition-all duration-700 hover:border-cyan-500/20 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)]"
                >
                  {/* Floating Logo Container */}
                  <div className="aspect-[3/2] relative flex items-center justify-center mb-12 grayscale opacity-40 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110">
                    <BrandIcon brand={brand.name} className="w-full h-full max-h-24" />
                  </div>

                  {/* Info Layer */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{brand.name}</h2>
                      <div className="h-px flex-1 mx-4 bg-slate-100 group-hover:bg-cyan-500/20 transition-colors" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {brand.country}
                      </span>
                    </div>
                    
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-600/80">
                      {brand.specialty}
                    </div>
                    
                    <p className="text-sm text-slate-500 font-light leading-relaxed line-clamp-3">
                      {brand.description}
                    </p>
                  </div>

                  {/* Animated Reveal Arrow */}
                  <div className="mt-10 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-cyan-600 transition-colors">
                    <span>{t('brands.exploreBrand')}</span>
                    <div className="h-px w-6 bg-slate-200 group-hover:w-12 group-hover:bg-cyan-500 transition-all duration-500" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Network Section */}
      <section className="py-24 bg-slate-950 text-white overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.5em] mb-8">
                {t('brands.trust.eyebrow')}
              </div>
              <h2 className="text-4xl lg:text-6xl font-extralight tracking-tighter leading-[1.1] mb-8">
                {t('brands.trust.title').split(' ').slice(0, 2).join(' ')} <br />
                <span className="font-medium text-cyan-400 italic">
                  {t('brands.trust.title').split(' ').slice(2).join(' ')}
                </span>
              </h2>
              <p className="text-lg text-slate-400 font-light leading-relaxed mb-12 max-w-xl">
                {t('brands.trust.description')}
              </p>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="border-l border-white/10 pl-6">
                  <div className="text-3xl font-bold mb-1">100%</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {t('brands.trust.original')}
                  </div>
                </div>
                <div className="border-l border-white/10 pl-6">
                  <div className="text-3xl font-bold mb-1">Global</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {t('brands.trust.standard')}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative aspect-square lg:aspect-video rounded-[3rem] overflow-hidden border border-white/5">
              <Image 
                src="/images/hvac_installation_close_up_premium_3.png" 
                alt="Technical Network" 
                fill 
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover brightness-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default BrandsPage
