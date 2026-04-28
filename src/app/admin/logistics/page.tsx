'use client'

import dynamic from 'next/dynamic'

const AdminLogisticsPage = dynamic(
  () => import('../../../views/admin/AdminLogisticsPage'),
  { ssr: false, loading: () => <div className="p-8 text-center text-slate-400 animate-pulse">Yükleniyor...</div> }
)

export default function LogisticsPage() {
    return <AdminLogisticsPage />
}
