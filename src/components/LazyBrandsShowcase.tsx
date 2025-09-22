import React from 'react'
import LazyInView from './LazyInView'

const LazyBrandsShowcase: React.FC = () => {
  return (
    <LazyInView
      loader={() => import('./BrandsShowcase')}
      placeholder={<div className="min-h-[120px]" aria-hidden="true" />}
      rootMargin="300px 0px"
      once
      className=""
    />
  )
}

export default LazyBrandsShowcase
