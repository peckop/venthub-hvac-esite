'use client'

import React, { useState, useTransition, useActionState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useI18n } from '../i18n/I18nProvider'
import { supabase } from '../lib/supabase'

export const LoginPage: React.FC = () => {
  const [isPending, setIsPending] = useState(false)
  const { signIn, role, user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useI18n()
  const from = searchParams?.get('redirect') || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    try {
      const result = await signIn(email, password)
      if (result.error) {
        toast.error(result.error.message)
      } else {
        toast.success(t('auth.loginSuccess'))
        router.refresh()
        router.push(from)
      }
    } catch (err) {
      toast.error(t('auth.loginError'))
    } finally {
      setIsPending(false)
    }
  }

  async function handleGoogleSignIn() {
    try {
      const isProd = typeof window !== 'undefined' && window.location.hostname.endsWith('pages.dev')
      const prodOrigin = 'https://venthub-hvac-esite.pages.dev'
      const origin = isProd ? prodOrigin : window.location.origin
      const redirectTo = `${origin}/auth/callback`
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
      if (error) {
        console.error('Google sign-in error:', error)
        toast.error(t('auth.googleSignInFail'))
      }
    } catch (e) {
      console.error('Google sign-in exception:', e)
      toast.error(t('auth.googleSignInError'))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-air-blue via-clean-white to-light-gray">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-repeat" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='https://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
      </div>

      <div className="relative max-w-md mx-auto px-4 py-8">
        <Link
          href={from}
          className="inline-flex items-center space-x-2 text-steel-gray hover:text-primary-navy mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{t('auth.back')}</span>
        </Link>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-hvac-lg border border-white/20 p-8">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-industrial-gray mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-steel-gray">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-clean-white border border-light-gray rounded-xl focus:ring-2 focus:ring-primary-ocean/20 focus:border-primary-ocean transition-all placeholder:text-gray-400"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-industrial-gray mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-steel-gray">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 bg-clean-white border border-light-gray rounded-xl focus:ring-2 focus:ring-primary-ocean/20 focus:border-primary-ocean transition-all placeholder:text-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-steel-gray hover:text-industrial-gray"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary-ocean border-light-gray rounded focus:ring-primary-ocean/20"
                />
                <span className="text-sm text-steel-gray">{t('auth.rememberMe')}</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-primary-ocean hover:text-primary-navy transition-colors"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary-navy text-white py-3 rounded-xl font-bold hover:bg-industrial-gray active:scale-[0.98] transition-all shadow-hvac-sm flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {isPending && <Loader2 size={20} className="animate-spin" />}
              <span>{isPending ? t('auth.loggingIn') : t('auth.login')}</span>
            </button>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-light-gray" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-steel-gray">
                {t('auth.orContinueWith')}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full bg-white border border-light-gray text-industrial-gray py-2.5 rounded-xl font-medium hover:bg-light-gray/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google ile Giriş Yap</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-steel-gray">
              {t('auth.noAccount')}{' '}
              <Link
                href="/auth/register"
                className="font-bold text-primary-ocean hover:text-primary-navy transition-colors"
              >
                {t('auth.registerNow')}
              </Link>
            </p>
          </div>
        </div>

        {/* Brand Footer        */}
        <div className="mt-8 text-center">
          <Link href="/" className="group inline-flex items-center gap-3 transition-all duration-500">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-navy via-primary-navy to-secondary-blue text-white shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] px-4 py-3 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_25px_50px_-15px_rgba(37,99,235,0.5)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_60%)] opacity-80" />
              <span className="relative block text-sm font-bold tracking-[0.25em]">VH</span>
            </div>
            <div className="text-left">
              <div className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-primary-navy transition-colors">VentHub</div>
              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Ventilation & HVAC</div>
            </div>
          </Link>
          <p className="text-xs text-steel-gray font-medium">
            &copy; {new Date().getFullYear()} VentHub HVAC Solutions. <br />
            {t('common.allRightsReserved')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
