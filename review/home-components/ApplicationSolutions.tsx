'use client'

import React from 'react'
import Link from 'next/link'
import { useI18n } from '../../src/i18n/I18nProvider'

type SolutionScenario = {
  id: string
  key: string
  href: string
  icon: React.ReactNode
}

// Purposeful spacing and high contrast scenario cards. Less glass, more confidence.
const SCENARIOS: SolutionScenario[] = [
  {
    id: 'parking',
    key: 'home.applicationSolutions.scenarios.parking',
    href: '/products?application=parking',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    )
  },
  {
    id: 'kitchen',
    key: 'home.applicationSolutions.scenarios.kitchen',
    href: '/products?application=kitchen',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v2m0 4v2m0 4v2m0 4v2m-6-8h12m-6 4h6m-6 4h6" />
      </svg>
    )
  },
  {
    id: 'entrance',
    key: 'home.applicationSolutions.scenarios.entrance',
    href: '/products?application=entrance',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    id: 'smoke',
    key: 'home.applicationSolutions.scenarios.smoke',
    href: '/products?application=smoke',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    )
  },
  {
    id: 'commercial',
    key: 'home.applicationSolutions.scenarios.commercial',
    href: '/products?application=commercial',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m4-14h1m-1 4h1m-1 4h1m-1 4h1m-5-12h1m-1 4h1m-1 4h1" />
      </svg>
    )
  }
]

export const ApplicationSolutions: React.FC = () => {
  const { t } = useI18n()

  const mainTitle = t('home.applicationSolutions.title') || "Uygulamaya Göre Çözümler"
  const mainSubtitle = t('home.applicationSolutions.subtitle') || "Sektörünüze ve alanınıza özel havalandırma senaryoları"
  const viewAll = t('home.applicationSolutions.viewAll') || "Tümü"
  const discover = t('home.applicationSolutions.discover') || "İncele"

  return (
    <section id="applications" className="py-16 bg-gradient-to-br from-gray-50 to-white border-y border-gray-100" aria-labelledby="applications-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 id="applications-heading" className="text-2xl md:text-3xl font-bold text-industrial-gray">{mainTitle}</h2>
            <p className="mt-1 text-sm md:text-base text-steel-gray">{mainSubtitle}</p>
          </div>
          <Link href="/products#applications" className="text-primary-navy hover:underline text-sm font-semibold shrink-0 whitespace-nowrap">
            {viewAll} →
          </Link>
        </div>

        {/* Mobile: Horizontal scroll rail. Desktop: Grid layout. */}
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 scrollbar-hide snap-x">
          {SCENARIOS.map((scenario) => {
            const title = t(`${scenario.key}.title`) || scenario.id
            const subtitle = t(`${scenario.key}.subtitle`) || "Çözüm senaryosu"

            return (
              <Link
                key={scenario.id}
                href={scenario.href}
                className="snap-start flex-shrink-0 w-[75vw] sm:w-auto group relative flex flex-col p-6 overflow-hidden rounded-2xl bg-white border border-gray-200 hover:border-primary-navy/30 hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                {/* Clean top visual hierarchy */}
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-primary-navy flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary-navy group-hover:text-white transition-all">
                  {scenario.icon}
                </div>

                <h3 className="text-lg font-bold text-industrial-gray group-hover:text-primary-navy transition-colors">
                  {title}
                </h3>

                <p className="mt-2 text-sm text-steel-gray flex-1">
                  {subtitle}
                </p>

                <div className="mt-6 flex items-center text-sm font-semibold text-primary-navy group-hover:translate-x-1 transition-transform">
                  {discover}
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Subtle bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-navy/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )
          })}
        </div>

      </div>
    </section>
  )
}
