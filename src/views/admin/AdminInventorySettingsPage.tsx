import React from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { adminSectionTitleClass, adminCardClass, adminButtonPrimaryClass } from '../../utils/adminUi'
import { useAuth } from '../../hooks/useAuth'
import { useRole } from '../../hooks/useRole'

enum LoadState { Idle, Loading, Error }

const AdminInventorySettingsPage: React.FC = () => {
  const pathname = usePathname()
  const { user } = useAuth()
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
      // Global eşik ve toplu uygulama için yeni RPC
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
        .eq('id', 1)
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
    <div className="space-y-6">
      <h1 className={adminSectionTitleClass}>Eşik & Ayarlar</h1>

      {!hasWriteAccess && (
        <div className={`${adminCardClass} p-4 border-amber-300 bg-amber-50`}>
          <div className="text-sm text-amber-800">
            Bu sayfada değişiklik yapmak yetkisizsiniz. Sadece görüntüleyebilirsiniz.
          </div>
        </div>
      )}

      <div className={`${adminCardClass} p-4 space-y-4`}>
        <div>
          <label className="block text-sm font-bold text-slate-500 uppercase tracking-tight mb-2">Varsayılan Düşük Stok Eşiği</label>
          <div className="flex items-center gap-3">
            <input type="number" className="w-32 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy transition-all" value={defaultThreshold} onChange={(e) => setDefaultThreshold(e.target.value === '' ? '' : Number(e.target.value))} placeholder="örn. 8" />
            <button className={adminButtonPrimaryClass} disabled={saving || !hasWriteAccess} onClick={save}>Uygula</button>
          </div>
          <label className="mt-4 flex items-center gap-3 text-sm font-medium text-slate-600 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary-navy focus:ring-primary-navy" checked={resetAll} onChange={(e) => setResetAll(e.target.checked)} />
            <span className="group-hover:text-slate-900 transition-colors">Tüm ürünlere uygula (override’ları temizle)</span>
          </label>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-3">
            <p className="text-xs text-slate-500 leading-relaxed">Bu seçenek işaretliyken tüm ürünler varsayılan eşiği kullanacak şekilde ayarlanır (ürün bazlı override temizlenir). Bu işlem geri alınamaz.</p>
          </div>
        </div>

        {loading === LoadState.Loading && <div className="text-sm text-slate-500">Yükleniyor…</div>}
        {loading === LoadState.Error && <div className="text-sm text-red-600">{error}</div>}
        {!!success && <div className="text-sm text-green-700">{success}</div>}
      </div>

      <div className={`${adminCardClass} p-6 space-y-6`}>
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
          Alarm ve Otomasyon Ayarları
        </h2>

        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">E-Posta Bildirimleri</h3>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Kritik Stok Uyarı E-Postası</label>
            <input
              type="email"
              className="w-full sm:w-2/3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy transition-all"
              placeholder="ornek@sirket.com"
              value={alertEmail}
              onChange={e => setAlertEmail(e.target.value)}
            />
            <p className="text-xs text-slate-400 mt-1">Stok eşiğin altına düşünce bu adrese otomatik bilgilendirme gönderilecektir.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mt-6">Webhook Entegrasyonu</h3>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Webhook URL (Opsiyonel)</label>
            <input
              type="url"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy transition-all"
              placeholder="https://api.sirketiniz.com/webhook/stok-alarm"
              value={alertWebhook}
              onChange={e => setAlertWebhook(e.target.value)}
            />
            <p className="text-xs text-slate-400 mt-1">Slack, Discord veya ERP (SAP) sistemlerinize stok alarm verisini HTTP POST ile anlık iletmek için kullanabilirsiniz.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mt-6">Rezervasyon Kuralları</h3>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Otomatik Rezervasyon İptal Süresi (Saat)</label>
            <input
              type="number"
              min="1"
              max="720"
              className="w-32 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy transition-all"
              value={resTimeout}
              onChange={e => setResTimeout(parseInt(e.target.value) || 24)}
            />
            <p className="text-xs text-slate-400 mt-1">Siparişi tamamlanmayan rezerve ürünlerin tekrar "Satılabilir" duruma dönmesi için geçmesi gereken bekleme süresi.</p>
          </div>
        </section>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            disabled={savingGeneral || !hasWriteAccess}
            onClick={saveGeneralSettings}
            className={adminButtonPrimaryClass + " px-6 py-2.5"}
          >
            {savingGeneral ? 'Kaydediliyor...' : 'Genel Ayarları Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminInventorySettingsPage



