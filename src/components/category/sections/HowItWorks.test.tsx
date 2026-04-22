import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HowItWorks from './HowItWorks'
import { testA11y } from '@/utils/testA11y'
import React from 'react'

// Mock IntersectionObserver for useScrollAnimation
beforeAll(() => {
  class MockIntersectionObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

describe('HowItWorks', () => {
  it('should have no accessibility violations in initial state', async () => {
    const { container } = render(<HowItWorks />)
    
    const results = await testA11y(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations after expanding a step', async () => {
    const { container } = render(<HowItWorks />)
    
    // Find all step buttons
    const buttons = screen.getAllByRole('button')
    
    // Click the second button (index 1) since first is active by default
    fireEvent.click(buttons[1])
    
    const results = await testA11y(container)
    expect(results).toHaveNoViolations()
  })
})
