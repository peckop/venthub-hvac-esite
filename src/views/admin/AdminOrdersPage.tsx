'use client'

import { KanbanSquare, LayoutList } from 'lucide-react'
import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import { useI18n } from '../../i18n/I18nProvider'
import { adminSectionTitleClass, adminSubtitleClass } from '../../utils/adminUi'
import AdminOrdersBoard from './AdminOrdersBoard'
import OrdersTableBody from './OrdersTableBody'

/**
 * Siparişler — DataTableKit'e göç edilmiş thin-page.
 * List görünümü tüm veri/fetch/sort/filter/modal mantığını server-mode `OrdersTableBody`
 * (useAdminTable) içine taşır; sayfa = header + list/board toggle. `useSearchParams`
 * tüketicisi (OrdersTableBody) <Suspense> ile sarılı (CLAUDE.md Kural 5 / K2).
 * Board görünümü DEĞİŞMEDEN `AdminOrdersBoard`'a delege edilir.
 */
const AdminOrdersPage: React.FC = () => {
  const { t } = useI18n()
  const [viewMode, setViewMode] = React.useState<'list' | 'board'>('list')

  return (
    <div className="h-full flex flex-col space-y-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
          <h1 className={adminSectionTitleClass}>{t('admin.titles.orders')}</h1>
          <p className={adminSubtitleClass}>
            {viewMode === 'board' ? t('admin.orders.boardSubtitle') : t('admin.orders.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-admin-surface p-1 rounded-admin-lg border border-admin-border shrink-0 shadow-admin-lg">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-6 py-2.5 rounded-admin-md text-xs font-semibold flex items-center gap-2 transition-colors duration-500 ${
              viewMode === 'list'
                ? 'bg-admin-accent text-admin-accent-fg'
                : 'text-admin-fg-muted hover:text-admin-fg hover:bg-admin-surface-2'
            }`}
          >
            <LayoutList size={14} /> {t('admin.orders.view_list')}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('board')}
            className={`px-6 py-2.5 rounded-admin-md text-xs font-semibold flex items-center gap-2 transition-colors duration-500 ${
              viewMode === 'board'
                ? 'bg-admin-accent text-admin-accent-fg'
                : 'text-admin-fg-muted hover:text-admin-fg hover:bg-admin-surface-2'
            }`}
          >
            <KanbanSquare size={14} /> {t('admin.orders.view_board')}
          </button>
        </div>
      </header>

      {viewMode === 'board' ? (
        <AdminOrdersBoard />
      ) : (
        <Suspense fallback={<AdminSkeleton variant="table" count={6} rows={8} />}>
          <OrdersTableBody />
        </Suspense>
      )}
    </div>
  )
}

export default AdminOrdersPage
