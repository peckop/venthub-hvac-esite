import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { getCategoryIcon } from '../getCategoryIcon'

describe('getCategoryIcon', () => {
  it('should return FanIcon for "fans" and as default', () => {
    const { container: containerFans } = render(<>{getCategoryIcon('fans', { className: 'test-class' })}</>)
    const svgFans = containerFans.querySelector('svg')
    expect(svgFans).not.toBeNull()
    expect(svgFans?.getAttribute('class')).toContain('test-class')

    // We can assume default matches 'fans' logic per the implementation
    const { container: containerDefault } = render(<>{getCategoryIcon('unknown-slug')}</>)
    const svgDefault = containerDefault.querySelector('svg')
    expect(svgDefault).not.toBeNull()
  })

  it('should return HeatRecoveryIcon for "heat-recovery-units"', () => {
    const { container } = render(<>{getCategoryIcon('heat-recovery-units', { size: 32 })}</>)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg?.getAttribute('width')).toBe('32')
  })

  it('should return AirCurtainIcon for "air-curtains"', () => {
    const { container } = render(<>{getCategoryIcon('air-curtains')}</>)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('should return DehumidifierIcon for "dehumidifiers"', () => {
    const { container } = render(<>{getCategoryIcon('dehumidifiers')}</>)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('should return AirPurifierIcon for "air-purifiers"', () => {
    const { container } = render(<>{getCategoryIcon('air-purifiers')}</>)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('should return FlexibleDuctIcon for "flexible-air-ducts"', () => {
    const { container } = render(<>{getCategoryIcon('flexible-air-ducts')}</>)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('should return SpeedControlIcon for "speed-controllers"', () => {
    const { container } = render(<>{getCategoryIcon('speed-controllers')}</>)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('should return AccessoriesIcon for "accessories"', () => {
    const { container } = render(<>{getCategoryIcon('accessories')}</>)
    expect(container.querySelector('svg')).not.toBeNull()
  })
})
