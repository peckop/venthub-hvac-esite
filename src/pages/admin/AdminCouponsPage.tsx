import React from 'react'
import { supabase } from '../../lib/supabase'
import { adminCardPaddedClass, adminSectionTitleClass, adminTableHeadCellClass } from '../../utils/adminUi'
import AdminToolbar from '../../components/admin/AdminToolbar'

// Uygulama içi kullanım için UI modeli
interface CouponRow {
  id: string
  code: string
  type: 'percent' | 'fixed' | string
  value: number
  starts_at?: string | null
  ends_at?: string | null
  active: boolean
  usage_limit?: number | null
  used_count?: number | null
  created_at: string
}

// Veritabanından dönen satır modeli
type DbCouponRow = {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed_amount' | string
  discount_value: number
  valid_from?: string | null
  valid_until?: string | null
  is_active: boolean
  usage_limit?: number | null
  used_count?: number | null
  created_at: string
}

function dbToUi(row: DbCouponRow): CouponRow {
  return {
    id: row.id,
    code: row.code,
    type: row.discount_type === 'percentage' ? 'percent' : 'fixed',
    value: Number(row.discount_value),
    starts_at: row.valid_from ?? null,
    ends_at: row.valid_until ?? null,
    active: !!row.is_active,
    usage_limit: row.usage_limit ?? null,
    used_count: row.used_count ?? 0,
    created_at: row.created_at,
  }
}

