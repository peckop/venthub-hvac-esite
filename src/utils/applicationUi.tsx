import React from 'react'
import type { ApplicationAccent, ApplicationIcon } from '../config/applications'

const Svg = {
  building: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="8" width="7" height="13" rx="1"/>
      <path d="M6.5 7h0M6.5 11h0M6.5 15h0M17.5 11h0M17.5 15h0M17.5 19h0" />
    </svg>
  ),
  wind: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 8h9a3 3 0 1 0-3-3" /><path d="M3 16h13a3 3 0 1 1-3 3" /><path d="M3 12h6a3 3 0 1 0 3-3" />
    </svg>
  ),
  layers: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polygon points="12 2 3 7 12 12 21 7 12 2" /><polyline points="3 12 12 17 21 12" /><polyline points="3 17 12 22 21 17" />
    </svg>
  ),
  factory: (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 21V8l6 4V8l6 4V8l6 4v9H3z" />
    </svg>
  )
}

/**
 * Resolves the appropriate SVG icon component for a given application icon identifier.
 *
 * @param icon - The specific application icon key (e.g., 'building', 'wind').
 * @param size - The size of the icon in pixels (defaults to 18).
 * @returns The corresponding JSX SVG element, or null if the icon is unrecognized.
 *
 * @example
 * const WindIcon = iconFor('wind', 24);
 */
export function iconFor(icon: ApplicationIcon, size = 18) {
  switch (icon) {
    case 'building':
      return Svg.building(size)
    case 'wind':
      return Svg.wind(size)
    case 'layers':
      return Svg.layers(size)
    case 'factory':
      return Svg.factory(size)
    default:
      return null
  }
}

/**
 * Maps an application accent color key to its corresponding Tailwind CSS background overlay class.
 * Provides a translucent gradient overlay commonly used for application cards.
 *
 * @param accent - The application accent color key (e.g., 'blue', 'emerald').
 * @returns A Tailwind CSS class string representing a gradient from the accent color.
 *
 * @example
 * const overlayClass = accentOverlayClass('emerald'); // returns "from-emerald-500/10"
 */
export function accentOverlayClass(accent: ApplicationAccent) {
  switch (accent) {
    case 'blue':
      return 'from-secondary-blue/10'
    case 'navy':
      return 'from-primary-navy/10'
    case 'emerald':
      return 'from-emerald-500/10'
    case 'gray':
      return 'from-gray-400/10'
    default:
      return 'from-gray-300/10'
  }
}





