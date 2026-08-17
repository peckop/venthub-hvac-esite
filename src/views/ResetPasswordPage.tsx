'use client'

import { AlertCircle, Eye, EyeOff, Lock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import { useLocalizedRoutes } from '../hooks/useLocalizedRoutes'
import { useI18n } from '../i18n/I18nProvider'
import { hibpPwnedCount } from '../utils/passwordSecurity'

/**
 * Şifre sıfırlama bağlantısından gelen kurtarma (recovery) oturumuyla YENİ şifre belirleme
 * ekranı. AccountSecurityPage'ten farkı: mevcut şifre SORULMAZ — kullanıcı şifresini
 * unuttuğu için buradadır; kimlik kanıtı e-postadaki bağlantının kurduğu oturumdur.
 * Şifre politikası RegisterPage ile birebir aynıdır (4 kural + HIBP sızıntı kontrolü).
 */
const ResetPasswordPage: React.FC = () => {
  const { t } = useI18n()
  const Routes = useLocalizedRoutes()
  const router = useRouter()
  const [sessionState, setSessionState] = useState<'checking' | 'ready' | 'missing'>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function checkSession() {
      const { data } = await supabase.auth.getSession()
      if (cancelled) return
      setSessionState(data.session ? 'ready' : 'missing')
    }
    checkSession()
    return () => { cancelled = true }
  }, [])

  const passwordRules = [
    { key: 'length',  label: t('auth.pwRule.length'),  test: (p: string) => p.length >= 8 },
    { key: 'upper',   label: t('auth.pwRule.upper'),   test: (p: string) => /[A-Z]/.test(p) },
    { key: 'digit',   label: t('auth.pwRule.digit'),   test: (p: string) => /[0-9]/.test(p) },
    { key: 'special', label: t('auth.pwRule.special'), test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ]
  const passedRules = passwordRules.filter(r => r.test(password)).length
  const strengthColor = passedRules <= 1 ? 'bg-red-500' : passedRules === 2 ? 'bg-orange-400' : passedRules === 3 ? 'bg-yellow-400' : 'bg-green-500'
  const strengthLabel = passedRules <= 1 ? t('auth.pwStrength.weak') : passedRules === 2 ? t('auth.pwStrength.fair') : passedRules === 3 ? t('auth.pwStrength.good') : t('auth.pwStrength.strong')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passedRules < 4) {
      toast.error(t('auth.pwRule.allRequired'))
      return
    }
    if (password !== confirm) {
      toast.error(t('auth.passwordsDontMatch'))
      return
    }

    setSaving(true)
    try {
      // HIBP sızıntı kontrolü (k-Anonymity). Ağ hatasında geçer, sızıntıda engeller.
      const pwned = await hibpPwnedCount(password)
      if (pwned > 0) {
        toast.error(t('auth.passwordPwned'))
        return
      }
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        toast.error(t('auth.reset.updateError'))
        console.error('Password update error:', error.message)
        return
      }
      toast.success(t('auth.reset.success'))
      router.push(Routes.home())
    } catch (error) {
      toast.error(t('auth.unexpectedError'))
      console.error('Reset password error:', error)
    } finally {
      setSaving(false)
    }
  }

  if (sessionState === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-air-blue via-clean-white to-light-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy mx-auto mb-4" />
          <p className="text-steel-gray">{t('auth.reset.checking')}</p>
        </div>
      </div>
    )
  }

  if (sessionState === 'missing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-air-blue via-clean-white to-light-gray flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-hvac-lg border border-white/20 p-8 max-w-md w-full mx-4 text-center">
          <div className="bg-error-red text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h1 className="text-xl font-bold text-industrial-gray mb-2">
            {t('auth.reset.invalidTitle')}
          </h1>
          <p className="text-steel-gray mb-6">
            {t('auth.reset.invalidDesc')}
          </p>
          <Link
            href={Routes.auth.forgotPassword()}
            className="inline-block bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {t('auth.reset.requestNew')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-air-blue via-clean-white to-light-gray">
      <div className="relative max-w-md mx-auto px-4 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-hvac-lg border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="bg-primary-navy text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Lock size={28} />
            </div>
            <h1 className="text-2xl font-bold text-industrial-gray mb-2">
              {t('auth.reset.title')}
            </h1>
            <p className="text-steel-gray">
              {t('auth.reset.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Yeni Şifre */}
            <div>
              <label className="block text-sm font-medium text-industrial-gray mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3.5 text-steel-gray" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-light-gray rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:border-transparent"
                  placeholder={t('auth.passwordMin')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-steel-gray hover:text-primary-navy"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1 h-1.5">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`flex-1 rounded-full transition-colors duration-300 ${
                        i <= passedRules ? strengthColor : 'bg-light-gray'
                      }`} />
                    ))}
                  </div>
                  <p className="text-xs text-steel-gray">
                    {t('auth.pwStrength.label')}: <span className="font-semibold">{strengthLabel}</span>
                  </p>
                  <ul className="space-y-1">
                    {passwordRules.map(rule => (
                      <li key={rule.key} className={`flex items-center gap-1.5 text-xs transition-colors ${
                        rule.test(password) ? 'text-green-600' : 'text-steel-gray'
                      }`}>
                        <span>{rule.test(password) ? '✓' : '○'}</span>
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Şifreyi Onayla */}
            <div>
              <label className="block text-sm font-medium text-industrial-gray mb-2">
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3.5 text-steel-gray" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-light-gray rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:border-transparent"
                  placeholder={t('auth.confirmPassword')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-3.5 text-steel-gray hover:text-primary-navy"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  {t('auth.reset.updating')}
                </div>
              ) : (
                t('auth.reset.submit')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