const AdminCouponsPage: React.FC = () => {
  const [rows, setRows] = React.useState<CouponRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [q, setQ] = React.useState('')

  const [form, setForm] = React.useState<Partial<CouponRow>>({ type: 'percent', active: true })
  const [saving, setSaving] = React.useState(false)

  const fetchCoupons = React.useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('id, code, discount_type, discount_value, valid_from, valid_until, is_active, usage_limit, used_count, created_at')
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error
      const mapped = (data || []).map(d => dbToUi(d as DbCouponRow))
      setRows(mapped)
    } catch (e) {
      console.error('fetch coupons error', e)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(()=>{ fetchCoupons() }, [fetchCoupons])

  function filtered() {
    if (!q.trim()) return rows
    const s = q.toLowerCase()
    return rows.filter(r => r.code.toLowerCase().includes(s) || String(r.type).toLowerCase().includes(s))
  }

  async function saveCoupon() {
    if (!form.code || !form.type || !form.value) return
    try {
      setSaving(true)
      const payload = {
        code: String(form.code as string).trim(),
        discount_type: (form.type as 'percent' | 'fixed') === 'percent' ? 'percentage' : 'fixed_amount',
        discount_value: Number(form.value),
        valid_from: (form.starts_at as string) || null,
        valid_until: (form.ends_at as string) || null,
        is_active: !!form.active,
        usage_limit: form.usage_limit ?? null,
        used_count: 0,
      }
      // RLS sorunlarında edge function üzerinden oluştur
      const { data, error } = await supabase.functions.invoke('admin-create-coupon', {
        body: {
          code: payload.code,
          type: (form.type as 'percent' | 'fixed'),
          value: payload.discount_value,
          starts_at: payload.valid_from,
          ends_at: payload.valid_until,
          active: payload.is_active,
          usage_limit: payload.usage_limit,
        }
      }) as unknown as { data: DbCouponRow | null, error: any | null }
      if (error) throw error
      if (!data) throw new Error('No data')
      const ui = dbToUi(data as DbCouponRow)
      setRows(prev => [ui, ...prev])
      if (error) throw error
      setForm({ type: 'percent', active: true })
    } catch (e) {
      console.error('save coupon error', e)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(id: string, active: boolean) {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .update({ is_active: !active })
        .eq('id', id)
        .select('id, is_active')
        .single()
      if (error) throw error
      setRows(prev => prev.map(r => r.id === id ? { ...r, active: (data as { id: string; is_active: boolean }).is_active } : r))
    } catch (e) {
      console.error('toggle active error', e)
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className={adminSectionTitleClass}>Kuponlar</h1>
        <button onClick={fetchCoupons} disabled={loading} className="px-3 py-2 rounded border border-gray-200 bg-white hover:border-primary-navy text-sm whitespace-nowrap">{loading ? 'Yükleniyor…' : 'Yenile'}</button>
      </header>

      <AdminToolbar
        storageKey="toolbar:coupons"
        search={{ value: q, onChange: setQ, placeholder: 'Kod veya tip ile ara', focusShortcut: '/' }}
        rightExtra={null}
        recordCount={filtered().length}
      />

      <section className={adminCardPaddedClass + ' space-y-3'}>
        <h3 className="font-semibold text-industrial-gray">Yeni Kupon</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input value={form.code || ''} onChange={e=>setForm(f=>({ ...f, code: e.target.value }))} placeholder="Kod" className="border border-gray-200 rounded px-3 py-2" />
          <select value={form.type as string} onChange={e=>setForm(f=>({ ...f, type: e.target.value as 'percent' | 'fixed' }))} className="border border-gray-200 rounded px-3 py-2">
            <option value="percent">Yüzde</option>
            <option value="fixed">Sabit</option>
          </select>
          <input type="number" value={(form.value as number | undefined) ?? ''} onChange={e=>setForm(f=>({ ...f, value: e.target.value ? Number(e.target.value) : undefined }))} placeholder="Değer" className="border border-gray-200 rounded px-3 py-2" />
          <input type="datetime-local" value={(form.starts_at as string | undefined) ?? ''} onChange={e=>setForm(f=>({ ...f, starts_at: e.target.value }))} className="border border-gray-200 rounded px-3 py-2" />
          <input type="datetime-local" value={(form.ends_at as string | undefined) ?? ''} onChange={e=>setForm(f=>({ ...f, ends_at: e.target.value }))} className="border border-gray-200 rounded px-3 py-2" />
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={!!form.active} onChange={e=>setForm(f=>({ ...f, active: e.target.checked }))} /> Aktif
          </div>
          <input type="number" value={(form.usage_limit as number | null | undefined) ?? ''} onChange={e=>setForm(f=>({ ...f, usage_limit: e.target.value ? Number(e.target.value) : null }))} placeholder="Kullanım limiti (ops.)" className="border border-gray-200 rounded px-3 py-2 md:col-span-2" />
          <button onClick={saveCoupon} disabled={saving || !form.code || !form.type || !form.value} className="px-3 py-2 rounded bg-primary-navy text-white hover:opacity-90 md:col-span-2">{saving ? 'Kaydediliyor…' : 'Ekle'}</button>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-hvac-md overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className={`${adminTableHeadCellClass}`}>Kod</th>
              <th className={`${adminTableHeadCellClass}`}>Tip</th>
              <th className={`${adminTableHeadCellClass}`}>Değer</th>
              <th className={`${adminTableHeadCellClass}`}>Aktif</th>
              <th className={`${adminTableHeadCellClass}`}>Başlangıç</th>
              <th className={`${adminTableHeadCellClass}`}>Bitiş</th>
              <th className={`${adminTableHeadCellClass}`}>Kullanım</th>
              <th className={`${adminTableHeadCellClass}`}>Oluşturulma</th>
              <th className={`${adminTableHeadCellClass}`}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filtered().length === 0 ? (
              <tr><td className="px-4 py-6">Kayıt yok</td></tr>
            ) : (
              filtered().map(r => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-mono text-xs">{r.code}</td>
                  <td className="px-3 py-2">{r.type}</td>
                  <td className="px-3 py-2">{r.type === 'percent' ? `%${r.value}` : `${new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(r.value)}`}</td>
                  <td className="px-3 py-2">
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={!!r.active} onChange={()=>toggleActive(r.id, r.active)} /> {r.active ? 'Aktif' : 'Pasif'}
                    </label>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.starts_at ? new Date(r.starts_at).toLocaleString('tr-TR') : '-'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.ends_at ? new Date(r.ends_at).toLocaleString('tr-TR') : '-'}</td>
                  <td className="px-3 py-2">{r.used_count || 0}{r.usage_limit ? ` / ${r.usage_limit}` : ''}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString('tr-TR')}</td>
                  <td className="px-3 py-2 text-xs text-steel-gray">—</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default AdminCouponsPage
