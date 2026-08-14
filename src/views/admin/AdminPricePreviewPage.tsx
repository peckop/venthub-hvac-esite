'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import { useI18n } from '../../i18n/I18nProvider'
import { adminSectionTitleClass, adminSubtitleClass } from '../../utils/adminUi'
import PricePreviewPanel from './PricePreviewPanel'

/**
 * Fiyat önizleme — sayfa = başlık + Suspense.
 * URL state'i (`?productId=&segment=&currency=&qty=`) `PricePreviewPanel`
 * `useSearchParams` ile tüketir; bu yüzden <Suspense> ZORUNLU
 * (CLAUDE.md Kural 5 — SSR zehirlenmesi).
 */
const AdminPricePreviewPage: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className={adminSectionTitleClass}>{t('admin.titles.pricingPreview')}</h1>
        <p className={adminSubtitleClass}>{t('admin.pricing.preview.subtitle')}</p>
      </header>

      <Suspense fallback={<AdminSkeleton variant="form" fields={4} />}>
        <PricePreviewPanel />
      </Suspense>
    </div>
  )
}

export default AdminPricePreviewPage
