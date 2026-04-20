// three-setup.ts - No strict disables
import * as THREE from 'three'
import { createTimerClock } from '@/utils/three-utils'

/**
 * Global Three.js Setup & Shims
 * This module addresses deprecations and compatibility issues across the entire application.
 */

// 1. Resolve deprecation warnings and known clutter.
if (typeof window !== 'undefined') {
    const originalWarn = console.warn;
     
    console.warn = (...args: unknown[]) => {
        const msg = typeof args[0] === 'string' ? args[0] : '';
        
        // Filter out known harmless deprecations and clutter
        if (msg.includes('THREE.Clock: This module has been deprecated') ||
            msg.includes('use THREE.Timer instead') ||
            msg.includes('PCFSoftShadowMap has been deprecated') ||
            msg.includes('Detected scroll-behavior: smooth') ||
            msg.includes('Next.js will no longer automatically disable smooth scrolling')) {
            return;
        }
        
        originalWarn.apply(console, args);
    };

    // 2. Attempt to shim THREE.Clock for functionality if possible.
    try {
        if ('Clock' in THREE) {
            const clock = THREE.Clock;
            if (clock && typeof clock === 'function' && !('__shimmed' in clock)) {
                const OriginalClock = clock;
                const SilentClock = function() {
                    return createTimerClock();
                };

                SilentClock.prototype = OriginalClock.prototype;
                Object.defineProperty(SilentClock, '__shimmed', { value: true, writable: true, configurable: true });

                Object.defineProperty(THREE, 'Clock', {
                    value: SilentClock,
                    configurable: true,
                    writable: true,
                    enumerable: true
                });
            }
        }
    } catch {
        // Fallback handled by the console interceptor above.
    }
}

export { THREE };
