'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '../../src/i18n/I18nProvider'

type DiscoveryCategory = {
  id: string
  key: string
  href: string
  imgSrc: string
  alt: string
}

const CATEGORIES: DiscoveryCategory[] = [
  {
    id: 'fans',
    key: 'home.guidedDiscovery.categories.fans',
    href: '/products?category=fans',
    imgSrc: '/images/hvac-fan.jpg', // Placeholder, map to actual if needed later
    alt: 'Endüstriyel Fanlar'
  },
  {
    id: 'airCurtains',
    key: 'home.guidedDiscovery.categories.airCurtains',
    href: '/products?category=air-curtains',
    imgSrc: '/images/industrial-air-curtain.jpg',
    alt: 'Hava Perdeleri'
  },
  {
    id: 'hrv',
    key: 'home.guidedDiscovery.categories.hrv',
    href: '/products?category=hrv',
    imgSrc: '/images/hrv-unit.jpg',
    alt: 'Isı Geri Kazanım'
  },
  {
    id: 'control',
    key: 'home.guidedDiscovery.categories.control',
    href: '/products?category=control',
    imgSrc: '/images/control-panel.jpg',
    alt: 'Hız Kontrol'
  }
]

export const GuidedCategoryDiscovery: React.FC = () => {
  const { t } = useI18n()
  const [activeIndex, setActiveIndex] = useState(0)

  // Safe translations with fallbacks
  const mainTitle = t('home.guidedDiscovery.title') || "Ürünleri Keşfedin"
  const mainSubtitle = t('home.guidedDiscovery.subtitle') || "Projeniz için doğru premium seriyi bulmak üzere ana kategorilerden ilerleyin."
  const viewSeries = t('home.guidedDiscovery.viewSeries') || "Seriyi İncele"

  const activeCat = CATEGORIES[activeIndex]

  // Translate category object
  const getCatStr = (cat: DiscoveryCategory, field: 'title' | 'desc') => {
    return t(`${cat.key}.${field}`) || (field === 'title' ? cat.alt : 'Keşfedin')
  }

  return (
    <section id="categories" className="py-16 md:py-24 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center md:text-left mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-industrial-gray">{mainTitle}</h2>
          <p className="mt-2 text-sm md:text-base text-steel-gray max-w-2xl">{mainSubtitle}</p>
        </div>

        {/* Desktop View (Split Grid) */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 items-center">

          {/* List/Sidebar Selection */}
          <div className="col-span-4 flex flex-col gap-3">
            {CATEGORIES.map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => setActiveIndex(idx)}
                className={`text-left px-5 py-4 rounded-xl border transition-all ${
                  activeIndex === idx
                  ? 'border-primary-navy bg-blue-50/50 shadow-sm ring-1 ring-primary-navy/20'
                  : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <h3 className={`font-semibold text-lg ${activeIndex === idx ? 'text-primary-navy' : 'text-industrial-gray'}`}>
                  {getCatStr(cat, 'title')}
                </h3>
                <p className={`text-sm mt-1 ${activeIndex === idx ? 'text-steel-gray' : 'text-gray-500'}`}>
                  {getCatStr(cat, 'desc')}
                </p>
              </button>
            ))}
          </div>

          {/* Center/Right Spotlight Area */}
          <div className="col-span-8 relative h-[500px] rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden group shadow-inner">
             {/* Note: In a full 3D implementation, this block would mount @react-three/fiber canvas.
                 As per brief: "controlled 3D... if performance or usability suffers, simplify."
                 Currently using an elegant static premium spotlight fallback to ensure high performance on mobile-first rewrite. */}

            <div className="absolute inset-0 transition-opacity duration-500 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />

            <div className="absolute inset-0 flex items-center justify-center p-12 transition-transform duration-700 ease-out group-hover:scale-105">
               {/* Stand-in for 3D or high-res imagery */}
               <div className="w-full h-full bg-gray-200 rounded-xl shadow-2xl flex items-center justify-center text-gray-400">
                  <svg className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
               </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex justify-between items-end">
              <div>
                <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-md">
                  {getCatStr(activeCat, 'title')}
                </h3>
                <p className="text-gray-200 max-w-md drop-shadow-md">
                   {getCatStr(activeCat, 'desc')}
                </p>
              </div>
              <Link
                href={activeCat.href}
                className="shrink-0 bg-white/90 backdrop-blur hover:bg-white text-primary-navy px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
              >
                {viewSeries}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile View (Horizontal Scroll Rail) */}
        <div className="md:hidden">
          <div className="flex overflow-x-auto pb-6 -mx-4 px-4 gap-4 scrollbar-hide snap-x">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="snap-start flex-shrink-0 w-[85vw] max-w-[320px] rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex flex-col shadow-sm">

                {/* Lightweight Preview Area */}
                <div className="aspect-[4/3] bg-gray-200 relative">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                   <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                   </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-industrial-gray">{getCatStr(cat, 'title')}</h3>
                  <p className="text-sm text-steel-gray mt-1 flex-1">{getCatStr(cat, 'desc')}</p>

                  <Link
                    href={cat.href}
                    className="mt-4 w-full flex items-center justify-center bg-white border border-gray-200 text-primary-navy py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
                  >
                    {viewSeries}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
