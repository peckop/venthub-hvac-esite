'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminPageHeader from '../../components/admin/shell/AdminPageHeader'
import { useI18n } from '../../i18n/I18nProvider'
import CouponsTableBody from './CouponsTableBody'

/**
 * Kupon yönetimi — DataTableKit'e göç edilmiş ilk validator sayfası.
 * Sayfa = başlık + Suspense; veri/URL state'i `CouponsTableBody` (useAdminTable) taşır.
 * `useSearchParams` tüketicisi <Suspense> ile sarılı (CLAUDE.md Kural 5 / K2).
 */
const AdminCouponsPage: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title={t('admin.titles.coupons')}
        description={t('admin.coupons.subtitle')}
      />

      <Suspense fallback={<AdminSkeleton variant="table" count={8} rows={6} />}>
        <CouponsTableBody />
      </Suspense>
    </div>
  )
}

export default AdminCouponsPage
