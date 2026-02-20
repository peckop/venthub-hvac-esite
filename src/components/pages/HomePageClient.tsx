'use client'

import React, { useState, Suspense, useEffect } from 'react'
import LazyInView from '../LazyInView'
import Link from 'next/link'
import { getCategories, Category } from '../../lib/supabase'
import dynamic from 'next/dynamic'

const HeroCarousel = dynamic(() => import('../HeroCarousel').then(module => module.HeroCarousel), { ssr: false })
import HeroSkeleton from '../HeroSkeleton'
import { useI18n } from '../../i18n/I18nProvider'
import { getActiveApplicationCards } from '../../config/applications'
import { iconFor, accentOverlayClass, gridColsClass } from '../../utils/applicationUi'

const TiltCard = dynamic(() => import('../TiltCard'), { ssr: false })
import { trackEvent } from '../../utils/analytics'
const LeadModal = dynamic(() => import('../LeadModal'), { ssr: false })

// TODO: Remove Vite-specific image imports and use Next.js next/image later
// import hero1200 from '../assets/images/industrial_HVAC_air_handling_unit_warehouse.jpg?w=1200&format=jpg&quality=88'

import LazyBrandsShowcase from '../LazyBrandsShowcase'
const SmartRouting = dynamic(() => import('../SmartRouting'), { ssr: false })
const WhyVentHubEnhanced = dynamic(() => import('../WhyVentHubEnhanced'), { ssr: false })

export default function HomePageClient() {
    const [leadOpen, setLeadOpen] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const { t } = useI18n()

    useEffect(() => {
        getCategories().then(setCategories).catch(console.error)
    }, [])

    useEffect(() => {
        // Global lead modal trigger for HeroSection button
        ; ((window as unknown) as { openLeadModal?: () => void }).openLeadModal = () => setLeadOpen(true)
    }, [])

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <Suspense fallback={<HeroSkeleton />}>
                {categories.length > 0 ? (
                    <HeroCarousel categories={categories} />
                ) : (
                    <HeroSkeleton />
                )}
            </Suspense>

            {/* Bento Grid */}
            <div id="categories" className="cv-600 scroll-mt-20">
                <LazyInView
                    loader={async () => ((await import('../BentoGrid')) as any).default}
                    placeholder={<div className="min-h-[200px]" aria-hidden="true" />}
                    rootMargin="0px 0px"
                    once
                />
            </div>

            {/* Brands Showcase */}
            <div className="cv-320">
                <LazyBrandsShowcase />
            </div>

            {/* Applications */}
            <section id="applications" className="py-16 bg-gradient-to-br from-gray-50 to-white" aria-labelledby="applications-heading">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 id="applications-heading" className="text-2xl md:text-3xl font-bold text-industrial-gray">{t('common.byApplication')}</h2>
                        <Link href="/products#applications" className="text-primary-navy hover:underline text-sm font-medium">{t('common.viewAll')} →</Link>
                    </div>
                    {(() => {
                        const appCards = getActiveApplicationCards()
                        return (
                            <div className={`${gridColsClass(appCards.length)}`}>
                                {appCards.map(card => (
                                    <Suspense key={card.key} fallback={<div className="rounded-xl border border-light-gray bg-white h-32 animate-pulse" />}>
                                        <TiltCard>
                                            <Link
                                                href={card.href}
                                                className="group relative overflow-hidden rounded-xl border border-light-gray bg-white hover:shadow-md transition transform hover:-translate-y-0.5 ring-1 ring-black/5 block"
                                                onClick={() => {
                                                    trackEvent('application_click', { key: card.key, source: 'home' })
                                                }}
                                            >
                                                <div className={`absolute inset-0 bg-gradient-to-br ${accentOverlayClass(card.accent)} to-transparent`}></div>
                                                <div className="p-5 relative z-10">
                                                    <div className="flex items-center gap-2 text-primary-navy">
                                                        {iconFor(card.icon, 18)}
                                                        <span className="text-sm font-semibold">{t(`applications.${card.key}.title`)}</span>
                                                    </div>
                                                    <p className="mt-1 text-sm text-steel-gray">{t(`applications.${card.key}.subtitle`)}</p>
                                                    <div className="mt-4 text-sm font-medium text-primary-navy">{t('common.discover')} →</div>
                                                </div>
                                            </Link>
                                        </TiltCard>
                                    </Suspense>
                                ))}
                            </div>
                        )
                    })()}
                </div>
            </section>

            {/* Smart Routing */}
            <Suspense fallback={<div className="min-h-[200px]" aria-hidden="true" />}>
                <SmartRouting />
            </Suspense>

            {/* Why VentHub */}
            <Suspense fallback={<div className="min-h-[300px]" aria-hidden="true" />}>
                <WhyVentHubEnhanced />
            </Suspense>

            {/* Bottom CTA */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-light-gray bg-gradient-to-r from-gray-50 to-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-semibold text-industrial-gray">{t('home.bottomCtaTitle')}</h3>
                            <p className="text-steel-gray mt-1">{t('home.bottomCtaSubtitle')}</p>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/products" className="inline-flex items-center justify-center rounded-lg bg-primary-navy text-white px-5 py-2.5 font-semibold shadow-sm hover:bg-secondary-blue transition">
                                {t('common.exploreProducts')}
                            </Link>
                            <button
                                onClick={() => ((window as unknown) as { openLeadModal?: () => void }).openLeadModal?.()}
                                className="inline-flex items-center justify-center rounded-lg border border-primary-navy text-primary-navy px-5 py-2.5 font-semibold hover:bg-primary-navy hover:text-white transition"
                            >
                                {t('common.getQuote')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {leadOpen && (
                <Suspense fallback={null}>
                    <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} />
                </Suspense>
            )}
        </div>
    )
}
