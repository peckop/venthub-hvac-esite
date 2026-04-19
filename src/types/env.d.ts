export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    }
  }

  interface Window {
    __SUPABASE_CONFIG_ERROR__?: boolean
    requestIdleCallback?: (cb: () => void) => void
    openLeadModal?: () => void
  }
}
