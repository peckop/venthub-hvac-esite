import React from 'react'

interface IconProps {
  className?: string
  size?: number
}

export const FanIcon: React.FC<IconProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
    <path
      d="M24 8 L28 20 L24 24 L20 20 Z"
      fill="currentColor"
    />
    <path
      d="M40 24 L28 28 L24 24 L28 20 Z"
      fill="currentColor"
    />
    <path
      d="M24 40 L20 28 L24 24 L28 28 Z"
      fill="currentColor"
    />
    <path
      d="M8 24 L20 20 L24 24 L20 28 Z"
      fill="currentColor"
    />
    <circle cx="24" cy="24" r="3" fill="currentColor" />
    <g stroke="currentColor" strokeWidth="1" opacity="0.5">
      <path d="M24 4 L24 8" />
      <path d="M35.5 12.5 L32.5 15.5" />
      <path d="M44 24 L40 24" />
      <path d="M35.5 35.5 L32.5 32.5" />
      <path d="M24 44 L24 40" />
      <path d="M12.5 35.5 L15.5 32.5" />
      <path d="M4 24 L8 24" />
      <path d="M12.5 12.5 L15.5 15.5" />
    </g>
  </svg>
)

export const HeatRecoveryIcon: React.FC<IconProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="8" y="16" width="32" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <rect x="12" y="20" width="24" height="8" fill="currentColor" opacity="0.2" />
    <path d="M6 24 L12 24" stroke="#38BDF8" strokeWidth="2" markerEnd="url(#arrowBlue)" />
    <path d="M36 24 L42 24" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrowOrange)" />
    <path d="M24 12 L24 16" stroke="currentColor" strokeWidth="1" />
    <path d="M24 32 L24 36" stroke="currentColor" strokeWidth="1" />
    <text x="24" y="26" textAnchor="middle" fontSize="8" fill="currentColor">HRV</text>
    <defs>
      <marker id="arrowBlue" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
        <polygon points="0,0 6,2 0,4" fill="#38BDF8" />
      </marker>
      <marker id="arrowOrange" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
        <polygon points="0,0 6,2 0,4" fill="#F59E0B" />
      </marker>
    </defs>
  </svg>
)

export const AirCurtainIcon: React.FC<IconProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="8" y="8" width="32" height="6" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.2" />
    <g stroke="#38BDF8" strokeWidth="1.5" opacity="0.8">
      <path d="M12 16 L12 36" />
      <path d="M16 18 L16 38" />
      <path d="M20 16 L20 36" />
      <path d="M24 18 L24 38" />
      <path d="M28 16 L28 36" />
      <path d="M32 18 L32 38" />
      <path d="M36 16 L36 36" />
    </g>
    <g stroke="currentColor" strokeWidth="1" opacity="0.6">
      <path d="M14 20 L10 22" />
      <path d="M18 24 L14 26" />
      <path d="M22 20 L18 22" />
      <path d="M26 24 L22 26" />
      <path d="M30 20 L26 22" />
      <path d="M34 24 L30 26" />
      <path d="M38 20 L34 22" />
    </g>
  </svg>
)

export const DehumidifierIcon: React.FC<IconProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="12" y="16" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
    <rect x="16" y="20" width="16" height="4" rx="1" fill="currentColor" opacity="0.3" />
    <rect x="16" y="26" width="12" height="2" rx="1" fill="currentColor" opacity="0.5" />
    <rect x="16" y="30" width="8" height="2" rx="1" fill="currentColor" opacity="0.5" />
    <circle cx="32" cy="34" r="2" fill="#38BDF8" opacity="0.7" />
    <circle cx="28" cy="36" r="1.5" fill="#38BDF8" opacity="0.6" />
    <circle cx="35" cy="37" r="1" fill="#38BDF8" opacity="0.5" />
    <path d="M20 10 Q22 8 24 10 Q26 12 24 14 Q22 12 20 10" fill="#38BDF8" opacity="0.4" />
    <path d="M28 8 Q30 6 32 8 Q34 10 32 12 Q30 10 28 8" fill="#38BDF8" opacity="0.4" />
  </svg>
)

export const AirPurifierIcon: React.FC<IconProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="14" y="12" width="20" height="28" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
    <rect x="18" y="16" width="12" height="2" rx="1" fill="currentColor" opacity="0.6" />
    <rect x="18" y="20" width="12" height="2" rx="1" fill="currentColor" opacity="0.4" />
    <rect x="18" y="24" width="12" height="2" rx="1" fill="currentColor" opacity="0.3" />
    <rect x="18" y="28" width="12" height="2" rx="1" fill="currentColor" opacity="0.2" />
    <circle cx="24" cy="34" r="2" fill="#10B981" />
    <g stroke="#38BDF8" strokeWidth="1" opacity="0.6">
      <path d="M10 8 Q12 6 14 8" />
      <path d="M34 8 Q36 6 38 8" />
      <path d="M8 12 Q10 10 12 12" />
      <path d="M36 12 Q38 10 40 12" />
    </g>
  </svg>
)

