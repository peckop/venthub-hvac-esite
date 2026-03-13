'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface PageContextType {
  productName?: string
  modelCode?: string
  technicalLinks?: { id: string; label: string }[]
  breadcrumb?: { label: string; href: string }[]
  setPageContext: (data: Partial<Omit<PageContextType, 'setPageContext'>>) => void
  clearPageContext: () => void
}

const PageContext = createContext<PageContextType | undefined>(undefined)

export const PageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [context, setContext] = useState<Partial<Omit<PageContextType, 'setPageContext'>>>({})

  const setPageContext = (data: Partial<Omit<PageContextType, 'setPageContext'>>) => {
    setContext(prev => ({ ...prev, ...data }))
  }

  const clearPageContext = () => {
    setContext({})
  }

  return (
    <PageContext.Provider value={{ ...context, setPageContext, clearPageContext }}>
      {children}
    </PageContext.Provider>
  )
}

export const usePageContext = () => {
  const context = useContext(PageContext)
  if (!context) {
    return {
      setPageContext: () => {},
      clearPageContext: () => {},
    }
  }
  return context
}
