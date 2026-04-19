import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest'
import { trackEvent } from '../analytics'

describe('analytics trackEvent', () => {
    let warnSpy: MockInstance

    beforeEach(() => {
        // Clear global window properties between tests
        delete window.gtag
        delete window.dataLayer
        delete window.DEBUG_ANALYTICS

        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        vi.unstubAllEnvs()
    })

    afterEach(() => {
        warnSpy.mockRestore()
        vi.unstubAllEnvs()
    })

    it('should fire gtag if available', () => {
        window.gtag = vi.fn()

        trackEvent('test_event', { value: 123 })

        expect(window.gtag).toHaveBeenCalledWith('event', 'test_event', { value: 123 })
        expect(warnSpy).not.toHaveBeenCalled()
    })

    it('should push to dataLayer if gtag is unavailable but dataLayer exists', () => {
        window.dataLayer = []

        trackEvent('test_layer_event', { layer: true })

        expect(window.dataLayer.length).toBe(1)
        expect(window.dataLayer[0]).toEqual({ event: 'test_layer_event', layer: true })
        expect(warnSpy).not.toHaveBeenCalled()
    })

    it('should do nothing and not warn if neither is available and not in debug mode', () => {
        vi.stubEnv('NODE_ENV', 'production')

        trackEvent('silent_event')

        expect(warnSpy).not.toHaveBeenCalled()
    })

    it('should console warn if DEBUG_ANALYTICS is true', () => {
        window.DEBUG_ANALYTICS = true

        trackEvent('debug_event', { d: 1 })

        expect(warnSpy).toHaveBeenCalledWith('[analytics]', 'debug_event', { d: 1 })
    })

    it('should console warn as fallback in development environment if undelivered', () => {
        vi.stubEnv('NODE_ENV', 'development')
        window.DEBUG_ANALYTICS = true

        trackEvent('dev_fallback', { f: 1 })

        // Should log both the direct debug and the fallback warn
        expect(warnSpy).toHaveBeenCalledWith('[analytics]', 'dev_fallback', { f: 1 })
        expect(warnSpy).toHaveBeenCalledWith('[analytics:dev-fallback]', 'dev_fallback', { f: 1 })
    })

    it('should swallow exceptions without throwing', () => {
        // Cause an exception by making dataLayer an object with a getter that throws
        Object.defineProperty(window, 'dataLayer', {
            get: () => { throw new Error('Boom') },
            configurable: true
        })

        expect(() => trackEvent('crash_event')).not.toThrow()
    })
})
