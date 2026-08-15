'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminPageHeader from '../../components/admin/shell/AdminPageHeader'
import { useI18n } from '../../i18n/I18nProvider'
import AdminLogisticsTableBody from './AdminLogisticsTableBody'

export default function AdminLogisticsPage() {
  const { t } = useI18n()

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title={t('admin.logistics.title')}
        description={t('admin.logistics.subtitle')}
      />

      <Suspense fallback={<AdminSkeleton variant="table" count={10} rows={5} />}>
        <AdminLogisticsTableBody />
      </Suspense>
    </div>
  )
}
