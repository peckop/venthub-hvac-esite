'use client'

import dynamic from 'next/dynamic'

const AdminWebhookEventsPage = dynamic(
  () => import('../../../views/admin/AdminWebhookEventsPage'),
  { ssr: false, loading: () => <div className="p-8 text-center text-slate-400 animate-pulse">Yükleniyor...</div> }
)

export default function Page() {
  return <AdminWebhookEventsPage />
}



