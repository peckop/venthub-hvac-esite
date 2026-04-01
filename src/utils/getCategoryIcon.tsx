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




