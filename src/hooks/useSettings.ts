import { useCallback, useEffect, useState } from 'react'

import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

export interface AppSettings {
  general: {
    site_name: string
    tagline: string
    contact_email: string
    support_phone: string
    headquarters: string
    logo_url: string | null
  }
  payment: {
    iyzico_enabled: boolean
    iyzico_mode: string
    iyzico_api_key: string
  }
}

/**
 * Custom hook to fetch and hold the global application settings from the `site_settings` Supabase table.
 * Manages loading, error, and the settings state.
 *
 * @returns An object containing the fetched settings, loading boolean, error string, and reload callback
 */
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('key, value')

      if (fetchError) throw (fetchError as Error)

      const generalRow = data?.find((r) => r.key === 'general')
      const paymentRow = data?.find((r) => r.key === 'payment')

      setSettings({
        general: {
          site_name: String((generalRow?.value as Record<string, unknown>)?.site_name || ''),
          tagline: String((generalRow?.value as Record<string, unknown>)?.tagline || ''),
          contact_email: String((generalRow?.value as Record<string, unknown>)?.contact_email || ''),
          support_phone: String((generalRow?.value as Record<string, unknown>)?.support_phone || ''),
          headquarters: String((generalRow?.value as Record<string, unknown>)?.headquarters || ''),
          logo_url: (generalRow?.value as Record<string, unknown>)?.logo_url
            ? String((generalRow?.value as Record<string, unknown>)?.logo_url)
            : null,
        },
        payment: {
          iyzico_enabled: !!(paymentRow?.value as Record<string, unknown>)?.iyzico_enabled,
          iyzico_mode: String((paymentRow?.value as Record<string, unknown>)?.iyzico_mode || 'sandbox'),
          iyzico_api_key: String((paymentRow?.value as Record<string, unknown>)?.iyzico_api_key || ''),
        },
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return { settings, loading, error, reload: fetchSettings }
}
