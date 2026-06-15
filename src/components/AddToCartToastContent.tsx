'use client'

import Link from 'next/link'
import React from 'react'

import type { Product } from '@/types/ui-models'

import { useLocalizedRoutes } from '../hooks/useLocalizedRoutes'
import { useI18n } from '../i18n/I18nProvider'

const CLOSE_GLYPH = '×'

interface AddToCartToastContentProps {
  product: Product
  onClose: () => void
}

const AddToCartToastContent: React.FC<AddToCartToastContentProps> = ({ product, onClose }) => {
  const { t } = useI18n()
  const Routes = useLocalizedRoutes()

  return (
    <div className="w-full md:w-360px max-w-92vw rounded-2xl shadow-2xl border border-light-gray bg-white ring-1 ring-black/5 overflow-hidden animate-slide-up">
      <div className="p-3 md:p-4 flex items-start gap-3">
        <div className="bg-success-green/10 p-2 rounded-lg shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success-green" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-industrial-gray font-semibold truncate text-base leading-snug">
            {t('cartToast.added')}
          </div>
          <div className="text-sm text-steel-gray truncate mt-0.5">
            {product.name}
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="text-steel-gray hover:text-industrial-gray font-bold text-lg leading-none p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy rounded"
          aria-label={t('common.close')}
        >
          {CLOSE_GLYPH}
        </button>
      </div>
      <div className="px-3 md:px-4 pb-3 md:pb-4 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 px-3 py-2.5 md:py-2 border border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white rounded-lg transition-colors font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-navy"
            aria-label={t('cartToast.continue')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 2l1 5h10l1-5" />
              <path d="M3 6h18l-2 14H5L3 6z" />
            </svg>
            <span>{t('cartToast.continue')}</span>
          </button>
          <Link 
            href={Routes.cart()} 
            onClick={onClose} 
            className="inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-navy rounded-lg"
          >
            <span className="inline-flex items-center justify-center gap-2 px-3 py-2.5 md:py-2 bg-primary-navy hover:bg-secondary-blue text-white rounded-lg transition-colors font-medium text-sm w-full">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="M13 5l7 7-7 7" />
              </svg>{' '}
              {t('cartToast.goToCart')}
            </span>
          </Link>
        </div>
        <div className="text-xs text-steel-gray text-center mt-2.5">
          {t('cartToast.autoClose')}
        </div>
      </div>
    </div>
  )
}

export default AddToCartToastContent
