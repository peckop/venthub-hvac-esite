import * as THREE from 'three'

/**
 * A THREE.Clock-compatible shim using the modern THREE.Timer.
 * This prevents deprecation warnings from THREE.Clock while maintaining
 * compatibility with @react-three/fiber's state.clock.
 */
export const createTimerClock = () => {
    // Check if Timer exists (it should since Three.js r163+)
    // In r183, Clock is deprecated, so Timer is the way forward.
    const timer = new THREE.Timer()
    const clockShim = timer as typeof timer & { getDelta: () => number; getElapsedTime: () => number; isClock: boolean; start: () => void; stop: () => void; elapsedTime?: number }

    // @react-three/fiber calls state.clock.getDelta() in its loop.
    // We must update the timer in getDelta to keep it ticking.
    clockShim.getDelta = () => {
        timer.update()
        return timer.getDelta()
    }

    // state.clock.getElapsedTime() is often used for animation time.
    clockShim.getElapsedTime = () => timer.getElapsed()

    // Identify as a clock so R3F doesn't complain if it does any checks
    clockShim.isClock = true

    // Define elapsedTime property as it's directly read in some r3f logic/shaders
    Object.defineProperty(clockShim, 'elapsedTime', {
        get: () => timer.getElapsed(),
        enumerable: true,
        configurable: true
    })

    // Standard clock methods that might be called
    clockShim.start = () => { /* Timer is usually auto-started or handled via update */ }
    clockShim.stop = () => { /* Implement if needed */ }

    return clockShim
}
