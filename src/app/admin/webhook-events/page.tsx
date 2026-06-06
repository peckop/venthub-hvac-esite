'use client'

import nextDynamic from 'next/dynamic'

export const dynamic = 'force-dynamic'

const AdminWebhookEventsPage = nextDynamic(
  () => import('../../../views/admin/AdminWebhookEventsPage'),
  { ssr: false, loading: () => <div className="p-8 text-center text-slate-400 animate-pulse">Yükleniyor...</div> }
)

export default function Page() {
  return <AdminWebhookEventsPage />
}




