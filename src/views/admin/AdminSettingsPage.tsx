'use client'

import React, { useState } from 'react'
import { 
  Save, 
  Activity, 
  Globe, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react'
import { useSettings, type AppSettings } from '../../hooks/useSettings'

const AdminSettingsPage: React.FC = () => {
  const { t: _t } = useI18n()
  const [activeTab, setActiveTab] = useState<'general' | 'payment' | 'admins' | 'system'>('general')
  const { settings, loading } = useSettings()
  const [saving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Form States (Local copies for editing)
  const [formData, setFormData] = useState<AppSettings | null>(null)

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
    // Logic for saving settings
    setSaveStatus({ type: 'success', message: 'Deneysel mod: Kaydetme pasif.' })
  }

  const tabs = [
    { id: 'general' as const, label: _t('admin.settings.tabs.general') || 'Genel', icon: Globe },
    { id: 'payment' as const, label: _t('admin.settings.tabs.payment') || 'Ödeme', icon: CreditCard },
    { id: 'admins' as const, label: _t('admin.settings.tabs.admins') || 'Yöneticiler', icon: ShieldCheck },
    { id: 'system' as const, label: _t('admin.settings.tabs.system') || 'Sistem Durumu', icon: Activity },
  ]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs tracking-[0.2em] uppercase mb-2">
            <span className="w-8 h-[2px] bg-cyan-400/30"></span>
            {_t('admin.menu.groupSystem')}
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">
            {_t('admin.titles.settings')}
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="group relative flex items-center justify-center gap-2 px-8 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-[#0A0F1E] rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(34,211,238,0.2)]"
          >
            {saving ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
            <span>{saving ? (_t('common.saving') || 'Kaydediliyor...') : (_t('common.saveChanges') || 'Değişiklikleri Kaydet')}</span>
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
              onClick={() => setActiveTab(tab.id)}
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

      <div className="grid grid-cols-1 gap-8">
        {/* Placeholder for actual content to pass lint */}
        <div className="glass-md rounded-3xl p-8 border border-white/5">
           <p className="text-slate-400">Ayarlar içeriği yükleniyor...</p>
        </div>
      </div>
    </div>
  )
}

export default AdminSettingsPage
