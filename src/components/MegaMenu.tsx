'use client'

import React, { useState, useEffect, useCallback } from 'react'
import type { Category } from '../lib/supabase'
import { EliteMegaMenu, MobileMegaMenu } from './navigation/EliteMegaMenu'
import { useI18n } from '../i18n/I18nProvider'

interface MegaMenuProps {
  isOpen: boolean
  onClose: () => void
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const fetchCategories = useCallback(async (force = false) => {
    setLoading(true)
    setLoadError(null)

    try {
      const { getCategories } = await import('../lib/supabase')
      const data = await getCategories({ forceRefresh: force })
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setLoadError(t('categoryHub.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch categories when menu opens
  useEffect(() => {
    if (!isOpen) return

    void fetchCategories()
  }, [fetchCategories, isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  if (loadError) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      >
        <div
          className="absolute top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-2xl animate-in slide-in-from-top-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100 max-w-7xl mx-auto">
            <h2 className="text-lg font-bold text-industrial-gray">{t('megamenu.productCategories')}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-slate-400 group"
              aria-label={t('common.close')}
            >
              <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="group-hover:rotate-90 transition-transform duration-300">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="max-w-7xl mx-auto p-4">
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <p className="text-sm text-steel-gray">{loadError}</p>
              <button
                type="button"
                onClick={() => void fetchCategories(true)}
                className="inline-flex items-center justify-center rounded-lg bg-primary-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-secondary-blue"
              >
                {t('common.retry')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mobile: Show accordion overlay
  if (isMobile) {
    return (
      <MobileMegaMenu
        isOpen={isOpen}
        onClose={onClose}
        categories={categories}
      />
    )
  }

  // Desktop: Full-screen overlay with Radix NavigationMenu
  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="absolute top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-2xl animate-in slide-in-from-top-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 max-w-7xl mx-auto">
          <h2 className="text-lg font-bold text-industrial-gray">{t('megamenu.productCategories')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-slate-400 group"
            aria-label={t('common.close')}
          >
            <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="group-hover:rotate-90 transition-transform duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary-navy/20 border-t-primary-navy rounded-full animate-spin" />
            </div>
          ) : (
            <EliteMegaMenu
              categories={categories}
              onNavigate={onClose}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default MegaMenu




