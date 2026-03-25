'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'

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

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error: fetchError } = await (supabase as typeof supabase & { from: (t: string) => { select: (c: string) => { single: () => Promise<{data: unknown, error: unknown}> } } })
          .from('app_settings')
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

export function useSetting<T>(key: keyof AppSettings, fallback: T): T {
  const { settings, loading } = useSettings()

  const value = useMemo(() => {
    if (loading || !settings) return fallback;
    const val = settings[key];
    if (val === undefined || val === null) return fallback;
    return val as (typeof val & T);
  }, [settings, key, fallback, loading]);

  return value
}
