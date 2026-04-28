'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { useI18n } from '@/i18n/I18nProvider'

const AdminOrdersPage = dynamic(
  () => import('../../../views/admin/AdminOrdersPage'),
  { ssr: false, loading: () => <div className="p-8 text-center text-slate-400 animate-pulse">Yükleniyor...</div> }
)

export default function Page() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 animate-pulse">{t('common.loading')}</div>}>
      <AdminOrdersPage />
    </Suspense>
  )
}
