/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from 'three'
import { createTimerClock } from '@/utils/three-utils'

/**
 * Global Three.js Setup & Shims
 * This module addresses deprecations and compatibility issues across the entire application.
 */

// 1. Resolve "THREE.Clock" deprecation warnings.
// Since THREE.Clock is often a read-only export in ESM/Webpack environments,
// we cannot always shim it by direct assignment.
if (typeof window !== 'undefined') {
    // A. Intercept console.warn to silence the "Clock deprecated" message.
    // This is the most reliable way to stop the "pollution" of the console 
    // from internal @react-three/fiber usage that we cannot easily control.
     
    const originalWarn = console.warn;
     
    console.warn = (...args: unknown[]) => {
        if (typeof args[0] === 'string' && 
           (args[0].includes('THREE.Clock: This module has been deprecated') ||
            args[0].includes('use THREE.Timer instead'))) {
            return;
        }
        originalWarn.apply(console, args as any);
    };

    // B. Attempt to shim THREE.Clock for functionality if possible.
    // If it fails due to read-only property, we gracefully catch it.
    try {
        if ((THREE as any).Clock && !(THREE as any).Clock.__shimmed) {
            const OriginalClock = THREE.Clock;
            const SilentClock = function(this: any) {
                // If it's a constructor call, return our shimmed object.
                return createTimerClock();
            } as any;
            
            SilentClock.prototype = OriginalClock.prototype;
            SilentClock.__shimmed = true;

            // We use defineProperty to try to overcome non-writable settings if possible,
            // though it usually fails in strictly compliant ESM.
            Object.defineProperty(THREE, 'Clock', {
                value: SilentClock,
                configurable: true,
                writable: true,
                enumerable: true
            });
        }
    } catch {
        // Fallback: If we can't shim the constructor, we've already silenced the warning above.
        // The components will continue to use the original Clock silently.
        // eslint-disable-next-line no-console
        console.debug('Three-setup: Could not shim Clock globally (read-only), using console intercept instead.');
    }
}

// 2. Resolve PCFSoftShadowMap & WebGLShadowMap deprecations if needed.
if (typeof window !== 'undefined') {
    // In r183, constants are still available but warn. 
    // The console interceptor above will also catch these if they mention Timer/Clock.
    // If they have different warning text, we can add them to the filter.
}

export { THREE };
