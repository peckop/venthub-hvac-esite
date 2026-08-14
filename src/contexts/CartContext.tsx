import { createContext } from 'react'

import type { CartItem } from '../types/cart'
import type { Product } from '../types/ui-models'


export interface CartContextType {
  items: CartItem[]
  syncing: boolean
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (_productId: string) => void
  updateQuantity: (_productId: string, quantity: number) => void
  clearCart: (opts?: { silent?: boolean }) => void
  getCartTotal: () => number
  getCartCount: () => number
  // Yeni: Sunucunun hesapladığı birim fiyatları uygula (mismatch sonrası loop'u kırmak için)
  applyServerPricing: (items: { product_id: string, unit_price: number | null }[]) => void
}

export const CartContext = createContext<CartContextType | undefined>(undefined)



