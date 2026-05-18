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
 * Returns the corresponding React component icon for a given HVAC category slug.
 *
 * Falls back to the generic FanIcon if the category slug is unknown.
 *
 * @param categorySlug - The unique string identifier for the product category (e.g., 'fans', 'air-curtains')
 * @param props - Optional properties like className and size to apply to the rendered SVG icon
 * @returns A React functional component rendering the corresponding SVG icon
 *
 * @example
 * getCategoryIcon('air-curtains', { size: 24, className: 'text-blue-500' }) // returns <AirCurtainIcon size={24} className="text-blue-500" />
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




