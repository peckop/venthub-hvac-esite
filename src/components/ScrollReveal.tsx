'use client'

import React from 'react'

import useScrollAnimation, { scrollAnimationClasses } from '../hooks/useScrollAnimation'

interface ScrollRevealProps {
  children: React.ReactNode
  animation: 'fadeUp' | 'scaleIn' | 'fadeIn' | 'slideLeft'
  className?: string
  staggerIndex?: number
  as?: 'div' | 'section' | 'h1' | 'p'
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({ 
  children, 
  animation, 
  className = '', 
  staggerIndex,
  as: Component = 'div'
}) => {
  const [ref, visible] = useScrollAnimation<HTMLElement>({ threshold: 0.1 })
  const animClass = scrollAnimationClasses[animation](visible)
  const style = staggerIndex !== undefined ? scrollAnimationClasses.staggerChild(staggerIndex) : undefined

  return (
    <Component 
      ref={ref as React.Ref<HTMLDivElement>} 
      className={`${animClass} ${className}`} 
      style={style}
    >
      {children}
    </Component>
  )
}
