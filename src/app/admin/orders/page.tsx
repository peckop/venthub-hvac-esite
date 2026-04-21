'use client'

import { Suspense } from 'react'
import PageComponent from '../../../views/admin/AdminOrdersPage'
import { useI18n } from '@/i18n/I18nProvider'

export default function Page() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 animate-pulse">{t('common.loading')}</div>}>
      <PageComponent />
    </Suspense>
  )
}
