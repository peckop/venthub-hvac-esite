'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import { useI18n } from '../../i18n/I18nProvider'
import { adminSectionTitleClass, adminSubtitleClass } from '../../utils/adminUi'
import ReturnsTableBody from './ReturnsTableBody'

/**
 * İade yönetimi — DataTableKit'e göç edilmiş client-mode sayfası (statü-makinesi CRUD).
 * Sayfa = başlık + Suspense; veri/URL/filtre state'i `ReturnsTableBody` (useAdminTable) taşır.
 * `useSearchParams` tüketicisi <Suspense> ile sarılı (CLAUDE.md Kural 5 / K2).
 */
const AdminReturnsPage: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className={adminSectionTitleClass}>{t('admin.titles.returns')}</h1>
        <p className={adminSubtitleClass}>{t('admin.returns.subtitle')}</p>
      </header>

      <Suspense fallback={<AdminSkeleton variant="table" count={7} rows={6} />}>
        <ReturnsTableBody />
      </Suspense>
    </div>
  )
}

export default AdminReturnsPage
