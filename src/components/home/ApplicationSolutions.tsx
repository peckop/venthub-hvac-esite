'use client'

import { motion, Variants } from 'framer-motion'
import Link from 'next/link'
import React from 'react'

import { useI18n } from '../../i18n/I18nProvider'

const solutionItems = [
  { 
    id: 'parking', 
    href: '/category/fanlar/otopark-jet-fanlari', 
    image: '/images/bento/parking.jpg',
    span: 'lg:col-span-2',
    techTitle: 'Duman Tahliye Senaryosu',
    techDesc: 'Yangın anında akıllı jet fan otomasyonu ile dumanı bloke ederek güvenli kaçış koridorları oluşturuyoruz.',
    tags: ['Yangın Otomasyonu', 'Hava Akış Analizi']
  },
  { 
    id: 'kitchen', 
    href: '/category/fanlar/kanal-tipi-fanlar', 
    image: '/images/bento/kitchen.jpg',
    span: 'lg:col-span-1',
    techTitle: 'Mutfak Filtrasyonu',
    techDesc: 'Yüksek yoğunluklu duman ve koku kontrolü için elektrostatik filtreleme çözümleri.',
    tags: ['Yağ Tutucu', 'Koku Kontrolü']
  },
  { 
    id: 'entrance', 
    href: '/category/hava-perdeleri', 
    image: '/images/bento/air-curtain.jpg',
    span: 'lg:col-span-1',
    techTitle: 'Isı Bariyeri Kontrolü',
    techDesc: 'Giriş alanlarında görünmez bir hava kalkanı kurarak iklimlendirme maliyetlerini %80 azaltıyoruz.',
    tags: ['Enerji Verimliliği', 'Termal Bariyer']
  },
  { 
    id: 'comfort', 
    href: '/category/isi-geri-kazanim-cihazlari', 
    image: '/images/bento/hrv.jpg',
    span: 'lg:col-span-2',
    techTitle: 'Isı Geri Kazanım Sistemi',
    techDesc: 'Kirli havayı dışarı atarken ısısını koruyarak taze havaya aktaran, yüksek verimli mühendislik çözümü.',
    tags: ['%93 Verim', 'Hassas Filtrasyon']
  },
] as const

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
}

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" as any }
  }
}

export const ApplicationSolutions: React.FC = () => {
  const { t } = useI18n()

  return (
    <section id="applications" className="relative overflow-hidden bg-white py-24 sm:py-32">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        {/* Standartlaştırılmış Başlık Bloğu */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-600 mb-4"
            >
              {t('home.applicationSolutions.eyebrow')}
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-light tracking-tighter text-slate-950 sm:text-6xl"
            >
              {t('home.applicationSolutions.title')}
            </motion.h2>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-4">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="max-w-md text-lg text-slate-500 font-light leading-relaxed"
            >
              {t('home.applicationSolutions.subtitle')}
            </motion.p>
            
            <Link 
              href="/products#applications" 
              className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-950 transition-all hover:gap-3"
            >
              <span className="relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:scale-x-0 after:bg-slate-950 after:transition-transform group-hover:after:scale-x-100">
                {t('home.applicationSolutions.viewAll')}
              </span>
              <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Ürün Kartları - Konteyner İçinde */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {solutionItems.map((item) => (
            <motion.div key={item.id} variants={itemVariants} className={item.span}>
              <Link
                href={item.href}
                className="group relative flex h-full min-h-[380px] flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-slate-50 transition-all duration-500 hover:border-primary-navy/20 hover:shadow-2xl hover:shadow-primary-navy/10"
              >
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={item.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex h-full flex-col justify-end p-8 sm:p-10">
                  <div className="mb-auto self-end">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-300 group-hover:bg-cyan-500 group-hover:border-cyan-500">
                      <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400">
                      {t(`home.applicationSolutions.items.${item.id}.eyebrow`)}
                    </div>
                    <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                      {item.techTitle}
                    </h3>
                    <p className="mt-4 text-[15px] leading-relaxed text-slate-300 font-light">
                      {item.techDesc}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <div key={tag} className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-colors group-hover:bg-white/15">
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default ApplicationSolutions
