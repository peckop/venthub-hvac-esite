import React from 'react'
import Link from 'next/link'
import { useI18n } from '../i18n/I18nProvider'
import {
  Award, Clock, Shield, Target, Heart,
  CheckCircle, Star, Truck, Building2, Globe, Zap
} from 'lucide-react'
import { useScrollAnimation, scrollAnimationClasses } from '../hooks/useScrollAnimation'
import Seo from '../components/Seo'

/**
 * AboutPage - Premium "Hakkımızda" sayfası
 * Şirket hikayesi, değerler, istatistikler ve güven sinyalleri
 */
const AboutPage: React.FC = () => {
  const { t } = useI18n()
  const [heroRef, heroVisible] = useScrollAnimation<HTMLElement>()
  const [statsRef, statsVisible] = useScrollAnimation<HTMLDivElement>()
  const [valuesRef, valuesVisible] = useScrollAnimation<HTMLDivElement>()
  const [trustRef, trustVisible] = useScrollAnimation<HTMLDivElement>()

  const stats = [
    { value: '2026', label: 'Lansman Yılı', icon: Clock, color: 'text-primary-navy' },
    { value: '6+', label: 'Premium Marka', icon: Award, color: 'text-gold-accent' },
    { value: '50+', label: 'Ürün Çeşidi', icon: Building2, color: 'text-success-green' },
    { value: '81', label: 'İl Teslimat Hedefi', icon: Truck, color: 'text-secondary-blue' }
  ]

  const values = [
    {
      icon: Target,
      title: 'Misyonumuz',
      description: 'Türkiye\'de profesyonel HVAC çözümlerini ulaşılabilir kılmak, B2B müşterilerimize dünya standartlarında ürünler sunmak.',
      color: 'bg-primary-navy'
    },
    {
      icon: Globe,
      title: 'Vizyonumuz',
      description: 'Havalandırma sektöründe Türkiye\'nin referans e-ticaret platformu olmak, global markaların güvenilir temsilcisi olarak büyümek.',
      color: 'bg-gold-accent'
    },
    {
      icon: Heart,
      title: 'Değerlerimiz',
      description: 'Kalite, güvenilirlik, müşteri memnuniyeti ve sürdürülebilirlik ilkelerimizin temelini oluşturur.',
      color: 'bg-success-green'
    }
  ]

  const trustBadges = [
    { icon: Award, label: 'Premium Markalar', sublabel: 'Global Üreticiler' },
    { icon: Shield, label: 'CE Sertifikalı Ürünler', sublabel: 'Avrupa Standartları' },
    { icon: CheckCircle, label: 'Orijinal Ürünler', sublabel: 'Kalite Garantisi' },
    { icon: Star, label: 'Güvenilir Platform', sublabel: 'Profesyonel Hizmet' }
  ]

  return (
    <div className="min-h-screen">
      <Seo
        title={`${t('aboutPage.title')} | VentHub`}
        description="VentHub - Türkiye'nin yeni HVAC satış platformu. Premium markalar, hızlı teslimat, profesyonel hizmet."
        canonical={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/about`}
      />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative py-16 sm:py-24 bg-gradient-to-br from-primary-navy via-primary-navy to-industrial-gray text-white overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-blue rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-accent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`text-center max-w-3xl mx-auto ${scrollAnimationClasses.fadeUp(heroVisible)}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Zap size={16} className="text-gold-accent" />
              <span className="text-sm text-white/80">2009'dan Beri</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Türkiye'nin Güvenilir<br />
              <span className="text-secondary-blue">HVAC Platformu</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 mb-8">
              Profesyonel havalandırma çözümlerinde 15 yılı aşkın deneyimimizle,
              dünya standartlarında ürünleri Türkiye'ye ulaştırıyoruz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-xl bg-white text-primary-navy px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                {t('common.exploreProducts')}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 text-white px-6 py-3 font-semibold hover:bg-white/10 transition-all"
              >
                {t('common.getQuote')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div ref={statsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className={`text-center p-6 rounded-2xl bg-light-gray/50 border border-light-gray hover:shadow-hvac transition-all ${scrollAnimationClasses.fadeUp(statsVisible)}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-industrial-gray mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-steel-gray">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div ref={valuesRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-industrial-gray text-center mb-4">
            Bizi Biz Yapan Değerler
          </h2>
          <p className="text-steel-gray text-center max-w-2xl mx-auto mb-12">
            Her kararımızda müşterilerimizin ihtiyaçlarını ön planda tutuyoruz
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div
                  key={index}
                  className={`p-8 rounded-2xl bg-light-gray/30 border border-light-gray hover:border-primary-navy/20 hover:shadow-hvac transition-all ${scrollAnimationClasses.fadeUp(valuesVisible)}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className={`w-14 h-14 rounded-2xl ${value.color} flex items-center justify-center mb-6`}>
                    <Icon size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-industrial-gray mb-3">{value.title}</h3>
                  <p className="text-steel-gray leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-primary-navy to-industrial-gray text-white">
        <div ref={trustRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            Neden <span className="text-secondary-blue">VentHub</span>?
          </h2>
          <p className="text-white/70 text-center max-w-2xl mx-auto mb-12">
            Güveninize layık olmak için çalışıyoruz
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge, index) => {
              const Icon = badge.icon
              return (
                <div
                  key={index}
                  className={`p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-center hover:bg-white/10 transition-all ${scrollAnimationClasses.fadeUp(trustVisible)}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <Icon size={24} className="text-gold-accent" />
                  </div>
                  <div className="font-semibold mb-1">{badge.label}</div>
                  <div className="text-sm text-white/60">{badge.sublabel}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-light-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-industrial-gray mb-4">
            Birlikte Çalışalım
          </h2>
          <p className="text-steel-gray mb-8 max-w-2xl mx-auto">
            Projeniz için en uygun HVAC çözümünü birlikte bulalım.
            Uzman ekibimiz size yardımcı olmak için hazır.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-xl bg-primary-navy text-white px-6 py-3 font-semibold shadow-lg hover:bg-secondary-blue transition-all"
            >
              Ürünleri Keşfet
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl border-2 border-primary-navy text-primary-navy px-6 py-3 font-semibold hover:bg-primary-navy hover:text-white transition-all"
            >
              İletişime Geç
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
