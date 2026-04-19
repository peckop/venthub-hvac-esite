import React from 'react'
import { useI18n } from '@/i18n/I18nProvider'

const SimpleProductGallery: React.FC = () => {
  const { t } = useI18n()
  // Placeholder görseller
  const images = [
    '/placeholder.svg',
    '/placeholder.svg', 
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
  ]

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-industrial-gray">{t('home.galleryTitle')}</h2>
          <p className="text-steel-gray mt-2">{t('home.gallerySubtitle')}</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {images.map((src, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="w-full aspect-square bg-gray-200 rounded-lg border border-gray-300">
                {/* Placeholder */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SimpleProductGallery



