import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import { Loader2, Save, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { useRole } from '@/hooks/useRole'
import { useI18n } from '@/i18n/I18nProvider'
import { AdminPermissionError, mutateWithAudit } from '@/lib/admin/mutateWithAudit'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'
import { toSupabaseJson } from '@/lib/type-converters'

import {
  adminButtonPrimaryClass,
  adminInputClass,
  adminSettingsLabelClass,
} from '../../../utils/adminUi'

export type SettingsSection = 'general' | 'payment' | 'admins' | 'system'

// --- Schemas per section ---
const generalSchema = z.object({
  site_name: z.string().min(1, 'Site adı zorunludur'),
  tagline: z.string().min(1, 'Slogan zorunludur'),
  contact_email: z.string().email('Geçersiz e-posta adresi').min(1, 'E-posta zorunludur'),
  support_phone: z.string().min(1, 'Destek telefonu zorunludur'),
  headquarters: z.string().min(1, 'Merkez adresi zorunludur'),
  logo_url: z.string().url('Geçersiz URL').or(z.string().length(0)).nullable().optional(),
})

const paymentSchema = z.object({
  iyzico_enabled: z.boolean(),
  iyzico_mode: z.enum(['sandbox', 'production']),
  iyzico_api_key: z.string().min(1, 'API anahtarı zorunludur'),
})

const adminsSchema = z.object({
  admin_sessions_timeout: z.string().min(1, 'Oturum süresi zorunludur'),
  mfa_required: z.boolean(),
})

const systemSchema = z.object({
  system_log_level: z.enum(['debug', 'info', 'warn', 'error']),
  debug_mode: z.boolean(),
})

interface SettingsFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  section: SettingsSection | null
  initialValues: Record<string, unknown> | null
  onSuccess: () => void
}

const SettingsFormModal: React.FC<SettingsFormModalProps> = ({
  open,
  onOpenChange,
  section,
  initialValues,
  onSuccess,
}) => {
  const { t } = useI18n()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('settings')
  const [saving, setSaving] = useState(false)

  // Determine active schema dynamically
  const schema = React.useMemo(() => {
    if (!section) return generalSchema
    switch (section) {
      case 'general':
        return generalSchema
      case 'payment':
        return paymentSchema
      case 'admins':
        return adminsSchema
      case 'system':
        return systemSchema
    }
  }, [section])

  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: initialValues || {},
  })

  // Load values when modal opens or section changes
  useEffect(() => {
    if (open && initialValues) {
      form.reset(initialValues)
    }
  }, [open, initialValues, form])

  const handleClose = () => {
    if (form.formState.isDirty) {
      if (
        window.confirm(
          t('admin.categories.unsavedChangesConfirm') ||
            'Kaydedilmemiş değişiklikleriniz var. Ayrılmak istediğinizden emin misiniz?',
        )
      ) {
        onOpenChange(false)
      }
    } else {
      onOpenChange(false)
    }
  }

  const handleOpenChange = (openVal: boolean) => {
    if (!openVal) {
      handleClose()
    } else {
      onOpenChange(true)
    }
  }

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [form.formState.isDirty])

  const onSubmit = async (values: Record<string, unknown>) => {
    if (!section) return
    setSaving(true)

    try {
      const { data: authData } = await supabase.auth.getUser()
      const userId = authData.user?.id || null

      await mutateWithAudit(supabase, {
        resource: 'settings',
        canWrite: hasWriteAccess,
        action: 'UPDATE',
        rowPk: section,
        before: initialValues,
        after: values,
        fn: async () => {
          const { error } = await supabase
            .from('site_settings')
            .upsert({
              key: section,
              value: toSupabaseJson(values),
              updated_by: userId,
              updated_at: new Date().toISOString(),
            })
          if (error) throw error
        },
      })

      toast.success(t('admin.settings.saveSuccess'))
      onSuccess()
      onOpenChange(false)
    } catch (e: unknown) {
      console.error('Save settings error:', e)
      const msg =
        e instanceof AdminPermissionError
          ? t('admin.settings.noPermission')
          : e instanceof Error
          ? e.message
          : t('admin.settings.saveError')
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const getSectionTitle = () => {
    if (!section) return ''
    switch (section) {
      case 'general':
        return t('admin.settings.generalSettingsTitle')
      case 'payment':
        return t('admin.settings.paymentSettingsTitle')
      case 'admins':
        return t('admin.settings.adminsPolicyTitle')
      case 'system':
        return t('admin.settings.systemConfigTitle')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-surface-deep border border-white/10 rounded-2xl shadow-2xl z-modal flex flex-col overflow-hidden max-h-admin-modal">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/2">
            <div>
              <Dialog.Title className="text-xl font-bold text-white tracking-tight">
                {getSectionTitle()}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-400 mt-1">
                {t('admin.settings.form.descEdit')}
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
              <X size={20} />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <form id="settings-modal-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {section === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={adminSettingsLabelClass}>{t('admin.settings.siteName')}</label>
                      <input
                        type="text"
                        className={adminInputClass}
                        {...form.register('site_name')}
                        placeholder={t('admin.settings.siteNamePlaceholder')}
                      />
                      {form.formState.errors.site_name?.message ? (
                        <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-tighter">
                          {String(form.formState.errors.site_name.message)}
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <label className={adminSettingsLabelClass}>{t('admin.settings.tagline')}</label>
                      <input
                        type="text"
                        className={adminInputClass}
                        {...form.register('tagline')}
                        placeholder={t('admin.settings.taglinePlaceholder')}
                      />
                      {form.formState.errors.tagline?.message ? (
                        <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-tighter">
                          {String(form.formState.errors.tagline.message)}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={adminSettingsLabelClass}>{t('admin.settings.contactEmail')}</label>
                      <input
                        type="email"
                        className={adminInputClass}
                        {...form.register('contact_email')}
                        placeholder={t('admin.settings.contactEmailPlaceholder')}
                      />
                      {form.formState.errors.contact_email?.message ? (
                        <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-tighter">
                          {String(form.formState.errors.contact_email.message)}
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <label className={adminSettingsLabelClass}>{t('admin.settings.supportPhone')}</label>
                      <input
                        type="text"
                        className={adminInputClass}
                        {...form.register('support_phone')}
                        placeholder={t('admin.settings.supportPhonePlaceholder')}
                      />
                      {form.formState.errors.support_phone?.message ? (
                        <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-tighter">
                          {String(form.formState.errors.support_phone.message)}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={adminSettingsLabelClass}>{t('admin.settings.headquarters')}</label>
                    <input
                      type="text"
                      className={adminInputClass}
                      {...form.register('headquarters')}
                      placeholder={t('admin.settings.headquartersPlaceholder')}
                    />
                    {form.formState.errors.headquarters?.message ? (
                      <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-tighter">
                        {String(form.formState.errors.headquarters.message)}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className={adminSettingsLabelClass}>{t('admin.settings.logoUrl')}</label>
                    <input
                      type="text"
                      className={adminInputClass}
                      {...form.register('logo_url')}
                      placeholder={t('admin.settings.logoUrlPlaceholder')}
                    />
                    {form.formState.errors.logo_url?.message ? (
                      <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-tighter">
                        {String(form.formState.errors.logo_url.message)}
                      </p>
                    ) : null}
                  </div>
                </div>
              )}

              {section === 'payment' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={adminSettingsLabelClass}>{t('admin.settings.iyzicoActive')}</label>
                    <label className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/40 border border-white/5 cursor-pointer group hover:border-white/10 transition-colors">
                      <input
                        type="checkbox"
                        className="mt-1 w-5 h-5 rounded-lg border-white/10 bg-transparent text-cyan-400 focus-visible:ring-cyan-400/20 transition-colors"
                        {...form.register('iyzico_enabled')}
                      />
                      <div className="space-y-1">
                        <span className="block text-sm font-black text-white group-hover:text-cyan-400 transition-colors">
                          {t('admin.settings.iyzicoEnable')}
                        </span>
                        <span className="block text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                          {t('admin.settings.iyzicoEnableDesc')}
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={adminSettingsLabelClass}>{t('admin.settings.iyzicoMode')}</label>
                      <select
                        className={`${adminInputClass} !bg-slate-950 !border-white/5`}
                        {...form.register('iyzico_mode')}
                      >
                        <option value="sandbox">{t('admin.settings.iyzicoSandbox')}</option>
                        <option value="production">{t('admin.settings.iyzicoProduction')}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className={adminSettingsLabelClass}>{t('admin.settings.iyzicoApiKey')}</label>
                      <input
                        type="text"
                        className={adminInputClass}
                        {...form.register('iyzico_api_key')}
                        placeholder={t('admin.settings.iyzicoApiKeyPlaceholder')}
                      />
                      {form.formState.errors.iyzico_api_key?.message ? (
                        <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-tighter">
                          {String(form.formState.errors.iyzico_api_key.message)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {section === 'admins' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={adminSettingsLabelClass}>{t('admin.settings.adminSessionTimeout')}</label>
                      <input
                        type="number"
                        className={adminInputClass}
                        {...form.register('admin_sessions_timeout')}
                        min="1"
                        max="168"
                      />
                      {form.formState.errors.admin_sessions_timeout?.message ? (
                        <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-tighter">
                          {String(form.formState.errors.admin_sessions_timeout.message)}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label className={adminSettingsLabelClass}>{t('admin.settings.mfaRequired')}</label>
                      <label className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/40 border border-white/5 cursor-pointer group hover:border-white/10 transition-colors">
                        <input
                          type="checkbox"
                          className="mt-1 w-5 h-5 rounded-lg border-white/10 bg-transparent text-cyan-400 focus-visible:ring-cyan-400/20 transition-colors"
                          {...form.register('mfa_required')}
                        />
                        <div className="space-y-1">
                          <span className="block text-sm font-black text-white group-hover:text-cyan-400 transition-colors">
                            {t('admin.settings.mfaRequiredLabel')}
                          </span>
                          <span className="block text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                            {t('admin.settings.mfaRequiredDesc')}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {section === 'system' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={adminSettingsLabelClass}>{t('admin.settings.systemLogLevel')}</label>
                      <select
                        className={`${adminInputClass} !bg-slate-950 !border-white/5`}
                        {...form.register('system_log_level')}
                      >
                        <option value="debug">{t('admin.settings.logLevelDebug')}</option>
                        <option value="info">{t('admin.settings.logLevelInfo')}</option>
                        <option value="warn">{t('admin.settings.logLevelWarn')}</option>
                        <option value="error">{t('admin.settings.logLevelError')}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className={adminSettingsLabelClass}>{t('admin.settings.debugMode')}</label>
                      <label className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/40 border border-white/5 cursor-pointer group hover:border-white/10 transition-colors">
                        <input
                          type="checkbox"
                          className="mt-1 w-5 h-5 rounded-lg border-white/10 bg-transparent text-cyan-400 focus-visible:ring-cyan-400/20 transition-colors"
                          {...form.register('debug_mode')}
                        />
                        <div className="space-y-1">
                          <span className="block text-sm font-black text-white group-hover:text-cyan-400 transition-colors">
                            {t('admin.settings.debugModeEnable')}
                          </span>
                          <span className="block text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                            {t('admin.settings.debugModeDesc')}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="p-6 border-t border-white/10 flex items-center justify-between bg-white/2">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors"
            >
              {t('admin.categories.cancel')}
            </button>
            <button
              type="submit"
              form="settings-modal-form"
              disabled={saving}
              className={`${adminButtonPrimaryClass} flex items-center gap-2 group`}
            >
              {saving ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Save size={16} className="group-hover:-translate-y-px transition-transform" />
              )}
              {t('admin.settings.saveChanges')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default SettingsFormModal
