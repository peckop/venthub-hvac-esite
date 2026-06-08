'use client'

import nextDynamic from 'next/dynamic'
import React, { Suspense } from 'react'

export const dynamic = 'force-dynamic'

const PageComponent = nextDynamic(() => import('../../../views/admin/AdminMovementsPage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy" />
    </div>
  )
})

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy" />
      </div>
    }>
      <PageComponent />
    </Suspense>
  )
}




