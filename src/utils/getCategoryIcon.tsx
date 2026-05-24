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
 * Fallbacks to a generic FanIcon if the slug is not recognized.
 *
 * @param categorySlug - The URL-friendly identifier for the category
 * @param props - Optional properties (like className or size) to pass to the SVG component
 * @returns A React element representing the category icon
 *
 * @example
 * <div className="icon">
 *   {getCategoryIcon('air-curtains', { size: 24, className: 'text-blue-500' })}
 * </div>
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




