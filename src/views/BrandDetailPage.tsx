'use client'

import VentImage from '@/components/ui/VentImage'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { HVAC_BRANDS } from '../lib/brands'
import { getProductsEnriched, type Product } from '../lib/supabase'
import { BrandIcon } from '../components/HVACIcons'
import { ArrowRight, Package, ExternalLink } from 'lucide-react'
import Seo from '../components/Seo'
import { useI18n } from '../i18n/I18nProvider'
import Breadcrumb from '../components/navigation/Breadcrumb'
import { Routes } from '../utils/routes'
import useScrollAnimation, { scrollAnimationClasses } from '../hooks/useScrollAnimation'

const BRAND_DETAILS: Record<string, {
  founded?: number
  headquarters?: string
  website?: string
  story?: string
  stats?: { label: string; value: string }[]
}> = {
  vortice: {
    founded: 1954,
    headquarters: 'Tribiano, İtalya',
    website: 'https://www.vortice.com',
    story: 'Vortice, 1954 yılında İtalya\'da kurulmuş, dünya çapında tanınan bir havalandırma çözümleri üreticisidir. 70 yılı aşkın deneyimiyle konut, ticari ve endüstriyel havalandırma sistemlerinde lider konumdadır.',
    stats: [
      { label: 'Kuruluş', value: '1954' },
      { label: 'Ülke Sayısı', value: '90+' },
      { label: 'Grup', value: 'Vortice Group' }
    ]
  },
  avens: {
    founded: 2010,
    headquarters: 'İstanbul, Türkiye',
    website: 'https://www.avens.com.tr',
    story: 'Avens, Türkiye\'nin önde gelen yerli HVAC markasıdır. Yüksek performanslı endüstriyel havalandırma ve klima santralleri çözümleriyle modern mühendislik yaklaşımlarını birleştirir.',
    stats: [
      { label: 'Kuruluş', value: '2010' },
      { label: 'Üretim', value: 'Türkiye' },
      { label: 'Garanti', value: '2 Yıl' }
    ]
  },
  casals: {
    founded: 1881,
    headquarters: 'Girona, İspanya',
    website: 'https://www.casals.com',
    story: 'Casals, 140 yılı aşkın geçmişiyle İspanya\'nın en köklü fan üreticilerinden biridir. Endüstriyel ve ticari havalandırma çözümlerinde Avrupa\'nın tercih edilen markasıdır.',
    stats: [
      { label: 'Kuruluş', value: '1881' },
      { label: 'Deneyim', value: '140+ Yıl' },
      { label: 'Grup', value: 'Vortice' }
    ]
  },
  'nicotra-gebhardt': {
    founded: 1959,
    headquarters: 'Waldenburg, Almanya',
    website: 'https://www.nicotra-gebhardt.com',
    story: 'Nicotra Gebhardt, endüstriyel fan teknolojisinde dünya lideridir. Alman mühendisliği ve İtalyan tasarımını bir araya getirerek en zorlu havalandırma ihtiyaçlarına çözüm sunar.',
    stats: [
      { label: 'Kuruluş', value: '1959' },
      { label: 'Grup', value: 'Regal Rexnord' },
      { label: 'Uzmanlık', value: 'Endüstriyel Fan' }
    ]
  },
  flexiva: {
    founded: 2000,
    headquarters: 'İstanbul, Türkiye',
    website: 'https://www.flexiva.com.tr',
    story: 'Flexiva, esnek kanal sistemleri ve havalandırma aksesuarlarında uzmanlaşmış global bir markadır. Patentli sızdırmazlık teknolojileri ve kolay montaj özellikleriyle öne çıkar.',
    stats: [
      { label: 'Uzmanlık', value: 'Kanal Sistemleri' },
      { label: 'Üretim', value: 'Türkiye' },
      { label: 'Kalite', value: 'CE Sertifikalı' }
    ]
  }
}

export interface BrandDetailPageProps {
  initialBrandSlug?: string
}

