'use client'

import { Routes } from '@/utils/routes';
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../i18n/I18nProvider'

interface EliteHeroProps {
  onQuoteClick: () => void
}

export const EliteHero: React.FC<EliteHeroProps> = ({ onQuoteClick }) => {
  const { t } = useI18n()

  return (
    <section className="relative w-full h-[100vh] min-h-[700px] overflow-hidden bg-slate-950 flex items-center">
      {/* Background Image & Overlay with Motion */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "linear" }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="/images/hero_hvac_industrial_premium_1.png"
          alt={t('home.hero.visualAlt')}
          fill
          priority
          sizes="100vw"
          fetchPriority="high"
          className="object-cover object-center brightness-[0.6] saturate-[1.1]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      </motion.div>

      {/* Content with Motion */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white shadow-sm backdrop-blur-md mb-8"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{t('home.hero.eyebrow')}</span>
          </motion.div>

          <motion.h1 
            initial={{ y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="text-5xl font-light leading-[1.05] tracking-tighter text-white sm:text-6xl lg:text-[5.5rem]"
          >
            {t('home.hero.title')}
          </motion.h1>

          <motion.p 
            initial={{ y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="mt-8 max-w-xl text-lg font-light leading-relaxed text-slate-300 sm:text-2xl"
          >
            {t('home.hero.subtitle')}
          </motion.p>

          <motion.div 
            initial={{ y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center"
          >
            <Link
              href={Routes.products()}
              className="inline-flex h-16 items-center justify-center rounded-none bg-white px-10 text-[15px] font-bold uppercase tracking-widest text-slate-950 transition-all duration-500 hover:bg-cyan-400 hover:scale-105"
            >
              {t('home.hero.primaryCta')}
            </Link>

            <button
              type="button"
              onClick={onQuoteClick}
              className="inline-flex h-16 items-center justify-center rounded-none border border-white/30 bg-white/5 px-10 text-[15px] font-bold uppercase tracking-widest text-white backdrop-blur-sm transition-all duration-500 hover:bg-white/10 hover:border-white/60 hover:scale-105"
            >
              {t('home.hero.secondaryCta')}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator with Motion */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/60">Explore</span>
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-[1px] h-12 bg-gradient-to-b from-cyan-400 to-transparent" 
        />
      </motion.div>
    </section>
  )
}

export default EliteHero
