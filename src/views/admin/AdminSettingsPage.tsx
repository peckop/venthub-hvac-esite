/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState } from 'react'
import { 
  Globe, 
  CreditCard, 
  ShieldCheck, 
  Activity, 
  Save, 
  Upload, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { useSettings } from '../../hooks/useSettings'

const AdminSettingsPage: React.FC = () => {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<'general' | 'payment' | 'admins' | 'system'>('general')
  const { settings, loading, updateSettings } = useSettings()
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Form States (Local copies for editing)
  const [formData, setFormData] = useState<any>(null)

  React.useEffect(() => {
    if (settings && !formData) {
      setFormData(settings)
    }
  }, [settings, formData])

  if (loading || !formData) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity size={24} className="text-cyan-400 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    if (!activeTab || saving) return
    
    setSaving(true)
    setSaveStatus(null)

    if (activeTab !== 'general' && activeTab !== 'payment') {
      setSaving(false)
      return
    }

    const key = activeTab
    const value = formData[key]

    const { success, error } = await updateSettings(key, value)

    if (success) {
      setSaveStatus({ type: 'success', message: t('admin.settings.saveSuccess') })
      setTimeout(() => setSaveStatus(null), 3000)
    } else {
      setSaveStatus({ type: 'error', message: error || t('admin.settings.saveError') })
    }
    setSaving(false)
  }

  const tabs = [
    { id: 'general', label: t('admin.settings.generalTab'), icon: Globe },
    { id: 'payment', label: t('admin.settings.paymentTab'), icon: CreditCard },
    { id: 'admins', label: t('admin.settings.adminsTab'), icon: ShieldCheck },
    { id: 'system', label: t('admin.settings.systemTab'), icon: Activity },
  ]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs tracking-[0.2em] uppercase mb-2">
            <span className="w-8 h-[2px] bg-cyan-400/30"></span>
            {t('admin.menu.groupSystem')}
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">
            {t('admin.titles.settings')}
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="group relative flex items-center justify-center gap-2 px-8 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-[#0A0F1E] rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(34,211,238,0.2)]"
          >
            {saving ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
            <span>{saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
          </button>
        </div>
      </div>

      {/* Success/Error Overlay */}
      {saveStatus && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${saveStatus.type === 'success' ? 'bg-emerald-400/10 border border-emerald-400/20 text-emerald-400' : 'bg-rose-400/10 border border-rose-400/20 text-rose-400'}`}>
          {saveStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold">{saveStatus.message}</span>
        </div>
      )}

      {/* Horizontal Premium Tabs */}
      <div className="overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center gap-2 p-1.5 glass-md rounded-2xl w-max min-w-full md:min-w-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-cyan-400 text-[#0A0F1E] shadow-lg shadow-cyan-400/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'general' && (
          <div className="glass rounded-3xl overflow-hidden border border-white/5">
            <div className="px-8 py-6 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
              <h3 className="text-lg font-bold text-white tracking-tight">{t('admin.settings.platformIdentity')}</h3>
              <p className="text-slate-500 text-xs mt-1 font-medium">{t('admin.settings.platformIdentityDesc')}</p>
            </div>
            
            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-12 items-start">
                <div className="relative group shrink-0">
                  <div className="w-44 h-44 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center transition-all group-hover:border-cyan-400/50 group-hover:bg-cyan-400/5 cursor-pointer overflow-hidden">
                    <Upload className="text-slate-600 group-hover:text-cyan-400 mb-2 transition-colors" size={32} />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('admin.settings.logo')}</span>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-cyan-400 p-2 rounded-xl shadow-lg shadow-cyan-400/30 text-[#0A0F1E]">
                    <Upload size={16} />
                  </div>
                </div>
                
                <div className="flex-1 w-full space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t('admin.settings.siteName')}</label>
                      <input 
                        type="text" 
                        className="w-full px-5 py-3.5 input-glass rounded-2xl text-sm font-medium" 
                        value={formData.general.site_name}
                        onChange={e => setFormData({ ...formData, general: { ...formData.general, site_name: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t('admin.settings.tagline')}</label>
                      <input 
                        type="text" 
                        className="w-full px-5 py-3.5 input-glass rounded-2xl text-sm font-medium" 
                        value={formData.general.tagline}
                        onChange={e => setFormData({ ...formData, general: { ...formData.general, tagline: e.target.value } })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t('admin.settings.contactEmail')}</label>
                      <input 
                        type="email" 
                        className="w-full px-5 py-3.5 input-glass rounded-2xl text-sm font-medium" 
                        value={formData.general.contact_email}
                        onChange={e => setFormData({ ...formData, general: { ...formData.general, contact_email: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t('admin.settings.supportPhone')}</label>
                      <input 
                        type="text" 
                        className="w-full px-5 py-3.5 input-glass rounded-2xl text-sm font-medium" 
                        value={formData.general.support_phone}
                        onChange={e => setFormData({ ...formData, general: { ...formData.general, support_phone: e.target.value } })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t('admin.settings.headquarters')}</label>
                    <textarea 
                      rows={3} 
                      className="w-full px-5 py-3.5 input-glass rounded-2xl text-sm font-medium resize-none" 
                      value={formData.general.headquarters}
                      onChange={e => setFormData({ ...formData, general: { ...formData.general, headquarters: e.target.value } })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="glass rounded-3xl overflow-hidden border border-white/5">
            <div className="px-8 py-6 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
              <h3 className="text-lg font-bold text-white tracking-tight">{t('admin.settings.paymentTitle')}</h3>
              <p className="text-slate-500 text-xs mt-1 font-medium">Ödeme ağ geçidi parametrelerini ve güvenlik ayarlarını yönetin.</p>
            </div>
            
            <div className="p-8 space-y-10">
              <div className="flex flex-col md:flex-row items-center justify-between p-7 bg-white/5 rounded-3xl border border-white/5 gap-6">
                <div>
                  <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"></div>
                    iyzico Entegrasyonu
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">Güvenli ödemeleri iyzico API'si üzerinden gerçekleştirin.</p>
                </div>
                <div className="flex p-1 bg-[#0A0F1E] border border-white/5 rounded-xl">
                  <button 
                    onClick={() => setFormData({ ...formData, payment: { ...formData.payment, iyzico_mode: 'sandbox' } })}
                    className={`px-5 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${formData.payment.iyzico_mode === 'sandbox' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    SANDBOX
                  </button>
                  <button 
                    onClick={() => setFormData({ ...formData, payment: { ...formData.payment, iyzico_mode: 'production' } })}
                    className={`px-5 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${formData.payment.iyzico_mode === 'production' ? 'bg-cyan-500 text-[#0A0F1E] shadow-lg shadow-cyan-400/20' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    PRODUCTION
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t('admin.settings.iyzicoApiKey')}</label>
                  <input 
                    type="password" 
                    className="w-full px-5 py-3.5 input-glass rounded-2xl text-sm font-medium tracking-wider" 
                    value={formData.payment.iyzico_api_key}
                    onChange={e => setFormData({ ...formData, payment: { ...formData.payment, iyzico_api_key: e.target.value } })}
                    placeholder="sk_test_..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t('admin.settings.iyzicoSecretKey')}</label>
                  <input 
                    type="password" 
                    className="w-full px-5 py-3.5 input-glass rounded-2xl text-sm font-medium tracking-wider" 
                    value={formData.payment.iyzico_secret_key}
                    onChange={e => setFormData({ ...formData, payment: { ...formData.payment, iyzico_secret_key: e.target.value } })}
                    placeholder="pk_test_..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admins' && <AdminsManagementSection />}
        {activeTab === 'system' && <SystemStatusSection />}
      </div>
    </div>
  )
}

const AdminsManagementSection: React.FC = () => {
  const { t } = useI18n()
  
  return (
    <div className="glass rounded-3xl overflow-hidden border border-white/5">
      <div className="px-8 py-6 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">{t('admin.settings.adminsTitle')}</h3>
          <p className="text-slate-500 text-xs mt-1 font-medium">{t('admin.settings.adminsDesc')}</p>
        </div>
        <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all text-white">
          {t('admin.settings.addAdmin')}
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kullanıcı</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rol</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Durum</th>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aktivite</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Alize Vent', email: 'alize@venthub.com', role: 'Super Admin', status: 'Aktif', activity: '2 dk önce' },
              { name: 'Sistem Yöneticisi', email: 'admin@venthub.com', role: 'Admin', status: 'Aktif', activity: '1 saat önce' }
            ].map((admin, idx) => (
              <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 font-bold text-xs uppercase">
                      {admin.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{admin.name}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{admin.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase ${admin.role === 'Super Admin' ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20' : 'bg-slate-800/50 text-slate-400'}`}>
                    {admin.role}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[11px] text-slate-300 font-bold">{admin.status}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[11px] text-slate-500 font-medium">{admin.activity}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const SystemStatusSection: React.FC = () => {
  const { t } = useI18n()
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: t('admin.settings.dbStatus'), value: 'Online', status: 'ok', icon: Activity, color: 'cyan' },
          { label: 'Payment API', value: 'Ready', status: 'ok', icon: CreditCard, color: 'emerald' },
          { label: 'Latency', value: '38ms', status: 'ok', icon: Globe, color: 'blue' }
        ].map((stat, idx) => (
          <div key={idx} className="glass p-6 rounded-3xl flex items-center gap-4 relative overflow-hidden group">
            <div className={`p-4 rounded-2xl bg-cyan-400/5 text-cyan-400 border border-cyan-400/10 group-hover:scale-110 transition-transform duration-500`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-white">{stat.value}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-cyan-400/5 blur-3xl rounded-full group-hover:bg-cyan-400/10 transition-all duration-500" />
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl overflow-hidden border border-white/5">
        <div className="px-8 py-6 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
          <h3 className="text-lg font-bold text-white tracking-tight">{t('admin.settings.systemLogs')}</h3>
          <p className="text-slate-500 text-xs mt-1 font-medium">Son kritik sistem olayları ve yapılandırma değişiklikleri.</p>
        </div>
        <div className="p-8">
          <div className="space-y-8">
            {[
              { event: 'Site Ayarı Güncellendi', details: 'Genel yapılandırma admin@venthub.com tarafından optimize edildi', time: '10:45' },
              { event: 'İşlem Modu Devreye Alındı', details: 'iyzico_mode -> production geçişi onaylandı', time: 'Dün 16:20' },
              { event: 'Güvenlik Protokolü', details: 'support@venthub.com için yetkilendirme sağlandı', time: '2 gün önce' }
            ].map((log, idx) => (
              <div key={idx} className="flex gap-6 group">
                <div className="w-16 text-[10px] font-bold text-slate-500 pt-1.5 text-right uppercase tracking-wider shrink-0">{log.time}</div>
                <div className="relative flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#0A0F1E] border-2 border-cyan-400/40 z-10 group-hover:border-cyan-400 transition-colors"></div>
                  {idx !== 2 && <div className="w-[1px] h-full bg-white/5 absolute top-3"></div>}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{log.event}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettingsPage
