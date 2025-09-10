import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useI18n } from '../i18n/I18nProvider'
import { hibpPwnedCount } from '../utils/passwordSecurity'

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const { signUp } = useAuth()
  const { t } = useI18n()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error(t('auth.errors.nameRequired') || t('auth.name'))
      return false
    }
    
    if (!formData.email || !formData.email.includes('@')) {
      toast.error(t('auth.emailInvalid') || t('auth.validEmailPassRequired'))
      return false
    }
    
    if (formData.password.length < 8) {
      toast.error(t('auth.passwordMin'))
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.passwordsDontMatch'))
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    
    try {
      // HIBP sızıntı kontrolü (k-Anonymity). Ağ hatasında geçer, sızıntıda engeller.
      const pwned = await hibpPwnedCount(formData.password)
      if (pwned > 0) {
        toast.error(t('auth.passwordPwned') || 'Password appears in known data breaches')
        setLoading(false)
        return
      }
      const { error } = await signUp(formData.email, formData.password, formData.name)
      
      if (error) {
        if (error.message?.includes('already registered')) {
          toast.error(t('auth.emailAlready') || 'Already registered')
        } else if (error.message?.includes('Password should be at least')) {
          toast.error(t('auth.passwordMin'))
        } else {
          toast.error(error.message || t('auth.genericLoginError'))
        }
      } else {
        setRegistrationComplete(true)
        toast.success(t('auth.registrationEmailSent'))
      }
    } catch (error) {
      toast.error(t('auth.unexpectedError'))
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-air-blue via-clean-white to-light-gray">
        <div className="relative max-w-md mx-auto px-4 py-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-hvac-lg border border-white/20 p-8 text-center">
            <div className="bg-success-green text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-industrial-gray mb-4">
              Kayıt Tamamlandı!
            </h1>
            <p className="text-steel-gray mb-6 leading-relaxed">
              E-posta adresinize doğrulama linki gönderildi. 
              Lütfen e-postanızı kontrol ederek hesabınızı doğrulayın.
            </p>
            <div className="space-y-3">
              <Link
                to="/auth/login"
                className="w-full bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 px-6 rounded-lg transition-colors block"
              >
                Giriş Sayfasına Dön
              </Link>
              <Link
                to="/"
                className="w-full border-2 border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors block"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
          to="/"
          className="inline-flex items-center space-x-2 text-steel-gray hover:text-primary-navy mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{t('auth.back')}</span>
        </Link>

        {/* Register Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-hvac-lg border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-primary-navy text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <User size={28} />
            </div>
            <h1 className="text-2xl font-bold text-industrial-gray mb-2">
              {t('auth.registerTitle')}
            </h1>
            <p className="text-steel-gray">
              {t('auth.registerSubtitle')}
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-industrial-gray mb-2">
                {t('auth.name')} *
              </label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-3.5 text-steel-gray" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                  placeholder={t('checkout.personal.namePlaceholder')}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-industrial-gray mb-2">
                {t('auth.email')} *
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-3.5 text-steel-gray" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                  placeholder={t('checkout.personal.emailPlaceholder')}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-industrial-gray mb-2">
                {t('auth.password')} *
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3.5 text-steel-gray" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
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
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-industrial-gray mb-2">
                {t('auth.confirmPassword')} *
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3.5 text-steel-gray" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                  placeholder={t('auth.confirmPassword')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-steel-gray hover:text-primary-navy"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
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
                  {t('auth.registering')}
                </div>
              ) : (
t('auth.register')
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-steel-gray">
              {t('auth.alreadyHave')} {' '}
              <Link
                to="/auth/login"
                className="text-primary-navy hover:text-secondary-blue font-medium"
              >
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
