import React from 'react'
import { getSupabase } from '../../lib/supabase'
import { adminCardPaddedClass, adminSectionTitleClass, adminTableHeadCellClass } from '../../utils/adminUi'
import AdminToolbar from '../../components/admin/AdminToolbar'
import toast from 'react-hot-toast'
import { useI18n } from '../../i18n/I18nProvider'
import { formatCurrency } from '../../i18n/format'
import { formatDateTime } from '../../i18n/datetime'

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

// Tip koruması için yardımcı
type AllowedCouponType = 'percent' | 'fixed'
function isAllowedCouponType(x: unknown): x is AllowedCouponType {
  return x === 'percent' || x === 'fixed'
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
  const { lang, t } = useI18n()
  const [rows, setRows] = React.useState<CouponRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [q, setQ] = React.useState('')

  const [form, setForm] = React.useState<Partial<CouponRow>>({ type: 'percent', active: true })
  const [saving, setSaving] = React.useState(false)

  const fetchCoupons = React.useCallback(async () => {
    setLoading(true)
    try {
      const supabase = await getSupabase()
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
    const codeTrim = String(form.code || '').trim()
    const issues: string[] = []
    if (codeTrim.length < 3 || codeTrim.length > 50) issues.push('Kod 3-50 karakter olmalı')
    if (!isAllowedCouponType(form.type)) issues.push('Tip (Yüzde/Sabit) seçilmeli')
    const val = Number(form.value)
    if (!val || val <= 0) issues.push('Değer 0\'dan büyük olmalı')
    if (issues.length > 0) { toast.error(issues.join(' • ')); return }
    try {
      setSaving(true)
      const payload = {
        code: codeTrim,
        discount_type: (form.type as AllowedCouponType) === 'percent' ? 'percentage' : 'fixed_amount',
        discount_value: val,
        valid_from: (form.starts_at as string) || null,
        valid_until: (form.ends_at as string) || null,
        is_active: !!form.active,
        usage_limit: (form.usage_limit && form.usage_limit > 0) ? form.usage_limit : null,
        used_count: 0,
      }
      // RLS sorunlarında edge function üzerinden oluştur
      const supabase = await getSupabase()
      const { data, error } = await supabase.functions.invoke('admin-create-coupon', {
        body: {
          code: payload.code,
          type: (form.type as AllowedCouponType),
          value: payload.discount_value,
          starts_at: payload.valid_from,
          ends_at: payload.valid_until,
          active: payload.is_active,
          usage_limit: payload.usage_limit,
        }
      }) as unknown as { data: DbCouponRow | null, error: unknown | null }
      if (error) throw error
      if (!data) throw new Error('No data')
      const ui = dbToUi(data as DbCouponRow)
      setRows(prev => [ui, ...prev])
      setForm({ type: 'percent', active: true })
      toast.success('Kupon eklendi')
    } catch (e) {
      console.error('save coupon error', e)
      toast.error('Kupon eklenemedi')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(id: string, active: boolean) {
    try {
      const supabase = await getSupabase()
      const { data, error } = await supabase
        .from('coupons')
        .update({ is_active: !active })
        .eq('id', id)
        .select('id, is_active')
        .single()
      if (error) throw error
      setRows(prev => prev.map(r => r.id === id ? { ...r, active: (data as { id: string; is_active: boolean }).is_active } : r))
      toast.success(!active ? 'Kupon aktif edildi' : 'Kupon pasif edildi')
    } catch (e) {
      console.error('toggle active error', e)
      toast.error('Durum değiştirilemedi')
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className={adminSectionTitleClass}>{t('admin.titles.coupons')}</h1>
        <button onClick={fetchCoupons} disabled={loading} className="px-3 py-2 rounded border border-gray-200 bg-white hover:border-primary-navy text-sm whitespace-nowrap">{loading ? t('admin.ui.loadingShort') : t('admin.ui.refresh')}</button>
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
          <input type="number" min={1} value={(form.usage_limit as number | null | undefined) ?? ''} onChange={e=>setForm(f=>{ const raw = e.target.value ? Number(e.target.value) : null; const normalized = raw && raw > 0 ? raw : null; return { ...f, usage_limit: normalized } })} placeholder="Kullanım limiti (ops.)" className="border border-gray-200 rounded px-3 py-2 md:col-span-2" />
          <button onClick={saveCoupon} disabled={saving || !(String(form.code||'').trim().length >= 3 && (form.type==='percent' || form.type==='fixed') && Number(form.value)>0)} className="px-3 py-2 rounded bg-primary-navy text-white hover:opacity-90 md:col-span-2">{saving ? 'Kaydediliyor…' : 'Ekle'}</button>
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
                  <td className="px-3 py-2">{r.type === 'percent' ? `%${r.value}` : `${formatCurrency(r.value, lang as 'tr' | 'en', { maximumFractionDigits: 0 })}`}</td>
                  <td className="px-3 py-2">
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={!!r.active} onChange={()=>toggleActive(r.id, r.active)} /> {r.active ? 'Aktif' : 'Pasif'}
                    </label>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.starts_at ? formatDateTime(r.starts_at, lang as 'tr' | 'en') : '-'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.ends_at ? formatDateTime(r.ends_at, lang as 'tr' | 'en') : '-'}</td>
                  <td className="px-3 py-2">{r.used_count || 0}{r.usage_limit ? ` / ${r.usage_limit}` : ''}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(r.created_at, lang as 'tr' | 'en')}</td>
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
