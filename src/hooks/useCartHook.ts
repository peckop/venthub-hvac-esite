import { useContext } from 'react'

import { CartContext } from '../contexts/CartContext'

// Statik build/izole ortam (provider DIŞI) için no-op fallback — MODÜL SABİTİ (referans stabil).
// Inline döndürülürse her render yeni referans → tüketici dep olarak kullanırsa sonsuz döngü.
const CART_FALLBACK = {
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

/**
 * Safely consumes the CartContext to provide shopping cart state and actions.
 * If used outside of a CartProvider (e.g., in static builds or isolated tests), it returns a safe, no-op fallback object
 * to prevent runtime errors.
 *
 * @returns The current cart context containing items, totals, and modification functions.
 *
 * @example
 * const { items, addToCart, getCartTotal } = useCart();
 * console.log(`Cart has ${items.length} items totaling ${getCartTotal()}`);
 */
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    // Statik build veya izole ortamlar için güvenli geri dönüş
    return CART_FALLBACK
  }
  return context
}



