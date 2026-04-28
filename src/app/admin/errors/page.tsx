'use client'

import dynamic from 'next/dynamic'

const AdminErrorsPage = dynamic(
  () => import('../../../views/admin/AdminErrorsPage'),
  { ssr: false, loading: () => <div className="p-8 text-center text-slate-400 animate-pulse">Yükleniyor...</div> }
)

export default function Page() {
  return <AdminErrorsPage />
}



