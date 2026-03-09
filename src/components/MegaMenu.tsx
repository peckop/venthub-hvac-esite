'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { useI18n } from '../i18n/I18nProvider'
import type { Category } from '../lib/supabase'

import { EliteMegaMenu, MobileMegaMenu } from './navigation/EliteMegaMenu'

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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    void fetchCategories()
  }, [fetchCategories, isOpen])

  if (!isOpen) return null

  if (loading && categories.length === 0) {
    return (
      <div className="fixed inset-0 z-[90] animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.2),transparent_35%),linear-gradient(180deg,rgba(2,6,23,0.68),rgba(2,6,23,0.84))] backdrop-blur-md" onClick={onClose} />
        <div className="absolute inset-x-3 top-3 bottom-3 md:inset-x-5 md:top-5 md:bottom-5">
          <div className="relative flex h-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/88 shadow-[0_40px_120px_-28px_rgba(15,23,42,0.75)]">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/15 border-t-secondary-blue" />
              <p className="mt-4 text-sm text-white/65">{t('megamenu.loadingCategories')}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loadError && categories.length === 0) {
    return (
      <div className="fixed inset-0 z-[90] animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.2),transparent_35%),linear-gradient(180deg,rgba(2,6,23,0.68),rgba(2,6,23,0.84))] backdrop-blur-md" onClick={onClose} />
        <div className="absolute inset-x-3 top-3 bottom-3 md:inset-x-5 md:top-5 md:bottom-5">
          <div className="relative flex h-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/88 p-6 text-center shadow-[0_40px_120px_-28px_rgba(15,23,42,0.75)]">
            <div>
              <p className="text-sm text-white/70">{loadError}</p>
              <button
                type="button"
                onClick={() => void fetchCategories(true)}
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary-navy transition-colors hover:bg-secondary-blue hover:text-white"
              >
                {t('common.retry')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isMobile) {
    return <MobileMegaMenu isOpen={isOpen} onClose={onClose} categories={categories} />
  }

  return <EliteMegaMenu isOpen={isOpen} onClose={onClose} categories={categories} />
}

export default MegaMenu
