'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import { useI18n } from '../../i18n/I18nProvider'
import { adminSectionTitleClass, adminSubtitleClass } from '../../utils/adminUi'
import ProductsTableBody from './ProductsTableBody'

/**
 * Ürünler — DataTableKit'e göç edilmiş thin-page (projedeki en karmaşık liste).
 * Tüm veri/fetch (hibrit FTS+query)/sort/filter/inline-edit/expand/bulk + 6 yazma kapısı
 * server-mode `ProductsTableBody` (useAdminTable) içine taşındı; sayfa = başlık + Suspense.
 * 'Yeni Ürün' butonu + ProductFormModal + CSV import + export body'de.
 * `useSearchParams` tüketicisi (ProductsTableBody) <Suspense> ile sarılı (CLAUDE.md Kural 5 / K2).
 */
const AdminProductsPage: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className={adminSectionTitleClass}>{t('admin.titles.products')}</h1>
        <p className={adminSubtitleClass}>{t('admin.products.subtitle')}</p>
      </header>

      <Suspense fallback={<AdminSkeleton variant="table" count={10} rows={5} />}>
        <ProductsTableBody />
      </Suspense>
    </div>
  )
}

export default AdminProductsPage
