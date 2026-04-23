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
 * Returns an appropriate React icon component based on a given category slug.
 * If the slug is not recognized, it defaults to returning the `FanIcon`.
 *
 * @param categorySlug - The URL-friendly slug representing the product category (e.g., 'fans', 'air-curtains')
 * @param props - Optional properties like `className` or `size` to be passed to the SVG icon component
 * @returns A React component rendering the corresponding category icon
 *
 * @example
 * const Icon = getCategoryIcon('air-curtains', { size: 24, className: 'text-blue-500' });
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




