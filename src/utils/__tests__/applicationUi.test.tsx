import { render } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { accentOverlayClass,iconFor } from '../applicationUi'

describe('applicationUi utilities', () => {
  describe('iconFor', () => {
    it('should return the correct SVG node for "building"', () => {
      const result = iconFor('building', 24)
      expect(result).not.toBeNull()
      const { container } = render(<>{result}</>)
      const svg = container.querySelector('svg')
      expect(svg).not.toBeNull()
      expect(svg?.getAttribute('width')).toBe('24')
    })

    it('should return the correct SVG node for "wind"', () => {
      const result = iconFor('wind')
      expect(result).not.toBeNull()
      const { container } = render(<>{result}</>)
      expect(container.querySelector('svg')).not.toBeNull()
    })

    it('should return the correct SVG node for "layers"', () => {
      const result = iconFor('layers')
      expect(result).not.toBeNull()
      const { container } = render(<>{result}</>)
      expect(container.querySelector('svg')).not.toBeNull()
    })

    it('should return the correct SVG node for "factory"', () => {
      const result = iconFor('factory')
      expect(result).not.toBeNull()
      const { container } = render(<>{result}</>)
      expect(container.querySelector('svg')).not.toBeNull()
    })

    it('should return null for unknown icon types', () => {
      // @ts-expect-error Testing invalid input
      expect(iconFor('unknown-icon')).toBeNull()
    })
  })

  describe('accentOverlayClass', () => {
    it('should return the correct class for "blue"', () => {
      expect(accentOverlayClass('blue')).toBe('from-secondary-blue/10')
    })

    it('should return the correct class for "navy"', () => {
      expect(accentOverlayClass('navy')).toBe('from-primary-navy/10')
    })

    it('should return the correct class for "emerald"', () => {
      expect(accentOverlayClass('emerald')).toBe('from-emerald-500/10')
    })

    it('should return the correct class for "gray"', () => {
      expect(accentOverlayClass('gray')).toBe('from-gray-400/10')
    })

    it('should return the default class for unknown accents', () => {
      // @ts-expect-error Testing invalid input
      expect(accentOverlayClass('unknown')).toBe('from-gray-300/10')
    })
  })
})
