'use client'

import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

import { cn } from '../../lib/utils'

interface NavSceneShellProps {
  isOpen: boolean
  onClose: () => void
  title: string
  closeLabel: string
  eyebrow?: string
  description?: string
  children: React.ReactNode
  panelClassName?: string
  bodyClassName?: string
}

const NavSceneShell: React.FC<NavSceneShellProps> = ({
  isOpen,
  onClose,
  title,
  closeLabel,
  eyebrow,
  description,
  children,
  panelClassName,
  bodyClassName,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[90] animate-in fade-in duration-300">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.2),transparent_35%),linear-gradient(180deg,rgba(2,6,23,0.68),rgba(2,6,23,0.84))] backdrop-blur-md"
        onClick={onClose}
      />

      <div className={cn('absolute inset-x-3 top-3 bottom-3 md:inset-x-5 md:top-5 md:bottom-5', panelClassName)}>
        <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/88 shadow-[0_40px_120px_-28px_rgba(15,23,42,0.75)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_top,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_right_bottom,rgba(14,165,233,0.12),transparent_24%)]" />

          <div className="relative flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
            <div className="min-w-0">
              {eyebrow && (
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-secondary-blue">
                  {eyebrow}
                </div>
              )}
              <h2 className="mt-1 truncate text-lg font-semibold text-white sm:text-xl">{title}</h2>
              {description && <p className="mt-1 max-w-2xl text-sm text-white/55">{description}</p>}
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 p-2.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              aria-label={closeLabel}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className={cn('relative flex-1 overflow-hidden', bodyClassName)}>{children}</div>
        </div>
      </div>
    </div>
  )
}

export default NavSceneShell
