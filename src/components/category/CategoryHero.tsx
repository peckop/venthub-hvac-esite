'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Layers, ShieldCheck, Zap } from 'lucide-react'
import { VentImage } from '../ui/VentImage'
import { getCategoryIcon } from '../../utils/getCategoryIcon'
import { getCategoryDisplayName } from '../../utils/categoryHelpers'
import { useI18n } from '../../i18n/I18nProvider'
import type { DomainCategory } from '../../lib/type-converters'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CategoryHeroProps {
  category: DomainCategory | null
  parentCategory?: DomainCategory | null
  productCount?: number
  loading?: boolean
}

const CategoryHero: React.FC<CategoryHeroProps> = ({ category, parentCategory, productCount, loading }) => {
  const { t } = useI18n()
  const navigate = useRouter()

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('vh_is_pop', 'true')
    }
    let stack: string[] = []
    try {
      stack = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('vh_nav_stack') || '[]') : []
    } catch { stack = [] }

    const prevPath = stack.length >= 2 ? stack[stack.length - 2] : '/'
    navigate.push(prevPath as import('next').Route)
  }

  if (loading || !category) {
    return (
      <div className="bg-slate-900 text-white min-h-[300px] flex items-center border-b border-white/5 relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-24 bg-white/10 rounded-full" />
            <div className="flex gap-8 items-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-3xl" />
              <div className="flex-1 space-y-4">
                <div className="h-12 w-1/3 bg-white/10 rounded-xl" />
                <div className="h-4 w-2/3 bg-white/10 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const categoryImageUrl = category.image_url
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${category.image_url}`
    : null

  const isMainCategory = !category.parent_id

  return (
    <div className={cn(
      "relative overflow-hidden border-b border-slate-100 transition-all duration-700",
      isMainCategory ? "bg-slate-900 text-white pt-16 pb-20 lg:pt-24 lg:pb-32" : "bg-white text-slate-900 py-12"
    )}>
      {/* Background Decor (Main Category Only) */}
      {isMainCategory && (
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
          <div className="absolute inset-0 bg-[url('/images/grid-white.svg')] opacity-[0.03] pointer-events-none" />
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBack}
          className={cn(
            "inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all mb-12 group",
            isMainCategory ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-primary-navy"
          )}
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>{t('common.back')}</span>
        </motion.button>

        <div className="flex flex-col md:flex-row md:items-center gap-8 lg:gap-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="shrink-0"
          >
            {categoryImageUrl ? (
              <div className={cn(
                "relative rounded-[2rem] overflow-hidden shadow-2xl border transition-all duration-500",
                isMainCategory ? "w-32 h-32 lg:w-48 lg:h-48 border-white/10" : "w-24 h-24 lg:w-32 lg:h-32 border-slate-100"
              )}>
                <VentImage 
                  src={categoryImageUrl}
                  alt={getCategoryDisplayName(category)}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className={cn(
                "flex items-center justify-center rounded-[2rem] border transition-all duration-500",
                isMainCategory ? "w-32 h-32 lg:w-48 lg:h-48 bg-white/5 border-white/10 text-cyan-400" : "w-24 h-24 lg:w-32 lg:h-32 bg-slate-50 border-slate-100 text-indigo-600"
              )}>
                {getCategoryIcon(parentCategory?.slug || category.slug, { size: isMainCategory ? 64 : 48 })}
              </div>
            )}
          </motion.div>
          
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {parentCategory && (
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block",
                  isMainCategory ? "text-cyan-400" : "text-indigo-600"
                )}>
                  {getCategoryDisplayName(parentCategory)}
                </span>
              )}
              <h1 className={cn(
                "font-black tracking-tighter leading-none mb-6",
                isMainCategory ? "text-5xl lg:text-8xl" : "text-3xl lg:text-5xl"
              )}>
                {getCategoryDisplayName(category)}
              </h1>
              
              {category.description && (
                <p className={cn(
                  "max-w-3xl mb-8 font-medium leading-relaxed",
                  isMainCategory ? "text-slate-400 text-lg lg:text-xl" : "text-slate-500 text-base"
                )}>
                  {category.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4">
                {productCount !== undefined && (
                  <div className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border",
                    isMainCategory ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-100 text-slate-600"
                  )}>
                    <Layers size={12} className={isMainCategory ? "text-cyan-400" : "text-indigo-600"} />
                    {productCount} {t('products.resultsFound')}
                  </div>
                )}
                {isMainCategory && (
                  <>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest">
                      <ShieldCheck size={12} className="text-cyan-400" />
                      {t('common.officialGuarantee') || 'Resmi Garanti'}
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest">
                      <Zap size={12} className="text-cyan-400" />
                      {t('common.fastDelivery') || 'Hızlı Teslimat'}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryHero
