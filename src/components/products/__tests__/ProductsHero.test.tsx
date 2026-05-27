import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProductsHero from '../ProductsHero'

vi.mock('../../i18n/I18nProvider', () => ({
  useI18n: () => ({
    t: (k: string) => k
  })
}))

describe('ProductsHero', () => {
  it('should have focus-within classes on the search bar container and no ring on input', () => {
    const onSearchChange = vi.fn()
    render(<ProductsHero searchValue="" onSearchChange={onSearchChange} />)
    
    // The search bar container is the parent of the input
    const input = screen.getByRole('searchbox')
    const container = input.parentElement
    
    expect(container?.className).toContain('focus-within:ring-2')
    expect(container?.className).toContain('focus-within:ring-cyan-400/50')
    
    // Input should not have its own focus ring to avoid duplication
    expect(input.className).not.toContain('focus-visible:ring-2')
    expect(input.className).not.toContain('focus-visible:ring-cyan-400')
  })
})
