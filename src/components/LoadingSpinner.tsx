import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  fullScreen = true 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  const spinnerElement = (
    <div className="flex items-center justify-center">
      <span
        className={`${sizeClasses[size]} inline-block rounded-full border-2 border-primary-navy border-t-transparent animate-spin`}
        aria-label="Yükleniyor"
      />
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        {spinnerElement}
      </div>
    )
  }

  return spinnerElement
}

export default LoadingSpinner
