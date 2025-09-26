import React from 'react'
import { getSupabase } from '../../lib/supabase'
import { adminSectionTitleClass, adminCardClass } from '../../utils/adminUi'
import { useAuth } from '../../hooks/useAuth'
import { checkAdminAccessAsync } from '../../config/admin'

enum LoadState { Idle, Loading, Error }

const AdminInventorySettingsPage: React.FC = () => {
  const { user } = useAuth()
  const [defaultThreshold, setDefaultThreshold] = React.useState<number | ''>('')
  const [resetAll, setResetAll] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState<LoadState>(LoadState.Idle)
  const [saving, setSaving] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string>('')
  const [success, setSuccess] = React.useState<string>('')
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false)
  React.useEffect(()=>{ (async()=>{ setIsAdmin(await checkAdminAccessAsync(user)) })() }, [user])

  const load = React.useCallback(async()=>{
    try {
      setLoading(LoadState.Loading)
      const supabase = await getSupabase()
      const { data, error } = await supabase.from('inventory_settings').select('default_low_stock_threshold').maybeSingle()
      if (error) throw error
      const val = (data?.default_low_stock_threshold as number | null)
      setDefaultThreshold(val == null ? '' : Number(val))
      setError('')
      setLoading(LoadState.Idle)
    } catch {
      setError('Ayarlar yüklenemedi')
      setLoading(LoadState.Error)
    }
  }, [])

  React.useEffect(()=>{ load() }, [load])

  async function save() {
    try {
      setSaving(true)
      setSuccess('')
      setError('')
      const value = (defaultThreshold === '' ? null : Number(defaultThreshold))
      // Global eşik ve toplu uygulama için yeni RPC
      const supabase = await getSupabase()
      const { error } = await supabase.rpc('update_inventory_thresholds', { p_default: value, p_reset_overrides: resetAll })
      if (error) throw error
      setSuccess(resetAll ? 'Kaydedildi ve tüm ürünlere uygulandı' : 'Kaydedildi')
      await load() // kaydettikten sonra güncel değeri yeniden yükle
    } catch (e: unknown) {
      console.error('update_inventory_thresholds error:', e)
      const msg = e instanceof Error ? e.message : 'Kaydedilemedi'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className={adminSectionTitleClass}>Eşik & Ayarlar</h1>

      {!isAdmin && (
        <div className={`${adminCardClass} p-4 border-amber-300 bg-amber-50`}> 
          <div className="text-sm text-amber-800">
            Bu sayfada değişiklik yapmak için admin olarak giriş yapmalısınız. Lütfen giriş yapın ve tekrar deneyin.
          </div>
        </div>
      )}

      <div className={`${adminCardClass} p-4 space-y-4`}>
        <div>
          <label className="block text-sm text-steel-gray mb-1">Varsayılan Düşük Stok Eşiği</label>
          <div className="flex items-center gap-2">
            <input type="number" className="w-32 px-3 py-2 border rounded" value={defaultThreshold} onChange={(e)=>setDefaultThreshold(e.target.value === '' ? '' : Number(e.target.value))} placeholder="örn. 8" />
            <button className="px-3 py-2 border rounded" disabled={saving || !isAdmin} onClick={save}>Uygula</button>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={resetAll} onChange={(e)=>setResetAll(e.target.checked)} />
            Tüm ürünlere uygula (override’ları temizle)
          </label>
          <p className="text-xs text-steel-gray mt-1">Bu seçenek işaretliyken tüm ürünler varsayılan eşiği kullanacak şekilde ayarlanır (ürün bazlı override temizlenir).</p>
        </div>

        {loading === LoadState.Loading && <div className="text-sm text-steel-gray">Yükleniyor…</div>}
        {loading === LoadState.Error && <div className="text-sm text-red-600">{error}</div>}
        {!!success && <div className="text-sm text-green-700">{success}</div>}
      </div>

      {/* İleri Aşama: Kategori/Depo bazlı eşik kuralları ve CSV import/export */}
      <div className={`${adminCardClass} p-4`}>
        <div className="text-sm text-steel-gray">Geleceğe hazırlık: Kategori/Depo bazlı eşik kuralları ve CSV ile toplu eşik güncelleme burada yer alacak.</div>
      </div>
    </div>
  )
}

export default AdminInventorySettingsPage
