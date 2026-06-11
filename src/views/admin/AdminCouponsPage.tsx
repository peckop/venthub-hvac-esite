import { Ticket } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'

import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminSkeleton from '../../components/admin/AdminSkeleton'
import AdminToolbar from '../../components/admin/AdminToolbar'
import { useDragScroll } from '../../hooks/useDragScroll'
import { useRole } from '../../hooks/useRole'
import { formatDateTime } from '../../i18n/datetime'
import { formatCurrency } from '../../i18n/format'
import { useI18n } from '../../i18n/I18nProvider'
import { logAdminAction } from '../../lib/audit'
import { ensureSessionFresh } from '../../lib/ensureSessionFresh'
import { 
  adminButtonPrimaryClass, 
  adminButtonSecondaryClass,
  adminCardPaddedClass, 
  adminInputClass,
  adminSectionTitleClass, 
  adminSelectClass,
  adminSubtitleClass,
  adminTableCellClass,
  adminTableContainerClass,
  adminTableHeadCellClass} from '../../utils/adminUi'

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
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('coupons')
  const dragScrollRef = useDragScroll<HTMLDivElement>()

  const [rows, setRows] = React.useState<CouponRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [q, setQ] = React.useState('')

  const [form, setForm] = React.useState<Partial<CouponRow>>({ type: 'percent', active: true })
  const [saving, setSaving] = React.useState(false)

  const fetchCoupons = React.useCallback(async () => {
    setLoading(true)
    try {
      // Proaktif oturum kontrolü
      await ensureSessionFresh()

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

  const pathname = usePathname()
  React.useEffect(() => { fetchCoupons() }, [fetchCoupons, pathname])

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
      const response = await supabase.functions.invoke('admin-create-coupon', {
        body: {
          code: payload.code,
          type: (form.type as AllowedCouponType),
          value: payload.discount_value,
          starts_at: payload.valid_from,
          ends_at: payload.valid_until,
          active: payload.is_active,
          usage_limit: payload.usage_limit,
        }
      })
      const { data, error }: { data: DbCouponRow | null, error: unknown | null } = response
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
    if (!hasWriteAccess) { toast.error('Bu işlem için yetkiniz yok.'); return }
    try {
      const { data, error } = await supabase
        .from('coupons')
        .update({ is_active: !active })
        .eq('id', id)
        .select('id, is_active')
        .single()
      if (error) throw error
      setRows(prev => prev.map(r => r.id === id ? { ...r, active: (data as { id: string; is_active: boolean }).is_active } : r))
      // Audit log (hata UI'ı bloklamasın)
      try {
        await logAdminAction(supabase, {
          table_name: 'coupons',
          row_pk: id,
          action: 'UPDATE',
          before: { is_active: active },
          after: { is_active: !active },
          comment: 'kupon aktiflik degisimi',
        })
      } catch { /* swallow */ }
      toast.success(!active ? 'Kupon aktif edildi' : 'Kupon pasif edildi')
    } catch (e) {
      console.error('toggle active error', e)
      toast.error('Durum değiştirilemedi')
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={adminSectionTitleClass}>{t('admin.titles.coupons')}</h1>
          <p className={adminSubtitleClass}>İndirim kuponlarını yönetin ve kullanım istatistiklerini takip edin.</p>
        </div>
        <button 
          onClick={fetchCoupons} 
          disabled={loading} 
          className={`${adminButtonSecondaryClass} glass hover:bg-white/10`}
        >
          {loading ? t('admin.ui.loadingShort') : t('admin.ui.refresh')}
        </button>
      </header>

      <AdminToolbar
        storageKey="toolbar:coupons"
        search={{ value: q, onChange: setQ, placeholder: 'Kod veya tip ile ara...', focusShortcut: '/' }}
        rightExtra={null}
        recordCount={filtered().length}
      />

      {hasWriteAccess && (
        <div className={`${adminCardPaddedClass} glass-strong border-white/5 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-admin-coupons-glow-1"></div>
              Yeni Kupon Oluştur
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Kupon Kodu</label>
              <input 
                value={form.code || ''} 
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} 
                placeholder="Örn: VENT25" 
                className={`${adminInputClass} font-mono`}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">İndirim Tipi</label>
              <select 
                value={form.type as string} 
                onChange={e => setForm(f => ({ ...f, type: e.target.value as 'percent' | 'fixed' }))} 
                className={adminSelectClass}
              >
                <option value="percent">Yüzde (%)</option>
                <option value="fixed">Sabit (₺)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Değer</label>
              <input 
                type="number" 
                value={(form.value as number | undefined) ?? ''} 
                onChange={e => setForm(f => ({ ...f, value: e.target.value ? Number(e.target.value) : undefined }))} 
                placeholder="0" 
                className={adminInputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Başlangıç</label>
              <input 
                type="datetime-local" 
                value={(form.starts_at as string | undefined) ?? ''} 
                onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))} 
                className={adminInputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Bitiş</label>
              <input 
                type="datetime-local" 
                value={(form.ends_at as string | undefined) ?? ''} 
                onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))} 
                className={adminInputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Durum</label>
              <div className="flex items-center gap-3 px-4 h-42px glass-strong border-white/10 rounded-xl">
                <input 
                  type="checkbox" 
                  id="coupon-active" 
                  checked={!!form.active} 
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} 
                  className="w-4 h-4 rounded border-white/10 bg-slate-800 text-cyan-500 focus-visible:ring-cyan-500/20" 
                />
                <label htmlFor="coupon-active" className="text-sm font-medium text-slate-300 cursor-pointer">Aktif</label>
              </div>
            </div>
            <div className="md:col-span-4 flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Kullanım Limiti (Opsiyonel)</label>
              <input 
                type="number" 
                min={1} 
                value={(form.usage_limit as number | null | undefined) ?? ''} 
                onChange={e => setForm(f => { 
                  const raw = e.target.value ? Number(e.target.value) : null; 
                  const normalized = raw && raw > 0 ? raw : null; 
                  return { ...f, usage_limit: normalized } 
                })} 
                placeholder="Sınırsız kullanım için boş bırakın" 
                className={adminInputClass}
              />
            </div>
            <div className="md:col-span-2 flex flex-col gap-2 justify-end">
              <button 
                onClick={saveCoupon} 
                disabled={saving || !(String(form.code || '').trim().length >= 3 && (form.type === 'percent' || form.type === 'fixed') && Number(form.value) > 0)} 
                className={`${adminButtonPrimaryClass} shadow-lg shadow-cyan-900/20 w-full h-42px`}
              >
                {saving ? 'Kaydediliyor...' : 'Kuponu Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className={adminTableContainerClass}>
        <div ref={dragScrollRef} className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-sm">
            <thead className="glass-strong">
              <tr>
                <th className={adminTableHeadCellClass}>KOD</th>
                <th className={adminTableHeadCellClass}>TİP</th>
                <th className={adminTableHeadCellClass}>DEĞER</th>
                <th className={adminTableHeadCellClass}>AKTİF</th>
                <th className={adminTableHeadCellClass}>GEÇERLİLİK</th>
                <th className={adminTableHeadCellClass}>KULLANIM</th>
                <th className={adminTableHeadCellClass}>OLUŞTURULMA</th>
                <th className={`${adminTableHeadCellClass} text-right`}>İŞLEMLER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <AdminSkeleton variant="table" count={8} rows={5} />
                  </td>
                </tr>
              ) : filtered().length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12">
                    <AdminEmptyState
                      icon={Ticket}
                      title="Kupon bulunamadı"
                      description="Arama kriterlerinize uygun bir kupon bulunamadı veya henüz hiç kupon oluşturulmamış."
                    />
                  </td>
                </tr>
              ) : (
                filtered().map((r, idx) => (
                  <tr 
                    key={r.id} 
                    className="group border-t border-white/5 hover:bg-white/2 transition-colors"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td className={`${adminTableCellClass} font-mono text-xs font-black text-white`}>
                      <span className="bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20 text-cyan-400 uppercase tracking-widest">
                        {r.code}
                      </span>
                    </td>
                    <td className={adminTableCellClass}>
                      <span className={`uppercase tracking-widest font-black inline-flex items-center gap-1.5 text-xs ${r.type === 'percent' ? 'text-blue-400' : 'text-emerald-400'}`}>
                        <div className={`w-1 h-1 rounded-full ${r.type === 'percent' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                        {r.type === 'percent' ? 'Yüzde' : 'Sabit'}
                      </span>
                    </td>
                    <td className={`${adminTableCellClass} font-black font-mono text-white tracking-widest`}>
                      {r.type === 'percent' ? `%${r.value}` : `${formatCurrency(r.value, lang as 'tr' | 'en', { maximumFractionDigits: 0 })}`}
                    </td>
                    <td className={adminTableCellClass}>
                      <button
                        onClick={() => hasWriteAccess && toggleActive(r.id, r.active)}
                        disabled={!hasWriteAccess}
                        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border ${
                          r.active 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-slate-500/10 text-slate-400 border-white/5 opacity-50'
                        }`}
                      >
                        <div className={`w-1 h-1 rounded-full ${r.active ? 'bg-emerald-500 shadow-admin-coupons-glow-2' : 'bg-slate-500'}`}></div>
                        {r.active ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>
                    <td className={adminTableCellClass}>
                      <div className="flex flex-col gap-1 text-xs uppercase font-black tracking-widest">
                        <span className="text-white/80">{r.starts_at ? formatDateTime(r.starts_at, lang as 'tr' | 'en') : '-'}</span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <div className="w-1 h-px bg-white/10"></div>
                          {r.ends_at ? formatDateTime(r.ends_at, lang as 'tr' | 'en') : 'SÜRESİZ'}
                        </span>
                      </div>
                    </td>
                    <td className={adminTableCellClass}>
                      <div className="flex flex-col gap-1.5 w-24">
                        <div className="flex justify-between text-xs font-bold font-mono text-slate-400">
                          <span>{r.used_count || 0}</span>
                          <span>{r.usage_limit || '∞'}</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-colors duration-1000"
                            style={{ 
                              width: r.usage_limit ? `${Math.min((r.used_count || 0) / r.usage_limit * 100, 100)}%` : '0%' 
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className={`${adminTableCellClass} text-slate-500 text-xs font-black uppercase tracking-widest`}>
                      {formatDateTime(r.created_at, lang as 'tr' | 'en')}
                    </td>
                    <td className={`${adminTableCellClass} text-right`}>
                      <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors group">
                        <Ticket className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default AdminCouponsPage



