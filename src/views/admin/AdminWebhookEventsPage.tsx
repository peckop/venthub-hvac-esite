'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminPageHeader from '../../components/admin/shell/AdminPageHeader'
import { useI18n } from '../../i18n/I18nProvider'
import WebhookEventsTableBody from './WebhookEventsTableBody'

const AdminWebhookEventsPage: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title={t('admin.webhooks.eventsTitle')}
        description={t('admin.webhooks.eventsSubtitle')}
      />

      <Suspense fallback={<AdminSkeleton variant="table" count={5} rows={8} />}>
        <WebhookEventsTableBody />
      </Suspense>
    </div>
  )
}

export default AdminWebhookEventsPage
