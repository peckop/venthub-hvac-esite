'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { supabaseBrowserClient } from '@/lib/supabase/client'

import type { Movement } from '../components/admin/InventoryMovementHistory'
import { useI18n } from '../i18n/I18nProvider'
import type { InventoryRow, ReservedRow } from '../types/inventory'

/**
 * ENVANTER DETAY KONTEYNERİ.
 *
 * `3c7ea6ff` ("total quality purge") `AdminInventoryPage`'i 770 → 27 satıra indirirken
 * SUNUM bileşenlerini (çekmece + alt bileşenleri) bırakıp KONTEYNER mantığını sildi:
 * hareket geçmişi, rezerve siparişler, eşik kaydetme, stok düzeltme ve geri alma
 * yolları importer'sız kaldı → kullanıcıya görünen işlev sessizce düştü.
 *
 * Mantık buraya çıkarıldı ki `InventoryTableBody` sunum + tablo kablolamasında kalsın
 * (cetvel: dosya başına tek sorumluluk; 500 satır tavanı).
 *
 * Yazma yolları TEK KAPI'dan geçer: `mutateWithAudit` (K3 yetki + K4 denetim izi).
 */

/** Son hareketin geri alınabildiği pencere (prod davranışıyla birebir). */
const UNDO_WINDOW_MS = 10 * 60 * 1000

/** Tablodan gelen satır — eşik kolonu view'de yok, `products`'tan eşleştirilir. */
export interface InventoryRowWithThreshold extends InventoryRow {
  low_stock_threshold?: number | null
}

export interface UseInventoryDetailOptions {
  /** RBAC katman-1/2: `useRole().canWrite('inventory')` */
  hasWriteAccess: boolean
  /** güncel tablo satırları (eşik okuması) — ref'te tutulur, effect deps'ini kirletmez */
  rows: InventoryRowWithThreshold[]
  /** başarılı mutasyondan sonra tabloyu tazele (`table.reload`) */
  onMutated: () => Promise<void> | void
}

export interface UseInventoryDetailResult {
  selected: InventoryRow | null
  open: (row: InventoryRow) => void
  close: () => void
  detailLoading: boolean
  movements: Movement[]
  reservedOrders: ReservedRow[]
  selectedStock: number | null
  selectedThreshold: number | ''
  setSelectedThreshold: (v: number | '') => void
  defaultThreshold: number | null
  /** ürün-bazlı eşik yoksa global varsayılana düşer (CSV önizlemesi de bunu kullanır) */
  effectiveThreshold: (productId: string) => number | null
  saving: boolean
  moving: boolean
  undoing: boolean
  printingQr: boolean
  setPrintingQr: (v: boolean) => void
  moveQty: number
  setMoveQty: (v: number) => void
  saveThreshold: (productId: string) => void
  adjustStock: (productId: string, delta: number, reason: string) => void
  undoLastMovement: () => void
}

