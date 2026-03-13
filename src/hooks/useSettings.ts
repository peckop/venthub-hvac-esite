'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface SiteSettings {
  general: {
    site_name: string
    tagline: string
    contact_email: string
    support_phone: string
    headquarters: string
    logo_url: string | null
  }
  payment: {
    iyzico_mode: 'sandbox' | 'production'
    iyzico_api_key: string
    iyzico_secret_key: string
    iyzico_enabled: boolean
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')

      if (error) throw error

      const settingsObj: Record<string, unknown> = {}
      data?.forEach(item => {
        settingsObj[item.key] = item.value
      })

      setSettings(settingsObj as unknown as SiteSettings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (key: keyof SiteSettings, value: unknown) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value: value as any, updated_at: new Date().toISOString() }, { onConflict: 'key' })

      if (error) throw error
      
      setSettings(prev => prev ? { ...prev, [key]: value as any } : null)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return { settings, loading, error, updateSettings, refresh: fetchSettings }
}
