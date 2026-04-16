/**
 * Safely converts an unknown value to a number.
 * Uses `parseFloat` for strings, meaning trailing text is ignored (e.g., `'42px'` becomes `42`).
 * Non-numeric types (null, objects, arrays, booleans) or unparseable strings return the fallback.
 *
 * @param val - The unknown value to convert
 * @param fallback - The number to return if conversion fails (defaults to 0)
 * @returns The successfully parsed number or the fallback value
 *
 * @example
 * safeNumber(42)          // returns 42
 * safeNumber('3.14')      // returns 3.14
 * safeNumber('42px')      // returns 42
 * safeNumber('invalid')   // returns 0
 * safeNumber(null, 10)    // returns 10
 */
export function safeNumber(val: unknown, fallback: number = 0): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) return parsed;
  }
  return fallback;
}

export function safeString(val: unknown, fallback: string = ''): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (val == null) return fallback;
  return fallback;
}

export function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}
