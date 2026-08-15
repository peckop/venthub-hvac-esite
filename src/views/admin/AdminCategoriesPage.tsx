'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminPageHeader from '../../components/admin/shell/AdminPageHeader'
import { useI18n } from '../../i18n/I18nProvider'
import CategoriesTableBody from './CategoriesTableBody'

/**
 * Kategori yönetimi — DataTableKit'e göç edilmiş CLIENT-mode CRUD sayfası.
 * Sayfa = başlık + Suspense; veri/URL/seçim state'i `CategoriesTableBody` (useAdminTable) taşır.
 * `useSearchParams` tüketicisi <Suspense> ile sarılı (CLAUDE.md Kural 5 / K2).
 */
const AdminCategoriesPage: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title={t('admin.titles.categories')}
        description={t('admin.categories.subtitle')}
      />

      <Suspense fallback={<AdminSkeleton variant="table" count={7} rows={6} />}>
        <CategoriesTableBody />
      </Suspense>
    </div>
  )
}

export default AdminCategoriesPage
