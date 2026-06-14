'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import { useI18n } from '../../i18n/I18nProvider'
import { adminSectionTitleClass, adminSubtitleClass } from '../../utils/adminUi'
import AuditLogTableBody from './AuditLogTableBody'

/**
 * Denetim kayıtları (admin_audit_log) — DataTableKit'e göç edilmiş server-mode sayfası.
 * Sayfa = başlık + Suspense; veri/URL/filtre state'i `AuditLogTableBody` (useAdminTable) taşır.
 * `useSearchParams` tüketicisi <Suspense> ile sarılı (CLAUDE.md Kural 5 / K2).
 */
const AdminAuditLogPage: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="space-y-4 pb-20">
      <header>
        <h1 className={adminSectionTitleClass}>{t('admin.titles.audit')}</h1>
        <p className={adminSubtitleClass}>{t('admin.audit.subtitle')}</p>
      </header>

      <Suspense fallback={<AdminSkeleton variant="table" count={5} rows={6} />}>
        <AuditLogTableBody />
      </Suspense>
    </div>
  )
}

export default AdminAuditLogPage
