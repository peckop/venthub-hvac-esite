'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import { useI18n } from '../../i18n/I18nProvider'
import { adminSectionTitleClass, adminSubtitleClass } from '../../utils/adminUi'
import ErrorsTableBody from './ErrorsTableBody'

/**
 * İstemci hataları (client_errors) — DataTableKit'e göç edilmiş server-mode sayfası.
 * Sayfa = başlık + Suspense; veri/URL/filtre state'i `ErrorsTableBody` (useAdminTable) taşır.
 * `useSearchParams` tüketicisi <Suspense> ile sarılı (CLAUDE.md Kural 5 / K2).
 */
const AdminErrorsPage: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="space-y-4 pb-20">
      <header>
        <h1 className={adminSectionTitleClass}>{t('admin.titles.errors')}</h1>
        <p className={adminSubtitleClass}>{t('admin.errors.subtitle')}</p>
      </header>

      <Suspense fallback={<AdminSkeleton variant="table" count={5} rows={6} />}>
        <ErrorsTableBody />
      </Suspense>
    </div>
  )
}

export default AdminErrorsPage
