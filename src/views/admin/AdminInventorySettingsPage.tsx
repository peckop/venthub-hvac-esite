import React from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { 
  adminSectionTitleClass, 
  adminSubtitleClass,
  adminCardClass, 
  adminButtonPrimaryClass,
  adminInputClass,
  adminSettingsLabelClass
} from '../../utils/adminUi'
import AdminSkeleton from '../../components/admin/AdminSkeleton'
import { useRole } from '../../hooks/useRole'
import { Settings, Bell, Zap, ShieldAlert } from 'lucide-react'

enum LoadState { Idle, Loading, Error }

const AdminInventorySettingsPage: React.FC = () => {
  const pathname = usePathname()
  const [defaultThreshold, setDefaultThreshold] = React.useState<number | ''>('')
  const [resetAll, setResetAll] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState<LoadState>(LoadState.Idle)
  const [saving, setSaving] = React.useState<boolean>(false)
  const [savingGeneral, setSavingGeneral] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string>('')
  const [success, setSuccess] = React.useState<string>('')

  // Yeni ayarlar
  const [alertEmail, setAlertEmail] = React.useState<string>('')
  const [alertWebhook, setAlertWebhook] = React.useState<string>('')
  const [resTimeout, setResTimeout] = React.useState<number>(24)

  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('inventory_settings')

  const load = React.useCallback(async () => {
    try {
      setLoading(LoadState.Loading)
      const { data, error } = await supabase.from('inventory_settings').select('*').maybeSingle()
      if (error) throw error
      const val = (data?.default_low_stock_threshold as number | null)
      setDefaultThreshold(val == null ? '' : Number(val))
      setAlertEmail(data?.alert_email || '')
      setAlertWebhook(data?.alert_webhook_url || '')
      setResTimeout(data?.reservation_timeout_hours || 24)
      setError('')
      setLoading(LoadState.Idle)
    } catch {
      setError('Ayarlar yüklenemedi')
      setLoading(LoadState.Error)
    }
  }, [])

  React.useEffect(() => { load() }, [load, pathname])

  async function save() {
    try {
      setSaving(true)
      setSuccess('')
      setError('')
      const value = (defaultThreshold === '' ? null : Number(defaultThreshold))
      const rpc = supabase.rpc as unknown as (
        fn: string,
        args: { p_default: number | null; p_reset_overrides: boolean }
      ) => Promise<{ error: Error | null }>
      const { error } = await rpc('update_inventory_thresholds', { p_default: value, p_reset_overrides: resetAll })
      if (error) throw error
      setSuccess(resetAll ? 'Kaydedildi ve tüm ürünlere uygulandı' : 'Kaydedildi')
      await load()
    } catch (e: unknown) {
      console.error('update_inventory_thresholds error:', e)
      const msg = e instanceof Error ? e.message : 'Kaydedilemedi'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function saveGeneralSettings() {
    try {
      setSavingGeneral(true)
      setSuccess('')
      setError('')
      const { error } = await supabase.from('inventory_settings')
        .update({
          alert_email: alertEmail || null,
          alert_webhook_url: alertWebhook || null,
          reservation_timeout_hours: resTimeout || 24,
          updated_at: new Date().toISOString()
        })
        .eq('id', true)
      if (error) throw error
      setSuccess('Genel ayarlar kaydedildi')
      await load()
    } catch (e: unknown) {
      console.error('saveGeneralSettings error:', e)
      const msg = e instanceof Error ? e.message : 'Kaydedilemedi'
      setError(msg)
    } finally {
      setSavingGeneral(false)
    }
  }

  return (
    <div className="space-y-10 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-1">
        <h1 className={adminSectionTitleClass}>Eşik & Ayarlar</h1>
        <p className={adminSubtitleClass}>Envanter otomasyonu, stok alarmları ve rezervasyon kurallarını yapılandırın.</p>
      </header>

      {!hasWriteAccess && (
        <div className="glass-strong border border-rose-500/20 bg-rose-500/5 p-6 rounded-[2rem] flex items-center gap-4 text-rose-500">
          <ShieldAlert size={24} />
          <div className="text-sm font-black uppercase tracking-widest">
            Bu sayfada değişiklik yapmak için yetkiniz bulunmuyor.
          </div>
        </div>
      )}

      <div className={`${adminCardClass} p-8 lg:p-10 space-y-8 relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-cyan-500/10" />
        
        {loading === LoadState.Loading ? (
          <AdminSkeleton variant="form" fields={3} />
        ) : (
          <>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Settings className="text-cyan-400" size={20} />
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Stok Eşik Ayarları</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className={adminSettingsLabelClass}>Varsayılan Düşük Stok Eşiği</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      className={`${adminInputClass} max-w-[120px] !h-12 !text-center !text-lg !font-black`}
                      value={defaultThreshold} 
                      onChange={(e) => setDefaultThreshold(e.target.value === '' ? '' : Number(e.target.value))} 
                      placeholder="0" 
                    />
                    <button 
                      className={`${adminButtonPrimaryClass} flex-1 shadow-lg shadow-cyan-400/10`} 
                      disabled={saving || !hasWriteAccess} 
                      onClick={save}
                    >
                      {saving ? 'İşleniyor...' : 'Güncelle'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className={adminSettingsLabelClass}>Toplu Uygulama</label>
                  <label className="flex items-start gap-4 p-4 rounded-2xl bg-[#0A0F1E]/40 border border-white/5 cursor-pointer group hover:border-white/10 transition-all">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-5 h-5 rounded-lg border-white/10 bg-transparent text-cyan-400 focus:ring-cyan-400/20 transition-all" 
                      checked={resetAll} 
                      onChange={(e) => setResetAll(e.target.checked)} 
                    />
                    <div className="space-y-1">
                      <span className="block text-sm font-black text-white group-hover:text-cyan-400 transition-colors">Tüm Ürünlere Uygula</span>
                      <span className="block text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                        Ürün bazlı özel eşikleri temizleyerek her şeyde varsayılanı kullanır.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <p className="text-[11px] font-bold text-amber-500/80 leading-relaxed uppercase tracking-widest text-center">
                  Bu işlem ürün veritabanında toplu güncelleme yapar ve geri alınamaz.
                </p>
              </div>
            </div>

            {loading === LoadState.Error && <div className="text-sm font-black text-rose-500 text-center uppercase tracking-widest">{error}</div>}
            {!!success && <div className="text-sm font-black text-emerald-400 text-center uppercase tracking-widest">{success}</div>}
          </>
        )}
      </div>

      <div className={`${adminCardClass} p-8 lg:p-10 space-y-10 relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-violet-500/10" />

        <section className="space-y-8 relative z-10">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Bell className="text-violet-400" size={20} />
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Alarm ve Otomasyon</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className={adminSettingsLabelClass}>E-Posta Bildirimleri</label>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 ml-1 uppercase">Kritik Stok Alıcı Adresi</label>
                <input
                  type="email"
                  className={adminInputClass}
                  placeholder="ornek@sirket.com"
                  value={alertEmail}
                  onChange={e => setAlertEmail(e.target.value)}
                />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kritik seviyelerde bu adrese mail gönderilir.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className={adminSettingsLabelClass}>Webhook Entegrasyonu</label>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 ml-1 uppercase">Webhook URL (Slack/ERP)</label>
                <input
                  type="url"
                  className={adminInputClass}
                  placeholder="https://api.sirketiniz.com/stok-alarm"
                  value={alertWebhook}
                  onChange={e => setAlertWebhook(e.target.value)}
                />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Anlık veri iletimi için HTTP POST endpoint.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8 relative z-10 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <Zap className="text-amber-400" size={20} />
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Rezervasyon Kuralları</h2>
          </div>

          <div className="max-w-md space-y-4">
            <label className={adminSettingsLabelClass}>Otomatik Rezervasyon İptal Süresi (Saat)</label>
            <div className="flex items-end gap-6">
              <div className="flex-1 space-y-2">
                <input
                  type="number"
                  min="1"
                  max="720"
                  className={`${adminInputClass} !h-12 text-lg font-black`}
                  value={resTimeout}
                  onChange={e => setResTimeout(parseInt(e.target.value) || 24)}
                />
              </div>
              <div className="flex-1 pb-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                  Ödemesi tamamlanmayan ürünlerin stoktan düşme süresidir.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-8 flex justify-end relative z-10">
          <button
            disabled={savingGeneral || !hasWriteAccess}
            onClick={saveGeneralSettings}
            className={`${adminButtonPrimaryClass} px-12 h-14 bg-violet-500 text-white hover:bg-violet-400 shadow-lg shadow-violet-500/20`}
          >
            {savingGeneral ? 'Kaydediliyor...' : 'Tüm Ayarları Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminInventorySettingsPage
