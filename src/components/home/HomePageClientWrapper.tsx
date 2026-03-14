"use client";

import React, { Suspense, useEffect, useState } from 'react'

const LeadModal = React.lazy(() => import('../LeadModal'))

interface Props {
  children: (onQuoteClick: () => void) => React.ReactNode
}

export const HomePageClientWrapper: React.FC<Props> = ({ children }) => {
  const [leadOpen, setLeadOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const target = window as unknown as { openLeadModal?: () => void }
    target.openLeadModal = () => setLeadOpen(true)
    return () => { delete target.openLeadModal }
  }, [])

  const handleQuoteClick = () => setLeadOpen(true)

  return (
    <>
      {children(handleQuoteClick)}
      {leadOpen && (
        <Suspense fallback={null}>
          <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} />
        </Suspense>
      )}
    </>
  )
}

export default HomePageClientWrapper
