import React, { useEffect, useState } from 'react'
import { getSupabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { useI18n } from '../../i18n/I18nProvider'
import { hibpPwnedCount } from '../../utils/passwordSecurity'

export default function AccountSecurityPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  // Linked identities (google, email, etc.)
  const [identities, setIdentities] = useState<Array<{ id?: string; provider?: string }>>([])
  const hasProvider = (p: string) => identities?.some(i => (i?.provider || '').toLowerCase() === p)

  async function refreshIdentities() {
    try {
      const supabase = await getSupabase()
      const { data, error } = await supabase.auth.getUser()
      if (!error && data?.user) {
        const ids = (data.user as unknown as { identities?: Array<{ id?: string; provider?: string }> }).identities || []
        setIdentities(ids)
      }
    } catch {}
  }

  useEffect(() => { refreshIdentities() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!current) {
      toast.error(t('account.security.currentRequired'))
      return
    }
    if (password.length < 8) {
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
      const supabase = await getSupabase()
      const reauth = await supabase.auth.signInWithPassword({ email, password: current })
      if (reauth.error) {
        toast.error(t('account.security.wrongCurrent'))
        return
      }

      // HIBP sızıntı kontrolü (k-Anonymity). Ağ hatasında geçer, sızıntıda engeller.
      const pwned = await hibpPwnedCount(password)
      if (pwned > 0) {
        toast.error(t('account.security.pwned') || 'Password appears in known data breaches')
        setSaving(false)
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

      {/* Linked login methods */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-md font-semibold text-industrial-gray mb-2">Bağlı Giriş Yöntemleri</h3>
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className={`px-2 py-1 rounded text-xs border ${hasProvider('email') ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>E-posta/Şifre</span>
          <span className={`px-2 py-1 rounded text-xs border ${hasProvider('google') ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>Google</span>
        </div>
        <div className="flex items-center gap-2">
          {!hasProvider('google') ? (
            <button
              type="button"
              onClick={async () => {
                try {
                  const supabase = await getSupabase()
                  const { data, error } = await supabase.auth.linkIdentity({
                    provider: 'google',
                    options: { redirectTo: `${window.location.origin}/auth/callback` }
                  } as unknown as { provider: 'google'; options?: { redirectTo?: string } })
                  if (error) throw error
                  // For OAuth linking, a URL is usually returned similar to signInWithOAuth
                  const url = (data as unknown as { url?: string })?.url
                  if (url) {
                    window.location.href = url
                  } else {
                    toast.success('Google hesabı bağlama işlemi başlatıldı')
                    await refreshIdentities()
                  }
                } catch (e) {
                  console.error(e)
                  toast.error('Google bağlama başarısız')
                }
              }}
              className="bg-primary-navy text-white px-3 py-2 rounded-lg text-sm hover:bg-primary-navy/90"
            >
              Google’ı Bağla
            </button>
          ) : (
            <button
              type="button"
              onClick={async () => {
                // Unlink only if another method exists
                if (!hasProvider('email')) {
                  toast.error('Son giriş yöntemini kaldıramazsınız')
                  return
                }
                try {
                  const google = identities.find(i => (i.provider || '').toLowerCase() === 'google')
                  if (!google?.id) {
                    toast.error('Google kimliği bulunamadı')
                    return
                  }
                  // Typings may vary across versions; narrow to a minimal interface at runtime
                  type AuthWithUnlink = { unlinkIdentity?: (args: { identity_id: string }) => Promise<{ error?: unknown }> }
                  const supabase = await getSupabase()
                  const authMaybe = supabase.auth as unknown as AuthWithUnlink
                  if (typeof authMaybe.unlinkIdentity !== 'function') {
                    toast.error('unlinkIdentity API desteklenmiyor')
                    return
                  }
                  const { error } = await authMaybe.unlinkIdentity({ identity_id: google.id })
                  if (error) throw error
                  toast.success('Google bağlantısı kaldırıldı')
                  await refreshIdentities()
                } catch (e) {
                  console.error(e)
                  toast.error('Google bağlantısı kaldırılamadı')
                }
              }}
              className="border border-gray-300 text-industrial-gray px-3 py-2 rounded-lg text-sm hover:bg-gray-100"
            >
              Google Bağlantısını Kaldır
            </button>
          )}
        </div>
        <p className="text-xs text-steel-gray mt-2">Aynı e‑posta ile farklı giriş yöntemleri ayrı hesaplar oluşturabilir. Buradan Google hesabınızı mevcut hesabınıza bağlayarak tek hesap kullanabilirsiniz.</p>
      </div>
    </div>
  )
}

