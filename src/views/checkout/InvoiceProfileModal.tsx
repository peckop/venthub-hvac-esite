'use client'

import React from 'react'
import { InvoiceProfile } from '../../lib/supabase'

interface InvoiceProfileModalProps {
    title: string
    profiles: InvoiceProfile[]
    onClose: () => void
    onPick: (p: InvoiceProfile) => void
    t: (key: string) => string
}

const InvoiceProfileModal: React.FC<InvoiceProfileModalProps> = ({
    title,
    profiles,
    onClose,
    onPick,
    t
}) => (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center">
        <div role="dialog" aria-modal="true" className="bg-white rounded-2xl shadow-2xl w-[92%] max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
                <div className="text-industrial-gray font-semibold">{title}</div>
                <button type="button" onClick={onClose} className="text-sm text-primary-navy hover:underline">{t('checkout.saved.close')}</button>
            </div>
            <div className="p-5 overflow-y-auto">
                {profiles.length === 0 ? (
                    <div className="text-sm text-steel-gray">—</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {profiles.map((p) => (
                            <div key={p.id} className="border rounded-lg p-3 bg-white hover:shadow-sm transition">
                                <div className="text-sm text-industrial-gray font-medium">
                                    {(p.title || (p.type === 'individual' ? t('account.invoices.individual') : t('account.invoices.corporate')))} {p.is_default && <span className="ml-1 text-xs text-primary-navy">({t('checkout.saved.default')})</span>}
                                </div>
                                <div className="text-xs text-steel-gray mt-1 whitespace-pre-line">
                                    {p.type === 'individual' ? (
                                        <div>TCKN: {p.tckn || '-'}</div>
                                    ) : (
                                        <div>
                                            <div>{t('account.invoices.companyLabel')}: {p.company_name || '-'}</div>
                                            <div>{t('account.invoices.vknLabel')}: {p.vkn || '-'}</div>
                                            <div>{t('account.invoices.taxOfficeLabel')}: {p.tax_office || '-'}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 flex justify-end">
                                    <button type="button" className="text-xs px-3 py-1.5 rounded-full border hover:bg-gray-50" onClick={() => onPick(p)}>
                                        {t('checkout.saved.use')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
)

export default InvoiceProfileModal
