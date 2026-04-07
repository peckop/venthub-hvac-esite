/**
 * Generates a unique, collision-resistant identifier.
 * Uses globalThis.crypto.randomUUID() when available (Secure Contexts).
 * Provides a fallback using timestamp and Math.random() for non-secure contexts.
 */
export const generateId = (): string => {
    try {
        if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
            return globalThis.crypto.randomUUID();
        }
        // Safely check for crypto without triggering TS2774 on global crypto definition
        const gCrypto = (globalThis as unknown as { crypto?: { randomUUID?: () => string } }).crypto;
        if (gCrypto?.randomUUID) {
            return gCrypto.randomUUID();
        }
    } catch {
        // Fallback if crypto.randomUUID fails or is unavailable
    }

    // Fallback for non-secure contexts
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};
