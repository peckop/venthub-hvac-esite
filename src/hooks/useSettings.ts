'use client'

import { useEffect,useState } from 'react'

import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

export interface AppSettings {
  id: string
  site_title: string
  site_description: string
  contact_email: string
  contact_phone: string
  contact_address: string
  social_links: Record<string, string>
  maintenance_mode: boolean
  google_analytics_id: string | null
  footer_text: string
  header_announcement: string | null
  default_meta_image: string | null
  brand_logo_url: string | null
  whatsapp_number: string | null
  updated_at: string
}

/**
 * Custom hook to fetch and hold the global application settings from the `app_settings` Supabase table.
 * Manages loading, error, and the settings state.
 *
 * @returns An object containing the fetched settings, loading boolean, and error string
 *
 * @example
 * const { settings, loading } = useSettings()
 * if (!loading && settings) console.log(settings.site_title)
 */
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error: fetchError } = await supabase
          .from('app_settings' as never)
          .select('*')
          .single()

        if (fetchError) throw (fetchError as Error)
        setSettings(data as Partial<AppSettings> as AppSettings)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return { settings, loading, error }
}
