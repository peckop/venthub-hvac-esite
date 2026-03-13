'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../../i18n/I18nProvider'

interface HotspotProps {
  x: number
  y: number
  label: string
  isActive: boolean
  onToggle: () => void
}

const Hotspot: React.FC<HotspotProps> = ({ x, y, label, isActive, onToggle }) => (
  <div 
    className="absolute z-30" 
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    <button
      onClick={onToggle}
      className="relative flex items-center justify-center w-6 h-6 outline-none group"
      aria-label={label}
    >
      <span className="absolute inset-0 rounded-full bg-cyan-400 opacity-60 animate-ping" />
      <span className="relative w-3 h-3 rounded-full bg-cyan-400 border border-white shadow-lg shadow-cyan-500/50" />
      
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 20, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            className="absolute left-full ml-4 whitespace-nowrap bg-slate-900/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg text-white text-xs font-medium shadow-2xl"
          >
            {label}
            <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900/90 border-l border-b border-white/10 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  </div>
)

const productImages = [
  { src: '/images/vortice_lineo_futuristic.png', label: 'Futuristic Premium' },
  { src: '/images/products/vortice_lineo_360.png', label: '360 Series View' },
]

export const CinematicProductShowcase: React.FC = () => {
  const { t } = useI18n()
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null)
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  const hotspots = [
    { x: 55, y: 35, label: t('home.cinematicShowcase.hotspots.motor') },
    { x: 25, y: 65, label: t('home.cinematicShowcase.hotspots.clamps') },
    { x: 50, y: 70, label: t('home.cinematicShowcase.hotspots.housing') },
    { x: 80, y: 65, label: t('home.cinematicShowcase.hotspots.airflow') },
  ]

  return (
    <section className="relative w-full bg-slate-950 py-24 overflow-hidden border-y border-white/5">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[url('/images/hero_hvac_industrial_premium_1.png')] bg-cover bg-fixed opacity-[0.03] grayscale" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile-first UX Flow: Header always at top on mobile */}
        <div className="lg:hidden mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-4">
              {t('home.cinematicShowcase.eyebrow')}
            </span>
            <h2 className="text-4xl font-extralight text-white tracking-tight mb-2">
              {t('home.cinematicShowcase.title')}
            </h2>
            <h3 className="text-lg text-cyan-300/60 font-light italic">
              {t('home.cinematicShowcase.subtitle')}
            </h3>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Product Image Gallery & Hotspots */}
          <div className="relative flex flex-col gap-8 order-2 lg:order-1">
            <div className="relative aspect-square sm:aspect-video lg:aspect-square">
              {/* ... existing image content ... */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImageIdx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative w-full h-full flex items-center justify-center p-8 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-3xl overflow-hidden"
                >
                  {/* Cinematic Product Ring Shadow */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[80%] h-[80%] rounded-full bg-gradient-to-t from-cyan-500/20 to-transparent blur-3xl opacity-30 animate-pulse" />
                  </div>

                  {/* Main Product Image */}
                  <div className="relative z-10 w-full h-full">
                    <Image
                      src={productImages[activeImageIdx]?.src || ''}
                      alt="Vortice Lineo Product"
                      fill
                      className="object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
                      priority
                    />
                  </div>

                  {/* Hotspots */}
                  {activeImageIdx === 0 && hotspots.map((spot, idx) => (
                    <Hotspot 
                      key={idx}
                      {...spot}
                      isActive={activeHotspot === idx}
                      onToggle={() => setActiveHotspot(activeHotspot === idx ? null : idx)}
                    />
                  ))}

                  {/* Letterbox Bars */}
                  <div className="absolute top-0 left-0 w-full h-8 bg-slate-950/20 backdrop-blur-sm border-b border-white/5 pointer-events-none z-20" />
                  <div className="absolute bottom-0 left-0 w-full h-8 bg-slate-950/20 backdrop-blur-sm border-t border-white/5 pointer-events-none z-20" />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeImageIdx === idx ? 'border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-105' : 'border-white/10 opacity-50 hover:opacity-100'}`}
                >
                  <Image
                    src={img.src}
                    alt={img.label}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="flex flex-col justify-center order-3 lg:order-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {/* Desktop Only Headers */}
              <div className="hidden lg:block">
                <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-6">
                  {t('home.cinematicShowcase.eyebrow')}
                </span>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-white leading-tight tracking-tight mb-6">
                  {t('home.cinematicShowcase.title')}
                </h2>
                <h3 className="text-xl sm:text-2xl text-cyan-300/60 font-light mb-8 italic">
                  {t('home.cinematicShowcase.subtitle')}
                </h3>
              </div>

              <p className="text-lg text-slate-300/80 leading-relaxed font-light mb-12 text-center lg:text-left">
                {t('home.cinematicShowcase.description')}
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <button className="h-14 px-10 bg-gradient-to-r from-cyan-600 to-cyan-400 text-slate-950 font-bold uppercase text-[12px] tracking-widest rounded-full hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:scale-105 transition-all">
                  {t('home.cinematicShowcase.cta')}
                </button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default CinematicProductShowcase
