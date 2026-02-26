'use client'

import { Suspense } from 'react'
import PageComponent from '../../../views/admin/AdminOrdersPage'

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 animate-pulse">Yükleniyor...</div>}>
      <PageComponent />
    </Suspense>
  )
}
