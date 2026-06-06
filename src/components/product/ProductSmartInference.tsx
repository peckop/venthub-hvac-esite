'use client'

import React from 'react'
import { ShieldCheck, Zap, Volume2, Activity, Cpu } from 'lucide-react'
import { generateEngineeringSummary, EngineeringInference } from '../../utils/engineeringIntelligence'
import type { Product } from '@/types/ui-models'
import { useI18n } from '../../i18n/I18nProvider'

interface ProductSmartInferenceProps {
  product: Product
}

export const ProductSmartInference: React.FC<ProductSmartInferenceProps> = React.memo(({ product }) => {
  const { t } = useI18n()
  const summaries = generateEngineeringSummary(product)

  if (summaries.length === 0) return null

  const getIcon = (type: EngineeringInference['type']) => {
    switch (type) {
      case 'noise': return <Volume2 size={20} className="text-blue-600" />
      case 'efficiency': return <ShieldCheck size={20} className="text-emerald-600" />
      case 'power': return <Zap size={20} className="text-amber-600" />
      case 'quality': return <Cpu size={20} className="text-purple-600" />
      default: return <Activity size={20} className="text-slate-600" />
    }
  }

  const getThemeColor = (type: EngineeringInference['type']) => {
    switch (type) {
      case 'noise': return 'from-blue-500/10 to-transparent border-blue-200/50 text-blue-700'
      case 'efficiency': return 'from-emerald-500/10 to-transparent border-emerald-200/50 text-emerald-700'
      case 'power': return 'from-amber-500/10 to-transparent border-amber-200/50 text-amber-700'
      case 'quality': return 'from-purple-500/10 to-transparent border-purple-200/50 text-purple-700'
      default: return 'from-slate-500/10 to-transparent border-slate-200/50 text-slate-700'
    }
  }

  return (
    <div className="space-y-4 py-8 border-y border-slate-100/80 my-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-hvac-normal text-slate-400">
          <div className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-navy opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-navy"></span>
          </div>
          {t('pdp.labels.engineeringAnalysis')}
        </div>
        <div className="px-2 py-0.5 bg-slate-100 rounded text-xs font-bold text-slate-500 uppercase tracking-widest">
          AI INSIGHT V2.1
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {summaries.map((item, idx) => (
          <div 
            key={idx} 
            className={`group relative flex items-start gap-5 p-5 rounded-2xl border bg-gradient-to-br ${getThemeColor(item.type)} transition-transform hover:shadow-md hover:-translate-y-0.5 duration-300 overflow-hidden`}
          >
            {/* Background Accent Decorative element */}
            <div className="absolute -right-4 -bottom-4 opacity-3 group-hover:scale-110 transition-transform duration-700">
              {getIcon(item.type)}
            </div>

            <div className={`p-2.5 rounded-xl bg-white shadow-sm border border-inherit shrink-0 transition-transform group-hover:scale-110`}>
              {getIcon(item.type)}
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 flex-wrap">
                <h4 className="font-black text-slate-900 text-sm tracking-tight">
                  {item.isI18n ? t(item.labelKey) : item.labelKey}
                </h4>
                <div className="h-1 w-1 rounded-full bg-slate-300" />
                <span className={`text-xs font-black px-2 py-0.5 rounded-md bg-white/60 border border-white/80 shadow-xs`}>
                  {item.value}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                {item.isI18n ? t(item.descriptionKey) : item.descriptionKey}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})
ProductSmartInference.displayName = 'ProductSmartInference'
