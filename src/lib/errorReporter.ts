
const manualReporter: ((err: unknown, context?: Record<string, unknown>) => void) | null = null;

/**
 * Safely reports an error to the configured manual reporter (if any).
 * Acts as a noisy fallback in development mode if no reporter is installed,
 * but fails silently in production to prevent crashing the application.
 *
 * @param err - The error object or unknown value to report
 * @param context - Optional metadata/context surrounding the error
 * @returns void
 *
 * @example
 * try {
 *   throw new Error('Something went wrong');
 * } catch (e) {
 *   reportError(e, { userId: '123' });
 * }
 */
export function reportError(err: unknown, context?: Record<string, unknown>) {
  if (manualReporter) {
    manualReporter(err, context);
  } else if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    // Fallback if not installed, but only noisy in dev
    console.warn('[errorReporter] reportError called before install:', err, context);
  }
}





