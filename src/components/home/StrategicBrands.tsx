'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../i18n/I18nProvider'
import BrandsShowcase from '../BrandsShowcase'

export const StrategicBrands: React.FC = () => {
  const { t } = useI18n()

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-600 mb-4"
            >
              {t('home.strategicBrands.eyebrow')}
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-light tracking-tighter text-slate-950 sm:text-6xl"
            >
              {t('home.strategicBrands.title')}
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="max-w-md text-lg text-slate-500 font-light leading-relaxed"
          >
            {t('home.strategicBrands.subtitle')}
          </motion.p>
        </div>
      </div>

      <BrandsShowcase />
    </section>
  )
}

export default StrategicBrands
