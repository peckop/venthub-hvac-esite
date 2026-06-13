/**
 * Admin DataTable kit — localStorage persistence utilities.
 *
 * SSR-safe (window guard) and resilient: every access is wrapped in try/catch
 * so a corrupt JSON payload or unavailable storage is swallowed and falls back
 * to defaults. Storage keys are namespaced as `admin:dt:<persistKey>:<facet>`.
 */
import type { Density } from '@/types/admin-shared'

const KEY_PREFIX = 'admin:dt:'
const DEFAULT_DENSITY: Density = 'comfortable'

function densityKey(persistKey: string): string {
  return `${KEY_PREFIX}${persistKey}:density`
}

function colsKey(persistKey: string): string {
  return `${KEY_PREFIX}${persistKey}:cols`
}

/**
 * Read the persisted row density. Defaults to `comfortable` when missing,
 * invalid, or unreadable.
 */
export function loadDensity(persistKey: string): Density {
  if (typeof window === 'undefined') return DEFAULT_DENSITY
  try {
    const raw = window.localStorage.getItem(densityKey(persistKey))
    if (raw === 'compact' || raw === 'comfortable') return raw
  } catch {
    /* storage unavailable or blocked — fall through to default */
  }
  return DEFAULT_DENSITY
}

/**
 * Persist the row density. Failures (quota, private mode, SSR) are swallowed.
 */
export function saveDensity(persistKey: string, density: Density): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(densityKey(persistKey), density)
  } catch {
    /* swallow — persistence is best-effort */
  }
}

/**
 * Read persisted column visibility, merged over `defaults`. When nothing is
 * stored (or it is unreadable/corrupt) the `defaults` are returned as-is.
 * Stored keys override defaults; columns absent from storage keep their
 * default visibility (so newly added columns appear by default).
 */
export function loadColumnVisibility(
  persistKey: string,
  defaults: Record<string, boolean>,
): Record<string, boolean> {
  if (typeof window === 'undefined') return { ...defaults }
  try {
    const raw = window.localStorage.getItem(colsKey(persistKey))
    if (!raw) return { ...defaults }
    const parsed: unknown = JSON.parse(raw)
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ...defaults }
    }
    const merged: Record<string, boolean> = { ...defaults }
    for (const key of Object.keys(defaults)) {
      const value = (parsed as Record<string, unknown>)[key]
      if (typeof value === 'boolean') merged[key] = value
    }
    return merged
  } catch {
    /* corrupt JSON or unreadable storage — fall back to defaults */
    return { ...defaults }
  }
}

/**
 * Persist column visibility. Failures are swallowed (best-effort).
 */
export function saveColumnVisibility(
  persistKey: string,
  visibility: Record<string, boolean>,
): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(colsKey(persistKey), JSON.stringify(visibility))
  } catch {
    /* swallow — persistence is best-effort */
  }
}
