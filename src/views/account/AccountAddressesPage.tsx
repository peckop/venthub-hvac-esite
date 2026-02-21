import React, { useEffect, useMemo, useState } from 'react'
import { createAddress, deleteAddress, listAddresses, setDefaultAddress, updateAddress, UserAddress } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { useI18n } from '../../i18n/I18nProvider'
import { MapPin, Plus, Trash2, Edit2, CheckCircle, Truck, CreditCard, Loader2 } from 'lucide-react'

interface FormState {
  id?: string
  label?: string
  full_name?: string
  phone?: string
  full_address: string
  city: string
  district: string
  postal_code?: string
  country?: string
  is_default_shipping?: boolean
  is_default_billing?: boolean
}

const emptyForm: FormState = {
  label: '',
  full_name: '',
  phone: '',
  full_address: '',
  city: '',
  district: '',
  postal_code: '',
  country: 'TR',
  is_default_shipping: false,
  is_default_billing: false,
}

export default function AccountAddressesPage() {
  const { t } = useI18n()
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
      toast.error(t('account.addresses.toasts.loadError') || 'Adresler yüklenemedi')
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
      full_address: a.full_address,
      city: a.city,
      district: a.district,
      postal_code: a.postal_code || '',
      country: a.country || 'TR',
      is_default_shipping: a.is_default_shipping,
      is_default_billing: a.is_default_billing,
    })
    // Scroll to form on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setForm({ ...emptyForm })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_address || !form.city || !form.district) {
      toast.error(t('account.addresses.toasts.requiredFields') || 'Adres, İl ve İlçe zorunludur')
      return
    }

    try {
      setSaving(true)
      if (isEditing && form.id) {
        await updateAddress(form.id, {
          label: form.label,
          full_name: form.full_name,
          phone: form.phone,
          full_address: form.full_address,
          city: form.city,
          district: form.district,
          postal_code: form.postal_code,
          country: form.country,
          is_default_shipping: form.is_default_shipping,
          is_default_billing: form.is_default_billing,
        })
        toast.success(t('account.addresses.toasts.updated') || 'Adres güncellendi')
      } else {
        await createAddress({
          label: form.label,
          full_name: form.full_name,
          phone: form.phone,
          full_address: form.full_address,
          city: form.city,
          district: form.district,
          postal_code: form.postal_code,
          country: form.country,
          is_default_shipping: form.is_default_shipping,
          is_default_billing: form.is_default_billing,
        })
        toast.success(t('account.addresses.toasts.created') || 'Adres eklendi')
      }
      resetForm()
      await refresh()
    } catch (e) {
      console.error(e)
      toast.error(t('account.addresses.toasts.saveError') || 'Kayıt sırasında hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('account.addresses.toasts.confirmDelete') as string || 'Bu adresi silmek istediğinize emin misiniz?')) return
    try {
      await deleteAddress(id)
      toast.success(t('account.addresses.toasts.deleted') || 'Adres silindi')
      await refresh()
      if (form.id === id) resetForm()
    } catch (e) {
      console.error(e)
      toast.error(t('account.addresses.toasts.deleteError') || 'Silme işlemi başarısız')
    }
  }

  async function makeDefault(id: string, kind: 'shipping' | 'billing') {
    try {
      await setDefaultAddress(kind, id)
      toast.success(kind === 'shipping' ? (t('account.addresses.toasts.defaultSetShipping') || 'Varsayılan teslimat adresi yapıldı') : (t('account.addresses.toasts.defaultSetBilling') || 'Varsayılan fatura adresi yapıldı'))
      await refresh()
    } catch (e) {
      console.error(e)
      toast.error(t('account.addresses.toasts.updateError') || 'İşlem başarısız')
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">

      {/* Address Form (Sidebar layout on Desktop) */}
      <section className="w-full lg:w-[380px] shrink-0 order-first lg:order-last">
        <div className="bg-white border border-gray-100/80 rounded-2xl shadow-sm p-6 sm:p-8 sticky top-[100px]">
          <h2 className="text-lg font-bold text-industrial-gray mb-6 flex items-center gap-2">
            {isEditing ? <Edit2 className="w-5 h-5 text-primary-navy" /> : <Plus className="w-5 h-5 text-primary-navy" />}
            {isEditing ? (t('account.addresses.formTitleEdit') || 'Adresi Düzenle') : (t('account.addresses.formTitleNew') || 'Yeni Adres Ekle')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-steel-gray uppercase tracking-wider px-1">Adres Başlığı</label>
              <input value={form.label || ''} onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Ev, İş, Depo vb." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-industrial-gray focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all focus:bg-white" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2 sm:col-span-1 lg:col-span-2">
                <label className="text-xs font-bold text-steel-gray uppercase tracking-wider px-1">Ad Soyad / Firma</label>
                <input value={form.full_name || ''} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Kişi veya Firma adı" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-industrial-gray focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all focus:bg-white" />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1 lg:col-span-2">
                <label className="text-xs font-bold text-steel-gray uppercase tracking-wider px-1">Telefon</label>
                <input value={form.phone || ''} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+90 5XX XXX XX XX" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-industrial-gray focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all focus:bg-white" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-steel-gray uppercase tracking-wider px-1">Açık Adres</label>
              <textarea value={form.full_address} onChange={(e) => setForm(f => ({ ...f, full_address: e.target.value }))} placeholder="Mahalle, sokak, bina ve daire no..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-industrial-gray focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy min-h-24 resize-y transition-all focus:bg-white" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-steel-gray uppercase tracking-wider px-1">İl</label>
                <input value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} placeholder="İl" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-industrial-gray focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all focus:bg-white" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-steel-gray uppercase tracking-wider px-1">İlçe</label>
                <input value={form.district} onChange={(e) => setForm(f => ({ ...f, district: e.target.value }))} placeholder="İlçe" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-industrial-gray focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all focus:bg-white" required />
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 rounded border border-gray-300 group-hover:border-primary-navy transition-colors">
                  <input type="checkbox" className="peer sr-only" checked={!!form.is_default_shipping} onChange={(e) => setForm(f => ({ ...f, is_default_shipping: e.target.checked }))} />
                  <div className="absolute inset-0 bg-primary-navy opacity-0 peer-checked:opacity-100 rounded transition-opacity" />
                  <CheckCircle className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-medium text-industrial-gray select-none">Varsayılan Teslimat Adresi</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 rounded border border-gray-300 group-hover:border-primary-navy transition-colors">
                  <input type="checkbox" className="peer sr-only" checked={!!form.is_default_billing} onChange={(e) => setForm(f => ({ ...f, is_default_billing: e.target.checked }))} />
                  <div className="absolute inset-0 bg-primary-navy opacity-0 peer-checked:opacity-100 rounded transition-opacity" />
                  <CheckCircle className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-medium text-industrial-gray select-none">Varsayılan Fatura Adresi</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
              <button disabled={saving} className="w-full bg-primary-navy hover:bg-industrial-gray text-white flex-1 px-4 py-3 rounded-xl font-bold shadow-sm shadow-primary-navy/20 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {isEditing ? (t('account.addresses.submit.update') || 'Güncelle') : (t('account.addresses.submit.add') || 'Kaydet')}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-200 text-industrial-gray font-bold hover:bg-gray-50 transition-colors">
                  İptal
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Address List Area */}
      <section className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-industrial-gray flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary-navy" />
            {t('account.addresses.title') || 'Kayıtlı Adreslerim'}
          </h1>
          <p className="text-sm text-steel-gray mt-1">Siparişlerinizde kolayca seçmek için adreslerinizi yönetin.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <div className="flex flex-col items-center text-steel-gray gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary-navy" />
              <span className="text-sm font-medium">Adresler yükleniyor...</span>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center px-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <MapPin className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-industrial-gray mb-1">Henüz Adres Eklenmemiş</h3>
            <p className="text-sm text-steel-gray max-w-sm">Sağ paneldeki formu kullanarak yeni bir teslimat veya fatura adresi ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((a) => (
              <div key={a.id} className="group bg-white border border-gray-200 hover:border-primary-navy/30 rounded-2xl shadow-sm hover:shadow relative overflow-hidden transition-all flex flex-col">
                {/* Visual Header Indicator */}
                <div className="h-1.5 w-full bg-gradient-to-r from-gray-200 to-gray-100 opacity-50 absolute top-0 left-0" />

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="text-base font-bold text-industrial-gray flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {a.label || 'Kayıtsız Başlık'}
                    </h3>

                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(a)} className="text-gray-400 hover:text-primary-navy transition-colors" title={t('admin.ui.edit') || 'Düzenle'}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="text-gray-400 hover:text-red-600 transition-colors" title={t('admin.ui.delete') || 'Sil'}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 mb-4 flex-1">
                    {a.full_name && <div className="text-sm font-bold text-industrial-gray mb-1">{a.full_name}</div>}
                    <div className="text-sm text-steel-gray font-medium leading-relaxed min-h-[40px] break-words whitespace-pre-line">
                      {a.full_address}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                      {a.district}, {a.city} {a.postal_code || ''}
                    </div>
                    {a.phone && <div className="text-xs text-gray-500 mt-1">{a.phone}</div>}
                  </div>

                  {/* Badges and Default Toggles */}
                  <div className="space-y-2 mt-auto">
                    {/* Shipping Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                        <Truck className="w-3.5 h-3.5" /> Teslimat
                      </div>
                      {a.is_default_shipping ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle className="w-3 h-3" /> Varsayılan
                        </span>
                      ) : (
                        <button onClick={() => makeDefault(a.id, 'shipping')} className="text-xs text-primary-navy hover:underline font-medium">
                          Varsayılan Yap
                        </button>
                      )}
                    </div>
                    {/* Billing Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                        <CreditCard className="w-3.5 h-3.5" /> Fatura
                      </div>
                      {a.is_default_billing ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <CheckCircle className="w-3 h-3" /> Varsayılan
                        </span>
                      ) : (
                        <button onClick={() => makeDefault(a.id, 'billing')} className="text-xs text-primary-navy hover:underline font-medium">
                          Varsayılan Yap
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




