'use client'

import nextDynamic from 'next/dynamic'
import { Suspense } from 'react'

import { useI18n } from '@/i18n/I18nProvider'

export const dynamic = 'force-dynamic'

const Loading = () => {
  const { t } = useI18n();
  return <div className="p-8 text-center text-admin-fg-muted animate-pulse">{t('admin.common.loading')}</div>;
};

const AdminOrdersPage = nextDynamic(
  () => import('../../../views/admin/AdminOrdersPage'),
  { ssr: false, loading: Loading }
)

export default function Page() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="p-8 text-center text-admin-fg-muted animate-pulse">{t('common.loading')}</div>}>
      <AdminOrdersPage />
    </Suspense>
  )
}

