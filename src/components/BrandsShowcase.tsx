import React from 'react'
import { HVAC_BRANDS } from '../lib/supabase'
import { BrandIcon } from './HVACIcons'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider'

export const BrandsShowcase: React.FC = () => {
  const { t } = useI18n()
  return (
    <section className="py-16 bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-industrial-gray mb-4">
            {t('brands.sectionTitle')}
          </h2>
          <p className="text-xl text-steel-gray max-w-3xl mx-auto">
            {t('brands.sectionSubtitle')}
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {HVAC_BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              to={`/brands/${brand.slug}`}
              className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-hvac transition-all duration-200 text-center"
            >
              <div className="flex justify-center mb-4">
                <BrandIcon 
                  brand={brand.name} 
                  className="group-hover:scale-110 transition-transform duration-200" 
                />
              </div>
              <h3 className="font-semibold text-industrial-gray group-hover:text-primary-navy transition-colors mb-2">
                {brand.name}
              </h3>
              <p className="text-sm text-steel-gray">
                {brand.country}
              </p>
              <p className="text-xs text-steel-gray mt-1">
                {brand.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Link
            to="/brands"
            className="inline-flex items-center px-6 py-3 bg-primary-navy hover:bg-secondary-blue text-white font-semibold rounded-lg transition-colors"
          >
            {t('brands.viewAll')}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default BrandsShowcase