export const FlexibleDuctIcon: React.FC<IconProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M8 20 Q16 12 24 20 Q32 28 40 20"
      stroke="currentColor"
      strokeWidth="6"
      fill="none"
      opacity="0.3"
    />
    <path
      d="M8 24 Q16 16 24 24 Q32 32 40 24"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="8" cy="24" r="3" fill="currentColor" />
    <circle cx="40" cy="24" r="3" fill="currentColor" />
    <g stroke="currentColor" strokeWidth="1" opacity="0.4">
      <path d="M12 22 L12 26" />
      <path d="M16 20 L16 24" />
      <path d="M20 22 L20 26" />
      <path d="M24 24 L24 28" />
      <path d="M28 22 L28 26" />
      <path d="M32 20 L32 24" />
      <path d="M36 22 L36 26" />
    </g>
  </svg>
)

export const SpeedControlIcon: React.FC<IconProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="8" y="12" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="20" cy="24" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="20" cy="24" r="2" fill="currentColor" />
    <path
      d="M18 16 L20 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect x="30" y="18" width="6" height="2" rx="1" fill="#10B981" />
    <rect x="30" y="22" width="4" height="2" rx="1" fill="#F59E0B" />
    <rect x="30" y="26" width="2" height="2" rx="1" fill="#EF4444" />
    <text x="33" y="32" textAnchor="middle" fontSize="6" fill="currentColor">RPM</text>
  </svg>
)

export const AccessoriesIcon: React.FC<IconProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 16 L20 8 L28 16 L20 24 Z"
      stroke="currentColor"
      strokeWidth="2"
      fill="currentColor"
      opacity="0.2"
    />
    <circle cx="32" cy="32" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="32" cy="32" r="2" fill="currentColor" />
    <rect x="6" y="28" width="16" height="4" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="10" cy="30" r="1" fill="currentColor" />
    <circle cx="14" cy="30" r="1" fill="currentColor" />
    <circle cx="18" cy="30" r="1" fill="currentColor" />
    <path d="M24 32 L28 32" stroke="currentColor" strokeWidth="2" />
    <path d="M36 32 L40 32" stroke="currentColor" strokeWidth="2" />
  </svg>
)

// Based on the Simple Icons WhatsApp path
// Source: https://github.com/simple-icons/simple-icons/blob/develop/icons/whatsapp.svg
export const WhatsAppIcon: React.FC<IconProps & { variant?: 'solid' | 'glyph' }> = ({ className = '', size = 48, variant = 'solid' }) => {
  const path = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";
  if (variant === 'glyph') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true" focusable="false" role="img">
        <path d={path} fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true" focusable="false" role="img">
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path d={path} fill="#fff" />
    </svg>
  )
}

// Brand specific icons (32x32px)
export const BrandIcon: React.FC<{ brand: string; className?: string }> = ({ 
  brand, 
  className = '' 
}) => {
  const size = 32
  
  switch (brand.toLowerCase()) {
    case 'avens':
    case 'avensair':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
          <circle cx="16" cy="16" r="14" fill="#1E40AF" />
          <path d="M10 20 L16 12 L22 20 L16 16 Z" fill="white" />
          <text x="16" y="26" textAnchor="middle" fontSize="8" fill="white">A</text>
        </svg>
      )
    case 'vortice':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
          <circle cx="16" cy="16" r="14" fill="#10B981" />
          <path d="M16 6 Q24 16 16 26 Q8 16 16 6" fill="white" opacity="0.9" />
        </svg>
      )
    case 'casals':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
          <rect x="2" y="2" width="28" height="28" rx="4" fill="#D97706" />
          <circle cx="16" cy="16" r="8" fill="white" />
          <circle cx="16" cy="16" r="4" fill="#D97706" />
        </svg>
      )
    case 'nicotra-gebhardt':
    case 'nicotra gebhardt':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
          <rect x="2" y="2" width="28" height="28" rx="2" fill="#374151" />
          <rect x="6" y="6" width="20" height="20" rx="2" fill="white" opacity="0.9" />
          <text x="16" y="18" textAnchor="middle" fontSize="10" fill="#374151">NG</text>
        </svg>
      )
    case 'flexiva':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
          <circle cx="16" cy="16" r="14" fill="#38BDF8" />
          <path d="M8 16 Q16 8 24 16 Q16 24 8 16" stroke="white" strokeWidth="3" fill="none" />
        </svg>
      )
    case 'danfoss':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
          <rect x="2" y="2" width="28" height="28" rx="14" fill="#EF4444" />
          <rect x="8" y="12" width="16" height="8" rx="2" fill="white" />
          <text x="16" y="18" textAnchor="middle" fontSize="8" fill="#EF4444">D</text>
        </svg>
      )
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
          <circle cx="16" cy="16" r="14" fill="#6B7280" />
          <text x="16" y="18" textAnchor="middle" fontSize="10" fill="white">?</text>
        </svg>
      )
  }
}

