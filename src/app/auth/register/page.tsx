import React, { Suspense } from 'react'
import RegisterPage from '../../../views/RegisterPage'

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy" />
      </div>
    }>
      <RegisterPage />
    </Suspense>
  )
}
