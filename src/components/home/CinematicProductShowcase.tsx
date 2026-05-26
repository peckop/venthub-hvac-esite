'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useI18n } from '../../i18n/I18nProvider'

interface HotspotProps {
  x: number
  y: number
  label: string
  detail: string
  isActive: boolean
  onToggle: () => void
}

const Hotspot: React.FC<HotspotProps> = ({ x, y, label, detail, isActive, onToggle }) => {
  const { t } = useI18n()
  
  return (
    <div 
      className="absolute z-30" 
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="relative flex items-center justify-center w-8 h-8 outline-none group"
        aria-label={label}
      >
        {/* Pulse Rings */}
        <span className="absolute inset-0 rounded-full bg-cyan-400 opacity-40 animate-ping" />
        <span className="absolute -inset-1 rounded-full border border-cyan-500/30 scale-110 group-hover:scale-125 transition-transform duration-500" />
        
        {/* Center Dot */}
        <span className={`relative w-3.5 h-3.5 rounded-full border-2 border-white transition-colors duration-500 shadow-glow-md ${isActive ? 'bg-white scale-125' : 'bg-cyan-500'}`} />
        
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: -10, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full mb-4 w-64 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 p-4 rounded-2xl shadow-elevation-4 z-50 pointer-events-none"
            >
              <div className="text-xs font-black uppercase tracking-hvac-normal text-cyan-400 mb-1">
                {t('home.cinematicShowcase.componentLabel') || 'System Component'}
              </div>
              <div className="text-white text-sm font-bold mb-2">{label}</div>
              <div className="h-px w-8 bg-cyan-500/50 mb-2" />
              <p className="text-slate-400 text-xs leading-relaxed font-light">{detail}</p>
              
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-cyan-500/30 rotate-45 -translate-y-1.5" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  )
}

const productImages = [
  { 
    src: '/images/vortice_lineo_futuristic.png', 
    label: 'Futuristic Premium',
    hotspots: [
      { x: 55, y: 35, key: 'motor' },
      { x: 25, y: 65, key: 'clamps' },
      { x: 50, y: 70, key: 'housing' },
      { x: 85, y: 55, key: 'airflow' },
    ]
  },
  { 
    src: '/images/products/vortice_lineo_360.png', 
    label: '360 Series View',
    hotspots: [
      { x: 45, y: 45, key: 'motor' },
      { x: 75, y: 30, key: 'airflow' },
    ]
  },
]

const CinematicProductShowcase: React.FC = () => {
  const { t } = useI18n()
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 150 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setActiveHotspot(null)
  }

  const currentHotspots = productImages[activeImageIdx].hotspots

  return (
    <section 
      className="relative w-full bg-slate-950 py-24 lg:py-32 overflow-hidden border-y border-white/5"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Ambience & Scanning Laser */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-600px h-hvac-hero bg-cyan-500/10 blur-150 rounded-full opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-500px h-500px bg-indigo-500/10 blur-120 rounded-full opacity-50" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-cyan-grid bg-grid-100 mask-radial-ellipse" />
        
        {/* Scanning Line */}
        <motion.div 
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent z-10"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <div className="relative order-2 lg:order-1" ref={containerRef}>
            <div className="relative aspect-square sm:aspect-video lg:aspect-square">
              
              <motion.div
                style={{ rotateX, rotateY, perspective: 1000 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImageIdx}
                    initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full h-full flex items-center justify-center p-12 bg-white/1 border border-white/5 rounded-hvac-3xl backdrop-blur-3xl overflow-hidden shadow-2xl"
                  >
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-7/10 h-7/10 rounded-full bg-cyan-500/20 blur-3xl opacity-20 animate-pulse" />
                    </div>

                    <Image
                      src={productImages[activeImageIdx].src}
                      alt={productImages[activeImageIdx].label}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
                      className="object-contain drop-shadow-cinematic-drop z-20"
                      // Only priority for the first element or if visible
                      priority={activeImageIdx === 0}
                    />

                    <div className="absolute inset-0 z-30">
                      {currentHotspots.map((spot) => (
                        <Hotspot 
                          key={`${activeImageIdx}-${spot.key}`}
                          x={spot.x}
                          y={spot.y}
                          label={t(`home.cinematicShowcase.hotspots.${spot.key}`) || spot.key}
                          detail={t(`home.cinematicShowcase.hotspots.${spot.key}Detail`) || t(`home.cinematicShowcase.hotspots.${spot.key}`)}
                          isActive={activeHotspot === spot.key}
                          onToggle={() => setActiveHotspot(activeHotspot === spot.key ? null : spot.key)}
                        />
                      ))}
                    </div>

                    <div className="absolute top-10 left-10 w-12 h-12 border-t-2 border-l-2 border-cyan-500/20 rounded-tl-xl" />
                    <div className="absolute bottom-10 right-10 w-12 h-12 border-b-2 border-r-2 border-cyan-500/20 rounded-br-xl" />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>

            <div className="mt-12 flex justify-center gap-4">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => { setActiveImageIdx(idx); setActiveHotspot(null); }}
                  aria-label={`Showcase view ${idx + 1}`}
                  className={`group relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-colors duration-500 ${activeImageIdx === idx ? 'border-cyan-500 shadow-glow-md scale-110' : 'border-white/10 opacity-40 hover:opacity-100 hover:scale-105'}`}
                >
                  <Image 
                    src={img.src} 
                    alt={img.label} 
                    fill 
                    sizes="(max-width: 768px) 80px, 80px"
                    className="object-cover p-2" 
                  />
                  <div className={`absolute inset-0 bg-cyan-500/10 transition-opacity ${activeImageIdx === idx ? 'opacity-100' : 'opacity-0'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center order-1 lg:order-2">
            <motion.div
              initial={{ x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-8">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-hvac-relaxed text-cyan-400">{t('home.cinematicShowcase.eyebrow')}</span>
              </div>

              <h2 className="text-5xl lg:text-7xl font-extralight text-white leading-hvac-11 tracking-tighter mb-8">
                {t('home.cinematicShowcase.title')}
              </h2>
              
              <h3 className="text-xl lg:text-2xl text-cyan-300/60 font-light mb-10 italic border-l-2 border-cyan-500/30 pl-6">
                {t('home.cinematicShowcase.subtitle')}
              </h3>

              <p className="text-lg text-slate-400 leading-relaxed font-light mb-12">
                {t('home.cinematicShowcase.description')}
              </p>

              <div className="flex flex-wrap gap-6">
                <button 
                  className="group relative h-16 px-12 bg-white text-slate-950 font-bold uppercase text-xs tracking-hvac-normal rounded-2xl overflow-hidden transition-shadow hover:shadow-glow-lg"
                  style={{ '--glow-color': 'rgba(255,255,255,0.2)' } as React.CSSProperties}
                >
                  <span className="relative z-10">{t('home.cinematicShowcase.cta')}</span>
                  <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>
                
                <div className="flex items-center gap-4 text-white/40">
                  <div className="h-px w-12 bg-white/10" />
                  <span className="text-xs font-bold uppercase tracking-widest italic">
                    {t('home.cinematicShowcase.badge') || 'Industrial Grade'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default CinematicProductShowcase
