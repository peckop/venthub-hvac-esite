"use no memo";
import React, { ReactNode, useCallback,useEffect, useMemo, useRef, useState } from 'react'

import { useSupabaseClient } from '@/providers/SupabaseProvider'
import type { Product } from '@/types/ui-models'

import { useAuth } from '../hooks/useAuth'

const CART_SERVER_SYNC = (process.env.NEXT_PUBLIC_CART_SERVER_SYNC ?? 'true') === 'true'

// LocalStorage keys
const CART_LOCAL_STORAGE_KEY = 'venthub-cart'
const CART_VERSION_KEY = 'venthub-cart-version'
const CART_OWNER_KEY = 'venthub-cart-owner'
// New: cart schema version key to invalidate stale carts across deployments
const CART_SCHEMA_KEY = 'venthub-cart-schema'
// W4b: 2 → 3. Sepet kaleminin fiyat semantiği değişti: unitPrice artık TEK fiyat kaynağı
// (ham products.price fallback'i kaldırıldı). Eski anlık görüntülerde misafir kalemlerinin
// unitPrice'ı hiç yoktu; taşınsalardı kalıcı olarak "Teklif Alın"da takılır ve ödemeye
// geçemezlerdi. O sepetler zaten 0 ₺ gösteriyordu (products.price NULL) — bir kez temizlenir.
const CURRENT_CART_SCHEMA = '3'

import type { CartItem } from '@/types/cart'

import { CartContext } from '../contexts/CartContext'




