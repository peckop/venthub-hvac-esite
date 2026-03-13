'use client'

import { motion, Variants } from 'framer-motion'
import Link from 'next/link'
import React from 'react'

import { useI18n } from '../../i18n/I18nProvider'

const knowledgeItems = [
  { 
    id: 'guides', 
    href: '/destek/merkez',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  { 
    id: 'calculators', 
    href: '/destek/hesaplayicilar/hrv',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M9 9h6M9 13h6M9 17h6M12 9v8" />
      </svg>
    )
  },
  { 
    id: 'support', 
    href: '/support/sss',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
      </svg>
    )
  },
] as const

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as any }
  }
}

export const KnowledgeBlock: React.FC = () => {
  const { t } = useI18n()

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 sm:py-32 text-white">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.1),transparent_70%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        {/* Standartlaştırılmış Başlık Bloğu */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-400 mb-4"
            >
              {t('home.knowledge.eyebrow')}
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-light tracking-tighter text-white sm:text-6xl"
            >
              Mühendislik <span className="text-cyan-400">Merkezi</span>
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="max-w-md text-lg text-slate-400 font-light leading-relaxed"
          >
            {t('home.knowledge.subtitle')}
          </motion.p>
        </div>

        {/* Dynamic Grid Layout */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {knowledgeItems.map((item, index) => (
            <motion.div 
              key={item.id} 
              variants={cardVariants}
            >
              <Link
                href={item.href}
                className="group relative block h-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-10 backdrop-blur-md transition-all duration-500 hover:border-cyan-500/40 hover:bg-white/[0.05]"
              >
                <div className="absolute top-8 right-10 text-4xl font-black text-white/5 transition-colors group-hover:text-cyan-500/10">
                  0{index + 1}
                </div>

                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 transition-all duration-500 group-hover:bg-cyan-500 group-hover:text-slate-950">
                  {item.icon}
                </div>

                <div className="mt-12">
                  <h3 className="text-2xl font-bold text-white transition-colors group-hover:text-cyan-400">
                    {t(`home.knowledge.items.${item.id}.title`)}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-slate-400 group-hover:text-slate-300 font-light">
                    {t(`home.knowledge.items.${item.id}.description`)}
                  </p>
                </div>

                <div className="mt-10 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                  <span className="h-px w-6 bg-cyan-400/40" />
                  Keşfet
                  <svg width={18} height={18} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="transition-transform group-hover:translate-x-1">
                    <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default KnowledgeBlock
