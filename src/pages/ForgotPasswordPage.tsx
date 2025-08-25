import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useI18n } from '../i18n/I18nProvider'

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { resetPassword } = useAuth()
  const { t } = useI18n()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
toast.error(t('auth.email') + ' ' + t('auth.required') || 'Required')
      return
    }

    setLoading(true)
    
    try {
      const { error } = await resetPassword(email)
      
      if (error) {
        if (error.message?.includes('User not found')) {
          toast.error(t('auth.userNotFound') || 'User not found')
        } else {
          toast.error(error.message || t('auth.resetError') || 'Reset error')
        }
      } else {
        setEmailSent(true)
        toast.success(t('auth.resetEmailSent') || 'Email sent')
      }
    } catch (error) {
      toast.error(t('auth.unexpectedError'))
      console.error('Reset password error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-air-blue via-clean-white to-light-gray">
        <div className="relative max-w-md mx-auto px-4 py-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-hvac-lg border border-white/20 p-8 text-center">
            <div className="bg-success-green text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-industrial-gray mb-4">
              E-posta Gönderildi!
            </h1>
            <p className="text-steel-gray mb-6 leading-relaxed">
              <strong>{email}</strong> adresine şifre sıfırlama linki gönderildi. 
              Lütfen e-postanızı kontrol edin ve linke tıklayarak yeni şifrenizi belirleyin.
            </p>
            <div className="space-y-3">
              <Link
                to="/auth/login"
                className="w-full bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 px-6 rounded-lg transition-colors block"
              >
                Giriş Sayfasına Dön
              </Link>
              <button
                onClick={() => setEmailSent(false)}
                className="w-full border-2 border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Başka E-posta Dene
              </button>
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
          to="/auth/login"
          className="inline-flex items-center space-x-2 text-steel-gray hover:text-primary-navy mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{t('auth.back')}</span>
        </Link>

        {/* Forgot Password Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-hvac-lg border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-primary-navy text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Mail size={28} />
            </div>
            <h1 className="text-2xl font-bold text-industrial-gray mb-2">
              {t('auth.forgotPassword')}
            </h1>
            <p className="text-steel-gray">
              {t('auth.resetSubtitle')}
            </p>
          </div>

          {/* Form */}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  {t('auth.submitting') || 'Gönderiliyor...'}
                </div>
              ) : (
t('auth.sendResetLink') || 'Şifre Sıfırlama Linki Gönder'
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-air-blue/20 rounded-lg">
            <p className="text-sm text-steel-gray text-center">
              💡 E-posta gelmezse spam klasörünüzü kontrol etmeyi unutmayın
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage