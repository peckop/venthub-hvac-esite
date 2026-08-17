'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminPageHeader from '../../components/admin/shell/AdminPageHeader'
import { useI18n } from '../../i18n/I18nProvider'
import MovementsTableBody from './MovementsTableBody'

/**
 * Envanter hareketleri (inventory_movements) — DataTableKit'e göç edilmiş server-mode sayfası.
 * READ-ONLY: mutasyon/seçim/bulk YOK. Arama/sıralama/kategori filtresi embedded inner-join ile
 * SUNUCUDA çözülür. Sayfa = başlık + Suspense; veri/URL/filtre state'i `MovementsTableBody`
 * (useAdminTable) taşır. `useSearchParams` tüketicisi <Suspense> ile sarılı (CLAUDE.md Kural 5 / K2).
 */
const AdminMovementsPage: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title={t('admin.titles.movements')}
        description={t('admin.movements.subtitle')}
      />

      <Suspense fallback={<AdminSkeleton variant="table" count={5} rows={8} />}>
        <MovementsTableBody />
      </Suspense>
    </div>
  )
}

export default AdminMovementsPage
