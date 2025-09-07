import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import ProductFlow from './ProductFlow'

const ProductFlowWrapper: React.FC = () => {
  const [isActive, setIsActive] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const location = useLocation()
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Navigation değiştiğinde ProductFlow'u devre dışı bırak
  useEffect(() => {
    setIsActive(false)
    const timer = setTimeout(() => {
      setIsActive(true)
    }, 100) // Navigation tamamlandıktan sonra tekrar aktif et
    
    return () => clearTimeout(timer)
  }, [location.pathname])
  
  // Intersection Observer - sadece görünür olduğunda render et
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Sadece tam görünür/görünmez olduğunda değiştir, threshold farkı ile
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        } else if (!entry.isIntersecting && entry.boundingClientRect.bottom < 0) {
          // Sadece tamamen yukarı çıktığında kapat
          setIsVisible(false)
        }
      },
      { threshold: [0, 0.1] }
    )
    
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    
    return () => observer.disconnect()
  }, [isVisible])
  
  // Link tıklamalarını dinle ve ProductFlow'u hemen durdur
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      if (link && link.href && !link.href.startsWith('#')) {
        setIsActive(false)
      }
    }
    
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])
  
  // Sadece aktif ve görünürse ProductFlow'u render et
  if (!isActive || !isVisible) {
    return <div ref={containerRef} className="py-8 min-h-[200px]" />
  }
  
  return (
    <div ref={containerRef}>
      <ProductFlow />
    </div>
  )
}

export default ProductFlowWrapper
