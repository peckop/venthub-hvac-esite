import { useContext } from 'react'
import { CartContext } from '../contexts/CartContext'

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    // Statik build veya izole ortamlar için güvenli geri dönüş
    return {
      items: [],
      syncing: false,
      addToCart: () => { },
      removeFromCart: () => { },
      updateQuantity: () => { },
      clearCart: () => { },
      getCartTotal: () => 0,
      getCartCount: () => 0,
      applyServerPricing: () => { }
    }
  }
  return context
}



