import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'

export default function AccountSecurityPage() {
  const { user } = useAuth()
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!current) {
      toast.error('Mevcut şifrenizi girin')
      return
    }
    if (password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalı')
      return
    }
    if (password !== confirm) {
      toast.error('Şifreler eşleşmiyor')
      return
    }
    try {
      setSaving(true)
      // Re-auth with current password
      const email = user?.email || ''
      const reauth = await supabase.auth.signInWithPassword({ email, password: current })
      if (reauth.error) {
        toast.error('Mevcut şifre hatalı')
        return
      }

      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('Şifreniz güncellendi')
      setCurrent('')
      setPassword('')
      setConfirm('')
    } catch (e) {
      console.error(e)
      toast.error('Şifre güncelleme sırasında hata')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-lg font-semibold text-industrial-gray mb-3">Parola Değiştir</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Mevcut şifre" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Yeni şifre" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy" />
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Yeni şifre (tekrar)" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy" />
        <button disabled={saving} className="bg-primary-navy text-white px-4 py-2 rounded-lg disabled:opacity-60">Kaydet</button>
      </form>
    </div>
  )
}

