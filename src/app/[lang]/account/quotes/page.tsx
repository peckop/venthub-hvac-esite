'use client'

import React, { Suspense } from 'react'

import PageComponent from '../../../../views/account/quotes/AccountQuotesPage'

export const dynamic = 'force-dynamic'

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
