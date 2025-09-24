import React from 'react'
import LazyInView from './LazyInView'

const LazyProductFlow: React.FC = () => {
  const [enabled, setEnabled] = React.useState(false)
  React.useEffect(() => {
    const enable = () => setEnabled(true)
    window.addEventListener('pointerdown', enable, { once: true })
    window.addEventListener('touchstart', enable, { once: true })
    const t = setTimeout(() => setEnabled(true), 6000) // LCP penceresi sonrasında yükle
    return () => { window.removeEventListener('pointerdown', enable); window.removeEventListener('touchstart', enable); clearTimeout(t) }
  }, [])
  if (!enabled) return <div className="min-h-[200px]" aria-hidden="true" />
  return (
    <LazyInView
      loader={() => import('./ProductFlow')}
      placeholder={<div className="min-h-[200px]" aria-hidden="true" />}
      rootMargin="0px 0px"
      once
      className=""
    />
  )
}

export default LazyProductFlow
