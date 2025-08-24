import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const state = (location.state ?? null) as { from?: { pathname?: string } } | null
  const from = state?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('E-posta ve şifre alanları zorunludur')
      return
    }

    setLoading(true)
    
    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        if (error.message?.includes('Invalid login credentials')) {
          toast.error('E-posta veya şifre hatalı')
        } else if (error.message?.includes('Email not confirmed')) {
          toast.error('E-posta adresinizi doğrulamanız gerekiyor')
        } else {
          toast.error(error.message || 'Giriş sırasında hata oluştu')
        }
      } else {
        // Success - navigate to intended page
        navigate(from, { replace: true })
      }
    } catch (error) {
      toast.error('Beklenmeyen bir hata oluştu')
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
          <span>Geri Dön</span>
        </Link>

        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-hvac-lg border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-primary-navy text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Lock size={28} />
            </div>
            <h1 className="text-2xl font-bold text-industrial-gray mb-2">
              Giriş Yap
            </h1>
            <p className="text-steel-gray">
              VentHub hesabınıza giriş yapın
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-industrial-gray mb-2">
                E-posta Adresi
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
                Şifre
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

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/auth/forgot-password"
                className="text-sm text-primary-navy hover:text-secondary-blue"
              >
                Şifremi Unuttum
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
                  Giriş Yapılıyor...
                </div>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-steel-gray">
              Hesabınız yok mu?{' '}
              <Link
                to="/auth/register"
                className="text-primary-navy hover:text-secondary-blue font-medium"
              >
                Kayıt Ol
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