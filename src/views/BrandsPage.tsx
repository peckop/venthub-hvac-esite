'use client'

import React from 'react'
import { HVAC_BRANDS } from '../lib/supabase'
import { BrandIcon } from '../components/HVACIcons'
import Link from 'next/link'
import { Award, Globe, CheckCircle, ArrowRight, Star, Shield } from 'lucide-react'
import { useScrollAnimation, scrollAnimationClasses } from '../hooks/useScrollAnimation'
import Seo from '../components/Seo'
import { useI18n } from '../i18n/I18nProvider'

/**
 * BrandsPage - Premium "Markalar" sayfası
 * Featured brand (Vortice), grid, trust signals
 */
const BrandsPage: React.FC = () => {
  const { t } = useI18n()
  const [heroRef, heroVisible] = useScrollAnimation<HTMLElement>()
  const [gridRef, gridVisible] = useScrollAnimation<HTMLDivElement>()
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/brands`

  // Vortice featured, others in grid
  const featuredBrand = HVAC_BRANDS.find(b => b.slug === 'vortice')
  const otherBrands = HVAC_BRANDS.filter(b => b.slug !== 'vortice')

  const brandBenefits = [
    { icon: CheckCircle, text: 'Orijinal ürün garantisi' },
    { icon: Shield, text: 'Güvenilir satış platformu' },
    { icon: Star, text: 'Profesyonel teknik destek' }
  ]

  return (
    <div className="min-h-screen">
      <Seo
        title={`${t('brands.pageTitle')} | VentHub`}
        description={t('brands.seoDesc')}
        canonical={canonicalUrl}
      />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative py-12 sm:py-16 bg-gradient-to-br from-primary-navy to-industrial-gray text-white overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-accent rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white">{t('common.home')}</Link>
            <span className="mx-2">/</span>
            <span className="text-white font-medium">{t('common.brands')}</span>
          </div>

          <div className={`max-w-2xl ${scrollAnimationClasses.fadeUp(heroVisible)}`}>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Premium <span className="text-gold-accent">HVAC Markaları</span>
            </h1>
            <p className="text-lg text-white/70 mb-6">
              Dünyanın lider havalandırma üreticilerinin ürünlerini,
              güvenilir ve hızlı bir şekilde sizlere ulaştırıyoruz.
            </p>
            <div className="flex flex-wrap gap-4">
              {brandBenefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div key={index} className="flex items-center gap-2 text-sm text-white/80">
                    <Icon size={16} className="text-gold-accent" />
                    <span>{benefit.text}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Brand: Vortice */}
      {featuredBrand && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <Award className="text-gold-accent" size={20} />
              <span className="text-sm font-medium text-gold-accent">Öne Çıkan Marka</span>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Brand Info */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-light-gray flex items-center justify-center">
                    <BrandIcon brand={featuredBrand.name} className="w-16 h-16" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-industrial-gray">
                      {featuredBrand.name}
                    </h2>
                    <div className="flex items-center gap-2 text-steel-gray">
                      <Globe size={14} />
                      <span className="text-sm">İtalya - 70+ Yıl Tecrübe</span>
                    </div>
                  </div>
                </div>
                <p className="text-steel-gray mb-6 leading-relaxed">
                  Vortice, 1954'ten bu yana havalandırma sektörünün global lideridir.
                  İtalyan tasarımı ve Alman mühendisliğini bir araya getiren Vortice,
                  konut, ticari ve endüstriyel havalandırma çözümlerinde dünya standartlarını belirler.
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="px-3 py-1 rounded-full bg-air-blue text-primary-navy text-sm font-medium">
                    Aspiratörler
                  </span>
                  <span className="px-3 py-1 rounded-full bg-air-blue text-primary-navy text-sm font-medium">
                    Hava Perdeleri
                  </span>
                  <span className="px-3 py-1 rounded-full bg-air-blue text-primary-navy text-sm font-medium">
                    Isı Geri Kazanım
                  </span>
                </div>
                <Link
                  href={`/brands/${featuredBrand.slug}`}
                  className="inline-flex items-center gap-2 text-primary-navy font-semibold hover:gap-3 transition-all"
                >
                  Ürünleri İncele
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Stats Card */}
              <div className="bg-gradient-to-br from-primary-navy to-industrial-gray rounded-2xl p-8 text-white">
                <h3 className="text-lg font-semibold mb-6">Vortice Rakamlarla</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-gold-accent">70+</div>
                    <div className="text-sm text-white/70">Yıl Deneyim</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gold-accent">90+</div>
                    <div className="text-sm text-white/70">Ülkede Satış</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gold-accent">6</div>
                    <div className="text-sm text-white/70">Üretim Tesisi</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gold-accent">1000+</div>
                    <div className="text-sm text-white/70">Ürün Çeşidi</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Other Brands Grid */}
      <section className="py-12 sm:py-16 bg-light-gray">
        <div ref={gridRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-industrial-gray text-center mb-4">
            Diğer Markalarımız
          </h2>
          <p className="text-steel-gray text-center max-w-2xl mx-auto mb-12">
            Avrupa'nın önde gelen HVAC üreticilerinin yetkili temsilcisiyiz
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {otherBrands.map((brand, index) => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className={`group bg-white rounded-2xl p-6 border border-light-gray hover:border-primary-navy/30 hover:shadow-hvac transition-all ${scrollAnimationClasses.fadeUp(gridVisible)}`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-xl bg-light-gray flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BrandIcon brand={brand.name} className="w-12 h-12" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-industrial-gray group-hover:text-primary-navy transition-colors mb-1">
                    {brand.name}
                  </div>
                  <div className="text-xs text-steel-gray flex items-center justify-center gap-1">
                    <Globe size={12} />
                    {brand.country}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-industrial-gray mb-4">
            Marka Hakkında Bilgi Almak İster misiniz?
          </h2>
          <p className="text-steel-gray mb-6">
            Teknik özellikler, fiyat listeleri ve bayilik koşulları için bizimle iletişime geçin.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl bg-primary-navy text-white px-6 py-3 font-semibold shadow-lg hover:bg-secondary-blue transition-all"
          >
            İletişime Geç
          </Link>
        </div>
      </section>
    </div>
  )
}

export default BrandsPage



