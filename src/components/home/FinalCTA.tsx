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
    <section className="relative overflow-hidden bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-[3rem] border border-slate-900 bg-slate-950 p-8 shadow-[0_50px_100px_-20px_rgba(2,6,23,0.7)] sm:p-12 lg:p-16"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-navy/20 blur-[120px]" />
            <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-secondary-blue/10 blur-[120px]" />
            <div className="absolute inset-0 opacity-[0.05]" 
                 style={{ 
                   backgroundImage: 'radial-gradient(#38BDF8 1px, transparent 1px)', 
                   backgroundSize: '40px 40px',
                   maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 80%)'
                 }} 
            />
          </div>

          <div className="relative z-10 grid gap-12 lg:grid-cols-[1fr,420px] lg:items-center">
            <div className="max-w-3xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.4em] text-secondary-blue"
              >
                <span className="h-px w-8 bg-secondary-blue/40" />
                {t('home.finalCta.eyebrow')}
              </motion.div>
              
              <h2 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {t('home.finalCta.title')}
              </h2>
              
              <p className="mt-8 text-lg leading-relaxed text-slate-400 sm:text-xl">
                {t('home.finalCta.subtitle')}
              </p>

              <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={onQuoteClick}
                  className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-white px-8 py-5 text-sm font-bold text-slate-950 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/20"
                >
                  <span className="relative z-10">{t('home.finalCta.primaryCta')}</span>
                  <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-r from-white via-slate-100 to-white opacity-0 transition-opacity group-hover:opacity-100" />
                  <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="relative z-10 transition-transform group-hover:translate-x-1">
                    <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                
                <Link
                  href="https://wa.me/905000000000"
                  target="_blank"
                  className="inline-flex items-center justify-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-8 py-5 text-sm font-bold text-emerald-400 backdrop-blur-sm transition-all hover:bg-emerald-500/20"
                >
                  <svg width={20} height={20} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp Destek Hattı
                </Link>
              </div>
            </div>

            {/* Right Side: High-Tech Project Counter Panel */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-md"
            >
              <div className="absolute top-0 right-0 p-6 opacity-20">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                </svg>
              </div>

              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary-blue">
                Teknik Veri İzleme
              </div>
              
              <div className="mt-8 space-y-6">
                <div className="relative">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Tamamlanan Projeler</div>
                  <div className="mt-2 text-5xl font-bold text-white tracking-tight">
                    1.540<span className="text-secondary-blue">+</span>
                  </div>
                  <div className="mt-2 h-1 w-full bg-white/5 overflow-hidden rounded-full">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '85%' }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary-navy to-secondary-blue shadow-[0_0_10px_rgba(56,189,248,0.5)]" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.05]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Teknik Destek</div>
                    <div className="mt-1 text-xl font-bold text-white">7/24</div>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.05]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Marka Partner</div>
                    <div className="mt-1 text-xl font-bold text-white">40+</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-gradient-to-br from-primary-navy/40 to-transparent p-5 ring-1 ring-white/10">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  Mühendislik Hattı Aktif
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Projeniz için ücretsiz havalandırma analizi ve keşif randevusu oluşturun.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FinalCTA
