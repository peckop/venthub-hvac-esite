'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import React, { createContext, useContext, useMemo,useState } from 'react'

import type { Database } from '@/types/database.types'

type SupabaseContextType = {
  supabase: SupabaseClient<Database>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() =>
    createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
    )
  )

  const contextValue = useMemo(() => ({ supabase }), [supabase])

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabaseClient() {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabaseClient must be used inside a SupabaseProvider')
  }
  return context
}
