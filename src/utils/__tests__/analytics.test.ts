import { afterEach, beforeEach, describe, expect, it, type MockInstance,vi } from 'vitest'

import { CONSENT_STORAGE_KEY, CONSENT_VERSION, LEGACY_CONSENT_KEY } from '@/lib/consent'

import { trackEvent } from '../analytics'

/**
 * SÖZLEŞME DEĞİŞTİ (T020-VH): `trackEvent` artık analitik rızası olmadan HİÇBİR ŞEY göndermez.
 * Aşağıdaki "teslimat" testleri bu yüzden önce rıza kurar — eskiden rıza diye bir kavram yoktu.
 * Kapının kendisi ayrı bir describe bloğunda doğrulanır.
 */
const grantAnalytics = () =>
  window.localStorage.setItem(
    CONSENT_STORAGE_KEY,
    JSON.stringify({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: false,
      version: CONSENT_VERSION,
      decidedAt: '2026-08-15T00:00:00.000Z',
    }),
  )

describe('analytics trackEvent', () => {
    let warnSpy: MockInstance

    beforeEach(() => {
        // Clear global window properties between tests
        delete window.gtag
        delete window.dataLayer
        delete window.DEBUG_ANALYTICS

        window.localStorage.clear()
        grantAnalytics()

        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        vi.unstubAllEnvs()
    })

    afterEach(() => {
        warnSpy.mockRestore()
        vi.unstubAllEnvs()
        window.localStorage.clear()
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

describe('analytics trackEvent · rıza kapısı (T020-VH)', () => {
    beforeEach(() => {
        delete window.gtag
        delete window.dataLayer
        delete window.DEBUG_ANALYTICS
        window.localStorage.clear()
    })

    afterEach(() => {
        window.localStorage.clear()
    })

    it('karar verilmemişse HİÇBİR ŞEY göndermez (opt-in — sessiz kabul yok)', () => {
        window.gtag = vi.fn()
        window.dataLayer = []

        trackEvent('should_not_fire')

        expect(window.gtag).not.toHaveBeenCalled()
        expect(window.dataLayer.length).toBe(0)
    })

    it('analitik reddedildiyse göndermez (diğer kategoriler açık olsa bile)', () => {
        window.localStorage.setItem(
            CONSENT_STORAGE_KEY,
            JSON.stringify({
                necessary: true, functional: true, analytics: false, marketing: true,
                version: CONSENT_VERSION, decidedAt: '2026-08-15T00:00:00.000Z',
            }),
        )
        window.gtag = vi.fn()

        trackEvent('should_not_fire')

        expect(window.gtag).not.toHaveBeenCalled()
    })

    it('eski sürüm damgalı rıza geçersizdir — metin değişince yeniden sorulur', () => {
        window.localStorage.setItem(
            CONSENT_STORAGE_KEY,
            JSON.stringify({
                necessary: true, functional: true, analytics: true, marketing: true,
                version: CONSENT_VERSION - 1, decidedAt: '2026-01-01T00:00:00.000Z',
            }),
        )
        window.gtag = vi.fn()

        trackEvent('should_not_fire')

        expect(window.gtag).not.toHaveBeenCalled()
    })

    it("eski ikili bayrak 'accepted' göç eder ve gönderime izin verir", () => {
        window.localStorage.setItem(LEGACY_CONSENT_KEY, 'accepted')
        window.gtag = vi.fn()

        trackEvent('legacy_accepted')

        expect(window.gtag).toHaveBeenCalledWith('event', 'legacy_accepted', {})
    })

    it("eski ikili bayrak 'rejected' göç eder ve gönderimi engeller", () => {
        window.localStorage.setItem(LEGACY_CONSENT_KEY, 'rejected')
        window.gtag = vi.fn()

        trackEvent('legacy_rejected')

        expect(window.gtag).not.toHaveBeenCalled()
    })
})
