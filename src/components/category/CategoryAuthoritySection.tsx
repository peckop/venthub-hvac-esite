'use client'

import React from 'react'
import { Shield, Settings, Info, Award, CheckCircle2 } from 'lucide-react'
import type { LegacyAuthorityContent as AuthorityContent } from '../../types/db-rows'

import { VentImage } from '@/components/ui/VentImage'

interface CategoryAuthoritySectionProps {
  content: AuthorityContent | null;
  brandImage?: string;
}

export const CategoryAuthoritySection: React.FC<CategoryAuthoritySectionProps> = ({ content, brandImage }) => {
  if (!content) return null

  const { brand, technical, problem } = content

  return (
    <div className="mt-12 space-y-16">
      {/* 1. Mühendislik Otoritesi ve Marka Mirası */}
      {brand && (
        <section className="bg-white rounded-2xl shadow-sm border border-light-gray overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 lg:p-12 space-y-6">
              {brand.eyebrow && (
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary-navy/5 text-primary-navy rounded-full text-xs font-bold tracking-wider">
                  <Award size={14} />
                  <span>{brand.eyebrow}</span>
                </div>
              )}
              <h2 className="text-3xl font-bold text-industrial-gray leading-tight">
                {brand.title}
              </h2>
              <p className="text-lg text-steel-gray leading-relaxed">
                {brand.description}
              </p>
              <div className="flex flex-wrap gap-3">
                {brand.badges?.map((badge, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5 px-3 py-1.5 bg-light-gray text-industrial-gray rounded-md text-sm font-medium">
                    <CheckCircle2 size={14} className="text-green-600" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative min-h-[400px] bg-slate-100 overflow-hidden">
               {brandImage ? (
                 <VentImage 
                   src={brandImage} 
                   alt={brand.title || 'Brand Showcase'} 
                   className="w-full h-full object-cover"
                   fill
                 />
               ) : (
                 <div className="absolute inset-0 bg-industrial-gray/5 p-8 lg:p-12 grid grid-cols-2 gap-6 items-center">
                    {brand.stats?.map((stat, idx) => (
                      <div key={idx} className="text-center p-6 bg-white rounded-xl shadow-sm">
                        <div className="text-2xl font-bold text-primary-navy mb-1">{stat.value}</div>
                        <div className="text-xs text-steel-gray font-medium uppercase tracking-wide">{stat.label}</div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          </div>
        </section>
      )}

      {/* 2. Teknik Bilgi Katmanı */}
      {technical && (
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            {technical.eyebrow && (
              <div className="inline-block px-3 py-1 bg-secondary-blue/10 text-secondary-blue rounded-full text-xs font-bold tracking-wider uppercase">
                {technical.eyebrow}
              </div>
            )}
            <h2 className="text-3xl font-bold text-industrial-gray">{technical.title}</h2>
            <p className="text-lg text-steel-gray">{technical.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {technical.points?.map((point, idx) => (
              <div key={idx} className="p-8 bg-white rounded-2xl border border-light-gray shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-primary-navy/5 text-primary-navy rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-navy group-hover:text-white transition-colors">
                  {idx === 0 ? <Info size={24} /> : idx === 1 ? <Settings size={24} /> : <Shield size={24} />}
                </div>
                <h3 className="text-xl font-bold text-industrial-gray mb-3">{point.title}</h3>
                <p className="text-steel-gray leading-relaxed">{point.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Problem/Çözüm Karşılaştırması */}
      {problem && (
        <section className="bg-industrial-gray text-white rounded-3xl p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <h2 className="text-3xl font-bold">{problem.title}</h2>
              <p className="text-lg text-white/70 leading-relaxed">
                {problem.subtitle}
              </p>
              {problem.painPoints && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {problem.painPoints.map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-left">
                      <div className="mt-1 w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold">!</span>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{item.title}</div>
                        <div className="text-xs text-white/50">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {problem.visual && (
              <div className="flex-1 w-full space-y-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="text-sm font-bold text-secondary-blue uppercase tracking-widest mb-6">{problem.visual.difference}</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Problem Column */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end border-b border-white/10 pb-2">
                        <div className="text-xs text-white/50 uppercase italic font-bold">{problem.visual.without}</div>
                        <div className="text-xl font-bold text-red-400">{problem.visual.withoutVal || '65 dB(A)'}</div>
                      </div>
                      <ul className="space-y-2">
                        {problem.visual.withoutPoints?.map((pt, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-white/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500/40" />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Solution Column */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end border-b border-blue-500/30 pb-2">
                        <div className="text-xs text-blue-400 uppercase italic font-bold">{problem.visual.with}</div>
                        <div className="text-xl font-bold text-green-400">{problem.visual.withVal || '25 dB(A)'}</div>
                      </div>
                      <ul className="space-y-2">
                        {problem.visual.withPoints?.map((pt, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-white/90 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {problem.visual.note && (
                    <div className="pt-6 text-xs text-center text-white/40 italic">
                      {problem.visual.note}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
