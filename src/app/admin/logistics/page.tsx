'use client'

import nextDynamic from 'next/dynamic'

import { useI18n } from '@/i18n/I18nProvider'

export const dynamic = 'force-dynamic'

const Loading = () => {
  const { t } = useI18n();
  return <div className="p-8 text-center text-admin-fg-muted animate-pulse">{t('admin.common.loading')}</div>;
};

const AdminLogisticsPage = nextDynamic(
  () => import('../../../views/admin/AdminLogisticsPage'),
  { ssr: false, loading: Loading }
)

export default function LogisticsPage() {
    return <AdminLogisticsPage />
}