export function CartProvider({ children }: { children: ReactNode }) {
  const { supabase } = useSupabaseClient()
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
        } catch { }
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
          localStorage.removeItem('vh_last__order_id')
          // keep a breadcrumb but don't keep success forever to avoid repeated forced clears
          localStorage.removeItem('vh_last_order_status')
          // Cross-tab sync
          window.dispatchEvent(new StorageEvent('storage', { key: CART_LOCAL_STORAGE_KEY, newValue: JSON.stringify([]), oldValue: null, storageArea: localStorage }))
        } catch { }
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
        const { getOrCreateShoppingCart, listCartItemsWithProducts, clearCartItems: clearDbCartItems, upsertCartItem } = await import('../lib/services/cart.service')
        const { getEffectivePriceInfo } = await import('../lib/services/pricing.service')
        const cart = await getOrCreateShoppingCart(supabase, user.id)
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
          } catch { }
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
                } catch { }
              }
            }
          }
        } catch { }

        // If we have a guest cart with items, or we have a post-order clear flag, clear server cart first
        if ((isGuestCart && items.length > 0) || clearOnce) {
          if ((process.env.NEXT_PUBLIC_DEBUG ?? 'false') === 'true') {
            console.warn('Clearing server cart (guest items present or post-order flag)')
          }
          await clearDbCartItems(supabase, cart.id)
        }

        // Fetch server items (will be empty if we just cleared)
        const serverRows = await listCartItemsWithProducts(supabase, cart.id)
        const serverItems: CartItem[] = serverRows.map((row) => ({ 
          id: row.item.product_id, 
          product: row.product, 
          quantity: row.item.quantity 
        }))

        // Decide merge strategy
        const merged = discardLocalGuestCart
          ? serverItems
          : (isGuestCart && items.length > 0 ? items : mergeItems(items, serverItems, isGuestCart))

        // If we cleared server due to post-order flag, also remove the flag now
        try { if (clearOnce) localStorage.removeItem('vh_clear_server_cart_once') } catch { }
        // Compute unit prices for merged items and upsert server.
        // W4b: motor fiyat veremezse unitPrice NULL yazılır — 0 TL yazmak sepeti sessizce bozardı.
        const priceInfoList = await Promise.all(
          merged.map(async (it) => {
            // Fiyat çözümü ile sunucuya yazma AYRI tutulur: geçici bir yazma hatası,
            // BAŞARIYLA çözülmüş fiyatın ekrana yansımasını engellememeli (kullanıcı
            // bayat fiyat görmeye devam ederdi).
            let info: Awaited<ReturnType<typeof getEffectivePriceInfo>>
            try {
              info = await getEffectivePriceInfo(supabase, it.product)
            } catch (e) {
              console.error('cart price resolve error', e)
              return { _productId: it.product.id, resolved: false, unitPrice: undefined }
            }
            try {
              await upsertCartItem(supabase, { cartId: cart.id, _productId: it.product.id, quantity: it.quantity, unitPrice: info.unitPrice, priceListId: info.priceListId || undefined })
            } catch (e) {
              console.error('cart upsert error', e)
            }
            return { _productId: it.product.id, resolved: true, unitPrice: info.unitPrice ?? undefined }
          })
        )
        const unitMap = new Map<string, { resolved: boolean; unitPrice: number | undefined }>(
          priceInfoList.map(p => [p._productId, { resolved: p.resolved, unitPrice: p.unitPrice }])
        )
        // Fiyat ÇÖZÜLDÜYSE sonucu (null dahil) uygula; çözülemediyse (ağ/servis hatası)
        // yerel anlık görüntüyü koru — ama asla ham product.price'a düşme.
        const mergedWithPrices = merged.map(it => {
          const info = unitMap.get(it.product.id)
          if (!info || !info.resolved) return it
          return { ...it, unitPrice: info.unitPrice }
        })
        setItems(mergedWithPrices)

        // Clear guest cart to avoid double-merge next time
        try {
          localStorage.removeItem(CART_LOCAL_STORAGE_KEY)
          localStorage.setItem(CART_LOCAL_STORAGE_KEY, JSON.stringify(mergedWithPrices))
          localStorage.setItem(CART_OWNER_KEY, user.id)
          const v = Date.now()
          localVersionRef.current = v
          localStorage.setItem(CART_VERSION_KEY, String(v))
        } catch { }

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
  }, [user, supabase])

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
      } catch { }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [user])

  const addToCart = useCallback((product: Product, quantity = 1) => {
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

    // W4b: birim fiyat HER durumda çözülür — anonim kullanıcı da 'individual' segmentiyle
    // public liste fiyatını görür (RLS kısıtlar). Önceden fiyat yalnız oturum açıkken
    // hesaplanıyordu; ham products.price fallback'i kalktığı için misafir sepeti aksi hâlde
    // tamamen fiyatsız ("Teklif Alın") kalırdı. Sunucuya YAZMAK yalnız oturum açıkken anlamlı.
    import('../lib/services/pricing.service')
      .then(({ getEffectivePriceInfo }) => getEffectivePriceInfo(supabase, product))
      .then(info => {
        // Update local snapshot unit price (fiyatlanamıyorsa undefined = "fiyat bekleniyor")
        setItems(curr => curr.map(it => it.product.id === product.id ? { ...it, unitPrice: info.unitPrice ?? undefined } : it))

        if (!CART_SERVER_SYNC || !user || !serverCartId) return
        import('../lib/services/cart.service').then(({ upsertCartItem }) => {
          upsertCartItem(supabase, { cartId: serverCartId, _productId: product.id, quantity: (items.find(i => i.product.id === product.id)?.quantity || 0) + quantity, unitPrice: info.unitPrice, priceListId: info.priceListId || undefined })
            .catch(err => console.error('server addToCart error', err))
        }).catch(() => { })
      })
      .catch(err => console.error('addToCart pricing error', err))

    // Dispatch a global event so UI can present a rich toast/modal
    try {
      window.dispatchEvent(new CustomEvent('vh_cart_item_added', { detail: { product } }))
    } catch {
      try {
        import('sonner').then(({ toast }) => toast.success(`${product.name} sepete eklendi!`, { duration: 2500 })).catch(() => { })
      } catch { }
    }
  }, [user, serverCartId, items, supabase])

  const removeFromCart = useCallback((_productId: string) => {
    setItems(currentItems => {
      const item = currentItems.find(item => item.product.id === _productId)
      if (item) {
        import('sonner').then(({ toast }) => toast.success(`${item.product.name} sepetten çıkarıldı`, { duration: 2000 })).catch(() => { })
      }
      return currentItems.filter(item => item.product.id !== _productId)
    })

    if (CART_SERVER_SYNC && user && serverCartId) {
      import('../lib/services/cart.service').then(({ removeCartItem }) => {
        return removeCartItem(supabase, serverCartId, _productId)
      }).catch(err => console.error('server removeFromCart error', err))
    }
  }, [user, serverCartId, supabase])

  const updateQuantity = useCallback((_productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(_productId)
      return
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.product.id === _productId
          ? { ...item, quantity }
          : item
      )
    )

    // Fiyat çözümü oturumdan bağımsız (bkz. addToCart); sunucuya yazım oturuma bağlı.
    const product = items.find(i => i.product.id === _productId)?.product
    if (product) {
      import('../lib/services/pricing.service')
        .then(({ getEffectivePriceInfo }) => getEffectivePriceInfo(supabase, product))
        .then(info => {
          // Ensure local snapshot unit price is present (fiyat yoksa undefined kalır)
          setItems(curr => curr.map(it => it.product.id === _productId ? { ...it, unitPrice: info.unitPrice ?? undefined } : it))

          if (!CART_SERVER_SYNC || !user || !serverCartId) return
          import('../lib/services/cart.service').then(({ upsertCartItem }) => {
            upsertCartItem(supabase, { cartId: serverCartId, _productId, quantity, unitPrice: info.unitPrice, priceListId: info.priceListId || undefined })
              .catch(err => console.error('server updateQuantity error', err))
          }).catch(() => { })
        })
        .catch(err => console.error('updateQuantity pricing error', err))
    }
  }, [user, serverCartId, removeFromCart, items, supabase])

  const clearCart = useCallback((opts?: { silent?: boolean }) => {
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
      import('sonner').then(({ toast }) => toast.success('Sepet temizlendi', { duration: 2000 })).catch(() => { })
    }

    if (CART_SERVER_SYNC && user && serverCartId) {
      import('../lib/services/cart.service').then(({ clearCartItems }) => {
        return clearCartItems(supabase, serverCartId)
      }).catch(err => console.error('server clearCart error', err))
    }
  }, [user, serverCartId, supabase])

  /**
   * W4b: fiyatı BİLİNMEYEN kalem (unitPrice yok) toplama 0 olarak GİRMEZ — hiç girmez.
   * Ham `products.price` fallback'i kaldırıldı; o kolon emekli (çoğunlukla NULL) ve
   * ona düşmek "0 TL'lik ürün" yanılsaması üretiyordu. Toplam yalnız fiyatlı kalemleri
   * kapsar; fiyatsız kalem vitrinde "Teklif Alın" olarak işaretlenir (bkz. CartPage).
   */
  const cartTotal = useMemo(() => {
    return items.reduce((total, item) => {
      const unit = item.unitPrice
      if (typeof unit !== 'number' || !Number.isFinite(unit)) return total
      return total + unit * item.quantity
    }, 0)
  }, [items])

  const getCartTotal = useCallback(() => cartTotal, [cartTotal])

  const cartCount = useMemo(() => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }, [items])

  const getCartCount = useCallback(() => cartCount, [cartCount])

  // Sunucudan gelen birim fiyatları yerel sepete uygula ve (varsa) sunucu sepetine yaz
  const applyServerPricing = useCallback((serverItems: { product_id: string, unit_price: number | null }[]) => {
    if (!Array.isArray(serverItems) || serverItems.length === 0) return

    const to2 = (n: number) => Number(Number(n).toFixed(2))
    const nearlyEqual = (a: number, b: number) => Math.abs(to2(a) - to2(b)) <= 0.01

    // W4b: SIFIR FİYAT KABUL EDİLMEZ. `Number(null)` = 0 ve sunucu bugün fiyatsız kalem için
    // 0 dönebiliyor (order-validate'te ham products.price fallback'i hâlâ canlı). 0 "sonlu bir
    // sayı" olduğu için eski kod onu geçerli fiyat sanıp yerele yazıyordu; sonuç: kalem
    // "Teklif Alın" yerine ₺0 görünüyor, "Ödemeye Geç" yeniden açılıyor ve ödeme adımında
    // patlıyordu. Yalnız POZİTİF fiyat kabul edilir; diğerleri "fiyat yok" olarak geçer.
    const pmap = new Map<string, number>()
    for (const it of serverItems) {
      const pid = String(it.product_id)
      const up = Number(it.unit_price)
      if (Number.isFinite(up) && up > 0) pmap.set(pid, to2(up))
    }

    // Hangi kalemlerin gerçekten değişeceğini önceden belirle (idempotent davranış için).
    // W4b: yerel fiyat YOKSA (undefined) ham product.price'a düşülmez — sunucunun verdiği
    // fiyat her hâlükârda bir değişikliktir ("fiyat bekleniyor" → fiyatlı).
    const changedIds = new Set<string>()
    for (const it of items) {
      const nextUnit = pmap.get(it.product.id)
      if (nextUnit == null) continue
      const currUnit = typeof it.unitPrice === 'number' ? it.unitPrice : null
      if (currUnit === null || !nearlyEqual(currUnit, nextUnit)) changedIds.add(it.product.id)
    }

    // Yerel güncelle (yalnızca değişen kalemlerde yeni referans üret)
    setItems(curr => curr.map(it => {
      const nextUnit = pmap.get(it.product.id)
      if (nextUnit == null) return it
      const currUnit = typeof it.unitPrice === 'number' ? it.unitPrice : null
      if (currUnit !== null && nearlyEqual(currUnit, nextUnit)) return it
      return { ...it, unitPrice: nextUnit }
    }))

    // Sunucuya da yalnızca değişenleri yansıt (varsa)
    if (changedIds.size > 0 && CART_SERVER_SYNC && user && serverCartId) {
      try {
        import('../lib/services/cart.service').then(({ upsertCartItem }) => {
          const tasks: Promise<unknown>[] = []
          for (let i = 0; i < items.length; i++) {
            const it = items[i]
            if (!changedIds.has(it.product.id)) continue
            const up = pmap.get(it.product.id)
            if (up == null) continue
            tasks.push(upsertCartItem(supabase, { cartId: serverCartId, _productId: it.product.id, quantity: it.quantity, unitPrice: up, priceListId: undefined })
              .catch(e => console.warn('applyServerPricing upsert error', e)))
          }
          Promise.allSettled(tasks).catch(() => { })
        }).catch(() => { })
      } catch { /* no-op */ }
    }
  }, [items, user, serverCartId, supabase])

  const value = useMemo(() => ({
    items,
    syncing,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    applyServerPricing,
  }), [
    items,
    syncing,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    applyServerPricing,
  ])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}






