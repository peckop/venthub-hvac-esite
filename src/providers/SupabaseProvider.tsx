'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import React, { createContext, useContext, useMemo, useState } from 'react'

import { supabaseBrowserClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type SupabaseContextType = {
  supabase: SupabaseClient<Database>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  // Tekil browser client'ı SAĞLA — kendi createBrowserClient'ını çağırma.
  // İkinci bir GoTrueClient örneği aynı storage key'i paylaşır → navigator.locks
  // deadlock'u (admin paneli "yükleniyor"da donar). AuthContext (statik import) ve
  // bu provider artık AYNI tekil instance'ı kullanır. DI/test/multi-tenant korunur.
  const [supabase] = useState(() => supabaseBrowserClient)

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
