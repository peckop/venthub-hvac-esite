import { createClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabaseStaticClient = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      // AYRI storageKey ZORUNLU: bu statik istemci (SSG/public read) tarayıcıda da
      // import ediliyor (lib/supabase.ts compat + config/admin getUserRole). Varsayılan
      // storageKey (`sb-<ref>-auth-token`) supabaseBrowserClient ile AYNI olunca iki
      // GoTrueClient aynı navigator.locks kilidini paylaşır → "Multiple GoTrueClient
      // instances" + deadlock (admin paneli "yükleniyor"da donar). Ayrı key → ayrı kilit.
      // persistSession:false olduğu için bu key hiçbir zaman storage'a yazılmaz (yan etki yok).
      storageKey: 'sb-static-noauth'
    }
  }
)
