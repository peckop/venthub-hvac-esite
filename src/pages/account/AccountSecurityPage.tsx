import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { useI18n } from '../../i18n/I18nProvider'

export default function AccountSecurityPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!current) {
      toast.error(t('account.security.currentRequired'))
      return
    }
    if (password.length < 6) {
      toast.error(t('account.security.minLength'))
      return
    }
    if (password !== confirm) {
      toast.error(t('account.security.mismatch'))
      return
    }
    try {
      setSaving(true)
      // Re-auth with current password
      const email = user?.email || ''
      const reauth = await supabase.auth.signInWithPassword({ email, password: current })
      if (reauth.error) {
        toast.error(t('account.security.wrongCurrent'))
        return
      }

      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success(t('account.security.updated'))
      setCurrent('')
      setPassword('')
      setConfirm('')
    } catch (e) {
      console.error(e)
      toast.error(t('account.security.updateError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-lg font-semibold text-industrial-gray mb-3">{t('account.security.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder={t('account.security.currentLabel')} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('account.security.newLabel')} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy" />
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={t('account.security.confirmLabel')} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy" />
        <button disabled={saving} className="bg-primary-navy text-white px-4 py-2 rounded-lg disabled:opacity-60">{t('account.security.save')}</button>
      </form>
    </div>
  )
}

