import React from 'react'

interface LazyInViewProps<T extends Record<string, unknown> = Record<string, unknown>> {
  loader: () => Promise<{ default: React.ComponentType<T> }>
  placeholder?: React.ReactNode
  rootMargin?: string
  once?: boolean
  className?: string
  // Props forwarded to loaded component
  componentProps?: T
}

// Loads a component only when it enters the viewport (or after first user interaction)
// Does NOT render children until loaded, so the chunk isn't fetched early.
const LazyInView = <T extends Record<string, unknown> = Record<string, unknown>>({
  loader,
  placeholder = <div className="min-h-[160px]" aria-hidden="true" />,
  rootMargin = '200px 0px',
  once = true,
  className,
  componentProps,
}: LazyInViewProps<T>) => {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [shouldLoad, setShouldLoad] = React.useState(false)
  const [Loaded, setLoaded] = React.useState<React.ComponentType<T> | null>(null)

  // Trigger load on first interaction as a backup (won't block initial paint)
  React.useEffect(() => {
    if (shouldLoad) return
    const enable = () => setShouldLoad(true)
    window.addEventListener('pointerdown', enable, { once: true })
    window.addEventListener('touchstart', enable, { once: true })
    return () => {
      window.removeEventListener('pointerdown', enable)
      window.removeEventListener('touchstart', enable)
    }
  }, [shouldLoad])

  // IntersectionObserver to trigger when in view
  React.useEffect(() => {
    if (shouldLoad) return
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry && entry.isIntersecting) {
          setShouldLoad(true)
          if (once) io.disconnect()
        }
      },
      { root: null, rootMargin, threshold: 0.01 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shouldLoad, rootMargin, once])

  // Load the module when triggered
  React.useEffect(() => {
    let cancelled = false
    if (!shouldLoad || Loaded) return
    loader().then(mod => {
      if (!cancelled) setLoaded(() => mod.default)
    }).catch(() => {
      // swallow errors to avoid breaking initial UX
    })
    return () => { cancelled = true }
  }, [shouldLoad, Loaded, loader])

  return (
    <div ref={ref} className={className}>
      {Loaded ? <Loaded {...(componentProps as T)} /> : placeholder}
    </div>
  )
}

export default LazyInView
