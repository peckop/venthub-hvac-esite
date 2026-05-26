import React from 'react'
import Link from 'next/link'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { Routes } from '../../utils/routes';


const AccessDenied: React.FC = () => {
    const { t } = useI18n()

    return (
        <div className="min-h-screen bg-surface-deep flex flex-col items-center justify-center p-6">
            <div className="glass-strong rounded-hvac-2xl border border-white/5 p-12 max-w-lg w-full text-center shadow-[0_0_50px_rgba(0,0,0,0.4)] animate-in fade-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-rose-500/10 rounded-3xl border border-rose-500/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(244,63,94,0.1)]">
                    <ShieldAlert className="w-12 h-12 text-rose-500" />
                </div>

                <h1 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">
                    Erişim Engellendi
                </h1>

                <p className="text-slate-400 mb-10 leading-relaxed font-medium">
                    Bu protokolü izlemek için gerekli güvenlik yetkilerine sahip değilsiniz. <br/>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-4 block italic">Lütfen sistem yöneticinizle iletişime geçin.</span>
                </p>

                <div className="flex flex-col gap-4">
                    <Link
                        href={Routes.admin.dashboard()}
                        className="inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold transition-colors border border-white/5 group"
                    >
                        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                        {t('admin.ui.backToDashboard') || 'Ana Panele Dön'}
                    </Link>
                    
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-[0.3em] mt-2">
                        VentHub Security Protocol 7.1
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AccessDenied
