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

// Windowing yapılandırması
const WINDOW_CONFIG = {
  MAX_ITEMS_PER_LANE: 30,  // Her şeritte maksimum ürün sayısı
  ROTATION_INTERVAL: 20000, // 20 saniyede bir ürün rotasyonu
  ENABLE_ROTATION: true,    // Rotasyon AÇIK - ürünler değişir
  ENABLE_RANDOM: true       // Rastgele seçim AÇIK
}

const useProductsWithImages = () => {
  const [items, setItems] = useState<Product[]>([])
  const [allItems, setAllItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [windowOffset, setWindowOffset] = useState(0) // Windowing için offset
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

  // Windowing rotasyonu (opsiyonel, şu an kapalı)
  useEffect(() => {
    if (!WINDOW_CONFIG.ENABLE_ROTATION || items.length <= WINDOW_CONFIG.MAX_ITEMS_PER_LANE * 3) return
    
    const interval = setInterval(() => {
      setWindowOffset(prev => (prev + 1) % Math.max(1, items.length - WINDOW_CONFIG.MAX_ITEMS_PER_LANE * 3))
    }, WINDOW_CONFIG.ROTATION_INTERVAL)
    
    return () => clearInterval(interval)
  }, [items.length])

  // Windowing uygula: Çok fazla ürün varsa sadece bir kısmını göster
  const windowedItems = useMemo(() => {
    if (items.length <= WINDOW_CONFIG.MAX_ITEMS_PER_LANE * 3) {
      return items // Az ürün varsa hepsini kullan
    }
    
    const maxTotal = WINDOW_CONFIG.MAX_ITEMS_PER_LANE * 3
    
    if (WINDOW_CONFIG.ENABLE_RANDOM && !WINDOW_CONFIG.ENABLE_ROTATION) {
      // Sadece rastgele seçim (rotasyon yok)
      const shuffled = [...items].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, maxTotal)
    }
    
    if (WINDOW_CONFIG.ENABLE_RANDOM && WINDOW_CONFIG.ENABLE_ROTATION) {
      // Hem rastgele hem rotasyon
      // Her rotasyonda farklı rastgele set
      const seed = Math.floor(windowOffset / 10) // Her 10 offset'te yeni randomize
      const shuffled = [...items].sort((a, b) => {
        const hash = (str: string) => str.split('').reduce((acc, char) => acc + char.charCodeAt(0), seed)
        return hash(a.id) - hash(b.id)
      })
      const start = (windowOffset % 10) * Math.floor(maxTotal / 10)
      return shuffled.slice(start, start + maxTotal)
    }
    
    // Sadece rotasyon (rastgele yok)
    const start = windowOffset
    const windowed = items.slice(start, start + maxTotal)
    
    // Döngüsel olması için baştan ekle
    if (windowed.length < maxTotal) {
      windowed.push(...items.slice(0, maxTotal - windowed.length))
    }
    
    return windowed
  }, [items, windowOffset])

  return { items: windowedItems, allItems, loading, reduced }
}

