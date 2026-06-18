'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import { useI18n } from '../../i18n/I18nProvider'
import { adminSectionTitleClass, adminSubtitleClass } from '../../utils/adminUi'
import AdminLogisticsTableBody from './AdminLogisticsTableBody'

export default function AdminLogisticsPage() {
  const { t } = useI18n()

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className={adminSectionTitleClass}>{t('admin.logistics.title')}</h1>
        <p className={adminSubtitleClass}>{t('admin.logistics.subtitle')}</p>
      </header>

      <Suspense fallback={<AdminSkeleton variant="table" count={10} rows={5} />}>
        <AdminLogisticsTableBody />
      </Suspense>
    </div>
  )
}
