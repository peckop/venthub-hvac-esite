import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { HVAC_BRANDS } from '../lib/supabase'
import { BrandIcon } from '../components/HVACIcons'
import Seo from '../components/Seo'
import { useI18n } from '../i18n/I18nProvider'

const BrandDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const brand = HVAC_BRANDS.find((b) => b.slug === slug)
  const { t } = useI18n()

  const canonicalUrl = `${window.location.origin}/brands/${slug}`

  if (!brand) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-industrial-gray mb-4">{t('brands.notFound')}</h1>
          <Link to="/brands" className="text-primary-navy hover:text-secondary-blue">{t('brands.backToAll')}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Seo title={`${brand.name} | VentHub`} description={`${brand.name} ${t('brands.aboutBrand')}`} canonical={canonicalUrl} />
      <div className="flex items-center text-sm text-steel-gray mb-6">
        <Link to="/" className="hover:text-primary-navy">{t('common.home')}</Link>
        <span className="mx-2">/</span>
        <Link to="/brands" className="hover:text-primary-navy">{t('common.brands')}</Link>
        <span className="mx-2">/</span>
        <span className="text-industrial-gray font-medium">{brand.name}</span>
      </div>

      <div className="bg-white rounded-xl p-6 border border-light-gray">
        <div className="flex items-center space-x-4 mb-4">
          <BrandIcon brand={brand.name} />
          <h1 className="text-3xl font-bold text-industrial-gray">{brand.name}</h1>
        </div>
        <div className="text-steel-gray">
          <p className="mb-2"><span className="font-medium">{t('brands.countryLabel')}</span> {brand.country}</p>
          <p>{brand.description}</p>
        </div>
      </div>
    </div>
  )
}

export default BrandDetailPage
