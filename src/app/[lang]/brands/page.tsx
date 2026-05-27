import React, { Suspense } from 'react'
import BrandsPage from '../../../views/BrandsPage'

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy" />
      </div>
    }>
      <BrandsPage />
    </Suspense>
  )
}
