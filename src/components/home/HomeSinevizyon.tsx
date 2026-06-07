'use client'

import { Routes } from '@/utils/routes';
import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useI18n } from '../../i18n/I18nProvider'

interface HomeSinevizyonProps {
  onQuoteClick?: () => void
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
      { url: '/images/vortice_lineo_futuristic.png', labelKey: 'home.hero.sinevizyon.slides.0.products.0.label', subLabelKey: 'home.hero.sinevizyon.slides.0.products.0.subLabel', link: '/category/fans/duct-type-fans' },
      { url: '/images/products/vortice_lineo_360.png', labelKey: 'home.hero.sinevizyon.slides.0.products.1.label', subLabelKey: 'home.hero.sinevizyon.slides.0.products.1.subLabel', link: '/category/fans/quiet-duct-fans' }
    ],
    key: 0
  },
  {
    image: '/images/vortice_lineo_futuristic.png',
    products: [
      { url: '/images/products/vortice_lineo_360.png', labelKey: 'home.hero.sinevizyon.slides.1.products.0.label', subLabelKey: 'home.hero.sinevizyon.slides.1.products.0.subLabel', link: '/category/fans/duct-type-fans' },
      { url: '/images/vortice_lineo_futuristic.png', labelKey: 'home.hero.sinevizyon.slides.1.products.1.label', subLabelKey: 'home.hero.sinevizyon.slides.1.products.1.subLabel', link: '/category/fans/duct-type-fans' }
    ],
    key: 1
  },
  {
    image: '/images/hvac_installation_close_up_premium_3.png',
    products: [
      { url: '/images/products/vortice_lineo_360.png', labelKey: 'home.hero.sinevizyon.slides.2.products.0.label', subLabelKey: 'home.hero.sinevizyon.slides.2.products.0.subLabel', link: '/category/fans/duct-type-fans' },
      { url: '/images/vortice_lineo_futuristic.png', labelKey: 'home.hero.sinevizyon.slides.2.products.1.label', subLabelKey: 'home.hero.sinevizyon.slides.2.products.1.subLabel', link: '/category/fans/duct-type-fans' }
    ],
    key: 2
  }
]

