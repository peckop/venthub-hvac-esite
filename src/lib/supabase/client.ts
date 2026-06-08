import { createBrowserClient } from '@supabase/ssr'

import type { Database } from '../../types/database.types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabaseBrowserClient = createBrowserClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)
