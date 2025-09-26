import React from 'react'
import LazyInView from './LazyInView'

const LazyProductFlow: React.FC = () => {
  const [enabled, setEnabled] = React.useState(false)
  React.useEffect(() => {
    const enable = () => setEnabled(true)
    window.addEventListener('pointerdown', enable, { once: true })
    window.addEventListener('touchstart', enable, { once: true })
    // Daha erken etkinleştir: idle sonrası veya en geç 1500ms
    const win = window as unknown as { requestIdleCallback?: (cb: () => void) => number }
    const idle = (cb: () => void) => (typeof win.requestIdleCallback === 'function' ? win.requestIdleCallback(cb) : setTimeout(cb, 800))
    const idleId = idle(() => setEnabled(true))
    const t = setTimeout(() => setEnabled(true), 1500)
    return () => { window.removeEventListener('pointerdown', enable); window.removeEventListener('touchstart', enable); clearTimeout(t); if (typeof idleId === 'number') clearTimeout(idleId as unknown as number) }
  }, [])
  if (!enabled) return <div className="min-h-[80px]" aria-hidden="true" />
  return (
    <LazyInView
      loader={() => import('./ProductFlow')}
      placeholder={<div className="min-h-[80px]" aria-hidden="true" />}
      rootMargin="600px 0px"
      once
      className=""
    />
  )
}

export default LazyProductFlow
