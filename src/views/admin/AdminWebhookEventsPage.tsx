'use client'

import React, { Suspense } from 'react'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import { useI18n } from '../../i18n/I18nProvider'
import { adminSectionTitleClass, adminSubtitleClass } from '../../utils/adminUi'
import WebhookEventsTableBody from './WebhookEventsTableBody'

const AdminWebhookEventsPage: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className={adminSectionTitleClass}>{t('admin.webhooks.eventsTitle')}</h1>
        <p className={adminSubtitleClass}>{t('admin.webhooks.eventsSubtitle')}</p>
      </header>

      <Suspense fallback={<AdminSkeleton variant="table" count={5} rows={8} />}>
        <WebhookEventsTableBody />
      </Suspense>
    </div>
  )
}

export default AdminWebhookEventsPage
