'use client'

import React from 'react'
import Link from 'next/link'
import { useI18n } from '../../src/i18n/I18nProvider'

export const QuickEntryRail: React.FC = () => {
  const { t } = useI18n()

  // Safe extraction with fallback
  const getLabel = (key: string, fallback: string) => t(key) || fallback

  const categoryLabel = getLabel('home.quickEntry.category', 'Kategoriye Göre Ara')
  const applicationLabel = getLabel('home.quickEntry.application', 'Uygulamaya Göre Bul')
  const supportLabel = getLabel('home.quickEntry.support', 'Teknik Destek Al')
  const quoteLabel = getLabel('home.quickEntry.quote', 'Hızlı Teklif İste')

  // Icons for visual clarity
  const EntryItem = ({ href, icon, label, onClick }: { href: string, icon: React.ReactNode, label: string, onClick?: (e: React.MouseEvent) => void }) => (
    <Link
      href={href}
      onClick={onClick}
      className="flex-1 min-w-[140px] md:min-w-0 flex items-center justify-center gap-2.5 px-5 py-4 bg-white hover:bg-gray-50 text-industrial-gray font-semibold text-sm rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm transition-all hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 group"
    >
      <span className="text-primary-navy group-hover:scale-110 transition-transform">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  )

  return (
    <div className="w-full bg-gray-50 py-6 border-t border-b border-gray-100 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Desktop & Tablet: Flex wrap or grid. Mobile: Horizontal scroll (swipeable) */}
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 gap-3 sm:gap-4 md:grid md:grid-cols-4 scrollbar-hide snap-x">

          <EntryItem
            href="/products#categories"
            label={categoryLabel}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            }
          />

          <EntryItem
            href="/products#applications"
            label={applicationLabel}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />

          <EntryItem
            href="/support"
            label={supportLabel}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <EntryItem
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (typeof window !== 'undefined') {
                ;(window as any).openLeadModal?.()
              }
            }}
            label={quoteLabel}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />

        </div>
      </div>
    </div>
  )
}
