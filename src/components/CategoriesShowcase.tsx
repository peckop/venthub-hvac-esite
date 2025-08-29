import React from 'react'
import { getCategoryIcon } from '../utils/getCategoryIcon'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Category } from '../lib/supabase'
import { useI18n } from '../i18n/I18nProvider'

interface CategoriesShowcaseProps {
  categories: Category[]
}

export const CategoriesShowcase: React.FC<CategoriesShowcaseProps> = ({ categories }) => {
  const { t } = useI18n()
  // Get main categories only (level 0)
  const mainCategories = categories.filter(cat => cat.level === 0)
  const subCategories = categories.filter(cat => cat.level === 1)

  const getSubCategoryCount = (parentId: string) => {
    return subCategories.filter(sub => sub.parent_id === parentId).length
  }

  const getPopularCategories = () => {
    // Return specific popular categories
    return mainCategories.filter(cat => 
      ['fanlar', 'isi-geri-kazanim-cihazlari', 'hava-perdeleri', 'hava-temizleyiciler'].includes(cat.slug)
    ).slice(0, 4)
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-industrial-gray mb-4">
            {t('categories.title')}
          </h2>
          <p className="text-xl text-steel-gray max-w-3xl mx-auto">
            {t('categories.subtitle')}
          </p>
        </div>

        {/* Popular Categories */}
        <div className="mb-16">
          <div className="flex items-center justify-center mb-8">
            <TrendingUp className="text-gold-accent mr-2" size={24} />
            <h3 className="text-2xl font-semibold text-industrial-gray">
              {t('products.popularCategories')}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getPopularCategories().map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group bg-gradient-to-br from-air-blue to-light-gray rounded-xl p-6 hover:shadow-hvac transition-all duration-200"
              >
                <div className="text-center">
                  <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <div className="text-primary-navy group-hover:text-secondary-blue transition-colors">
                      {getCategoryIcon(category.slug, { size: 48 })}
                    </div>
                  </div>
                  <h4 className="font-semibold text-industrial-gray group-hover:text-primary-navy transition-colors mb-2">
                    {category.name}
                  </h4>
                  <p className="text-sm text-steel-gray mb-3">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-center text-secondary-blue group-hover:text-primary-navy transition-colors">
                    <span className="text-sm font-medium mr-1">
                      {t('categories.subCount', { count: getSubCategoryCount(category.id) })}
                    </span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All Categories Grid */}
        <div>
          <h3 className="text-2xl font-semibold text-industrial-gray text-center mb-8">
            {t('categories.allTitle')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mainCategories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group flex items-center space-x-3 p-4 bg-white border border-light-gray rounded-lg hover:border-secondary-blue hover:shadow-sm transition-all duration-200"
              >
                <div className="text-primary-navy group-hover:text-secondary-blue transition-colors">
                  {getCategoryIcon(category.slug, { size: 32 })}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-industrial-gray group-hover:text-primary-navy transition-colors">
                    {category.name}
                  </h4>
                  <p className="text-sm text-steel-gray">
                    {t('categories.variantCount', { count: getSubCategoryCount(category.id) })}
                  </p>
                </div>
                <ArrowRight 
                  size={16} 
                  className="text-steel-gray group-hover:text-secondary-blue group-hover:translate-x-1 transition-all" 
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Link
            to="/products?all=1"
            className="inline-flex items-center px-8 py-4 bg-primary-navy hover:bg-secondary-blue text-white font-semibold rounded-lg transition-colors group"
          >
            <span>{t('common.seeAllProducts')}</span>
            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CategoriesShowcase
