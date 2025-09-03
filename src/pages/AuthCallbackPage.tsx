import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export const AuthCallbackPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

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
              setMessage('E-posta başarıyla doğrulandı! Anasayfaya yönlendiriliyorsunuz...')
              toast.success('E-posta başarıyla doğrulandı!')
              setTimeout(() => {
                navigate('/')
              }, 2000)
              return
            }
          }

          if (error) {
            console.error('Error exchanging code for session:', error.message)
            setStatus('error')
            setMessage('E-posta doğrulama sırasında hata oluştu: ' + error.message)
            // Redirect to error page after 3 seconds
            setTimeout(() => {
              navigate('/auth/login?error=' + encodeURIComponent(error.message))
            }, 3000)
            return
          }

          if (data.session) {
            setStatus('success')
            setMessage('E-posta başarıyla doğrulandı! Anasayfaya yönlendiriliyorsunuz...')
            toast.success('E-posta başarıyla doğrulandı!')
            // Successfully signed in, redirect to app
            setTimeout(() => {
              navigate('/')
            }, 2000)
            return
          }
        }

        // If we get here, something went wrong
        setStatus('error')
        setMessage('Doğrulama linki geçersiz veya süresi dolmuş')
        setTimeout(() => {
          navigate('/auth/login?error=No session found')
        }, 3000)
      } catch (error: unknown) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage('Beklenmeyen bir hata oluştu')
        setTimeout(() => {
          navigate('/auth/login')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-air-blue via-clean-white to-light-gray flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-hvac-lg border border-white/20 p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy mx-auto mb-4" />
              <h1 className="text-xl font-bold text-industrial-gray mb-2">
                E-posta Doğrulanıyor...
              </h1>
              <p className="text-steel-gray">
                Lütfen bekleyin, hesabınız doğrulanıyor.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="bg-success-green text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} />
              </div>
              <h1 className="text-xl font-bold text-industrial-gray mb-2">
                Doğrulama Başarılı!
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
                Doğrulama Hatası
              </h1>
              <p className="text-steel-gray mb-4">
                {message}
              </p>
              <button
                onClick={() => navigate('/auth/login')}
                className="bg-primary-navy hover:bg-secondary-blue text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Giriş Sayfasına Dön
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthCallbackPage
