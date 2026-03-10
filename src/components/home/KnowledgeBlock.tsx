'use client'

import Link from 'next/link'
import React from 'react'

import { useI18n } from '../../i18n/I18nProvider'

const knowledgeItems = [
  { id: 'guides', href: '/destek/merkez' },
  { id: 'calculators', href: '/destek/hesaplayicilar/hrv' },
  { id: 'support', href: '/support/sss' },
] as const

export const KnowledgeBlock: React.FC = () => {
  const { t } = useI18n()

  return (
    <section className="border-b border-slate-200/75 bg-slate-950 py-14 text-white sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-secondary-blue">
            {t('home.knowledge.eyebrow')}
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-[2.2rem]">
            {t('home.knowledge.title')}
          </h2>
          <p className="mt-3 text-base leading-7 text-white/68 sm:text-lg sm:leading-8">
            {t('home.knowledge.subtitle')}
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {knowledgeItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-secondary-blue/30 hover:bg-white/[0.08]"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-secondary-blue">
                {t(`home.knowledge.items.${item.id}.eyebrow`)}
              </div>
              <h3 className="mt-3 text-xl font-semibold text-white">{t(`home.knowledge.items.${item.id}.title`)}</h3>
              <p className="mt-3 text-sm leading-6 text-white/60">{t(`home.knowledge.items.${item.id}.description`)}</p>
              <div className="mt-5 inline-flex items-center text-sm font-semibold text-secondary-blue transition-transform group-hover:translate-x-1">
                {t('home.knowledge.cta')} →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default KnowledgeBlock
