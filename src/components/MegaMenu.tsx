'use client'

import React, { useState, useEffect } from 'react'
import { useCategories } from '../contexts/CategoryContext'
import EliteMegaMenu, { MobileMegaMenu } from './navigation/EliteMegaMenu'

interface MegaMenuProps {
  isOpen: boolean
  onClose: () => void
}

const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  const { categories, loading } = useCategories()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || !isOpen) return null

  return (
    <div className="fixed inset-0 z-modal flex flex-col bg-white overflow-hidden animate-in fade-in duration-300">
      {/* Header Area */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-navy rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">V</span>
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">Kategoriler</span>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
        <div className="max-w-7xl mx-auto py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary-navy/20 border-t-primary-navy rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Desktop View (Visible above sm) */}
              <div className="hidden sm:block">
                <EliteMegaMenu
                  categories={categories}
                  onNavigate={onClose}
                />
              </div>
              
              {/* Mobile View (Visible on extra small) */}
              <div className="block sm:hidden">
                <MobileMegaMenu
                  categories={categories}
                  onNavigate={onClose}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MegaMenu
