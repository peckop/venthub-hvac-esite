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
 * Resolves a category slug to its corresponding React icon component.
 * Acts as a centralized icon dictionary for HVAC categories.
 * Falls back to a generic `FanIcon` if the category slug is not explicitly mapped.
 *
 * @param categorySlug - The URL slug of the category (e.g., 'heat-recovery-units').
 * @param props - Optional properties like `className` or `size` passed directly to the underlying SVG component.
 * @returns The rendered React element for the category's icon.
 *
 * @example
 * const IconComponent = getCategoryIcon('air-curtains', { size: 24, className: 'text-blue-500' })
 * return <div>{IconComponent}</div>
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




