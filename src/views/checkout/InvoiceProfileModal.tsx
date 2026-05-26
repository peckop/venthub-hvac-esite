'use client'

import React from 'react'
import { InvoiceProfile } from '../../lib/supabase'
import { X, User, Building2, Landmark, CheckCircle } from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'

interface InvoiceProfileModalProps {
    open: boolean
    onClose: () => void
    profiles: InvoiceProfile[]
    onSelect: (p: InvoiceProfile) => void
}

export const InvoiceProfileModal: React.FC<InvoiceProfileModalProps> = ({ open, onClose, profiles, onSelect }) => {
    const { t } = useI18n()
    if (!open) return null

    return (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
                onClick={onClose}
                onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
                role="presentation"
            />
            
            <div 
                role="dialog"
                aria-modal="true"
                className="relative w-full max-w-xl bg-white rounded-hvac-xl shadow-2xl overflow-hidden flex flex-col max-h-80vh"
            >
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                        <Landmark size={20} className="text-primary-navy" />
                        Kayıtlı Fatura Profilleri
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {profiles.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => onSelect(p)}
                            className="w-full text-left group bg-white border border-slate-200 hover:border-primary-navy/40 hover:shadow-md rounded-2xl p-5 transition-shadow relative overflow-hidden"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 flex items-center justify-center rounded-xl shrink-0 ${p.profile_type === 'individual' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {p.profile_type === 'individual' ? <User size={20} /> : <Building2 size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-bold text-slate-900 truncate">
                                            {p.profile_type === 'individual' ? `${p.first_name} ${p.last_name}` : p.company_name}
                                        </h4>
                                        {p.is_default && (
                                            <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                <CheckCircle size={8} /> Varsayılan
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                        {p.tax_office} / {p.tax_number}
                                    </div>
                                    <div className="text-xs text-slate-400 line-clamp-1">
                                        {p.address_line} {p.district}/{p.city}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}

                    {profiles.length === 0 && (
                        <div className="py-12 text-center text-slate-400 italic">{t('checkout.invoice.noProfile')}</div>
                    )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-white border border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    )
}

