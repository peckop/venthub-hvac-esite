'use client'

import { Bell, Settings, ShieldAlert,Zap } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React from 'react'

import { useI18n } from '@/i18n/I18nProvider'
import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import { useRole } from '../../hooks/useRole'
import { 
  adminButtonPrimaryClass,
  adminCardClass, 
  adminInputClass,
  adminInputThresholdClass,
  adminInputTimeoutClass,
  adminSectionTitleClass, 
  adminSettingsLabelClass,
  adminSubtitleClass} from '../../utils/adminUi'

enum LoadState { Idle, Loading, Error }

const AdminInventorySettingsPage: React.FC = () => {
  const { t } = useI18n()
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

  const [initialValues, setInitialValues] = React.useState<{
    defaultThreshold: number | '';
    resetAll: boolean;
    alertEmail: string;
    alertWebhook: string;
    resTimeout: number;
  } | null>(null)

  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('inventory_settings')

  const load = React.useCallback(async () => {
    try {
      setLoading(LoadState.Loading)
      const { data, error } = await supabase.from('inventory_settings').select('*').maybeSingle()
      if (error) throw error
      const val = (data?.default_low_stock_threshold as number | null)
      const thresholdVal = val == null ? '' : Number(val)
      const emailVal = data?.alert_email || ''
      const webhookVal = data?.alert_webhook_url || ''
      const timeoutVal = data?.reservation_timeout_hours || 24

      setDefaultThreshold(thresholdVal)
      setAlertEmail(emailVal)
      setAlertWebhook(webhookVal)
      setResTimeout(timeoutVal)
      setResetAll(false)
      setError('')

      setInitialValues({
        defaultThreshold: thresholdVal,
        resetAll: false,
        alertEmail: emailVal,
        alertWebhook: webhookVal,
        resTimeout: timeoutVal
      })

      setLoading(LoadState.Idle)
    } catch {
      setError(t('admin.inventory.settings.loadError'))
      setLoading(LoadState.Error)
    }
  }, [t])

  React.useEffect(() => { load() }, [load, pathname])

  const isFormDirty = initialValues ? (
    defaultThreshold !== initialValues.defaultThreshold ||
    resetAll !== initialValues.resetAll ||
    alertEmail !== initialValues.alertEmail ||
    alertWebhook !== initialValues.alertWebhook ||
    resTimeout !== initialValues.resTimeout
  ) : false

  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    };
  }, [isFormDirty])

  async function save() {
    try {
      setSaving(true)
      setSuccess('')
      setError('')
      const value = (defaultThreshold === '' ? null : Number(defaultThreshold))
      await mutateWithAudit(supabase, {
        resource: 'inventory_settings',
        canWrite: hasWriteAccess,
        action: 'UPDATE',
        rowPk: null,
        before: null,
        after: { default_low_stock_threshold: value, reset_overrides: resetAll },
        auditedByEdge: false,
        fn: async () => {
          const { error } = await supabase.rpc('update_inventory_thresholds', { p_default: value as number, p_reset_overrides: resetAll })
          if (error) throw error
        },
      })
      setSuccess(resetAll ? t('admin.inventory.settings.saveSuccessReset') : t('admin.inventory.settings.saveSuccess'))
      await load()
    } catch (e: unknown) {
      console.error('update_inventory_thresholds error:', e)
      const msg = e instanceof AdminPermissionError ? t('admin.inventory.settings.noPermission') : e instanceof Error ? e.message : t('admin.inventory.settings.saveError')
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
      await mutateWithAudit(supabase, {
        resource: 'inventory_settings',
        canWrite: hasWriteAccess,
        action: 'UPDATE',
        rowPk: null,
        before: null,
        after: {
          alert_email: alertEmail || null,
          alert_webhook_url: alertWebhook || null,
          reservation_timeout_hours: resTimeout || 24,
        },
        auditedByEdge: false,
        fn: async () => {
          const { error } = await supabase.from('inventory_settings')
            .update({
              alert_email: alertEmail || null,
              alert_webhook_url: alertWebhook || null,
              reservation_timeout_hours: resTimeout || 24,
              updated_at: new Date().toISOString()
            })
            .eq('id', true)
          if (error) throw error
        },
      })
      setSuccess(t('admin.inventory.settings.saveGeneralSuccess'))
      await load()
    } catch (e: unknown) {
      console.error('saveGeneralSettings error:', e)
      const msg = e instanceof AdminPermissionError ? t('admin.inventory.settings.noPermission') : e instanceof Error ? e.message : t('admin.inventory.settings.saveError')
      setError(msg)
    } finally {
      setSavingGeneral(false)
    }
  }

  return (
    <div className="space-y-12 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-1">
        <h1 className={adminSectionTitleClass}>{t('admin.inventory.settings.title')}</h1>
        <p className={adminSubtitleClass}>{t('admin.inventory.settings.subtitle')}</p>
      </header>

      {!hasWriteAccess && (
        <div className="bg-admin-surface border border-admin-danger/30 bg-admin-danger-weak p-6 rounded-admin-lg flex items-center gap-4 text-admin-danger">
          <ShieldAlert size={24} />
          <div className="text-sm font-semibold">
            {t('admin.inventory.settings.noWritePermission')}
          </div>
        </div>
      )}

      <div className="space-y-12">
        {/* Grup 1: Stok Eşik Ayarları */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-8 pt-8 first:pt-0 border-t border-admin-border first:border-t-0">
          {/* Sol Kolon: Başlık ve Açıklama (2fr) */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <Settings className="text-admin-accent" size={20} />
              <h2 className="text-lg font-semibold text-admin-fg tracking-tight">
                {t('admin.inventory.settings.stockThresholdSettings')}
              </h2>
            </div>
            <p className="text-xs font-bold text-admin-fg-muted leading-relaxed">
              {t('admin.inventory.settings.thresholdDescription')}
            </p>
          </div>

          {/* Sağ Kolon: Form Alanları Card (5fr) */}
          <div className="md:col-span-5">
            <div className={`${adminCardClass} p-8 lg:p-10 space-y-6 relative overflow-hidden group`}>
              
              {loading === LoadState.Loading ? (
                <AdminSkeleton variant="form" fields={2} />
              ) : (
                <div className="relative z-raised space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className={adminSettingsLabelClass}>{t('admin.inventory.settings.defaultLowStockThreshold')}</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="number" 
                          className={`${adminInputClass} ${adminInputThresholdClass}`}
                          value={defaultThreshold} 
                          onChange={(e) => setDefaultThreshold(e.target.value === '' ? '' : Number(e.target.value))} 
                          placeholder="0" 
                        />
                        <button 
                          className={`${adminButtonPrimaryClass} flex-1 shadow-admin-md shadow-cyan-400/10`} 
                          disabled={saving || !hasWriteAccess} 
                          onClick={save}
                        >
                          {saving ? t('admin.inventory.settings.processing') : t('common.update')}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className={adminSettingsLabelClass}>{t('admin.inventory.settings.bulkApply')}</label>
                      <label className="flex items-start gap-4 p-4 rounded-admin-lg bg-surface-deep/40 border border-admin-border cursor-pointer group/item hover:border-admin-border transition-colors">
                        <input 
                          type="checkbox" 
                          className="mt-1 w-5 h-5 rounded-admin-md border-admin-border bg-transparent text-admin-accent focus-visible:ring-admin-accent/30 transition-colors" 
                          checked={resetAll} 
                          onChange={(e) => setResetAll(e.target.checked)} 
                        />
                        <div className="space-y-1">
                          <span className="block text-sm font-semibold text-admin-fg group-hover/item:text-admin-accent transition-colors">{t('admin.inventory.settings.applyToAll')}</span>
                          <span className="block text-xs font-bold text-admin-fg-muted leading-relaxed">
                            {t('admin.inventory.settings.bulkApplyHelp')}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="p-4 rounded-admin-lg bg-admin-warning-weak border border-admin-warning/30">
                    <p className="text-xs font-bold text-admin-warning leading-relaxed text-center">
                      {t('admin.inventory.settings.bulkApplyWarning')}
                    </p>
                  </div>

                  {loading === LoadState.Error && <div className="text-sm font-semibold text-admin-danger text-center">{error}</div>}
                  {!!success && <div className="text-sm font-semibold text-admin-success text-center">{success}</div>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grup 2: Alarm Otomasyonu */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-8 pt-8 border-t border-admin-border">
          {/* Sol Kolon: Başlık ve Açıklama (2fr) */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <Bell className="text-admin-accent" size={20} />
              <h2 className="text-lg font-semibold text-admin-fg tracking-tight">
                {t('admin.inventory.settings.alarmAutomation')}
              </h2>
            </div>
            <p className="text-xs font-bold text-admin-fg-muted leading-relaxed">
              {t('admin.inventory.settings.alarmDescription')}
            </p>
          </div>

          {/* Sağ Kolon: Form Alanları Card (5fr) */}
          <div className="md:col-span-5">
            <div className={`${adminCardClass} p-8 lg:p-10 space-y-6 relative overflow-hidden group`}>
              
              {loading === LoadState.Loading ? (
                <AdminSkeleton variant="form" fields={2} />
              ) : (
                <div className="relative z-raised space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className={adminSettingsLabelClass}>{t('admin.inventory.settings.emailNotifications')}</label>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-admin-fg-muted ml-1">{t('admin.inventory.settings.alertEmailLabel')}</label>
                        <input
                          type="email"
                          className={adminInputClass}
                          placeholder="ornek@sirket.com"
                          value={alertEmail}
                          onChange={e => setAlertEmail(e.target.value)}
                        />
                        <p className="text-xs font-bold text-admin-fg-muted ml-1">{t('admin.inventory.settings.alertEmailHelp')}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className={adminSettingsLabelClass}>{t('admin.inventory.settings.webhookIntegration')}</label>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-admin-fg-muted ml-1">{t('admin.inventory.settings.webhookUrlLabel')}</label>
                        <input
                          type="url"
                          className={adminInputClass}
                          placeholder="https://api.sirketiniz.com/stok-alarm"
                          value={alertWebhook}
                          onChange={e => setAlertWebhook(e.target.value)}
                        />
                        <p className="text-xs font-bold text-admin-fg-muted ml-1">{t('admin.inventory.settings.webhookUrlHelp')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grup 3: Rezervasyon Kuralları */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-8 pt-8 border-t border-admin-border">
          {/* Sol Kolon: Başlık ve Açıklama (2fr) */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <Zap className="text-admin-warning" size={20} />
              <h2 className="text-lg font-semibold text-admin-fg tracking-tight">
                {t('admin.inventory.settings.reservationRules')}
              </h2>
            </div>
            <p className="text-xs font-bold text-admin-fg-muted leading-relaxed">
              {t('admin.inventory.settings.reservationDescription')}
            </p>
          </div>

          {/* Sağ Kolon: Form Alanları Card (5fr) */}
          <div className="md:col-span-5">
            <div className={`${adminCardClass} p-8 lg:p-10 space-y-6 relative overflow-hidden group`}>
              
              {loading === LoadState.Loading ? (
                <AdminSkeleton variant="form" fields={1} />
              ) : (
                <div className="relative z-raised space-y-6">
                  <div className="max-w-md space-y-4">
                    <label className={adminSettingsLabelClass}>{t('admin.inventory.settings.reservationTimeoutLabel')}</label>
                    <div className="flex items-end gap-6">
                      <div className="flex-1 space-y-2">
                        <input
                          type="number"
                          min="1"
                          max="720"
                          className={`${adminInputClass} ${adminInputTimeoutClass}`}
                          value={resTimeout}
                          onChange={e => setResTimeout(parseInt(e.target.value) || 24)}
                        />
                      </div>
                      <div className="flex-1 pb-1">
                        <p className="text-xs font-bold text-admin-fg-muted leading-relaxed">
                          {t('admin.inventory.settings.reservationTimeoutHelp')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 flex justify-end relative z-raised border-t border-admin-border">
                    <button
                      disabled={savingGeneral || !hasWriteAccess}
                      onClick={saveGeneralSettings}
                      className={`${adminButtonPrimaryClass} px-12 h-14 bg-admin-accent text-admin-accent-fg hover:bg-admin-accent shadow-admin-md shadow-violet-500/20`}
                    >
                      {savingGeneral ? t('admin.inventory.settings.saving') : t('admin.inventory.settings.saveAll')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminInventorySettingsPage
