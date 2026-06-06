'use client'

import nextDynamic from 'next/dynamic'

export const dynamic = 'force-dynamic'

const PageComponent = nextDynamic(() => import('../../../views/admin/AdminInventoryPage'), {
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




