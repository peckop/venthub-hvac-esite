'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../../i18n/I18nProvider'

interface HomeSinevizyonProps {
  onQuoteClick: () => void
}

interface SlideProduct {
  url: string
  labelKey: string
  subLabelKey: string
  link: string
}

interface SlideData {
  image: string
  key: number
  products: SlideProduct[]
}

const slidesData: SlideData[] = [
  {
    image: '/images/hero_hvac_industrial_premium_1.png',
    products: [
      { url: '/images/vortice_lineo_futuristic.png', labelKey: 'home.hero.sinevizyon.slides.0.products.0.label', subLabelKey: 'home.hero.sinevizyon.slides.0.products.0.subLabel', link: '/category/fanlar/kanal-tipi-fanlar' },
      { url: '/images/products/vortice_lineo_360.png', labelKey: 'home.hero.sinevizyon.slides.0.products.1.label', subLabelKey: 'home.hero.sinevizyon.slides.0.products.1.subLabel', link: '/category/fanlar/sessiz-fanlar' }
    ],
    key: 0
  },
  {
    image: '/images/vortice_lineo_futuristic.png',
    products: [
      { url: '/images/products/vortice_lineo_360.png', labelKey: 'home.hero.sinevizyon.slides.1.products.0.label', subLabelKey: 'home.hero.sinevizyon.slides.1.products.0.subLabel', link: '/category/fanlar/kanal-tipi-fanlar' },
      { url: '/images/vortice_lineo_futuristic.png', labelKey: 'home.hero.sinevizyon.slides.1.products.1.label', subLabelKey: 'home.hero.sinevizyon.slides.1.products.1.subLabel', link: '/category/fanlar/kanal-tipi-fanlar' }
    ],
    key: 1
  },
  {
    image: '/images/hvac_installation_close_up_premium_3.png',
    products: [
      { url: '/images/products/vortice_lineo_360.png', labelKey: 'home.hero.sinevizyon.slides.2.products.0.label', subLabelKey: 'home.hero.sinevizyon.slides.2.products.0.subLabel', link: '/category/fanlar/kanal-tipi-fanlar' },
      { url: '/images/vortice_lineo_futuristic.png', labelKey: 'home.hero.sinevizyon.slides.2.products.1.label', subLabelKey: 'home.hero.sinevizyon.slides.2.products.1.subLabel', link: '/category/fanlar/kanal-tipi-fanlar' }
    ],
    key: 2
  }
]

export const HomeSinevizyon: React.FC<HomeSinevizyonProps> = ({ onQuoteClick }) => {
  const { t } = useI18n()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])
  const [direction, setDirection] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection)
    setCurrentSlide((prev) => (prev + newDirection + slidesData.length) % slidesData.length)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    const timer = setInterval(() => paginate(1), 12000)
    return () => clearInterval(timer)
  }, [paginate, isMounted])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') paginate(1)
      if (e.key === 'ArrowLeft') paginate(-1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [paginate])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX
    if (Math.abs(diff) > 50) {
      if (diff > 0) paginate(1)
      else paginate(-1)
    }
    touchStartX.current = null
  }

  // Fallback labels for robustness
  const getSlideContent = (index: number) => {
    return {
      eyebrow: t(`home.hero.sinevizyon.slides.${index}.eyebrow`) || 'VentHub Engineering',
      title: t(`home.hero.sinevizyon.slides.${index}.title`) || 'High Performance HVAC',
      subtitle: t(`home.hero.sinevizyon.slides.${index}.subtitle`) || 'Advanced solutions for industrial ventilation.'
    }
  }

  const currentContent = getSlideContent(currentSlide)

  return (
    <section 
      className="relative w-full h-[80vh] lg:h-[90vh] min-h-[650px] overflow-hidden bg-slate-950 flex items-center touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Blueprint Grid */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#38BDF8 1px, transparent 1px), linear-gradient(90deg, #38BDF8 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={slidesData[currentSlide].image}
            alt="VentHub Sinevizyon"
            fill
            sizes="100vw"
            priority={currentSlide === 0}
            fetchPriority={currentSlide === 0 ? "high" : "auto"}
            loading={currentSlide === 0 ? "eager" : "lazy"}
            className="object-cover object-center brightness-[0.4] saturate-[1.2]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
        {/* Left Side: Content */}
        <div className="w-full lg:w-1/2">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${currentSlide}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-3 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.4em] text-cyan-400 backdrop-blur-md mb-8">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22D3EE]" />
                <span>{currentContent.eyebrow}</span>
              </div>

              <h1 className="text-5xl font-light leading-[1.05] tracking-tighter text-white sm:text-6xl lg:text-8xl mb-8">
                {currentContent.title}
              </h1>

              <p className="max-w-xl text-xl font-light leading-relaxed text-slate-300 mb-12">
                {currentContent.subtitle}
              </p>

              <div className="flex flex-col gap-5 sm:flex-row">
                <Link
                  href="/products"
                  className="group relative inline-flex h-16 items-center justify-center overflow-hidden rounded-2xl bg-cyan-500 px-12 text-[14px] font-bold uppercase tracking-widest text-slate-950 transition-all hover:bg-cyan-400 hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]"
                >
                  {t('home.hero.primaryCta')}
                </Link>

                <button
                  type="button"
                  onClick={onQuoteClick}
                  className="group relative inline-flex h-16 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/5 px-12 text-[14px] font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all duration-300 hover:bg-white/10"
                >
                  {t('home.hero.secondaryCta')}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Floating High-Tech Products */}
        <div className="w-full lg:w-1/2 relative h-[450px] sm:h-[550px]">
          {/* Animated Air Flow Particles */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 600, opacity: [0, 0.2, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "linear" }}
                className="absolute h-px w-24 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                style={{ top: `${20 + i * 15}%` }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`products-${currentSlide}`}
              className="relative w-full h-full flex items-center justify-center"
            >
              {slidesData[currentSlide].products.map((p, i) => (
                <motion.div
                  key={p.url}
                  initial={{ opacity: 0, scale: 0.8, x: i === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className={`absolute ${i === 0 ? 'z-20' : 'z-10 opacity-40 translate-x-32 translate-y-20 blur-[1px]'}`}
                >
                  <Link href={p.link} className="relative block group">
                    {/* Technical HUD Label */}
                    <motion.div 
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`absolute ${i === 0 ? '-right-16 top-0' : '-left-16 bottom-0'} z-30 hidden lg:block`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-px w-12 bg-cyan-400/50" />
                        <div className="rounded-lg border border-cyan-500/30 bg-slate-950/80 p-3 backdrop-blur-md">
                          <div className="text-[14px] font-black text-white">{t(p.labelKey)}</div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">{t(p.subLabelKey)}</div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      animate={{ y: [0, -20, 0], rotate: [0, 1, 0] }}
                      transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
                      className="relative w-64 h-64 sm:w-80 sm:h-80 drop-shadow-[0_30px_60px_rgba(0,0,0,0.9)] transition-transform group-hover:scale-105"
                    >
                      <Image src={p.url} alt="Technical Product" fill className="object-contain" />
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Modern Indicators */}
      <div className="absolute left-10 bottom-10 z-20 flex items-center gap-6">
        <div className="flex gap-2">
          {slidesData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-12 bg-cyan-400' : 'w-3 bg-white/20'}`}
            />
          ))}
        </div>
        <div className="h-px w-12 bg-white/10" />
        <div className="text-[10px] font-bold text-white/40 tracking-[0.3em]">0{currentSlide + 1} / 0{slidesData.length}</div>
      </div>
    </section>
  )
}

export default HomeSinevizyon
