import { describe, expect, it, vi } from 'vitest'

import { SITE_URL } from '../../config/siteUrl'
import { getAbsoluteAssetUrl } from '../pdfAssets'

describe('getAbsoluteAssetUrl', () => {
  it('should prepend browser origin when window is defined', () => {
    const mockWindow = {
      location: {
        origin: 'https://venthub-hvac.com',
      },
    }
    vi.stubGlobal('window', mockWindow)

    const url = getAbsoluteAssetUrl('/fonts/Roboto-Regular.ttf')
    expect(url).toBe('https://venthub-hvac.com/fonts/Roboto-Regular.ttf')

    vi.unstubAllGlobals()
  })

  it('should use SITE_URL when window is undefined', () => {
    vi.stubGlobal('window', undefined)

    const url = getAbsoluteAssetUrl('/fonts/Roboto-Regular.ttf')
    const expected = new URL('/fonts/Roboto-Regular.ttf', SITE_URL).toString()
    expect(url).toBe(expected)

    vi.unstubAllGlobals()
  })
})
