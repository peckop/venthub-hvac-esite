'use client'

import { Suspense } from 'react'
import PageComponent from '../../views/PaymentSuccessPage'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <PageComponent />
    </Suspense>
  )
}



