import type { Product } from './ui-models'

export interface CartItem {
  id: string
  product: Product
  quantity: number
  // Snapshot unit price (role/tier-based) if available
  unitPrice?: number
}
