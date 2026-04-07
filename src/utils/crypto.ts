/**
 * Centralized unique ID generation.
 * Uses crypto.randomUUID() when available, falls back to timestamp-based ID.
 */
export function generateId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (_unused) {
    // Fallback below
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
