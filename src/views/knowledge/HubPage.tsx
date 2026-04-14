'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, BookOpen, Calculator, Settings, ArrowRight, Clock } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import Seo from '../../components/Seo'
import { Routes } from '../../utils/routes';


const TOPIC_SLUGS = ['hava-perdesi', 'jet-fan', 'hrv'] as const
type TopicSlug = typeof TOPIC_SLUGS[number]

const TAGS: { key: TopicSlug | 'all'; labelKey: string }[] = [
  { key: 'all', labelKey: 'knowledge.tags.all' },
  { key: 'hava-perdesi', labelKey: 'knowledge.tags.havaPerdesi' },
  { key: 'jet-fan', labelKey: 'knowledge.tags.jetFan' },
  { key: 'hrv', labelKey: 'knowledge.tags.hrv' },
]

const HubPage: React.FC = () => {
  const { t } = useI18n()
  const [q, setQ] = useState('')
  const [activeTag, setActiveTag] = useState<TopicSlug | 'all'>('all')

  const topics = useMemo(() => TOPIC_SLUGS.map((slug) => {
    const categoryKey = slug === 'hava-perdesi' ? 'comfort' : slug === 'jet-fan' ? 'safety' : 'efficiency'
    return {
      slug,
      title: t(`knowledge.topics.${slug}.title`),
      summary: t(`knowledge.topics.${slug}.summary`),
      time: t('knowledge.hub.readTime', { count: 5 }),
      category: t(`knowledge.hub.categories.${categoryKey}`)
    }
  }), [t])

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase()
    return topics.filter((tpc) => {
      const matchesText = !text || `${tpc.title} ${tpc.summary}`.toLowerCase().includes(text)
      const matchesTag = activeTag === 'all' || tpc.slug === activeTag
      return matchesText && matchesTag
    })
  }, [q, topics, activeTag])

  return (
    <div className="min-h-screen bg-white">
      <Seo 
        title={`${t('knowledge.hub.title')} | VentHub`} 
        description={t('knowledge.hub.subtitle')} 
      />

      {/* Hero: Engineering Library Atmosphere */}
      <section className="relative pt-32 pb-20 bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image 
            src="/images/hvac_installation_close_up_premium_3.png" 
            alt="Engineering Hub" 
            fill 
            priority
            sizes="100vw"
            className="object-cover grayscale" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950 to-slate-950" />
        </div>

        <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-8"
          >
            <BookOpen size={14} className="text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">
              {t('knowledge.hub.eyebrow')}
            </span>
          </motion.div>
          
          <h1 className="text-5xl lg:text-8xl font-extralight tracking-tighter leading-[1.1] mb-8">
            {t('knowledge.hub.title').split(',').map((part, i) => (
              <React.Fragment key={i}>
                {part}{i === 0 && ','} {i === 0 && <br />}
              </React.Fragment>
            ))}
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-400 font-light leading-relaxed mb-12">
            {t('knowledge.hub.subtitle')}
          </p>

          {/* Premium Search Bar */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
              <Search className="ml-4 text-slate-500" size={20} />
              <input 
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('knowledge.hub.searchPlaceholder')}
                aria-label={t('knowledge.hub.searchPlaceholder')}
                className="w-full bg-transparent border-none text-white px-4 py-4 focus:ring-0 placeholder:text-slate-600 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Content */}
      <section className="py-20 lg:py-32">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tag Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-20">
            {TAGS.map((tag) => (
              <button
                key={tag.key}
                onClick={() => setActiveTag(tag.key)}
                aria-label={t(tag.labelKey)}
                className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeTag === tag.key 
                    ? 'bg-slate-950 text-white shadow-xl' 
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {t(tag.labelKey)}
              </button>
            ))}
          </div>

          {/* Topics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            <AnimatePresence mode="popLayout">
              {filtered.map((topic, i) => (
                <motion.div
                  layout
                  key={topic.slug}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link 
                    href={`/destek/konular/${topic.slug}`}
                    className="group block h-full bg-white rounded-[2.5rem] border border-slate-100 p-10 transition-all duration-500 hover:border-cyan-500/20 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex justify-between items-start mb-12">
                      <div className="text-[10px] font-black uppercase tracking-widest text-cyan-600 px-4 py-2 bg-cyan-50 rounded-full">
                        {topic.category}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
                        <Clock size={12} /> {topic.time}
                      </div>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-6 group-hover:text-cyan-600 transition-colors">
                      {topic.title}
                    </h2>
                    
                    <p className="text-slate-500 font-light leading-relaxed mb-10 line-clamp-3">
                      {topic.summary}
                    </p>
                    
                    <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-950">
                      {t('knowledge.hub.readStart')} <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Tools & Future Section */}
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="relative group overflow-hidden rounded-[3rem] bg-slate-900 p-12 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full group-hover:bg-cyan-500/20 transition-all" />
              <div className="relative z-10">
                <Calculator className="text-cyan-400 mb-8" size={40} strokeWidth={1.5} />
                <h3 className="text-3xl font-bold tracking-tight mb-4">{t('knowledge.hub.calculatorsSoon')}</h3>
                <p className="text-slate-400 font-light leading-relaxed mb-8 max-w-md">
                  {t('knowledge.hub.calculatorsSoonDesc')}
                </p>
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {t('knowledge.hub.inDevelopment')}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-[3rem] bg-slate-50 p-12 text-slate-900 border border-slate-100">
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-200/50 blur-[100px] rounded-full" />
              <div className="relative z-10">
                <Settings className="text-slate-950 mb-8" size={40} strokeWidth={1.5} />
                <h3 className="text-3xl font-bold tracking-tight mb-4">{t('knowledge.hub.selectorSoon')}</h3>
                <p className="text-slate-500 font-light leading-relaxed mb-8 max-w-md">
                  {t('knowledge.hub.selectorSoonDesc')}
                </p>
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-200/50 border border-slate-200 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {t('knowledge.hub.inPlanning')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Banner */}
      <section className="py-24 bg-slate-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-extralight tracking-tight mb-8">
            {t('knowledge.hub.notFoundTitle')}
          </h2>
          <p className="text-slate-400 mb-12 font-light">
            {t('knowledge.hub.notFoundDesc')}
          </p>
          <Link 
            href={Routes.contact()} 
            className="inline-flex items-center gap-4 bg-cyan-500 text-slate-950 px-12 py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-white transition-all shadow-2xl shadow-cyan-500/20"
          >
            {t('knowledge.hub.contactExpert')} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HubPage
