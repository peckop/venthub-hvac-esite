'use client'

import { Activity, CreditCard, Globe, Save, ShieldCheck } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

import AdminSkeleton from '../../components/admin/AdminSkeleton'
import { useRole } from '../../hooks/useRole'
import { useSettings } from '../../hooks/useSettings'
import { useI18n } from '../../i18n/I18nProvider'
import { AdminPermissionError, mutateWithAudit } from '../../lib/admin/mutateWithAudit'
import { supabaseBrowserClient as supabase } from '../../lib/supabase/client'
import {
  adminButtonPrimaryClass,
  adminCardClass,
  adminInputClass,
  adminSectionTitleClass,
  adminSettingsLabelClass,
  adminSubtitleClass,
} from '../../utils/adminUi'

const AdminSettingsPage: React.FC = () => {
  const { t } = useI18n()
  const { role, canWrite } = useRole()
  const hasWriteAccess = canWrite('settings')
  const { settings, loading, error: fetchError } = useSettings()

  const [activeTab, setActiveTab] = useState<'general' | 'payment' | 'admins' | 'system'>('general')
  const [saving, setSaving] = useState(false)

  // Local Form States
  const [siteName, setSiteName] = useState('')
  const [tagline, setTagline] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [supportPhone, setSupportPhone] = useState('')
  const [headquarters, setHeadquarters] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  const [iyzicoEnabled, setIyzicoEnabled] = useState(false)
  const [iyzicoMode, setIyzicoMode] = useState('sandbox')
  const [iyzicoApiKey, setIyzicoApiKey] = useState('')

  // Skeleton / Iskelet form states (Admins & System)
  const [adminSessionsTimeout, setAdminSessionsTimeout] = useState('24')
  const [mfaRequired, setMfaRequired] = useState(false)
  const [systemLogLevel, setSystemLogLevel] = useState('info')
  const [debugMode, setDebugMode] = useState(false)

  useEffect(() => {
    if (settings) {
      setSiteName(settings.general.site_name)
      setTagline(settings.general.tagline)
      setContactEmail(settings.general.contact_email)
      setSupportPhone(settings.general.support_phone)
      setHeadquarters(settings.general.headquarters)
      setLogoUrl(settings.general.logo_url || '')

      setIyzicoEnabled(settings.payment.iyzico_enabled)
      setIyzicoMode(settings.payment.iyzico_mode)
      setIyzicoApiKey(settings.payment.iyzico_api_key)
    }
  }, [settings])

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

  const handleSave = async (tab: 'general' | 'payment' | 'admins' | 'system') => {
    try {
      setSaving(true)

      const { data: authData } = await supabase.auth.getUser()
      const userId = authData.user?.id || null

      if (tab === 'general') {
        const payload = {
          site_name: siteName,
          tagline: tagline,
          contact_email: contactEmail,
          support_phone: supportPhone,
          headquarters: headquarters,
          logo_url: logoUrl || null,
        }

        await mutateWithAudit(supabase, {
          resource: 'settings',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: 'general',
          before: settings ? settings.general : null,
          after: payload,
          fn: async () => {
            const { error } = await supabase
              .from('site_settings')
              .upsert({
                key: 'general',
                value: payload,
                updated_by: userId,
                updated_at: new Date().toISOString(),
              })
            if (error) throw error
          },
        })
        toast.success(t('admin.inventory.settings.saveSuccess') || 'Ayarlar başarıyla kaydedildi.')
      } else if (tab === 'payment') {
        const payload = {
          iyzico_enabled: iyzicoEnabled,
          iyzico_mode: iyzicoMode,
          iyzico_api_key: iyzicoApiKey,
        }

        await mutateWithAudit(supabase, {
          resource: 'settings',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: 'payment',
          before: settings ? settings.payment : null,
          after: payload,
          fn: async () => {
            const { error } = await supabase
              .from('site_settings')
              .upsert({
                key: 'payment',
                value: payload,
                updated_by: userId,
                updated_at: new Date().toISOString(),
              })
            if (error) throw error
          },
        })
        toast.success(t('admin.inventory.settings.saveSuccess') || 'Ödeme ayarları başarıyla kaydedildi.')
      } else if (tab === 'admins') {
        const payload = {
          admin_sessions_timeout: adminSessionsTimeout,
          mfa_required: mfaRequired,
        }
        await mutateWithAudit(supabase, {
          resource: 'settings',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: 'admins',
          before: null,
          after: payload,
          fn: async () => {
            // Skeleton save, actual database save can be wired when table rows are ready
            return Promise.resolve()
          },
        })
        toast.success(t('admin.inventory.settings.saveSuccess') || 'Yönetici politikaları başarıyla kaydedildi.')
      } else if (tab === 'system') {
        const payload = {
          system_log_level: systemLogLevel,
          debug_mode: debugMode,
        }
        await mutateWithAudit(supabase, {
          resource: 'settings',
          canWrite: hasWriteAccess,
          action: 'UPDATE',
          rowPk: 'system',
          before: null,
          after: payload,
          fn: async () => {
            // Skeleton save
            return Promise.resolve()
          },
        })
        toast.success(t('admin.inventory.settings.saveSuccess') || 'Sistem yapılandırması başarıyla kaydedildi.')
      }
    } catch (e: unknown) {
      console.error('Save settings error:', e)
      const msg =
        e instanceof AdminPermissionError
          ? t('admin.inventory.settings.noPermission') || 'Bu işlemi gerçekleştirmek için yetkiniz yok.'
          : e instanceof Error
          ? e.message
          : 'Ayarlar kaydedilirken hata oluştu.'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'general' as const, label: t('admin.common.tabGeneral') || 'Genel', icon: Globe },
    { id: 'payment' as const, label: t('admin.common.tabPayment') || 'Ödemeler', icon: CreditCard },
    { id: 'admins' as const, label: t('admin.common.tabAdmins') || 'Yöneticiler', icon: ShieldCheck },
    { id: 'system' as const, label: t('admin.common.tabSystemStatus') || 'Sistem Durumu', icon: Activity },
  ]

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <header className="space-y-1">
          <h1 className={adminSectionTitleClass}>{t('admin.titles.settings')}</h1>
          <p className={adminSubtitleClass}>{t('admin.menu.groupSystem')}</p>
        </header>
      </div>

      {/* Horizontal Tabs */}
      <div className="overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-white/5 rounded-2xl w-max min-w-full md:min-w-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {fetchError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold">
          {fetchError}
        </div>
      )}

      {/* Settings Sections */}
      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'general' && (
          <div className={`${adminCardClass} p-8 lg:p-10 space-y-8 relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-cyan-500/10" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Globe className="text-cyan-400" size={20} />
                <h2 className="text-lg font-black text-white uppercase tracking-tight">
                  {t('admin.common.tabGeneral') || 'Genel Ayarlar'}
                </h2>
              </div>

              {/* Form Layout: Two-column layout matching Polaris Settings / AdminInventorySettingsPage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={adminSettingsLabelClass}>Site Adı</label>
                    <input
                      type="text"
                      className={adminInputClass}
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="VentHub HVAC"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={adminSettingsLabelClass}>Slogan / Tagline</label>
                    <input
                      type="text"
                      className={adminInputClass}
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="Premium HVAC Solutions"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={adminSettingsLabelClass}>Logo URL</label>
                    <input
                      type="text"
                      className={adminInputClass}
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={adminSettingsLabelClass}>İletişim E-postası</label>
                    <input
                      type="email"
                      className={adminInputClass}
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="info@venthub.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={adminSettingsLabelClass}>Destek Telefonu</label>
                    <input
                      type="text"
                      className={adminInputClass}
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      placeholder="+90 212 555 0100"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={adminSettingsLabelClass}>Genel Merkez / Adres</label>
                    <input
                      type="text"
                      className={adminInputClass}
                      value={headquarters}
                      onChange={(e) => setHeadquarters(e.target.value)}
                      placeholder="Istanbul, Turkey"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => handleSave('general')}
                  disabled={saving || !hasWriteAccess}
                  className={`${adminButtonPrimaryClass} px-8 py-3 bg-cyan-400 text-slate-950 hover:bg-cyan-300 flex items-center gap-2`}
                >
                  <Save size={16} />
                  <span>{saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className={`${adminCardClass} p-8 lg:p-10 space-y-8 relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-cyan-500/10" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <CreditCard className="text-cyan-400" size={20} />
                <h2 className="text-lg font-black text-white uppercase tracking-tight">
                  {t('admin.common.tabPayment') || 'Ödeme Ayarları'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={adminSettingsLabelClass}>Iyzico Aktif</label>
                    <label className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/40 border border-white/5 cursor-pointer group hover:border-white/10 transition-colors">
                      <input
                        type="checkbox"
                        className="mt-1 w-5 h-5 rounded-lg border-white/10 bg-transparent text-cyan-400 focus-visible:ring-cyan-400/20 transition-colors"
                        checked={iyzicoEnabled}
                        onChange={(e) => setIyzicoEnabled(e.target.checked)}
                      />
                      <div className="space-y-1">
                        <span className="block text-sm font-black text-white group-hover:text-cyan-400 transition-colors">
                          Iyzico Gateway Etkinleştir
                        </span>
                        <span className="block text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                          Müşterilerin Iyzico ile ödeme yapabilmesini sağlar.
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className={adminSettingsLabelClass}>Iyzico Çalışma Modu</label>
                    <select
                      className={`${adminInputClass} !bg-slate-950 !border-white/5`}
                      value={iyzicoMode}
                      onChange={(e) => setIyzicoMode(e.target.value)}
                    >
                      <option value="sandbox">Sandbox (Test)</option>
                      <option value="production">Production (Canlı)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={adminSettingsLabelClass}>Iyzico API Key (Public)</label>
                    <input
                      type="text"
                      className={adminInputClass}
                      value={iyzicoApiKey}
                      onChange={(e) => setIyzicoApiKey(e.target.value)}
                      placeholder="sandbox-api-key"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5">
                    <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-widest">
                      🔒 Güvenlik Uyarısı
                    </p>
                    <p className="text-xs font-medium text-slate-400 mt-2 leading-relaxed">
                      İstemci tarafı güvenliğini korumak amacıyla Iyzico Secret Key bu panel üzerinden düzenlenemez
                      veya görüntülenemez. Gizli anahtarlarınızı Edge fonksiyonu çevre değişkenlerinde (env) güvenle saklamaya devam edin.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => handleSave('payment')}
                  disabled={saving || !hasWriteAccess}
                  className={`${adminButtonPrimaryClass} px-8 py-3 bg-cyan-400 text-slate-950 hover:bg-cyan-300 flex items-center gap-2`}
                >
                  <Save size={16} />
                  <span>{saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className={`${adminCardClass} p-8 lg:p-10 space-y-8 relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-cyan-500/10" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <ShieldCheck className="text-cyan-400" size={20} />
                <h2 className="text-lg font-black text-white uppercase tracking-tight">
                  {t('admin.common.tabAdmins') || 'Yönetici Politikaları'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={adminSettingsLabelClass}>Yönetici Oturum Zaman Aşımı (Saat)</label>
                    <input
                      type="number"
                      className={adminInputClass}
                      value={adminSessionsTimeout}
                      onChange={(e) => setAdminSessionsTimeout(e.target.value)}
                      min="1"
                      max="168"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={adminSettingsLabelClass}>Zorunlu Çok Aşamalı Doğrulama (MFA)</label>
                    <label className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/40 border border-white/5 cursor-pointer group hover:border-white/10 transition-colors">
                      <input
                        type="checkbox"
                        className="mt-1 w-5 h-5 rounded-lg border-white/10 bg-transparent text-cyan-400 focus-visible:ring-cyan-400/20 transition-colors"
                        checked={mfaRequired}
                        onChange={(e) => setMfaRequired(e.target.checked)}
                      />
                      <div className="space-y-1">
                        <span className="block text-sm font-black text-white group-hover:text-cyan-400 transition-colors">
                          MFA'i Tüm Yöneticilere Zorunlu Kıl
                        </span>
                        <span className="block text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                          Admin panel erişimi için MFA kurulumunu mecbur kılar.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => handleSave('admins')}
                  disabled={saving || !hasWriteAccess}
                  className={`${adminButtonPrimaryClass} px-8 py-3 bg-cyan-400 text-slate-950 hover:bg-cyan-300 flex items-center gap-2`}
                >
                  <Save size={16} />
                  <span>{saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className={`${adminCardClass} p-8 lg:p-10 space-y-8 relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-cyan-500/10" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Activity className="text-cyan-400" size={20} />
                <h2 className="text-lg font-black text-white uppercase tracking-tight">
                  {t('admin.common.tabSystemStatus') || 'Sistem Yapılandırması'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={adminSettingsLabelClass}>Sistem Günlük Seviyesi (Log Level)</label>
                    <select
                      className={`${adminInputClass} !bg-slate-950 !border-white/5`}
                      value={systemLogLevel}
                      onChange={(e) => setSystemLogLevel(e.target.value)}
                    >
                      <option value="debug">Hata Ayıklama (Debug)</option>
                      <option value="info">Bilgi (Info)</option>
                      <option value="warn">Uyarı (Warning)</option>
                      <option value="error">Hata (Error)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={adminSettingsLabelClass}>Geliştirici Hata Ayıklama Modu (Debug Mode)</label>
                    <label className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/40 border border-white/5 cursor-pointer group hover:border-white/10 transition-colors">
                      <input
                        type="checkbox"
                        className="mt-1 w-5 h-5 rounded-lg border-white/10 bg-transparent text-cyan-400 focus-visible:ring-cyan-400/20 transition-colors"
                        checked={debugMode}
                        onChange={(e) => setDebugMode(e.target.checked)}
                      />
                      <div className="space-y-1">
                        <span className="block text-sm font-black text-white group-hover:text-cyan-400 transition-colors">
                          Debug Modunu Etkinleştir
                        </span>
                        <span className="block text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                          İstemci tarafında detaylı log çıktısı verilmesini sağlar.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => handleSave('system')}
                  disabled={saving || !hasWriteAccess}
                  className={`${adminButtonPrimaryClass} px-8 py-3 bg-cyan-400 text-slate-950 hover:bg-cyan-300 flex items-center gap-2`}
                >
                  <Save size={16} />
                  <span>{saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminSettingsPage
