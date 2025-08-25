import React from 'react'
import { HVAC_BRANDS } from '../lib/supabase'
import { BrandIcon } from '../components/HVACIcons'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { useI18n } from '../i18n/I18nProvider'

const BrandsPage: React.FC = () => {
  const { t } = useI18n()
  const canonicalUrl = `${window.location.origin}/brands`
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Seo title={`${t('brands.pageTitle')} | VentHub`} description={t('brands.seoDesc')} canonical={canonicalUrl} />
      <div className="flex items-center text-sm text-steel-gray mb-6">
        <Link to="/" className="hover:text-primary-navy">{t('common.home')}</Link>
        <span className="mx-2">/</span>
        <span className="text-industrial-gray font-medium">{t('common.brands')}</span>
      </div>

      <h1 className="text-3xl font-bold text-industrial-gray mb-8">{t('common.brands')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {HVAC_BRANDS.map((brand) => (
          <Link key={brand.slug} to={`/brands/${brand.slug}`} className="group bg-white rounded-xl p-6 border border-light-gray hover:border-secondary-blue hover:shadow-sm transition">
            <div className="flex justify-center mb-3">
              <BrandIcon brand={brand.name} className="group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-industrial-gray group-hover:text-primary-navy transition-colors">{brand.name}</div>
              <div className="text-xs text-steel-gray">{brand.country}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default BrandsPage
