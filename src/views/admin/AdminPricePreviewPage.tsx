'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminPageHeader from '../../components/admin/shell/AdminPageHeader'
import { useI18n } from '../../i18n/I18nProvider'
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
      <AdminPageHeader
        title={t('admin.titles.pricingPreview')}
        description={t('admin.pricing.preview.subtitle')}
      />

      <Suspense fallback={<AdminSkeleton variant="form" fields={4} />}>
        <PricePreviewPanel />
      </Suspense>
    </div>
  )
}

export default AdminPricePreviewPage
