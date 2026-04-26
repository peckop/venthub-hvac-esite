import * as THREE from 'three'

/**
 * A THREE.Clock-compatible shim using the modern THREE.Timer.
 * This prevents deprecation warnings from THREE.Clock while maintaining
 * compatibility with @react-three/fiber's state.clock.
 */
export interface ClockShim extends THREE.Timer {
    getDelta: () => number;
    getElapsedTime: () => number;
    isClock: boolean;
    start: () => void;
    stop: () => void;
    elapsedTime?: number;
}

/**
 * Creates and returns a THREE.Clock-compatible object backed by the newer THREE.Timer.
 * This bridges the gap for libraries like @react-three/fiber that expect a Clock interface,
 * avoiding deprecation warnings while ensuring smooth animation updates.
 *
 * @returns A clock shim instance implementing both THREE.Timer and essential THREE.Clock properties/methods.
 *
 * @example
 * const customClock = createTimerClock();
 * // Can be passed to Canvas or used in animation loops
 * const delta = customClock.getDelta();
 */
export const createTimerClock = (): ClockShim => {
    // Check if Timer exists (it should since Three.js r163+)
    // In r183, Clock is deprecated, so Timer is the way forward.
    const timer = new THREE.Timer()
    const clockShim = timer as ClockShim

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
