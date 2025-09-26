import React, { useEffect, useMemo, useState } from 'react'
import { getSupabase, Product } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Minus, Save } from 'lucide-react'
import { checkAdminAccess } from '../../config/admin'

export default function AdminStockPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const [all, setAll] = useState<Product[]>([])
  const [q, setQ] = useState('')
  const [saving, setSaving] = useState<string | null>(null)
  const [tempQty, setTempQty] = useState<Record<string, number | ''>>({})
  const [tempThreshold, setTempThreshold] = useState<Record<string, number | ''>>({})
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth/login', { replace: true, state: { from: { pathname: '/account/operations/stock' } } })
      return
    }
  }, [user, loading, navigate])

  // Admin kontrolü
  useEffect(() => {
    setIsAdmin(checkAdminAccess(user))
  }, [user])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const supabase = await getSupabase()
        const { data, error } = await supabase
          .from('products')
          .select('id, name, sku, brand, price, status, is_featured, stock_qty, low_stock_threshold')
          .order('name', { ascending: true })
        if (error) throw error
        if (mounted) setAll((data || []) as Product[])
      } catch {
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
      // Direkt UPDATE query - RPC yerine
      const currentProduct = all.find(p => p.id === productId)
      const newQty = Math.max(0, (currentProduct?.stock_qty ?? 0) + delta)
      
      const supabase = await getSupabase()
      const { error } = await supabase
        .from('products')
        .update({ stock_qty: newQty })
        .eq('id', productId)
        
      if (error) throw error
      setAll(prev => prev.map(p => p.id === productId ? { ...p, stock_qty: newQty } : p))
    } catch (err) {
      console.error('Stock adjust error:', err)
    } finally {
      setSaving(null)
    }
  }

  async function setQty(productId: string, qty: number) {
    try {
      setSaving(productId)
      // Direkt UPDATE query - RPC yerine
      const newQty = Math.max(0, qty)
      
      const supabase = await getSupabase()
      const { error } = await supabase
        .from('products')
        .update({ stock_qty: newQty })
        .eq('id', productId)
        
      if (error) throw error
      setAll(prev => prev.map(p => p.id === productId ? { ...p, stock_qty: newQty } : p))
      setTempQty(prev => ({ ...prev, [productId]: '' }))
    } catch (err) {
      console.error('Stock set error:', err)
    } finally {
      setSaving(null)
    }
  }

  async function setThreshold(productId: string, threshold: number | null) {
    try {
      setSaving(productId)
      // null değeri "varsayılan kullan" anlamına gelir
      const newThreshold = threshold !== null && threshold >= 0 ? threshold : null
      
      const supabase = await getSupabase()
      const { error } = await supabase
        .from('products')
        .update({ low_stock_threshold: newThreshold })
        .eq('id', productId)
        
      if (error) throw error
      setAll(prev => prev.map(p => p.id === productId ? { ...p, low_stock_threshold: newThreshold } : p))
      setTempThreshold(prev => ({ ...prev, [productId]: '' }))
    } catch (err) {
      console.error('Threshold set error:', err)
    } finally {
      setSaving(null)
    }
  }

  // Admin değilse erişim reddet
  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-red-600">Erişim Reddedildi</h2>
          <p className="text-steel-gray mt-2">Bu sayfaya erişmek için admin yetkisi gerekiyor.</p>
        </div>
      </div>
    )
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
              const tempQty_val = tempQty[p.id] ?? ''
              const tempThreshold_val = tempThreshold[p.id] ?? ''
              return (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-3 py-2 text-industrial-gray font-medium">{p.name}</td>
                  <td className="px-3 py-2 text-steel-gray">{p.sku}</td>
                  <td className={`px-3 py-2 font-semibold ${qty <= (threshold ?? -1) ? 'text-warning-orange' : 'text-industrial-gray'}`}>{qty}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-steel-gray ${threshold === undefined ? 'italic' : ''}`}>
                        {threshold ?? 'varsayılan'}
                      </span>
                      <input
                        value={tempThreshold_val}
                        onChange={(e) => setTempThreshold(prev => ({ ...prev, [p.id]: e.target.value === '' ? '' : Number(e.target.value) }))}
                        placeholder="Eşik"
                        className="w-16 px-2 py-1 border border-light-gray rounded text-xs"
                      />
                      <button 
                        disabled={saving === p.id || tempThreshold_val === ''} 
                        onClick={() => setThreshold(p.id, Number(tempThreshold_val))} 
                        className="px-1 py-1 rounded border border-light-gray hover:border-secondary-blue disabled:opacity-50 text-xs"
                        title="Eşik kaydet"
                      >
                        <Save size={12} />
                      </button>
                      {threshold !== undefined && (
                        <button 
                          disabled={saving === p.id} 
                          onClick={() => setThreshold(p.id, null)} 
                          className="px-1 py-1 rounded border border-warning-orange text-warning-orange hover:bg-warning-orange hover:text-white disabled:opacity-50 text-xs"
                          title="Varsayılan kullan"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button disabled={saving === p.id} onClick={() => adjust(p.id, -1)} className="px-2 py-1 rounded border border-light-gray hover:border-primary-navy disabled:opacity-50"><Minus size={14} /></button>
                      <button disabled={saving === p.id} onClick={() => adjust(p.id, +1)} className="px-2 py-1 rounded border border-light-gray hover:border-primary-navy disabled:opacity-50"><Plus size={14} /></button>
                      <input
                        value={tempQty_val}
                        onChange={(e) => setTempQty(prev => ({ ...prev, [p.id]: e.target.value === '' ? '' : Number(e.target.value) }))}
                        placeholder="Ayarla"
                        className="w-20 px-2 py-1 border border-light-gray rounded"
                      />
                      <button disabled={saving === p.id || tempQty_val === ''} onClick={() => setQty(p.id, Number(tempQty_val))} className="px-2 py-1 rounded border border-light-gray hover:border-primary-navy disabled:opacity-50 flex items-center gap-1"><Save size={14} /> Kaydet</button>
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
