'use client'

import dynamic from 'next/dynamic'

const AdminCategoriesPage = dynamic(
  () => import('../../../views/admin/AdminCategoriesPage'),
  { ssr: false, loading: () => <div className="p-8 text-center text-slate-400 animate-pulse">Yükleniyor...</div> }
)

export default function Page() {
  return <AdminCategoriesPage />
}



