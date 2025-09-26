import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import type { Product } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

// Feature flag: server-side cart sync
interface ImportMeta {
  env?: Record<string, string>
}
const CART_SERVER_SYNC = ((import.meta as ImportMeta).env?.VITE_CART_SERVER_SYNC ?? 'true') === 'true'

// LocalStorage keys
const CART_LOCAL_STORAGE_KEY = 'venthub-cart'
const CART_VERSION_KEY = 'venthub-cart-version'
const CART_OWNER_KEY = 'venthub-cart-owner'
// New: cart schema version key to invalidate stale carts across deployments
const CART_SCHEMA_KEY = 'venthub-cart-schema'
const CURRENT_CART_SCHEMA = '2'

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
  clearCart: (opts?: { silent?: boolean }) => void
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
    // One-time migration: if schema mismatch, silently clear any stale cart from previous deployments
    const schema = localStorage.getItem(CART_SCHEMA_KEY)
    if (schema !== CURRENT_CART_SCHEMA) {
      try {
        localStorage.removeItem(CART_LOCAL_STORAGE_KEY)
        localStorage.removeItem(CART_VERSION_KEY)
        localStorage.removeItem(CART_OWNER_KEY)
        localStorage.removeItem('vh_pending_order')
        localStorage.setItem(CART_SCHEMA_KEY, CURRENT_CART_SCHEMA)
      } catch {}
    }

    // Safety: if the last order status was success, enforce an empty cart on fresh load
    const lastStatus = localStorage.getItem('vh_last_order_status')
    if (lastStatus === 'success') {
      try {
        setItems([])
        localStorage.removeItem(CART_LOCAL_STORAGE_KEY)
        localStorage.removeItem(CART_VERSION_KEY)
        localStorage.removeItem(CART_OWNER_KEY)
        localStorage.removeItem('vh_pending_order')
        localStorage.removeItem('vh_last_order_id')
        // keep a breadcrumb but don't keep success forever to avoid repeated forced clears
        localStorage.removeItem('vh_last_order_status')
        // Cross-tab sync
        window.dispatchEvent(new StorageEvent('storage', { key: CART_LOCAL_STORAGE_KEY, newValue: JSON.stringify([]), oldValue: null, storageArea: localStorage }))
      } catch {}
    }

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

  // Helper: merge two cart item arrays by product.id
  function mergeItems(local: CartItem[], server: CartItem[], isGuestCart: boolean) {
    const map = new Map<string, CartItem>()
    
    // If we have a guest cart with items, prioritize it (user just added items before login)
    if (isGuestCart && local.length > 0) {
      // Start with local guest cart items
      for (const it of local) {
        map.set(it.product.id, it)
      }
      // Add server items that are not in local cart
      for (const it of server) {
        if (!map.has(it.product.id)) {
          map.set(it.product.id, it)
        }
      }
    } else {
      // Otherwise use server as source of truth
      for (const it of server) {
        map.set(it.product.id, it)
      }
      // Add local items not on server
      for (const it of local) {
        if (!map.has(it.product.id)) {
          map.set(it.product.id, it)
        }
      }
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
        const { getOrCreateShoppingCart, listCartItemsWithProducts, clearCartItems: clearDbCartItems, getEffectivePriceInfo, upsertCartItem, getSupabase } = await import('../lib/supabase')
        const supabase = await getSupabase()
        const cart = await getOrCreateShoppingCart(user.id)
        if (cancelled) return
        setServerCartId(cart.id)

        // Check if this is a guest cart (no owner in localStorage)
        const currentOwner = localStorage.getItem(CART_OWNER_KEY)
        const isGuestCart = !currentOwner || currentOwner === '' || currentOwner !== user.id
        
        // Determine if we must discard local guest cart due to a recently paid order
        let discardLocalGuestCart = false
        let clearOnce = localStorage.getItem('vh_clear_server_cart_once') === '1'
        // If post-order clear flag is present, wipe local immediately to avoid local->server rehydration
        if (clearOnce) {
          try {
            setItems([])
            localStorage.removeItem(CART_LOCAL_STORAGE_KEY)
            localStorage.removeItem(CART_VERSION_KEY)
            localStorage.removeItem(CART_OWNER_KEY)
          } catch {}
        }
        try {
          const raw = localStorage.getItem('vh_pending_order')
          if (raw) {
            const data = JSON.parse(raw || '{}') as { orderId?: string }
            const oid = data?.orderId
            if (oid) {
              const { data: ord, error: ordErr } = await supabase
                .from('venthub_orders')
                .select('status, created_at')
                .eq('id', oid)
                .maybeSingle()
              if (!ordErr && ord && String((ord as Record<string, unknown>).status) === 'paid') {
                discardLocalGuestCart = true
                clearOnce = true
                try {
                  localStorage.setItem('vh_last_order_status', 'success')
                  localStorage.removeItem('vh_pending_order')
                } catch {}
              }
            }
          }
        } catch {}
        
        // If we have a guest cart with items, or we have a post-order clear flag, clear server cart first
        if ((isGuestCart && items.length > 0) || clearOnce) {
          if (((import.meta as ImportMeta).env?.VITE_DEBUG ?? 'false') === 'true') {
            console.warn('Clearing server cart (guest items present or post-order flag)')
          }
          await clearDbCartItems(cart.id)
        }
        
        // Fetch server items (will be empty if we just cleared)
        const serverRows = await listCartItemsWithProducts(cart.id)
        const serverItems: CartItem[] = serverRows.map(({ item, product }) => ({ id: item.product_id, product, quantity: item.quantity }))

        // Decide merge strategy
        const merged = discardLocalGuestCart
          ? serverItems
          : (isGuestCart && items.length > 0 ? items : mergeItems(items, serverItems, isGuestCart))

        // If we cleared server due to post-order flag, also remove the flag now
        try { if (clearOnce) localStorage.removeItem('vh_clear_server_cart_once') } catch {}
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
        } catch {}

      } catch (e) {
        console.error('cart sync error', e)
      } finally {
        mergingRef.current = false
        setSyncing(false)
      }
    }

    // If no user or server sync disabled, nothing to do
    if (!user || !CART_SERVER_SYNC) {
      return
    }

    // Defer sync on non-critical routes to avoid impacting LCP/TBT
    const path = (typeof window !== 'undefined' ? window.location.pathname : '/') || '/'
    const needImmediate = /^(\/account|\/admin|\/checkout|\/cart|\/auth|\/payment)/.test(path)

    let started = false
    const start = () => { if (!started) { started = true; void syncWithServer(); cleanup() } }

    // Keep track of listeners/timeouts to clean up on unmount or user change
    const cleanups: Array<() => void> = []
    const cleanup = () => { cleanups.splice(0).forEach(fn => { try { fn() } catch {} }) }

    if (needImmediate) {
      start()
    } else {
      const win = window as unknown as { requestIdleCallback?: (cb: IdleRequestCallback, opts?: { timeout?: number }) => number, cancelIdleCallback?: (id: number) => void }
      if (typeof win.requestIdleCallback === 'function') {
        const id = win.requestIdleCallback(() => start(), { timeout: 20000 })
        cleanups.push(() => { try { win.cancelIdleCallback?.(id) } catch {} })
      } else {
        const onFirstInteract = () => start()
        window.addEventListener('pointerdown', onFirstInteract, { once: true })
        window.addEventListener('keydown', onFirstInteract, { once: true })
        window.addEventListener('touchstart', onFirstInteract, { once: true })
        cleanups.push(() => {
          window.removeEventListener('pointerdown', onFirstInteract)
          window.removeEventListener('keydown', onFirstInteract)
          window.removeEventListener('touchstart', onFirstInteract)
        })
        // Fallback guard: start after longer delay for non-critical paths (reduce main thread work)
        const to = window.setTimeout(start, 8000)
        cleanups.push(() => window.clearTimeout(to))
      }
    }

    return () => { cancelled = true; cleanup() }
    // only run when user changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])
  
  // Clear owner when user logs out
  useEffect(() => {
    if (!user) {
      // User logged out, remove owner to mark as guest cart
      try {
        localStorage.removeItem(CART_OWNER_KEY)
        setServerCartId(null)
      } catch (e) {
        console.error('Error clearing owner on logout:', e)
      }
    }
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
      } catch {}
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
      import('../lib/supabase').then(({ getEffectivePriceInfo, upsertCartItem }) => {
        getEffectivePriceInfo(product)
          .then(info => {
            upsertCartItem({ cartId: serverCartId, productId: product.id, quantity: (items.find(i => i.product.id === product.id)?.quantity || 0) + quantity, unitPrice: info.unitPrice, priceListId: info.priceListId })
              .catch(err => console.error('server addToCart error', err))
            // Update local snapshot unit price
            setItems(curr => curr.map(it => it.product.id === product.id ? { ...it, unitPrice: info.unitPrice } : it))
          })
          .catch(err => console.error('server addToCart error', err))
      }).catch(() => {})
    }

    // Dispatch a global event so UI can present a rich toast/modal
    try {
      window.dispatchEvent(new CustomEvent('vh_cart_item_added', { detail: { product } }))
    } catch {
      try {
        import('react-hot-toast').then(({ default: toast }) => toast.success(`${product.name} sepete eklendi!`, { duration: 2500, position: 'top-right' })).catch(() => {})
      } catch {}
    }
  }

  const removeFromCart = (productId: string) => {
    setItems(currentItems => {
      const item = currentItems.find(item => item.product.id === productId)
      if (item) {
        import('react-hot-toast').then(({ default: toast }) => toast.success(`${item.product.name} sepetten çıkarıldı`, { duration: 2000, position: 'top-right' })).catch(() => {})
      }
      return currentItems.filter(item => item.product.id !== productId)
    })

    if (CART_SERVER_SYNC && user && serverCartId) {
      import('../lib/supabase').then(({ removeCartItem }) => {
        return removeCartItem(serverCartId, productId)
      }).catch(err => console.error('server removeFromCart error', err))
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
        import('../lib/supabase').then(({ getEffectivePriceInfo, upsertCartItem }) => {
          getEffectivePriceInfo(product)
            .then(info => {
              upsertCartItem({ cartId: serverCartId, productId, quantity, unitPrice: info.unitPrice, priceListId: info.priceListId })
                .catch(err => console.error('server updateQuantity error', err))
              // Ensure local snapshot unit price is present
              setItems(curr => curr.map(it => it.product.id === productId ? { ...it, unitPrice: info.unitPrice } : it))
            })
            .catch(err => console.error('server updateQuantity error', err))
        }).catch(()=>{})
      }
    }
  }

  const clearCart = (opts?: { silent?: boolean }) => {
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
    
    if (!opts?.silent) {
      import('react-hot-toast').then(({ default: toast }) => toast.success('Sepet temizlendi', { duration: 2000, position: 'top-right' })).catch(() => {})
    }
    
    if (CART_SERVER_SYNC && user && serverCartId) {
      import('../lib/supabase').then(({ clearCartItems }) => {
        return clearCartItems(serverCartId)
      }).catch(err => console.error('server clearCart error', err))
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

    const to2 = (n: number) => Number(Number(n).toFixed(2))
    const nearlyEqual = (a: number, b: number) => Math.abs(to2(a) - to2(b)) <= 0.01

    // Gelen veriyi normalize ederek bir harita oluştur (2 ondalık)
    const pmap = new Map<string, number>()
    for (const it of serverItems) {
      const pid = String(it.product_id)
      const up = Number(it.unit_price)
      if (Number.isFinite(up)) pmap.set(pid, to2(up))
    }

    // Hangi kalemlerin gerçekten değişeceğini önceden belirle (idempotent davranış için)
    const changedIds = new Set<string>()
    for (const it of items) {
      const nextUnit = pmap.get(it.product.id)
      if (nextUnit == null) continue
      const currUnit = typeof it.unitPrice === 'number' ? it.unitPrice : Number(it.product.price)
      if (!nearlyEqual(currUnit, nextUnit)) changedIds.add(it.product.id)
    }

    // Yerel güncelle (yalnızca değişen kalemlerde yeni referans üret)
    setItems(curr => curr.map(it => {
      const nextUnit = pmap.get(it.product.id)
      if (nextUnit == null) return it
      const currUnit = typeof it.unitPrice === 'number' ? it.unitPrice : Number(it.product.price)
      if (nearlyEqual(currUnit, nextUnit)) return it
      return { ...it, unitPrice: nextUnit }
    }))

    // Sunucuya da yalnızca değişenleri yansıt (varsa)
    if (changedIds.size > 0 && CART_SERVER_SYNC && user && serverCartId) {
      try {
        import('../lib/supabase').then(({ upsertCartItem }) => {
          const tasks = items.map(it => {
            if (!changedIds.has(it.product.id)) return Promise.resolve()
            const up = pmap.get(it.product.id)
            if (up == null) return Promise.resolve()
            return upsertCartItem({ cartId: serverCartId, productId: it.product.id, quantity: it.quantity, unitPrice: up, priceListId: undefined })
              .catch(e => console.warn('applyServerPricing upsert error', e))
          })
          Promise.allSettled(tasks).catch(()=>{})
        }).catch(()=>{})
      } catch { /* no-op */ }
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

// Hook to use cart context  
function useCartHook() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = useCartHook
