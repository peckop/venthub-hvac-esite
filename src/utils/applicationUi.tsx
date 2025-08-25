import React from 'react'
import { Building2, Wind, Layers, Factory } from 'lucide-react'
import type { ApplicationAccent, ApplicationIcon } from '../config/applications'

export function iconFor(icon: ApplicationIcon, size = 18) {
  switch (icon) {
    case 'building':
      return <Building2 size={size} />
    case 'wind':
      return <Wind size={size} />
    case 'layers':
      return <Layers size={size} />
    case 'factory':
      return <Factory size={size} />
    default:
      return null
  }
}

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

export function gridColsClass(count: number) {
  // Avoid dynamic class names for Tailwind purge; map to known classes
  if (count >= 4) return 'grid grid-cols-1 md:grid-cols-4 gap-4'
  if (count === 3) return 'grid grid-cols-1 md:grid-cols-3 gap-4'
  if (count === 2) return 'grid grid-cols-1 md:grid-cols-2 gap-4'
  return 'grid grid-cols-1 gap-4'
}

