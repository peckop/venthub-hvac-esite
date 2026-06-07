import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomeSinevizyon from '../HomeSinevizyon'
import CinematicProductShowcase from '../CinematicProductShowcase'

// Mock useI18n hook to prevent translation dependency errors
vi.mock('../../../i18n/I18nProvider', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}))

describe('Animation Performance & GPU-friendly Transforms', () => {
  it('should verify that HomeSinevizyon scan lines do not use layout-triggering top style but use GPU-friendly CSS classes', () => {
    const { container } = render(<HomeSinevizyon />)
    
    // Find all scan line elements by the Tailwind animation class
    const scanLines = container.querySelectorAll('.animate-scan-slow')
    expect(scanLines.length).toBeGreaterThan(0)
    
    scanLines.forEach((element) => {
      const htmlElement = element as HTMLElement
      // The scan line should not have any inline 'top' animation or styling
      expect(htmlElement.style.top).toBeFalsy()
      
      // Verify it has the Tailwind animation class which uses transform: translateY
      expect(htmlElement.className).toContain('animate-scan-slow')
    })
  })

  it('should verify that CinematicProductShowcase scan line does not use top property and instead uses y/transform', () => {
    render(<CinematicProductShowcase />)
    
    const scanLine = screen.getByTestId('cinematic-scan-line')
    expect(scanLine).toBeDefined()
    
    // Check raw style attribute
    const styleAttr = scanLine.getAttribute('style') || ''
    
    // It must not contain top property
    expect(styleAttr).not.toContain('top')
    
    // In framer-motion (in jsdom), the initial y value ['-100%', '0%', '-100%'] is translated into translateY(-100%) inside the transform style
    expect(styleAttr).toContain('translateY')
  })
})
