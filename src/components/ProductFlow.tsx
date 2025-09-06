import React, { useEffect, useMemo, useRef, useState, startTransition, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import { getFeaturedProducts, getProducts, Product } from '../lib/supabase'
import { BrandIcon } from './HVACIcons'

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(!!mq.matches)
    onChange()
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])
  return reduced
}

const useProductsWithImages = () => {
  const [items, setItems] = useState<Product[]>([])
  const [allItems, setAllItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        setLoading(true)
        const [featured, some] = await Promise.all([
          getFeaturedProducts(),
          getProducts(36),
        ])
        const merged = [...featured, ...some]
        const map = new Map<string, Product>()
        merged.forEach(p => {
          if (!p.image_url) return
          map.set(p.id, p)
        })
        const arr = Array.from(map.values())
        startTransition(() => {
          if (!cancelled) {
            setItems(arr)
            setAllItems(merged)
          }
        })
      } catch (e) {
        console.warn('ProductFlow fetch error', e)
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  return { items, allItems, loading, reduced }
}

function Lane({ urls, direction, speed = 40 }: { urls: string[]; direction: 1 | -1; speed?: number }) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [offset, setOffset] = useState(0)
  const [hover, setHover] = useState(false)
  const [halfWidth, setHalfWidth] = useState(0)
  const measureRef = useRef<() => void>(() => {})

  const doubled = useMemo(() => {
    // Görsel yön illüzyonu için: tüm hareketler sola; üst/alt şeritlerde içerik ters sırada
    const base = direction === 1 ? [...urls].reverse() : urls
    return [...base, ...base]
  }, [urls, direction])

  const measure = React.useCallback(() => {
    const el = trackRef.current
    if (!el) return
    // Tek kopyanın genişliği
    const hw = el.scrollWidth / 2
    if (hw > 0) setHalfWidth(hw)
  }, [])

  measureRef.current = measure

  useLayoutEffect(() => {
    measure()
    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    const t = setTimeout(measure, 250)
    return () => { window.removeEventListener('resize', onResize); clearTimeout(t) }
  }, [measure, doubled])

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const step = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      if (!hover) {
        setOffset(prev => {
          // Tüm şeritler sola doğru akar; wrap sürekli
          let next = prev - speed * dt
          if (halfWidth > 0 && next <= -halfWidth) {
            next += halfWidth
          }
          return next
        })
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [direction, speed, hover, halfWidth])

  return (
    <div className="relative overflow-hidden" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div ref={trackRef} className="flex items-center gap-3 will-change-transform" style={{ transform: `translateX(${offset}px)` }}>
        {doubled.map((src, idx) => (
          <img
            key={idx}
            src={src}
            loading="lazy"
            decoding="async"
            alt="product"
            className="h-24 sm:h-28 md:h-32 w-auto rounded-xl object-cover bg-gray-100 border border-light-gray shadow-sm"
            onLoad={() => measureRef.current?.()}
          />
        ))}
      </div>
    </div>
  )
}


const ProductFlow: React.FC = () => {
  const { items, allItems, loading, reduced } = useProductsWithImages()
  const urls = useMemo(() => items.map(p => p.image_url!).filter(Boolean), [items])
  const A = urls.filter((_, i) => i % 3 === 0)
  const B = urls.filter((_, i) => i % 3 === 1)
  const C = urls.filter((_, i) => i % 3 === 2)

  if (loading && urls.length === 0) {
    return (
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 sm:h-24 lg:h-28 bg-light-gray/60 rounded-2xl animate-pulse" />
        </div>
      </section>
    )
  }

  if (reduced) {
    // Hareket azaltılmışsa: statik grid (url yoksa iskelet)
    return (
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {(urls.length ? urls.slice(0, 18) : new Array(12).fill(0)).map((src, i) => (
              urls.length ? (
                <img key={i} src={src as string} alt="product" loading="lazy" decoding="async" className="rounded-xl object-cover h-24 w-full bg-gray-100 border border-light-gray" />
              ) : (
                <div key={i} className="rounded-xl h-24 w-full bg-gradient-to-br from-gray-200 to-gray-100 border border-light-gray animate-pulse" />
              )
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (urls.length === 0) {
    // Görsel yoksa: ürün bilgileriyle fallback akış (tıklanabilir)
    const { A: FA, B: FB, C: FC } = (() => {
      const A: Product[] = [], B: Product[] = [], C: Product[] = []
      allItems.forEach((p, i) => {
        if (i % 3 === 0) A.push(p)
        else if (i % 3 === 1) B.push(p)
        else C.push(p)
      })
      return { A, B, C }
    })()

    const LaneFallback = ({ items, direction, speed = 40 }: { items: Product[]; direction: 1 | -1; speed?: number }) => {
      const trackRef = useRef<HTMLDivElement | null>(null)
      const [offset, setOffset] = useState(0)
      const [hover, setHover] = useState(false)
      const [halfWidth, setHalfWidth] = useState(0)

      const twice = useMemo(() => {
        const base = direction === 1 ? [...items].reverse() : items
        return [...base, ...base]
      }, [items, direction])

      useLayoutEffect(() => {
        const el = trackRef.current
        if (!el) return
        const measure = () => setHalfWidth(el.scrollWidth / 2)
        measure()
        window.addEventListener('resize', measure)
        const t = setTimeout(measure, 250)
        return () => { window.removeEventListener('resize', measure); clearTimeout(t) }
      }, [twice])

      useEffect(() => {
        let raf = 0
        let last = performance.now()
        const step = (now: number) => {
          const dt = (now - last) / 1000
          last = now
          if (!hover) setOffset(prev => {
            let next = prev - speed * dt
            if (halfWidth > 0 && next <= -halfWidth) {
              next += halfWidth
            }
            return next
          })
          raf = requestAnimationFrame(step)
        }
        raf = requestAnimationFrame(step)
        return () => cancelAnimationFrame(raf)
      }, [direction, speed, hover, halfWidth])

      return (
        <div className="relative overflow-hidden" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          <div ref={trackRef} className="flex items-stretch gap-4 will-change-transform" style={{ transform: `translateX(${offset}px)` }}>
            {twice.map((p, idx) => (
              <Link key={p.id + '-' + idx} to={`/product/${p.id}`} className="group block">
                <div className="h-28 sm:h-32 md:h-36 w-48 sm:w-56 md:w-64 rounded-xl bg-white border border-light-gray shadow-sm overflow-hidden flex items-center gap-3 px-3">
                  <div className="flex-shrink-0 bg-gray-50 border border-light-gray rounded-lg p-2">
                    <BrandIcon brand={p.brand} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm sm:text-base font-semibold text-industrial-gray group-hover:text-primary-navy line-clamp-1">{p.name}</div>
                    <div className="text-xs text-steel-gray">{p.brand} • {p.sku}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )
    }

    return (
      <section className="py-10">
        <div className="relative w-screen left-1/2 -translate-x-1/2">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
          <div className="space-y-4">
            <LaneFallback items={FA} direction={1} speed={36} />
            <LaneFallback items={FB} direction={-1} speed={48} />
            <LaneFallback items={FC} direction={1} speed={40} />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8">
      <div className="relative w-screen left-1/2 -translate-x-1/2">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
        <div className="space-y-3">
          <Lane urls={A} direction={1} speed={36} />
          <Lane urls={B} direction={-1} speed={48} />
          <Lane urls={C} direction={1} speed={40} />
        </div>
      </div>
    </section>
  )
}

export default ProductFlow

