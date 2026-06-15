'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { normalizeImageUrl } from '@/utils/imageUtils'

import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes'
import { useI18n } from '../../i18n/I18nProvider'

export interface CategoryViewModelLite {
  id: string;
  slug: string;
  displayName: string;
  description: string;
  image_url: string | null;
}

interface GuidedCategoryDiscoveryProps {
  displayCategories?: CategoryViewModelLite[]
}

const FALLBACK_CATEGORY_IMAGE = '/images/vortice_lineo_futuristic.webp'

const GuidedCategoryDiscovery: React.FC<GuidedCategoryDiscoveryProps> = ({ displayCategories = [] }) => {
  const { t } = useI18n()
  const Routes = useLocalizedRoutes()
  return (
    <section id="categories" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-3xl">
            <div 
              data-observe="fade-up"
              className="opacity-0 -translate-x-4 data-[in-view=true]:opacity-100 data-[in-view=true]:translate-x-0 transition-opacity-transform duration-700 ease-out text-xs font-bold uppercase tracking-hvac-relaxed text-cyan-600 mb-4"
            >
              {t('home.guidedDiscovery.eyebrowLabel')}
            </div>
            <h2 
              data-observe="fade-up"
              className="opacity-0 translate-y-4 data-[in-view=true]:opacity-100 data-[in-view=true]:translate-y-0 transition-opacity-transform duration-700 ease-out delay-200 text-4xl font-light tracking-tighter text-slate-950 sm:text-6xl"
            >
              {t('home.guidedDiscovery.heading')}
            </h2>
          </div>
          <p 
            data-observe="fade-up"
            className="opacity-0 data-[in-view=true]:opacity-100 transition-opacity duration-700 ease-out delay-300 max-w-md text-lg text-slate-500 font-light leading-relaxed"
          >
            {t('home.guidedDiscovery.intro')}
          </p>
        </div>

        {/* Mobile: Horizontal Scroll | Desktop: Grid */}
        <div className="flex overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 lg:gap-2 md:overflow-visible md:pb-0">
          {displayCategories.map((category, idx) => {
            const finalSrc = normalizeImageUrl(category.image_url, FALLBACK_CATEGORY_IMAGE, 'category-images');

            const delayClass = ['delay-0', 'delay-100', 'delay-200', 'delay-300'][idx % 4];
            
            return (
              <div
                key={category.id}
                data-observe="fade-up"
                className={`opacity-0 translate-y-4 data-[in-view=true]:opacity-100 data-[in-view=true]:translate-y-0 transition-opacity-transform duration-700 ease-out ${delayClass} group relative flex-shrink-0 w-280px sm:w-320px md:w-auto snap-center overflow-hidden bg-slate-100 aspect-square lg:aspect-orbit`}
              >
                <Link href={Routes.category(category.slug)} className="block w-full h-full relative z-10">
                  {/* Background Image with Fallback Logic */}
                  <div className="absolute inset-0 z-0 bg-slate-950">
                    <Image
                      src={finalSrc}
                      alt={category.displayName}
                      fill
                      sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover transition-transform duration-1.5s ease-out group-hover:scale-110 grayscale-30 group-hover:grayscale-0"
                    />
                    {/* Architectural Overlay */}
                    <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Content Overlay - Centered and Minimal */}
                  <div className="absolute inset-0 z-10 p-10 flex flex-col items-center justify-center text-center">
                    <div 
                      className="flex flex-col items-center opacity-90 transition-opacity duration-700"
                    >
                      <h3 className="text-xl lg:text-2xl font-extralight text-white tracking-hvac-tight mb-4 transition-transform duration-700 group-hover:-translate-y-2">
                        {category.displayName}
                      </h3>

                      <div className="w-12 h-px bg-white/30 group-hover:w-24 group-hover:bg-cyan-500 transition-width-bg duration-700" />
                      
                      <div className="mt-6 max-h-0 group-hover:max-h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden">
                        <p className="text-xs text-slate-200 font-light leading-relaxed tracking-wider mb-6 max-w-200px line-clamp-2">
                          {category.description || t('home.guidedDiscovery.cardFallback')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-white/20 group-hover:border-cyan-500/50 transition-colors duration-500" />
                  <div className="absolute bottom-8 left-8 w-4 h-4 border-b border-l border-white/20 group-hover:border-cyan-500/50 transition-colors duration-500" />
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default GuidedCategoryDiscovery
