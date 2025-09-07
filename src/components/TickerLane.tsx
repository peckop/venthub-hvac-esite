import React from 'react'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/react-splide/css'
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll'
import { Link } from 'react-router-dom'

export interface TickerItem {
  src: string
  href?: string
  alt?: string
}

export interface TickerLaneProps {
  items: TickerItem[]
  speed?: number // px/frame; negative = reverse direction
  gap?: number   // px between items
  itemWidth?: number // px
  itemHeight?: number // px
  pauseOnHover?: boolean
}

export const TickerLane: React.FC<TickerLaneProps> = ({
  items,
  speed = 1.4,
  gap = 12,
  itemWidth = 200,
  itemHeight = 120,
  pauseOnHover = false,
}) => {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <Splide
      options={{
        type: 'loop',
        drag: 'free',
        autoWidth: true,
        gap: `${gap}px`,
        arrows: false,
        pagination: false,
        keyboard: 'focused',
        // Continuous ticker
        autoScroll: {
          speed, // px/frame
          autoStart: true,
          pauseOnHover,
          pauseOnFocus: false,
        },
      }}
      extensions={{ AutoScroll }}
      aria-label="Product ticker lane"
    >
      {items.map((item, i) => (
        <SplideSlide key={i} style={{ width: itemWidth }}>
          {item.href ? (
            <Link
              to={item.href}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy rounded-xl"
              aria-label={item.alt || 'product'}
            >
              <div
                style={{
                  width: itemWidth,
                  height: itemHeight,
                  borderRadius: 12,
                  border: '1px solid #e5e7eb', // gray-200
                  boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                  background: '#f3f4f6',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={item.src}
                  alt={item.alt || ''}
                  width={itemWidth}
                  height={itemHeight}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  loading="eager"
                  decoding="async"
                />
              </div>
            </Link>
          ) : (
            <div
              style={{
                width: itemWidth,
                height: itemHeight,
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                background: '#f3f4f6',
                overflow: 'hidden',
              }}
            >
              <img
                src={item.src}
                alt={item.alt || ''}
                width={itemWidth}
                height={itemHeight}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                loading="eager"
                decoding="async"
              />
            </div>
          )}
        </SplideSlide>
      ))}
    </Splide>
  )
}

export default TickerLane
