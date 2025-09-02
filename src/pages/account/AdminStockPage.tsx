import React, { useEffect, useMemo, useState } from 'react'
import { supabase, Product } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Minus, Save } from 'lucide-react'

export default function AdminStockPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const [all, setAll] = useState<Product[]>([])
  const [q, setQ] = useState('')
  const [saving, setSaving] = useState<string | null>(null)
  const [tempQty, setTempQty] = useState<Record<string, number | ''>>({})

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth/login', { replace: true, state: { from: { pathname: '/account/operations/stock' } } })
      return
    }
  }, [user, loading, navigate])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, sku, brand, price, status, is_featured, stock_qty, low_stock_threshold')
          .order('name', { ascending: true })
        if (error) throw error
        if (mounted) setAll((data || []) as Product[])
      } catch (e) {
        // no-op
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return all
    return all.filter(p => [p.name, p.sku, p.brand].some(v => (v || '').toLowerCase().includes(t)))
  }, [all, q])

  async function adjust(productId: string, delta: number) {
    try {
      setSaving(productId)
      const { error } = await supabase.rpc('adjust_stock', { p_product_id: productId, p_delta: delta, p_reason: delta >= 0 ? 'adjust' : 'adjust' })
      if (error) throw error
      setAll(prev => prev.map(p => p.id === productId ? { ...p, stock_qty: ((p.stock_qty ?? 0) + delta) as number } : p))
    } catch (e) {
      // surface minimal error UI later
    } finally {
      setSaving(null)
    }
  }

  async function setQty(productId: string, qty: number) {
    try {
      setSaving(productId)
      const { error } = await supabase.rpc('set_stock', { p_product_id: productId, p_new_qty: qty, p_reason: 'adjust' })
      if (error) throw error
      setAll(prev => prev.map(p => p.id === productId ? { ...p, stock_qty: qty } : p))
    } catch (e) {
      // no-op
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-industrial-gray">Operasyon &gt; Stok</h2>
      </div>

      <div className="mb-4 relative w-full sm:w-auto sm:min-w-[18rem]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-steel-gray" size={16} />
        <input
          type="text"
          placeholder="Ürün adı veya SKU ile ara"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full sm:w-96 pl-10 pr-3 py-2 border border-light-gray rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy"
        />
      </div>

      <div className="bg-white rounded-xl border border-light-gray overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-steel-gray">
            <tr>
              <th className="text-left px-3 py-2">Ürün</th>
              <th className="text-left px-3 py-2">SKU</th>
              <th className="text-left px-3 py-2">Stok</th>
              <th className="text-left px-3 py-2">Eşik</th>
              <th className="text-left px-3 py-2">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const qty = typeof p.stock_qty === 'number' ? p.stock_qty : 0
              const threshold = typeof p.low_stock_threshold === 'number' ? p.low_stock_threshold : undefined
              const temp = tempQty[p.id] ?? ''
              return (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-3 py-2 text-industrial-gray font-medium">{p.name}</td>
                  <td className="px-3 py-2 text-steel-gray">{p.sku}</td>
                  <td className={`px-3 py-2 font-semibold ${qty <= (threshold ?? -1) ? 'text-warning-orange' : 'text-industrial-gray'}`}>{qty}</td>
                  <td className="px-3 py-2 text-steel-gray">{threshold ?? '-'}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button disabled={saving === p.id} onClick={() => adjust(p.id, -1)} className="px-2 py-1 rounded border border-light-gray hover:border-primary-navy disabled:opacity-50"><Minus size={14} /></button>
                      <button disabled={saving === p.id} onClick={() => adjust(p.id, +1)} className="px-2 py-1 rounded border border-light-gray hover:border-primary-navy disabled:opacity-50"><Plus size={14} /></button>
                      <input
                        value={temp}
                        onChange={(e) => setTempQty(prev => ({ ...prev, [p.id]: e.target.value === '' ? '' : Number(e.target.value) }))}
                        placeholder="Ayarla"
                        className="w-20 px-2 py-1 border border-light-gray rounded"
                      />
                      <button disabled={saving === p.id || temp === ''} onClick={() => setQty(p.id, Number(temp))} className="px-2 py-1 rounded border border-light-gray hover:border-primary-navy disabled:opacity-50 flex items-center gap-1"><Save size={14} /> Kaydet</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
