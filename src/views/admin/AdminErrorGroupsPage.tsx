'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import { useI18n } from '../../i18n/I18nProvider'
import { adminSectionTitleClass, adminSubtitleClass } from '../../utils/adminUi'
import ErrorGroupsTableBody from './ErrorGroupsTableBody'

/**
 * Hata grupları (error_groups) — DataTableKit'e göç edilmiş server-mode sayfası.
 * Sayfa = başlık + Suspense; veri/URL/filtre state'i `ErrorGroupsTableBody` (useAdminTable) taşır.
 * `useSearchParams` tüketicisi <Suspense> ile sarılı (CLAUDE.md Kural 5 / K2).
 */
const AdminErrorGroupsPage: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="space-y-4 pb-20">
      <header>
        <h1 className={adminSectionTitleClass}>{t('admin.titles.errorGroups')}</h1>
        <p className={adminSubtitleClass}>{t('admin.errorGroups.subtitle')}</p>
      </header>

      <Suspense fallback={<AdminSkeleton variant="table" count={8} rows={6} />}>
        <ErrorGroupsTableBody />
      </Suspense>
    </div>
  )
}

export default AdminErrorGroupsPage
