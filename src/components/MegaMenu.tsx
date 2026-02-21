'use client'

import React, { useState, useEffect } from 'react'
import type { Category } from '../lib/supabase'
import { EliteMegaMenu, MobileMegaMenu } from './navigation/EliteMegaMenu'

interface MegaMenuProps {
  isOpen: boolean
  onClose: () => void
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch categories when menu opens
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { getCategories } = await import('../lib/supabase')
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

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
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="absolute top-0 left-0 w-full bg-white/98 backdrop-blur-xl shadow-2xl animate-slideDown"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 max-w-7xl mx-auto">
          <h2 className="text-lg font-bold text-industrial-gray">Ürün Kategorileri</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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




