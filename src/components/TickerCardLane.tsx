import React from 'react'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/react-splide/css'
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll'
import { Link } from 'react-router-dom'
// Lightweight product shape to avoid importing supabase module at runtime
interface Product { id: string; name: string; brand?: string | null; sku?: string | null }
import { BrandIcon } from './HVACIcons'

interface Props {
  items: Product[]
  speed?: number // px/frame; negative = reverse
  gap?: number
  width?: number
  height?: number
  pauseOnHover?: boolean
}

const TickerCardLane: React.FC<Props> = ({ items, speed = 1.4, gap = 12, width = 260, height: _height = 120, pauseOnHover = true }) => {
  if (!items || items.length === 0) return null

  return (
    <Splide
      options={{
        type: 'loop',
        drag: 'free',
        autoWidth: true,
        gap: `${gap}px`,
        arrows: false,
        pagination: false,
        autoScroll: {
          speed,
          autoStart: true,
          pauseOnHover,
          pauseOnFocus: false,
        },
      }}
      extensions={{ AutoScroll }}
      aria-label="Product cards ticker"
    >
      {items.map((p, idx) => (
        <SplideSlide key={p.id + '-' + idx} style={{ width }}>
          <Link to={`/product/${p.id}`} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy rounded-xl" aria-label={p.name}>
            <div className="h-28 sm:h-32 md:h-36 w-full rounded-xl bg-white border border-light-gray shadow-sm overflow-hidden flex items-center gap-3 px-3">
              <div className="flex-shrink-0 bg-gray-50 border border-light-gray rounded-lg p-2">
                <BrandIcon brand={p.brand} />
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-semibold text-industrial-gray group-hover:text-primary-navy line-clamp-1">{p.name}</div>
                <div className="text-xs text-steel-gray">{p.brand} • {p.sku}</div>
              </div>
            </div>
          </Link>
        </SplideSlide>
      ))}
    </Splide>
  )
}

export default TickerCardLane
