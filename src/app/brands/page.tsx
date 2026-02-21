'use client'

import dynamic from 'next/dynamic'

const PageComponent = dynamic(() => import('../../views/BrandsPage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy" />
    </div>
  )
})

export default function Page() {
  return <PageComponent />
}



