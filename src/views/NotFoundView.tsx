'use client'

import { SearchX } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { useLocalizedRoutes } from '../hooks/useLocalizedRoutes'
import { useI18n } from '../i18n/I18nProvider'

/**
 * 404 görünümü — `src/app/not-found.tsx` çizer; hem eşleşmeyen adresler hem de ürün/kategori
 * sayfalarının `notFound()` çağrısı buraya düşer.
 *
 * NİÇİN VAR (2026-09-24 canlı ölçüm): özel 404 yoktu; Next.js'in hazır sayfası Türkçe adreste bile
 * İngilizce "404: This page could not be found." basıyor ve kendi `<title>`'ını kök düzenin
 * başlığının yanına ekliyordu → sayfada İKİ `<title>`. Bu görünüm `<title>` ÇİZMEZ; başlık tek
 * kaynaktan (kök düzen metadata) gelir. `noindex` etiketini Next.js 404'te kendisi ekler.
 *
 * Dil: kök `ClientLayout` dili yoldan çözer (`yoldanDilCoz`), `useI18n` o dili verir.
 */
const NotFoundView: React.FC = () => {
  const { t } = useI18n()
  const Routes = useLocalizedRoutes()

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <SearchX className="w-10 h-10 text-industrial-gray" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-industrial-gray mb-3">{t('sayfaBulunamadi.baslik')}</h1>
        <p className="text-steel-gray mb-8">{t('sayfaBulunamadi.aciklama')}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={Routes.products()}
            className="px-6 py-3 rounded-lg bg-primary-navy text-white font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2"
          >
            {t('sayfaBulunamadi.urunler')}
          </Link>
          <Link
            href={Routes.home()}
            className="px-6 py-3 rounded-lg border border-light-gray bg-white text-industrial-gray font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2"
          >
            {t('sayfaBulunamadi.anaSayfa')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundView
