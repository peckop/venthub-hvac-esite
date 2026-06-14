'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import { useI18n } from '../../i18n/I18nProvider'
import { adminSectionTitleClass, adminSubtitleClass } from '../../utils/adminUi'
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
      <header>
        <h1 className={adminSectionTitleClass}>{t('admin.titles.coupons')}</h1>
        <p className={adminSubtitleClass}>{t('admin.coupons.subtitle')}</p>
      </header>

      <Suspense fallback={<AdminSkeleton variant="table" count={8} rows={6} />}>
        <CouponsTableBody />
      </Suspense>
    </div>
  )
}

export default AdminCouponsPage
