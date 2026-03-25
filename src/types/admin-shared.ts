/**
 * Shared types for Admin Dashboard components.
 * Part of Task 3: Component Hardening.
 */

/**
 * Table row density for dashboard views.
 */
export type Density = 'comfortable' | 'compact'

/**
 * Common data loading states for views.
 */
export enum LoadState {
  Idle,
  Loading,
  Error
}

/**
 * Standard table sorting direction.
 */
export type TableSortDir = 'asc' | 'desc'
