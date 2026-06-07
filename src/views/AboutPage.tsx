import { Routes } from '@/utils/routes';
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Award, Shield, Target, Globe, Zap, 
  Factory, Microscope
} from 'lucide-react'
import Seo from '../components/Seo'
import { BrandIcon } from '../components/HVACIcons'
import { HVAC_BRANDS } from '../data/brands'
import ScrollReveal from '../components/ScrollReveal'
import { tr } from '../i18n/dictionaries/tr'
import { en } from '../i18n/dictionaries/en'

interface AboutPageProps {
  lang?: string
}

const AboutPage: React.FC<AboutPageProps> = ({ lang = 'tr' }) => {
  const dict = lang === 'en' ? en : tr

  // Server-component safe translation helper
  const t = (key: string): string => {
    const parts = key.split('.')
    let current: unknown = dict
    for (const part of parts) {
      const obj = current as Record<string, unknown>
      if (obj && obj[part] !== undefined) {
        current = obj[part]
      } else {
        return key
      }
    }
    return typeof current === 'string' ? current : key
  }

  const stats = [
    { value: '15+', label: t('aboutPage.experience'), icon: Zap },
    { value: '5', label: t('aboutPage.distributorship'), icon: Award },
    { value: '500+', label: t('aboutPage.completedProject'), icon: Factory },
    { value: '81', label: t('aboutPage.shippingNetwork'), icon: Globe }
  ]

  const coreValues = [
    {
      title: t('aboutPage.precisionTitle'),
      description: t('aboutPage.precisionDesc'),
      icon: Microscope
    },
    {
      title: t('aboutPage.standardsTitle'),
      description: t('aboutPage.standardsDesc'),
      icon: Target
    },
    {
      title: t('aboutPage.trustTitle'),
      description: t('aboutPage.trustDesc'),
      icon: Shield
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={`${t('aboutPage.title')} | VentHub`}
        description={t('aboutPage.seoDescription')}
      />

      {/* Cinematic Hero */}
      <section className="relative h-70vh flex items-center justify-center overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hvac_installation_close_up_premium_3.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-30 grayscale brightness-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/60 to-slate-950" />
        </div>

        <div className="relative z-10 max-w-page mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal animation="fadeUp" as="div" className="inline-flex items-center gap-3 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-hvac-loose text-cyan-400">{t('aboutPage.heroBadge')}</span>
          </ScrollReveal>

          <ScrollReveal animation="scaleIn" as="h1" className="text-5xl lg:text-8xl font-extralight tracking-tighter leading-hvac-11 mb-10">
            {t('aboutPage.heroTitle')} <span className="font-medium text-white italic">{t('aboutPage.heroTitleItalic')}</span>
          </ScrollReveal>

          <ScrollReveal animation="fadeIn" as="p" className="max-w-2xl mx-auto text-xl text-slate-400 font-light leading-relaxed">
            {t('aboutPage.heroDesc')}
          </ScrollReveal>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-24 bg-slate-50 border-b border-slate-100">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {stats.map((stat, i) => (
              <ScrollReveal
                key={i}
                animation="fadeUp"
                className="text-center"
                staggerIndex={i}
              >
                <div className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tighter mb-4">{stat.value}</div>
                <div className="text-xs font-black uppercase tracking-hvac-relaxed text-cyan-600">{stat.label}</div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Story & Philosophy */}
      <section className="py-24 lg:py-32 overflow-hidden">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <ScrollReveal animation="slideLeft" className="relative aspect-square lg:aspect-video rounded-hvac-3xl overflow-hidden">
              <Image 
                src="/images/ekran/homepage beğendiğim yapı.png" 
                alt="" 
                fill 
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover grayscale hover:grayscale-0 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay" />
            </ScrollReveal>

            <div>
              <div className="text-cyan-600 text-xs font-black uppercase tracking-hvac-wide mb-8">{t('aboutPage.vision')}</div>
              <h2 className="text-4xl lg:text-6xl font-extralight tracking-tighter leading-hvac-11 mb-12 text-slate-900">
                {t('aboutPage.storyTitle')} <br />
                <span className="font-medium text-slate-950 italic">{t('aboutPage.storyTitleItalic')}</span>
              </h2>
              <div className="space-y-8 text-lg text-slate-500 font-light leading-relaxed">
                <p>{t('aboutPage.storyDesc1')}</p>
                <p>{t('aboutPage.storyDesc2')}</p>
              </div>
              
              <div className="mt-12 flex items-center gap-8">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden relative">
                      <Image 
                        src={`/images/hvac_installation_close_up_premium_3.webp`} 
                        alt="" 
                        fill 
                        sizes="48px"
                        className="object-cover" 
                      />
                    </div>
                  ))}
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {t('aboutPage.teamTitle')} <br /> 
                  <span className="text-slate-400 font-medium tracking-tight">{t('aboutPage.teamSubtitle')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authorized Brands Strip */}
      <section className="py-24 bg-slate-950 text-white">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="text-cyan-400 text-xs font-black uppercase tracking-hvac-wide mb-6">{t('aboutPage.whySubtitle')}</div>
            <h2 className="text-3xl lg:text-5xl font-extralight tracking-tight">
              {t('aboutPage.brandTitle')} <span className="text-cyan-400 font-medium italic">{t('aboutPage.brandTitleItalic')}</span>
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24">
            {HVAC_BRANDS.map((brand) => (
              <div
                key={brand.slug}
                className="w-32 h-16 lg:w-48 lg:h-24 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 hover:scale-110 transition-transform duration-500"
              >
                <BrandIcon brand={brand.name} className="w-full h-full brightness-0 invert" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-16">
            {coreValues.map((value, i) => (
              <ScrollReveal
                key={i}
                animation="fadeUp"
                className="group"
                staggerIndex={i}
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-500">
                  <value.icon size={32} strokeWidth={1} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">{value.title}</h3>
                <p className="text-slate-500 font-light leading-relaxed">{value.description}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-6xl font-extralight tracking-tighter text-slate-900 mb-12 leading-tight">
            {t('aboutPage.ctaTitle')} <br />
            <span className="font-medium italic">{t('aboutPage.ctaTitleItalic')}</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href={Routes.contact()} 
              className="bg-slate-950 text-white px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-cyan-600 transition-shadow shadow-xl"
            >
              {t('aboutPage.ctaContact')}
            </Link>
            <Link 
              href={Routes.products()} 
              className="bg-white text-slate-950 border border-slate-200 px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-colors"
            >
              {t('aboutPage.ctaExplore')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
