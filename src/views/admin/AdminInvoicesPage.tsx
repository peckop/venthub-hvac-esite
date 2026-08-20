'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminPageHeader from '../../components/admin/shell/AdminPageHeader'
import { useI18n } from '../../i18n/I18nProvider'
import AdminInvoicesTableBody from './AdminInvoicesTableBody'

/**
 * Fatura defteri (T132-VH).
 *
 * Cetvel `legal-compliance-standard.md §2.3`: köprü döneminde fatura entegratör
 * panelinde ELLE kesilir; bu ekran o prosedürün 1. ve 5. adımlarının yüzüdür —
 * hangi ödenmiş siparişin faturası eksik (adım 1) ve kesilen faturanın kimliğinin
 * deftere işlenmesi (adım 5). Kesim işi burada YAPILMAZ.
 *
 * Sayfa = başlık + Suspense; veri/URL/filtre state'i gövdede (Kural 5).
 */
const AdminInvoicesPage: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title={t('admin.invoices.title')}
        description={t('admin.invoices.subtitle')}
      />

      <Suspense fallback={<AdminSkeleton variant="table" count={6} rows={6} />}>
        <AdminInvoicesTableBody />
      </Suspense>
    </div>
  )
}

export default AdminInvoicesPage
