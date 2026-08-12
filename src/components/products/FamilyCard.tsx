'use client'

import Link from 'next/link'
import React from 'react'

import { productImagePlaceholder, resolveProductImageUrl } from '@/lib/images/productImage'
import type { FamilyListItem } from '@/types/ui-models'

import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes'
import { formatCurrency } from '../../i18n/format'
import { useI18n } from '../../i18n/I18nProvider'
import { BrandIcon } from '../HVACIcons'
import VentImage from '../ui/VentImage'

interface FamilyCardProps {
  family: FamilyListItem
  layout?: 'grid' | 'list'
  priority?: boolean
  compact?: boolean
}

/**
 * F5-B W2.1 — AİLE kartı.
 *
 * Vitrin listeleri artık varyant değil AİLE satırı basar (PS-041): "JET 20" bir kez
 * görünür, 6 varyant rozet olarak sayılır. Sepete-ekle HİÇ render edilmez — sepete
 * eklenebilir birim varyanttır ve varyant seçimi PDP'de yapılır (W2.2). Fiyat motoru
 * açılana dek `min_price` fiilen hep null olduğundan kart "Teklif İste" moduna düşer.
 *
 * Görsel dil ProductCard ile aynı tutulur (token'lar, hover, focus-visible).
 */
const FamilyCard: React.FC<FamilyCardProps> = React.memo(function FamilyCard({
  family,
  layout = 'grid',
  priority = false,
  compact = false
}) {
  const { lang, t } = useI18n()
  const Routes = useLocalizedRoutes()
  const isList = layout === 'list'

  const imageSrc = resolveProductImageUrl({ cover_image_path: family.cover_image_path })
    ?? productImagePlaceholder(family.slug)

  const quoteMode = family.min_price == null || Number(family.min_price) <= 0
  const variantBadge = t('category.family.variantCount', { count: family.variant_count })

  const priceBlock = quoteMode
    ? <span className="text-sm font-semibold text-industrial-gray">{t('common.requestQuote')}</span>
    : <>{formatCurrency(family.min_price ?? 0, lang, { maximumFractionDigits: 0 })}</>

  // LIST VIEW LAYOUT
  if (isList) {
    return (
      <Link
        href={Routes.product(family.slug)}
        data-ssr="family-card"
        className="block w-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2"
      >
        <div className="group relative flex items-center bg-white rounded-2xl border border-light-gray p-4 transition-transform duration-300 hover:shadow-hvac-lg hover:-translate-y-0.5 overflow-hidden">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 bg-light-gray/50 rounded-xl overflow-hidden p-2">
            <VentImage
              src={imageSrc}
              alt={family.name}
              fallbackType="product"
              fill
              sizes="128px"
              className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <div className="ml-5 flex-1 flex flex-col justify-center min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              {family.brand_name && (
                <span className="text-xs font-bold uppercase tracking-wider text-secondary-blue">{family.brand_name}</span>
              )}
              <span className="text-xs font-semibold text-steel-gray bg-light-gray/60 px-2 py-0.5 rounded">
                {variantBadge}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-industrial-gray group-hover:text-primary-navy transition-colors line-clamp-1">
              {family.name}
            </h3>
            <div className="mt-2 flex items-baseline gap-3">
              <div className="text-xl font-bold text-primary-navy">{priceBlock}</div>
              {!quoteMode && <span className="text-xs text-steel-gray font-medium uppercase">{t('pdp.vatIncluded')}</span>}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // GRID VIEW
  return (
    <Link
      href={Routes.product(family.slug)}
      data-ssr="family-card"
      className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2"
    >
      <div className={`group relative flex flex-col h-full bg-white rounded-2xl border border-light-gray transition-transform duration-300 hover:shadow-hvac-lg hover:-translate-y-1 overflow-hidden ${compact ? 'p-3' : 'p-4'}`}>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-start pointer-events-none">
          <div className="bg-primary-navy/90 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
            {variantBadge}
          </div>
          {family.brand_name && (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1 border border-light-gray shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <BrandIcon brand={family.brand_name} />
            </div>
          )}
        </div>

        {/* Family Cover Image */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-light-gray/30 mb-4 group-hover:bg-light-gray/50 transition-colors">
          <VentImage
            src={imageSrc}
            alt={family.name}
            fallbackType="product"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
            className="object-contain transition-transform duration-500 group-hover:scale-105 p-6"
            priority={priority}
          />
        </div>

        {/* Family Details */}
        <div className="flex flex-col flex-1 px-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-blue">
              {family.brand_name ?? ''}
            </span>
            {family.series_code && (
              <span className="text-xs text-steel-gray font-medium">{family.series_code}</span>
            )}
          </div>

          <h3 className="text-sm font-bold text-industrial-gray leading-snug min-h-10 line-clamp-2 mb-4 group-hover:text-primary-navy transition-colors">
            {family.name}
          </h3>

          <div className="mt-auto pt-3 border-t border-light-gray flex items-center justify-between gap-3">
            <div className="text-lg font-bold text-primary-navy tracking-tight">{priceBlock}</div>
            <span className="text-xs font-black uppercase tracking-wider text-secondary-blue group-hover:text-primary-navy transition-colors">
              {t('category.family.viewFamily')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
})

export default FamilyCard
