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
    case 'fanlar':
      return <FanIcon {...props} />
    case 'isi-geri-kazanim-cihazlari':
      return <HeatRecoveryIcon {...props} />
    case 'hava-perdeleri':
      return <AirCurtainIcon {...props} />
    case 'nem-alma-cihazlari':
      return <DehumidifierIcon {...props} />
    case 'hava-temizleyiciler':
      return <AirPurifierIcon {...props} />
    case 'flexible-hava-kanallari':
      return <FlexibleDuctIcon {...props} />
    case 'hiz-kontrolu-cihazlari':
      return <SpeedControlIcon {...props} />
    case 'aksesuarlar':
      return <AccessoriesIcon {...props} />
    default:
      return <FanIcon {...props} />
  }
}

