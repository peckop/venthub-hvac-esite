'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../../components/admin/AdminSkeleton'
import { useI18n } from '../../../i18n/I18nProvider'
import { adminSectionTitleClass, adminSubtitleClass } from '../../../utils/adminUi'
import QuotesTableBody from './QuotesTableBody'

/**
 * Teklif kuyruğu — T067-VH (cetvel Q7). Sayfa = başlık + Suspense; veri/URL/filtre
 * state'i `QuotesTableBody` (useAdminTable) taşır. `useSearchParams` tüketicisi
 * <Suspense> ile sarılı (CLAUDE.md Kural 5 / K2).
 */
const AdminQuotesPage: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className={adminSectionTitleClass}>{t('quotes.admin.title')}</h1>
        <p className={adminSubtitleClass}>{t('quotes.admin.subtitle')}</p>
      </header>

      <Suspense fallback={<AdminSkeleton variant="table" count={6} rows={6} />}>
        <QuotesTableBody />
      </Suspense>
    </div>
  )
}

export default AdminQuotesPage
