import React from 'react'
import { supabase } from '../../lib/supabase'
import { adminSectionTitleClass, adminTableHeadCellClass, adminTableCellClass, adminCardClass } from '../../utils/adminUi'

type Row = { product_id: string; name: string; physical_stock: number; reserved_stock: number; available_stock: number }

type ReservedRow = { order_id: string; created_at: string; status: string; payment_status: string | null; quantity: number }

enum LoadState { Idle, Loading, Error }

const AdminInventoryPage: React.FC = () => {
  const [rows, setRows] = React.useState<Row[]>([])
  const [loading, setLoading] = React.useState<LoadState>(LoadState.Idle)
  const [error, setError] = React.useState<string>('')
  const [selected, setSelected] = React.useState<Row | null>(null)
  const [reservedOrders, setReservedOrders] = React.useState<ReservedRow[]>([])

  // Eşik (threshold) için global varsayılan
  const [defaultThreshold, setDefaultThreshold] = React.useState<number | null>(null)
  // Seçili ürünün stok/eşik bilgisi
  const [selectedThreshold, setSelectedThreshold] = React.useState<number | ''>('')
  const [selectedStock, setSelectedStock] = React.useState<number | null>(null)
  const [saving, setSaving] = React.useState<boolean>(false)

  // Tablo içi toplu düzenleme için haritalar (eşik)
  const [thresholdMap, setThresholdMap] = React.useState<Record<string, number | null>>({})
  const [editMap, setEditMap] = React.useState<Record<string, number | ''>>({})
  const [savingMap, setSavingMap] = React.useState<Record<string, boolean>>({})

  // Arama ve stok düzenleme durumları
  const [q, setQ] = React.useState<string>('')
  const [tempStockMap, setTempStockMap] = React.useState<Record<string, number | ''>>({})
  const [savingStockMap, setSavingStockMap] = React.useState<Record<string, boolean>>({})

  const load = React.useCallback(async () => {
    try {
      setLoading(LoadState.Loading)
      const [invRes, settingsRes] = await Promise.all([
        supabase.from('inventory_summary').select('*'),
        supabase.from('inventory_settings').select('default_low_stock_threshold').maybeSingle(),
      ])
      if (invRes.error) throw invRes.error
      const invRows = (invRes.data || []) as Row[]
      setRows(invRows)
      if (!settingsRes.error) {
        setDefaultThreshold((settingsRes.data?.default_low_stock_threshold as number | null) ?? null)
      }
      // Ürünlerin eşiklerini çek ve haritaları hazırla
      const ids = invRows.map(r => r.product_id)
      if (ids.length > 0) {
        const { data: prodData } = await supabase
          .from('products')
          .select('id, low_stock_threshold')
          .in('id', ids)
        const tmap: Record<string, number | null> = {}
        const emap: Record<string, number | ''> = {}
        ;(prodData as { id: string; low_stock_threshold: number | null }[] | null | undefined)?.forEach((p) => {
          tmap[p.id] = p.low_stock_threshold
          emap[p.id] = (p.low_stock_threshold === null || p.low_stock_threshold === undefined) ? '' : Number(p.low_stock_threshold)
        })
        setThresholdMap(tmap)
        setEditMap(emap)
      }
    } catch {
      setError('Yükleme hatası')
      setRows([])
      setLoading(LoadState.Error)
      return
    }
    setLoading(LoadState.Idle)
  }, [])

  React.useEffect(()=>{ load() }, [load])

  const filteredRows = React.useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return rows
    return rows.filter(r => r.name.toLowerCase().includes(t))
  }, [rows, q])

  const loadReserved = React.useCallback(async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('reserved_orders')
        .select('order_id, created_at, status, payment_status, quantity')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
      if (error) throw error
      setReservedOrders((data || []) as ReservedRow[])
    } catch {
      setReservedOrders([])
    }
  }, [])

  const loadProductDetails = React.useCallback(async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('stock_qty, low_stock_threshold')
        .eq('id', productId)
        .maybeSingle()
      if (error) throw error
      setSelectedStock((data?.stock_qty as number | null) ?? null)
      const th = (data?.low_stock_threshold as number | null)
      setSelectedThreshold(th === null || th === undefined ? '' : th)
    } catch {
      setSelectedStock(null)
      setSelectedThreshold('')
    }
  }, [])

  async function saveThreshold(productId: string) {
    try {
      setSaving(true)
      const payload = { low_stock_threshold: (selectedThreshold === '' ? null : Number(selectedThreshold)) }
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', productId)
      if (error) throw error
      // Üst panel hariç tablo haritalarını da güncelle
      setThresholdMap(prev => ({ ...prev, [productId]: (selectedThreshold === '' ? null : Number(selectedThreshold)) }))
      setEditMap(prev => ({ ...prev, [productId]: (selectedThreshold === '' ? '' : Number(selectedThreshold)) }))
    } catch {
      // no-op: basit inline kullanım
    } finally {
      setSaving(false)
    }
  }

  async function saveRowThreshold(productId: string) {
    const val = editMap[productId]
    setSavingMap(prev => ({ ...prev, [productId]: true }))
    try {
      const payload = { low_stock_threshold: (val === '' ? null : Number(val)) }
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', productId)
      if (error) throw error
      setThresholdMap(prev => ({ ...prev, [productId]: (val === '' ? null : Number(val)) }))
    } catch {
      // no-op
    } finally {
      setSavingMap(prev => ({ ...prev, [productId]: false }))
    }
  }

  async function saveRowStock(productId: string, reserved: number) {
    const raw = tempStockMap[productId]
    const newQty = Math.max(0, (raw === '' || raw === undefined ? 0 : Number(raw)))
    setSavingStockMap(prev => ({ ...prev, [productId]: true }))
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_qty: newQty })
        .eq('id', productId)
      if (error) throw error
      // rows state'ini optimize güncelle
      setRows(prev => prev.map(r => r.product_id === productId ? ({
        ...r,
        physical_stock: newQty,
        available_stock: Math.max(0, newQty - reserved),
      }) : r))
    } catch {
      // no-op
    } finally {
      setSavingStockMap(prev => ({ ...prev, [productId]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <h1 className={adminSectionTitleClass}>Stok Özeti</h1>

      {/* Hızlı arama */}
      <div className={`${adminCardClass} p-4`}>
        <div className="flex items-center gap-3">
          <input
            className="w-full md:w-96 border border-light-gray rounded-lg px-3 py-2 text-sm"
            placeholder="Ürün ara (ad)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <span className="text-xs text-steel-gray">{filteredRows.length} kayıt</span>
        </div>
      </div>

      {/* Hızlı Eşik Ayarları Paneli (sadece bir ürün seçildiğinde görünür) */}
      {selected && (
        <div className={`${adminCardClass} p-4`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {/* Seçili ürün başlığı */}
            <div className="col-span-1 md:col-span-3">
              <div className="text-sm text-steel-gray">Seçili ürün</div>
              <div className="text-lg font-semibold text-industrial-gray">{selected.name}</div>
            </div>

            {/* Etkili eşik kartı */}
            <div className="col-span-1">
              <div className="bg-white border border-light-gray rounded-lg p-3 h-full">
                <div className="text-xs text-steel-gray mb-1">Etkili Eşik</div>
                <div className="text-lg font-semibold text-industrial-gray">{selectedThreshold === '' ? (defaultThreshold ?? '-') : selectedThreshold}</div>
                <div className="text-xs text-steel-gray">Varsayılan: {defaultThreshold ?? '-'}</div>
              </div>
            </div>

            {/* Ürün eşiği girişi */}
            <div className="col-span-1">
              <label className="block text-sm text-steel-gray mb-1">Ürün Eşiği (override)</label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  value={selectedThreshold}
                  onChange={(e) => setSelectedThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Eşik"
                  className="w-28 px-3 py-2 border border-light-gray rounded text-sm"
                />
                <button
                  disabled={saving}
                  onClick={() => saveThreshold(selected.product_id)}
                  className="px-4 py-2 rounded border border-light-gray hover:border-primary-navy disabled:opacity-50 text-sm shrink-0"
                  title="Eşiği kaydet"
                >Kaydet</button>
                <button
                  disabled={saving}
                  onClick={() => setSelectedThreshold('')}
                  className="px-4 py-2 rounded border border-warning-orange text-warning-orange hover:bg-warning-orange hover:text-white disabled:opacity-50 text-sm shrink-0"
                  title="Varsayılanı kullan"
                >Varsayılan</button>
              </div>
            </div>

            {/* Güncel stok kartı */}
            <div className="col-span-1">
              <div className="bg-white border border-light-gray rounded-lg p-3 h-full">
                <div className="text-xs text-steel-gray mb-1">Güncel Stok</div>
                <div className="text-lg font-semibold text-industrial-gray">{selectedStock ?? '-'}</div>
                <div className="text-xs text-steel-gray">Bilgi amaçlı</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`${adminCardClass} overflow-hidden`}>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className={`${adminTableHeadCellClass} text-sm font-semibold text-industrial-gray`}>Ürün</th>
              <th className={`${adminTableHeadCellClass} text-sm font-semibold text-industrial-gray text-right`}>Fiziksel</th>
              <th className={`${adminTableHeadCellClass} text-sm font-semibold text-industrial-gray text-right`}>Rezerve</th>
              <th className={`${adminTableHeadCellClass} text-sm font-semibold text-industrial-gray text-right`}>
                <div className="flex flex-col items-end leading-tight">
                  <span>Eşik</span>
                  <span className="text-[10px] text-steel-gray font-normal">Efektif • Yeni • Aksiyon</span>
                </div>
              </th>
              <th className={`${adminTableHeadCellClass} text-sm font-semibold text-industrial-gray text-right`}>Düzenle</th>
              <th className={`${adminTableHeadCellClass} text-sm font-semibold text-industrial-gray text-right`}>Satılabilir</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(r => (
              <tr
                key={r.product_id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => { setSelected(r); loadProductDetails(r.product_id); loadReserved(r.product_id) }}
              >
                <td className={adminTableCellClass}>{r.name}</td>
                <td className="p-3 text-right">{r.physical_stock}</td>
                <td className="p-3 text-right">{r.reserved_stock}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="inline-flex items-center text-xs px-2 py-0.5 rounded bg-light-gray text-steel-gray">
                      {(thresholdMap[r.product_id] ?? defaultThreshold ?? '-') as number | string}
                    </span>
                    <input
                      className="w-16 px-2 py-1 border border-light-gray rounded text-xs text-right"
                      type="number"
                      placeholder="Eşik"
                      value={editMap[r.product_id] ?? ''}
                      onChange={(e) => setEditMap(prev => ({ ...prev, [r.product_id]: (e.target.value === '' ? '' : Number(e.target.value)) }))}
                    />
                    <button
                      className="px-2 py-1 rounded border border-light-gray hover:border-primary-navy text-xs disabled:opacity-50"
                      disabled={!!savingMap[r.product_id]}
                      onClick={() => saveRowThreshold(r.product_id)}
                      title="Eşiği kaydet"
                    >Kaydet</button>
                    <button
                      className="px-2 py-1 rounded border border-warning-orange text-warning-orange hover:bg-warning-orange hover:text-white text-xs disabled:opacity-50"
                      disabled={!!savingMap[r.product_id]}
                      onClick={() => setEditMap(prev => ({ ...prev, [r.product_id]: '' }))}
                      title="Varsayılanı kullan"
                    >Varsayılan</button>
                  </div>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="px-2 py-1 rounded border border-light-gray hover:border-primary-navy text-xs disabled:opacity-50"
                      onClick={() => {
                        const current = tempStockMap[r.product_id] !== undefined ? (tempStockMap[r.product_id] === '' ? 0 : Number(tempStockMap[r.product_id])) : r.physical_stock
                        setTempStockMap(prev => ({ ...prev, [r.product_id]: Math.max(0, current - 1) }))
                      }}
                    >−</button>
                    <input
                      className="w-16 px-2 py-1 border border-light-gray rounded text-xs text-right"
                      type="number"
                      value={tempStockMap[r.product_id] !== undefined ? tempStockMap[r.product_id] : r.physical_stock}
                      onChange={(e) => setTempStockMap(prev => ({ ...prev, [r.product_id]: (e.target.value === '' ? '' : Number(e.target.value)) }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveRowStock(r.product_id, r.reserved_stock) }}
                    />
                    <button
                      className="px-2 py-1 rounded border border-light-gray hover:border-primary-navy text-xs disabled:opacity-50"
                      onClick={() => {
                        const current = tempStockMap[r.product_id] !== undefined ? (tempStockMap[r.product_id] === '' ? 0 : Number(tempStockMap[r.product_id])) : r.physical_stock
                        setTempStockMap(prev => ({ ...prev, [r.product_id]: Math.max(0, current + 1) }))
                      }}
                    >+</button>
                    <button
                      className="px-2 py-1 rounded border border-light-gray hover:border-primary-navy text-xs disabled:opacity-50"
                      disabled={!!savingStockMap[r.product_id]}
                      onClick={() => saveRowStock(r.product_id, r.reserved_stock)}
                      title="Stok kaydet"
                    >Kaydet</button>
                  </div>
                </td>
                <td className="p-3 text-right font-semibold">{Math.max(0, (tempStockMap[r.product_id] === undefined || tempStockMap[r.product_id] === '' ? r.physical_stock : Number(tempStockMap[r.product_id])) - r.reserved_stock)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading === LoadState.Loading && (
          <div className="p-4 text-sm text-steel-gray">Yükleniyor…</div>
        )}
        {loading === LoadState.Error && (
          <div className="p-4 text-sm text-red-600">{error}</div>
        )}
      </div>

      {selected && (
        <div className="bg-white rounded-lg shadow-hvac-md p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-industrial-gray">Ürün: {selected.name}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-light-gray rounded-lg p-3">
              <div className="text-sm text-steel-gray mb-1">Etkili Eşik (varsayılanla)</div>
              <div className="text-xl font-semibold text-industrial-gray">
                {(selectedThreshold === '' ? (defaultThreshold ?? '-') : selectedThreshold) as number | string}
              </div>
              <div className="text-xs text-steel-gray">Varsayılan: {defaultThreshold ?? '-'}</div>
            </div>
            <div className="bg-white border border-light-gray rounded-lg p-3">
              <div className="text-sm text-steel-gray mb-1">Ürün Eşiği (override)</div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={selectedThreshold}
                  onChange={(e) => setSelectedThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Eşik"
                  className="w-24 px-2 py-1 border border-light-gray rounded text-sm"
                />
                <button
                  disabled={saving}
                  onClick={() => saveThreshold(selected.product_id)}
                  className="px-3 py-1 rounded border border-light-gray hover:border-primary-navy disabled:opacity-50 text-sm"
                  title="Eşiği kaydet"
                >Kaydet</button>
                <button
                  disabled={saving}
                  onClick={() => setSelectedThreshold('')}
                  className="px-3 py-1 rounded border border-warning-orange text-warning-orange hover:bg-warning-orange hover:text-white disabled:opacity-50 text-sm"
                  title="Varsayılanı kullan"
                >Varsayılan</button>
              </div>
            </div>
            <div className="bg-white border border-light-gray rounded-lg p-3">
              <div className="text-sm text-steel-gray mb-1">Güncel Stok</div>
              <div className="text-xl font-semibold text-industrial-gray">{selectedStock ?? '-'}</div>
              <div className="text-xs text-steel-gray">Bilgi amaçlı</div>
            </div>
          </div>

          <h3 className="text-md font-semibold text-industrial-gray mt-2">Rezerve Eden Siparişler</h3>
          {reservedOrders.length === 0 ? (
            <div className="text-sm text-steel-gray">Bu ürün için bekleyen (kargolanmamış) sipariş yok.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-light-gray">
                <tr>
                  <th className="text-left p-2 text-sm text-industrial-gray">Sipariş ID</th>
                  <th className="text-left p-2 text-sm text-industrial-gray">Tarih</th>
                  <th className="text-left p-2 text-sm text-industrial-gray">Durum</th>
                  <th className="text-left p-2 text-sm text-industrial-gray">Ödeme</th>
                  <th className="text-right p-2 text-sm text-industrial-gray">Adet</th>
                </tr>
              </thead>
              <tbody>
                {reservedOrders.map(ro => (
                  <tr key={ro.order_id} className="border-b">
                    <td className="p-2 text-primary-navy">{ro.order_id.slice(-8).toUpperCase()}</td>
                    <td className="p-2 text-steel-gray">{new Date(ro.created_at).toLocaleString('tr-TR')}</td>
                    <td className="p-2 text-steel-gray">{ro.status}</td>
                    <td className="p-2 text-steel-gray">{ro.payment_status || '-'}</td>
                    <td className="p-2 text-right">{ro.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminInventoryPage
