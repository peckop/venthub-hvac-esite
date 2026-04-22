/**
 * Generates a unique, collision-resistant identifier string.
 * It primarily relies on the native `crypto.randomUUID()` for cryptographically secure UUIDv4 generation.
 * If the environment lacks the Web Crypto API (e.g., non-secure HTTP contexts or older runtimes),
 * it safely falls back to a pseudo-random string based on the current timestamp and `Math.random()`.
 *
 * @returns A unique identifier string
 *
 * @example
 * const cartId = generateId();
 * console.log(cartId); // e.g., "550e8400-e29b-41d4-a716-446655440000" or "1698765432100-a1b2c3d4e"
 */
export const generateId = (): string => {
    try {
        if (typeof globalThis !== 'undefined' && typeof globalThis.crypto?.randomUUID === 'function') {
            return globalThis.crypto.randomUUID();
        }
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
    } catch {
        // Fallback if crypto.randomUUID fails or is unavailable
    }

    // Fallback for non-secure contexts
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};
