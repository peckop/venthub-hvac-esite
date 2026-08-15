import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import { Loader2, Save, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import type { FieldErrors } from 'react-hook-form'
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
import { useConfirm } from '../overlay/ConfirmProvider'

export type SettingsSection = 'general' | 'payment' | 'admins' | 'system'

// --- Schemas per section ---
// Kurallar AYNI; yalnız mesajlar sözlükten (i18n fabrikası). Mesaj artık alanın
// ALTINDA gösterildiği için sabit Türkçe metin EN oturumda görünür kusur olurdu.
const buildGeneralSchema = (v: (key: string) => string) =>
  z.object({
    site_name: z.string().min(1, v('siteNameRequired')),
    tagline: z.string().min(1, v('taglineRequired')),
    contact_email: z.string().email(v('emailInvalid')).min(1, v('emailRequired')),
    support_phone: z.string().min(1, v('supportPhoneRequired')),
    headquarters: z.string().min(1, v('headquartersRequired')),
    logo_url: z.string().url(v('logoUrlInvalid')).or(z.string().length(0)).nullable().optional(),
  })

const buildPaymentSchema = (v: (key: string) => string) =>
  z.object({
    iyzico_enabled: z.boolean(),
    iyzico_mode: z.enum(['sandbox', 'production']),
    iyzico_api_key: z.string().min(1, v('apiKeyRequired')),
  })

const buildAdminsSchema = (v: (key: string) => string) =>
  z.object({
    admin_sessions_timeout: z.string().min(1, v('sessionTimeoutRequired')),
    mfa_required: z.boolean(),
  })

const buildSystemSchema = () =>
  z.object({
    system_log_level: z.enum(['debug', 'info', 'warn', 'error']),
    debug_mode: z.boolean(),
  })

/* ---------------------------------------------------------------------------
 * ALAN SEVİYESİ HATA GERİ BİLDİRİMİ (cetvel `docs/standards/admin-design-standard.md` §4.6)
 *
 * Hata, oluştuğu girdinin YANINDA durur — toast kaybolur, bu satır kalmaz.
 * `aria-invalid` + `aria-describedby` bağı, ekran okuyucu kullanıcısının bozuk
 * alana odaklandığında hatayı DUYMASINI sağlar; toast bu bağı KURAMAZ.
 * Renk tek başına taşıyıcı değildir (WCAG 1.4.1): asıl sinyal mesajın METNİ.
 * ------------------------------------------------------------------------- */

/** Girdinin hemen altındaki hata satırı. Hata yoksa DOM'a hiçbir şey basmaz. */
const FieldError: React.FC<{ id: string; message?: string }> = ({ id, message }) =>
  message ? (
    <p id={id} role="alert" className="mt-1 text-xs font-bold uppercase tracking-tighter text-admin-danger">
      {message}
    </p>
  ) : null

/**
 * Submit'te odak taşınacak alanların DOM sırası. Bölümler AYRI AYRI render
 * edildiği için tek liste yeter: aynı anda yalnız birinin girdileri DOM'dadır.
 */
const FIELD_FOCUS_ORDER: { name: string; id: string }[] = [
  { name: 'site_name', id: 'settings-site-name' },
  { name: 'tagline', id: 'settings-tagline' },
  { name: 'contact_email', id: 'settings-contact-email' },
  { name: 'support_phone', id: 'settings-support-phone' },
  { name: 'headquarters', id: 'settings-headquarters' },
  { name: 'logo_url', id: 'settings-logo-url' },
  { name: 'iyzico_api_key', id: 'settings-iyzico-api-key' },
  { name: 'admin_sessions_timeout', id: 'settings-admin-sessions-timeout' },
]

/** İlk bozuk alana odak (`shouldFocusError:false` — sıra DETERMİNİSTİK olsun diye). */
function focusFirstInvalid(errs: FieldErrors<Record<string, unknown>>): void {
  const first = FIELD_FOCUS_ORDER.find(({ name }) => errs[name])
  if (!first) return
  document.getElementById(first.id)?.focus()
}

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
  const confirm = useConfirm()
  const { canWrite } = useRole()
  const hasWriteAccess = canWrite('settings')
  const [saving, setSaving] = useState(false)

  // Determine active schema dynamically
  const schema = React.useMemo(() => {
    const v = (key: string) => t(`admin.settings.validation.${key}`)
    if (!section) return buildGeneralSchema(v)
    switch (section) {
      case 'general':
        return buildGeneralSchema(v)
      case 'payment':
        return buildPaymentSchema(v)
      case 'admins':
        return buildAdminsSchema(v)
      case 'system':
        return buildSystemSchema()
    }
  }, [section, t])

  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    // Odak sırasını biz yönetiyoruz (bkz. focusFirstInvalid).
    shouldFocusError: false,
    defaultValues: initialValues || {},
  })

  /** Hata mesajını string olarak çeker (RHF mesajı `unknown` olabilir — `any` YOK). */
  const fieldError = (name: string): string | undefined => {
    const message = form.formState.errors[name]?.message
    return typeof message === 'string' ? message : undefined
  }

  // Load values when modal opens or section changes
  useEffect(() => {
    if (open && initialValues) {
      form.reset(initialValues)
    }
  }, [open, initialValues, form])

  /**
   * Kirli-form guard'i — window.confirm yerine ConfirmDialog (cetvel §4.7).
   * Kapatma AKISI DEGISTI: eskiden confirm senkron blokluyordu; artik kapatma
   * ISTEGI once yakalanir, onay beklenir, ancak onaylanirsa gercekten kapatilir.
   * Degisiklikleri atmak GERI ALINAMAZ -> tone:'danger'.
   * Ayrica `t('x') || 'fallback'` kalibi KALDIRILDI (cetvel §6.5 yasakliyor).
   */
  const handleClose = async () => {
    if (!form.formState.isDirty) {
      onOpenChange(false)
      return
    }
    const ok = await confirm({
      description: t('admin.categories.unsavedChangesConfirm'),
      confirmLabel: t('admin.confirm.discardChanges'),
      tone: 'danger',
    })
    if (ok) onOpenChange(false)
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
        <Dialog.Content
          // Radix `aria-modal` BASMIYOR (dist dogrulandi) -> elle veriliyor (cetvel §4.8).
          aria-modal="true" className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-surface-deep border border-white/10 rounded-2xl shadow-2xl z-modal flex flex-col overflow-hidden max-h-admin-modal">
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
            <form id="settings-modal-form" onSubmit={form.handleSubmit(onSubmit, focusFirstInvalid)} className="space-y-6">
              {section === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="settings-site-name" className={adminSettingsLabelClass}>{t('admin.settings.siteName')}</label>
                      <input
                        id="settings-site-name"
                        type="text"
                        className={`${adminInputClass}${fieldError('site_name') ? ' !border-admin-danger' : ''}`}
                        {...form.register('site_name')}
                        aria-invalid={fieldError('site_name') ? true : undefined}
                        aria-describedby={fieldError('site_name') ? 'settings-site-name-error' : undefined}
                        placeholder={t('admin.settings.siteNamePlaceholder')}
                      />
                      <FieldError id="settings-site-name-error" message={fieldError('site_name')} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="settings-tagline" className={adminSettingsLabelClass}>{t('admin.settings.tagline')}</label>
                      <input
                        id="settings-tagline"
                        type="text"
                        className={`${adminInputClass}${fieldError('tagline') ? ' !border-admin-danger' : ''}`}
                        {...form.register('tagline')}
                        aria-invalid={fieldError('tagline') ? true : undefined}
                        aria-describedby={fieldError('tagline') ? 'settings-tagline-error' : undefined}
                        placeholder={t('admin.settings.taglinePlaceholder')}
                      />
                      <FieldError id="settings-tagline-error" message={fieldError('tagline')} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="settings-contact-email" className={adminSettingsLabelClass}>{t('admin.settings.contactEmail')}</label>
                      <input
                        id="settings-contact-email"
                        type="email"
                        className={`${adminInputClass}${fieldError('contact_email') ? ' !border-admin-danger' : ''}`}
                        {...form.register('contact_email')}
                        aria-invalid={fieldError('contact_email') ? true : undefined}
                        aria-describedby={fieldError('contact_email') ? 'settings-contact-email-error' : undefined}
                        placeholder={t('admin.settings.contactEmailPlaceholder')}
                      />
                      <FieldError id="settings-contact-email-error" message={fieldError('contact_email')} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="settings-support-phone" className={adminSettingsLabelClass}>{t('admin.settings.supportPhone')}</label>
                      <input
                        id="settings-support-phone"
                        type="text"
                        className={`${adminInputClass}${fieldError('support_phone') ? ' !border-admin-danger' : ''}`}
                        {...form.register('support_phone')}
                        aria-invalid={fieldError('support_phone') ? true : undefined}
                        aria-describedby={fieldError('support_phone') ? 'settings-support-phone-error' : undefined}
                        placeholder={t('admin.settings.supportPhonePlaceholder')}
                      />
                      <FieldError id="settings-support-phone-error" message={fieldError('support_phone')} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="settings-headquarters" className={adminSettingsLabelClass}>{t('admin.settings.headquarters')}</label>
                    <input
                      id="settings-headquarters"
                      type="text"
                      className={`${adminInputClass}${fieldError('headquarters') ? ' !border-admin-danger' : ''}`}
                      {...form.register('headquarters')}
                      aria-invalid={fieldError('headquarters') ? true : undefined}
                      aria-describedby={fieldError('headquarters') ? 'settings-headquarters-error' : undefined}
                      placeholder={t('admin.settings.headquartersPlaceholder')}
                    />
                    <FieldError id="settings-headquarters-error" message={fieldError('headquarters')} />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="settings-logo-url" className={adminSettingsLabelClass}>{t('admin.settings.logoUrl')}</label>
                    <input
                      id="settings-logo-url"
                      type="text"
                      className={`${adminInputClass}${fieldError('logo_url') ? ' !border-admin-danger' : ''}`}
                      {...form.register('logo_url')}
                      aria-invalid={fieldError('logo_url') ? true : undefined}
                      aria-describedby={fieldError('logo_url') ? 'settings-logo-url-error' : undefined}
                      placeholder={t('admin.settings.logoUrlPlaceholder')}
                    />
                    <FieldError id="settings-logo-url-error" message={fieldError('logo_url')} />
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
                      <label htmlFor="settings-iyzico-api-key" className={adminSettingsLabelClass}>{t('admin.settings.iyzicoApiKey')}</label>
                      <input
                        id="settings-iyzico-api-key"
                        type="text"
                        className={`${adminInputClass}${fieldError('iyzico_api_key') ? ' !border-admin-danger' : ''}`}
                        {...form.register('iyzico_api_key')}
                        aria-invalid={fieldError('iyzico_api_key') ? true : undefined}
                        aria-describedby={fieldError('iyzico_api_key') ? 'settings-iyzico-api-key-error' : undefined}
                        placeholder={t('admin.settings.iyzicoApiKeyPlaceholder')}
                      />
                      <FieldError id="settings-iyzico-api-key-error" message={fieldError('iyzico_api_key')} />
                    </div>
                  </div>
                </div>
              )}

              {section === 'admins' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="settings-admin-sessions-timeout" className={adminSettingsLabelClass}>{t('admin.settings.adminSessionTimeout')}</label>
                      <input
                        id="settings-admin-sessions-timeout"
                        type="number"
                        className={`${adminInputClass}${fieldError('admin_sessions_timeout') ? ' !border-admin-danger' : ''}`}
                        {...form.register('admin_sessions_timeout')}
                        aria-invalid={fieldError('admin_sessions_timeout') ? true : undefined}
                        aria-describedby={
                          fieldError('admin_sessions_timeout') ? 'settings-admin-sessions-timeout-error' : undefined
                        }
                        min="1"
                        max="168"
                      />
                      <FieldError
                        id="settings-admin-sessions-timeout-error"
                        message={fieldError('admin_sessions_timeout')}
                      />
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
