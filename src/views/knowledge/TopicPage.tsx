'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { getCategoryUrlFromTopic } from '../../utils/applicationLinks'
import Seo from '../../components/Seo'
import { Routes } from '../../utils/routes';


interface TopicPageProps {
  slug?: string
}

const TopicPage: React.FC<TopicPageProps> = ({ slug: propSlug }) => {
  const { t } = useI18n()
  const params = useParams()
  const currentSlug = propSlug || (params?.slug as string)
  const base = currentSlug ? `knowledge.topics.${currentSlug}` : ''

  const title = t(`${base}.title`)
  const exists = currentSlug && title !== `${base}.title`

  if (!exists) {
    return (
      <section className="py-32 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <AlertCircle size={40} className="text-slate-300" />
          </div>
          <h1 className="text-4xl font-extralight tracking-tight text-slate-900 mb-4">
            {t('knowledge.topic.notFoundTitle')}
          </h1>
          <p className="text-slate-500 mb-12 font-light">
            {t('knowledge.topic.notFoundDesc')}
          </p>
          <Link 
            href={Routes.destek.home()} 
            className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-cyan-600 hover:text-slate-950 transition-colors"
          >
            <ArrowLeft size={14} /> {t('knowledge.topic.backToHub')}
          </Link>
        </div>
      </section>
    )
  }

  // Safe access to arrays
  const rawSteps = t(`${base}.steps`)
  const steps = Array.isArray(rawSteps) ? rawSteps : []
  
  const rawPitfalls = t(`${base}.pitfalls`)
  const pitfalls = Array.isArray(rawPitfalls) ? rawPitfalls : []

  return (
    <div className="min-h-screen bg-white">
      <Seo 
        title={`${title} | VentHub Teknik Bilgi`} 
        description={t(`${base}.summary`)} 
      />

      {/* Modern Hero Section */}
      <section className="relative pt-32 pb-20 bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image 
            src={t(`${base}.image`) || "/images/hvac_installation_close_up_premium_3.png"} 
            alt={title} 
            fill 
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover opacity-60 mix-blend-overlay" 
          />
        </div>
        
        <div className="relative z-10 max-w-page mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href={Routes.destek.home()}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400 hover:text-white transition-colors mb-12"
          >
            <ArrowLeft size={12} /> {t('knowledge.topic.backToHub')}
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-8">
              <BookOpen size={14} className="text-cyan-400" />
              <span className="text-xs font-black uppercase tracking-hvac-loose text-cyan-400">Technical Intelligence</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extralight tracking-tighter leading-tight mb-8 max-w-4xl">
              {title}
            </h1>
            
            <p className="max-w-2xl text-xl text-slate-400 font-light leading-relaxed">
              {t(`${base}.summary`)}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="py-24">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Steps Card */}
            <div className="p-12 rounded-hvac-3xl bg-slate-50 border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-950 tracking-tight mb-10 flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xs">1</span>
                {t('knowledge.topic.stepsTitle')}
              </h2>
              <div className="space-y-6">
                {steps.map((s: string, i: number) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0 group-hover:scale-150 transition-transform" />
                    <p className="text-slate-600 font-light leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pitfalls Card */}
            <div className="p-12 rounded-hvac-3xl bg-amber-50/30 border border-amber-100/50">
              <h2 className="text-2xl font-bold text-slate-950 tracking-tight mb-10 flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">!</span>
                {t('knowledge.topic.pitfallsTitle')}
              </h2>
              <div className="space-y-6">
                {pitfalls.map((s: string, i: number) => (
                  <div key={i} className="flex gap-4">
                    <CheckCircle2 size={18} className="text-amber-500 shrink-0 mt-1" />
                    <p className="text-slate-600 font-light leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href={(currentSlug ? getCategoryUrlFromTopic(currentSlug) : '/products') as import('next').Route}
              className="group inline-flex items-center gap-4 bg-slate-950 text-white px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-cyan-600 transition-transform shadow-2xl active:scale-95"
            >
              {t('knowledge.topic.toProducts')} <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link
              href={Routes.contact()}
              className="inline-flex items-center gap-4 bg-white border border-slate-200 text-slate-950 px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-transform active:scale-95"
            >
              {t('knowledge.topic.getQuote')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TopicPage
