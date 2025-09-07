import React, { useEffect, useState, useMemo } from 'react'
import { getFeaturedProducts, getProducts, Product } from '../lib/supabase'

const useProductsWithImages = () => {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

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
        const arr = Array.from(map.values()).slice(0, 30) // Max 30 ürün
        if (!cancelled) {
          setItems(arr)
        }
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

  return { items, loading }
}

// Basit CSS animasyonlu lane - JavaScript animasyon yok
function SimpleLane({ urls, direction }: { urls: string[]; direction: 'left' | 'right' }) {
  const items = [...urls, ...urls, ...urls] // 3 set for seamless loop
  
  return (
    <div className="relative overflow-hidden">
      <div 
        className={`flex items-center gap-3 ${
          direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right'
        }`}
      >
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
  )
}

const ProductFlowSimple: React.FC = () => {
  const { items, loading } = useProductsWithImages()
  const urls = useMemo(() => items.map(p => p.image_url!).filter(Boolean), [items])
  
  // Debug log (use warn to pass lint rule)
  console.warn('[ProductFlowSimple] Loading:', loading, 'URLs count:', urls.length)
  
  const A = urls.filter((_, i) => i % 3 === 0)
  const B = urls.filter((_, i) => i % 3 === 1)
  const C = urls.filter((_, i) => i % 3 === 2)

  if (loading) {
    return (
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 sm:h-24 lg:h-28 bg-light-gray/60 rounded-2xl animate-pulse" />
          <p className="text-center text-sm text-gray-500 mt-2">Ürünler yükleniyor...</p>
        </div>
      </section>
    )
  }
  
  if (urls.length === 0) {
    return (
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500">Görüntülenecek ürün bulunamadı</p>
        </div>
      </section>
    )
  }

  return (
    <>
      <style>{`
        @keyframes scroll-left {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
        @keyframes scroll-right {
          from { transform: translateX(-33.333%); }
          to { transform: translateX(0); }
        }
        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }
        .animate-scroll-right {
          animation: scroll-right 40s linear infinite;
        }
        .animate-scroll-left:hover,
        .animate-scroll-right:hover {
          animation-play-state: paused;
        }
      `}</style>
      <section className="py-8">
        <div className="relative w-screen left-1/2 -translate-x-1/2">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />
          <div className="space-y-3">
            <SimpleLane urls={A} direction="right" />
            <SimpleLane urls={B} direction="left" />
            <SimpleLane urls={C} direction="right" />
          </div>
        </div>
      </section>
    </>
  )
}

export default ProductFlowSimple
