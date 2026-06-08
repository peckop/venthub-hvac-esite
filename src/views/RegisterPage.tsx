'use client'

import { ArrowLeft, CheckCircle,Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { toast } from 'sonner'

import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../i18n/I18nProvider'
import { hibpPwnedCount } from '../utils/passwordSecurity'
import { Routes } from '../utils/routes'

const RegisterPage: React.FC = () => {
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

  const passwordRules = [
    { key: 'length',  label: t('auth.pwRule.length')  || 'En az 8 karakter',     test: (p: string) => p.length >= 8 },
    { key: 'upper',   label: t('auth.pwRule.upper')   || 'En az 1 büyük harf',   test: (p: string) => /[A-Z]/.test(p) },
    { key: 'digit',   label: t('auth.pwRule.digit')   || 'En az 1 rakam',        test: (p: string) => /[0-9]/.test(p) },
    { key: 'special', label: t('auth.pwRule.special') || 'En az 1 özel karakter', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ]

  const passedRules = passwordRules.filter(r => r.test(formData.password)).length
  const strengthColor = passedRules <= 1 ? 'bg-red-500' : passedRules === 2 ? 'bg-orange-400' : passedRules === 3 ? 'bg-yellow-400' : 'bg-green-500'
  const strengthLabel = passedRules <= 1 ? (t('auth.pwStrength.weak') || 'Zayıf') : passedRules === 2 ? (t('auth.pwStrength.fair') || 'Orta') : passedRules === 3 ? (t('auth.pwStrength.good') || 'İyi') : (t('auth.pwStrength.strong') || 'Güçlü')

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error(t('auth.errors.nameRequired') || t('auth.name'))
      return false
    }

    if (!formData.email || !formData.email.includes('@')) {
      toast.error(t('auth.emailInvalid') || t('auth.validEmailPassRequired'))
      return false
    }

    if (passedRules < 4) {
      toast.error(t('auth.pwRule.allRequired') || 'Şifreniz tüm güvenlik kurallarını karşılamalıdır')
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
              {t('auth.registrationCompleteTitle')}
            </h1>
            <p className="text-steel-gray mb-6 leading-relaxed">
              {t('auth.registrationCompleteDesc')}
            </p>
            <div className="space-y-3">
              <Link
                href={Routes.auth.login()}
                className="w-full bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-3 px-6 rounded-lg transition-colors block"
              >
                {t('auth.backToLogin')}
              </Link>
              <Link
                href={Routes.home()}
                className="w-full border-2 border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors block"
              >
                {t('auth.backHome')}
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
        <div className="absolute inset-0 bg-repeat" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='https://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
      </div>

      <div className="relative max-w-md mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href={Routes.home()}
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
                  className="w-full pl-10 pr-4 py-3 border border-light-gray rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:border-transparent"
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
                  className="w-full pl-10 pr-4 py-3 border border-light-gray rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:border-transparent"
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
              {/* Şifre Güç Göstergesi */}
              {formData.password.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1 h-1.5">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`flex-1 rounded-full transition-colors duration-300 ${
                        i <= passedRules ? strengthColor : 'bg-light-gray'
                      }`} />
                    ))}
                  </div>
                  <p className="text-xs text-steel-gray">
                    {t('auth.pwStrength.label') || 'Güvenlik'}: <span className="font-semibold">{strengthLabel}</span>
                  </p>
                  <ul className="space-y-1">
                    {passwordRules.map(rule => (
                      <li key={rule.key} className={`flex items-center gap-1.5 text-xs transition-colors ${
                        rule.test(formData.password) ? 'text-green-600' : 'text-steel-gray'
                      }`}>
                        <span>{rule.test(formData.password) ? '✓' : '○'}</span>
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
                  className="w-full pl-10 pr-12 py-3 border border-light-gray rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:border-transparent"
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
                href={Routes.auth.login()}
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



