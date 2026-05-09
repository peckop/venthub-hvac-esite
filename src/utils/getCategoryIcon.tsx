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
 * Returns the corresponding React component icon based on a given category slug.
 * Falls back to a default FanIcon if the slug is unknown.
 *
 * @param categorySlug - The URL-friendly slug representing the category (e.g., 'fans', 'air-curtains')
 * @param props - Optional properties like `className` or `size` passed directly to the icon component
 * @returns A JSX element containing the requested SVG icon
 *
 * @example
 * const Icon = getCategoryIcon('air-purifiers', { size: 24, className: 'text-blue-500' })
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




