import { useState } from 'react'
import toast from 'react-hot-toast'

export const useCheckoutCoupon = (totalAmount: number) => {
  const [couponCode, setCouponCode] = useState<string>('')
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null)

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (code.length < 3) {
      toast.error('Kupon kodu geçersiz');
      return;
    }

    try {
      // Use standard fetch for Edge Functions
      const base = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      
      const resp = await fetch(`${base}/functions/v1/apply-coupon`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'apikey': anon,
          'Authorization': `Bearer ${anon}`
        },
        body: JSON.stringify({ code, subtotal: totalAmount })
      });

      const json = await resp.json().catch(() => ({}));
      
      if (!resp.ok || !json?.valid) {
        toast.error(json?.error || 'Kupon uygulanamadı');
        setCouponApplied(null)
        return;
      }

      setCouponApplied({ 
        code: json.normalized_code || code, 
        discount: Number(json.discount_amount || 0) 
      })
      toast.success('Kupon uygulandı');
    } catch (e) {
      console.error(e);
      toast.error('Kupon doğrulanamadı');
    }
  }

  const removeCoupon = () => {
    setCouponApplied(null)
    setCouponCode('')
  }

  return {
    couponCode,
    setCouponCode,
    couponApplied,
    applyCoupon,
    removeCoupon
  }
}
