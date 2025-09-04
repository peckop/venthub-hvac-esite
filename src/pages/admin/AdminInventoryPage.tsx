import React from 'react'
import { supabase } from '../../lib/supabase'

type Row = { product_id: string; name: string; physical_stock: number; reserved_stock: number; available_stock: number }

type ReservedRow = { order_id: string; created_at: string; status: string; payment_status: string | null; quantity: number }

enum LoadState { Idle, Loading, Error }

const AdminInventoryPage: React.FC = () => {
  const [rows, setRows] = React.useState<Row[]>([])
  const [loading, setLoading] = React.useState<LoadState>(LoadState.Idle)
  const [error, setError] = React.useState<string>('')
  const [selected, setSelected] = React.useState<Row | null>(null)
  const [reservedOrders, setReservedOrders] = React.useState<ReservedRow[]>([])

  const load = React.useCallback(async () => {
    try {
      setLoading(LoadState.Loading)
      const { data, error } = await supabase.from('inventory_summary').select('*')
      if (error) throw error
      setRows((data || []) as Row[])
    } catch {
      setError('Yükleme hatası')
      setRows([])
      setLoading(LoadState.Error)
      return
    }
    setLoading(LoadState.Idle)
  }, [])

  React.useEffect(()=>{ load() }, [load])

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-industrial-gray">Stok Özeti</h1>

      <div className="bg-white rounded-lg shadow-hvac-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-light-gray">
            <tr>
              <th className="text-left p-3 text-sm text-industrial-gray">Ürün</th>
              <th className="text-right p-3 text-sm text-industrial-gray">Fiziksel</th>
              <th className="text-right p-3 text-sm text-industrial-gray">Rezerve</th>
              <th className="text-right p-3 text-sm text-industrial-gray">Satılabilir</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.product_id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => { setSelected(r); loadReserved(r.product_id) }}>
                <td className="p-3 text-industrial-gray">{r.name}</td>
                <td className="p-3 text-right">{r.physical_stock}</td>
                <td className="p-3 text-right">{r.reserved_stock}</td>
                <td className="p-3 text-right font-semibold">{r.available_stock}</td>
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
        <div className="bg-white rounded-lg shadow-hvac-md p-4">
          <h2 className="text-lg font-semibold text-industrial-gray mb-2">Rezerve Eden Siparişler — {selected.name}</h2>
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
