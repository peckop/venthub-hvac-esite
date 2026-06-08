import React, { useState } from 'react'

import VentImage from '@/components/ui/VentImage'

import { useI18n } from '../i18n/I18nProvider'

interface BeforeAfterSliderProps {
  beforeSrc: string
  afterSrc: string
  alt?: string
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ beforeSrc, afterSrc, alt = 'before-after' }) => {
  const [pos, setPos] = useState(50) // yüzde
  const { t } = useI18n()
  // Native input[type="range"] klavye kontrolünü otomatik yapar.

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-industrial-gray">{t('beforeAfterSlider.title')}</h2>
          <p className="text-steel-gray">{t('beforeAfterSlider.subtitle')}</p>
        </div>
        <div
          role="region"
          className="relative w-full h-56 sm:h-72 lg:h-80 rounded-2xl overflow-hidden border border-light-gray shadow"
          aria-label={t('beforeAfterSlider.ariaLabel')}
        >
          <VentImage src={afterSrc} alt={alt} loading="lazy" decoding="async" {...({ fetchpriority: 'low' } as Record<string, string>)} className="absolute inset-0 w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ width: `${pos}%`, overflow: 'hidden' }}>
            <VentImage src={beforeSrc} alt={alt} loading="lazy" decoding="async" {...({ fetchpriority: 'low' } as Record<string, string>)} className="w-full h-full object-cover object-center" />
          </div>
          {/* Divider */}
          <div className="absolute top-0" style={{ left: `${pos}%` }}>
            <div className="-ml-0.5 h-full w-1 bg-white shadow" />
          </div>
          {/* Range control */}
          <input
            type="range"
            min={0}
            max={100}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 w-3/4 accent-primary-navy"
            aria-label={t('beforeAfterSlider.rangeAriaLabel')}
          />
        </div>
      </div>
    </section>
  )
}

export default BeforeAfterSlider




