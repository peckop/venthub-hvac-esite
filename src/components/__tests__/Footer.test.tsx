import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import Footer from '../Footer'

vi.mock('../i18n/I18nProvider', () => ({
  useI18n: () => ({
    t: (k: string) => k
  })
}))

vi.mock('../../contexts/CategoryContext', () => ({
  useCategories: () => ({
    categories: []
  })
}))

describe('Footer', () => {
  it('should render with the min-h-hvac-section class for CLS prevention', () => {
    const { container } = render(<Footer />)
    const footerElement = container.querySelector('footer')
    expect(footerElement).not.toBeNull()
    expect(footerElement?.className).toContain('min-h-hvac-section')
  })
})
