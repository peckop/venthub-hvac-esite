'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../../i18n/I18nProvider'
import { getCategories, type Category } from '../../lib/supabase'
import { getCategoryDisplayName } from '../../utils/categoryHelpers'

// Mock images for cinematic feel - we'll use these as fallbacks or matches
const categoryImages: Record<string, string> = {
  'fanlar': '/images/vortice_lineo_futuristic.png',
  'hava-perdeleri': '/images/products/vortice_lineo_360.png',
  'isi-geri-kazanim-cihazlari': '/images/vortice_lineo_futuristic.png',
  'hiz-kontrolu-cihazlari': '/images/products/vortice_lineo_360.png',
  'mutfak-havalandirma': '/images/vortice_lineo_futuristic.png',
  'otopark-havalandirma': '/images/products/vortice_lineo_360.png',
  'cati-tipi-fanlar': '/images/vortice_lineo_futuristic.png',
  'aksesuarlar': '/images/products/vortice_lineo_360.png'
}

export const GuidedCategoryDiscovery: React.FC = () => {
  const { t } = useI18n()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const data = await getCategories()
        if (!active) return
        // Sadece ana kategorileri (level 0) al ve sırala
        const mainCats = data
          .filter((c) => c.level === 0)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        setCategories(mainCats)
      } catch (error) {
        console.error('Failed to load homepage categories:', error)
      }
    }
    void load()
    return () => { active = false }
  }, [])

  // Tüm kategorileri kullanacağımız için artık useMemo ile filtrelemeye gerek yok
  const displayCategories = categories;

  return (
    <section id="categories" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-600 mb-4"
            >
              {t('home.guidedDiscovery.eyebrow')}
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-light tracking-tighter text-slate-950 sm:text-6xl"
            >
              {t('home.guidedDiscovery.title')}
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="max-w-md text-lg text-slate-500 font-light leading-relaxed"
          >
            {t('home.guidedDiscovery.subtitle')}
          </motion.p>
        </div>

        {/* Mobile: Horizontal Scroll | Desktop: Grid */}
        <div className="flex overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 lg:gap-2 md:overflow-visible md:pb-0">
          {displayCategories.map((category, idx) => {
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.8 }}
                className="group relative flex-shrink-0 w-[280px] sm:w-[320px] md:w-auto snap-center overflow-hidden bg-slate-100 aspect-square lg:aspect-[0.85/1] transition-all duration-700"
              >
                <Link href={`/category/${category.slug}`} className="block w-full h-full">
                  {/* Background Image with Decocasa-style zoom and tint */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={categoryImages[category.slug] || '/images/vortice_lineo_futuristic.png'}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
                    />
                    {/* Architectural Overlay */}
                    <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Content Overlay - Centered and Minimal */}
                  <div className="absolute inset-0 z-10 p-10 flex flex-col items-center justify-center text-center">
                    <motion.div 
                      initial={{ opacity: 0.8 }}
                      className="flex flex-col items-center"
                    >
                      <h3 className="text-xl lg:text-2xl font-extralight text-white tracking-[0.1em] uppercase mb-4 transition-transform duration-700 group-hover:-translate-y-2">
                        {getCategoryDisplayName(category)}
                      </h3>

                      <div className="w-12 h-[1px] bg-white/30 group-hover:w-24 group-hover:bg-cyan-500 transition-all duration-700" />
                      
                      <div className="mt-6 max-h-0 group-hover:max-h-24 opacity-0 group-hover:opacity-100 transition-all duration-700 overflow-hidden">
                        <p className="text-[10px] text-slate-200 font-light leading-relaxed tracking-wider uppercase mb-6 max-w-[200px] line-clamp-2">
                          {category.description || t('home.guidedDiscovery.categoryFallback')}
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-white/20 group-hover:border-cyan-500/50 transition-colors duration-500" />
                  <div className="absolute bottom-8 left-8 w-4 h-4 border-b border-l border-white/20 group-hover:border-cyan-500/50 transition-colors duration-500" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default GuidedCategoryDiscovery
