'use client'

import { AlertCircle,CheckCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import { useLocalizedRoutes } from '../hooks/useLocalizedRoutes'
import { useI18n } from '../i18n/I18nProvider'

const AuthCallbackPage: React.FC = () => {
  const { t } = useI18n()
  const Routes = useLocalizedRoutes()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams?.get('next')

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        const hashFragment = window.location.hash
        const hasCode = new URL(window.location.href).searchParams.has('code')
        // Şifre-kurtarma dönüşü iki yoldan gelir: PKCE'de ?next=reset-password (redirectTo'ya
        // bizim yazdığımız), implicit akışta hash içindeki type=recovery.
        const isRecovery = next === 'reset-password' || hashFragment.includes('type=recovery')

        let { data } = await supabase.auth.getSession()

        if (!data.session && hasCode) {
          // PKCE akışı (?code=): kodu oturuma çevir. OAuth ve redirectTo'lu e-posta linkleri buraya düşer.
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href)
          if (exchangeError) {
            console.error('Error exchanging code for session:', exchangeError.message)
          }
          ;({ data } = await supabase.auth.getSession())
        }

        if (!data.session && hashFragment.length > 0) {
          // Implicit akış (hash token): client init'teki detectSessionInUrl işlesin diye kısa bekle.
          for (let i = 0; i < 3 && !data.session; i++) {
            await new Promise(resolve => setTimeout(resolve, 400))
            ;({ data } = await supabase.auth.getSession())
          }
        }

        if (data.session) {
          if (isRecovery) {
            setStatus('success')
            setMessage(t('auth.callback.recoveryRedirect'))
            router.push(Routes.auth.resetPassword())
            return
          }
          setStatus('success')
          setMessage(t('auth.callback.successRedirect'))
          toast.success(t('auth.callback.successToast'))
          setTimeout(() => {
            router.push(Routes.home())
          }, 2000)
          return
        }

        setStatus('error')
        setMessage(t('auth.callback.invalidLink'))
        setTimeout(() => {
          router.push(Routes.auth.login(undefined, t('auth.callback.invalidLink')))
        }, 3000)
      } catch (error: unknown) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage(t('auth.unexpectedError'))
        setTimeout(() => {
          router.push(Routes.auth.login())
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [router, t, Routes, next])

  return (
    <div className="min-h-screen bg-gradient-to-br from-air-blue via-clean-white to-light-gray flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-hvac-lg border border-white/20 p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy mx-auto mb-4" />
              <h1 className="text-xl font-bold text-industrial-gray mb-2">
                {t('auth.callback.loadingTitle')}
              </h1>
              <p className="text-steel-gray">
                {t('auth.callback.loadingDesc')}
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="bg-success-green text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} />
              </div>
              <h1 className="text-xl font-bold text-industrial-gray mb-2">
                {t('auth.callback.successTitle')}
              </h1>
              <p className="text-steel-gray">
                {message}
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="bg-error-red text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} />
              </div>
              <h1 className="text-xl font-bold text-industrial-gray mb-2">
                {t('auth.callback.errorTitle')}
              </h1>
              <p className="text-steel-gray mb-4">
                {message}
              </p>
              <button
                onClick={() => router.push(Routes.auth.login())}
                className="bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {t('auth.backToLogin')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthCallbackPage




