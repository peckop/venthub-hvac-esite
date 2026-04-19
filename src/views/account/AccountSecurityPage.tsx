import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { UserIdentity } from '@supabase/supabase-js'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { useI18n } from '../../i18n/I18nProvider'
import { hibpPwnedCount } from '../../utils/passwordSecurity'
import { ShieldCheck, Lock, Key, Check, Loader2, Mail, Link as LinkIcon, Unlink, Chrome } from 'lucide-react'

import { useRouter } from 'next/navigation'
export default function AccountSecurityPage() {
  const router = useRouter()
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

        const ids = (data.user as { identities?: Array<{ id?: string; provider?: string }> }).identities || []
        setIdentities(ids)
      }
    } catch { }
  }

  useEffect(() => { refreshIdentities() }, [])

  const passwordRules = [
    { key: 'length',  label: 'En az 8 karakter',     test: (p: string) => p.length >= 8 },
    { key: 'upper',   label: 'En az 1 büyük harf',   test: (p: string) => /[A-Z]/.test(p) },
    { key: 'digit',   label: 'En az 1 rakam',        test: (p: string) => /[0-9]/.test(p) },
    { key: 'special', label: 'En az 1 özel karakter', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ]
  const passedRules = passwordRules.filter(r => r.test(password)).length
  const strengthColor = passedRules <= 1 ? 'bg-red-500' : passedRules === 2 ? 'bg-orange-400' : passedRules === 3 ? 'bg-yellow-400' : 'bg-green-500'
  const strengthLabel = passedRules <= 1 ? 'Zayıf' : passedRules === 2 ? 'Orta' : passedRules === 3 ? 'İyi' : 'Güçlü'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!current) {
      toast.error(t('account.security.currentRequired') || 'Mevcut şifre zorunlu')
      return
    }
    if (passedRules < 4) {
      toast.error('Şifreniz tüm güvenlik kurallarını karşılamalıdır')
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
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary-navy" />
          {t('account.security.title') || 'Güvenlik Ayarları'}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Hesap güvenliğiniz için şifrenizi güncel tutun ve bağlı giriş yöntemlerinizi yönetin.
        </p>
      </div>

      <div className="space-y-6">
        {/* Şifre Değiştirme Kartı */}
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Key className="w-5 h-5 text-slate-500" />
              Şifre Değiştir
            </h3>
            <p className="text-sm text-slate-500 mb-6 pt-2">Hesap güvenliğiniz için harf, rakam ve özel karakter içeren güçlü bir şifre seçin.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">
                  Mevcut Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder={t('account.security.currentLabel') || 'Mevcut şifreniz'} className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">
                    Yeni Şifre
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Key className="w-4 h-4 text-slate-400" />
                    </div>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('account.security.newLabel') || 'En az 8 karakter'} className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all" />
                  </div>
                  {/* Güç Göstergesi */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex gap-1 h-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`flex-1 rounded-full transition-colors duration-300 ${
                            i <= passedRules ? strengthColor : 'bg-slate-200'
                          }`} />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">Güvenlik: <span className="font-semibold">{strengthLabel}</span></p>
                      <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                        {passwordRules.map(rule => (
                          <li key={rule.key} className={`flex items-center gap-1 text-[11px] ${
                            rule.test(password) ? 'text-green-600' : 'text-slate-400'
                          }`}>
                            <span>{rule.test(password) ? '✓' : '○'}</span>{rule.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">
                    Yeni Şifre (Tekrar)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Check className="w-4 h-4 text-slate-400" />
                    </div>
                    <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={t('account.security.confirmLabel') || 'Şifreyi tekrar girin'} className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end border-t border-slate-100 mt-2">
                <button disabled={saving} className="h-10 px-6 bg-primary-navy text-white rounded-lg text-sm font-bold shadow-sm shadow-primary-navy/20 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-industrial-gray transition-all hover:scale-[1.02] flex items-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Güncelleniyor...</> : <><Check className="w-4 h-4" /> {t('account.security.save') || 'Şifreyi Güncelle'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bağlı Hesaplar Kartı */}
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2 border-b border-slate-100 pb-3">
              <LinkIcon className="w-5 h-5 text-slate-500" />
              Bağlı Giriş Yöntemleri
            </h3>
            <p className="text-sm text-slate-500 mb-6 pt-2">Tek tıkla giriş yapabilmek için sosyal hesaplarınızı bağlayabilirsiniz.</p>

            <div className="space-y-4">
              {/* E-posta/Şifre */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">E-posta ve Şifre</h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">Standart giriş yöntemi</p>
                  </div>
                </div>
                {hasProvider('email') ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200 shadow-sm">
                    <Check className="w-3.5 h-3.5" /> Bağlı
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200 shadow-sm">
                    Pasif
                  </span>
                )}
              </div>

              {/* Google */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm">
                    <Chrome className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Google</h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">Tek tıkla giriş</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {hasProvider('google') ? (
                    <>
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200 shadow-sm">
                        <Check className="w-3.5 h-3.5" /> Bağlı
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
                            if (typeof supabase.auth.unlinkIdentity !== 'function') {
                              toast.error('unlinkIdentity API desteklenmiyor')
                              return
                            }
                            const { error } = await supabase.auth.unlinkIdentity(google as UserIdentity)
                            if (error) throw error
                            toast.success('Google bağlantısı kaldırıldı')
                            await refreshIdentities()
                          } catch (e) {
                            console.error(e)
                            toast.error('Google bağlantısı kaldırılamadı')
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 focus:outline-none"
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

                          } as { provider: 'google'; options?: { redirectTo?: string } })
                          if (error) throw error

                          const url = (data as { url?: string })?.url
                          if (url) {
                            router.push(url as import('next').Route)
                          } else {
                            toast.success('Google hesabı bağlama işlemi başlatıldı')
                            await refreshIdentities()
                          }
                        } catch (e) {
                          console.error(e)
                          toast.error('Google bağlama başarısız')
                        }
                      }}
                      className="h-8 px-4 bg-white border border-slate-200 shadow-sm hover:border-primary-navy hover:text-primary-navy text-slate-700 text-xs font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-navy/20"
                    >
                      Bağla
                    </button>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-5 px-1 leading-relaxed">
              Aynı e‑posta ile farklı giriş yöntemleri ayrı hesaplar oluşturabilir. Buradan Google hesabınızı mevcut hesabınıza bağlayarak hesap yönetimini tek bir merkezde toplayabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}





