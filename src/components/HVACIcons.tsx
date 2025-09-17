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

export const WhatsAppIcon: React.FC<IconProps> = ({ className = '', size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="24" cy="24" r="20" fill="#25D366" />
    <path
      d="M35.2 12.8C33.3 10.9 30.9 9.6 28.3 9.0C25.7 8.4 23.0 8.4 20.4 9.0C17.8 9.6 15.4 10.9 13.5 12.8C9.6 16.7 8.0 22.4 9.2 27.8L8 40L20.2 38.8C23.4 39.6 26.8 39.6 30.0 38.8C33.2 38.0 36.0 36.4 38.2 34.2C40.4 32.0 42.0 29.2 42.8 26.0C43.6 22.8 43.6 19.4 42.8 16.2C42.0 13.0 40.4 10.2 38.2 8.0"
      stroke="white"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M30.5 26.5C30.2 26.3 28.8 25.6 28.5 25.5C28.2 25.4 28.0 25.3 27.8 25.6C27.6 25.9 27.1 26.6 26.9 26.8C26.7 27.0 26.5 27.0 26.2 26.8C25.9 26.6 24.9 26.3 23.7 25.2C22.8 24.4 22.2 23.4 22.0 23.1C21.8 22.8 22.0 22.6 22.2 22.4C22.4 22.2 22.5 21.9 22.7 21.7C22.9 21.5 23.0 21.4 23.1 21.2C23.2 21.0 23.1 20.8 23.0 20.7C22.9 20.6 22.3 19.2 22.0 18.6C21.7 18.0 21.4 18.1 21.2 18.0H20.6C20.4 18.0 20.1 18.1 19.8 18.4C19.5 18.7 18.7 19.4 18.7 20.8C18.7 22.2 19.7 23.6 19.9 23.8C20.1 24.0 22.2 27.2 25.4 28.4C28.6 29.6 28.6 29.2 29.2 29.1C29.8 29.0 30.9 28.4 31.2 27.8C31.5 27.2 31.5 26.7 31.4 26.6C31.3 26.5 31.1 26.4 30.8 26.2"
      fill="white"
    />
  </svg>
)

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

