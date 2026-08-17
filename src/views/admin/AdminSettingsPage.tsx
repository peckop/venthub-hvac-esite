'use client'

import { Activity, CreditCard, Globe, ShieldCheck } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import SettingsFormModal, { type SettingsSection } from '@/components/admin/settings/SettingsFormModal'
import { useRole } from '@/hooks/useRole'
import { useI18n } from '@/i18n/I18nProvider'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import {
  adminCardClass,
  adminSectionTitleClass,
  adminSubtitleClass,
} from '../../utils/adminUi'

const AdminSettingsPage: React.FC = () => {
  const { t } = useI18n()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('settings')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  type RenderableSettings = Record<string, string | number | boolean | null | undefined>

  // Section States
  const [generalValues, setGeneralValues] = useState<RenderableSettings | null>(null)
  const [paymentValues, setPaymentValues] = useState<RenderableSettings | null>(null)
  const [adminsValues, setAdminsValues] = useState<RenderableSettings | null>(null)
  const [systemValues, setSystemValues] = useState<RenderableSettings | null>(null)

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [modalSection, setModalSection] = useState<SettingsSection | null>(null)
  const [modalInitialValues, setModalInitialValues] = useState<RenderableSettings | null>(null)

  const fetchAllSettings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('key, value')

      if (fetchError) throw fetchError

      const gen = (data?.find((r) => r.key === 'general')?.value || {}) as RenderableSettings
      const pay = (data?.find((r) => r.key === 'payment')?.value || {}) as RenderableSettings
      const adm = (data?.find((r) => r.key === 'admins')?.value || {}) as Record<string, unknown>
      const sys = (data?.find((r) => r.key === 'system')?.value || {}) as Record<string, unknown>

      setGeneralValues({
        site_name: String(gen.site_name || ''),
        tagline: String(gen.tagline || ''),
        contact_email: String(gen.contact_email || ''),
        support_phone: String(gen.support_phone || ''),
        headquarters: String(gen.headquarters || ''),
        logo_url: gen.logo_url ? String(gen.logo_url) : '',
      })

      setPaymentValues({
        iyzico_enabled: !!pay.iyzico_enabled,
        iyzico_mode: pay.iyzico_mode === 'production' ? 'production' : 'sandbox',
        iyzico_api_key: String(pay.iyzico_api_key || ''),
      })

      setAdminsValues({
        admin_sessions_timeout: String(adm.admin_sessions_timeout || '24'),
        mfa_required: !!adm.mfa_required,
      })

      setSystemValues({
        system_log_level: sys.system_log_level === 'debug' || sys.system_log_level === 'warn' || sys.system_log_level === 'error' ? String(sys.system_log_level) : 'info',
        debug_mode: !!sys.debug_mode,
      })
    } catch (err: unknown) {
      console.error('Fetch settings error:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllSettings()
  }, [fetchAllSettings])

  const openModal = (section: SettingsSection, values: RenderableSettings | null) => {
    setModalSection(section)
    setModalInitialValues(values)
    setModalOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <header className="space-y-1">
          <h1 className={adminSectionTitleClass}>{t('admin.titles.settings')}</h1>
          <p className={adminSubtitleClass}>{t('admin.common.settingsLoading')}</p>
        </header>
        <AdminSkeleton variant="form" fields={4} />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <header className="space-y-1">
          <h1 className={adminSectionTitleClass}>{t('admin.titles.settings')}</h1>
          <p className={adminSubtitleClass}>{t('admin.menu.groupSystem')}</p>
        </header>
      </div>

      {error && (
        <div className="p-4 rounded-admin-md bg-admin-danger-weak border border-admin-danger/30 text-admin-danger text-sm font-bold">
          {error}
        </div>
      )}

      {/* Settings Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* General Settings Card */}
        <div className={`${adminCardClass} p-8 lg:p-10 space-y-6 relative overflow-hidden group flex flex-col justify-between`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-admin-accent-weak rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-admin-accent-weak" />
          <div className="relative z-raised space-y-6">
            <div className="flex items-center gap-3 border-b border-admin-border pb-4">
              <Globe className="text-admin-accent" size={20} />
              <h2 className="text-lg font-semibold text-admin-fg tracking-tight">
                {t('admin.settings.generalSettingsTitle')}
              </h2>
            </div>
            <div className="space-y-3 text-sm text-admin-fg">
              <p>
                <span className="text-admin-fg-muted font-bold block text-xs">{t('admin.settings.siteName')}</span>
                <span className="font-semibold text-admin-fg">{generalValues?.site_name || '-'}</span>
              </p>
              <p>
                <span className="text-admin-fg-muted font-bold block text-xs">{t('admin.settings.tagline')}</span>
                <span className="font-semibold text-admin-fg">{generalValues?.tagline || '-'}</span>
              </p>
              <p>
                <span className="text-admin-fg-muted font-bold block text-xs">{t('admin.settings.contactEmail')}</span>
                <span className="font-semibold text-admin-fg">{generalValues?.contact_email || '-'}</span>
              </p>
              <p>
                <span className="text-admin-fg-muted font-bold block text-xs">{t('admin.settings.supportPhone')}</span>
                <span className="font-semibold text-admin-fg">{generalValues?.support_phone || '-'}</span>
              </p>
              <p>
                <span className="text-admin-fg-muted font-bold block text-xs">{t('admin.settings.headquarters')}</span>
                <span className="font-semibold text-admin-fg">{generalValues?.headquarters || '-'}</span>
              </p>
            </div>
          </div>
          <div className="relative z-raised pt-6 border-t border-admin-border">
            <button
              onClick={() => openModal('general', generalValues)}
              disabled={!hasWriteAccess}
              className="w-full py-3 bg-admin-accent-weak border border-admin-accent/30 text-admin-accent hover:bg-admin-accent hover:text-admin-fg-subtle font-bold text-xs rounded-admin-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('admin.common.edit')}
            </button>
          </div>
        </div>

        {/* Payment Settings Card */}
        <div className={`${adminCardClass} p-8 lg:p-10 space-y-6 relative overflow-hidden group flex flex-col justify-between`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-admin-accent-weak rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-admin-accent-weak" />
          <div className="relative z-raised space-y-6">
            <div className="flex items-center gap-3 border-b border-admin-border pb-4">
              <CreditCard className="text-admin-accent" size={20} />
              <h2 className="text-lg font-semibold text-admin-fg tracking-tight">
                {t('admin.settings.paymentSettingsTitle')}
              </h2>
            </div>
            <div className="space-y-3 text-sm text-admin-fg">
              <p>
                <span className="text-admin-fg-muted font-bold block text-xs">{t('admin.settings.iyzicoActive')}</span>
                <span className={`font-semibold ${paymentValues?.iyzico_enabled ? 'text-admin-success' : 'text-admin-fg-muted'}`}>
                  {paymentValues?.iyzico_enabled ? t('admin.common.active') : t('admin.common.passive')}
                </span>
              </p>
              <p>
                <span className="text-admin-fg-muted font-bold block text-xs">{t('admin.settings.iyzicoMode')}</span>
                <span className="font-semibold text-admin-fg">{paymentValues?.iyzico_mode || '-'}</span>
              </p>
              <p>
                <span className="text-admin-fg-muted font-bold block text-xs">{t('admin.settings.iyzicoApiKey')}</span>
                <span className="font-mono text-xs text-admin-fg">
                  {paymentValues?.iyzico_api_key ? '••••••••••••••••' : '-'}
                </span>
              </p>
            </div>
          </div>
          <div className="relative z-raised pt-6 border-t border-admin-border">
            <button
              onClick={() => openModal('payment', paymentValues)}
              disabled={!hasWriteAccess}
              className="w-full py-3 bg-admin-accent-weak border border-admin-accent/30 text-admin-accent hover:bg-admin-accent hover:text-admin-fg-subtle font-bold text-xs rounded-admin-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('admin.common.edit')}
            </button>
          </div>
        </div>

        {/* Admin Policies Card */}
        <div className={`${adminCardClass} p-8 lg:p-10 space-y-6 relative overflow-hidden group flex flex-col justify-between`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-admin-accent-weak rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-admin-accent-weak" />
          <div className="relative z-raised space-y-6">
            <div className="flex items-center gap-3 border-b border-admin-border pb-4">
              <ShieldCheck className="text-admin-accent" size={20} />
              <h2 className="text-lg font-semibold text-admin-fg tracking-tight">
                {t('admin.settings.adminsPolicyTitle')}
              </h2>
            </div>
            <div className="space-y-3 text-sm text-admin-fg">
              <p>
                <span className="text-admin-fg-muted font-bold block text-xs">{t('admin.settings.adminSessionTimeout')}</span>
                <span className="font-semibold text-admin-fg">{adminsValues?.admin_sessions_timeout} {t('admin.common.range')} ({t('admin.settings.hoursUnit')})</span>
              </p>
              <p>
                <span className="text-admin-fg-muted font-bold block text-xs">{t('admin.settings.mfaRequired')}</span>
                <span className={`font-semibold ${adminsValues?.mfa_required ? 'text-admin-warning' : 'text-admin-fg-muted'}`}>
                  {adminsValues?.mfa_required ? t('admin.common.yes') : t('admin.common.no')}
                </span>
              </p>
            </div>
          </div>
          <div className="relative z-raised pt-6 border-t border-admin-border">
            <button
              onClick={() => openModal('admins', adminsValues)}
              disabled={!hasWriteAccess}
              className="w-full py-3 bg-admin-accent-weak border border-admin-accent/30 text-admin-accent hover:bg-admin-accent hover:text-admin-fg-subtle font-bold text-xs rounded-admin-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('admin.common.edit')}
            </button>
          </div>
        </div>

        {/* System Configurations Card */}
        <div className={`${adminCardClass} p-8 lg:p-10 space-y-6 relative overflow-hidden group flex flex-col justify-between`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-admin-accent-weak rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-admin-accent-weak" />
          <div className="relative z-raised space-y-6">
            <div className="flex items-center gap-3 border-b border-admin-border pb-4">
              <Activity className="text-admin-accent" size={20} />
              <h2 className="text-lg font-semibold text-admin-fg tracking-tight">
                {t('admin.settings.systemConfigTitle')}
              </h2>
            </div>
            <div className="space-y-3 text-sm text-admin-fg">
              <p>
                <span className="text-admin-fg-muted font-bold block text-xs">{t('admin.settings.systemLogLevel')}</span>
                <span className="font-semibold text-admin-fg">{systemValues?.system_log_level}</span>
              </p>
              <p>
                <span className="text-admin-fg-muted font-bold block text-xs">{t('admin.settings.debugMode')}</span>
                <span className={`font-semibold ${systemValues?.debug_mode ? 'text-admin-warning' : 'text-admin-fg-muted'}`}>
                  {systemValues?.debug_mode ? t('admin.common.active') : t('admin.common.passive')}
                </span>
              </p>
            </div>
          </div>
          <div className="relative z-raised pt-6 border-t border-admin-border">
            <button
              onClick={() => openModal('system', systemValues)}
              disabled={!hasWriteAccess}
              className="w-full py-3 bg-admin-accent-weak border border-admin-accent/30 text-admin-accent hover:bg-admin-accent hover:text-admin-fg-subtle font-bold text-xs rounded-admin-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('admin.common.edit')}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Form Modal */}
      {modalOpen && (
        <SettingsFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          section={modalSection}
          initialValues={modalInitialValues}
          onSuccess={fetchAllSettings}
        />
      )}
    </div>
  )
}

export default AdminSettingsPage
