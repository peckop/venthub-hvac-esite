import React from 'react'
import { 
  FanIcon,
  HeatRecoveryIcon,
  AirCurtainIcon,
  DehumidifierIcon,
  AirPurifierIcon,
  FlexibleDuctIcon,
  SpeedControlIcon,
  AccessoriesIcon,
} from '../components/HVACIcons'

type IconProps = { className?: string; size?: number }

/**
 * Maps a category slug to its corresponding SVG icon component.
 * Provides a fallback to `FanIcon` if the slug is not explicitly mapped.
 *
 * @param categorySlug - The URL-friendly slug of the category (e.g., 'fans', 'air-curtains').
 * @param props - Optional properties (like className or size) to pass directly to the SVG component.
 * @returns The instantiated JSX SVG icon component.
 *
 * @example
 * const MyIcon = getCategoryIcon('heat-recovery-units', { size: 24, className: 'text-blue-500' });
 */
export const getCategoryIcon = (categorySlug: string, props: IconProps = {}) => {
  switch (categorySlug) {
    case 'fans':
      return <FanIcon {...props} />
    case 'heat-recovery-units':
      return <HeatRecoveryIcon {...props} />
    case 'air-curtains':
      return <AirCurtainIcon {...props} />
    case 'dehumidifiers':
      return <DehumidifierIcon {...props} />
    case 'air-purifiers':
      return <AirPurifierIcon {...props} />
    case 'flexible-air-ducts':
      return <FlexibleDuctIcon {...props} />
    case 'speed-controllers':
      return <SpeedControlIcon {...props} />
    case 'accessories':
      return <AccessoriesIcon {...props} />
    default:
      return <FanIcon {...props} />
  }
}




