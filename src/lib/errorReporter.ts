
const manualReporter: ((err: unknown, context?: Record<string, unknown>) => void) | null = null;

export function reportError(err: unknown, context?: Record<string, unknown>) {
  if (manualReporter) {
    manualReporter(err, context);
  } else if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    // Fallback if not installed, but only noisy in dev
    console.warn('[errorReporter] reportError called before install:', err, context);
  }
}





