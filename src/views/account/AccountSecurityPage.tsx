import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { useI18n } from '../../i18n/I18nProvider'
import { hibpPwnedCount } from '../../utils/passwordSecurity'
import { ShieldCheck, Lock, Key, Check, Loader2, Mail, Link as LinkIcon, Unlink, Chrome } from 'lucide-react'

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
      const { data, error } = await supabase.auth.getUser()
      if (!error && data?.user) {
        const ids = (data.user as unknown as { identities?: Array<{ id?: string; provider?: string }> }).identities || []
        setIdentities(ids)
      }
    } catch { }
  }

  useEffect(() => { refreshIdentities() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!current) {
      toast.error(t('account.security.currentRequired') || 'Mevcut şifre zorunlu')
      return
    }
    if (password.length < 8) {
      toast.error(t('account.security.minLength') || 'En az 8 karakter olmalı')
      return
    }
    if (password !== confirm) {
      toast.error(t('account.security.mismatch') || 'Şifreler uyuşmuyor')
      return
    }
    try {
      setSaving(true)
      // Re-auth with current password
      const email = user?.email || ''
      const reauth = await supabase.auth.signInWithPassword({ email, password: current })
      if (reauth.error) {
        toast.error(t('account.security.wrongCurrent') || 'Mevcut şifre hatalı')
        return
      }

      // HIBP sızıntı kontrolü (k-Anonymity). Ağ hatasında geçer, sızıntıda engeller.
      const pwned = await hibpPwnedCount(password)
      if (pwned > 0) {
        toast.error(t('account.security.pwned') || 'Bu şifre bilinen veri sızıntılarında bulundu. Lütfen daha güvenli bir şifre seçin.')
        setSaving(false)
        return
      }
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success(t('account.security.updated') || 'Şifreniz başarıyla güncellendi')
      setCurrent('')
      setPassword('')
      setConfirm('')
    } catch (e) {
      console.error(e)
      toast.error(t('account.security.updateError') || 'Güncelleme sırasında hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-industrial-gray flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary-navy" />
          {t('account.security.title') || 'Güvenlik Ayarları'}
        </h2>
        <p className="text-sm text-steel-gray mt-1">
          Hesap güvenliğiniz için şifrenizi güncel tutun ve bağlı giriş yöntemlerinizi yönetin.
        </p>
      </div>

      <div className="space-y-6">
        {/* Şifre Değiştirme Kartı */}
        <div className="bg-white border border-gray-100/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-bold text-industrial-gray mb-1 flex items-center gap-2">
              <Key className="w-5 h-5 text-steel-gray" />
              Şifre Değiştir
            </h3>
            <p className="text-sm text-steel-gray mb-6">Hesap güvenliğiniz için harf, rakam ve özel karakter içeren güçlü bir şifre seçin.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-industrial-gray block">
                  Mevcut Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder={t('account.security.currentLabel') || 'Mevcut şifreniz'} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-industrial-gray focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all focus:bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-industrial-gray block">
                    Yeni Şifre
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Key className="w-4 h-4 text-gray-400" />
                    </div>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('account.security.newLabel') || 'En az 8 karakter'} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-industrial-gray focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all focus:bg-white" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-industrial-gray block">
                    Yeni Şifre (Tekrar)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Check className="w-4 h-4 text-gray-400" />
                    </div>
                    <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={t('account.security.confirmLabel') || 'Şifreyi tekrar girin'} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-industrial-gray focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all focus:bg-white" />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button disabled={saving} className="bg-primary-navy text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-primary-navy/20 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-industrial-gray transition-colors flex items-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Güncelleniyor...</> : <><Check className="w-4 h-4" /> {t('account.security.save') || 'Şifreyi Güncelle'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bağlı Hesaplar Kartı */}
        <div className="bg-white border border-gray-100/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-bold text-industrial-gray mb-1 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-steel-gray" />
              Bağlı Giriş Yöntemleri
            </h3>
            <p className="text-sm text-steel-gray mb-6">Tek tıkla giriş yapabilmek için sosyal hesaplarınızı bağlayabilirsiniz.</p>

            <div className="space-y-4">
              {/* E-posta/Şifre */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-industrial-gray">E-posta ve Şifre</h4>
                    <p className="text-xs text-steel-gray">Standart giriş yöntemi</p>
                  </div>
                </div>
                {hasProvider('email') ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                    <Check className="w-3 h-3" /> Bağlı
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
                    Pasif
                  </span>
                )}
              </div>

              {/* Google */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                    <Chrome className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-industrial-gray">Google</h4>
                    <p className="text-xs text-steel-gray">Google hesabınızla tek tıkla giriş</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {hasProvider('google') ? (
                    <>
                      <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                        <Check className="w-3 h-3" /> Bağlı
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
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
                            type AuthWithUnlink = { unlinkIdentity?: (args: { identity_id: string }) => Promise<{ error?: unknown }> }
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
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Bağlantıyı Kaldır"
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const { data, error } = await supabase.auth.linkIdentity({
                            provider: 'google',
                            options: { redirectTo: `${window.location.origin}/auth/callback` }
                          } as unknown as { provider: 'google'; options?: { redirectTo?: string } })
                          if (error) throw error
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
                      className="px-4 py-2 bg-white border border-gray-200 hover:border-primary-navy hover:text-primary-navy text-industrial-gray text-sm font-bold rounded-xl transition-colors"
                    >
                      Bağla
                    </button>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-steel-gray mt-5 px-1">
              Aynı e‑posta ile farklı giriş yöntemleri ayrı hesaplar oluşturabilir. Buradan Google hesabınızı mevcut hesabınıza bağlayarak hesap yönetimini tek bir merkezde toplayabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}





