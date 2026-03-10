'use client'

import React from 'react'
import Link from 'next/link'
import { useI18n } from '../../i18n/I18nProvider'

export const KnowledgeBlock: React.FC = () => {
  const { t } = useI18n()

  const mainTitle = t('home.knowledgeBlock.title') || "Teknik Rehberlik ve Bilgi Merkezi"
  const mainSubtitle = t('home.knowledgeBlock.subtitle') || "Doğru ürünü seçmenize yardımcı olacak mühendislik araçları ve dokümanlar."
  const exploreLabel = t('home.knowledgeBlock.explore') || "İncele"

  const cards = [
    {
      id: 'guide',
      title: t('home.knowledgeBlock.cards.guide.title') || "Ürün Seçim Rehberi",
      desc: t('home.knowledgeBlock.cards.guide.desc') || "Uygulamanıza en uygun cihazı adım adım bulmanıza yardımcı olur.",
      href: '/knowledge/guide',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 'calculators',
      title: t('home.knowledgeBlock.cards.calculators.title') || "Hesaplayıcılar",
      desc: t('home.knowledgeBlock.cards.calculators.desc') || "Debi, statik basınç ve güç ihtiyaçlarınızı hızlıca analiz edin.",
      href: '/knowledge/calculators',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'support',
      title: t('home.knowledgeBlock.cards.support.title') || "Destek Merkezi",
      desc: t('home.knowledgeBlock.cards.support.desc') || "Kurulum, bakım ve devreye alma dokümanlarına erişin.",
      href: '/support',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-industrial-gray">{mainTitle}</h2>
          <p className="mt-3 text-sm md:text-base text-steel-gray">
            {mainSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map(card => (
            <Link
              key={card.id}
              href={card.href}
              className="group flex flex-col p-8 rounded-2xl border border-gray-200 hover:border-primary-navy/40 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50/50 transform hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-50 text-primary-navy flex items-center justify-center mb-6 group-hover:bg-primary-navy group-hover:text-white transition-colors">
                {card.icon}
              </div>
              <h3 className="text-xl font-bold text-industrial-gray mb-3 group-hover:text-primary-navy transition-colors">
                {card.title}
              </h3>
              <p className="text-steel-gray text-sm md:text-base flex-1 leading-relaxed">
                {card.desc}
              </p>
              <div className="mt-6 font-semibold text-primary-navy group-hover:translate-x-1 transition-transform inline-flex items-center">
                {exploreLabel}
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
