'use client'

import React from 'react'

interface ClientLeadButtonProps {
  primaryCta: string
  onQuoteClick?: () => void
  className?: string
}

export const ClientLeadButton: React.FC<ClientLeadButtonProps> = ({ 
  primaryCta, 
  onQuoteClick,
  className 
}) => {
  return (
    <button
      type="button"
      onClick={() => {
        if (onQuoteClick) {
          onQuoteClick();
        } else if (typeof window !== "undefined") {
          window.openLeadModal?.();
        }
      }}
      className={
        className || 
        "group relative h-16 px-12 bg-white text-slate-950 font-bold uppercase text-[12px] tracking-[0.2em] rounded-2xl overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
      }
    >
      <span className="relative z-10">{primaryCta}</span>
      <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
    </button>
  )
}
