import React, { useEffect, useMemo, useRef, useState, startTransition } from 'react'
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

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const step = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      if (!hover) {
        setOffset(prev => {
          const next = prev + direction * speed * dt
          // büyük bir aralıkta mod almayı kolaylaştırmak için
          return next
        })
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [direction, speed, hover])

  // Sürekli akış için iki kopya render edilir
  return (
    <div className="relative overflow-hidden" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div ref={trackRef} className="flex items-center gap-3 will-change-transform" style={{ transform: `translateX(${offset % -400}px)` }}>
        {[...urls, ...urls].map((src, idx) => (
          <img
            key={idx}
            src={src}
            loading="lazy"
            decoding="async"
            alt="product"
            className="h-24 sm:h-28 md:h-32 w-auto rounded-xl object-cover bg-gray-100 border border-light-gray shadow-sm"
            onLoad={e => (e.currentTarget as HTMLImageElement).decode?.().catch(()=>{})}
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
      const [offset, setOffset] = useState(0)
      const [hover, setHover] = useState(false)
      useEffect(() => {
        let raf = 0
        let last = performance.now()
        const step = (now: number) => {
          const dt = (now - last) / 1000
          last = now
          if (!hover) setOffset(prev => prev + direction * speed * dt)
          raf = requestAnimationFrame(step)
        }
        raf = requestAnimationFrame(step)
        return () => cancelAnimationFrame(raf)
      }, [direction, speed, hover])

      const twice = [...items, ...items]
      return (
        <div className="relative overflow-hidden" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          <div className="flex items-stretch gap-4 will-change-transform" style={{ transform: `translateX(${offset % -600}px)` }}>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

