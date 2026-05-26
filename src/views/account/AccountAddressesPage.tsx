import React, { useEffect, useMemo, useState } from 'react'
import { createAddress, deleteAddress, listAddresses, setDefaultAddress, updateAddress, UserAddress } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { useI18n } from '@/i18n/I18nProvider'
import { MapPin, Plus, Trash2, Edit2, CheckCircle, Truck, CreditCard, Loader2 } from 'lucide-react'

import { useAuth } from '../../hooks/useAuth'

interface FormState {
  id?: string
  label?: string | null
  full_name?: string | null
  phone?: string | null
  address_line: string
  city: string
  district: string
  postal_code?: string | null
  country?: string
  is_default_shipping?: boolean | null
  is_default_billing?: boolean | null
}

const emptyForm: FormState = {
  label: '',
  full_name: '',
  phone: '',
  address_line: '',
  city: '',
  district: '',
  postal_code: '',
  country: 'TR',
  is_default_shipping: false,
  is_default_billing: false,
}

export default function AccountAddressesPage() {
  const { t } = useI18n()
  const { user } = useAuth()
  const [items, setItems] = useState<UserAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>({ ...emptyForm })

  const refresh = React.useCallback(async () => {
    try {
      setLoading(true)
      const data = await listAddresses()
      setItems(data)
    } catch (e) {
      console.error(e)
      toast.error(t('account.addresses.toasts.loadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { refresh() }, [refresh])

  const isEditing = useMemo(() => !!form.id, [form.id])

  function startEdit(a: UserAddress) {
    setForm({
      id: a.id,
      label: a.label || '',
      full_name: a.full_name || '',
      phone: a.phone || '',
      address_line: a.address_line || '',
      city: a.city || '',
      district: a.district || '',
      postal_code: a.postal_code || '',
      country: a.country || 'TR',
      is_default_shipping: a.is_default_shipping ?? false,
      is_default_billing: a.is_default_billing ?? false,
    })
    // Scroll to form on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setForm({ ...emptyForm })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.address_line || !form.city || !form.district) {
      toast.error(t('account.addresses.toasts.requiredFields'))
      return
    }

    try {
      if (!user) throw new Error('Not authenticated')
      setSaving(true)
      if (isEditing && form.id) {
        await updateAddress(form.id, {
          label: form.label,
          full_name: form.full_name,
          phone: form.phone,
          address_line: form.address_line,
          street_address: form.address_line, // Map both
          city: form.city,
          district: form.district,
          postal_code: form.postal_code,
          country: form.country,
          is_default_shipping: form.is_default_shipping,
          is_default_billing: form.is_default_billing,
        })
        toast.success(t('account.addresses.toasts.updated'))
      } else {
        await createAddress({
          user_id: user.id,
          address_type: form.is_default_shipping ? 'shipping' : 'billing',
          label: form.label,
          full_name: form.full_name,
          phone: form.phone,
          address_line: form.address_line,
          street_address: form.address_line, // Map both
          city: form.city,
          district: form.district,
          postal_code: form.postal_code,
          country: form.country,
          is_default_shipping: form.is_default_shipping || false,
          is_default_billing: form.is_default_billing || false,
        })
        toast.success(t('account.addresses.toasts.created'))
      }
      resetForm()
      await refresh()
    } catch (e) {
      console.error(e)
      toast.error(t('account.addresses.toasts.saveError'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('account.addresses.toasts.confirmDelete') as string)) return
    try {
      await deleteAddress(id)
      toast.success(t('account.addresses.toasts.deleted'))
      await refresh()
      if (form.id === id) resetForm()
    } catch (e) {
      console.error(e)
      toast.error(t('account.addresses.toasts.deleteError'))
    }
  }

  async function makeDefault(id: string, kind: 'shipping' | 'billing') {
    try {
      await setDefaultAddress(kind, id)
      toast.success(kind === 'shipping' ? (t('account.addresses.toasts.defaultSetShipping')) : (t('account.addresses.toasts.defaultSetBilling')))
      await refresh()
    } catch (e) {
      console.error(e)
      toast.error(t('account.addresses.toasts.updateError'))
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">

      {/* Address Form (Sidebar layout on Desktop) */}
      <section className="w-full lg:w-380px shrink-0 order-first lg:order-last">
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 sm:p-8 sticky top-100px">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            {isEditing ? <Edit2 className="w-5 h-5 text-primary-navy" /> : <Plus className="w-5 h-5 text-primary-navy" />}
            {isEditing ? (t('account.addresses.formTitleEdit')) : (t('account.addresses.formTitleNew'))}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Adres Başlığı</label>
              <input value={form.label || ''} onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Ev, İş, Depo vb." className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1 lg:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Ad Soyad / Firma</label>
                <input value={form.full_name || ''} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Kişi veya Firma adı" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-colors" />
              </div>
              <div className="col-span-2 sm:col-span-1 lg:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Telefon</label>
                <input value={form.phone || ''} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+90 5XX XXX XX XX" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Açık Adres</label>
              <textarea value={form.address_line} onChange={(e) => setForm(f => ({ ...f, address_line: e.target.value }))} placeholder="Mahalle, sokak, bina ve daire no..." className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy min-h-100px resize-y transition-colors" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">İl</label>
                <input value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} placeholder="İl" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-colors" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">İlçe</label>
                <input value={form.district} onChange={(e) => setForm(f => ({ ...f, district: e.target.value }))} placeholder="İlçe" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-colors" required />
              </div>
            </div>

            <div className="space-y-4 pt-4 mt-2 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 rounded border border-slate-300 group-hover:border-primary-navy transition-colors bg-white">
                  <input type="checkbox" className="peer sr-only" checked={!!form.is_default_shipping} onChange={(e) => setForm(f => ({ ...f, is_default_shipping: e.target.checked }))} />
                  <div className="absolute inset-0 bg-primary-navy opacity-0 peer-checked:opacity-100 rounded transition-opacity" />
                  <CheckCircle className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-bold text-slate-600 select-none">{t('account.addresses.toggle.shippingDefault')}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 rounded border border-slate-300 group-hover:border-primary-navy transition-colors bg-white">
                  <input type="checkbox" className="peer sr-only" checked={!!form.is_default_billing} onChange={(e) => setForm(f => ({ ...f, is_default_billing: e.target.checked }))} />
                  <div className="absolute inset-0 bg-primary-navy opacity-0 peer-checked:opacity-100 rounded transition-opacity" />
                  <CheckCircle className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-bold text-slate-600 select-none">{t('account.addresses.toggle.billingDefault')}</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-slate-100">
              {isEditing && (
                <button type="button" onClick={resetForm} className="w-full sm:w-auto h-10 px-5 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200">
                  {t('account.addresses.cancel')}
                </button>
              )}
              <button disabled={saving} className="w-full h-10 bg-primary-navy hover:bg-industrial-gray text-white flex-1 px-4 rounded-lg font-bold shadow-sm shadow-primary-navy/20 disabled:opacity-60 disabled:cursor-not-allowed transition-transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-primary-navy/50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {isEditing ? (t('account.addresses.submit.update')) : (t('account.addresses.submit.add'))}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Address List Area */}
      <section className="flex-1 min-w-0">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-navy/5 flex items-center justify-center text-primary-navy">
            <MapPin size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t('account.addresses.title')}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Siparişlerinizde kolayca seçmek için adreslerinizi yönetin.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-300px">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary-navy" />
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Adresler yükleniyor...</span>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-12 text-center min-h-300px flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
              <MapPin className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Henüz Adres Eklenmemiş</h3>
            <p className="text-sm text-slate-500 max-w-sm">Sağ paneldeki formu kullanarak yeni bir teslimat veya fatura adresi ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((a) => (
              <div key={a.id} className="group bg-white border border-slate-200/60 hover:border-primary-navy/40 rounded-2xl shadow-sm hover:shadow-md relative overflow-hidden transition-shadow flex flex-col">
                <div className="h-1.5 w-full bg-gradient-to-r from-slate-200 to-slate-100 opacity-50 absolute top-0 left-0" />

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary-navy/60" />
                      {a.label || t('account.addresses.unregistered')}
                    </h3>

                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(a)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary-navy hover:bg-primary-navy/5 transition-colors focus:outline-none" title={t('admin.ui.edit')}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none" title={t('admin.ui.delete')}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 rounded-xl p-4 mb-5 flex-1 border border-slate-100">
                    {a.full_name && <div className="text-sm font-bold text-slate-900 mb-1.5">{a.full_name}</div>}
                    <div className="text-sm text-slate-600 font-medium leading-relaxed min-h-10 break-words whitespace-pre-line">
                      {a.address_line}
                    </div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-3 flex items-center gap-1.5 pt-3 border-t border-slate-200/60">
                      {a.district}, {a.city} {a.postal_code || ''}
                    </div>
                    {a.phone && <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{a.phone}</div>}
                  </div>

                  {/* Badges and Default Toggles */}
                  <div className="space-y-3 mt-auto pt-2 border-t border-slate-100">
                    {/* Shipping Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <Truck className="w-3.5 h-3.5" /> Teslimat
                      </div>
                      {a.is_default_shipping ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs uppercase tracking-wider font-bold bg-green-50 text-green-700 border border-green-200 shadow-sm">
                          <CheckCircle className="w-3 h-3" /> Varsayılan
                        </span>
                      ) : (
                        <button onClick={() => makeDefault(a.id, 'shipping')} className="text-xs font-bold text-slate-400 hover:text-primary-navy transition-colors focus:outline-none focus:underline">
                          {t('account.addresses.makeDefault')}
                        </button>
                      )}
                    </div>
                    {/* Billing Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <CreditCard className="w-3.5 h-3.5" /> Fatura
                      </div>
                      {a.is_default_billing ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs uppercase tracking-wider font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                          <CheckCircle className="w-3 h-3" /> Varsayılan
                        </span>
                      ) : (
                        <button onClick={() => makeDefault(a.id, 'billing')} className="text-xs font-bold text-slate-400 hover:text-primary-navy transition-colors focus:outline-none focus:underline">
                          {t('account.addresses.makeDefault')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}




