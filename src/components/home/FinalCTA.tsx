'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import React from 'react'

import { useI18n } from '../../i18n/I18nProvider'

interface FinalCTAProps {
  onQuoteClick: () => void
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onQuoteClick }) => {
  const { t } = useI18n()

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 sm:py-32 text-white border-t border-white/5">
      {/* Background Technical Atmosphere - Full Width */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/10 blur-[150px] rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full -translate-x-1/4 translate-y-1/4" />
        
        {/* HUD Grid */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(34,211,238,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.2) 1px, transparent 1px)', 
               backgroundSize: '100px 100px'
             }} 
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        {/* Standartlaştırılmış Başlık Bloğu (Sayfa Ritmi ile Uyumlu) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-400 mb-4"
            >
              {t('home.finalCta.eyebrow')}
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-light tracking-tighter text-white sm:text-6xl"
            >
              {t('home.finalCta.title')}
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="max-w-md text-lg text-slate-400 font-light leading-relaxed border-l-2 border-cyan-500/30 pl-8"
          >
            {t('home.finalCta.subtitle')}
          </motion.p>
        </div>

        {/* Aksiyon ve Bilgi Alanı */}
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="flex flex-wrap gap-6">
            <button
              type="button"
              onClick={onQuoteClick}
              className="group relative h-16 px-12 bg-white text-slate-950 font-bold uppercase text-[12px] tracking-[0.2em] rounded-2xl overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-95"
            >
              <span className="relative z-10">{t('home.finalCta.primaryCta')}</span>
              <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </button>
            
            <Link
              href="https://wa.me/905000000000"
              target="_blank"
              className="inline-flex items-center justify-center gap-4 h-16 px-10 rounded-2xl border border-white/10 bg-white/5 text-white font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              WhatsApp Destek
            </Link>
          </div>

          {/* Visual Unit - Simplified & Integrated */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-[3rem] border border-white/10 bg-white/[0.02] p-10 backdrop-blur-3xl overflow-hidden group max-w-xl lg:ml-auto">
              {/* Visual HUD Accents */}
              <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-white/20" />
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-white/20" />
              
              <div className="flex items-center gap-10">
                <div className="flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-cyan-400 mb-2">Project Pipeline</div>
                  <div className="text-5xl font-black text-white tracking-tighter">1540<span className="text-cyan-400">+</span></div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-1">Tamamlanan Mühendislik</div>
                </div>
                
                <div className="w-32 space-y-3">
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '92%' }}
                      transition={{ duration: 2, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400" 
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-slate-500">
                    <span>92% Optimizasyon</span>
                  </div>
                </div>
              </div>

              {/* Animated Scan Line */}
              <motion.div 
                animate={{ left: ['-100%', '200%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 bottom-0 w-24 bg-white/5 skew-x-[45deg] pointer-events-none"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default FinalCTA
