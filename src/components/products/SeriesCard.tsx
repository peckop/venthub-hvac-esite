'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '../../i18n/format';
import { useI18n } from '../../i18n/I18nProvider';

interface SeriesCardProps {
  name: string;
  image?: string;
  productCount: number;
  minPrice: number;
  href: string;
}

export const SeriesCard: React.FC<SeriesCardProps> = ({
  name,
  image,
  productCount,
  minPrice,
  href
}) => {
  const { lang, t } = useI18n();

  return (
    <Link 
      href={href as import('next').Route}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-primary-navy/20 hover:shadow-[0_20px_40px_-15px_rgba(30,41,59,0.1)]"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain p-6 transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-300">
            <svg width={48} height={48} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Badge: Product Count */}
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-navy backdrop-blur-md shadow-sm">
          {productCount} {t('common.products') || 'Ürün'}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="vh-h3 mb-2 text-slate-900 transition-colors group-hover:text-primary-navy">
          {name} {t('common.series') || 'Serisi'}
        </h3>
        
        <p className="mb-6 line-clamp-2 text-sm text-steel-gray">
          {t('series.premium_desc', { name }) || `${name} serisi yüksek performanslı havalandırma çözümleri sunar.`}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-steel-gray/60">
              {t('product.starting_from') || 'Başlayan fiyatlarla'}
            </span>
            <span className="text-lg font-bold text-primary-navy">
              {minPrice !== Infinity ? formatCurrency(minPrice, lang) : '---'}
            </span>
          </div>
          
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-air-blue/10 text-primary-navy transition-all duration-300 group-hover:bg-primary-navy group-hover:text-white">
            <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};
