import { AlertCircle,CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import { useI18n } from '../i18n/I18nProvider'
import { Routes } from '../utils/routes'

const AuthCallbackPage: React.FC = () => {
  const { t } = useI18n()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // Get the hash fragment from the URL
        const hashFragment = window.location.hash

        if (hashFragment && hashFragment.length > 0) {
          // Handle auth callback with URL hash
          const { data, error } = await supabase.auth.getSession()
          
          // If no session yet, try to exchange the tokens from URL
          if (!data.session) {
            const { error: sessionError } = await supabase.auth.exchangeCodeForSession(window.location.href)
            if (sessionError) {
              console.error('Error exchanging tokens:', sessionError)
            }
            // Get session again after exchange
            const { data: newData, error: newError } = await supabase.auth.getSession()
            if (newError) {
              throw newError
            }
            if (newData.session) {
              setStatus('success')
              setMessage(t('auth.callback.successRedirect'))
              toast.success(t('auth.callback.successToast'))
              setTimeout(() => {
                router.push(Routes.home())
              }, 2000)
              return
            }
          }

          if (error) {
            console.error('Error exchanging code for session:', error.message)
            setStatus('error')
            setMessage(t('auth.callback.verifyError', { message: error.message }))
            // Redirect to error page after 3 seconds
            setTimeout(() => {
              router.push(Routes.auth.login(undefined, error.message))
            }, 3000)
            return
          }

          if (data.session) {
            setStatus('success')
            setMessage('E-posta başarıyla doğrulandı! Anasayfaya yönlendiriliyorsunuz...')
            toast.success('E-posta başarıyla doğrulandı!')
            // Successfully signed in, redirect to app
            setTimeout(() => {
              router.push(Routes.home())
            }, 2000)
            return
          }
        }

        // If we get here, something went wrong
        setStatus('error')
        setMessage(t('auth.callback.invalidLink'))
        setTimeout(() => {
          router.push(Routes.auth.login(undefined, 'No session found'))
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
  }, [router, t])

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




