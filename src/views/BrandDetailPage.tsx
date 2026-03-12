'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { HVAC_BRANDS, supabase, Product } from '../lib/supabase'
import { BrandIcon } from '../components/HVACIcons'
import { Globe, ArrowRight, Package, Award, Shield, ExternalLink } from 'lucide-react'
import { useScrollAnimation, scrollAnimationClasses } from '../hooks/useScrollAnimation'
import Seo from '../components/Seo'
import { useI18n } from '../i18n/I18nProvider'

const BRAND_DETAILS: Record<string, {
  founded?: number
  headquarters?: string
  website?: string
  story?: string
  stats?: { label: string; value: string }[]
}> = {
  vortice: {
    founded: 1954,
    headquarters: 'Tribino, İtalya',
    website: 'https://www.vortice.com',
    story: 'Vortice, 1954 yılında İtalya\'da kurulmuş, dünya çapında tanınan bir havalandırma çözümleri üreticisidir. 70 yılı aşkın deneyimiyle konut, ticari ve endüstriyel havalandırma sistemlerinde lider konumdadır.',
    stats: [
      { label: 'Kuruluş', value: '1954' },
      { label: 'Ülke Sayısı', value: '90+' },
      { label: 'Çalışan', value: '1500+' }
    ]
  },
  avens: {
    founded: 2010,
    headquarters: 'İstanbul, Türkiye',
    website: 'https://www.avens.com.tr',
    story: 'AVenS, Türkiye\'nin önde gelen yerli HVAC markasıdır. Yüksek kaliteli havalandırma çözümleri ve rekabetçi fiyatlarıyla sektörde hızla büyümektedir.',
    stats: [
      { label: 'Kuruluş', value: '2010' },
      { label: 'Üretim', value: 'Türkiye' },
      { label: 'Garanti', value: '2 Yıl' }
    ]
  },
  casals: {
    founded: 1880,
    headquarters: 'Barcelona, İspanya',
    website: 'https://www.casals.com',
    story: 'Casals, 140 yılı aşkın geçmişiyle İspanya\'nın en köklü fan üreticilerinden biridir. Endüstriyel ve ticari havalandırma çözümlerinde Avrupa\'nın tercih edilen markasıdır.',
    stats: [
      { label: 'Kuruluş', value: '1880' },
      { label: 'Deneyim', value: '140+ Yıl' },
      { label: 'Grup', value: 'Vortice' }
    ]
  },
  'nicotra-gebhardt': {
    founded: 1959,
    headquarters: 'Almanya',
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
    headquarters: 'Avrupa',
    story: 'Flexiva, esnek kanal sistemleri ve havalandırma aksesuarlarında uzmanlaşmış bir markadır. Kaliteli malzeme ve kolay montaj özellikleriyle öne çıkar.',
    stats: [
      { label: 'Uzmanlık', value: 'Kanal Sistemleri' },
      { label: 'Kalite', value: 'CE Sertifikalı' }
    ]
  },
  danfoss: {
    founded: 1933,
    headquarters: 'Nordborg, Danimarka',
    website: 'https://www.danfoss.com',
    story: 'Danfoss, enerji verimliliği ve iklim çözümlerinde dünya lideridir. HVAC kontrol sistemleri, frekans konvertörleri ve ısı pompalarında öncü teknolojiyi sunar.',
    stats: [
      { label: 'Kuruluş', value: '1933' },
      { label: 'Çalışan', value: '40,000+' },
      { label: 'Ülke', value: '100+' }
    ]
  }
}

export interface BrandDetailPageProps {
  initialBrandSlug?: string
}

const BrandDetailPage: React.FC<BrandDetailPageProps> = ({ initialBrandSlug }) => {
  const params = useParams()
  const slug = (initialBrandSlug || params?.slug) as string
  const brand = HVAC_BRANDS.find((b) => b.slug === slug)
  const brandDetails = slug ? BRAND_DETAILS[slug] : null
  const { t } = useI18n()
  const [heroRef, heroVisible] = useScrollAnimation<HTMLElement>()
  const [productsRef, productsVisible] = useScrollAnimation<HTMLDivElement>()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [canonicalUrl, setCanonicalUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCanonicalUrl(`${window.location.origin}/brands/${slug || ''}`)
    }
  }, [slug])

  useEffect(() => {
    const loadProducts = async () => {
      if (!brand) return
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('brand', brand.name)
          .eq('status', 'active')
          .limit(6)

        if (!error && data) {
          setProducts(data as Product[])
        }
      } catch (e) {
        console.error('Error loading brand products:', e)
      } finally {
        setLoading(false)
      }
    }

    if (brand) {
      loadProducts()
    }
  }, [brand])

  if (!brand) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-industrial-gray mb-4">{t('brands.notFound')}</h1>
          <Link href="/brands" className="text-primary-navy hover:text-secondary-blue">{t('brands.backToAll')}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Seo title={`${brand.name} | VentHub`} description={brandDetails?.story || brand.description} canonical={canonicalUrl} />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative py-12 sm:py-16 bg-gradient-to-br from-primary-navy to-industrial-gray text-white overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-accent rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white">{t('common.home')}</Link>
            <span className="mx-2">/</span>
            <Link href="/brands" className="hover:text-white">{t('common.brands')}</Link>
            <span className="mx-2">/</span>
            <span className="text-white font-medium">{brand.name}</span>
          </div>

          <div className={`flex items-start gap-6 ${scrollAnimationClasses.fadeUp(heroVisible)}`}>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
              <BrandIcon brand={brand.name} className="w-16 h-16 sm:w-20 sm:h-20" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{brand.name}</h1>
              <div className="flex items-center gap-4 text-white/70 mb-4">
                <div className="flex items-center gap-1">
                  <Globe size={16} />
                  <span>{brandDetails?.headquarters || brand.country}</span>
                </div>
                {brandDetails?.founded && (
                  <span>Kuruluş: {brandDetails.founded}</span>
                )}
              </div>
              {brandDetails?.website && (
                <a
                  href={brandDetails.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-secondary-blue hover:text-white transition-colors"
                >
                  <ExternalLink size={14} />
                  Resmi Web Sitesi
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-industrial-gray mb-4">Marka Hakkında</h2>
              <p className="text-steel-gray leading-relaxed mb-6">
                {brandDetails?.story || brand.description}
              </p>
              <div className="flex items-center gap-2 text-success-green">
                <Shield size={18} />
                <span className="font-medium">VentHub'da Satışta</span>
              </div>
            </div>

            {/* Stats */}
            {brandDetails?.stats && (
              <div className="bg-light-gray rounded-2xl p-6">
                <h3 className="font-semibold text-industrial-gray mb-4">{brand.name} Rakamlarla</h3>
                <div className="space-y-4">
                  {brandDetails.stats.map((stat, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-steel-gray">{stat.label}</span>
                      <span className="font-semibold text-primary-navy">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 sm:py-16 bg-light-gray">
        <div ref={productsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-industrial-gray">
              {brand.name} Ürünleri
            </h2>
            {products.length > 0 && (
              <Link
                href={`/products?brand=${brand.name}`}
                className="text-primary-navy font-semibold hover:text-secondary-blue flex items-center gap-1"
              >
                Tümünü Gör
                <ArrowRight size={16} />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className={`group bg-white rounded-xl p-4 border border-light-gray hover:border-primary-navy/30 hover:shadow-hvac transition-all ${scrollAnimationClasses.fadeUp(productsVisible)}`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className="aspect-square bg-light-gray rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Package size={48} className="text-steel-gray" />
                    )}
                  </div>
                  <h3 className="font-semibold text-industrial-gray group-hover:text-primary-navy transition-colors line-clamp-2 text-sm sm:text-base">
                    {product.name}
                  </h3>
                  <p className="text-sm text-steel-gray">{product.sku}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <Package size={48} className="text-steel-gray mx-auto mb-3" />
              <p className="text-steel-gray">Bu markaya ait ürün bulunamadı.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="text-gold-accent mx-auto mb-4" size={40} />
          <h2 className="text-2xl font-bold text-industrial-gray mb-4">
            {brand.name} Ürünleri Hakkında Bilgi Alın
          </h2>
          <p className="text-steel-gray mb-6">
            Teknik özellikler, fiyat ve stok bilgisi için bizimle iletişime geçin.
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

export default BrandDetailPage



