'use client'

import React from 'react'
import { toast } from 'sonner'
import type { Product } from '@/types/ui-models'
import AddToCartToastContent from './AddToCartToastContent'

const EVENT = 'vh_cart_item_added'

const AddToCartToast: React.FC = () => {
  React.useEffect(() => {
    const onAdded = (e: Event) => {
      // TypeScript derleyicisini tatmin etmek ve zero-any sağlamak için CustomEvent cast
      const customEvent = e as CustomEvent<{ product?: Product }>
      const detail = customEvent.detail
      
      if (detail?.product) {
        const product = detail.product
        
        // Sonner custom toast motoruna görsel kartımızı iletiyoruz
        toast.custom(
          (id) => (
            <AddToCartToastContent 
              product={product} 
              onClose={() => toast.dismiss(id)} 
            />
          ),
          { 
            duration: 5000,
            id: `cart-toast-${product.id}-${Date.now()}` // Çakışmaları engellemek için benzersiz ID
          }
        )
      }
    }
    
    window.addEventListener(EVENT, onAdded as EventListener)
    return () => {
      window.removeEventListener(EVENT, onAdded as EventListener)
    }
  }, [])

  // Saf Controller sıfır DOM döndürür
  return null
}

export default AddToCartToast





