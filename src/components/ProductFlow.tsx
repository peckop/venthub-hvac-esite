import React, { useEffect, useMemo, useState, startTransition } from 'react'
import { fetchHomeProducts, LiteProduct } from '../lib/productsApi'
import TickerLane from './TickerLane'
import TickerCardLane from './TickerCardLane'

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
  const [items, setItems] = useState<LiteProduct[]>([])
  const [allItems, setAllItems] = useState<LiteProduct[]>([])
  const [loading, setLoading] = useState(true)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        setLoading(true)
        const { featured, list } = await fetchHomeProducts(36)
        const merged = [...featured, ...list]
const map = new Map<string, LiteProduct>()
        merged.forEach(p => {
          if (!p.image_url) return
          map.set(p.id, p as LiteProduct)
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

/* Splide tabanlı akış kullanıldığı için eski Lane kaldırıldı */


const ProductFlow: React.FC = () => {
  const { items, allItems, loading, reduced } = useProductsWithImages()
  const urls = useMemo(() => items.map(p => p.image_url!).filter(Boolean), [items])
  const isCoarse = (() => { try { return window.matchMedia('(pointer: coarse)').matches } catch { return false } })()
  const rotateProducts = (arr: LiteProduct[], n: number) => {
    if (!arr.length) return arr
    const k = ((n % arr.length) + arr.length) % arr.length
    return arr.slice(k).concat(arr.slice(0, k))
  }
  // Her şeritte aynı listeyi farklı başlangıç ofseti ile kullan: boş şerit kalmasın
  const AProds = items
  const BProds = rotateProducts(items, Math.floor(items.length / 3))
  const CProds = rotateProducts(items, Math.floor((2 * items.length) / 3))

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
                <img key={i} src={src as string} alt="product" loading="lazy" decoding="async" className="rounded-xl object-cover h-24 w-[160px] sm:w-[180px] md:w-[200px] bg-gray-100 border border-light-gray" />
              ) : (
                <div key={i} className="rounded-xl h-24 w-full bg-gradient-to-br from-gray-200 to-gray-100 border border-light-gray animate-pulse" />
              )
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!loading && items.length === 0 && allItems.length === 0) {
    return (
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-2xl border border-light-gray bg-white p-8">
            <p className="text-sm text-steel-gray">Ürün akışı şu anda yüklenemedi. Lütfen sayfayı yenileyin.</p>
          </div>
        </div>
      </section>
    )
  }

  if (urls.length === 0) {
    // Görsel yoksa: ürün kartlarıyla Splide AutoScroll ticker
    const { A: FA, B: FB, C: FC } = (() => {
      const A: LiteProduct[] = [], B: LiteProduct[] = [], C: LiteProduct[] = []
      allItems.forEach((p, i) => {
        if (i % 3 === 0) A.push(p)
        else if (i % 3 === 1) B.push(p)
        else C.push(p)
      })
      return { A, B, C }
    })()

    return (
      <section className="py-10">
        <div className="relative w-screen left-1/2 -translate-x-1/2">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
          <div className="space-y-4">
            <TickerCardLane items={FA} speed={isCoarse ? 0.35 : 1.0} gap={14} width={300} height={140} pauseOnHover />
            <TickerCardLane items={FB} speed={isCoarse ? -0.45 : -1.2} gap={14} width={300} height={140} pauseOnHover />
            <TickerCardLane items={FC} speed={isCoarse ? 0.3 : 0.9} gap={14} width={300} height={140} pauseOnHover />
          </div>
        </div>
      </section>
    )
  }

  const toTickerItems = (prods: LiteProduct[]) =>
    prods.map(p => ({ src: p.image_url!, href: `/product/${p.id}` as const, alt: p.name }))

  return (
    <section className="py-8">
      <div className="relative w-screen left-1/2 -translate-x-1/2">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
        <div className="space-y-3">
          {/* Üst (daha yavaş, okunabilir geçiş) */}
          <TickerLane items={toTickerItems(AProds)} speed={isCoarse ? 0.35 : 1.0} gap={14} itemWidth={220} itemHeight={128} pauseOnHover />
          {/* Orta (ters yön, biraz daha hızlı) */}
          <TickerLane items={toTickerItems(BProds)} speed={isCoarse ? -0.45 : -1.2} gap={14} itemWidth={220} itemHeight={128} pauseOnHover />
          {/* Alt (en yavaş, görsel ritim farklılığı) */}
          <TickerLane items={toTickerItems(CProds)} speed={isCoarse ? 0.3 : 0.9} gap={14} itemWidth={220} itemHeight={128} pauseOnHover />
        </div>
      </div>
    </section>
  )
}

export default ProductFlow

