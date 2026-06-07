'use client'

import React, { Suspense } from 'react'
import nextDynamic from 'next/dynamic'
import { useI18n } from '@/i18n/I18nProvider'

export const dynamic = 'force-dynamic'

const AdminAuditLogsPage = nextDynamic(
  () => import('../../../views/admin/AdminAuditLogPage'),
  { ssr: false, loading: () => <div className="p-8 text-center text-slate-400 animate-pulse">Yükleniyor...</div> }
)

export default function Page() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 animate-pulse">{t('common.loading')}</div>}>
      <AdminAuditLogsPage />
    </Suspense>
  )
}




