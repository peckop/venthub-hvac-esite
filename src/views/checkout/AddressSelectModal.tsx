'use client'

import React from 'react'
import { UserAddress } from '../../lib/supabase'

interface AddressSelectModalProps {
    title: string
    addresses: UserAddress[]
    onClose: () => void
    onPick: (a: UserAddress) => void
    onEdit: (a: UserAddress) => void
    onDelete: (id: string) => void
    t: (key: string) => string
    onAddNew?: () => void
}

const AddressSelectModal: React.FC<AddressSelectModalProps> = ({
    title,
    addresses,
    onClose,
    onPick,
    onEdit,
    onDelete,
    t,
    onAddNew
}) => (
    <div className="fixed inset-0 z-dropdown bg-black/40 flex items-center justify-center">
        <div role="dialog" aria-modal="true" className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-2xl max-h-80vh overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
                <div className="text-industrial-gray font-semibold">{title}</div>
                <div className="flex items-center gap-3">
                    {onAddNew && (
                        <button type="button" onClick={onAddNew} className="text-xs text-primary-navy hover:underline font-semibold">
                            + {t('account.addresses.formTitleNew')}
                        </button>
                    )}
                    <button type="button" onClick={onClose} className="text-sm text-primary-navy hover:underline">{t('checkout.saved.close')}</button>
                </div>
            </div>
            <div className="p-5 overflow-y-auto">
                {addresses.length === 0 ? (
                    <div className="text-sm text-steel-gray">—</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {addresses.map((a) => (
                            <div key={a.id} className="border rounded-lg p-3 bg-white hover:shadow-sm transition">
                                <div className="text-sm text-industrial-gray font-medium">
                                    {a.label || t('checkout.saved.address')} {a.is_default_shipping && <span className="ml-1 text-xs text-primary-navy">({t('checkout.saved.default')})</span>}
                                </div>
                                <div className="text-xs text-steel-gray mt-1 whitespace-pre-line">{a.full_address}</div>
                                <div className="mt-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button type="button" className="text-xs text-primary-navy hover:underline" onClick={() => onEdit(a)}>
                                            {t('checkout.saved.edit')}
                                        </button>
                                        <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => onDelete(a.id)}>
                                            {t('checkout.saved.delete')}
                                        </button>
                                    </div>
                                    <button type="button" className="text-xs px-3 py-1.5 rounded-full border hover:bg-gray-50 font-medium" onClick={() => onPick(a)}>
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

export default AddressSelectModal
