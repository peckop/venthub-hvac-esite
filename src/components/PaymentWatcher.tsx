import React, { useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const STORAGE_KEY = 'vh_pending_order'

export const PaymentWatcher: React.FC = () => {
  const navigate = useNavigate()
  const checkingRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  const location = useLocation()

  const checkOnce = useCallback(async () => {
    if (checkingRef.current) return
    checkingRef.current = true
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw || '{}') as { orderId?: string, conversationId?: string }
      const orderId = data.orderId
      if (!orderId) return
      const { supabase } = await import('../lib/supabase')
      const { data: row, error } = await supabase
        .from('venthub_orders')
        .select('status')
        .eq('id', orderId)
        .maybeSingle()
      if (!error && row?.status) {
        if (row.status === 'paid') {
          localStorage.removeItem(STORAGE_KEY)
          navigate(`/payment-success?orderId=${encodeURIComponent(orderId)}&status=success`)
        } else if (row.status === 'failed') {
          localStorage.removeItem(STORAGE_KEY)
          navigate(`/payment-success?orderId=${encodeURIComponent(orderId)}&status=failure`)
        }
      }
    } finally {
      checkingRef.current = false
    }
  }, [navigate])

  useEffect(() => {
    const onFocus = () => { checkOnce() }
    const onVisibility = () => { if (document.visibilityState === 'visible') checkOnce() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)

    // Eğer bekleyen sipariş varsa periyodik kontrol
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      timerRef.current = window.setInterval(checkOnce, 3000)
    }

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [navigate, location.pathname, checkOnce])

  return null
}

export default PaymentWatcher

