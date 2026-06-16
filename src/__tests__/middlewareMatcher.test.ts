import { describe, expect,it } from 'vitest'

import { config } from '../middleware'

describe('Middleware Matcher Config', () => {
  it('should have a matcher array with at least one pattern', () => {
    expect(config.matcher).toBeDefined()
    expect(Array.isArray(config.matcher)).toBe(true)
    expect(config.matcher.length).toBeGreaterThan(0)
  })

  it('should correctly bypass fonts, images, and other static assets, but match page routes', () => {
    const matcherPattern = config.matcher[0]
    expect(typeof matcherPattern).toBe('string')

    // Next.js custom matcher pattern (statik asset uzantıları locale-redirect'ten muaf):
    // '/((?!_next/static|_next/image|favicon.ico|images|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|ttf|woff|woff2|otf|hdr|exr|glb|gltf|mp4|webm)).*)'
    // Let's compile it into a standard JS RegExp that tests the path (starting with /)
    const regexSource = matcherPattern.slice(1) // Remove leading slash to convert to RegExp source
    const regex = new RegExp(`^/${regexSource}$`)

    // Test cases that SHOULD match (middleware should run on these routes)
    const matchCases = [
      '/',
      '/products',
      '/products/123',
      '/admin',
      '/admin/dashboard',
      '/tr/products',
      '/en/admin',
      '/about',
      '/contact',
      '/api/products',
    ]

    // Test cases that SHOULD NOT match (middleware should be bypassed for these)
    const bypassCases = [
      '/_next/static/chunks/main.js',
      '/_next/static/css/global.css',
      '/_next/image?url=logo.png',
      '/favicon.ico',
      '/images/logo.png',
      '/images/product-1.jpg',
      '/fonts/inter.woff2',
      '/fonts/roboto.ttf',
      '/logo.svg',
      '/hero.webp',
      '/font.otf',
      // 3D / env asset'leri — locale-redirect prod bug'ının regression guard'ı
      '/env/city_256.hdr',
      '/env/studio.exr',
      '/models/fan.glb',
      '/models/fan.gltf',
      // eklenen image/video uzantıları
      '/hero.jpeg',
      '/icon.gif',
      '/hero.avif',
      '/promo.mp4',
      '/promo.webm',
    ]

    for (const testPath of matchCases) {
      const isMatch = regex.test(testPath)
      expect(isMatch).toBe(true)
    }

    for (const testPath of bypassCases) {
      const isMatch = regex.test(testPath)
      expect(isMatch).toBe(false)
    }
  })
})
