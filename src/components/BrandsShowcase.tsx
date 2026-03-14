'use client'

import React, { useMemo } from 'react'
import { HVAC_BRANDS } from '../lib/brands'
import { BrandIcon } from './HVACIcons'
import Link from 'next/link'
import { useI18n } from '../i18n/I18nProvider'
import { motion } from 'framer-motion'

const Lane: React.FC<{ items: typeof HVAC_BRANDS; durationSec?: number }> = ({ items, durationSec = 50 }) => {
  const repeated = useMemo(() => [...items, ...items, ...items], [items])

  return (
    <div className="relative overflow-hidden group">
      <style>{`
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
      `}</style>
      <div className="flex marquee-premium-track w-max gap-20 py-12">
        {repeated.map((brand, idx) => (
          <Link key={`${brand.slug}-${idx}`} href={`/brands/${brand.slug}`} className="group/brand">
            <div className="flex flex-col items-center justify-center gap-6 transition-all duration-700">
              {/* Ultra-Minimalist Floating Logo */}
              <div className="relative flex h-24 w-48 items-center justify-center transition-all duration-700 grayscale opacity-30 group-hover/brand:grayscale-0 group-hover/brand:opacity-100 group-hover/brand:scale-110">
                <BrandIcon brand={brand.name} />
              </div>
              
              {/* Subtle Indicator */}
              <div className="h-px w-0 bg-cyan-500/40 transition-all duration-700 group-hover/brand:w-12" />
              
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 opacity-0 group-hover/brand:opacity-100 transition-all duration-500">
                {brand.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export const BrandsShowcase: React.FC = () => {
  const { t } = useI18n()
  const brands = HVAC_BRANDS

  return (
    <section className="relative bg-white py-24 sm:py-32">
      {/* Background Atmosphere: Extremely Subtle */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(248,250,252,1)_0%,rgba(255,255,255,1)_100%)]" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header: Centered & Sophisticated */}
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-600 mb-6"
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
            Dünya Devlerinin <span className="font-medium text-slate-950">Güvenilir Partneri</span>
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
            href="/brands"
            className="group inline-flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 hover:text-cyan-600 transition-all"
          >
            <span>{t('brands.viewAll')}</span>
            <div className="h-px w-8 bg-slate-200 group-hover:w-16 group-hover:bg-cyan-500 transition-all duration-500" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default BrandsShowcase



