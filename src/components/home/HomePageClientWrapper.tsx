"use client";

import React, { Suspense, useEffect, useState } from 'react'

const LeadModal = React.lazy(() => import('../LeadModal'))

interface Props {
  children: React.ReactNode
}

export const HomePageClientWrapper: React.FC<Props> = ({ children }) => {
  const [leadOpen, setLeadOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    (window as any).openLeadModal = () => setLeadOpen(true)
    return () => { (window as any).openLeadModal = undefined }
  }, [])

  return (
    <>
      {children}
      {leadOpen && (
        <Suspense fallback={null}>
          <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} />
        </Suspense>
      )}
    </>
  )
}

export default HomePageClientWrapper
