'use client'

import dynamic from 'next/dynamic'

const AdminInventoryReportPage = dynamic(
  () => import('../../../../views/admin/AdminInventoryReportPage'),
  { ssr: false, loading: () => <div className="p-8 text-center text-slate-400 animate-pulse">Yükleniyor...</div> }
)

export default function InventoryReportPage() {
    return <AdminInventoryReportPage />
}
