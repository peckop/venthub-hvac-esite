import React, { createContext, useEffect, useState, ReactNode, useRef } from 'react'
import { Product, getOrCreateShoppingCart, upsertCartItem, removeCartItem as removeDbCartItem, clearCartItems as clearDbCartItems, listCartItemsWithProducts, getEffectivePriceInfo } from '../lib/supabase'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'

// Feature flag: server-side cart sync
const CART_SERVER_SYNC = ((import.meta as any).env?.VITE_CART_SERVER_SYNC ?? 'true') === 'true'

interface CartItem {
  id: string
  product: Product
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export { CartContext }

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { user } = useAuth()
  const [serverCartId, setServerCartId] = useState<string | null>(null)
  const mergingRef = useRef(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('venthub-cart')
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem('venthub-cart', JSON.stringify(items))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }, [items])

  // Helper: merge two cart item arrays by product.id (sum quantities)
  function mergeItems(local: CartItem[], server: CartItem[]) {
    // Server wins: take server quantities as source of truth, add only missing local products.
    const map = new Map<string, CartItem>()
    for (const it of server) {
      map.set(it.product.id, it)
    }
    for (const it of local) {
      if (!map.has(it.product.id)) {
        map.set(it.product.id, it)
      }
      // if exists on server, keep server quantity
    }
    return Array.from(map.values())
  }

  // When user logs in, sync/merge guest cart with server cart and keep them in sync
  useEffect(() => {
    let cancelled = false
    async function syncWithServer() {
      if (!CART_SERVER_SYNC || !user || mergingRef.current) return
      mergingRef.current = true
      try {
        const cart = await getOrCreateShoppingCart(user.id)
        if (cancelled) return
        setServerCartId(cart.id)

        // Fetch server items
        const serverRows = await listCartItemsWithProducts(cart.id)
        const serverItems: CartItem[] = serverRows.map(({ item, product }) => ({ id: item.product_id, product, quantity: item.quantity }))

        // Merge local guest items with server items
        const merged = mergeItems(items, serverItems)
        setItems(merged)

        // Upsert all merged items to server (idempotent)
        for (const it of merged) {
          try {
            const info = await getEffectivePriceInfo(it.product)
            await upsertCartItem({ cartId: cart.id, productId: it.product.id, quantity: it.quantity, unitPrice: info.unitPrice, priceListId: info.priceListId })
          } catch (e) {
            console.error('cart upsert error', e)
          }
        }

        // Persist merged cart for instant hydration on next load and mark owner
        try {
          localStorage.setItem('venthub-cart', JSON.stringify(merged))
          localStorage.setItem('venthub-cart-owner', user.id)
        } catch {}
      } catch (e) {
        console.error('cart sync error', e)
      } finally {
        mergingRef.current = false
      }
    }
    syncWithServer()
    return () => { cancelled = true }
    // only run when user changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const addToCart = (product: Product, quantity = 1) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.product.id === product.id)
      
      if (existingItem) {
        return currentItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        return [...currentItems, { id: product.id, product, quantity }]
      }
    })

    // If logged in, also sync to server (optimistic)
    if (CART_SERVER_SYNC && user && serverCartId) {
      // compute effective price and upsert optimistically
      getEffectivePriceInfo(product)
        .then(info => upsertCartItem({ cartId: serverCartId, productId: product.id, quantity: (items.find(i => i.product.id === product.id)?.quantity || 0) + quantity, unitPrice: info.unitPrice, priceListId: info.priceListId }))
        .catch(err => console.error('server addToCart error', err))
    }

    // Dispatch a global event so UI can present a rich toast/modal
    try {
      window.dispatchEvent(new CustomEvent('vh_cart_item_added', { detail: { product } }))
    } catch {
      try {
        toast.success(`${product.name} sepete eklendi!`, { duration: 2500, position: 'top-right' })
      } catch {}
    }
  }

  const removeFromCart = (productId: string) => {
    setItems(currentItems => {
      const item = currentItems.find(item => item.product.id === productId)
      if (item) {
        toast.success(`${item.product.name} sepetten çıkarıldı`, { duration: 2000, position: 'top-right' })
      }
      return currentItems.filter(item => item.product.id !== productId)
    })

    if (CART_SERVER_SYNC && user && serverCartId) {
      removeDbCartItem(serverCartId, productId).catch(err => console.error('server removeFromCart error', err))
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    )

    if (CART_SERVER_SYNC && user && serverCartId) {
      const product = items.find(i => i.product.id === productId)?.product
      if (product) {
        getEffectivePriceInfo(product)
          .then(info => upsertCartItem({ cartId: serverCartId, productId, quantity, unitPrice: info.unitPrice, priceListId: info.priceListId }))
          .catch(err => console.error('server updateQuantity error', err))
      }
    }
  }

  const clearCart = () => {
    setItems([])
    toast.success('Sepet temizlendi', { duration: 2000, position: 'top-right' })
    if (CART_SERVER_SYNC && user && serverCartId) {
      clearDbCartItems(serverCartId).catch(err => console.error('server clearCart error', err))
    }
  }

  const getCartTotal = () => {
    return items.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0)
  }

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

