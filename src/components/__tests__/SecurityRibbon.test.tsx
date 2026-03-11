import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { SecurityRibbon } from '../SecurityRibbon'

vi.mock('../../i18n/I18nProvider', () => ({
  useI18n: () => ({ t: (key: string, args?: any) => `${key} ${JSON.stringify(args || {})}` })
}))

describe('SecurityRibbon', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders default props correctly', () => {
    render(<SecurityRibbon />)

    expect(screen.getByText(/checkout.securePaymentBrand/)).toBeInTheDocument()
    expect(screen.getByText(/Venthub HVAC/)).toBeInTheDocument()
    expect(screen.getByText(/checkout.securePaymentProvider/)).toBeInTheDocument()
    expect(screen.getByText(/iyzico/)).toBeInTheDocument()
    expect(screen.getByText('PCI DSS')).toBeInTheDocument()
    expect(screen.getByText('3D Secure')).toBeInTheDocument()
    expect(screen.getByText('256‑bit SSL')).toBeInTheDocument()
  })

  it('renders custom props correctly', () => {
    render(<SecurityRibbon brandName="Custom Brand" providerName="Custom Provider" variant="card" />)

    expect(screen.getByText(/Custom Brand/)).toBeInTheDocument()
    expect(screen.getByText(/Custom Provider/)).toBeInTheDocument()

    // Check variant=card class (we verify it changes the base padding)
    const container = screen.getByText(/checkout.securePaymentBrand/).closest('.bg-white')
    expect(container?.className).toContain('p-3')
  })
})
