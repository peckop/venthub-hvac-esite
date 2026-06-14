'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import { useI18n } from '../../i18n/I18nProvider'
import { adminSectionTitleClass, adminSubtitleClass } from '../../utils/adminUi'
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
      <header>
        <h1 className={adminSectionTitleClass}>{t('admin.titles.categories')}</h1>
        <p className={adminSubtitleClass}>{t('admin.categories.subtitle')}</p>
      </header>

      <Suspense fallback={<AdminSkeleton variant="table" count={7} rows={6} />}>
        <CategoriesTableBody />
      </Suspense>
    </div>
  )
}

export default AdminCategoriesPage
