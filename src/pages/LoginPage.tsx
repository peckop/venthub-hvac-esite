import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useI18n } from '../i18n/I18nProvider'

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
