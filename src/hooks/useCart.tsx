import React, { createContext, useEffect, useState, ReactNode, useRef } from 'react'
import { Product, getOrCreateShoppingCart, upsertCartItem, removeCartItem as removeDbCartItem, clearCartItems as clearDbCartItems, listCartItemsWithProducts, getEffectivePriceInfo } from '../lib/supabase'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'

// Feature flag: server-side cart sync
const CART_SERVER_SYNC = ((import.meta as any).env?.VITE_CART_SERVER_SYNC ?? 'true') === 'true'

// LocalStorage keys
const CART_LOCAL_STORAGE_KEY = 'venthub-cart'
const CART_VERSION_KEY = 'venthub-cart-version'
const CART_OWNER_KEY = 'venthub-cart-owner'

interface CartItem {
  id: string
  product: Product
  quantity: number
  // Snapshot unit price (role/tier-based) if available
  unitPrice?: number
}

interface CartContextType {
  items: CartItem[]
  syncing: boolean
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
  // Yeni: Sunucunun hesapladığı birim fiyatları uygula (mismatch sonrası loop'u kırmak için)
  applyServerPricing: (items: { product_id: string, unit_price: number }[]) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export { CartContext }

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { user } = useAuth()
  const [serverCartId, setServerCartId] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const mergingRef = useRef(false)
  const localVersionRef = useRef<number>(0)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_LOCAL_STORAGE_KEY)
      const savedVer = localStorage.getItem(CART_VERSION_KEY)
      if (savedVer) {
        const v = parseInt(savedVer, 10)
        if (Number.isFinite(v)) localVersionRef.current = v
      }
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
    }
  }, [])

  // Save cart to localStorage whenever items change (and bump version)
  useEffect(() => {
    try {
      localStorage.setItem(CART_LOCAL_STORAGE_KEY, JSON.stringify(items))
      const v = Date.now()
      localVersionRef.current = v
      localStorage.setItem(CART_VERSION_KEY, String(v))
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
      setSyncing(true)
      try {
        const cart = await getOrCreateShoppingCart(user.id)
        if (cancelled) return
        setServerCartId(cart.id)

        // Fetch server items
        const serverRows = await listCartItemsWithProducts(cart.id)
        const serverItems: CartItem[] = serverRows.map(({ item, product }) => ({ id: item.product_id, product, quantity: item.quantity }))

        // Merge local guest items with server items
        const merged = mergeItems(items, serverItems)
        // Compute unit prices for merged items and upsert server
        const priceInfoList = await Promise.all(
          merged.map(async (it) => {
            try {
              const info = await getEffectivePriceInfo(it.product)
              await upsertCartItem({ cartId: cart.id, productId: it.product.id, quantity: it.quantity, unitPrice: info.unitPrice, priceListId: info.priceListId })
              return { productId: it.product.id, unitPrice: info.unitPrice }
            } catch (e) {
              console.error('cart upsert error', e)
              return { productId: it.product.id, unitPrice: undefined as number | undefined }
            }
          })
        )
        const unitMap = new Map<string, number | undefined>(priceInfoList.map(p => [p.productId, p.unitPrice]))
        const mergedWithPrices = merged.map(it => ({ ...it, unitPrice: unitMap.get(it.product.id) ?? it.unitPrice }))
        setItems(mergedWithPrices)

        // Clear guest cart to avoid double-merge next time
        try {
          localStorage.removeItem(CART_LOCAL_STORAGE_KEY)
          localStorage.setItem(CART_LOCAL_STORAGE_KEY, JSON.stringify(mergedWithPrices))
          localStorage.setItem(CART_OWNER_KEY, user.id)
          const v = Date.now()
          localVersionRef.current = v
          localStorage.setItem(CART_VERSION_KEY, String(v))
        } catch (e) {}
      } catch (e) {
        console.error('cart sync error', e)
      } finally {
        mergingRef.current = false
        setSyncing(false)
      }
    }
    syncWithServer()
    return () => { cancelled = true }
    // only run when user changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Cross-tab sync via storage events (newer version wins)
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (!e.key || (e.key !== CART_LOCAL_STORAGE_KEY && e.key !== CART_VERSION_KEY)) return
      try {
        const owner = localStorage.getItem(CART_OWNER_KEY)
        if (user && owner && owner !== user.id) return
        const vStr = localStorage.getItem(CART_VERSION_KEY) || '0'
        const v = parseInt(vStr, 10) || 0
        if (v > localVersionRef.current) {
          const raw = localStorage.getItem(CART_LOCAL_STORAGE_KEY)
          if (raw) {
            const next = JSON.parse(raw)
            setItems(next)
            localVersionRef.current = v
          }
        }
      } catch (e) {}
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
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
      // compute effective price and upsert optimistically, also reflect locally
      getEffectivePriceInfo(product)
        .then(info => {
          upsertCartItem({ cartId: serverCartId, productId: product.id, quantity: (items.find(i => i.product.id === product.id)?.quantity || 0) + quantity, unitPrice: info.unitPrice, priceListId: info.priceListId })
            .catch(err => console.error('server addToCart error', err))
          // Update local snapshot unit price
          setItems(curr => curr.map(it => it.product.id === product.id ? { ...it, unitPrice: info.unitPrice } : it))
        })
        .catch(err => console.error('server addToCart error', err))
    }

    // Dispatch a global event so UI can present a rich toast/modal
    try {
      window.dispatchEvent(new CustomEvent('vh_cart_item_added', { detail: { product } }))
    } catch (e) {
      try {
        toast.success(`${product.name} sepete eklendi!`, { duration: 2500, position: 'top-right' })
      } catch (e) {}
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
          .then(info => {
            upsertCartItem({ cartId: serverCartId, productId, quantity, unitPrice: info.unitPrice, priceListId: info.priceListId })
              .catch(err => console.error('server updateQuantity error', err))
            // Ensure local snapshot unit price is present
            setItems(curr => curr.map(it => it.product.id === productId ? { ...it, unitPrice: info.unitPrice } : it))
          })
          .catch(err => console.error('server updateQuantity error', err))
      }
    }
  }

  const clearCart = () => {
    setItems([])
    
    // Clear all localStorage cart data
    try {
      localStorage.removeItem(CART_LOCAL_STORAGE_KEY)
      localStorage.removeItem(CART_VERSION_KEY)
      localStorage.removeItem(CART_OWNER_KEY)
      localStorage.removeItem('vh_pending_order')
      
      // Dispatch cross-tab sync event
      window.dispatchEvent(new StorageEvent('storage', {
        key: CART_LOCAL_STORAGE_KEY,
        newValue: JSON.stringify([]),
        oldValue: null,
        storageArea: localStorage
      }))
    } catch (e) {
      console.error('Error clearing localStorage:', e)
    }
    
    toast.success('Sepet temizlendi', { duration: 2000, position: 'top-right' })
    
    if (CART_SERVER_SYNC && user && serverCartId) {
      clearDbCartItems(serverCartId).catch(err => console.error('server clearCart error', err))
    }
  }

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const unit = typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(item.product.price)
      return total + unit * item.quantity
    }, 0)
  }

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  // Sunucudan gelen birim fiyatları yerel sepete uygula ve (varsa) sunucu sepetine yaz
  const applyServerPricing = (serverItems: { product_id: string, unit_price: number }[]) => {
    if (!Array.isArray(serverItems) || serverItems.length === 0) return
    const pmap = new Map<string, number>()
    for (const it of serverItems) {
      const pid = String(it.product_id)
      const up = Number(it.unit_price)
      if (Number.isFinite(up)) pmap.set(pid, up)
    }
    // Yerel güncelle
    setItems(curr => curr.map(it => pmap.has(it.product.id) ? { ...it, unitPrice: pmap.get(it.product.id)! } : it))
    // Sunucuya da yansıt (varsa)
    if (CART_SERVER_SYNC && user && serverCartId) {
      try {
        const tasks = items.map(it => {
          const up = pmap.get(it.product.id)
          if (up == null) return Promise.resolve()
          return upsertCartItem({ cartId: serverCartId, productId: it.product.id, quantity: it.quantity, unitPrice: up, priceListId: undefined })
            .catch(e => console.warn('applyServerPricing upsert error', e))
        })
        Promise.allSettled(tasks).catch(()=>{})
      } catch (e) { /* no-op */ }
    }
  }

  const value = {
    items,
    syncing,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    applyServerPricing,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