const HomeSinevizyon: React.FC<HomeSinevizyonProps> = ({ onQuoteClick }) => {
  const { t } = useI18n()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const isInitialMount = useRef(true)
  useEffect(() => {
    setIsMounted(true)
    isInitialMount.current = false
  }, [])

  const paginate = useCallback((newDirection: number) => {
    setCurrentSlide((prev) => (prev + newDirection + slidesData.length) % slidesData.length)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    const timer = setInterval(() => paginate(1), 120000)
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

  const getSlideContent = (index: number) => {
    return {
      eyebrow: t(`home.hero.sinevizyon.slides.${index}.eyebrow`) || 'VentHub Engineering',
      title: t(`home.hero.sinevizyon.slides.${index}.title`) || 'High Performance HVAC',
      subtitle: t(`home.hero.sinevizyon.slides.${index}.subtitle`) || 'Advanced solutions for industrial ventilation.'
    }
  }

  return (
    <section 
      className="relative w-full h-80vh lg:h-90vh min-h-650px overflow-hidden bg-slate-950 flex items-center touch-pan-y contain-layout"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Blueprint Grid - Static CSS is better for TBT */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#38BDF8 1px, transparent 1px), linear-gradient(90deg, #38BDF8 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      {/* Air Flow Particles CSS has been moved to index.css to prevent hydration painting delays */}

      {/* LCP OPTIMIZATION: The first image is placed statically outside React state mapping. This removes ANY hydration or transition delay. */}
      <div className="absolute inset-0 z-0">
        <Image
          src={slidesData[0].image}
          alt={t('home.hero.sinevizyon.altMain') || 'VentHub HVAC'}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1200px"
          priority={true}
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          quality={70}
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      </div>

      {/* Background Images for Slide 2 and 3 crossfade ON TOP of Slide 1 */}
      {slidesData.map((slide, idx) => {
        if (idx === 0) return null; // Skip slide 0 since it's statically rendered underneath
        
        return (
          <div 
            key={slide.key}
            className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <Image
              src={slide.image}
              alt={t('home.hero.sinevizyon.altMain') || 'VentHub HVAC'}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1200px"
              priority={false}
              loading="lazy"
              quality={70}
              className="object-cover object-center"
            />
            {/* Performance overlay */}
            <div className="absolute inset-0 bg-slate-950/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          </div>
        );
      })}

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
        {/* Left Side: Content */}
        <div className="w-full lg:w-1/2 relative">
          {slidesData.map((slide, idx) => {
            const currentContent = getSlideContent(idx);
            return (
              <div
                key={`content-${idx}`}
                className={`transition-colors duration-1000 ease-in-out ${
                  idx === currentSlide
                    ? 'opacity-100 translate-x-0 relative z-10 pointer-events-auto delay-300'
                    : 'opacity-0 -translate-x-8 absolute inset-0 z-0 pointer-events-none'
                }`}
              >
                <div className="inline-flex items-center gap-3 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2.5 text-xs font-bold uppercase tracking-hvac-loose text-cyan-400 backdrop-blur-md mb-8">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-glow-sm" />
                  <span>{currentContent.eyebrow}</span>
                </div>

                <h1 className="text-5xl font-light leading-hvac-105 tracking-tighter text-white sm:text-6xl lg:text-8xl mb-8">
                  {currentContent.title}
                </h1>

                <p className="max-w-xl text-xl font-light leading-relaxed text-slate-300 mb-12">
                  {currentContent.subtitle}
                </p>

                <div className="flex flex-col gap-5 sm:flex-row">
                  <Link
                    href={Routes.products()}
                    className="group relative inline-flex h-16 items-center justify-center overflow-hidden rounded-2xl bg-cyan-500 px-12 text-sm font-bold uppercase tracking-widest text-slate-950 transition-shadow hover:bg-cyan-400 hover:shadow-glow-lg"
                  >
                    {t('home.hero.primaryCta')}
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      if (onQuoteClick) onQuoteClick();
                      else if (typeof window !== "undefined") {
                        window.openLeadModal?.();
                      }
                    }}
                    className="group relative inline-flex h-16 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/5 px-12 text-sm font-bold uppercase tracking-widest text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/10"
                  >
                    {t('home.hero.secondaryCta')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Floating High-Tech Products */}
        <div className="w-full lg:w-1/2 relative h-450px sm:h-550px">
          {/* Animated Air Flow Particles using optimized CSS */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{ top: `${20 + i * 15}%`, animationDelay: `${i * 0.5}s` }}
              />
            ))}
          </div>

          {slidesData.map((slide, slideIdx) => (
            <div
              key={`products-${slideIdx}`}
              className={`absolute inset-0 flex items-center justify-center transition-colors duration-1000 ease-in-out ${
                slideIdx === currentSlide
                  ? 'opacity-100 scale-100 z-10 pointer-events-auto delay-300'
                  : 'opacity-0 scale-95 z-0 pointer-events-none'
              }`}
            >
              {slide.products.map((p, i) => (
                <div
                  key={p.url}
                  className={`absolute transition-colors duration-1000 ease-in-out ${
                    slideIdx === currentSlide 
                      ? i === 0 ? 'z-20 opacity-100 translate-x-0' : 'z-10 opacity-40 translate-x-32 translate-y-20 blur-1'
                      : 'opacity-0'
                  }`}
                >
                  <Link href={p.link as import('next').Route} className="relative block group">
                    {/* Technical HUD Label - Redesigned for High-Tech Aesthetic */}
                    <div className={`absolute ${i === 0 ? '-right-24 top-0' : '-left-24 bottom-0'} z-30 hidden lg:block`}>
                      <div className="relative">
                        {/* Connecting Line with Animated Dot */}
                        <div className={`absolute ${i === 0 ? 'right-full' : 'left-full'} top-1/2 -translate-y-1/2 flex items-center`}>
                          <div className="h-px w-16 bg-gradient-to-r from-transparent via-cyan-500 to-cyan-400" />
                          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-glow-sm animate-pulse" />
                        </div>

                        <div 
                          className="relative group/hud overflow-hidden rounded-xl border border-cyan-500/20 bg-slate-900/40 p-4 backdrop-blur-xl transition-shadow duration-500 hover:border-cyan-400/50 hover:shadow-glow-md"
                          style={{ '--glow-color': 'rgba(34,211,238,0.15)' } as React.CSSProperties}
                        >
                          {/* HUD Corner Accents */}
                          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/60" />
                          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/60" />
                          
                          {/* Animated Scan Line Inside HUD */}
                          <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute inset-0 border-b border-cyan-400/10 animate-scan-slow" />
                          </div>

                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <div className="h-1 w-1 bg-cyan-400 rounded-full" />
                              <div className="text-xs font-black uppercase tracking-hvac-normal text-cyan-400/80">System.Data.Live</div>
                            </div>
                            <div className="text-base font-bold text-white tracking-tight leading-tight">{t(p.labelKey)}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="text-xs font-medium uppercase tracking-widest text-slate-400">{t(p.subLabelKey)}</div>
                              <div className="h-px flex-1 bg-white/5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="relative w-64 h-64 sm:w-80 sm:h-80 drop-shadow-sinevizyon-drop transition-transform group-hover:scale-105"
                      style={{ 
                        animation: `float ${5 + i}s ease-in-out infinite`,
                        transform: 'translate3d(0, 0, 0)' // Trigger GPU acceleration
                      }}
                    >
                      <Image 
                        src={p.url} 
                        alt={t('home.hero.sinevizyon.altProduct')} 
                        fill 
                        priority={slideIdx === 0}
                        fetchPriority={slideIdx === 0 ? "high" : "low"}
                        decoding={slideIdx === 0 ? "sync" : "async"}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                        quality={70}
                        className="object-contain" 
                      />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ))}
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
              className="relative flex items-center justify-center min-h-6 min-w-6 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              <span className={`block h-1.5 rounded-full transition-colors duration-500 ${idx === currentSlide ? 'w-12 bg-cyan-400' : 'w-3 bg-white/20'}`} />
            </button>
          ))}
        </div>
        <div className="h-px w-12 bg-white/10" />
        <div className="text-xs font-bold text-white/40 tracking-hvac-relaxed">0{currentSlide + 1} / 0{slidesData.length}</div>
      </div>
    </section>
  )
}

export default HomeSinevizyon
