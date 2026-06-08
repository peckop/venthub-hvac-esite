'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import React, { useMemo } from 'react'

import { HVAC_BRANDS } from '../data/brands'
import { useI18n } from '../i18n/I18nProvider'
import { Routes } from '../utils/routes';
import { BrandIcon } from './HVACIcons'


const Lane: React.FC<{ items: typeof HVAC_BRANDS; durationSec?: number }> = ({ items, durationSec = 50 }) => {
  const repeated = useMemo(() => [...items, ...items, ...items], [items])

  return (
    <div className="relative overflow-hidden group">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-premium { 
          from { transform: translateX(0); } 
          to { transform: translateX(-33.33%); } 
        }
        .marquee-premium-track { 
          animation: marquee-premium ${durationSec}s linear infinite; 
        }
        .marquee-premium-track:hover {
          animation-play-state: paused;
        }
      ` }} />
      <div className="flex marquee-premium-track w-max gap-20 py-12">
        {repeated.map((brand, idx) => (
          <Link key={`${brand.slug}-${idx}`} href={Routes.brand(brand.slug)} className="group/brand">
            <div className="flex flex-col items-center justify-center gap-6 transition-colors duration-700">
              {/* Ultra-Minimalist Floating Logo */}
              <div className="relative flex h-24 w-48 items-center justify-center transition-filter-transform duration-700 grayscale opacity-30 group-hover/brand:grayscale-0 group-hover/brand:opacity-100 group-hover/brand:scale-110">
                <BrandIcon brand={brand.name} />
              </div>
              
              {/* Subtle Indicator */}
              <div className="h-px w-0 bg-cyan-500/40 transition-width duration-700 group-hover/brand:w-12" />
              
              <span className="text-xs font-black uppercase tracking-hvac-loose text-slate-400 opacity-0 group-hover/brand:opacity-100 transition-opacity duration-500">
                {brand.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

const BrandsShowcase: React.FC = () => {
  const { t } = useI18n()
  const brands = HVAC_BRANDS

  return (
    <section className="relative bg-white py-24 sm:py-32">
      {/* Background Atmosphere: Extremely Subtle */}
      <div className="absolute inset-0 bg-brands-radial" />

      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header: Centered & Sophisticated */}
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-black uppercase tracking-hvac-wide text-cyan-600 mb-6"
          >
            {t('brands.sectionTitle')}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-extralight tracking-[ -0.05em] text-slate-900 sm:text-5xl"
          >
            {t('brands.subtitlePart1')}{' '}
            <span className="font-medium text-slate-950">
              {t('brands.subtitlePart2')}
            </span>
          </motion.h2>
        </div>

        {/* Centralized Premium Carousel */}
        <div className="relative">
          {/* High-End Edge Fading */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-40 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-40 bg-gradient-to-l from-white to-transparent" />
          
          <Lane items={brands} durationSec={70} />
        </div>

        {/* Minimalist View All CTA */}
        <div className="mt-20 text-center">
          <Link
            href={Routes.brands()}
            className="group inline-flex items-center gap-4 text-xs font-bold uppercase tracking-hvac-relaxed text-slate-400 hover:text-cyan-600 transition-colors"
          >
            <span>{t('brands.viewAll')}</span>
            <div className="h-px w-8 bg-slate-200 group-hover:w-16 group-hover:bg-cyan-500 transition-width-bg duration-500" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default BrandsShowcase



