'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminPageHeader from '../../components/admin/shell/AdminPageHeader'
import { useI18n } from '../../i18n/I18nProvider'
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
      <AdminPageHeader
        title={t('admin.titles.errorGroups')}
        description={t('admin.errorGroups.subtitle')}
      />

      <Suspense fallback={<AdminSkeleton variant="table" count={8} rows={6} />}>
        <ErrorGroupsTableBody />
      </Suspense>
    </div>
  )
}

export default AdminErrorGroupsPage
