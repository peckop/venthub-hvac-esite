'use client'

import React, { useMemo } from 'react'
import { HVAC_BRANDS } from '../lib/brands'
import { BrandIcon } from './HVACIcons'
import Link from 'next/link'
import { useI18n } from '../i18n/I18nProvider'
import { motion } from 'framer-motion'

const Lane: React.FC<{ items: typeof HVAC_BRANDS; durationSec?: number }> = ({ items, durationSec = 60 }) => {
  const REPEAT = 6
  const repeated = useMemo(() => Array.from({ length: REPEAT }).flatMap(() => items), [items])

  return (
    <div className="relative overflow-hidden">
      <style>{`
        @keyframes brands-scroll-left { 
          from { transform: translate3d(0, 0, 0); } 
          to { transform: translate3d(-50%, 0, 0); } 
        }
        .brands-track { 
          animation: brands-scroll-left ${durationSec}s linear infinite; 
          will-change: transform; 
        }
        .brands-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="flex brands-track w-max gap-8 py-12">
        {repeated.map((brand, idx) => (
          <Link key={`${brand.slug}-${idx}`} href={`/brands/${brand.slug}`} className="group">
            <div className="relative flex h-32 w-64 items-center justify-center overflow-hidden rounded-[2rem] border border-slate-100 bg-white/40 p-6 shadow-sm backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-primary-navy/20 hover:bg-white hover:shadow-2xl hover:shadow-primary-navy/10">
              <div className="flex items-center gap-4 transition-transform duration-500 group-hover:scale-105">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 p-2 text-slate-400 transition-colors group-hover:bg-primary-navy/5 group-hover:text-primary-navy">
                  <BrandIcon brand={brand.name} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 transition-colors group-hover:text-primary-navy">
                    {brand.name}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-500">
                      {brand.country}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Subtle Decorative Line */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary-navy transition-all duration-500 group-hover:w-full" />
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
    <section className="relative overflow-hidden bg-slate-50/50 py-24">
      {/* Background Decorative Element */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="brands-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#brands-grid)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.4em] text-primary-navy"
          >
            <span className="h-px w-8 bg-primary-navy/40" />
            {t('brands.sectionTitle')}
            <span className="h-px w-8 bg-primary-navy/40" />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto"
          >
            {t('brands.sectionSubtitle')}
          </motion.p>
        </div>
      </div>

      {/* Marquee with improved mask */}
      <div className="relative mt-16">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-48 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-48 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent" />
        <Lane items={brands} durationSec={80} />
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/brands"
          className="group inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-slate-900 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:bg-slate-950 hover:text-white hover:shadow-2xl hover:shadow-slate-950/20"
        >
          {t('brands.viewAll')}
          <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="transition-transform group-hover:translate-x-1">
            <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  )
}

export default BrandsShowcase



