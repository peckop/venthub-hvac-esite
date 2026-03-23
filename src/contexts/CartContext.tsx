import { createContext } from 'react'
import type { Product } from '../lib/supabase'

export interface CartItem {
  id: string
  product: Product
  quantity: number
  // Snapshot unit price (role/tier-based) if available
  unitPrice?: number
}

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
  applyServerPricing: (items: { product_id: string, unit_price: number }[]) => void
}

export const CartContext = createContext<CartContextType | undefined>(undefined)



