import React from 'react'
import LazyInView from './LazyInView'

const LazyProductFlow: React.FC = () => {
  return (
    <LazyInView
      loader={() => import('./ProductFlow')}
      placeholder={<div className="min-h-[200px]" aria-hidden="true" />}
      rootMargin="300px 0px"
      once
      className=""
    />
  )
}

export default LazyProductFlow