const BrandDetailPage: React.FC<BrandDetailPageProps> = ({ initialBrandSlug }) => {
  const { t } = useI18n()
  const params = useParams()
  const slug = (initialBrandSlug || params?.slug) as string

  const [heroIconRef, heroIconVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 })
  const [heroTitleRef, heroTitleVisible] = useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 })
  const [heroMetaRef, heroMetaVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 })
  
  // Normalize slug for matching
  const brand = HVAC_BRANDS.find((b) => 
    b.slug === slug || (slug === 'nicotra' && b.slug === 'nicotra-gebhardt')
  )
  
  const detail = brand ? BRAND_DETAILS[brand.slug] : null
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // --- GATEWAY ADAPTATION: CENTRAL PRODUCT ENGINE ---
  useEffect(() => {
    const loadProducts = async () => {
      if (!brand) return
      setLoading(true)
      try {
        const data = await getProductsEnriched({
          brand: brand.name,
          limit: 8
        })
        setProducts(data)
      } catch (e) {
        console.error('Error loading brand products:', e)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [brand])

  const breadcrumbItems = [
    { label: t('category.breadcrumbHome'), href: '/' },
    { label: t('brands.title') || 'Markalar', href: '/brands' },
    { label: brand?.name || slug }
  ]

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{t('brands.notFound')}</h1>
          <Link 
            href={Routes.brands()} 
            aria-label={t('brands.backToAll')}
            className="text-cyan-600 font-bold uppercase tracking-widest text-xs underline underline-offset-8"
          >
            {t('brands.backToAll')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Seo title={`${brand.name} | VentHub`} description={brand.description} />

      {/* STANDARD BREADCRUMB */}
      <Breadcrumb items={breadcrumbItems} variant="transparent" className="pt-6" />

      {/* Brand Hero: Ultra Premium Cinema Look */}
      <section className="relative h-60vh lg:h-70vh flex items-center justify-center overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/hvac_installation_close_up_premium_3.png" 
            alt={brand.name} 
            fill 
            sizes="100vw"
            className="object-cover opacity-20 brightness-50" 
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/60 to-slate-950" />
          <div className="absolute inset-0 bg-brand-detail-radial" />
        </div>

        <div className="relative z-10 max-w-page mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div ref={heroIconRef} className={scrollAnimationClasses.fadeUp(heroIconVisible) + " mb-12 flex justify-center"}>
            <div className="w-32 h-32 lg:w-48 lg:h-48 rounded-hvac-3xl bg-white p-8 shadow-white-glow-lg flex items-center justify-center overflow-hidden">
              <BrandIcon brand={brand.name} className="w-full h-full" />
            </div>
          </div>

          <h1 ref={heroTitleRef} className={scrollAnimationClasses.scaleIn(heroTitleVisible) + " text-6xl lg:text-9xl font-extralight tracking-tighter leading-tight"}>
            {brand.name}
          </h1>

          <div ref={heroMetaRef} className={scrollAnimationClasses.fadeIn(heroMetaVisible) + " mt-8 flex flex-wrap justify-center gap-8 text-xs font-black uppercase tracking-hvac-loose text-cyan-400"}>
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-glow-sm" />
              {brand.country} {t('brands.detail.originSuffix')}
            </div>
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-glow-sm" />
              {t('brands.detail.estPrefix')} {brand.founded}
            </div>
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-glow-sm" />
              {brand.specialty}
            </div>
          </div>
        </div>
      </section>

      {/* Brand Identity & Vision */}
      <section className="py-24 lg:py-32">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-hvac-layout-detail gap-24 items-start">
            <div>
              <div className="text-cyan-600 text-xs font-black uppercase tracking-hvac-wide mb-8 text-center lg:text-left">
                {t('brands.detail.heritage')}
              </div>
              <h2 className="text-4xl lg:text-6xl font-extralight tracking-tighter leading-hvac-11 mb-12 text-center lg:text-left text-slate-900">
                {t('brands.detail.authorityTitle').split(' ').slice(0, 1).join(' ')} <br />
                <span className="font-medium text-slate-950 italic">
                  {t('brands.detail.authorityTitle').split(' ').slice(1).join(' ')}
                </span>
              </h2>
              <p className="text-xl text-slate-500 font-light leading-relaxed mb-12 text-center lg:text-left max-w-3xl">
                {detail?.story || brand.description}
              </p>
              
              <div className="grid sm:grid-cols-2 gap-12">
                <div className="p-8 rounded-hvac-xl bg-slate-50 border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">{t('brands.detail.globalVision')}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-light">
                    {brand.name}, {t('brands.detail.globalVisionDesc')}
                  </p>
                </div>
                <div className="p-8 rounded-hvac-xl bg-slate-50 border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">{t('brands.detail.technicalExcellence')}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-light">
                    {t('brands.detail.technicalExcellenceDesc')}
                  </p>
                </div>
              </div>
            </div>

            <aside className="sticky top-32 space-y-8">
              <div className="rounded-hvac-2xl bg-slate-950 p-10 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl" />
                <div className="relative z-10">
                  <div className="text-xs font-bold uppercase tracking-hvac-relaxed text-cyan-400 mb-8">
                    {t('brands.detail.corporateSnapshot')}
                  </div>
                  
                  <div className="space-y-6">
                    {detail?.stats?.map((stat, i) => (
                      <div key={i} className="flex justify-between items-end border-b border-white/10 pb-4">
                        <span className="text-xs uppercase font-bold text-slate-500 tracking-widest">{stat.label}</span>
                        <span className="text-sm font-medium">{stat.value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                      <span className="text-xs uppercase font-bold text-slate-500 tracking-widest">
                        {t('brands.detail.headquarters')}
                      </span>
                      <span className="text-sm font-medium">{brand.headquarters}</span>
                    </div>
                    {brand.website && (
                      <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <span className="text-xs uppercase font-bold text-slate-500 tracking-widest">
                          {t('brands.detail.webAuthority')}
                        </span>
                        <a 
                          href={brand.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          aria-label={t('brands.detail.officialSite')}
                          className="text-sm font-medium text-cyan-400 hover:underline flex items-center gap-2"
                        >
                          {t('brands.detail.officialSite')} <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>

                  <Link href={Routes.contact()}>
                    <button 
                      aria-label={t('brands.detail.requestCatalog')}
                      className="mt-12 w-full py-5 bg-white text-slate-950 font-black uppercase text-xs tracking-widest rounded-2xl transition-transform hover:bg-cyan-400 active:scale-95"
                    >
                      {t('brands.detail.requestCatalog')}
                    </button>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Featured Brand Products Grid */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 text-center md:text-left">
            <div>
              <div className="text-cyan-600 text-xs font-black uppercase tracking-hvac-wide mb-4">Curated Solutions</div>
              <h2 className="text-4xl font-light tracking-tighter text-slate-950">
                {t('brands.detail.featuredSystems').split(' ').slice(0, 2).join(' ')} <span className="font-medium">{t('brands.detail.featuredSystems').split(' ').slice(2).join(' ')}</span>
              </h2>
            </div>
            <Link 
              href={Routes.products({ brand: brand.name })} 
              aria-label={t('brands.detail.allProductGroups')}
              className="text-xs font-bold uppercase tracking-hvac-relaxed text-slate-400 hover:text-cyan-600 transition-colors flex items-center gap-3 justify-center"
            >
              <span>{t('brands.detail.allProductGroups')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-slate-200 rounded-hvac-xl animate-pulse" />)}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <Link 
                  key={product.id} 
                  href={Routes.product(product.slug!)}
                  aria-label={`${product.name} ${t('pdp.details')}`}
                  className="group block bg-white rounded-hvac-2xl p-8 border border-white transition-shadow duration-700 hover:border-cyan-500/20 hover:shadow-hvac-card-hover"
                >
                  <div className="aspect-square relative flex items-center justify-center mb-8 grayscale group-hover:grayscale-0 transition-transform duration-700 group-hover:scale-105">
                    <VentImage src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2 line-clamp-2">{product.name}</h3>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{product.sku}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-hvac-3xl border border-dashed border-slate-200">
              <Package className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-light italic">{t('brands.detail.noProducts')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default BrandDetailPage
