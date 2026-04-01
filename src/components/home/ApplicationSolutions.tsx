'use client'

import { motion, Variants } from 'framer-motion'
import React from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import Link from 'next/link'
import Image from 'next/image'

interface SolutionItem {
  id: 'parking' | 'kitchen' | 'entrance' | 'comfort'
  href: string
  image: string
  span: string
}

const solutions: SolutionItem[] = [
  { 
    id: 'parking', 
    href: '/category/industrial-ventilation/jet-fans', 
    image: '/images/bento/parking.jpg',
    span: 'sm:col-span-2 lg:col-span-2'
  },
  { 
    id: 'kitchen', 
    href: '/category/industrial-ventilation/duct-type-fans', 
    image: '/images/bento/kitchen.jpg',
    span: 'sm:col-span-1 lg:col-span-1'
  },
  { 
    id: 'entrance', 
    href: '/category/commercial-ventilation/air-curtains', 
    image: '/images/bento/entrance.jpg',
    span: 'sm:col-span-1 lg:col-span-1'
  },
  { 
    id: 'comfort', 
    href: '/category/heat-recovery-vmc', 
    image: '/images/bento/comfort.jpg',
    span: 'sm:col-span-2 lg:col-span-2'
  }
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
}

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

export const ApplicationSolutions: React.FC = () => {
  const { t } = useI18n()

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-white">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 -skew-x-12 translate-x-1/4" />
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
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
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="max-w-md text-lg text-slate-500 font-light leading-relaxed"
          >
            {t('home.applicationSolutions.subtitle')}
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {solutions.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className={`group relative overflow-hidden rounded-3xl bg-slate-100 h-[300px] sm:h-[400px] lg:h-[450px] ${item.span}`}
            >
              <Link href={item.href} className="block w-full h-full relative">
                <Image
                  src={item.image}
                  alt={t(`home.applicationSolutions.items.${item.id}.title`)}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="mb-4 overflow-hidden">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      {t(`home.applicationSolutions.items.${item.id}.eyebrow`)}
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      {t(`home.applicationSolutions.items.${item.id}.title`)}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-slate-300 font-light leading-relaxed mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-2">
                    {t(`home.applicationSolutions.items.${item.id}.description`)}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] text-white font-medium">
                      {t(`home.applicationSolutions.items.${item.id}.point1`)}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] text-white font-medium">
                      {t(`home.applicationSolutions.items.${item.id}.point2`)}
                    </span>
                  </div>
                </div>

                {/* Corner Arrow */}
                <div className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-16 text-center">
          <Link 
            href="/products"
            className="inline-flex items-center gap-4 group"
          >
            <span className="text-sm font-bold uppercase tracking-widest text-slate-400 group-hover:text-cyan-600 transition-colors">
              {t('home.applicationSolutions.viewAll')}
            </span>
            <div className="w-12 h-[1px] bg-slate-200 group-hover:w-20 group-hover:bg-cyan-600 transition-all duration-500" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ApplicationSolutions
