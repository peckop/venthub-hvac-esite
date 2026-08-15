'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminPageHeader from '../../components/admin/shell/AdminPageHeader'
import { useI18n } from '../../i18n/I18nProvider'
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
      <AdminPageHeader
        title={t('admin.titles.audit')}
        description={t('admin.audit.subtitle')}
      />

      <Suspense fallback={<AdminSkeleton variant="table" count={5} rows={6} />}>
        <AuditLogTableBody />
      </Suspense>
    </div>
  )
}

export default AdminAuditLogPage