function Lane({ urls, direction, speed = 40 }: { urls: string[]; direction: 1 | -1; speed?: number }) {
  const [hover, setHover] = useState(false)
  const [contentWidth, setContentWidth] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  
  // Windowing: Çok fazla URL varsa limite
  const windowedUrls = useMemo(() => {
    if (urls.length <= WINDOW_CONFIG.MAX_ITEMS_PER_LANE) {
      return urls
    }
    
    if (WINDOW_CONFIG.ENABLE_RANDOM) {
      // Rastgele ama stable (her lane farklı)
      const seed = direction * 1000 + speed // Her lane için farklı seed
      const shuffled = [...urls].sort((a, b) => {
        const hash = (str: string) => str.split('').reduce((acc, char) => acc + char.charCodeAt(0), seed)
        return hash(a) - hash(b)
      })
      return shuffled.slice(0, WINDOW_CONFIG.MAX_ITEMS_PER_LANE)
    }
    
    // Rastgele değilse sıralı
    return urls.slice(0, WINDOW_CONFIG.MAX_ITEMS_PER_LANE)
  }, [urls, direction, speed])
  
  // Hesaplama için tekrar sayısını artır
  const items = useMemo(() => {
    // En az 3 set, kesintisiz akış için
    return [...windowedUrls, ...windowedUrls, ...windowedUrls]
  }, [windowedUrls])
  
  // Content genişliğini ölç
  useEffect(() => {
    const measure = () => {
      if (contentRef.current) {
        const width = contentRef.current.scrollWidth / 3 // Tek set genişliği
        setContentWidth(width)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    const timer = setTimeout(measure, 100)
    return () => {
      window.removeEventListener('resize', measure)
      clearTimeout(timer)
    }
  }, [items])
  
  const duration = useMemo(() => {
    return (contentWidth / speed) || 20
  }, [contentWidth, speed])
  
  const animationStyle = useMemo(() => {
    if (contentWidth === 0) return {}
    
    return {
      display: 'flex',
      gap: '0.75rem',
      animation: `${direction === 1 ? 'marquee-right' : 'marquee-left'} ${duration}s linear infinite`,
      animationPlayState: hover ? 'paused' : 'running',
      width: 'fit-content'
    } as React.CSSProperties
  }, [direction, duration, hover, contentWidth])

  return (
    <>
      <style>
        {`
          @keyframes marquee-left {
            from { transform: translateX(0); }
            to { transform: translateX(-33.333%); }
          }
          @keyframes marquee-right {
            from { transform: translateX(-33.333%); }
            to { transform: translateX(0); }
          }
        `}
      </style>
      <div className="relative overflow-hidden" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <div ref={contentRef} style={animationStyle} className="flex items-center gap-3">
          {items.map((src, idx) => (
            <img
              key={idx}
              src={src}
              loading="lazy"
              decoding="async"
              alt="product"
              className="h-24 sm:h-28 md:h-32 w-auto rounded-xl object-cover bg-gray-100 border border-light-gray shadow-sm flex-shrink-0"
            />
          ))}
        </div>
      </div>
    </>
  )
}


const ProductFlow: React.FC = () => {
  const { items, allItems, loading, reduced } = useProductsWithImages()
  const urls = useMemo(() => items.map(p => p.image_url!).filter(Boolean), [items])
  
  // Performans: Çok fazla URL varsa mesaj göster (geliştirici için)
  useEffect(() => {
    if (urls.length > WINDOW_CONFIG.MAX_ITEMS_PER_LANE * 3) {
      console.log(
        `[ProductFlow] Windowing aktif: ${urls.length} üründen ${WINDOW_CONFIG.MAX_ITEMS_PER_LANE * 3} tanesi gösteriliyor`,
        `| Rotasyon: ${WINDOW_CONFIG.ENABLE_ROTATION ? 'AÇIK' : 'KAPALI'}`,
        `| Rastgele: ${WINDOW_CONFIG.ENABLE_RANDOM ? 'AÇIK' : 'KAPALI'}`
      )
    }
  }, [urls.length])
  
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
      const [periodWidth, setPeriodWidth] = useState(0)
      const [offset, setOffset] = useState(0)
      const [hover, setHover] = useState(false)
      const [repeat, setRepeat] = useState(4)

      const repeated = useMemo(() => Array.from({ length: repeat }, () => items).flat(), [items, repeat])

      useEffect(() => {
        const el = trackRef.current
        if (!el) return
        const measure = () => {
          const total = el.scrollWidth
          const base = repeat > 0 ? total / repeat : 0
          if (base > 0) {
            setPeriodWidth(base)
            const vw = window.innerWidth || 0
            const needed = Math.max(4, Math.ceil((vw * 2 + base) / base))
            if (needed !== repeat) requestAnimationFrame(() => setRepeat(needed))
            // Sağa akan için başlangıç offset
            if (direction === 1 && base > 0) {
              setOffset(base / 2)
            }
          }
        }
        const raf = requestAnimationFrame(measure)
        let resizeRaf = 0
        const onResize = () => { cancelAnimationFrame(resizeRaf); resizeRaf = requestAnimationFrame(measure) }
        window.addEventListener('resize', onResize)
        const t = setTimeout(measure, 250)
        return () => { cancelAnimationFrame(raf); cancelAnimationFrame(resizeRaf); window.removeEventListener('resize', onResize); clearTimeout(t) }
      }, [items, repeat])

      useEffect(() => {
        let raf = 0
        let last = performance.now()
        const step = (now: number) => {
          const dt = (now - last) / 1000
          last = now
          if (!hover) setOffset(prev => {
            // translateX(-offset) yaklaşımı: direction=-1 (sola) => offset artar; direction=1 (sağa) => azalır.
            const dir = direction === -1 ? 1 : -1
            let next = prev + dir * speed * dt
            if (periodWidth > 0) {
              const p = periodWidth
              while (next >= p) next -= p
              while (next < 0) next += p
            }
            return next
          })
          raf = requestAnimationFrame(step)
        }
        raf = requestAnimationFrame(step)
        return () => cancelAnimationFrame(raf)
      }, [direction, speed, hover, periodWidth])

      return (
        <div className="relative overflow-hidden" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          <div ref={trackRef} className="flex items-stretch gap-4 will-change-transform" style={{ transform: `translateX(${-offset}px)` }}>
            {repeated.map((p, idx) => (
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
            {/* Duplicate for seamless */}
            {repeated.slice(0, items.length).map((p, idx) => (
              <Link key={`dup-${p.id}-${idx}`} to={`/product/${p.id}`} className="group block">
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

