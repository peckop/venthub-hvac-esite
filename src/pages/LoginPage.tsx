import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useI18n } from '../i18n/I18nProvider'
import { supabase } from '../lib/supabase'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useI18n()

  const state = (location.state ?? null) as { from?: { pathname?: string } } | null
  const from = state?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error(t('auth.validEmailPassRequired'))
      return
    }

    setLoading(true)
    
    try {
      const { error } = await signIn(email, password, rememberMe)
      
      if (error) {
        if (error.message?.includes('Invalid login credentials')) {
          toast.error(t('auth.invalidCreds'))
        } else if (error.message?.includes('Email not confirmed')) {
          toast.error(t('auth.emailNotConfirmed'))
        } else {
          toast.error(error.message || t('auth.genericLoginError'))
        }
      } else {
        // Success - navigate to intended page
        navigate(from, { replace: true })
      }
    } catch (error) {
      toast.error(t('auth.unexpectedError'))
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    try {
      setLoading(true)
      // Production-origin guard: Cloudflare Pages'ta eski Site URL yüzünden fallback olursa, burada açıkça prod origin'i gönderiyoruz.
      const isProd = typeof window !== 'undefined' && window.location.hostname.endsWith('pages.dev')
      const prodOrigin = 'https://venthub-hvac-esite.pages.dev'
      const origin = isProd ? prodOrigin : window.location.origin
      const redirectTo = `${origin}/auth/callback`
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
      if (error) {
        console.error('Google sign-in error:', error)
        toast.error('Google ile giriş başlatılamadı')
      }
    } catch (e) {
      console.error('Google sign-in exception:', e)
      toast.error('Google ile giriş sırasında beklenmeyen hata')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-air-blue via-clean-white to-light-gray">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-repeat" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}} />
      </div>

      <div className="relative max-w-md mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to={from}
          className="inline-flex items-center space-x-2 text-steel-gray hover:text-primary-navy mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{t('auth.back')}</span>
        </Link>

        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-hvac-lg border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-primary-navy text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Lock size={28} />
            </div>
            <h1 className="text-2xl font-bold text-industrial-gray mb-2">
              {t('auth.loginTitle')}
            </h1>
            <p className="text-steel-gray">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-industrial-gray mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-3.5 text-steel-gray" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                  placeholder="ornek@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-industrial-gray mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3.5 text-steel-gray" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                  placeholder="••••••••"
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
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-steel-gray">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>{t('auth.rememberMe')}</span>
              </label>
              <Link
                to="/auth/forgot-password"
                className="text-sm text-primary-navy hover:text-secondary-blue"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  {t('auth.loggingIn')}
                </div>
              ) : (
                t('auth.login')
              )}
            </button>
          </form>

          {/* Or divider */}
          <div className="my-4 flex items-center">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="px-3 text-xs text-steel-gray">veya</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border border-light-gray text-industrial-gray font-semibold py-3 px-6 rounded-lg transition-colors hover:border-primary-navy disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Google ile giriş"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {/* Google logo (data URI) */}
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 18'%3E%3Cpath fill='%234285F4' d='M17.64 9.2045c0-.6381-.0573-1.2518-.1637-1.8364H9v3.4745h4.8445c-.2086 1.125-.842 2.0781-1.796 2.7146v2.2568h2.908C16.98 14.36 17.64 11.955 17.64 9.2045z'/%3E%3Cpath fill='%2334A853' d='M9 18c2.43 0 4.4684-.8055 5.9573-2.191l-2.908-2.2568c-.8085.54-1.8427.8578-3.0493.8578-2.3445 0-4.329-1.5838-5.0358-3.7106H.957v2.33C2.438 15.943 5.482 18 9 18z'/%3E%3Cpath fill='%23FBBC05' d='M3.9642 10.6995C3.7785 10.1595 3.6705 9.582 3.6705 9s.108-1.1595.2937-1.6995v-2.33H.957C.347 6.4065 0 7.6665 0 9s.347 2.5935.957 4.029l3.0072-2.3295z'/%3E%3Cpath fill='%23EA4335' d='M9 3.5455c1.319 0 2.508.4536 3.4413 1.3436l2.581-2.581C13.465.909 11.43 0 9 0 5.482 0 2.438 2.057.957 4.971l3.0072 2.3295C4.671 5.1737 6.6555 3.5455 9 3.5455z'/%3E%3C/svg%3E"
                width={18}
                height={18}
                alt=""
                aria-hidden="true"
                style={{ display: 'block' }}
              />
              <span>Google ile giriş</span>
            </span>
          </button>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-steel-gray">
              {t('auth.noAccount')} {' '}
              <Link
                to="/auth/register"
                className="text-primary-navy hover:text-secondary-blue font-medium"
              >
                {t('auth.register')}
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <div className="grid grid-cols-3 gap-4 text-sm text-steel-gray">
            <div>
              <div className="text-primary-navy font-medium mb-1">🔒</div>
              <div>Güvenli</div>
            </div>
            <div>
              <div className="text-primary-navy font-medium mb-1">⚡</div>
              <div>Hızlı</div>
            </div>
            <div>
              <div className="text-primary-navy font-medium mb-1">📱</div>
              <div>Mobil Uyumlu</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
