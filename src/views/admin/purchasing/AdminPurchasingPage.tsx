'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../../components/admin/AdminSkeleton'
import { useI18n } from '../../../i18n/I18nProvider'
import { adminSectionTitleClass, adminSubtitleClass } from '../../../utils/adminUi'
import PurchasingTableBody from './PurchasingTableBody'

/**
 * Satınalma — T062 D4 (cetvel §8). Sayfa = başlık + Suspense; veri/URL/filtre
 * state'i `PurchasingTableBody` (useAdminTable) taşır. `useSearchParams` tüketicisi
 * <Suspense> ile sarılı (CLAUDE.md Kural 5 / K2).
 */
const AdminPurchasingPage: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className={adminSectionTitleClass}>{t('admin.purchasing.title')}</h1>
        <p className={adminSubtitleClass}>{t('admin.purchasing.subtitle')}</p>
      </header>

      <Suspense fallback={<AdminSkeleton variant="table" count={6} rows={6} />}>
        <PurchasingTableBody />
      </Suspense>
    </div>
  )
}

export default AdminPurchasingPage
