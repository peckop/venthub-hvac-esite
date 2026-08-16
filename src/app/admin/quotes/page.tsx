'use client'

import nextDynamic from 'next/dynamic'

import { useI18n } from '@/i18n/I18nProvider'

export const dynamic = 'force-dynamic'

const Loading = () => {
  const { t } = useI18n();
  return <div className="p-8 text-center text-slate-400 animate-pulse">{t('admin.common.loading')}</div>;
};

const AdminQuotesPage = nextDynamic(
  () => import('../../../views/admin/quotes/AdminQuotesPage'),
  { ssr: false, loading: Loading }
)

export default function Page() {
  return <AdminQuotesPage />
}
