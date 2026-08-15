'use client'

import { usePathname,useRouter } from 'next/navigation'
import React, { useCallback,useEffect, useRef } from 'react'

import { PENDING_ORDER_KEY } from '../hooks/useCheckoutPayment'

/**
 * 3DS penceresinden dönemeyen müşteriyi kurtaran güvenlik ağı.
 *
 * ## Bu bileşen 2026-08-15'e kadar HİÇ çalışmadı — iki bağımsız sebeple
 *
 * 1. **Tetikleyicisi yoktu.** `vh_pending_order` anahtarını kodun hiçbir yeri YAZMIYORDU
 *    (dokuz kullanımın hepsi `getItem`/`removeItem`) → `raw` daima `null` → erken çıkış,
 *    zamanlayıcı hiç başlamıyordu. Artık `useCheckoutPayment` ödeme başlarken yazıyor;
 *    anahtar adı oradan import ediliyor ki iki taraf ayrışmasın.
 * 2. **İmkânsız bir değeri bekliyordu.** `status === 'paid'` / `'failed'` arıyordu ama
 *    `venthub_orders_status_check` yalnız pending/confirmed/processing/shipped/delivered/
 *    cancelled kabul ediyor (prod'dan doğrulandı). Doğru sinyal `payment_status`:
 *    `sync_payment_status_with_status` tetikleyicisi status 'confirmed' olunca onu
 *    'paid' yapıyor.
 *
 * ## Bilinen sınır — başarısızlık hâlâ görülemiyor
 * `iyzico-callback:453` başarısızlıkta `status='failed'` yazmaya çalışıyor; bu değer de
 * CHECK listesinde olmadığı için PATCH reddediliyor ve sipariş `pending` kalıyor
 * (başarılı dalda `'confirmed'` geri-dönüşü var, başarısız dalda yok). Yani reddedilen
 * ödeme buradan tespit EDİLEMEZ. O yarı edge tarafında onarılmalı (`T042-VH`); burada
 * `payment_status === 'failed'` kontrolü, onarım indiği an çalışsın diye şimdiden duruyor.
 */
const PaymentWatcher: React.FC = () => {
  const router = useRouter()
  const checkingRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  const pathname = usePathname()

  const checkOnce = useCallback(async () => {
    if (checkingRef.current) return
    checkingRef.current = true
    try {
      const raw = localStorage.getItem(PENDING_ORDER_KEY)
      if (!raw) return
      const data = JSON.parse(raw || '{}') as { orderId?: string, conversationId?: string }
      const orderId = data.orderId
      if (!orderId) return
      const { supabaseBrowserClient: supabase } = await import('../lib/supabase/client')
      const { data: row, error } = await supabase
        .from('venthub_orders')
        .select('payment_status')
        .eq('id', orderId)
        .maybeSingle()
      if (!error && row?.payment_status) {
        if (row.payment_status === 'paid') {
          localStorage.removeItem(PENDING_ORDER_KEY)
          router.push(`/payment-success?orderId=${encodeURIComponent(orderId)}&status=success`)
        } else if (row.payment_status === 'failed') {
          localStorage.removeItem(PENDING_ORDER_KEY)
          router.push(`/payment-success?orderId=${encodeURIComponent(orderId)}&status=failure`)
        }
      }
    } finally {
      checkingRef.current = false
    }
  }, [router])

  useEffect(() => {
    const onFocus = () => { checkOnce() }
    const onVisibility = () => { if (document.visibilityState === 'visible') checkOnce() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)

    // Eğer bekleyen sipariş varsa periyodik kontrol
    const raw = localStorage.getItem(PENDING_ORDER_KEY)
    if (raw) {
      timerRef.current = window.setInterval(checkOnce, 3000)
    }

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [router, pathname, checkOnce])

  return null
}

export default PaymentWatcher
