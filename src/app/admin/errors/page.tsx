'use client'

import nextDynamic from 'next/dynamic'

export const dynamic = 'force-dynamic'

const AdminErrorsPage = nextDynamic(
  () => import('../../../views/admin/AdminErrorsPage'),
  { ssr: false, loading: () => <div className="p-8 text-center text-slate-400 animate-pulse">Yükleniyor...</div> }
)

export default function Page() {
  return <AdminErrorsPage />
}