export function useInventoryDetail(options: UseInventoryDetailOptions): UseInventoryDetailResult {
  const { hasWriteAccess, rows, onMutated } = options
  const { t } = useI18n()

  const rowsRef = useRef(rows)
  rowsRef.current = rows
  const onMutatedRef = useRef(onMutated)
  onMutatedRef.current = onMutated

  const [selected, setSelected] = useState<InventoryRow | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [movements, setMovements] = useState<Movement[]>([])
  const [reservedOrders, setReservedOrders] = useState<ReservedRow[]>([])
  const [selectedStock, setSelectedStock] = useState<number | null>(null)
  const [selectedThreshold, setSelectedThreshold] = useState<number | ''>('')
  const [defaultThreshold, setDefaultThreshold] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [moving, setMoving] = useState(false)
  const [undoing, setUndoing] = useState(false)
  const [printingQr, setPrintingQr] = useState(false)
  const [moveQty, setMoveQty] = useState(1)

  /** açık satırın kimliği — hızlı satır değişiminde geç gelen fetch'i yutar (yarış koruması) */
  const openTokenRef = useRef<string | null>(null)

  /* ---- global varsayılan eşik (inventory_settings) ---- */
  useEffect(() => {
    let active = true
    void (async () => {
      const { data, error } = await supabaseBrowserClient
        .from('inventory_settings')
        .select('default_low_stock_threshold')
        .maybeSingle()
      if (active && !error) {
        setDefaultThreshold(data?.default_low_stock_threshold ?? null)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const effectiveThreshold = useCallback(
    (productId: string): number | null => {
      const row = rowsRef.current.find((r) => r.product_id === productId)
      const own = row?.low_stock_threshold
      return typeof own === 'number' ? own : defaultThreshold
    },
    [defaultThreshold],
  )

  const loadMovements = useCallback(async (productId: string) => {
    const { data, error } = await supabaseBrowserClient
      .from('inventory_movements')
      .select('id, delta, reason, created_at')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(5)
    if (error) return [] as Movement[]
    return (data ?? []).map((m) => ({
      id: m.id,
      delta: m.delta,
      reason: m.reason,
      created_at: m.created_at,
    }))
  }, [])

  const loadReserved = useCallback(async (productId: string) => {
    const { data, error } = await supabaseBrowserClient
      .from('reserved_orders')
      .select('order_id, created_at, status, payment_status, quantity')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    if (error) return [] as ReservedRow[]
    return (data ?? []).map((r) => ({
      order_id: r.order_id ?? '',
      created_at: r.created_at ?? new Date().toISOString(),
      status: r.status ?? 'pending',
      payment_status: r.payment_status ?? null,
      quantity: r.quantity ?? 0,
    }))
  }, [])

  const open = useCallback(
    (row: InventoryRow) => {
      openTokenRef.current = row.product_id
      setSelected(row)
      setSelectedStock(row.physical_stock)
      const own = rowsRef.current.find((r) => r.product_id === row.product_id)?.low_stock_threshold
      setSelectedThreshold(typeof own === 'number' ? own : '')
      setMovements([])
      setReservedOrders([])
      setDetailLoading(true)
      void (async () => {
        const [mv, ro] = await Promise.all([loadMovements(row.product_id), loadReserved(row.product_id)])
        // Kullanıcı bu arada başka satıra geçtiyse geç gelen cevabı YUTMA (yanlış veri gösterimi).
        if (openTokenRef.current !== row.product_id) return
        setMovements(mv)
        setReservedOrders(ro)
        setDetailLoading(false)
      })()
    },
    [loadMovements, loadReserved],
  )

  const close = useCallback(() => {
    openTokenRef.current = null
    setSelected(null)
    setMovements([])
    setReservedOrders([])
    setDetailLoading(false)
  }, [])

  /** Yetki/serbest hata → kullanıcıya anlaşılır mesaj (ham Postgres hatası değil). */
  const describeError = useCallback(
    (e: unknown): string => {
      if (e instanceof AdminPermissionError) return t('admin.inventory.settings.noPermission')
      if (e instanceof Error && e.message) return e.message
      return t('admin.common.error')
    },
    [t],
  )

  const saveThreshold = useCallback(
    (productId: string) => {
      void (async () => {
        setSaving(true)
        try {
          const isDefault = selectedThreshold === ''
          const row = rowsRef.current.find((r) => r.product_id === productId)
          const before = { low_stock_threshold: row?.low_stock_threshold ?? null }
          const after = {
            low_stock_threshold: isDefault ? null : Number(selectedThreshold),
            low_stock_override: !isDefault,
          }
          await mutateWithAudit(supabaseBrowserClient, {
            resource: 'products',
            canWrite: hasWriteAccess,
            action: 'UPDATE',
            rowPk: productId,
            before,
            after,
            comment: 'update low_stock_threshold',
            fn: async () => {
              const { error } = await supabaseBrowserClient
                .from('products')
                .update(after)
                .eq('id', productId)
              if (error) throw error
            },
          })
          toast.success(t('admin.inventory.settings.saveSuccess'))
          await onMutatedRef.current()
        } catch (e: unknown) {
          console.error('saveThreshold error:', e)
          toast.error(describeError(e))
        } finally {
          setSaving(false)
        }
      })()
    },
    [selectedThreshold, hasWriteAccess, t, describeError],
  )

  const adjustStock = useCallback(
    (productId: string, delta: number, reason: string) => {
      void (async () => {
        if (delta === 0) return
        setMoving(true)
        try {
          await mutateWithAudit(supabaseBrowserClient, {
            resource: 'inventory_movements',
            canWrite: hasWriteAccess,
            action: 'INSERT',
            rowPk: productId,
            before: null,
            after: { delta, reason },
            comment: 'adjust_stock RPC',
            fn: async () => {
              const { error } = await supabaseBrowserClient.rpc('adjust_stock', {
                p_product_id: productId,
                p_delta: delta,
                p_reason: reason,
              })
              if (error) throw error
            },
          })
          setSelectedStock((s) => (s == null ? null : Math.max(0, s + delta)))
          setMovements(await loadMovements(productId))
          toast.success(t('admin.inventory.toasts.stockAdjusted'))
          await onMutatedRef.current()
        } catch (e: unknown) {
          console.error('adjustStock error:', e)
          toast.error(describeError(e))
        } finally {
          setMoving(false)
        }
      })()
    },
    [hasWriteAccess, loadMovements, t, describeError],
  )

  const undoLastMovement = useCallback(() => {
    void (async () => {
      const target = selected
      const last = movements[0]
      if (!target || !last) return
      // "undo" hareketinin kendisi geri alınamaz — aksi halde sonsuz salınım üretir.
      if (String(last.reason ?? '').startsWith('undo')) {
        toast.error(t('admin.inventory.toasts.undoNotAllowed'))
        return
      }
      if (Date.now() - new Date(last.created_at).getTime() > UNDO_WINDOW_MS) {
        toast.error(t('admin.inventory.toasts.undoTimePassed'))
        return
      }
      const inverse = -Number(last.delta || 0)
      if (inverse === 0) return

      setUndoing(true)
      try {
        const reason = `undo:${String(last.id).slice(0, 8)}`
        await mutateWithAudit(supabaseBrowserClient, {
          resource: 'inventory_movements',
          canWrite: hasWriteAccess,
          action: 'INSERT',
          rowPk: target.product_id,
          before: { delta: last.delta, reason: last.reason },
          after: { delta: inverse, reason },
          comment: 'undo adjust_stock',
          fn: async () => {
            const { error } = await supabaseBrowserClient.rpc('adjust_stock', {
              p_product_id: target.product_id,
              p_delta: inverse,
              p_reason: reason,
            })
            if (error) throw error
          },
        })
        setSelectedStock((s) => (s == null ? null : Math.max(0, s + inverse)))
        setMovements(await loadMovements(target.product_id))
        toast.success(t('admin.inventory.toasts.undoSuccess'))
        await onMutatedRef.current()
      } catch (e: unknown) {
        console.error('undoLastMovement error:', e)
        toast.error(t('admin.inventory.toasts.undoFailed'))
      } finally {
        setUndoing(false)
      }
    })()
  }, [selected, movements, hasWriteAccess, loadMovements, t])

  return {
    selected,
    open,
    close,
    detailLoading,
    movements,
    reservedOrders,
    selectedStock,
    selectedThreshold,
    setSelectedThreshold,
    defaultThreshold,
    effectiveThreshold,
    saving,
    moving,
    undoing,
    printingQr,
    setPrintingQr,
    moveQty,
    setMoveQty,
    saveThreshold,
    adjustStock,
    undoLastMovement,
  }
}

export default useInventoryDetail
