'use client'

import React, { useState } from 'react'
import type { UserAddress } from '@/types/ui-models'
import { createAddress, updateAddress } from '../../lib/services/address.service'
import { supabaseBrowserClient } from '../../lib/supabase/client'
import { toast } from 'sonner'
import type { DbUserAddressInsert } from '../../types/db-rows'

interface AddressFormModalProps {
    address: UserAddress | null
    onClose: () => void
    onSaved: () => void
    t: (key: string) => string
}

const AddressFormModal: React.FC<AddressFormModalProps> = ({
    address,
    onClose,
    onSaved,
    t
}) => {
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        label: address?.label || '',
        full_name: address?.full_name || '',
        phone: address?.phone || '',
        address_line: address?.address_line || '',
        city: address?.city || '',
        district: address?.district || '',
        postal_code: address?.postal_code || '',
        is_default_shipping: address?.is_default_shipping || false,
        is_default_billing: address?.is_default_billing || false,
    })

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            setSaving(true)
            if (address) {
                await updateAddress(supabaseBrowserClient, address.id, {
                    label: form.label,
                    full_name: form.full_name,
                    phone: form.phone,
                    address_line: form.address_line,
                    city: form.city,
                    district: form.district,
                    postal_code: form.postal_code,
                    is_default_shipping: form.is_default_shipping,
                    is_default_billing: form.is_default_billing,
                })
                toast.success(t('checkout.saved.updated'))
            } else {
                const newAddressPayload: DbUserAddressInsert = {
                    user_id: '', // Will be overridden by the service
                    address_type: form.is_default_shipping ? 'shipping' : 'billing',
                    label: form.label,
                    full_name: form.full_name,
                    phone: form.phone,
                    address_line: form.address_line,
                    city: form.city,
                    district: form.district,
                    postal_code: form.postal_code,
                    is_default_shipping: form.is_default_shipping,
                    is_default_billing: form.is_default_billing,
                }
                await createAddress(supabaseBrowserClient, newAddressPayload)
                toast.success(t('account.addresses.toasts.created') || 'Address created')
            }
            onSaved()
            onClose()
        } catch (e) {
            console.error(e)
            toast.error(address ? t('checkout.saved.updateError') : (t('account.addresses.toasts.saveError') || 'Error while saving'))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-sticky bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-lg overflow-hidden">
                <div className="px-5 py-4 border-b flex items-center justify-between">
                    <div className="text-industrial-gray font-semibold">
                        {address ? t('account.addresses.formTitleEdit') : t('account.addresses.formTitleNew')}
                    </div>
                    <button type="button" onClick={onClose} className="text-sm text-steel-gray hover:text-primary-navy">{t('checkout.saved.cancel')}</button>
                </div>
                <form onSubmit={handleSave} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-steel-gray mb-1">{t('checkout.saved.address')}</label>
                        <input type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Ev, İş vb." />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-steel-gray mb-1">{t('checkout.shipping.addressLabel')}</label>
                        <textarea required value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm min-h-20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-steel-gray mb-1">{t('checkout.shipping.cityLabel')}</label>
                            <input required type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-steel-gray mb-1">{t('checkout.shipping.districtLabel')}</label>
                            <input required type="text" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-steel-gray mb-1">{t('checkout.shipping.postalLabel')}</label>
                        <input required type="text" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value.replace(/\D/g, '') })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                        <label className="flex items-center gap-2 text-xs">
                            <input type="checkbox" checked={form.is_default_shipping} onChange={(e) => setForm({ ...form, is_default_shipping: e.target.checked })} />
                            {t('checkout.saved.defaultShipping')}
                        </label>
                        <label className="flex items-center gap-2 text-xs">
                            <input type="checkbox" checked={form.is_default_billing} onChange={(e) => setForm({ ...form, is_default_billing: e.target.checked })} />
                            {t('checkout.saved.defaultBilling')}
                        </label>
                    </div>

                    <div className="pt-4 border-t flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-primary-navy text-white rounded-lg text-sm font-semibold hover:bg-secondary-blue transition-colors disabled:opacity-50"
                        >
                            {saving ? '...' : t('checkout.saved.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddressFormModal

